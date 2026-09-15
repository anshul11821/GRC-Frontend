/**
 * Which payload keys each verb's workspace can restore from.
 *
 * Every bespoke workspace seeds its state from a handful of keys (`seed(value, "outcomes", …)`,
 * `savedRows(value)`, the `restored` memo). A submitted payload carrying none of them renders as an
 * untouched workspace — blank dropdowns, no opening chosen, an empty register — under a banner
 * saying "This is the work you submitted". Three things produce such a payload:
 *
 *   1. a submission made outside the workspace (a seeded demo row, an API smoke test);
 *   2. work submitted while the step still fell back to the legacy free-text pad, whose shape the
 *      scripted flow that replaced it cannot read (`{cells, mappings}` for a map, `{flags}` for an
 *      identify, `{formula, inputs, result}` for a calculate);
 *   3. any future change to what a workspace lifts.
 *
 * None of them are recoverable — the work was done against different items — so the step screen
 * reads this map, and when nothing matches it shows the submitted fields as a record instead of
 * pretending the empty workspace is the learner's work. See `step-screen.tsx`.
 *
 * Keys are the camelCase ones the workspace reads; the API layer has already un-snake_cased them.
 * `workspace-readback.test.ts` holds this to every verb in the registry.
 */
export const WORKSPACE_READS: Record<string, string[]> = {
  // set-a — scripted flows
  request: ["to", "subject", "purpose", "items"],
  conduct: ["openingId"],
  present: ["openingId"], // PresentWorkspace mounts ScriptedConductFlow
  record: ["rows", "register"], // savedRows() accepts either
  apply: ["outcomes", "notes"],
  map: ["outcomes", "notes"], // MapWorkspace mounts ScriptedApplyFlow
  crossref: ["statuses", "actions", "method"],
  identify: ["criterion", "marks"],
  review: ["addressed", "coverNote"],
  // set-b / set-c — FormFlow, one shape for nine verbs
  draft: ["entries"],
  recommend: ["entries"],
  validate: ["entries"],
  schedule: ["entries"],
  assess: ["entries"],
  score: ["entries"],
  compile: ["entries"],
  signoff: ["entries"],
  document: ["entries"],
  calculate: ["results", "formulaCite"],
  prioritise: ["scores", "tiebreak"],
  brief: ["ask", "audience", "messages"],
  interview: ["questions", "notesPerQuestion"],
  // the two task-boundary gates
  rua: ["study", "inspect", "acquire", "clarify", "confirm", "explain", "answer", "attest"],
  research: ["methods", "include", "decl"],
};

/** True when a value is worth restoring — an empty array or object is as blank as a missing key. */
function present(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return false;
  if (Array.isArray(v)) return v.some((x) => x !== null && x !== undefined && x !== false && x !== "");
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}

/**
 * Can this verb's workspace read this payload back?
 *
 * Unknown verbs answer `true`: a verb with no bespoke workspace falls to the generic note pad,
 * which reads whatever it was given, and a new verb must not start life accused of losing work.
 */
export function fitsWorkspace(verbId: string, fields: Record<string, unknown> | undefined): boolean {
  const reads = WORKSPACE_READS[verbId];
  if (!reads) return true;
  return reads.some((k) => present(fields?.[k]));
}
