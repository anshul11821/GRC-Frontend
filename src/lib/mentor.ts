/**
 * Mentor review console — types, token store and API client.
 *
 * Shadow mode: a mentor's decision is recorded and shown back to them, and changes nothing for
 * the learner. Nothing here writes to a learner's submission or grade.
 *
 * The console keeps its own token, separate from the learner's, under its own storage key. The
 * backend refuses a mentor token on learner routes and vice versa, so the two sessions can coexist
 * in one browser without either one shadowing the other.
 */
import { api, ApiError, type RequestOptions } from "./api";
import type { TaskReference } from "./taskmeta";

const KEY = "grc_mentor_token";

export type Outcome = "approve" | "approve_note" | "disapprove_return" | "disapprove_escalate";
export type GraderResult = "PASS" | "FAIL" | "PENDING";

export interface Mentor {
  id: string;
  name: string;
  initials: string;
  email: string;
  roles: string[];
}

export interface QueueRow {
  submissionId: number;
  gateId: string;
  gateName: string;
  gateType: string;
  reviewerRole: string;
  taskCode: string;
  menteeName: string;
  menteeId: string;
  revision: number;
  grader: GraderResult;
  submittedAt: string;
  remainingMin: number;
}

export interface DecidedRow {
  decisionId: number;
  gateId: string;
  gateName: string;
  menteeName: string;
  outcome: Outcome;
  reasonCount: number;
  decidedAt: string;
  undoSeconds: number;
}

export interface Role {
  code: string;
  name: string;
  /** NICE work role — what qualifies someone to hold this reviewer role. */
  nice: string;
  responsibility: string;
}

export interface Queue {
  stats: { overdue: number; dueToday: number; awaitingYou: number; decidedToday: number };
  roles: Role[];
  needsDecision: QueueRow[];
  waiting: QueueRow[];
  decided: DecidedRow[];
}

export interface Reason {
  code: string;
  text: string;
  action: string | null;
}

/** One step of the task in the card's step chain. */
export interface Step {
  n: number;
  name: string;
  state: "past" | "now" | "future";
}

/** One review question. Each carries its own disapprove code and correction, so answering "no"
 *  produces both the reason and the instruction to the mentee without picking from a menu. */
export interface ChecklistItem {
  id: string;
  slot: number;
  layer: "CATEGORY" | "VERB-FAMILY" | "GATE-TYPE" | "UNIVERSAL" | "COORDINATE";
  question: string;
  disapproveCode: string;
  reason: string;
  correction: string;
  testableBy: "HUMAN-ONLY" | "AGENT-TESTABLE";
  /** T2/T3 render agent-testable items as already cleared, with the grader's result attached. */
  preCleared: boolean;
}

/** A checklist item as a disapprove reason — its code, what went wrong, and the fix. */
export const itemAsReason = (i: ChecklistItem): Reason => ({
  code: i.disapproveCode,
  text: i.reason,
  action: i.correction,
});

export interface Block {
  t: "h" | "p" | "list" | "table";
  text: string | null;
  items: string[] | null;
  head: string[] | null;
  rows: string[][] | null;
}

export interface Grader {
  available: boolean;
  result: GraderResult;
  layer1: { rule: string; passed: boolean; note: string }[];
  mean: number | null;
  min: number | null;
  minDim: string | null;
  dims: { label: string; score: number; justification: string }[];
  feedback: string;
}

export interface HistoryEntry {
  revision: number;
  submittedAt: string;
  outcome: Outcome;
  /** Reason text, not bare codes — resolved server-side against the gate's library. */
  reasons: string[];
  note: string;
  mentorName: string;
  decidedAt: string;
  withdrawn: boolean;
}

/** The prompt the mentee actually read on the Working Desk, rendered into their own organisation.
 *  Every learner rotates through a different org, asset and framing, so the gate register's
 *  org-agnostic text is not what they were asked to do. */
export interface Brief {
  /** Task objective + engagement clause — organisation, scenario, lens, deliverable format. */
  engagement: string;
  objective: string;
  whatToDo: string[];
  /** The reference documents handed to the learner for this step, same shape the Working Desk
   *  renders — so the console reuses <ReferenceMaterial> rather than growing a second renderer. */
  references: TaskReference[];
}

export interface Card {
  submissionId: number;
  gateId: string;
  gateName: string;
  gateType: string;
  step: string;
  reviewerRole: string;
  reviewerRoleCode: string;
  reviewerRoleNice: string;
  taskCode: string;
  taskName: string;
  activityTitle: string;
  /** Absent when served by a backend older than the brief — the card degrades, it does not break. */
  brief?: Brief;
  /** Review tier. Outside T1 the agent-testable questions arrive pre-cleared. */
  tier: "T1" | "T2" | "T3";
  /** 0–10. How far this determination reaches once it leaves the gate. */
  impact: number;
  archetype: string | null;
  category: string;
  verbFamily: string;
  /** The task's steps in order, with this gate's marked — what a return actually costs. */
  stepChain: Step[];
  // The learner's own organisation, so the card is judged against the brief they were given.
  orgRegulator: string;
  orgIndustry: string;
  orgContext: string;
  mandatoryStandards: string;
  scenario: string;
  /** The six questions that *are* the review, in slot order. */
  checklist: ChecklistItem[];
  /** In scope but not among the six — library items the mentor can still disapprove on. */
  reserve: ChecklistItem[];
  /** This gate's hand-authored v2 reasons, more specific than any inherited item. */
  legacyReserve: Reason[];
  acceptance: string;
  remainingMin: number;
  outputId: string;
  artefact: string;
  feedsInto: string;
  inputs: string;
  priorOutputs: string[];
  menteeName: string;
  menteeId: string;
  menteeRotation: string;
  orgName: string;
  orgHeadOffice: string;
  // The learner's variant setting. The gate checks are org-agnostic, but the reviewer still has
  // to know which organisation, asset and framing produced the work in front of them.
  scopeAsset: string;
  scopeVendor: string;
  analyticalLens: string;
  deliverableFormat: string;
  revision: number;
  submittedAt: string;
  // The mentee's own workspace is replayed read-only on the card, so a mapping table reads as the
  // table they filled in. `blocks` is the plain-text view and the fallback for a verb with no
  // bespoke workspace.
  verbId: string;
  activityCode: string;
  payload: { fields?: Record<string, unknown>; notes?: string; attachments?: unknown[] };
  blocks: Block[];
  grader: Grader;
  approve: Reason[];
  priorReturns: number;
  maxReturns: number;
  history: HistoryEntry[];
  decidedBy: string | null;
}

export interface DecisionResult {
  decisionId: number;
  outcome: Outcome;
  gateId: string;
  undoSeconds: number;
}

// ------------------------------------------------------------------ token

let memo: string | null = null;

export function getMentorToken(): string | null {
  if (memo !== null) return memo;
  if (typeof window === "undefined") return null;
  memo = window.localStorage.getItem(KEY);
  return memo;
}

export function setMentorToken(token: string | null): void {
  memo = token;
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(KEY, token);
  else window.localStorage.removeItem(KEY);
}

/** Mentor tokens are long-lived and have no refresh cookie — never run the learner refresh dance. */
function opts(): RequestOptions {
  return { token: getMentorToken() ?? undefined, noRefresh: true };
}

// ------------------------------------------------------------------ api

export const mentorApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; expiresMinutes: number; mentor: Mentor }>(
      "/mentor/login",
      { email, password },
      { noAuth: true },
    ),
  me: () => api.get<Mentor>("/mentor/me", opts()),
  queue: () => api.get<Queue>("/mentor/queue", opts()),
  card: (submissionId: number) => api.get<Card>(`/mentor/cards/${submissionId}`, opts()),
  /** The mentee's rendered task bundle, for replaying the two gate workspaces on the card. */
  cardTaskContent: (submissionId: number) =>
    api.get<unknown>(`/mentor/cards/${submissionId}/task-content`, opts()),
  decide: (
    submissionId: number,
    outcome: "approve" | "disapprove",
    reasonCodes: string[],
    note: string,
    requireAck = false,
  ) =>
    api.post<DecisionResult>(
      `/mentor/cards/${submissionId}/decision`,
      { outcome, reasonCodes, note, requireAck },
      opts(),
    ),
  undo: (decisionId: number) =>
    api.post<{ ok: boolean }>(`/mentor/decisions/${decisionId}/undo`, undefined, opts()),
};

export function isAuthError(e: unknown): boolean {
  return e instanceof ApiError && (e.status === 401 || e.status === 403);
}

// ------------------------------------------------------------------ formatting

/** "2h 14m left" / "3h 20m overdue". The design colours the overdue case red. */
export function formatRemaining(minutes: number): string {
  const overdue = minutes < 0;
  const total = Math.abs(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const body = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return overdue ? `${body} overdue` : `${body} left`;
}

export function formatSubmitted(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export const OUTCOME_LABEL: Record<Outcome, string> = {
  approve: "Approved",
  approve_note: "Approved with note",
  disapprove_return: "Disapprove — return",
  disapprove_escalate: "Disapprove — escalate",
};

/**
 * Escalation is decided by the server; the sheet only has to warn before the mentor commits.
 * Counted in mentor returns already recorded at this gate — not the submission's revision number,
 * which also advances on grader failures the mentor never saw.
 */
export function willEscalate(priorReturns: number, maxReturns: number): boolean {
  return priorReturns >= maxReturns;
}
