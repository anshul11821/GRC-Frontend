// Run: npx tsx src/lib/record-tasks.test.ts
//
// A register workspace opens as a table of blank rows. Nothing on screen says where the data comes
// from unless the task declares a `source`, and the signpost is only useful if it names a document
// the mentee can actually open — so it is checked against the curriculum content the backend
// serves for that step, not just against itself.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RECORD_TASKS } from "./record-tasks";

type Ref = { id: string; title: string };
type Activity = { objective?: string; whatToDo?: string[]; references?: Ref[] };
type Task = { activities?: Record<string, Activity> };

const CONTENT: Record<string, Task> = JSON.parse(
  readFileSync("../backend/_seed/grc101_content.json", "utf8"),
);

for (const [key, task] of Object.entries(RECORD_TASKS)) {
  const [taskCode, activityCode] = key.split("/");
  const activity = CONTENT[taskCode]?.activities?.[activityCode];
  assert.ok(activity, `${key}: no curriculum content for this step`);

  const titles = (activity.references ?? []).map((r) => r.title);
  if (task.source) {
    assert.ok(
      titles.includes(task.source),
      `${key}: source "${task.source}" is not one of this step's documents — the workspace tells ` +
        `the mentee to open something that isn't there. Available: ${titles.join(" | ")}`,
    );
  }

  // Every column the mentee must fill needs to be answerable from what the step gave them.
  assert.ok(task.requiredRows >= 1, `${key}: requiredRows must be at least 1`);
  assert.ok(task.columns.some((c) => c.required), `${key}: no required columns`);
  for (const c of task.columns) {
    if (c.type === "select") assert.ok(c.options?.length, `${key}: select column "${c.key}" has no options`);
    if (c.idFormat) {
      assert.ok(
        new RegExp(c.idFormat.pattern).test(c.idFormat.example),
        `${key}: column "${c.key}" example "${c.idFormat.example}" fails its own pattern`,
      );
    }
  }

  // The brief and the register must not contradict each other. AA-001/1.3 told the mentee to
  // "leave classification blank for now — that's the next step" while making a CIA-class column
  // required, so following the instruction made the step unsubmittable.
  const brief = `${activity.objective ?? ""} ${(activity.whatToDo ?? []).join(" ")}`.toLowerCase();
  const deferred = /leave (the )?classification blank|classification.*next step/.test(brief);
  if (deferred) {
    const classCol = task.columns.find((c) => /cia|classif/i.test(c.key) && c.required);
    assert.ok(
      !classCol,
      `${key}: the brief defers classification to a later step, but column "${classCol?.key}" is required here`,
    );
  }
}

console.log(`record-tasks: ok — ${Object.keys(RECORD_TASKS).length} registers, sources match their step's documents`);
