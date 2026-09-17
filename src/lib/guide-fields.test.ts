// Run: npx tsx src/lib/guide-fields.test.ts
//
// The failure this catches is silent by construction. The Guide's field walk finds its targets with
// `document.querySelector('[data-guide="<key>"]')`, and every one of those steps is `optional` —
// so a key with no anchor does not throw, does not warn, and does not even pause: the step is
// skipped and the mentee is walked past the field the step existed to explain. Rename a field, move
// a panel, or mistype a key, and the walk quietly gets shorter.
//
// So: every verb has a walk, every key in it is anchored in a workspace, and no anchor is left
// stranded with nothing pointing at it.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { FIELD_GUIDE, fieldGuide } from "./guide-fields";
import { VERBS, GATE_VERBS } from "./verbs";

const ALL = { ...VERBS, ...GATE_VERBS };
const dir = join(import.meta.dirname, "../components/app/workspaces");
const source = readdirSync(dir)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => readFileSync(join(dir, f), "utf8"))
  .join("\n");

/** Anchors as written in the workspaces: `data-guide="to"` and the templated `` `f:${f.key}` ``. */
const literal = new Set([...source.matchAll(/data-guide="([^"]+)"/g)].map((m) => m[1]));
/** Templated anchors — `data-guide={`f:${f.key}`}` — contribute their prefix, since the suffix is
 *  a field key from the workspace's own table and cannot be read out of the source text. */
const prefixes = [...source.matchAll(/data-guide=\{`([^$]*)\$\{/g)].map((m) => m[1]);
const anchored = (key: string) => literal.has(key) || prefixes.some((p) => p && key.startsWith(p));

for (const [id, verb] of Object.entries(ALL)) {
  const walk = fieldGuide(id);
  assert.ok(walk.length > 0, `verb "${id}" (${verb.label}) has no field walk — the Guide stops at the deliverable`);

  const seen = new Set<string>();
  for (const f of walk) {
    assert.ok(anchored(f.key), `verb "${id}": no data-guide="${f.key}" in any workspace — that step would be skipped in silence`);
    assert.ok(!seen.has(f.key), `verb "${id}": "${f.key}" is walked twice`);
    seen.add(f.key);
    assert.ok(f.title.trim().length > 0 && f.body.trim().length > 30, `verb "${id}": "${f.key}" has no real guidance`);
    // The walk explains what a field is for. The moment it contains the answer, the step stops
    // grading the mentee's judgment and starts grading their reading.
    assert.ok(!/^the answer is/i.test(f.body), `verb "${id}": "${f.key}" gives the answer away`);
  }
}

// Nothing anchored for nothing: an orphan means either a walk step was deleted and its anchor left
// behind, or one was added to the markup and never written up.
const used = new Set(Object.values(FIELD_GUIDE).flat().map((f) => f.key));
for (const key of literal)
  assert.ok(used.has(key), `data-guide="${key}" is in a workspace but no verb walks it`);

console.log(
  `guide-fields: ok — ${Object.keys(ALL).length} verbs, ` +
    `${Object.values(FIELD_GUIDE).reduce((n, w) => n + w.length, 0)} guided fields, every one anchored`,
);
