"use client";

import { ReviewSurface } from "@/components/mentor/review-surface";

/**
 * A mentee with no step chosen yet.
 *
 * The same surface as a step: the bands and the step row are what a reviewer is looking at first,
 * and the record area below says to pick one. Rendering something different here would be a second
 * layout to keep in step with this one, for the sake of a sentence.
 */
export default function MenteePickPage() {
  return <ReviewSurface />;
}
