// What counts as deliverable content in a lifted workspace payload — used by the submitted-fields
// renderers, the has-content check on submit, and the mentor's review card.

/** Flags a workspace lifts to tell the backend how to grade — not part of the deliverable, so they
 *  never count as content and are never shown as submitted fields. */
// `decision` is the judgment call. It is a graded input, but it has its own panel on the desk
// and its own panel on the review card, so it is filtered out of the generic field renderers
// here rather than shown twice as a raw object. Mirrors CONTROL_KEYS in
// backend/app/services/mentor_review.py — the two must agree or the mentor reviews a longer
// document than the learner submitted.
export const CONTROL_KEYS = new Set(["objectiveMet", "scripted", "ready", "slips", "decision"]);

/** Non-empty test. Booleans count as filled only when true; objects/arrays when something inside is. */
export function isFilled(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.some(isFilled);
  if (v && typeof v === "object") return Object.values(v).some(isFilled);
  return String(v ?? "").trim() !== "";
}

// The live met/unmet judgement moved to lib/acceptance.ts, which pairs each criterion with the
// input that satisfies it. What was here matched the criterion's English against the *names* of
// the lifted fields, and could not be right twice: run against real submitted payloads, a finished
// Record register met none of its four criteria, while a half-typed one met three off the given
// data the workspace lifts beside the mentee's. What remains is what the rest of the desk needs:
// which keys are grading flags rather than deliverable content, and what counts as filled in.
