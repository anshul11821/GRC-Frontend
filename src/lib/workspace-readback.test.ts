// Run: npx tsx src/lib/workspace-readback.test.ts
//
// WORKSPACE_READS says which payload keys each verb's workspace can restore from. Two ways it goes
// wrong, both silent:
//   - a verb missing from the map: every submission for it is treated as readable, and the learner
//     gets a blank workspace under "This is the work you submitted";
//   - a key that no workspace reads any more (renamed state, rewritten flow): the map says the
//     payload fits when nothing will load, which is the same blank screen.
// So: every verb is covered, and every key is one the workspace source actually reads.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VERBS, GATE_VERBS } from "./verbs";
import { WORKSPACE_READS, fitsWorkspace } from "./workspace-readback";

const SOURCES = [
  "src/components/app/workspaces/set-a.tsx",
  "src/components/app/workspaces/set-b.tsx",
  "src/components/app/workspaces/set-c.tsx",
  "src/components/app/workspaces/rua-gate.tsx",
  "src/components/app/workspaces/research-gate.tsx",
].map((f) => readFileSync(f, "utf8")).join("\n");

for (const id of [...Object.keys(VERBS), ...Object.keys(GATE_VERBS)]) {
  assert.ok(
    WORKSPACE_READS[id],
    `verb "${id}" has no entry in WORKSPACE_READS — its submissions would be assumed readable, ` +
      `and a payload the workspace cannot load would render as an empty workspace.`,
  );
}

for (const [verb, keys] of Object.entries(WORKSPACE_READS)) {
  assert.ok(keys.length > 0, `WORKSPACE_READS["${verb}"] is empty`);
  for (const key of keys) {
    // The workspace reads a key either through seed(value, "key"), through a helper that names it
    // (savedRows' ["rows", "register"]), or as a field of the restored progress object.
    const read =
      new RegExp(`seed(<[^>]*>)?\\(\\s*value\\s*,\\s*"${key}"`).test(SOURCES) ||
      new RegExp(`value\\s*\\[\\s*"${key}"\\s*\\]`).test(SOURCES) ||
      new RegExp(`"${key}"`).test(SOURCES) ||
      new RegExp(`\\b${key}\\s*:`).test(SOURCES);
    assert.ok(read, `WORKSPACE_READS["${verb}"] lists "${key}", which no workspace source mentions`);
  }
}

// The predicate itself: a key that is present but empty is not work to read back.
assert.equal(fitsWorkspace("apply", { outcomes: { 1: "Public" } }), true);
assert.equal(fitsWorkspace("apply", { outcomes: {}, notes: {} }), false);
assert.equal(fitsWorkspace("apply", { rows: [{ a: 1 }], summary: "x" }), false, "a generic payload does not fit Apply");
assert.equal(fitsWorkspace("record", { rows: [{ a: 1 }] }), true);
assert.equal(fitsWorkspace("conduct", { openingId: "op1" }), true);
assert.equal(fitsWorkspace("conduct", { objectiveMet: true }), false);
assert.equal(fitsWorkspace("map", { cells: { a: 1 }, mappings: [] }), false, "legacy map payload no longer fits");
assert.equal(fitsWorkspace("someNewVerb", { anything: 1 }), true, "unknown verbs are not accused of losing work");

console.log(
  `workspace-readback: ok — ${Object.keys(WORKSPACE_READS).length} verbs mapped, ` +
    `every key read by a workspace`,
);
