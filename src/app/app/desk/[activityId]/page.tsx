"use client";

import { StepScreen } from "@/components/app/step-screen";

/**
 * The learner's step: brief, deliverable, submit.
 *
 * The screen itself is shared with the mentor's Review Desk, which mounts it read-only against the
 * mentee's data with a decision where the submit bar is — see `components/app/step-screen`.
 */
export default function ActivityWorkspacePage() {
  return <StepScreen />;
}
