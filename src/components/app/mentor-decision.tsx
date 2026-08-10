"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { deskApi, type MentorReview } from "@/lib/desk";

/**
 * The mentor's decision at a review gate, shown to the learner (HITL programme §4.5): the
 * outcome, the reasons selected, and for a disapproval the corrective action verbatim.
 *
 * This is the decision that actually released or reopened the step, so the copy says what it did.
 * `advisory` flips it back to a "does not affect your result" note if shadow mode is ever
 * restored, rather than leaving the two out of step.
 */
export function MentorDecision({
  review,
  onAcknowledged,
}: {
  review: MentorReview;
  /** Called after acknowledging so the page can refetch — the step completes at that moment. */
  onAcknowledged?: () => void;
}) {
  const [acking, setAcking] = useState(false);
  const approved = review.outcome === "approve" || review.outcome === "approve_note";
  const escalated = review.outcome === "disapprove_escalate";
  const tone = approved
    ? { ring: "ring-emerald-200", bg: "bg-emerald-50/60", text: "text-emerald-800", icon: "checkCircle" as const }
    : { ring: "ring-rose-200", bg: "bg-rose-50/60", text: "text-rose-800", icon: "flag" as const };

  return (
    <div className={`rounded-2xl ring-1 ${tone.ring} ${tone.bg} p-5`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${tone.text}`}>
          <Icon name={tone.icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-[15px] font-semibold tracking-tight ${tone.text}`}>
              {review.needsAcknowledgement
                ? "Your mentor approved this — with something to read"
                : approved
                  ? "Your mentor approved this step"
                  : escalated
                    ? "Your mentor escalated this step"
                    : "Your mentor returned this step"}
            </h3>
            <span className="text-[11.5px] text-slate-500">{review.gateName}</span>
          </div>
          <p className="mt-0.5 text-[12px] text-slate-500 tracking-tight">
            {review.reviewerName} · {review.reviewerRole} ·{" "}
            {new Date(review.decidedAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            })}
          </p>

          <ul className="mt-3 space-y-2">
            {review.reasons.map((r) => (
              <li key={r.text}>
                <div className="flex gap-2 text-[13px] text-slate-700 leading-relaxed">
                  <span className="text-slate-300 mt-1.5 shrink-0">•</span>
                  <span>{r.text}</span>
                </div>
                {r.action && (
                  <div className="ml-4 mt-1 text-[12.5px] text-amber-800 leading-relaxed">
                    <span className="font-semibold">What to do:</span> {r.action}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {review.note && (
            <p className="mt-3 text-[12.5px] text-slate-600 italic leading-relaxed border-l-2 border-slate-200 pl-3">
              {review.note}
            </p>
          )}

          {escalated && (
            <p className="mt-3 text-[12.5px] text-rose-800 leading-relaxed">
              This has been raised with the Programme Manager. It is not something to fix by
              resubmitting — someone will be in touch.
            </p>
          )}

          {review.needsAcknowledgement && (
            <div className="mt-3 border-t border-slate-200/70 pt-3">
              <p className="text-[12.5px] text-slate-600 leading-relaxed">
                This step stays open until you confirm you have read the note above. Nothing needs
                resubmitting — your work was accepted.
              </p>
              <button
                onClick={async () => {
                  setAcking(true);
                  try {
                    await deskApi.acknowledgeMentorFeedback(review.decisionId);
                    onAcknowledged?.();
                  } finally {
                    setAcking(false);
                  }
                }}
                disabled={acking}
                className="mt-2.5 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-slate-900 text-white text-[12.5px] font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {acking ? "Saving…" : "I've read this"}
              </button>
            </div>
          )}

          {review.advisory && (
            <p className="mt-3 text-[11.5px] text-slate-500 leading-relaxed border-t border-slate-200/70 pt-2.5">
              This is guidance from a practitioner reviewing your work. Your grade and your progress
              come from the AI assessment above and are not changed by it.
            </p>
          )}

          {!review.advisory && !review.needsAcknowledgement && !approved && !escalated && (
            <p className="mt-3 text-[11.5px] text-slate-500 leading-relaxed border-t border-slate-200/70 pt-2.5">
              This step has reopened and the work that followed it is on hold until you resubmit.
              You have been given an extra attempt for it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
