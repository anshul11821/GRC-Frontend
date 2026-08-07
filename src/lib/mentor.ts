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

const KEY = "grc_mentor_token";

export type Outcome = "approve" | "disapprove_return" | "disapprove_escalate";
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
  secondReviewer: string | null;
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

export interface Queue {
  stats: { overdue: number; dueToday: number; awaitingYou: number; decidedToday: number };
  roles: string[];
  needsDecision: QueueRow[];
  waiting: QueueRow[];
  decided: DecidedRow[];
}

export interface Reason {
  code: string;
  text: string;
  action: string | null;
}

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

export interface Card {
  submissionId: number;
  gateId: string;
  gateName: string;
  gateType: string;
  step: string;
  reviewerRole: string;
  secondReviewer: string | null;
  taskCode: string;
  taskName: string;
  activityTitle: string;
  why: string;
  checks: string[];
  acceptance: string;
  budgetMin: number;
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
  revision: number;
  submittedAt: string;
  blocks: Block[];
  grader: Grader;
  approve: Reason[];
  disapprove: Reason[];
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
  decide: (submissionId: number, outcome: "approve" | "disapprove", reasonCodes: string[], note: string) =>
    api.post<DecisionResult>(
      `/mentor/cards/${submissionId}/decision`,
      { outcome, reasonCodes, note },
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
  disapprove_return: "Disapprove — return",
  disapprove_escalate: "Disapprove — escalate",
};

/** Escalation is decided by the server, but the sheet must warn before the mentor commits. */
export function willEscalate(revision: number): boolean {
  return revision >= 2;
}
