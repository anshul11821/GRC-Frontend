/**
 * Self-check for the Up-next derivation.
 * Run: cd web && node --experimental-strip-types src/lib/up-next.test.ts
 *
 * ponytail: plain asserts, same as countries.test.ts — no runner in this repo.
 */
import assert from "node:assert/strict";
import type { CalendarEvent } from "./calendar.ts";
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

console.log("up-next: ok");
