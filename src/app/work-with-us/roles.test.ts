// Run: npx tsx src/app/work-with-us/roles.test.ts
// The recruitment page's reviewer positions must match the backend's reviewer-role vocabulary
// exactly. The apply form submits the role *title* as the position applied for, and a mentor
// account is only created with a role that validates against backend/app/seed/build_gates.py
// ROLES — so a drifted title here means an approved reviewer cannot be given the seat they
// applied for, and nobody finds out until onboarding.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROLES } from "./page";

const seed = JSON.parse(
  readFileSync(join(import.meta.dirname, "../../../../backend/_seed/grc101_gates.json"), "utf8"),
) as { roles: { code: string; name: string; nice: string }[]; gates: Record<string, { reviewer_role: string; task_code: string; tier: string }> };

const pageTitles = ROLES.map((r) => r.title).sort();
const seedNames = seed.roles.map((r) => r.name).sort();
assert.deepEqual(pageTitles, seedNames, "reviewer role titles drifted from the backend vocabulary");

const niceBySeedName = new Map(seed.roles.map((r) => [r.name, r.nice]));
for (const role of ROLES) {
  assert.equal(role.code, niceBySeedName.get(role.title), `${role.title}: NICE work role mismatch`);
}

// The advertised load has to be the real load, or applicants are recruited on a false prospectus.
// v3 dropped per-gate time budgets, so the honest figures are gate and task counts plus how many
// of them actually reach a human — everything else would be invented.
const gates = Object.values(seed.gates);
for (const role of ROLES) {
  const mine = gates.filter((g) => g.reviewer_role === role.title);
  const [shownGates, shownTasks] = role.gates.match(/\d+/g)!.map(Number);
  assert.equal(shownGates, mine.length, `${role.title}: page says ${role.gates}, register has ${mine.length}`);
  assert.equal(shownTasks, new Set(mine.map((g) => g.task_code)).size, `${role.title}: task count wrong`);
  assert.equal(
    Number(role.reviewed),
    mine.filter((g) => g.tier !== "T3").length,
    `${role.title}: reviewed-gate count wrong`,
  );
}
// Every gate is decided by exactly one reviewer — no gate may be left unowned.
assert.equal(gates.length, 70);
assert.ok(gates.every((g) => ROLES.some((r) => r.title === g.reviewer_role)), "a gate has no seat");

console.log(`reviewer roles OK — ${ROLES.length} positions match the gate register`);
