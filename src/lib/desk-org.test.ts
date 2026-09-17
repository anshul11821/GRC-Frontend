// Run: npx tsx src/lib/desk-org.test.ts
import assert from "node:assert/strict";
import { pickOrgId } from "./desk-org";
import type { LearningOrg } from "./learnings";

/** Two placements: one finished, one running, plus one still locked. */
const org = (id: string, status: string, taskCode: string, stepId: string) =>
  ({
    id,
    name: id,
    industry: "",
    initials: id.slice(0, 2).toUpperCase(),
    tone: "indigo",
    status,
    context: "",
    projects: [{ tasks: [{ code: taskCode, steps: [{ id: stepId }] }] }],
  }) as unknown as LearningOrg;

const orgs = [
  org("done", "complete", "AA-001", "step_aa_001_0"),
  org("live", "active", "GRM-001", "step_grm_001_0"),
  org("later", "locked", "IR-001", "step_ir_001_0"),
];

// The bare desk opens on the placement being worked, not the first one in the tree.
assert.equal(pickOrgId(orgs, {}), "live");

// A link into a *finished* placement's work moves the desk there — the step it points at has to
// be in the tree the learner is looking at.
assert.equal(pickOrgId(orgs, { activityId: "step_aa_001_0" }), "done");
assert.equal(pickOrgId(orgs, { taskCode: "AA-001" }), "done");

// A chip is a link to a context page, so opening one is what selects that placement.
assert.equal(pickOrgId(orgs, { orgPageId: "later" }), "later");

// An open step outranks the page id: navigating from a context page into a step of another
// placement must follow the step.
assert.equal(pickOrgId(orgs, { activityId: "step_grm_001_0", orgPageId: "done" }), "live");

// An id that names nothing (a stale link, a renamed step) falls back rather than blanking the desk.
assert.equal(pickOrgId(orgs, { activityId: "step_nope_9" }), "live");

// No placements at all: nothing to show, and nothing thrown.
assert.equal(pickOrgId([], { activityId: "step_aa_001_0" }), undefined);

console.log("desk-org: ok");
