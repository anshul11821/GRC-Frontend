"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  isAuthError,
  mentorApi,
  type Card,
  type MenteeDesk,
  type MenteeRow,
  type MentorAnalytics,
  type OrgDetail,
} from "@/lib/mentor";
import type { GateState } from "@/components/mentor/gate-states";
import type { LearningOrg, LearningTask, Learnings } from "@/lib/learnings";

/**
 * The two things on the Review Desk that outlive a click: who this mentor's learners are, and one
 * learner's engagement tree.
 *
 * They are providers rather than state inside the review surface because of where they are mounted
 * — `desk/layout.tsx` and `desk/[menteeId]/layout.tsx`. Navigation inside a layout's subtree does
 * not tear it down, so the roster survives moving between mentees and the tree survives moving
 * between that mentee's steps. Held in the page instead, as they were, every one of those clicks
 * refetched both and blanked the strips built on them.
 */

// ------------------------------------------------------------------ per-mentee cache

/**
 * What has already been loaded for each learner, kept for the life of the tab.
 *
 * Opening a desk costs two requests that cannot be made faster — the gate map and the engagement
 * tree — and a reviewer works a caseload by moving between the same few people, so without this
 * every trip back paid for both again. Outside React on purpose: the providers are remounted by
 * the router when the learner in the URL changes, and state inside them does not survive that.
 *
 * `inflight` is what makes prefetching safe. Hovering a name and then clicking it must not fire
 * two requests, so a load already in progress is handed to the second caller rather than started
 * again.
 *
 * Staleness is bounded by who can cause it. A learner's gate map changes when they submit or when
 * a decision is recorded, and the decisions here are the ones this reviewer just made — so
 * `refresh()` after deciding drops that learner's entry. Somebody else's submission arriving
 * mid-session will not appear until the desk is reopened, which is the same as it ever was.
 */
const gatesCache = new Map<string, MenteeDesk>();
const gatesInflight = new Map<string, Promise<MenteeDesk>>();
const treeCache = new Map<string, Learnings>();
const treeInflight = new Map<string, Promise<Learnings>>();

function cached<K, T>(
  key: K,
  store: Map<K, T>,
  inflight: Map<K, Promise<T>>,
  fetch: () => Promise<T>,
): Promise<T> {
  const hit = store.get(key);
  if (hit) return Promise.resolve(hit);
  const running = inflight.get(key);
  if (running) return running;
  const p = fetch()
    .then((v) => {
      store.set(key, v);
      return v;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

// The dashboard's figures and one organisation's briefing. Both are read far more often than they
// change — a reviewer moves between the dashboard, a desk and back — and both cost round trips that
// are entirely network. Same shape as the desk caches: kept for the life of the tab, and the
// in-flight map means a prefetch and a real read share one request rather than racing.
const analyticsCache = new Map<"me", MentorAnalytics>();
const analyticsInflight = new Map<"me", Promise<MentorAnalytics>>();
const orgCache = new Map<string, OrgDetail>();
const orgInflight = new Map<string, Promise<OrgDetail>>();

const cardCache = new Map<number, Card>();
const cardInflight = new Map<number, Promise<Card>>();

const loadGates = (id: string) =>
  cached(id, gatesCache, gatesInflight, () => mentorApi.menteeGates(id));
/**
 * One submission's review card — the heaviest of the three requests, and the one a reviewer
 * re-opens most, because walking a task means passing back through steps already read.
 *
 * Cached by submission id, which is immutable: a resubmission is a *new* submission with a new id,
 * so it can never be served from an old one's entry.
 */
const loadCard = (id: number) =>
  cached(id, cardCache, cardInflight, () => mentorApi.card(id));
const peekCard = (id: number) => cardCache.get(id);

const loadAnalytics = () =>
  cached("me" as const, analyticsCache, analyticsInflight, () => mentorApi.analytics());
const peekAnalytics = () => analyticsCache.get("me");
const loadOrg = (id: string) => cached(id, orgCache, orgInflight, () => mentorApi.org(id));
const peekOrg = (id: string) => orgCache.get(id);

/**
 * Forget the dashboard's figures.
 *
 * Deciding a gate changes almost every number on it — what is awaiting, what is in rework, the
 * weekly bars — so the cache has to go when a decision is recorded, or a reviewer would approve
 * something and watch the dashboard insist nothing had happened.
 */
export function forgetAnalytics(): void {
  analyticsCache.clear();
}
const loadTree = (id: string) =>
  cached(id, treeCache, treeInflight, () => mentorApi.menteeLearnings(id));
const peekTree = (id: string) => treeCache.get(id);
const peekGates = (id: string) => gatesCache.get(id);

/**
 * How many of the waiting worklist to warm when the console opens.
 *
 * Three, not the caseload. A mentor carries ~250 learners at 1,000 users and ~2,500 at 10,000, and
 * each desk is three requests — so "warm my mentees" taken literally is 750 requests fired at a
 * backend whose connection pool is 5 (`app/db/session.py`, capped because the Supabase session
 * pooler allows 15 for the whole project). Three covers the top of an SLA-ordered worklist, which
 * is where a reviewer actually starts, and costs nine requests spread over a few seconds.
 */
const WARM_AHEAD = 3;

/** Only one warm loop may run, whatever mounts it. */
let warming = false;

/** Everything one desk needs, in the order the desk itself needs it. */
async function warmMentee(menteeId: string): Promise<void> {
  if (gatesCache.has(menteeId) && treeCache.has(menteeId)) return;
  await Promise.allSettled([
    loadTree(menteeId),
    // The card is the heaviest of the three and cannot be asked for until the gates name the
    // submission — so chain it, using the same rule the mentee route uses to choose where to land.
    // Without this the warm-up would load everything except the thing that ends up on screen.
    loadGates(menteeId).then((desk) => {
      const target = desk.gates.find((g) => g.state === "awaiting") ?? desk.gates[0];
      return target?.submissionId ? loadCard(target.submissionId) : undefined;
    }),
  ]);
}

/**
 * Load the top of the worklist in the background, once, shortly after the console opens.
 *
 * This replaced prefetching on hover. Hover was effective but it guessed from cursor movement,
 * which is not intent — sweeping across the strip to reach the search box fired requests for
 * everyone the pointer crossed. Warming at sign-in is bounded and predictable instead: a known
 * number of learners, chosen by the same ordering the Dashboard already puts them in.
 *
 * Two rules keep it out of the way of the reviewer:
 *
 *  - **One desk at a time.** `warmMentee` is awaited before the next begins, so the ceiling is
 *    that desk's own two parallel requests — the tree and the gates, with the card chained behind
 *    the gates. Two of the backend's five connections, never more, whatever the caseload size.
 *    Measured: three desks warm as nine requests, peak concurrency two.
 *  - **After a pause.** The console has its own requests to make when it opens; warming starts
 *    once those are done rather than racing them.
 *
 * A navigation that lands on a learner mid-warm costs nothing: `cached()` hands the caller the
 * request already in flight rather than starting a second one.
 */
export function useWarmCaseload(limit: number = WARM_AHEAD): void {
  const { rows, loading } = useRoster();

  // Keyed on the ids, not the array. The roster object is replaced on every search keystroke, and
  // restarting the warm-up each time is exactly the churn this exists to avoid.
  const ids = useMemo(
    () => (loading ? "" : rows.slice(0, limit).map((m) => m.userId).join(",")),
    [rows, loading, limit],
  );

  useEffect(() => {
    if (!ids) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      // Module-level, not per-effect: React mounts effects twice in development, and two warm
      // loops interleaving turned "one desk at a time" into three requests in flight. The bound
      // has to hold however many times this mounts, so it is enforced outside React.
      if (warming) return;
      warming = true;
      try {
        for (const id of ids.split(",")) {
          if (cancelled) return;
          await warmMentee(id).catch(() => {});
        }
      } finally {
        warming = false;
      }
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ids]);
}

/**
 * Mark one gate as started, in the cached copy of that learner's desk.
 *
 * The server has been told; this keeps the browser's copy honest without spending a round trip to
 * re-read seventy gates for one boolean. Without it, opening a step and going back would show it
 * still sitting under Submitted until something else happened to invalidate the cache.
 */
export function noteGateStarted(menteeId: string, submissionId: number): void {
  const desk = gatesCache.get(menteeId);
  if (!desk) return;
  gatesCache.set(menteeId, {
    ...desk,
    gates: desk.gates.map((g) => (g.submissionId === submissionId ? { ...g, started: true } : g)),
  });
}

/**
 * Forget what we know about a learner — used after recording a decision on their work.
 *
 * Every card goes too, not just theirs. A card carries `decidedBy` and the comments released with
 * the decision, so a stale one would show work the reviewer has just decided as still open; and
 * mapping learner to submissions client-side, only to be clever about which entries to drop, is
 * more machinery than a decision — which happens once per step, against dozens of navigations —
 * is worth. Clearing them all is one line and cannot be wrong.
 */
export function forgetMentee(menteeId: string): void {
  gatesCache.delete(menteeId);
  treeCache.delete(menteeId);
  cardCache.clear();
}

export { loadGates, peekGates, loadCard, peekCard, loadAnalytics, peekAnalytics, loadOrg, peekOrg };

// ------------------------------------------------------------------ focus

// ------------------------------------------------------------------ what the desk is showing

interface DeskFilter {
  /** An organisation id, or "all". */
  orgId: string;
  setOrgId: (v: string) => void;
  /** The state tab, or null to let the desk choose the first one with work in it. */
  tab: GateState | null;
  setTab: (v: GateState) => void;
  /** Whether the picking bands are open. Meaningless — always true — with no step chosen. */
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}

const FilterContext = createContext<DeskFilter>({
  orgId: "all",
  setOrgId: () => {},
  tab: null,
  setTab: () => {},
  expanded: true,
  setExpanded: () => {},
});

/**
 * Which slice of a learner's work the desk is showing: one organisation, one review state.
 *
 * Shared rather than local because the two controls sit in different bands — the organisation
 * chips are chrome above the review, the state tabs are in the bar beside the verdicts — and both
 * choose what the step row underneath lists. Held here, switching learner keeps the reviewer's
 * place: they are almost always looking for the same state on the next person.
 */
export function DeskFilterProvider({
  menteeId,
  children,
}: {
  menteeId?: string;
  children: React.ReactNode;
}) {
  const [orgId, setOrgId] = useState("all");
  const [tab, setTab] = useState<GateState | null>(null);
  const [expanded, setExpanded] = useState(true);

  // Choosing a step deliberately does NOT collapse the bands. It did, and clicking a step then
  // felt like leaving for another page — four bands vanishing at once is indistinguishable from a
  // navigation, which is the one thing this desk is built not to do. They come away on scroll
  // instead: the reviewer moves into the work and the pickers follow, which reads as one page
  // making room rather than a new one arriving.
  // The state tab survives a change of learner — a reviewer working through "Submitted" wants the
  // same tab on the next person. The organisation cannot: ids are per learner, so carrying one
  // across would filter the next mentee's steps down to nothing and look like an empty desk.
  const [prevMentee, setPrevMentee] = useState(menteeId);
  if (prevMentee !== menteeId) {
    setPrevMentee(menteeId);
    setOrgId("all");
  }

  const value = useMemo<DeskFilter>(
    () => ({ orgId, setOrgId, tab, setTab, expanded, setExpanded }),
    [orgId, tab, expanded],
  );
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export const useDeskFilter = () => useContext(FilterContext);

// ------------------------------------------------------------------ roster

interface RosterValue {
  rows: MenteeRow[];
  /**
   * The learner currently open, published by the mentee layout.
   *
   * The strip is mounted above the gates provider — it has to be, so it survives switching
   * learner — which means it cannot read the open learner's name itself. Without this, a reviewer
   * opening a delivery for somebody the current filter or search excludes would find the strip
   * disowning the person whose work is on screen.
   */
  active: { id: string; name: string } | null;
  setActive: (v: { id: string; name: string } | null) => void;
  total: number;
  /** Null when the last page is loaded. */
  cursor: string | null;
  q: string;
  setQ: (v: string) => void;
  waitingOnly: boolean;
  setWaitingOnly: (v: boolean) => void;
  loading: boolean;
  loadingMore: boolean;
  more: () => void;
}

const RosterContext = createContext<RosterValue>({
  rows: [],
  active: null,
  setActive: () => {},
  total: 0,
  cursor: null,
  q: "",
  setQ: () => {},
  waitingOnly: true,
  setWaitingOnly: () => {},
  loading: true,
  loadingMore: false,
  more: () => {},
});

export function RosterProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = useState<MenteeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [q, setQ] = useState("");
  // Opens on who needs a decision, because that is who a reviewer came here for.
  const [waitingOnly, setWaitingOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [active, setActive] = useState<{ id: string; name: string } | null>(null);

  // Debounced: the search is a round trip, and one per keystroke over a roster of thousands is a
  // query storm for a box somebody is still typing in. Server-side, so it searches the whole
  // roster rather than filtering the page already loaded.
  useEffect(() => {
    let live = true;
    const t = setTimeout(
      () => {
        mentorApi
          .mentees({ q, waitingOnly })
          .then((r) => {
            if (!live) return;
            setRows(r.mentees);
            setTotal(r.total);
            setCursor(r.nextCursor);
          })
          .catch((e) => {
            if (!isAuthError(e)) console.error(e);
          })
          .finally(() => {
            if (live) setLoading(false);
          });
      },
      q ? 300 : 0,
    );
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q, waitingOnly]);

  const more = useCallback(() => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    mentorApi
      .mentees({ q, waitingOnly, cursor })
      .then((page) => {
        setRows((prev) => [...prev, ...page.mentees]);
        setCursor(page.nextCursor);
      })
      .catch((e) => {
        if (!isAuthError(e)) console.error(e);
      })
      .finally(() => setLoadingMore(false));
  }, [cursor, loadingMore, q, waitingOnly]);

  const value = useMemo<RosterValue>(
    () => ({
      rows,
      active,
      setActive,
      total,
      cursor,
      q,
      setQ,
      waitingOnly,
      setWaitingOnly,
      loading,
      loadingMore,
      more,
    }),
    [rows, active, total, cursor, q, waitingOnly, loading, loadingMore, more],
  );

  return <RosterContext.Provider value={value}>{children}</RosterContext.Provider>;
}

export const useRoster = () => useContext(RosterContext);

// ------------------------------------------------------------------ one learner's tree

interface TreeValue {
  orgs: LearningOrg[];
  /** Which organisation a task belongs to — per learner, so it can only come from their own tree. */
  orgOf: Map<string, LearningOrg>;
  taskOf: Map<string, LearningTask>;
  loading: boolean;
}

const TreeContext = createContext<TreeValue>({
  orgs: [],
  orgOf: new Map(),
  taskOf: new Map(),
  loading: true,
});

export function MenteeTreeProvider({
  menteeId,
  children,
}: {
  menteeId: string;
  children: React.ReactNode;
}) {
  // Seeded from the cache, so a learner already visited paints with no loading state at all.
  const [tree, setTree] = useState<Learnings | null>(() => peekTree(menteeId) ?? null);
  const [loading, setLoading] = useState(() => peekTree(menteeId) === undefined);

  // Reset during render when the learner changes, not inside the effect: an effect-time reset
  // paints one learner's organisations under another's name for a frame, which is the single worst
  // thing this screen can show.
  const [prev, setPrev] = useState(menteeId);
  if (prev !== menteeId) {
    setPrev(menteeId);
    const known = peekTree(menteeId);
    setTree(known ?? null);
    setLoading(known === undefined);
  }

  useEffect(() => {
    let live = true;
    loadTree(menteeId)
      .then((t) => live && setTree(t))
      .catch((e) => {
        if (!isAuthError(e)) console.error(e);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [menteeId]);

  const value = useMemo<TreeValue>(() => {
    const orgOf = new Map<string, LearningOrg>();
    const taskOf = new Map<string, LearningTask>();
    for (const o of tree?.orgs ?? [])
      for (const p of o.projects)
        for (const t of p.tasks) {
          orgOf.set(t.code, o);
          taskOf.set(t.code, t);
        }
    return { orgs: tree?.orgs ?? [], orgOf, taskOf, loading };
  }, [tree, loading]);

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
}

export const useMenteeTree = () => useContext(TreeContext);
