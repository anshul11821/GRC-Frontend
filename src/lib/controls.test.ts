// Run: npx tsx src/lib/controls.test.ts
import assert from "node:assert/strict";
import { CONTROLS_BY_TASK } from "./controls";
import { RUA_TASKS } from "./rua-tasks";

const codes = Object.keys(RUA_TASKS);
assert.equal(codes.length, 35);

for (const code of codes) {
  const reg = CONTROLS_BY_TASK[code];
  assert.ok(reg, `${code}: no register`);
  assert.ok(reg.controls.length > 0, `${code}: empty register`);
  for (const c of reg.controls) {
    assert.ok(c.num, `${code}: control with blank ref — ${c.name}`);
    assert.ok(c.name, `${code}: control ${c.num} has no name`);
    assert.ok(c.domain !== undefined, `${code}: ${c.num} has no domain`);
    // Every primary-standard control needs a description; NIST cross-walk rows use `name` as theirs.
    if (c.standard !== "NIST CSF 2.0" || RUA_TASKS[code].standard.startsWith("NIST")) {
      assert.ok(c.purpose, `${code}: no purpose for ref "${c.num}" — add it to PURPOSE in controls.ts`);
    }
  }
}
console.log(`ok — ${codes.length} tasks, ${Object.values(CONTROLS_BY_TASK).reduce((n, r) => n + r.controls.length, 0)} controls, all described`);
