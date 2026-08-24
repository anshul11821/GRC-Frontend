"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { deskApi, type ModelAnswer } from "@/lib/desk";

/**
 * The reference answer, shown only once the learner can no longer produce it themselves — an
 * escalated gate, or attempts exhausted without a pass.
 *
 * Nobody may be left permanently stuck on a step, and in both states reading this is what lets
 * them carry on: they see how the work should have been done, confirm they have read it, and the
 * step completes. An escalated gate never reopens and there is no Programme Manager queue to
 * release it; a step with no attempts left has no passing review to derive progression from. The
 * two confirmations go to different endpoints — a mentor decision to acknowledge, or the step
 * itself to release — which is what `acknowledgeDecisionId` distinguishes.
 */
export function ModelAnswer({
  answer,
  activityId,
  onReleased,
}: {
  answer: ModelAnswer;
  activityId: string;
  /** Called after acknowledging — the step completes at that moment, so the page must refetch. */
  onReleased?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const escalated = answer.reason === "escalated";

  return (
    <div className="rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/50 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-indigo-700">
          <Icon name="book" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold tracking-tight text-indigo-900">
            How this step should have been done
          </h3>
          <p className="mt-1 text-[12.5px] text-indigo-800/80 leading-relaxed">
            {escalated
              ? "This step was escalated, so it will not reopen for another attempt. Read the reference answer below — it is the same one a mentor would work from — then confirm and carry on with the next step."
              : "You have used every attempt on this step, so it will not reopen. Read the reference answer below — it is the same one a mentor would work from — then confirm and carry on with the next step."}
          </p>

          {answer.artefact && (
            <div className="mt-4">
              <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-indigo-500">
                Expected artefact
              </div>
              <p className="text-[13px] text-slate-800 mt-0.5">{answer.artefact}</p>
            </div>
          )}

          {answer.acceptance && (
            <div className="mt-3">
              <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-indigo-500">
                What it had to show
              </div>
              <p className="text-[13px] text-slate-700 mt-0.5 leading-relaxed">{answer.acceptance}</p>
            </div>
          )}

          <div className="mt-3">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-indigo-500 mb-1">
              Worked answer
            </div>
            <pre className="rounded-xl bg-white ring-1 ring-indigo-100 p-3.5 text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap font-sans overflow-x-auto">
              {answer.worked}
            </pre>
          </div>

          {(!escalated || answer.acknowledgeDecisionId !== null) && (
            <button
              onClick={async () => {
                setBusy(true);
                try {
                  if (answer.acknowledgeDecisionId !== null) {
                    await deskApi.acknowledgeMentorFeedback(answer.acknowledgeDecisionId);
                  } else {
                    await deskApi.releaseAfterAnswer(activityId);
                  }
                  onReleased?.();
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {busy ? "Saving…" : "I've read this — continue"}
              <Icon name="arrowRight" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
