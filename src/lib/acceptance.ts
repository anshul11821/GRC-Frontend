/**
 * The acceptance criteria a step is measured against, and how each one is judged.
 *
 * These replace a keyword engine that matched the criterion's English against the names of the
 * lifted fields (`/rationale/` against `/rational|justif/`, …). Two things were wrong with it:
 *
 *   - **The criteria described workspaces that no longer exist.** They were written for the legacy
 *     free-text pads, so Conduct asked for "≥ 90 % of guide questions answered" and "No blank
 *     fields without rationale" on a screen that has no guide, no fields and no rationale — it
 *     offers three openings and a branching exchange. Present asked for a deck upload and a
 *     sign-off date on the same scripted-conversation workspace. A criterion the step cannot
 *     evidence is noise at best: it tells the mentee their finished work is unfinished.
 *   - **Matching English against field names cannot be right twice.** Running the live criteria
 *     against real submitted payloads, most ticked only because the workspace had already declared
 *     itself complete, and the rest missed outright — a finished Record register scored 0 of 4.
 *
 * So each criterion now names the input that satisfies it. `met` reads the workspace's own lifted
 * payload: the same object that gets submitted, so a criterion cannot claim something the mentor
 * will not receive. Where "every item" is the criterion, the workspace's own answer-key validation
 * (`objectiveMet`) is the honest signal — it is what "every one of them is right" means here.
 *
 * The texts are mirrored in the backend catalogue (`_seed/grc101_catalog.json` → verbs.layer1),
 * because Layer 1 grades against the same list; `acceptance.test.ts` fails if the two drift.
 */

type Fields = Record<string, unknown>;

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const rec = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const filled = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.some(filled);
  if (v && typeof v === "object") return Object.values(v).some(filled);
  return str(v) !== "" || typeof v === "number";
};
/**
 * The workspace's own verdict that the work is complete and correct.
 *
 * `objectiveMet` is what the scripted flows lift; `ready` is what the legacy free-text pads lifted,
 * and their submissions are still in the database and still open on the desk, so both count.
 */
const done = (f: Fields) => f.objectiveMet === true || f.ready === true;
/** Rows a table-shaped payload holds, whatever the workspace called them. */
const rows = (f: Fields, ...keys: string[]) => keys.flatMap((k) => list(f[k]));

/** Apply and Map: a decision on every row. Older payloads carry only the `outcomes` map. */
const everyItemDecided = (f: Fields): boolean => {
  const results = list(f.results);
  if (results.length > 0) return results.every((x) => str(rec(x).outcome) !== "");
  const outcomes = Object.values(rec(f.outcomes));
  return outcomes.length > 0 && outcomes.every((v) => str(v) !== "");
};

export interface Criterion {
  /** Shown to the mentee, and sent to Layer 1 as its label. */
  text: string;
  /** Met by the work so far — read from the workspace's lifted payload. */
  met: (f: Fields) => boolean;
}

const formFlow = (what: string): Criterion[] => [
  { text: `Every field in the ${what} completed`, met: (f) => done(f) || Object.values(rec(f.entries)).every(filled) && Object.keys(rec(f.entries)).length > 0 },
];

export const ACCEPTANCE: Record<string, Criterion[]> = {
  // ── set-a, scripted flows ────────────────────────────────────────────────────────────────
  request: [
    { text: "To-field is a named role", met: (f) => str(f.to) !== "" },
    { text: "≥ 3 requested items", met: (f) => list(f.items).filter(filled).length >= 3 },
    { text: "Subject ≤ 80 chars", met: (f) => str(f.subject) !== "" && str(f.subject).length <= 80 },
  ],
  // The scripted exchange: pick an opening, then answer each round until the objective is reached.
  // Two criteria, not three: `captured` is the stakeholder's scripted reply, and a graded
  // submission can reach the objective without carrying one — so it cannot be something the
  // mentee is measured on.
  conduct: [
    { text: "Opening chosen for this stakeholder", met: (f) => str(f.openingId) !== "" },
    { text: "Every follow-up answered", met: done },
  ],
  present: [
    { text: "Opening chosen for this audience", met: (f) => str(f.openingId) !== "" },
    { text: "Every audience question answered", met: done },
  ],
  // "Owner is a role, not a department" was here and is gone: only some registers have an owner
  // column at all (TPRM-001's vendor register is vendor/DPA/driver/rating/action), so it accused
  // finished work of missing a field the task never asked for. The rule still runs where the column
  // exists — RecordTask columns carry `notDepartment`, and the workspace enforces it into
  // `objectiveMet`, which is what "Schema conformance" reads.
  record: [
    { text: "Mandatory fields populated", met: (f) => rows(f, "rows", "register").some(filled) },
    { text: "Schema conformance", met: done },
  ],
  apply: [
    { text: "Every item has an outcome", met: everyItemDecided },
    { text: "Outcomes match the scheme", met: done },
  ],
  map: [
    { text: "Every row mapped", met: everyItemDecided },
    { text: "Mappings match the reference", met: done },
  ],
  crossref: [
    { text: "Method field populated", met: (f) => str(f.method) !== "" },
    { text: "≥ 1 discrepancy class identified", met: (f) => list(f.discrepancies).filter(filled).length >= 1 },
    { text: "Every row given a status and an action", met: done },
  ],
  identify: [
    { text: "Criterion stated before marking", met: (f) => str(f.criterion) !== "" },
    { text: "≥ 1 item flagged", met: (f) => list(f.flags).filter(filled).length >= 1 },
    { text: "Every item marked against the criterion", met: done },
  ],
  review: [
    { text: "Cover note present", met: (f) => str(f.coverNote) !== "" },
    { text: "Prior feedback addressed", met: (f) => done(f) || filled(f.addressed) },
  ],
  // ── set-b / set-c — nine verbs share FormFlow, so they share its one honest criterion ─────
  draft: formFlow("draft"),
  recommend: formFlow("recommendation"),
  validate: formFlow("validation"),
  schedule: formFlow("schedule"),
  assess: formFlow("assessment"),
  score: formFlow("scoring"),
  compile: formFlow("compilation"),
  signoff: formFlow("sign-off"),
  document: formFlow("document"),
  calculate: [
    { text: "Formula identifier cited", met: (f) => str(f.formulaCite) !== "" || str(f.formula) !== "" },
    { text: "Result re-computes to ± 0", met: done },
  ],
  prioritise: [
    { text: "Ranking is criterion-based", met: (f) => filled(f.scores) },
    { text: "No unresolved ties", met: done },
  ],
  brief: [
    { text: "Audience field populated", met: (f) => str(f.audience) !== "" },
    { text: "Explicit ask present", met: (f) => str(f.ask) !== "" },
    { text: "Key messages written", met: (f) => filled(f.messages) },
  ],
  interview: [
    { text: "≥ 5 open questions prepared", met: (f) => list(f.questions).filter((q) => str(q) !== "").length >= 5 },
    { text: "Notes structured per question", met: (f) => str(f.notesPerQuestion) !== "" },
  ],
  // ── the two task-boundary gates ───────────────────────────────────────────────────────────
  rua: [
    { text: "Every control comprehension check passed", met: (f) => { const s = list(f.study); return s.length > 0 && s.every((x) => rec(x).passed === true); } },
    { text: "All templates inspected and exercises passed", met: (f) => { const t = list(f.inspect); return t.length > 0 && t.every(Boolean); } },
    {
      text: "Every step understood and concepts explained in own words",
      met: (f) => {
        const c = list(f.clarify), e = list(f.explain);
        return c.length > 0 && c.every((x) => str(rec(x).state) === "understood")
          && e.length > 0 && e.every((x) => rec(x).passed === true);
      },
    },
    { text: "Verification session passed and readiness attested", met: (f) => f.answerDone === true && str(rec(f.attest).decision) !== "" },
  ],
  research: [
    {
      text: "All three required research methods clear the quality bar",
      met: (f) => ["contextual", "gap", "horizon"].every((k) => str(rec(rec(f.methods)[k]).findings) !== ""),
    },
    { text: "At least one optional method included and cleared", met: (f) => Object.values(rec(f.include)).some(Boolean) },
    {
      text: "Every included method cites a source and names the organisation",
      met: (f) => Object.values(rec(f.methods)).some((m) => list(rec(m).sources).length > 0),
    },
    { text: "Declaration signed on the review screen", met: (f) => { const d = rec(f.decl); return !!d.own && !!d.org && !!d.probe; } },
  ],
};

/** Per-criterion met/unmet for the work so far. An unknown verb has no criteria to show. */
export function acceptanceStates(verbId: string, fields: Fields): boolean[] {
  return (ACCEPTANCE[verbId] ?? []).map((c) => {
    try {
      return c.met(fields);
    } catch {
      return false; // a malformed payload is not a met criterion
    }
  });
}

/** The criterion texts for a verb, in order — what the mentee sees and what Layer 1 is given. */
export const acceptanceTexts = (verbId: string): string[] => (ACCEPTANCE[verbId] ?? []).map((c) => c.text);
