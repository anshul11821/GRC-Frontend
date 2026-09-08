// Run: npx tsx src/lib/controls.test.ts
import assert from "node:assert/strict";
import { CONTROLS_BY_TASK } from "./controls";
import { TASK_CONTROL_DATA } from "./task-controls";

const codes = Object.keys(TASK_CONTROL_DATA);
assert.equal(codes.length, 35);

for (const code of codes) {
  const reg = CONTROLS_BY_TASK[code];
  assert.ok(reg, `${code}: no register`);
  assert.ok(reg.controls.length > 0, `${code}: empty register`);
  for (const c of reg.controls) {
    assert.ok(c.num, `${code}: control with blank ref — ${c.name}`);
    assert.ok(c.name, `${code}: control ${c.num} has no name`);
    assert.ok(c.domain !== undefined, `${code}: ${c.num} has no domain`);
    // EVERY control needs a plain-terms description, cross-walk rows included. They used to be
    // exempt and rendered as a bare title, which is the one thing the reference panel is for.
    assert.ok(c.purpose, `${code}: no purpose for ref "${c.num}" — add it to PURPOSE in controls.ts`);

    // A cross-walk row must be attributed to the standard it actually comes from. Every row was
    // once stamped "NIST CSF 2.0" whatever its code, so `Control 11` — a CIS reference — rendered
    // under NIST's name. Silent, and exactly the mis-mapping the programme teaches against.
    if (/^Control\s/.test(c.num)) {
      assert.equal(c.standard, "CIS Controls v8", `${code}: "${c.num}" is a CIS ref labelled ${c.standard}`);
    }
    if (/^(GV|ID|PR|DE|RS|RC)\./.test(c.num)) {
      assert.equal(c.standard, "NIST CSF 2.0", `${code}: "${c.num}" is a CSF ref labelled ${c.standard}`);
    }
    // Extractor fragments ("and 11.4", "Functions") must never reach a card.
    assert.ok(!/^and\s/i.test(c.num), `${code}: unrepaired cross-walk fragment "${c.num}"`);
  }
}
console.log(`ok — ${codes.length} tasks, ${Object.values(CONTROLS_BY_TASK).reduce((n, r) => n + r.controls.length, 0)} controls, all described`);
