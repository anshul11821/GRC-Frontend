// Run: npx tsx src/lib/acceptance.test.ts
//
// Two failures this catches, both of which shipped before:
//   - a criterion the workspace cannot evidence (Conduct asking for "guide questions" on a screen
//     that has none): the mentee finishes the step with the checklist still open against them;
//   - criteria drifting from the backend catalogue, which grades Layer 1 against its own copy.
// So: every verb has criteria, the texts match `verbs.ts` (mirror of _seed/grc101_catalog.json),
// a finished workspace meets all of them, and an untouched one meets none.
import assert from "node:assert/strict";
import { ACCEPTANCE, acceptanceStates, acceptanceTexts } from "./acceptance";
import { isFilled } from "./checklist";
import { VERBS, GATE_VERBS } from "./verbs";

const ALL = { ...VERBS, ...GATE_VERBS };

/** A finished workspace, in the shape the live (scripted) flow lifts — taken from real payloads. */
const DONE: Record<string, Record<string, unknown>> = {
  request: { to: "IT Operations Lead", subject: "Initial systems list", purpose: "Start the register", items: ["systems", "owners", "locations"], captured: "reply…", objectiveMet: true },
  conduct: { openingId: "o1", disposition: "cooperative", captured: "…facts…", slips: 0, objectiveMet: true },
  present: { openingId: "o1", disposition: "receptive", captured: "…answers…", slips: 0, objectiveMet: true },
  record: { register: "Information Asset Register", rows: [{ name: "Payroll DB", owner: "Head of Payroll" }], objectiveMet: true },
  apply: { outcomes: { 1: "Confidential" }, notes: { 1: "Holds employee pay data" }, results: [{ item: "Payroll DB", outcome: "Confidential", note: "PII" }], objectiveMet: true },
  map: { outcomes: { 1: "A.5.9" }, notes: {}, results: [{ item: "Onboarding", outcome: "A.5.9", note: "" }], objectiveMet: true },
  crossref: { method: "Clause-by-clause diff", statuses: { 1: "aligned" }, actions: { 1: "none" }, discrepancies: [{ item: "A.5.12 wording" }], objectiveMet: true },
  identify: { criterion: "No named owner", flags: [{ item: "Ops drive" }], marks: { 1: "in" }, objectiveMet: true },
  review: { coverNote: "Addressed all five points.", addressed: { 0: true, 1: true }, reviewOutcome: "pass", objectiveMet: true },
  calculate: { formulaCite: "Residual = L × I × (1 − ControlEff/4)", results: [{ row: 1, value: 6 }], objectiveMet: true },
  prioritise: { scores: { 1: { likelihood: 3 } }, tiebreak: "Payroll first — client impact.", objectiveMet: true },
  brief: { audience: "Board", ask: "Approve the scope", messages: ["One page, three messages"], objectiveMet: true },
  interview: { questions: ["q1", "q2", "q3", "q4", "q5"], notesPerQuestion: "Structured notes per question…", ready: true },
  rua: {
    study: [{ passed: true }], inspect: [true], acquire: [true], contextAck: true,
    clarify: [{ state: "understood", paraphrase: "…" }], confirm: { accepted: true },
    explain: [{ passed: true }], answer: [{ outcome: "pass" }], answerDone: true,
    attest: { signature: "A. Learner", decision: "READY" }, objectiveMet: true,
  },
  research: {
    methods: {
      contextual: { findings: "…", soWhat: "…", sources: [{ title: "brief" }] },
      gap: { findings: "…", soWhat: "…", sources: [{ title: "ISO" }] },
      horizon: { findings: "…", soWhat: "…", sources: [{ title: "ENISA" }] },
    },
    include: { crosswalk: true }, decl: { own: true, org: true, probe: true }, objectiveMet: true,
  },
};
// The nine verbs that share FormFlow share its payload.
for (const v of ["draft", "recommend", "validate", "schedule", "assess", "score", "compile", "signoff", "document"])
  DONE[v] = { kind: v, entries: { field1: "answer", field2: "answer" }, objectiveMet: true };

/** The same workspaces on first render: the scripted data is lifted, none of the mentee's input. */
const UNTOUCHED: Record<string, Record<string, unknown>> = {
  request: { to: "", subject: "", purpose: "", items: ["", "", ""], objectiveMet: false },
  conduct: { openingId: "", disposition: "", captured: "", slips: 0, objectiveMet: false },
  present: { openingId: "", disposition: "", captured: "", slips: 0, objectiveMet: false },
  record: { register: "Information Asset Register", rows: [{ name: "", owner: "" }], objectiveMet: false },
  apply: { outcomes: {}, notes: {}, results: [{ item: "Payroll DB", outcome: "", note: "" }], objectiveMet: false },
  map: { outcomes: {}, notes: {}, results: [{ item: "Onboarding", outcome: "", note: "" }], objectiveMet: false },
  crossref: { method: "", statuses: {}, actions: {}, discrepancies: [], objectiveMet: false },
  identify: { criterion: "", flags: [], marks: {}, objectiveMet: false },
  review: { coverNote: "", addressed: {}, reviewOutcome: "pass", objectiveMet: false },
  calculate: { formulaCite: "", results: [], objectiveMet: false },
  prioritise: { scores: {}, tiebreak: "", objectiveMet: false },
  brief: { audience: "", ask: "", messages: [], objectiveMet: false },
  interview: { questions: ["", "", "", "", ""], notesPerQuestion: "", ready: false },
  rua: { study: [null], inspect: [false], acquire: [false], contextAck: false, clarify: [null], confirm: null, explain: [null], answer: [null], answerDone: false, attest: null, objectiveMet: false },
  research: { methods: {}, include: {}, decl: {}, objectiveMet: false },
};
for (const v of ["draft", "recommend", "validate", "schedule", "assess", "score", "compile", "signoff", "document"])
  UNTOUCHED[v] = { kind: v, entries: { field1: "", field2: "" }, objectiveMet: false };

for (const [id, verb] of Object.entries(ALL)) {
  const criteria = acceptanceTexts(id);
  assert.ok(criteria.length > 0, `verb "${id}" has no acceptance criteria — the step would show an empty checklist`);
  assert.deepEqual(
    criteria, verb.layer1,
    `verb "${id}": ACCEPTANCE texts differ from verbs.ts (mirror of _seed/grc101_catalog.json). ` +
      `Layer 1 grades against the catalogue copy, so the mentee would be shown one list and graded on another.`,
  );

  const done = DONE[id];
  assert.ok(done, `no finished-workspace sample for verb "${id}"`);
  acceptanceStates(id, done).forEach((met, i) =>
    assert.ok(met, `verb "${id}": "${criteria[i]}" is not met by a finished workspace — the mentee cannot tick it`));

  const blank = UNTOUCHED[id];
  assert.ok(blank, `no untouched-workspace sample for verb "${id}"`);
  acceptanceStates(id, blank).forEach((met, i) =>
    assert.ok(!met, `verb "${id}": "${criteria[i]}" is already met before the mentee has done anything`));
}

// Every criterion is a real function of the payload, not a constant.
for (const [id, list] of Object.entries(ACCEPTANCE))
  for (const c of list)
    assert.notEqual(c.met(DONE[id]), c.met(UNTOUCHED[id]), `verb "${id}": "${c.text}" ignores the payload`);

assert.equal(isFilled({ a: "", b: [] }), false);
assert.equal(isFilled({ a: "", b: ["x"] }), true);

console.log(
  `acceptance: ok — ${Object.keys(ALL).length} verbs, ` +
    `${Object.values(ACCEPTANCE).reduce((n, c) => n + c.length, 0)} criteria, each earned and each dropped when untouched`,
);
