// Run: npx tsx src/lib/checklist.test.ts
// The live checklist must never show a criterion the mentee has no way to tick: every verb's
// acceptance criteria have to reach all-met once its workspace declares the objective done.
import assert from "node:assert/strict";
import { checklistStates, isFilled } from "./checklist";
import { VERBS, GATE_VERBS } from "./verbs";

// One representative lifted-value shape per verb workspace (keys copied from their useLift calls).
const DONE: Record<string, Record<string, unknown>> = {
  request: { to: "IT Ops Lead", subject: "Asset list", purpose: "p", items: ["a", "b", "c"], objectiveMet: true, captured: "…" },
  conduct: { roleAgent: "Process Owner", openingId: "o1", disposition: "open", objectiveMet: true, captured: "…" },
  record: { register: "Asset Register", rows: [{ name: "CRM", owner: "IT Ops Lead" }], objectiveMet: true },
  apply: { outcomes: { r1: "Confidential" }, notes: { r1: "PII" }, results: [], objectiveMet: true },
  crossref: { method: "diff", statuses: {}, actions: {}, discrepancies: [{ item: "x" }], objectiveMet: true },
  identify: { criterion: "no owner", flags: [{ item: "x" }], marks: {}, objectiveMet: true },
  review: { coverNote: "note", addressed: [true], objectiveMet: true, reviewOutcome: "pass" },
  present: { deckLink: "deck.pptx", anticipatedQuestions: ["q1", "q2", "q3"], signoffDecision: "Approved", decisionDate: "2026-07-30" },
  draft: { docTitle: "Policy", sections: "1: body", sectionList: [{ title: "1" }], standardsCited: ["ISO 27001 A.5.9"] },
  map: { cells: { a: "b" }, mappings: [{ item: "x", rationale: "y" }] },
  calculate: { formula: "L × I", inputs: "L=3", inputValues: { likelihood: 3 }, citations: ["s"], working: "w", result: "6.0" },
  prioritise: { rows: [{ item: "x" }], ranked: [{ item: "x" }], tieRationale: "t" },
  recommend: { recommendations: [{ action: "a", control: "A.5.9", owner: "CISO" }] },
  validate: { findings: [{ finding: "f", citation: "c" }] },
  schedule: { purpose: "p", agenda: "a", proposedTimes: ["Tue 10:00"], confirmation: "confirmed" },
  assess: { items: [{ item: "x", evidence: "e", rating: "3" }], domains: [{ name: "x" }] },
  score: { dimensions: [{ dimension: "d", score: 4, justification: "long enough reason" }], aggregate: "4.00", scores: { d: 4 }, notes: { d: "n" } },
  compile: { sections: ["1 · Executive summary"], executiveSummary: "e", sectionList: [{ title: "1" }] },
  brief: { audience: "Board", keyMessage: "m", ask: "a", format: "deck" },
  signoff: { decision: "Approved", conditions: "none", revisionPlan: "n/a", date: "2026-07-30" },
  interview: { questions: ["q"], notesPerQuestion: { q: "n" } },
  document: { sections: "1: body", sectionList: [{ title: "1" }], crossReferences: ["A.5.9"], ready: true },
  rua: { steps: { s1: true }, objectiveMet: true },
  research: { methods: { m1: {} }, include: ["m1"], decl: true, objectiveMet: true },
};

// The same 22 workspaces on first render, before the mentee has touched anything. Every legacy
// workspace lifts its scripted/given data (asset names, section headings, the deck, the findings
// list) alongside the mentee's fields, so "some lifted value is non-empty" is NOT a completion
// signal — `ready: false` is. Keys copied verbatim from each workspace's initial state.
const UNTOUCHED: Record<string, Record<string, unknown>> = {
  request: { to: "", subject: "", purpose: "", items: ["", "", ""], ready: false },
  conduct: { stakeholder: "Compliance Lead", questionsAnswered: "5 / 5", findings: "", ready: false },
  record: { register: [{ name: "orders-db (RDS)", type: "Database", owner: "", c: "", i: "", a: "", loc: "AWS us-east-1", rationale: "" }], ready: false },
  apply: { items: [{ name: "orders-db (RDS)", contains: "Order PII + email", classification: "", rationale: "" }], ready: false },
  crossref: { method: "", gapNote: "", discrepancyClass: "", discrepancies: [], ready: false },
  identify: { flags: [], ready: false },
  review: { coverNote: "", revisionNo: "2", priorFeedbackAddressed: "0 / 5", priorFeedback: [{ id: 1, text: "Scope statement needs a line on excluded systems.", done: false }], ready: false },
  present: { deckLink: "ISMS Scope (May 2026).pptx · 8 slides", anticipatedQuestions: [{ q: "", a: "" }, { q: "", a: "" }, { q: "", a: "" }], signoffDecision: "", decisionDate: "", ready: false },
  draft: { docTitle: "Information Classification Policy", sections: "1 · Purpose: \n2 · Scope: ", sectionList: [{ id: "purpose", title: "1 · Purpose", content: "" }], standardsCited: [""], ready: false },
  map: { cells: {}, mappings: [], ready: false },
  calculate: { formula: "Residual = L × I × (1 − ControlEff/4)", inputs: "L=0; I=0; ControlEff=0", inputValues: { likelihood: 0, impact: 0, controlEff: 0 }, citations: { likelihood: "", impact: "", controlEff: "" }, working: "", result: "0.0", ready: false },
  prioritise: { rows: [{ id: 1, name: "Missing audit log on orders-db", lik: 0, imp: 0, vel: 0, exp: 0 }], ranked: [{ item: "Missing audit log on orders-db", criterion: "0.00", rank: 1 }], tieRationale: "", ready: false },
  recommend: { recommendations: [{ id: 1, gap: "Missing per-record audit log", action: "", owner: "", control: "", rationale: "" }], ready: false },
  validate: { findings: [{ id: 1, text: "orders-db lacks per-record audit log", citation: "", verified: null, followup: "" }], ready: false },
  schedule: { purpose: "", agenda: "", proposedTimes: ["Tue 2026-07-02 · 10:00"], confirmation: "", ready: false },
  assess: { items: [{ item: "Access Control", evidence: "", rating: "1 Initial" }], domains: [{ id: "ac", name: "Access Control", score: 1, evidence: "", outlier: false }], ready: false },
  score: { dimensions: [{ dimension: "Specificity", score: 0, justification: "" }], aggregate: "0.00", scores: { spec: 0 }, notes: { spec: "" }, ready: false },
  compile: { sections: ["1 · Executive summary", "2 · Scope statement"], executiveSummary: "", sectionList: [{ id: "scope", title: "2 · Scope statement", required: true, refs: [] }], ready: false },
  brief: { audience: "", keyMessage: "", ask: "", format: "page", ready: false },
  signoff: { decision: "", conditions: "", revisionPlan: "", date: "", ready: false },
  interview: { questions: ["", "", "", "", ""], notesPerQuestion: "", ready: false },
  document: { sections: "1 · Context: \n2 · Decision: ", sectionList: [{ id: "context", title: "1 · Context", done: false, content: "" }], crossReferences: [], ready: false },
};

const ALL = { ...VERBS, ...GATE_VERBS };

for (const [id, verb] of Object.entries(ALL)) {
  const values = DONE[id];
  assert.ok(values, `no completed-workspace sample for verb "${id}"`);
  const states = checklistStates(verb.layer1, values);
  assert.equal(
    states.filter(Boolean).length,
    verb.layer1.length,
    `${id}: only ${states.filter(Boolean).length}/${verb.layer1.length} met on a completed workspace — untickable: ${verb.layer1.filter((_, i) => !states[i]).join(" | ")}`,
  );
}

// An empty / unstarted workspace must not tick anything.
for (const [id, verb] of Object.entries(ALL))
  assert.equal(checklistStates(verb.layer1, {}).filter(Boolean).length, 0, `${id}: ticks on an empty workspace`);

// An untouched workspace must never read as a finished deliverable — it once did, because the
// scripted/given data it lifts satisfied "every lifted value has content", so the checklist went
// fully green and Submit stayed enabled on work the mentee had not started.
for (const [id, verb] of Object.entries(VERBS)) {
  const values = UNTOUCHED[id];
  assert.ok(values, `no untouched-workspace sample for verb "${id}"`);
  assert.equal(values.ready, false, `${id}: untouched workspace does not lift ready:false — Submit is not gated`);
  const states = checklistStates(verb.layer1, values);
  assert.ok(
    states.some((s) => !s),
    `${id}: every acceptance criterion reads as met on an untouched workspace`,
  );
}

// A guided workspace mid-flow (objectiveMet false) still ticks the criteria it can already tie to input.
const midConduct = checklistStates(VERBS.conduct.layer1, { roleAgent: "Process Owner", openingId: "o1", objectiveMet: false });
assert.deepEqual(midConduct, [false, true, false], "conduct mid-flow should tick only the named-stakeholder check");

// isFilled: a false flag and an all-blank table are not content.
assert.equal(isFilled(false), false);
assert.equal(isFilled([{ a: "", b: "" }]), false);
assert.equal(isFilled([{ a: "", b: "x" }]), true);

console.log("checklist: ok");
