"use client";

import { TaskOverview } from "@/components/app/task-overview";

/**
 * A mentee's task, as the mentee sees it.
 *
 * The learner's own brief component — objective, standards banner, controls, glossary and step
 * list — mounted against their tree and their curriculum bundle. It was a bespoke step list here,
 * which meant a reviewer read a different description of the task from the person who did it.
 * The step list inside it is filtered to the gates this mentor reviews (see DeskStepFilter).
 */
export default function MenteeTaskPage() {
  return <TaskOverview />;
}
