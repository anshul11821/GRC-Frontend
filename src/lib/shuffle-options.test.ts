// Run: npx tsx src/lib/shuffle-options.test.ts
// Every scripted round is authored correct-first; the display shuffle must break that pattern so a
// mentee can't pass by always clicking the top option.
import assert from "node:assert/strict";
import { REQUEST_CONVERSATIONS, shuffleOptions } from "./request-conversations";
import { CONDUCT_TASKS } from "./conduct-tasks";
import { PRESENT_TASKS } from "./present-tasks";

type Opt = { text: string; correct: boolean };
const sets: { where: string; options: Opt[] }[] = [];

for (const [key, conv] of Object.entries(REQUEST_CONVERSATIONS))
  for (const t of Object.values(conv.threads))
    t.rounds.forEach((r, i) => sets.push({ where: `request ${key}/${t.mood}#${i}`, options: r.options }));

for (const [reg, tasks] of [["conduct", CONDUCT_TASKS], ["present", PRESENT_TASKS]] as const)
  for (const [key, task] of Object.entries(tasks)) {
    sets.push({ where: `${reg} ${key}/openings`, options: task.openings });
    for (const t of Object.values(task.threads))
      t.rounds.forEach((r, i) => sets.push({ where: `${reg} ${key}/${t.mood}#${i}`, options: r.options }));
  }

assert.ok(sets.length > 100, `only found ${sets.length} option sets — registries not loaded?`);

let correctFirst = 0;
for (const s of sets) {
  const shuffled = shuffleOptions(s.options);
  assert.equal(shuffled.length, s.options.length, `${s.where}: shuffle dropped options`);
  assert.deepEqual(
    [...shuffled].sort((a, b) => a.text.localeCompare(b.text)),
    [...s.options].sort((a, b) => a.text.localeCompare(b.text)),
    `${s.where}: shuffle changed the option set`,
  );
  // Stable: same input must give the same order (re-renders keep the round in place).
  assert.deepEqual(shuffleOptions(s.options), shuffled, `${s.where}: shuffle is not deterministic`);
  assert.equal(s.options.filter((o) => o.correct).length, 1, `${s.where}: not exactly one correct option`);
  if (shuffled[0].correct) correctFirst++;
}

// With ~1/3 expected by chance, anything near 100% means the shuffle isn't reaching the UI.
const pct = correctFirst / sets.length;
assert.ok(pct < 0.5, `correct option lands first in ${(pct * 100).toFixed(0)}% of ${sets.length} rounds`);

console.log(`ok — ${sets.length} option sets, correct-first ${(pct * 100).toFixed(0)}%`);
