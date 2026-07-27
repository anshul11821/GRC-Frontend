// RUA (Requirement & Understanding Analysis) task types. The task DATA used to live here as a
// 4,000-line RUA_TASKS map that shipped to the browser — it now lives server-side and is fetched
// per-task from the gated endpoint (see task-bundle.ts / GET /me/task-content/{code}). Only the
// shared types remain client-side.

export interface RuaControl { ref: string; name: string }
export interface RuaCrosswalk { code: string; desc: string }
export interface RuaTemplate { name: string; purpose: string; fmt: "sheet" | "doc" | "deck" | "diagram"; fields: string[] }
export interface RuaAcquireItem { type: "context" | "template" | "access" | "artefact"; label: string }
export interface RuaStep { verb: string; text: string }

export interface RuaTask {
  /** Organisation this engagement runs in (used in copy). */
  org: string;
  standard: string;
  objective: string;
  /** Governing controls to study, each needing a short "what it requires" note. */
  controls: RuaControl[];
  /** NIST CSF cross-walk shown alongside the controls. */
  crosswalk: RuaCrosswalk[];
  /** Every provided template to inspect. */
  templates: RuaTemplate[];
  /** Prerequisite inputs/access to confirm before starting. */
  acquire: RuaAcquireItem[];
  /** The task's activity steps, walked and acknowledged one by one. */
  steps: RuaStep[];
  /** The deliverable contract locked in the Confirm step. */
  deliverable: string;
  acceptance: string;
  /** Key concepts the mentee explains in their own words. */
  concepts: string[];
  /** Readiness verification questions. */
  questions: string[];
}
