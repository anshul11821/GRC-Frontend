/**
 * Self-check for the Up-next derivation.
 * Run: cd web && node --experimental-strip-types src/lib/up-next.test.ts
 *
 * ponytail: plain asserts, same as countries.test.ts — no runner in this repo.
 */
import assert from "node:assert/strict";
import type { CalendarEvent } from "./calendar.ts";
import type { MentorFeedback } from "./desk.ts";
import { buildUpNext, daysOut, relDay } from "./up-next.ts";

const TODAY = "2026-07-23";
const ev = (p: Partial<CalendarEvent> & Pick<CalendarEvent, "id" | "type">): CalendarEvent => ({
  title: "t", detail: null, eventDate: null, activityId: "a1", activityCode: "1", taskCode: "AA-001",
  verb: null, stage: null, status: null, createdAt: `${TODAY}T00:00:00Z`, ...p,
});

assert.equal(daysOut("2026-07-23", TODAY), 0);
assert.equal(daysOut("2026-07-20", TODAY), -3);
assert.equal(relDay("2026-07-20", TODAY), "3d late");
assert.equal(relDay("2026-07-24", TODAY), "tomorrow");
assert.equal(relDay("2026-07-28", TODAY), "in 5d");

const items = buildUpNext(
  [
    ev({ id: "d-done", type: "deadline", status: "done", eventDate: "2026-07-21" }),
    ev({ id: "d-far", type: "deadline", status: "upcoming", eventDate: "2026-09-01" }),
    ev({ id: "d-soon", type: "deadline", status: "upcoming", eventDate: "2026-07-26" }),
    ev({ id: "d-today", type: "deadline", status: "upcoming", eventDate: TODAY }),
    ev({ id: "d-late", type: "deadline", status: "overdue", eventDate: "2026-07-20" }),
    ev({ id: "rem", type: "reminder", eventDate: "2026-07-22" }),
    ev({ id: "leave", type: "leave", eventDate: TODAY, activityId: null }),
    ev({ id: "int-past", type: "interaction", eventDate: "2026-07-10" }),
    ev({ id: "int-soon", type: "interaction", eventDate: "2026-07-25" }),
    ev({ id: "int-unscheduled", type: "interaction", eventDate: null }),
  ],
  [],
  TODAY,
);

// Kept, soonest (most overdue) first; done / far-future / leave / past + unscheduled dropped.
assert.deepEqual(items.map((i) => i.id), ["d-late", "rem", "d-today", "int-soon", "d-soon"]);

// The badge counts only what's on the mentee right now.
assert.deepEqual(items.filter((i) => i.blocking).map((i) => i.id), ["d-late", "rem", "d-today"]);

assert.equal(items[0].tone, "rose");
assert.equal(items[0].href, "/app/desk/a1");
assert.equal(items[0].detail, "AA-001·1 · t");
assert.equal(items.find((i) => i.id === "int-soon")!.href, "/app/calendar");
assert.equal(items.find((i) => i.id === "d-today")!.title, "Due today");

// --- mentor decisions ride the same bell -------------------------------------------------
const fb = (o: Partial<MentorFeedback>): MentorFeedback => ({
  id: "mentor:1",
  activityId: "a9",
  taskCode: "AA-001",
  activityCode: "1.4",
  gateName: "Asset classification decisions",
  outcome: "approve",
  reviewerName: "Priya R",
  decidedAt: "2026-07-22T09:12:00Z",
  ...o,
});

const withFeedback = buildUpNext(
  [ev({ id: "d-today", type: "deadline", status: "upcoming", eventDate: TODAY })],
  [
    fb({ id: "mentor:1", outcome: "approve" }),
    fb({ id: "mentor:2", outcome: "disapprove_return", decidedAt: "2026-07-21T09:00:00Z" }),
    fb({ id: "mentor:3", outcome: "disapprove_escalate", decidedAt: "2026-07-20T09:00:00Z" }),
  ],
  TODAY,
);

// Decided in the past, so feedback sorts above today's deadline, oldest first.
assert.deepEqual(withFeedback.map((i) => i.id), ["mentor:3", "mentor:2", "mentor:1", "d-today"]);

// Every unseen decision counts on the badge — an approval nobody notices has not landed.
assert.equal(withFeedback.filter((i) => i.blocking).length, 4);

const approve = withFeedback.find((i) => i.id === "mentor:1")!;
assert.equal(approve.title, "Mentor approved your work");
assert.equal(approve.tone, "indigo");
assert.equal(approve.href, "/app/desk/a9"); // clicking goes straight to the step
assert.equal(approve.detail, "AA-001·1.4 · Asset classification decisions");
assert.equal(withFeedback.find((i) => i.id === "mentor:2")!.tone, "amber");
assert.equal(withFeedback.find((i) => i.id === "mentor:3")!.tone, "rose");
assert.equal(withFeedback.find((i) => i.id === "mentor:3")!.title, "Mentor escalated your work");

// No feedback at all must behave exactly as before.
assert.deepEqual(buildUpNext([ev({ id: "d-today", type: "deadline", status: "upcoming", eventDate: TODAY })], [], TODAY).map((i) => i.id), ["d-today"]);

console.log("up-next: ok");
