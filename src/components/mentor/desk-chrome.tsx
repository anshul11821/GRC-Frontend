"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { OrgContextWindow } from "@/components/mentor/org-context-window";
import { useMenteeGates } from "@/components/mentor/mentee-gates";
import { useDeskFilter, useMenteeTree, useRoster } from "@/components/mentor/desk-context";
import { reviewable } from "@/components/mentor/gate-states";

/**
 * The Review Desk's standing chrome: who your learners are.
 *
 * Mounted by a layout, not by a page, so a click on a mentee leaves it on screen and only the
 * section below reloads. Everything it needs comes from context or from the URL — it takes no
 * props — which is what lets a layout render it without knowing anything about the page beneath.
 */

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

/**
 * Every mentee assigned to this reviewer, waiting-first — and the only roster there is.
 *
 * The Review Desk used to open on a separate list page whose whole content was these same names,
 * one screen above where the strip repeats them. That page is gone and its two capabilities came
 * here, because they are the ones that matter at 250 mentees rather than at nine: the search runs
 * **server-side against the whole roster** rather than filtering what is already loaded, and the
 * list is keyset-paged. A strip that could only ever show what one fetch returned would be a strip
 * that quietly loses people.
 */
export function MenteeStrip() {
  const { menteeId } = useParams<{ menteeId?: string }>();
  const {
    rows,
    active,
    total,
    cursor,
    q,
    setQ,
    waitingOnly,
    setWaitingOnly,
    loading,
    loadingMore,
    more,
  } = useRoster();
  const scroller = useRef<HTMLDivElement>(null);

  const present = rows.some((m) => m.userId === menteeId);
  const nudge = (dx: number) => scroller.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-[#e6eaf0] bg-white px-4 py-2">
      <div className="relative hidden w-[124px] shrink-0 sm:block lg:w-[168px]">
        <Icon
          name="search"
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name or email"
          aria-label="Search your mentees"
          className="h-8 w-full rounded-md border border-[#e6eaf0] bg-slate-50 pl-7 pr-2 text-[12px] text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none"
        />
      </div>
      {/* Two states, not a filter menu: who needs you, and everyone. */}
      <div className="flex shrink-0 rounded-md border border-[#e6eaf0] p-0.5">
        {([true, false] as const).map((on) => (
          <button
            key={String(on)}
            onClick={() => setWaitingOnly(on)}
            aria-pressed={waitingOnly === on}
            className={`h-7 rounded px-2 text-[11.5px] font-semibold transition-colors ${
              waitingOnly === on
                ? "bg-indigo-600 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {on ? "Waiting" : "All"}
          </button>
        ))}
      </div>
      <button
        onClick={() => nudge(-320)}
        aria-label="Scroll mentees left"
        className="hidden h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 lg:grid"
      >
        <Icon name="chevronLeft" size={15} />
      </button>
      <div ref={scroller} className="min-w-0 flex-1 overflow-x-auto">
        <div className="flex items-center gap-1">
          {/* The mentee being reviewed is always on the strip, even when the current filter or
              search excludes them — a reviewer opening a specific delivery should not find the
              strip disowning the person whose work is on screen. */}
          {menteeId && !present && active?.id === menteeId && (
            <MenteeChip key="current" userId={menteeId} name={active.name} awaiting={0} active />
          )}
          {rows.map((m) => (
            <MenteeChip
              key={m.userId}
              userId={m.userId}
              name={m.name}
              awaiting={m.awaitingYou}
              active={m.userId === menteeId}
            />
          ))}
          {loading && rows.length === 0 && (
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-9 w-[128px] shrink-0 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </span>
          )}
          {!loading && rows.length === 0 && (
            <span className="px-3 py-2 text-[12px] text-slate-400">
              {q
                ? `No mentee matches "${q}".`
                : waitingOnly
                  ? "Nobody is waiting on you."
                  : "No learners are assigned to you yet."}
            </span>
          )}
          {cursor && (
            <button
              onClick={more}
              disabled={loadingMore}
              className="ml-1 shrink-0 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold text-indigo-600 hover:bg-indigo-50 disabled:text-slate-400"
            >
              {loadingMore ? "Loading…" : `More (${rows.length} of ${total})`}
            </button>
          )}
        </div>
      </div>
      <button
        onClick={() => nudge(320)}
        aria-label="Scroll mentees right"
        className="hidden h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 lg:grid"
      >
        <Icon name="chevronRight" size={15} />
      </button>
    </div>
  );
}

function MenteeChip({
  userId,
  name,
  awaiting,
  active,
}: {
  userId: string;
  name: string;
  awaiting: number;
  active: boolean;
}) {
  return (
    <Link
      href={`/mentor/desk/${userId}`}
      title={`${name}${awaiting ? ` · ${awaiting} awaiting you` : ""}`}
      className={`flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 no-underline transition-colors ${
        active ? "bg-indigo-50 ring-1 ring-indigo-200" : "hover:bg-slate-50"
      }`}
    >
      <span className="relative shrink-0">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[10px] font-semibold text-white">
          {initialsOf(name)}
        </span>
        {awaiting > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#b4741a] px-1 text-[9px] font-bold tabular-nums text-white ring-2 ring-white">
            {awaiting}
          </span>
        )}
      </span>
      <span
        className={`max-w-[128px] truncate text-[12px] ${
          active ? "font-semibold text-indigo-800" : "font-medium text-slate-700"
        }`}
      >
        {name}
      </span>
    </Link>
  );
}

/**
 * Tells the roster which learner is open. Rendered by the mentee layout, inside the gates provider
 * — the only place that knows both the id and the name — and draws nothing itself.
 */
export function PublishActiveMentee() {
  const { menteeId } = useParams<{ menteeId: string }>();
  const { menteeName } = useMenteeGates();
  const { setActive } = useRoster();

  useEffect(() => {
    if (menteeName) setActive({ id: menteeId, name: menteeName });
  }, [menteeId, menteeName, setActive]);

  return null;
}

/**
 * The learner's organisations, as a band across the desk.
 *
 * A filter, not a jump. It used to navigate to some step of whichever organisation was clicked,
 * which meant choosing an organisation threw away the step you were reading — and since it
 * highlighted the *open step's* organisation, it highlighted nothing at all until you had opened
 * something. Now it narrows the step row beneath and leaves the review alone.
 */
export function OrgStrip() {
  // Which organisation's briefing is open over the work, if any.
  const [context, setContext] = useState<{ id: string; name: string } | null>(null);
  const { gates } = useMenteeGates();
  const { orgOf } = useMenteeTree();
  const { orgId, setOrgId } = useDeskFilter();

  const orgs = new Map<string, { name: string; initials: string; total: number; awaiting: number }>();
  for (const g of gates.filter(reviewable)) {
    const o = orgOf.get(g.taskCode);
    if (!o) continue;
    const row = orgs.get(o.id) ?? { name: o.name, initials: o.initials, total: 0, awaiting: 0 };
    row.total += 1;
    if (g.state === "awaiting") row.awaiting += 1;
    orgs.set(o.id, row);
  }
  if (orgs.size < 2) return null; // one organisation is not a choice

  const chip = (on: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 ring-1 transition-colors ${
      on ? "bg-white ring-indigo-300" : "bg-white/60 ring-slate-200 hover:bg-white"
    }`;
  // The same outline, but as a wrapper: the briefing control cannot nest inside the filter chip,
  // because a button inside a button is invalid and the click would belong to whichever won.
  // Selected reads as raised — white on the band's grey, a firmer edge and a small lift. The two
  // used to differ only in ring colour, which is a 1px cue for the thing the whole strip is about.
  const shell = (on: boolean) =>
    `group flex shrink-0 items-stretch overflow-hidden rounded-lg border transition-all ${
      on
        ? "border-indigo-300 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.10)]"
        : "border-transparent bg-white/50 hover:border-slate-200 hover:bg-white"
    }`;

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-[#e6eaf0] bg-slate-50 px-4 py-2">
      <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-slate-400">
        Organisations
      </span>
      <button onClick={() => setOrgId("all")} className={chip(orgId === "all")}>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-[11px] font-bold text-white ${
            orgId === "all" ? "bg-indigo-600" : "bg-slate-400"
          }`}
        >
          {orgs.size}
        </span>
        <span className="text-left leading-tight">
          <span
            className={`block text-[12.5px] font-semibold ${orgId === "all" ? "text-slate-900" : "text-slate-600"}`}
          >
            All
          </span>
          <span className="block text-[10.5px] tabular-nums text-slate-400">every organisation</span>
        </span>
      </button>
      {[...orgs.entries()].map(([id, o]) => {
        const on = id === orgId;
        return (
          <span key={id} className={shell(on)}>
          <button
            onClick={() => setOrgId(id)}
            title={`Show only ${o.name}`}
            className="flex items-center gap-2 py-1.5 pl-1.5 pr-2"
          >
            {/* Initials, not a logo: these are fictional organisations and a reviewer identifies
                them by the code that also prefixes every task on the step row. */}
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-[10.5px] font-bold tracking-tight transition-colors ${
                on ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
              }`}
            >
              {o.initials}
            </span>
            <span className="text-left leading-tight">
              <span
                className={`block text-[12.5px] font-semibold ${on ? "text-slate-900" : "text-slate-600"}`}
              >
                {o.name}
              </span>
              {/* What is waiting leads, because that is the reason to click. The total follows it
                  as context rather than the other way round. */}
              <span className="mt-px flex items-center gap-1.5 text-[10.5px] tabular-nums">
                {o.awaiting > 0 ? (
                  <>
                    <span className="inline-flex h-[15px] items-center rounded bg-[#fdf4e3] px-1 font-semibold text-[#8a5a14]">
                      {o.awaiting} waiting
                    </span>
                    <span className="text-slate-400">of {o.total}</span>
                  </>
                ) : (
                  <span className="text-slate-400">
                    {o.total} step{o.total === 1 ? "" : "s"} · all decided
                  </span>
                )}
              </span>
            </span>
          </button>
          {/* The organisation the work was written against, one click from the work itself —
              rather than on a dashboard the reviewer would have to leave the deliverable to read. */}
          <button
            onClick={() => setContext({ id, name: o.name })}
            aria-label={`About ${o.name}`}
            title={`About ${o.name} — context, standards, regulators`}
            // Ochre at rest, not on hover: this is the one control on the strip that opens the
            // organisation's own file, and ochre is what that material wears everywhere else in
            // the product. Slate-300 on white read as a disabled glyph — a reviewer has to be
            // able to see that the briefing is one click away without hunting for it.
            className="grid w-8 shrink-0 place-items-center border-l border-[#e2c49a]/70 bg-[#fbf0e1] text-[#9a5216] transition-colors hover:bg-[#f3e0bf] hover:text-[#7a400f]"
          >
            <Icon name="info" size={14} />
          </button>
          </span>
        );
      })}
      {context && (
        <OrgContextWindow
          orgId={context.id}
          orgName={context.name}
          onClose={() => setContext(null)}
        />
      )}
    </div>
  );
}
