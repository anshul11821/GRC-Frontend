// RUA reference-artifact types. The artifact DATA (the reference documents the programme hands the
// mentee in each RUA gate) used to ship to the browser as a large RUA_REFS map — it now lives
// server-side and is fetched per-task from the gated endpoint (see task-bundle.ts; the bundle's
// `refs` field). Only the shared type remains client-side.
import type { TaskReference } from "./taskmeta";

/** A reference artifact, the RUA tab it belongs to, and the item within that tab it documents. */
export interface RuaRef extends TaskReference {
  tab: "study" | "inspect" | "acquire" | "clarify" | "confirm" | "explain";
  /** Index of the control / template / prerequisite / step / concept this documents. Absent = tab-level. */
  item?: number;
}
