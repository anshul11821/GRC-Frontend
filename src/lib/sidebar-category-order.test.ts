// Run: npx tsx src/lib/sidebar-category-order.test.ts
//
// The desk sidebar groups an organisation's tasks by method category. Progression unlocks tasks in
// tree order, so the ONLY safe order for those groups is the order their first task appears in —
// the same rule `regroup_orgs` applies to organisations server-side.
//
// This used to sort the groups by METHOD_CATEGORY_ORDER (the 16-entry display taxonomy), which has
// nothing to do with unlock order.
//
// WHY THE ROTATION MAKES THIS EXHAUSTIVELY CHECKABLE. `variant._org_index_for` cuts the 35 tasks
// into ENGAGEMENTS_PER_LEARNER (8) CONTIGUOUS blocks of the catalogue order and hands each block to
// one organisation drawn from the learner's own selection of the 17-org pool. Which organisation
// gets a block varies per learner — C(17,8) x 8! rotations — but the block MEMBERSHIP is identical
// for everyone, and each organisation receives exactly one block (the selection is distinct). So a
// placement is always one contiguous slice of the catalogue, and asserting over the 8 blocks covers
// every learner and every rotation.
//
// Two of those eight blocks were wrong for EVERY learner: block 2 pushed PE-001 to 4th of 5, and
// block 6 pushed TPRM-002 to 4th of 4. That is 25% of all placements.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TASK_META, METHOD_CATEGORY_ORDER } from "./taskmeta";

const SRC = readFileSync(join(import.meta.dirname, "../components/app/desk-sidebar.tsx"), "utf8");

// The taxonomy must not drive the group order in this file at all. It is a label list.
assert.ok(
  !/const cats\s*=[\s\S]{0,200}METHOD_CATEGORY_ORDER\.indexOf/.test(SRC),
  "desk-sidebar orders category groups by METHOD_CATEGORY_ORDER — that reorders the programme on " +
    "screen relative to the order progression actually unlocks it.",
);
assert.match(SRC, /const cats = \[\.\.\.byCat\.keys\(\)\];/, "category groups must keep insertion order");

/** Exactly what the sidebar does: group by category, emit groups in first-task order. */
function sidebarOrder(codes: string[]): string[] {
  const byCat = new Map<string, string[]>();
  for (const c of codes) {
    const cat = TASK_META[c]?.methodCategory ?? "Other";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(c);
  }
  return [...byCat.keys()].flatMap((k) => byCat.get(k)!);
}

// The catalogue order progression unlocks in. Mirrors backend `variant._task_order()`.
const TASK_ORDER = [
  "AA-001", "CRM-002", "CRM-003", "SPA-001", "TV-001",
  "CA-002", "RR-001", "BCRP-002", "TPRM-001",
  "PE-001", "QA-002", "AA-003", "CRM-001", "DD-001",
  "SPA-002", "CA-001", "LRC-001", "KT-001",
  "AA-002", "GRM-002", "GRM-003", "DD-002",
  "IE-001", "IE-002", "MM-001", "CA-003", "BCRP-001",
  "TPRM-002", "GRM-001", "DD-003", "TV-002",
  "MM-002", "PE-002", "QA-001", "KT-002",
];
const ENGAGEMENTS_PER_LEARNER = 8;

assert.equal(TASK_ORDER.length, 35, "catalogue is 35 tasks");
assert.equal(new Set(TASK_ORDER).size, 35, "no duplicate task codes");
for (const c of TASK_ORDER) assert.ok(TASK_META[c], `TASK_META is missing ${c}`);

/** The contiguous block a task position falls in — mirrors `position * blocks // len(order)`. */
const blockOf = (i: number) => Math.floor((i * ENGAGEMENTS_PER_LEARNER) / TASK_ORDER.length);

const blocks: string[][] = Array.from({ length: ENGAGEMENTS_PER_LEARNER }, () => []);
TASK_ORDER.forEach((code, i) => blocks[blockOf(i)].push(code));

// EVERY placement any learner can ever receive, in any of the C(17,8) x 8! rotations.
for (const [b, codes] of blocks.entries()) {
  assert.ok(codes.length > 0, `block ${b} is empty — the block maths has drifted`);
  assert.deepEqual(
    sidebarOrder(codes),
    codes,
    `block ${b} renders out of unlock order: ${sidebarOrder(codes).join(" -> ")} ` +
      `instead of ${codes.join(" -> ")}`,
  );
  // The guarantee that actually matters to a learner: the task they can start is shown first.
  assert.equal(sidebarOrder(codes)[0], codes[0], `block ${b} does not lead with its current task`);
}

// Categories never interleave inside a block — a category's tasks are always a contiguous run, so
// grouping cannot reorder anything. This is a property of the catalogue, not of the sidebar; if a
// task is reordered or recategorised it can stop holding, and then grouping itself is the problem.
for (const [b, codes] of blocks.entries()) {
  const seen = new Map<string, number>();
  codes.forEach((c, i) => {
    const cat = TASK_META[c]?.methodCategory ?? "Other";
    const prev = seen.get(cat);
    assert.ok(
      prev === undefined || prev === i - 1,
      `block ${b}: category "${cat}" is split across non-adjacent tasks, so grouping by category ` +
        `cannot preserve unlock order. Either restore contiguity in the catalogue, or drop the ` +
        `grouping in favour of a flat list.`,
    );
    seen.set(cat, i);
  });
}

// The two blocks the taxonomy sort broke, pinned by name so a regression is legible.
const taxonomyOrder = (codes: string[]) => {
  const byCat = new Map<string, string[]>();
  for (const c of codes) {
    const cat = TASK_META[c]?.methodCategory ?? "Other";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(c);
  }
  const idx = (c: string) => (METHOD_CATEGORY_ORDER.indexOf(c) === -1 ? 999 : METHOD_CATEGORY_ORDER.indexOf(c));
  return [...byCat.keys()].sort((a, z) => idx(a) - idx(z)).flatMap((k) => byCat.get(k)!);
};
assert.notDeepEqual(taxonomyOrder(blocks[2]), blocks[2], "block 2 was the reported LearnTech case");
assert.notDeepEqual(taxonomyOrder(blocks[6]), blocks[6], "block 6 was the second broken block");
assert.equal(taxonomyOrder(blocks[2])[0], "AA-003", "old behaviour hoisted AA-003 above PE-001");

console.log(
  `sidebar-category-order.test.ts: all assertions passed ` +
    `(${blocks.length} blocks = every placement in every rotation)`,
);
