// Run: npx tsx src/lib/rua-engine.test.ts
// The gate's failure feedback must name the mistake the mentee actually made — telling someone
// "a decoy slipped in" when they simply under-ticked sends them hunting for the wrong error.
import assert from "node:assert/strict";
import { inspectMiss, gradeExplain, inspectExercise, lockSteps } from "./rua-engine";
import type { RuaTask } from "./rua-tasks";

// AA-001's real shape: one template with fields, one without — so the within-task decoy pool is
// empty and the exercise used to render with every box correct (select-all passed).
const assetRegister: Pick<RuaTask, "templates"> = {
  templates: [
    { name: "Information Asset Register Template", purpose: "Record every information asset", fmt: "sheet", fields: ["Asset ID", "Asset Name", "Asset Type", "Owner", "Location", "Format", "CIA Classification", "Custodian", "Review Date", "Notes"] },
    { name: "Asset Discovery Interview Guide", purpose: "Structure the discovery interviews", fmt: "doc", fields: [] },
  ],
};
const ex = inspectExercise(assetRegister as RuaTask, "AA-001", 0);
assert.equal(ex.kind, "columns");
if (ex.kind === "columns") {
  const wrong = ex.picks.filter((p) => !p.belongs);
  assert.ok(wrong.length >= 2, "an exercise with nothing wrong to leave unticked cannot be failed");
  // select-all must fail, or the gate checks nothing
  assert.ok(inspectMiss(ex.picks, Object.fromEntries(ex.picks.map((_, i) => [i, true]))) !== null);
  // the authored fields must all still be correct
  assert.equal(inspectMiss(ex.picks, Object.fromEntries(ex.picks.map((p, i) => [i, p.belongs]))), null);
}
// no fields → purpose match, never a columns exercise
assert.equal(inspectExercise(assetRegister as RuaTask, "AA-001", 1).kind, "purpose");


const picks = [{ belongs: true }, { belongs: true }, { belongs: false }, { belongs: false }];

// all right → no message, the exercise passes
assert.equal(inspectMiss(picks, { 0: true, 1: true }), null);
assert.equal(inspectMiss(picks, { 0: true, 1: true, 2: false }), null);

// under-ticked only (the reported bug): never blames decoys
const under = inspectMiss(picks, { 0: true })!;
assert.match(under, /unticked/);
assert.doesNotMatch(under, /decoy|belong/);

// nothing ticked at all is the same error, not a decoy complaint
assert.match(inspectMiss(picks, {})!, /2 fields are still unticked/);

// decoy ticked only
const decoy = inspectMiss(picks, { 0: true, 1: true, 2: true })!;
assert.match(decoy, /1 decoy is ticked/);
assert.doesNotMatch(decoy, /unticked/);

// both errors → both named
const both = inspectMiss(picks, { 0: true, 3: true })!;
assert.match(both, /doesn't belong/);
assert.match(both, /unticked/);

// A concept card can fail on the average with no single dimension below 2 — that used to show
// "Below threshold — re-queued" with no reason at all.
const g = gradeExplain(
  "Risk here means how much loss the business is prepared to carry before leaders must step in and change course",
  "CloudTech reviews it quarterly",
  "Risk appetite and tolerance thresholds set by the board",
  "CloudTech Solutions Enterprise",
);
assert.equal(g.pass, false);
assert.ok(Math.min(...g.dims) >= 2, "fixture must keep every dimension at 2+");
assert.ok(g.reasons.length > 0, "a failed explanation must say why");

// Keyboard mash used to score 4/4 on "own words" — it copies nothing, after all — which is how a
// junk answer reached avg 1.5 instead of the floor.
const concept = "Information asset types: data, software, hardware, services, people and intangibles";
const junk = gradeExplain("n me kjn jnkm", "n me kjn jnkm", concept, "CloudTech Solutions Enterprise");
assert.equal(junk.pass, false);
assert.ok(junk.dims[1] <= 1, `own-words must not reward off-topic text (got ${junk.dims[1]})`);
assert.ok(!junk.reasons.some((r) => /copied/.test(r)), "gibberish did not copy anything");
// verbatim copying is still caught, and still called copying
const copied = gradeExplain(concept, concept, concept, "CloudTech Solutions Enterprise");
assert.equal(copied.pass, false);
assert.ok(copied.reasons.some((r) => /copied/.test(r)));

// Sequential steps: everything after the first unfinished step is shut.
const seq = lockSteps([{ done: true }, { done: false }, { done: false }, { done: true }]);
assert.deepEqual(seq.map((s) => s.locked), [false, false, true, false]);
//                                            ↑ done   ↑ current  ↑ shut   ↑ already finished, stays open
assert.deepEqual(lockSteps([{ done: false }, { done: false }]).map((s) => s.locked), [false, true]);
assert.deepEqual(lockSteps([{ done: true }, { done: true }]).map((s) => s.locked), [false, false]);

console.log("rua-engine: ok");
