"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MachineNote } from "@/components/app/machine-note";
import { VerbBadge, verbMeta } from "@/components/mentor/verb-badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { isAuthError, mentorApi } from "@/lib/mentor";
import type { ActivityDetail } from "@/lib/desk";
import { isGateVerb } from "@/lib/verbs";
import { GateChip, useMenteeGates } from "@/components/mentor/mentee-gates";
import { ReviewCard } from "@/components/mentor/review-card";

/**
 * One step of a mentee's desk, read-only.
 *
 * Deliberately not the learner's own step page. That page is a *workspace* — it saves drafts,
 * submits, spends attempts and releases the next step, and mounting it for someone else would put
 * all of that one mis-click away from writing to a learner's account. So the mentor route renders
 * the same underlying `ActivityDetail`, with none of the actions on it: nothing here can write.
 *
 * At a gate step it hands over to the review card, which is where deciding lives.
 */
export default function MenteeStepPage() {
  const { menteeId, activityId } = useParams<{ menteeId: string; activityId: string }>();
  const { byActivity, refresh } = useMenteeGates();
  const [step, setStep] = useState<ActivityDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clear during render when the step changes, not in the effect: an effect-time reset paints the
  // previous step's answer under the new step's heading for a frame, which on a review surface is
  // the wrong learner's work under the wrong title.
  const key = `${menteeId}/${activityId}`;
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setStep(null);
    setError(null);
  }

  useEffect(() => {
    // Clicking down a task faster than the network answers would otherwise let an earlier
    // response land after a later one.
    let live = true;
    mentorApi
      .menteeActivity(menteeId, activityId)
      .then((d) => {
        if (live) setStep(d);
      })
      .catch((e) => {
        if (!live || isAuthError(e)) return;
        setError(e instanceof ApiError ? e.message : "Could not load this step.");
      });
    return () => {
      live = false;
    };
  }, [menteeId, activityId]);

  if (error) {
    return <div className="px-6 py-10 text-[12.5px] text-[#a31d1d]">{error}</div>;
  }
  if (!step) return <PageSkeleton cards={3} />;

  const verb = verbMeta(step.verb.id);
  const gate = isGateVerb(step.verb.id);
  const gateHere = byActivity.get(step.id);
  const review = step.latestReview;
  // A gate of theirs that has a submission: the whole review happens on this page.
  const reviewable = gateHere?.submissionId != null;

  return (
    <div className="px-6 py-6 max-w-[900px]">
      <div className="flex items-center gap-2 flex-wrap">
        <VerbBadge verbId={step.verb.id} />
        <span className="font-mono text-[11.5px] text-slate-500">
          {step.taskCode} · {step.code}
        </span>
        <span className="text-[11px] text-slate-400">{step.status}</span>
      </div>
      <h1 className="text-[20px] font-semibold tracking-tight text-slate-900 mt-1">{step.title}</h1>
      {verb && (
        <p className="text-[11.5px] text-slate-500 leading-relaxed mt-1.5">
          <b className="font-semibold text-slate-700">{verb.label}</b> — {verb.when}
        </p>
      )}

      {/* A task-boundary workspace (RUA / Research) that no gate in your scope covers. */}
      {gate && !gateHere && (
        <div className="mt-4 rounded-xl border border-[#e6eaf0] bg-slate-50/60 px-4 py-3 text-[12px] text-slate-600 leading-relaxed">
          This is a task-boundary step. No review gate in your scope covers it, so there is nothing
          for you to decide here.
        </div>
      )}

      {reviewable ? (
        /* The review, in place. It used to be a link to another page: the mentor read the work on
           the desk, then opened a second surface to say what they thought of it. This is the same
           component `/mentor/card/[submissionId]` mounts, so the two cannot drift into two
           different reviews — and it already carries the brief, the submission, the AI's grade and
           the history, which is why none of that is repeated below it. */
        <div className="mt-5">
          <ReviewCard submissionId={gateHere.submissionId!} embedded onDecided={refresh} />
        </div>
      ) : (
        <>
          {gateHere?.state === "not_submitted" && (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-violet-800">
                  Review gate
                </span>
                <span className="font-mono text-[10.5px] text-slate-500">{gateHere.gateId}</span>
                <GateChip gate={gateHere} />
              </div>
              <p className="text-[12px] text-slate-700 leading-relaxed mt-1.5">
                They have not submitted this step yet, so there is nothing to review.
              </p>
            </div>
          )}

          <section className="mt-6">
            <h2 className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-2">
              Attempts
            </h2>
            <p className="text-[12.5px] text-slate-700 tabular-nums">
              {step.attemptsUsed} used of {step.maxAttempts}
              {step.attemptsRemaining <= 0 && <span className="text-[#a31d1d]"> · none left</span>}
            </p>
          </section>

          {review ? (
            <section className="mt-6">
              <h2 className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-2">
                The grade on record
              </h2>
              {/* Wearing the provenance tag, like everywhere else a model's output appears: this
                  is the AI's provisional verdict, not a mentor's decision. */}
              <MachineNote>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-slate-900">
                    {review.overallScore}/5
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      review.decision === "pass" ? "text-[#1e7a46]" : "text-[#a31d1d]"
                    }`}
                  >
                    {review.decision === "pass" ? "Passed" : "Needs revision"}
                  </span>
                </div>
                {review.feedback && (
                  <p className="text-[12px] text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap">
                    {review.feedback}
                  </p>
                )}
              </MachineNote>
            </section>
          ) : (
            <p className="mt-6 text-[12.5px] text-slate-500">
              They have not submitted this step yet, so there is nothing to read here.
            </p>
          )}
        </>
      )}
    </div>
  );
}
