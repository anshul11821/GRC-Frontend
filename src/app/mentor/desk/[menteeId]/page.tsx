"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useDeskLearnings } from "@/components/app/desk-context";
import { PageSkeleton } from "@/components/ui/skeleton";
import { VerbBadge } from "@/components/mentor/verb-badge";
import { GateChip, OpenCardLink, useMenteeGates } from "@/components/mentor/mentee-gates";

/**
 * The landing view for one mentee's desk: where they are, and what of theirs is waiting.
 *
 * The tree in the rail is the navigation; this is the summary beside it. It deliberately does not
 * re-derive anything — every figure here is counted off the learner's own engagement tree, which
 * is the same object their desk renders from.
 */
export default function MenteeDeskOverview() {
  const { menteeId } = useParams<{ menteeId: string }>();
  const { learnings, loading } = useDeskLearnings();

  const summary = useMemo(() => {
    const tasks = (learnings?.orgs ?? []).flatMap((o) => o.projects.flatMap((p) => p.tasks));
    // The tree already carries per-task done/total — the learner's own progress figures. Counting
    // steps again here would be a second definition of "done" that could disagree with theirs.
    return {
      tasks,
      done: tasks.reduce((n, t) => n + t.done, 0),
      total: tasks.reduce((n, t) => n + t.total, 0),
      active: tasks.filter((t) => t.status === "in-progress" || t.status === "active"),
    };
  }, [learnings]);

  if (loading && !learnings) return <PageSkeleton cards={3} />;
  if (!learnings) {
    return (
      <div className="px-6 py-10 text-[12.5px] text-slate-500">
        Could not load this mentee&rsquo;s desk. They may no longer be assigned to you.
      </div>
    );
  }

  const pct = summary.total ? Math.round((summary.done / summary.total) * 100) : 0;

  return (
    <div className="px-6 py-6 max-w-[900px]">
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">
        {learnings.programId?.toUpperCase().replace("GRC", "GRC ") ?? "GRC 101"}
      </h1>
      <p className="text-[12.5px] text-slate-500 mt-1">
        Their engagement, exactly as they see it. Open any step to read the work; steps that carry a
        gate can be decided.
      </p>

      <div className="mt-5 rounded-[14px] border border-[#e6eaf0] bg-white px-5 py-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[12.5px] font-medium text-slate-700">Progress</span>
          <span className="text-[11.5px] text-slate-500 tabular-nums">
            {summary.done} of {summary.total} steps · {pct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Review gates first. The tree is how you browse someone's engagement; this is the reason
          you opened it. Anything awaiting a decision leads, then the rest of their gate history. */}
      <GatePanel menteeId={menteeId} />

      <h2 className="text-[13px] font-semibold text-slate-900 mt-7 mb-2.5">In progress</h2>
      {summary.active.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/50 px-5 py-8 text-center text-[12.5px] text-slate-500">
          Nothing open right now.
        </div>
      ) : (
        <div className="space-y-1.5">
          {summary.active.slice(0, 8).map((t) => {
            const open = Math.max(t.total - t.done, 0);
            return (
              <Link
                key={t.code}
                href={`/mentor/desk/${menteeId}/task/${t.code}`}
                className="flex items-center gap-3 rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3 no-underline hover:bg-[#f8fafc] transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-slate-900 truncate">{t.title}</span>
                  <span className="block text-[11px] text-slate-400 font-mono">{t.code}</span>
                </span>
                <span className="shrink-0 text-[11.5px] text-slate-500 tabular-nums">
                  {open} step{open === 1 ? "" : "s"} left
                </span>
                <Icon name="chevronRight" size={15} className="shrink-0 text-slate-300" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * This learner's review gates. Awaiting-a-decision leads because that is what a mentor came for;
 * the decided ones stay visible underneath so the reviewer can re-read their own reasoning, and
 * the not-yet-submitted ones are collapsed — there is no card behind them.
 */
function GatePanel({ menteeId }: { menteeId: string }) {
  const { gates, loading } = useMenteeGates();
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return <div className="mt-7 h-[96px] rounded-[14px] border border-[#e6eaf0] bg-white animate-pulse" />;
  }
  if (gates.length === 0) return null;

  const awaiting = gates.filter((g) => g.state === "awaiting");
  const decided = gates.filter((g) => g.state === "decided");
  const pending = gates.filter((g) => g.state === "not_submitted");
  const shown = showAll ? [...awaiting, ...decided, ...pending] : [...awaiting, ...decided];

  return (
    <section className="mt-7">
      <div className="flex items-baseline gap-2 mb-2.5">
        <h2 className="text-[13px] font-semibold text-slate-900">Review gates</h2>
        <span className="text-[11.5px] text-slate-400">
          {awaiting.length > 0 ? `${awaiting.length} awaiting you` : `${decided.length} decided`}
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/50 px-5 py-6 text-center text-[12.5px] text-slate-500">
          They have not reached a review gate yet.
        </div>
      ) : (
        <div className="space-y-1.5">
          {shown.map((g) => (
            <div
              key={g.gateId}
              className={`flex items-center gap-3 rounded-[14px] border px-4 py-3 ${
                g.state === "awaiting" ? "border-[#f0c2c2] bg-[#fdecec]/40" : "border-[#e6eaf0] bg-white"
              }`}
            >
              <VerbBadge verbId={g.verbId} />
              <Link
                href={`/mentor/desk/${menteeId}/${g.activityId}`}
                className="min-w-0 flex-1 no-underline group"
              >
                <span className="block text-[13px] font-medium text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                  {g.gateName}
                </span>
                <span className="block font-mono text-[10.5px] text-slate-400">{g.gateId}</span>
              </Link>
              <GateChip gate={g} />
              <OpenCardLink gate={g} />
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-2.5 text-[11.5px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          {showAll
            ? "Hide gates they have not reached"
            : `Show ${pending.length} gate${pending.length === 1 ? "" : "s"} they have not reached`}
        </button>
      )}
    </section>
  );
}
