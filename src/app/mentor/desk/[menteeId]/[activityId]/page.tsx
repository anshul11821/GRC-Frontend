"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { StepScreen, type StepScreenSource } from "@/components/app/step-screen";
import { useMenteeGates } from "@/components/mentor/mentee-gates";
import { ReviewDecision, useReviewCard } from "@/components/mentor/review-card";
import { mentorApi } from "@/lib/mentor";

/**
 * One step of a mentee's desk: the screen they worked on, with a mentor's buttons.
 *
 * Not a reviewer's rendering of their work — *their* screen. The learner's own step page already
 * goes read-only once a step is submitted (frozen workspace, their answers in it, the grade beside
 * it), so a reviewer wants exactly that, and anything rebuilt alongside it would be a second
 * description of the same submission that drifts from the first.
 *
 * So `StepScreen` is mounted with the mentee's data, `readOnly`, and the decision passed in where
 * the submit bar sits. Read-only is enforced inside the screen — autosave, submit, resubmit and
 * the answer-key release are all switched off — rather than merely hidden here, because a page
 * that can write to somebody else's account should not depend on which buttons got rendered.
 */
export default function MenteeStepPage() {
  const { menteeId, activityId } = useParams<{ menteeId: string; activityId: string }>();
  const { byActivity, refresh } = useMenteeGates();

  const source = useMemo<StepScreenSource>(
    () => ({
      activity: () => mentorApi.menteeActivity(menteeId, activityId),
      submissions: () => mentorApi.menteeActivitySubmissions(menteeId, activityId),
    }),
    [menteeId, activityId],
  );

  // Null on a step with no submission — there is nothing to decide, and the screen simply reads.
  const gate = byActivity.get(activityId);
  const { card } = useReviewCard(gate?.submissionId ?? null);

  return (
    <StepScreen
      source={source}
      readOnly
      footer={card ? <ReviewDecision card={card} onDecided={refresh} /> : null}
    />
  );
}
