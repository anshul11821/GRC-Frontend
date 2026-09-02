"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { StepScreen, type StepScreenSource } from "@/components/app/step-screen";
import { useMenteeGates } from "@/components/mentor/mentee-gates";
import { ReviewDecision, useReviewCard } from "@/components/mentor/review-card";
import {
  CommentableSubmission,
  addressedAnchors,
  requiredAnchors,
} from "@/components/mentor/commentable-submission";
import { mentorApi, type Card, type ReviewComment } from "@/lib/mentor";

/**
 * One step of a mentee's desk: the screen they worked on, with a mentor's buttons.
 *
 * `StepScreen` is the learner's own page — the same header, brief and working sheet — so the
 * reviewer reads the step in the shape the work was done in. What sits inside the sheet is not the
 * learner's form, though: it is the submission broken into entries a comment can hang off, which
 * is what a reviewer needs and what a replayed form cannot give. The form itself was offered
 * alongside it for a while and only ever repeated the same content, so it went.
 *
 * Read-only is enforced inside `StepScreen` — autosave, submit, resubmit and the answer-key
 * release are all switched off — rather than merely hidden here, because a page that can write to
 * somebody else's account should not depend on which buttons got rendered.
 */
export default function MenteeStepPage() {
  const { menteeId, activityId } = useParams<{ menteeId: string; activityId: string }>();
  const { byActivity, refresh, loading: gatesLoading } = useMenteeGates();

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

  // Two fetches stand between opening a step and having something to show: the gate map, then the
  // card. Say so, rather than letting the screen render anything that could be mistaken for the
  // mentee's answer.
  const waiting = gatesLoading || (gate?.submissionId != null && !card);

  return (
    <StepScreen
      source={source}
      readOnly
      submittedWork={
        card ? (
          <ReviewSurface card={card} onDecided={refresh} />
        ) : waiting ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-40 rounded bg-slate-200" />
            <div className="h-24 rounded-lg bg-slate-100" />
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-16 rounded-lg bg-slate-100" />
          </div>
        ) : (
          <p className="text-[12.5px] text-slate-500">
            They have not submitted this step yet, so there is nothing to review.
          </p>
        )
      }
      footer={null}
    />
  );
}

/**
 * The deliverable, as a reviewer works it: every entry and every table row can be ticked or
 * commented on — neither compulsory — with the decision underneath.
 *
 * Both live here rather than the decision going in `StepScreen`'s footer, because the comments and
 * the decision are one act — the drafts are released by the decision, so the button that sends
 * them belongs directly under the thing being commented on.
 */
function ReviewSurface({ card, onDecided }: { card: Card; onDecided: () => void }) {
  // The review lives here and nowhere else until the decision writes it. Seeded empty rather than
  // from the card: `card.comments` are remarks already sent with a previous decision, and echoing
  // them into this reviewer's working set would send them a second time.
  const [comments, setComments] = useState<ReviewComment[]>([]);

  const required = requiredAnchors(card.entries);
  const addressed = addressedAnchors(comments);
  const outstanding = required.filter((a) => !addressed.has(a)).length;
  const hasComments = comments.some((c) => c.kind === "comment");

  return (
    <div>
      <CommentableSubmission card={card} comments={comments} onChange={setComments} />

      <div className="mt-6">
        <ReviewDecision
          card={card}
          onDecided={onDecided}
          outstanding={outstanding}
          hasComments={hasComments}
          marks={comments.map((c) => ({
            kind: c.kind,
            anchor: c.anchor,
            anchorLabel: c.anchorLabel,
            body: c.body,
          }))}
        />
      </div>
    </div>
  );
}
