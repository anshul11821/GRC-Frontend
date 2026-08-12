// Live Layer-1 acceptance checklist — provisional, client-side guess at whether each criterion is
// met by what the mentee has actually entered. Authoritative verdicts come from the backend gate
// after submit.
//
// This reads the workspace's *lifted values* (what actually gets submitted), not a parallel
// field-spec: the bespoke per-verb workspaces lift their own keys, so any static spec drifts out of
// sync and leaves criteria permanently unticked with nothing on screen to tick them.

/** Flags a workspace lifts to tell the backend how to grade — not part of the deliverable, so they
 *  never count as content and are never shown as submitted fields. */
export const CONTROL_KEYS = new Set(["objectiveMet", "scripted", "ready"]);

/** Non-empty test. Booleans count as filled only when true; objects/arrays when something inside is. */
export function isFilled(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.some(isFilled);
  if (v && typeof v === "object") return Object.values(v).some(isFilled);
  return String(v ?? "").trim() !== "";
}

/** [criterion-keyword, value-key-token] pairs — tie an acceptance criterion to the input(s) that satisfy it. */
const CRITERION_CONCEPTS: [RegExp, RegExp][] = [
  [/role|owner|accountable|stakeholder|audience|named/, /role|owner|accountable|stakeholder|audience/],
  [/deadline|date|target|time/, /date|deadline|target|time/],
  [/citation|cited|cite|standard|control|reference|cross-?ref|evidence|source/, /cit|standard|control|refer|cross|evidence|source/],
  [/rationale|justification|justif/, /rational|justif/],
  [/question/, /question|guide|interview/],
  [/subject/, /subject/],
  [/purpose/, /purpose/],
  [/agenda/, /agenda/],
  [/confirmation|confirmed/, /confirm/],
  [/method/, /method/],
  [/formula/, /formula/],
  [/result/, /result/],
  [/summary/, /executive|summary/],
  [/decision|sign-?off|approval|approved/, /decision|signoff|sign-?off|approv/],
  [/cover/, /cover/],
  [/deck|uploaded|slide|artefact/, /deck|slide|artefact|link/],
  [/feedback|prior/, /feedback|prior/],
  [/revision/, /revision/],
  [/discrepan/, /discrepan/],
  [/flag/, /flag/],
  [/action|recommend/, /action|recommend/],
  [/\bask\b/, /\bask\b/],
  [/section/, /section/],
  // Catch-all: "there is a list of things". Deliberately broad, and therefore the one rule that
  // matches a table off its *given* columns (a finding's text, an asset's name) while every column
  // the mentee owns is still blank — see CATCH_ALL below.
  [/item|rank|mapping|\blink|finding|dimension|register|asset|entr/, /item|rank|map|link|find|dimension|register|asset|entr|name/],
];

/** Index of the catch-all rule — skipped while the workspace says the deliverable isn't done. */
const CATCH_ALL = CRITERION_CONCEPTS.length - 1;

type Atom = { tokens: string; filled: boolean };

/** Flatten lifted values into matchable atoms: one per key, plus one per column of a table field. */
function valueAtoms(values: Record<string, unknown>): Atom[] {
  const atoms: Atom[] = [];
  for (const [key, v] of Object.entries(values)) {
    if (CONTROL_KEYS.has(key)) continue; // grading flag, not a deliverable field
    // Only object rows can carry columns. Filtered once and reused, because collecting the column
    // names and reading them back have to agree: a lifted array can be sparse or hold nulls (the
    // RUA gate's per-question entries are written by index, and the workspace itself reads them
    // with `?.`), and indexing one of those blew up with "Cannot read properties of null".
    const rows = (Array.isArray(v) ? v : []).filter(
      (r): r is Record<string, unknown> => !!r && typeof r === "object" && !Array.isArray(r),
    );
    const cols = new Set(rows.flatMap((r) => Object.keys(r)));
    // A table gets column atoms only. Its bare key would count as filled off any one column, and
    // workspaces put the given data (finding text, asset names) in the same rows as the mentee's —
    // so the key alone would tick criteria about columns that are still empty.
    if (cols.size === 0) atoms.push({ tokens: key.toLowerCase(), filled: isFilled(v) });
    for (const c of cols)
      atoms.push({
        tokens: `${key} ${c}`.toLowerCase(),
        filled: rows.some((r) => isFilled(r[c])),
      });
  }
  return atoms;
}

/** True when the workspace considers the deliverable done. Workspaces that can judge their own
 *  completion say so — `objectiveMet` (answer-key validated) or `ready` (every required field
 *  filled) — and are the authority. Only workspaces that lift neither fall back to "every lifted
 *  value has content", which over-counts any scripted/given data the workspace also lifts. */
function isComplete(values: Record<string, unknown>): boolean {
  if (typeof values.objectiveMet === "boolean") return values.objectiveMet;
  if (typeof values.ready === "boolean") return values.ready;
  const entries = Object.entries(values).filter(([k]) => !CONTROL_KEYS.has(k));
  return entries.length > 0 && entries.every(([, v]) => isFilled(v));
}

/** Per-criterion met/unmet for the current inputs, in criteria order. */
export function checklistStates(criteria: string[], values: Record<string, unknown>): boolean[] {
  // A finished deliverable satisfies every criterion: a criterion the workspace has no field for
  // (e.g. "No blank fields without rationale" on a scripted interview) must never be untickable.
  if (isComplete(values)) return criteria.map(() => true);
  // The workspace has explicitly said it isn't done, so the broad catch-all must not fire — it is
  // the rule that would otherwise green a whole table off the data the workspace handed over.
  const declaredIncomplete = values.objectiveMet === false || values.ready === false;
  const rules = declaredIncomplete ? CRITERION_CONCEPTS.slice(0, CATCH_ALL) : CRITERION_CONCEPTS;
  const atoms = valueAtoms(values);
  const anyFilled = atoms.some((a) => a.filled);
  return criteria.map((c) => {
    const t = c.toLowerCase();
    if (/if applicable|if any|if rejected|where applicable|n\/a/.test(t)) return anyFilled; // conditional/optional
    // Only criteria we can tie to a real input tick early; the rest wait for completion.
    return rules.some(
      ([kw, atomRe]) => kw.test(t) && atoms.some((a) => atomRe.test(a.tokens) && a.filled),
    );
  });
}
