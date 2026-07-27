// Per-ACTION content types for the activity workspace (Objective / What to do / Reference material).
// The DATA used to ship to the browser as a large ACTIVITY_CONTENT map, plus a getActivityContent()
// helper — both now live server-side and are fetched per-task from the gated endpoint (see
// task-bundle.ts: the bundle's `activities` field + the activityBrief() helper). Only the shared
// type remains client-side.
import type { TaskReference } from "./taskmeta";

export interface ActivityContent {
  objective: string;
  whatToDo: string[];
  references?: TaskReference[];
}
