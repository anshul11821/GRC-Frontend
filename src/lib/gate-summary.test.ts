// Run: npx tsx src/lib/gate-summary.test.ts
// The gate read-back must name WHICH control/step/concept an answer belongs to and keep the
// mentee's own words — the generic payload walker rendered `study: [{passed:true}]` and dropped
// every label, which is the whole reason this exists.
import assert from "node:assert/strict";
import { gateSummary } from "./gate-summary";
import type { RuaTask } from "./rua-tasks";

const task = {
  org: "Northwind Ltd", standard: "ISO/IEC 27001", objective: "Build the asset register",
  controls: [{ ref: "A.5.9", name: "Inventory of information assets" }],
  crosswalk: [], templates: [{ name: "Asset Register Template", purpose: "Record assets", fmt: "sheet", fields: [] }],
  acquire: [{ type: "template", label: "Asset Register Template" }],
  steps: [{ verb: "Identify", text: "List every information asset" }],
  deliverable: "Information Asset Register", acceptance: "Complete and owned",
  concepts: ["Information asset"], questions: ["Why does ownership matter?"],
} as RuaTask;

const rua = gateSummary("rua", {
  study: [{ passed: true, attempts: 2 }],
  inspect: [true],
  acquire: [true],
  contextAck: true,
  clarify: [{ state: "understood", paraphrase: "I list what the org holds and who owns it." }],
  confirm: { produce: "An asset register", acceptWhen: "Every asset has an owner", boundaries: { 0: "in" }, accepted: true },
  explain: [{ passed: true, attempts: 1, score: 3.5, explain: "Anything with value to the org.", example: "Northwind's CRM database." }],
  answer: [{ outcome: "pass", answer: "Ownership drives accountability.", fu: "The CRM owner is the sales director." }],
  answerDone: true,
  attest: { signature: "Ada Lovelace", decision: "READY", at: "2026-08-17T09:00:00.000Z" },
  objectiveMet: true,
}, "AA-001", task);

assert.ok(rua, "a RUA payload gets the gate read-back, not the generic walker");
const text = rua!.map(([l, t]) => `${l}\n${t}`).join("\n");
for (const must of [
  "A.5.9", "Inventory of information assets", "(2 attempts)",   // control labelled, not `passed: Yes`
  "Asset Register Template",
  "Identify — List every information asset", "I list what the org holds",
  "An asset register", "Every asset has an owner",
  "Information asset", "Northwind's CRM database", "3.5/4",
  "Why does ownership matter?", "Ownership drives accountability", "[pass]",
  "READY", "Ada Lovelace",
]) assert.ok(text.includes(must), `read-back is missing ${JSON.stringify(must)}`);

// Positional arrays with no task bundle still read back — labels degrade, answers survive.
const noBundle = gateSummary("rua", { explain: [{ passed: false, attempts: 1, score: 1, explain: "A thing.", example: "" }] }, "AA-001");
assert.ok(noBundle![0][1].includes("Concept 1") && noBundle![0][1].includes("A thing."));

const rs = gateSummary("research", {
  methods: {
    contextual: { findings: "Northwind is a wholesaler.", soWhat: "The register leads with stock data.", sources: [{ type: "Standard", title: "ISO/IEC 27001 A.5.9", link: "" }] },
    horizon: { findings: "NIS2 lands next year.", soWhat: "Review cycle shortened." },
    benchmark: { findings: "Peers register assets quarterly.", soWhat: "Quarterly review it is." },
  },
  include: { benchmark: true },
  decl: { own: true, org: true, probe: false },
}, "AA-001");

const rsText = rs!.map(([l, t]) => `${l}\n${t}`).join("\n");
assert.ok(rsText.includes("Contextual Analysis") && rsText.includes("Northwind is a wholesaler."));
assert.ok(rsText.includes("Standard — ISO/IEC 27001 A.5.9"), "sources are cited back");
assert.ok(rsText.includes("Benchmarking · optional, included") || rsText.includes("· optional, included"), "an included optional method is labelled as one");
assert.ok(!rsText.includes("Cross-walk"), "a method the mentee never included is not read back");
assert.ok(rsText.includes("✓ Findings are specific") && rsText.includes("— The mentor may probe"), "the declaration shows what was and wasn't ticked");

// Anything that isn't a gate falls through to the desk's generic renderer.
assert.equal(gateSummary("identify", { assets: ["CRM"] }, "AA-001", task), null);
assert.equal(gateSummary("rua", {}, "AA-001", task), null);

console.log("gate-summary: ok");
