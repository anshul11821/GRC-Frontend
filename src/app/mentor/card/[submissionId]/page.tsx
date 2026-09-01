"use client";

import { useParams } from "next/navigation";
import { MentorShell } from "@/components/mentor/shell";
import { ReviewCard } from "@/components/mentor/review-card";

/**
 * The review card on its own page.
 *
 * The body moved to `components/mentor/review-card` so the Review Desk can embed the same thing
 * against a gate step. This route stays because the Dashboard worklist opens it, and because a
 * card is a linkable thing — a mentor sharing "the one I'm stuck on" wants a URL.
 */
export default function MentorCardPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  return (
    <MentorShell>
      <ReviewCard submissionId={Number(submissionId)} />
    </MentorShell>
  );
}
