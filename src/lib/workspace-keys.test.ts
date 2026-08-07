// Run: npx tsx src/lib/workspace-keys.test.ts
//
// Every workspace map is keyed "<taskCode>/<activityCode>", and the activity code half is easy to
// get wrong: the catalogue numbers activities two different ways. Nine tasks use "<n>.1".."<n>.8"
// (AA-001 is 1.1–1.8, AA-002 is 2.1–2.8, GRM-001 is 4.1–4.8) while the other 26 use a bare
// "1".."8". So "AA-002/3" and "BCRP-001/2.3" both look plausible and both silently resolve to
// undefined — the mentee gets a blank workspace instead of the scripted one, with no error.
//
// One check over every map, against the catalogue the backend actually serves.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { APPLY_TASKS } from "./apply-tasks";
import { BRIEF_TASKS } from "./brief-tasks";
import { CALC_TASKS } from "./calc-tasks";
import { CONDUCT_TASKS } from "./conduct-tasks";
import { FORM_TASKS } from "./form-tasks";
import { IDENTIFY_TASKS } from "./identify-tasks";
import { MAP_TASKS } from "./map-tasks";
import { PRESENT_TASKS } from "./present-tasks";
import { PRIORITISE_TASKS } from "./prioritise-tasks";
import { RECORD_TASKS } from "./record-tasks";
import { REVIEW_TASKS } from "./review-tasks";
import { XREF_TASKS } from "./xref-tasks";

const MAPS: Record<string, Record<string, unknown>> = {
  APPLY_TASKS, BRIEF_TASKS, CALC_TASKS, CONDUCT_TASKS, FORM_TASKS, IDENTIFY_TASKS,
  MAP_TASKS, PRESENT_TASKS, PRIORITISE_TASKS, RECORD_TASKS, REVIEW_TASKS, XREF_TASKS,
};

type Catalog = {
  learnings: {
    program_id: string;
    orgs: { projects: { tasks: { code: string; steps: { code: string; verb: string }[] }[] }[] }[];
  }[];
};

const catalog: Catalog = JSON.parse(readFileSync("../backend/_seed/grc101_catalog.json", "utf8"));

/** taskCode -> the activity codes that task actually has. */
const stepsByTask = new Map<string, Set<string>>();
for (const learning of catalog.learnings) {
  if (learning.program_id !== "grc101") continue;
  for (const org of learning.orgs)
    for (const project of org.projects)
      for (const task of project.tasks)
        stepsByTask.set(task.code, new Set(task.steps.map((s) => s.code)));
}
assert.equal(stepsByTask.size, 35, `expected 35 GRC101 tasks, found ${stepsByTask.size}`);

let checked = 0;
for (const [mapName, map] of Object.entries(MAPS)) {
  for (const key of Object.keys(map)) {
    const [taskCode, activityCode, ...rest] = key.split("/");
    assert.equal(rest.length, 0, `${mapName}["${key}"]: key must be exactly "<taskCode>/<activityCode>"`);

    const steps = stepsByTask.get(taskCode);
    assert.ok(steps, `${mapName}["${key}"]: no task "${taskCode}" in the catalogue`);

    // The whole point: name the numbering scheme this task actually uses, so a wrong key is a
    // one-line fix rather than a hunt.
    assert.ok(
      steps.has(activityCode),
      `${mapName}["${key}"]: task ${taskCode} has no activity "${activityCode}" — ` +
        `it numbers its activities ${[...steps].join(", ")}. The workspace would never load.`,
    );
    checked++;
  }
}

console.log(`workspace-keys: ok — ${checked} keys across ${Object.keys(MAPS).length} maps resolve to a real activity`);
