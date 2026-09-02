"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { VerbBadge } from "@/components/mentor/verb-badge";
import {
  formatRemaining,
  formatSubmitted,
  isAuthError,
  mentorApi,
  OUTCOME_LABEL,
  type DecidedRow,
  type Queue,
  type QueueRow,
} from "@/lib/mentor";

/**
 * The mentor's Dashboard — a board of everything waiting on them, in service-level order.
 *
 * The worklist lives here rather than on the Review Desk deliberately. A mentor carries roughly a
 * quarter of the learner base (four reviewers, round-robin at signup), so at a thousand users that
 * is ~250 mentees and at ten thousand ~2,500. Finding today's work by opening mentees one at a
 * time is what multiplies a reviewer's day.
 *
 * A flat list answered "what is next" and nothing else. The question a reviewer actually opens
 * with is "how bad is it, and what has to happen today" — which is a shape, not a sequence. The
 * columns are the answer: what has run past its two days, what runs out today, what can wait.
 *
 * The lanes are the service level, not a workflow. There is no "in progress" column because there
 * is no such state — a mentor either decides a gate or does not — and a lane for "started reading"
 * would be a status nothing in the system could keep true.
 */
export default function MentorDashboardPage() {
  return (
    <MentorShell>
      <DashboardBody />
    </MentorShell>
  );
}

interface Lane {
  id: string;
  title: string;
  hint: string;
  tone: string;
  rows: QueueRow[];
}

function DashboardBody() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [extra, setExtra] = useState<QueueRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [org, setOrg] = useState("");
  const [mentee, setMentee] = useState("");

  const load = useCallback(() => {
    mentorApi
      .queue()
      .then((q) => {
        setQueue(q);
        setExtra([]);
        setCursor(q.nextCursor);
        setError(null);
      })
      .catch((e) => {
        if (!isAuthError(e)) setError("Could not load your worklist.");
      });
  }, []);

  useEffect(load, [load]);

  // Paged, not infinite-scrolled: the mentor asks for the next page. An automatic fetch-on-scroll
  // over a 2,500-item worklist is a way to read a caseload by accident.
  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await mentorApi.queue(cursor);
      setExtra((rows) => [...rows, ...next.needsDecision]);
      setCursor(next.nextCursor);
    } catch (e) {
      if (!isAuthError(e)) setError("Could not load more.");
    } finally {
      setLoadingMore(false);
    }
  }

  const all = useMemo(() => [...(queue?.needsDecision ?? []), ...extra], [queue, extra]);

  // Options come from what is loaded, so the filters can only ever offer something real to pick.
  const orgs = useMemo(() => [...new Set(all.map((r) => r.orgName).filter(Boolean))].sort(), [all]);
  const mentees = useMemo(
    () => [...new Set(all.map((r) => r.menteeName).filter(Boolean))].sort(),
    [all],
  );

  const rows = useMemo(
    () =>
      all.filter(
        (r) =>
          (!role || r.reviewerRole === role) &&
          (!org || r.orgName === org) &&
          (!mentee || r.menteeName === mentee),
      ),
    [all, role, org, mentee],
  );

  const lanes: Lane[] = useMemo(() => {
    const day = 24 * 60;
    return [
      {
        id: "overdue",
        title: "Overdue",
        hint: "past the two-day service level",
        tone: "border-[#f0c2c2] bg-[#fdecec]/40",
        rows: rows.filter((r) => r.remainingMin < 0),
      },
      {
        id: "today",
        title: "Due today",
        hint: "runs out within 24 hours",
        tone: "border-[#e8c48a] bg-[#fdf1e6]/40",
        rows: rows.filter((r) => r.remainingMin >= 0 && r.remainingMin <= day),
      },
      {
        id: "later",
        title: "Later",
        hint: "more than a day left",
        tone: "border-[#e6eaf0] bg-white",
        rows: rows.filter((r) => r.remainingMin > day),
      },
    ];
  }, [rows]);

  if (!queue) {
    return (
      <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px] 3xl:max-w-[1880px] px-6 pt-7">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[260px] rounded-2xl border border-[#e6eaf0] bg-white animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = rows.length !== all.length;

  return (
    <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px] 3xl:max-w-[1880px] px-6 pt-7 pb-16">
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-[12.5px] text-slate-500 mt-1">
          Everything waiting on you, by how much time is left. Your decision is final: approving
          releases the step, returning it reopens the step and everything below it.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#f0c2c2] bg-[#fdecec] px-4 py-3">
          <span className="text-[12.5px] text-[#a31d1d] flex-1">{error}</span>
          <button
            onClick={load}
            className="h-8 px-3 rounded-lg border border-[#f0c2c2] bg-white text-[12px] font-medium text-[#a31d1d]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Counted over the whole worklist server-side, not over what is on screen — a mentor needs
          to know forty things are overdue while looking at one organisation's board. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="Awaiting you" value={queue.stats.awaitingYou} />
        <Stat label="Overdue" value={queue.stats.overdue} tone={queue.stats.overdue > 0 ? "danger" : "plain"} />
        <Stat label="Due today" value={queue.stats.dueToday} />
        <Stat label="Decided today" value={queue.stats.decidedToday} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Picker value={org} onChange={setOrg} label="All organisations" options={orgs} />
        <Picker value={mentee} onChange={setMentee} label="All mentees" options={mentees} />
        {queue.roles.length > 1 && (
          <Picker
            value={role ?? ""}
            onChange={(v) => setRole(v || null)}
            label="All roles"
            options={queue.roles.map((r) => r.name)}
          />
        )}
        {(org || mentee || role) && (
          <button
            onClick={() => {
              setOrg("");
              setMentee("");
              setRole(null);
            }}
            className="h-9 px-3 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Clear
          </button>
        )}
        {/* Filters apply to what has been loaded, and the worklist is paged. Saying which is which
            keeps "no results" from reading as "nothing to review". */}
        <span className="ml-auto text-[11.5px] text-slate-400 tabular-nums">
          {filtered ? `${rows.length} of ${all.length} loaded` : `${all.length} loaded`}
          {cursor ? ` · ${queue.stats.awaitingYou} in total` : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
        {lanes.map((lane) => (
          <LaneColumn key={lane.id} lane={lane} />
        ))}

        {/* Decided is not a lane of the queue — nothing moves into it and back out — but it is the
            other half of "how is today going", so it belongs on the board rather than below it. */}
        <section className="rounded-2xl border border-[#e6eaf0] bg-white">
          <header className="px-3.5 py-3 border-b border-[#f1f5f9]">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[12.5px] font-semibold text-slate-900">Recently decided</h2>
              <span className="text-[11px] text-slate-500 tabular-nums">{queue.decided.length}</span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5">yours, newest first</p>
          </header>
          <div className="p-2 space-y-1.5 max-h-[560px] overflow-y-auto">
            {queue.decided.length === 0 ? (
              <p className="px-2 py-6 text-center text-[11.5px] text-slate-400">Nothing decided yet.</p>
            ) : (
              queue.decided.map((d) => <DecidedCard key={d.decisionId} row={d} onChanged={load} />)
            )}
          </div>
        </section>
      </div>

      {cursor && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-4 w-full h-10 rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/60 text-[12.5px] font-medium text-slate-600 hover:bg-white transition-colors disabled:text-slate-400"
        >
          {loadingMore ? "Loading…" : `Load more — ${all.length} of ${queue.stats.awaitingYou} loaded`}
        </button>
      )}
    </div>
  );
}

function LaneColumn({ lane }: { lane: Lane }) {
  return (
    <section className={`rounded-2xl border ${lane.tone}`}>
      <header className="px-3.5 py-3 border-b border-black/[0.06]">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[12.5px] font-semibold text-slate-900">{lane.title}</h2>
          <span className="text-[11px] text-slate-500 tabular-nums">{lane.rows.length}</span>
        </div>
        <p className="text-[10.5px] text-slate-400 mt-0.5">{lane.hint}</p>
      </header>
      <div className="p-2 space-y-1.5 max-h-[560px] overflow-y-auto">
        {lane.rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-[11.5px] text-slate-400">Nothing here.</p>
        ) : (
          lane.rows.map((row) => <QueueCard key={row.submissionId} row={row} />)
        )}
      </div>
    </section>
  );
}

/** One gate awaiting a decision. */
function QueueCard({ row }: { row: QueueRow }) {
  const overdue = row.remainingMin < 0;
  return (
    <Link
      // The desk, not the card: the review happens on the mentee's own step screen, with their
      // tree beside it. A worklist row is a way into that, not a separate surface.
      href={`/mentor/desk/${row.menteeId}/${row.activityId}`}
      className="block rounded-xl border border-[#e6eaf0] bg-white px-3 py-2.5 no-underline hover:border-indigo-200 hover:shadow-[0_4px_14px_-8px_rgba(15,23,42,0.25)] transition-all"
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <VerbBadge verbId={row.verbId} />
        <span className="font-mono text-[10px] text-slate-400">{row.gateId}</span>
      </div>
      <div className="text-[12.5px] font-medium text-slate-900 leading-snug mt-1">{row.gateName}</div>
      <div className="text-[11px] text-slate-500 mt-1.5 truncate">{row.menteeName}</div>
      {row.orgName && <div className="text-[10.5px] text-slate-400 truncate">{row.orgName}</div>}
      <div className={`text-[10.5px] mt-1.5 ${overdue ? "text-[#a31d1d] font-medium" : "text-slate-400"}`}>
        {formatRemaining(row.remainingMin)} · {formatSubmitted(row.submittedAt)}
      </div>
    </Link>
  );
}

function DecidedCard({ row, onChanged }: { row: DecidedRow; onChanged: () => void }) {
  const [left, setLeft] = useState(row.undoSeconds);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function undo() {
    setBusy(true);
    try {
      await mentorApi.undo(row.decisionId);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const approved = row.outcome.startsWith("approve");
  return (
    <div className="rounded-xl border border-[#e6eaf0] bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center h-[17px] px-1.5 rounded text-[9.5px] font-semibold ${
            approved ? "bg-[#e8f5ee] text-[#1e7a46]" : "bg-[#fdecec] text-[#a31d1d]"
          }`}
        >
          {OUTCOME_LABEL[row.outcome]}
        </span>
        <span className="font-mono text-[10px] text-slate-400">{row.gateId}</span>
      </div>
      <div className="text-[12px] text-slate-800 leading-snug mt-1">{row.gateName}</div>
      <div className="text-[11px] text-slate-500 mt-1 truncate">{row.menteeName}</div>
      {left > 0 && (
        <button
          onClick={undo}
          disabled={busy}
          className="mt-2 h-7 w-full rounded-lg border border-[#e6eaf0] text-[11.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Undo ({left}s)
        </button>
      )}
    </div>
  );
}

/** A native select — a dozen organisations does not need a combobox. */
function Picker({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
}) {
  if (options.length === 0) return null;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`h-9 pl-3 pr-8 rounded-lg border bg-white text-[12px] appearance-none cursor-pointer focus:outline-none focus:border-indigo-300 ${
          value ? "border-indigo-300 text-indigo-700 font-medium" : "border-[#e6eaf0] text-slate-600"
        }`}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon
        name="chevronDown"
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  );
}

function Stat({ label, value, tone = "plain" }: { label: string; value: number; tone?: "plain" | "danger" }) {
  return (
    <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3.5">
      <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400">{label}</div>
      <div
        className={`text-[26px] font-semibold tracking-tight mt-1 tabular-nums ${
          tone === "danger" ? "text-[#a31d1d]" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
