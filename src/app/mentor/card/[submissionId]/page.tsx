"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MentorShell } from "@/components/mentor/shell";
import { useReviewCard } from "@/components/mentor/review-card";

/**
 * The old review-card URL, kept as a redirect.
 *
 * Reviewing happens on the mentee's own step screen now — their brief, their deliverable, their
 * tree in the rail — and a second surface for the same submission would be a second place for the
 * review to be built, which is how two surfaces drift into two different reviews.
 *
 * This route stays rather than 404ing because a card link is a durable thing: it is what a mentor
 * bookmarked, or pasted to a colleague, before the desk existed.
 */
export default function MentorCardPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const router = useRouter();
  const { card, loadError } = useReviewCard(Number(submissionId));

  useEffect(() => {
    // The card is what knows which learner and which step this submission belongs to; resolving it
    // any other way would be a second endpoint for a redirect.
    if (card?.menteeId && card.activityId) {
      router.replace(`/mentor/desk/${card.menteeId}/${card.activityId}`);
    }
  }, [card, router]);

  return (
    <MentorShell>
      <div className="mx-auto max-w-[900px] px-6 pt-10">
        {loadError ? (
          <div className="rounded-xl border border-[#f0c2c2] bg-[#fdecec] px-4 py-3 text-[12.5px] text-[#a31d1d]">
            {loadError}
          </div>
        ) : (
          <p className="text-[12.5px] text-slate-500">Opening this step on the Review Desk…</p>
        )}
      </div>
    </MentorShell>
  );
}
