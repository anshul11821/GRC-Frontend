// Per-task overview types (Objective / What to do / Reference material). The DATA used to ship to
// the browser as a large TASK_CONTENT map (and was merged into TASK_META) — it now lives server-side
// and is fetched per-task from the gated endpoint (see task-bundle.ts; the bundle's `overview`
// field). Only the shared type remains client-side.
import type { TaskReference } from "./taskmeta";

export interface TaskContent {
  objective: string;
  whatToDo: string[];
  references: TaskReference[];
}
