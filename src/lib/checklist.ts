// Live Layer-1 acceptance checklist — provisional, client-side guess at whether each criterion is
// met by what the mentee has actually entered. Authoritative verdicts come from the backend gate
// after submit.
//
// This reads the workspace's *lifted values* (what actually gets submitted), not a parallel
// field-spec: the bespoke per-verb workspaces lift their own keys, so any static spec drifts out of
// sync and leaves criteria permanently unticked with nothing on screen to tick them.

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
  [/item|rank|mapping|\blink|finding|dimension|register|asset|entr/, /item|rank|map|link|find|dimension|register|asset|entr|name/],
];

type Atom = { tokens: string; filled: boolean };

/** Flatten lifted values into matchable atoms: one per key, plus one per column of a table field. */
function valueAtoms(values: Record<string, unknown>): Atom[] {
  const atoms: Atom[] = [];
  for (const [key, v] of Object.entries(values)) {
    if (key === "objectiveMet") continue; // control flag, not a deliverable field
    atoms.push({ tokens: key.toLowerCase(), filled: isFilled(v) });
    const rows = Array.isArray(v) ? v : [];
    const cols = new Set(rows.flatMap((r) => (r && typeof r === "object" && !Array.isArray(r) ? Object.keys(r) : [])));
    for (const c of cols)
      atoms.push({
        tokens: `${key} ${c}`.toLowerCase(),
        filled: rows.some((r) => isFilled((r as Record<string, unknown>)[c])),
      });
  }
  return atoms;
}

/** True when the workspace considers the deliverable done. Workspaces with a guided objective lift
 *  `objectiveMet` and are the authority; the rest fall back to "every lifted value has content". */
function isComplete(values: Record<string, unknown>): boolean {
  if (typeof values.objectiveMet === "boolean") return values.objectiveMet;
  const entries = Object.entries(values);
  return entries.length > 0 && entries.every(([, v]) => isFilled(v));
}

/** Per-criterion met/unmet for the current inputs, in criteria order. */
export function checklistStates(criteria: string[], values: Record<string, unknown>): boolean[] {
  // A finished deliverable satisfies every criterion: a criterion the workspace has no field for
  // (e.g. "No blank fields without rationale" on a scripted interview) must never be untickable.
  if (isComplete(values)) return criteria.map(() => true);
  const atoms = valueAtoms(values);
  const anyFilled = atoms.some((a) => a.filled);
  return criteria.map((c) => {
    const t = c.toLowerCase();
    if (/if applicable|if any|if rejected|where applicable|n\/a/.test(t)) return anyFilled; // conditional/optional
    // Only criteria we can tie to a real input tick early; the rest wait for completion.
    return CRITERION_CONCEPTS.some(
      ([kw, atomRe]) => kw.test(t) && atoms.some((a) => atomRe.test(a.tokens) && a.filled),
    );
  });
}
