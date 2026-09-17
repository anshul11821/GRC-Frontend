import type { LearningOrg } from "./learnings";

/**
 * Which placement the Working Desk is showing, decided from the URL alone.
 *
 * The desk shows one organisation's tasks at a time and the organisation band picks between them,
 * so this answers both "which chip is lit" and "whose tasks are in the tree" — and it has to be
 * one answer, or the band and the tree disagree about where the learner is.
 *
 * Order matters:
 *  1. the placement owning the open step or task — arriving by a link (Up next, the calendar, a
 *     mentor's worklist) must move the desk to that work, not leave the tree somewhere else;
 *  2. the placement whose context page is open — this is what makes a chip a working filter,
 *     since each chip is simply a link to that page;
 *  3. the current placement, for the bare desk.
 */
export function pickOrgId(
  orgs: LearningOrg[],
  at: { activityId?: string; taskCode?: string; orgPageId?: string },
): string | undefined {
  const linked = (at.taskCode || at.activityId)
    ? orgs.find((o) => o.projects.some((p) => p.tasks.some(
        (t) => t.code === at.taskCode || t.steps.some((s) => s.id === at.activityId))))?.id
    : undefined;
  const current = orgs.find((o) => o.status === "active")
    ?? orgs.find((o) => o.status !== "complete" && o.status !== "locked" && o.status !== "upcoming");
  return linked ?? at.orgPageId ?? current?.id;
}
