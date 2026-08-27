// Run: npx tsx src/lib/sidebar-category-order.test.ts
//
// The desk sidebar groups an organisation's tasks by method category. Progression unlocks tasks in
// tree order, so the ONLY safe order for those groups is the order their first task appears in —
// the same rule `regroup_orgs` applies to organisations server-side.
//
// This used to sort the groups by METHOD_CATEGORY_ORDER (the 16-entry taxonomy), which has nothing
// to do with unlock order. A learner whose first unlocked task sat in a late category saw locked
// categories stacked above the one task they could start: for LearnTech Educational Solutions the
// programme unlocked PE-001 first, and the sidebar showed Assessment and Analysis, Compliance and
// Regulatory Management and Design and Development above it, because Project Execution is 14th of
// 16 in the taxonomy.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = readFileSync(join(import.meta.dirname, "../components/app/desk-sidebar.tsx"), "utf8");

// The taxonomy must not drive the group order in this file at all. It is a display label list.
assert.ok(
  !/const cats\s*=[\s\S]{0,200}METHOD_CATEGORY_ORDER\.indexOf/.test(SRC),
  "desk-sidebar orders category groups by METHOD_CATEGORY_ORDER — that reorders the programme on " +
    "screen relative to the order progression actually unlocks it.",
);

// Insertion order is the contract: `tasks` arrives in unlock order and Map preserves it.
assert.match(SRC, /const cats = \[\.\.\.byCat\.keys\(\)\];/, "category groups must keep insertion order");

/** The grouping the sidebar performs, extracted so the ordering property can be asserted. */
function groupInUnlockOrder(tasks: { code: string; cat: string }[]): string[] {
  const byCat = new Map<string, string[]>();
  for (const t of tasks) {
    if (!byCat.has(t.cat)) byCat.set(t.cat, []);
    byCat.get(t.cat)!.push(t.code);
  }
  return [...byCat.keys()].flatMap((c) => byCat.get(c)!);
}

// The real LearnTech placement that surfaced the bug: one task per category, unlocking PE-001 first.
const learnTech = [
  { code: "PE-001", cat: "Project Execution" },
  { code: "QA-002", cat: "Quality Assurance" },
  { code: "AA-003", cat: "Assessment and Analysis" },
  { code: "CRM-001", cat: "Compliance and Regulatory Management" },
  { code: "DD-001", cat: "Design and Development" },
];
assert.deepEqual(
  groupInUnlockOrder(learnTech),
  ["PE-001", "QA-002", "AA-003", "CRM-001", "DD-001"],
  "the first unlocked task must be shown first",
);

// One task per category is the easy case. Grouping can still interleave when a category holds two
// tasks that are not adjacent in unlock order — the group takes its FIRST task's position, which is
// the intended trade-off: grouping is kept, and no locked group is ever hoisted above the current
// task.
const interleaved = [
  { code: "A-001", cat: "Assessment and Analysis" },
  { code: "B-001", cat: "Design and Development" },
  { code: "A-002", cat: "Assessment and Analysis" },
];
assert.deepEqual(groupInUnlockOrder(interleaved), ["A-001", "A-002", "B-001"]);
assert.equal(groupInUnlockOrder(interleaved)[0], "A-001", "the current task still leads");

console.log("sidebar-category-order.test.ts: all assertions passed");
