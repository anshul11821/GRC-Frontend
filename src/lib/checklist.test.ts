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
  document: { sections: "1: body", sectionList: [{ title: "1" }], crossReferences: ["A.5.9"] },
  rua: { steps: { s1: true }, objectiveMet: true },
  research: { methods: { m1: {} }, include: ["m1"], decl: true, objectiveMet: true },
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

// A guided workspace mid-flow (objectiveMet false) still ticks the criteria it can already tie to input.
const midConduct = checklistStates(VERBS.conduct.layer1, { roleAgent: "Process Owner", openingId: "o1", objectiveMet: false });
assert.deepEqual(midConduct, [false, true, false], "conduct mid-flow should tick only the named-stakeholder check");

// isFilled: a false flag and an all-blank table are not content.
assert.equal(isFilled(false), false);
assert.equal(isFilled([{ a: "", b: "" }]), false);
assert.equal(isFilled([{ a: "", b: "x" }]), true);

console.log("checklist: ok");
