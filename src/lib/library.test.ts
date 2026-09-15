// Run: npx tsx src/lib/library.test.ts
import assert from "node:assert/strict";
import { LIBRARY, LIBRARY_BY_ID, covers, entriesOf, resolveRef, slugOf, summaryOf } from "./library";
import { CONTROLS_BY_TASK } from "./controls";

// The published structure of each standard. A dropped or duplicated item fails here, not on a
// learner's screen.
const count = (id: string, group?: string) =>
  entriesOf(LIBRARY_BY_ID[id]).filter((e) => !group || e.group.name === group || e.group.part.startsWith(group)).length;
assert.equal(count("iso27001", "Clauses"), 23);
assert.equal(count("iso27001", "Annex A"), 93);
assert.equal(count("iso27001", "Organizational controls"), 37);
assert.equal(count("iso27001", "People controls"), 8);
assert.equal(count("iso27001", "Physical controls"), 14);
assert.equal(count("iso27001", "Technological controls"), 34);
assert.equal(count("nistcsf"), 22);
assert.equal(count("cisv8"), 18);
assert.equal(entriesOf(LIBRARY_BY_ID.cisv8).reduce((n, e) => n + (e.item.count ?? 0), 0), 153);
assert.equal(count("soc2"), 61);
assert.deepEqual(entriesOf(LIBRARY_BY_ID.gdpr).map((e) => e.item.ref), Array.from({ length: 99 }, (_, i) => `Article ${i + 1}`));

for (const s of LIBRARY) {
  const slugs = entriesOf(s).map((e) => slugOf(e.item.ref));
  assert.equal(new Set(slugs).size, slugs.length, `${s.id}: duplicate item slug`);
  for (const { item } of entriesOf(s)) {
    assert.ok(summaryOf(item), `${s.id} ${item.ref}: no summary here or in PURPOSE`);
    // The wheel needs at least three spokes and has room for ten.
    if (item.points) assert.ok(item.points.length >= 3 && item.points.length <= 10, `${item.ref}: ${item.points.length} points`);
  }
}

// Matching must respect number boundaries.
assert.equal(covers("CIS 1", "Control 11"), false);
assert.equal(covers("Annex A 5.1", "Annex A 5.12"), false);
assert.equal(covers("CC1.1", "C1"), false);
assert.equal(covers("Article 5", "Article 5(1)(e)"), true);
assert.equal(covers("Article 14", "Article 13 & 14"), true);
assert.equal(covers("CC6.1", "CC1–CC9"), true);
assert.equal(covers("GV.OC", "GV.OC-02"), true);
assert.equal(covers("Clause 6.1", "Clause 6.1.2"), true);

// Every reference a task is graded against opens a library item, bar the ones that name a whole
// family or framework. RC.IM-01 is a CSF 1.1 subcategory: CSF 2.0 folded Improvements into ID.IM.
const WHOLE = new Set(["Annex A", "Functions", "Tiers 1–4", "Recital 39", "CC1–CC9", "A1", "C1", "RC.IM-01"]);
for (const [code, reg] of Object.entries(CONTROLS_BY_TASK))
  for (const c of reg.controls)
    if (!WHOLE.has(c.num)) assert.ok(resolveRef(c.num), `${code}: "${c.num}" opens no library item`);

console.log("library ok");
