"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useDeskLearnings } from "@/components/app/desk-context";
import { VerbBadge } from "@/components/mentor/verb-badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { isGateVerb } from "@/lib/verbs";
import { GateChip, OpenCardLink, useMenteeGates } from "@/components/mentor/mentee-gates";

/** One task of a mentee's engagement — its steps in order, with the two gate steps marked.
 *  Read from the learner's own tree, so the order and the statuses are theirs. */
export default function MenteeTaskPage() {
  const { menteeId, taskCode } = useParams<{ menteeId: string; taskCode: string }>();
  const { learnings, loading } = useDeskLearnings();
  const { byActivity } = useMenteeGates();

  const task = useMemo(
    () =>
      (learnings?.orgs ?? [])
        .flatMap((o) => o.projects.flatMap((p) => p.tasks))
        .find((t) => t.code === taskCode),
    [learnings, taskCode],
  );

  if (loading && !learnings) return <PageSkeleton cards={3} />;
  if (!task) {
    return <div className="px-6 py-10 text-[12.5px] text-slate-500">Task not found on this desk.</div>;
  }

  return (
    <div className="px-6 py-6 max-w-[900px]">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-mono text-[11.5px] text-slate-500">{task.code}</span>
        <span className="text-[11px] text-slate-400">{task.standards}</span>
      </div>
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900 mt-1">{task.title}</h1>
      <p className="text-[12.5px] text-slate-500 mt-1 tabular-nums">
        {task.done} of {task.total} steps complete
      </p>

      <ol className="mt-5 space-y-1.5">
        {task.steps.map((s) => {
          // A gate is a gate because the register says so, not because the verb looks like one:
          // `isGateVerb` covers the two task-boundary workspaces, while a *review* gate is any
          // step the register names. Falling back to the verb keeps the tint right on a step whose
          // gate this mentor's roles do not cover.
          const gate = byActivity.get(s.id);
          const isGate = !!gate || isGateVerb(s.verb);
          const done = s.status === "complete";
          return (
            <li key={s.id}>
              <div
                className={`flex items-center gap-3 rounded-[14px] border px-4 py-3 transition-colors ${
                  gate?.state === "awaiting"
                    ? "border-[#f0c2c2] bg-[#fdecec]/40"
                    : isGate
                      ? "border-violet-200 bg-violet-50/40"
                      : "border-[#e6eaf0] bg-white"
                }`}
              >
                <span
                  className={`shrink-0 w-6 h-6 rounded-full grid place-items-center font-mono text-[10px] ${
                    done ? "bg-[#e8f5ee] text-[#1e7a46]" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {s.code}
                </span>
                <VerbBadge verbId={s.verb} />
                <Link
                  href={`/mentor/desk/${menteeId}/${s.id}`}
                  className="min-w-0 flex-1 no-underline group"
                >
                  <span className="block text-[13px] text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                    {s.title}
                  </span>
                  {isGate && !gate && (
                    <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-violet-700">
                      Gate
                    </span>
                  )}
                </Link>
                {/* The whole point: a gate row carries its state and opens its own card, instead
                    of sending the reviewer back to the worklist to find the row they are looking at. */}
                {gate ? (
                  <>
                    <GateChip gate={gate} />
                    <OpenCardLink gate={gate} />
                  </>
                ) : (
                  <span className="shrink-0 text-[11px] text-slate-400 w-[76px] text-right">
                    {s.status ?? "pending"}
                  </span>
                )}
                <Icon name="chevronRight" size={15} className="shrink-0 text-slate-300" />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
