/**
 * Mentor review console — types, token store and API client.
 *
 * A mentor's decision is authoritative (reversal, 2026-08-10): a return, an escalation or an
 * unread note drops the gate out of the learner's passed set and re-locks what followed. A
 * *pending* review blocks nothing — the AI's pass stands provisionally.
 *
 * The console keeps its own token, separate from the learner's, under its own storage key. The
 * backend refuses a mentor token on learner routes and vice versa, so the two sessions can coexist
 * in one browser without either one shadowing the other.
 */
import { api, ApiError, type RequestOptions } from "./api";
import type { Verdict } from "./verdicts";
import type { TaskReference } from "./taskmeta";
import type { Learnings } from "./learnings";
import type { ActivityDetail, SubmissionDetail } from "./desk";

const KEY = "grc_mentor_token";

export type Outcome = "approve" | "approve_note" | "disapprove_return" | "disapprove_escalate";

export interface Mentor {
  id: string;
  name: string;
  initials: string;
  email: string;
  roles: string[];
}

export interface QueueRow {
  submissionId: number;
  /** Where this submission lives on the mentee's desk — the worklist opens there, not on a card. */
  activityId: string;
  gateId: string;
  gateName: string;
  gateType: string;
  reviewerRole: string;
  taskCode: string;
  /** The gate step's method verb — what action the mentor is being asked to review. */
  verbId: string;
  /** The learner's own organisation for this task — every learner rotates through a different one. */
  orgName: string;
  menteeName: string;
  menteeId: string;
  revision: number;
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

export interface MentorStats {
  decidedTotal: number;
  decidedToday: number;
  decidedWeek: number;
  approved: number;
  returned: number;
  escalated: number;
  withdrawn: number;
  gatesInScope: number;
  roles: number;
  /** Learners currently assigned to this mentor. */
  mentees: number;
  /** When they joined the bench — tenure, for the profile. */
  memberSince: string | null;
  /** Learners of theirs holding a certificate. The one figure about somebody else's outcome. */
  menteesCertified: number;
  /** Reviewer roles held, with the NICE work role each maps to. */
  roleDetail: Role[];
}

export interface Queue {
  stats: { overdue: number; dueToday: number; awaitingYou: number; decidedToday: number };
  roles: Role[];
  needsDecision: QueueRow[];
  decided: DecidedRow[];
  /** Opaque keyset cursor for the next page; null at the end of the worklist. */
  nextCursor: string | null;
}

/** One learner on the Review Desk roster. */
export interface MenteeRow {
  userId: string;
  name: string;
  email: string;
  passedSteps: number;
  totalSteps: number;
  /** Gates of theirs sitting in this mentor's worklist right now. */
  awaitingYou: number;
  lastSubmittedAt: string | null;
  startedOn: string | null;
}

/** One of a learner's review gates, and the card that opens it. */
export interface MenteeGate {
  activityId: string;
  activityCode: string;
  taskCode: string;
  gateId: string;
  gateName: string;
  gateType: string;
  verbId: string;
  /** Null until they submit — there is no card to open yet. */
  submissionId: number | null;
  submittedAt: string | null;
  revision: number;
  state: "not_submitted" | "awaiting" | "decided";
  /**
   * Whether THIS mentor has begun marking the delivery up — what separates "Submitted" from
   * "In progress". Set by the first verdict they give to any part, not by opening the card.
   */
  started: boolean;
  outcome: Outcome | null;
  decidedAt: string | null;
  decidedBy: string | null;
}

/** A mentee's desk: who it belongs to, and the gates on it. */
export interface MenteeDesk {
  menteeName: string;
  menteeEmail: string;
  gates: MenteeGate[];
}

export interface MenteeList {
  mentees: MenteeRow[];
  /** Total assigned, so the roster can say "25 of 250" without a second request. */
  total: number;
  nextCursor: string | null;
}

export interface EarningsPeriod {
  month: string;
  reviews: number;
  /** Null when no rate is set — the page shows the volume and says so. */
  amount: number | null;
}

export interface Earnings {
  currency: string;
  ratePerReview: number;
  reviewsTotal: number;
  reviewsThisMonth: number;
  amountTotal: number | null;
  amountThisMonth: number | null;
  months: EarningsPeriod[];
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

/**
 * The judgment call on this step, with the answer key attached. The learner sees the situation,
 * the question and the four option texts and nothing else; the reviewer sees which options the
 * library considers defensible, why, and the reference position the practitioner who authored
 * the dilemma wrote for it.
 *
 * That reference position is guidance, not a mark scheme. Two or three options are defensible
 * and the reviewer is the authority on whether THIS mentee defended one of them.
 */
export interface JudgmentReviewOption {
  key: string;
  text: string;
  defensible: boolean;
  basis: string;
}
export interface JudgmentReview {
  slot: string;
  name: string;
  competence: string;
  competenceLabel: string;
  situation: string;
  question: string;
  options: JudgmentReviewOption[];
  referencePosition: string;
  hardestWhen: string;
  /** The step of the task the learner answered it on, e.g. "4". */
  answeredOnStep: string;
  /** False when the dilemma sits on an earlier step than the one under review. */
  onThisStep: boolean;
  /** The mentee's answer. Empty when this revision predates the judgment call. */
  chose: string;
  choseDefensible: boolean;
  justification: string;
  aiScore: number;
  aiPassed: boolean;
  aiDimensions: { label: string; score: number; hint: string }[];
  aiFeedback: string;
  gradedBy: string;
}

/** One thing the mentee entered, addressable so a comment can hang off exactly it. */
export interface SubmissionEntry {
  anchor: string;
  label: string;
  kind: "text" | "list" | "table";
  text: string | null;
  items: string[] | null;
  head: string[] | null;
  rows: string[][] | null;
  /** One per row, positionally. Empty for non-tables. */
  rowAnchors: string[];
  rowLabels: string[];
}

/** One thing the reviewer said about one entry, sent with the decision. */
export interface ReviewMark {
  /** The reviewer's judgement on this part. `observe` and `changes` carry a body. */
  kind: Verdict;
  anchor: string;
  anchorLabel: string;
  body: string;
}

export interface ReviewComment {
  id: number;
  kind: Verdict;
  anchor: string;
  anchorLabel: string;
  body: string;
  createdAt: string;
  /** Null while it is still a draft on this mentor's screen. */
  sentAt: string | null;
  mentorName: string;
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
  /** Review tier — how much a wrong decision here costs. */
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
  activityId: string;
  activityCode: string;
  payload: { fields?: Record<string, unknown>; notes?: string; attachments?: unknown[] };
  blocks: Block[];
  /** The submission as addressable entries — what a comment attaches to. */
  entries: SubmissionEntry[];
  comments: ReviewComment[];
  /** Set only on the one step per task that carries a judgment call. */
  judgment: JudgmentReview | null;
  approve: Reason[];
  priorReturns: number;
  maxReturns: number;
  history: HistoryEntry[];
  decidedBy: string | null;
}

/** One delivery that has waited longest — the dashboard's "do this first". */
export interface Oldest {
  userId: string;
  name: string;
  orgName: string;
  activityId: string;
  gateName: string;
  taskCode: string;
  waitedDays: number;
}

export interface BusiestOrg {
  id: string;
  name: string;
  pending: number;
  overdue: number;
}

/** The dashboard's figures, all scoped to this mentor's own caseload. */
export interface MentorAnalytics {
  mentees: number;
  orgs: number;
  pending: number;
  overdue: number;
  dueToday: number;
  /**
   * The queue by whose court the ball is in. The first two are the mentor's to move, the last two
   * the learner's; `overdue` cuts across the first two rather than being a fifth pile.
   */
  awaitingFirst: number;
  inProgress: number;
  inRework: number;
  awaitingResponse: number;
  approved: number;
  gatesDelivered: number;
  /** Ten weeks of decisions, oldest first. */
  weeks: number[];
  oldest: Oldest[];
  busiest: BusiestOrg[];
  learnersWithWork: number;
  /** The organisations themselves, so the tab that shows them costs no request of its own. */
  orgList: OrgSummary[];
}

export interface OrgSummary {
  id: string;
  name: string;
  short: string;
  industry: string;
  subIndustry: string;
  headOffice: string;
  mentees: number;
  gates: number;
  approved: number;
  pending: number;
  overdue: number;
}

export interface OrgMentee {
  userId: string;
  name: string;
  email: string;
  gates: number;
  approved: number;
  pending: number;
  waitedDays: number;
}

/** One organisation as the learner was briefed on it, plus who is working it. */
export interface OrgDetail {
  id: string;
  name: string;
  industry: string;
  subIndustry: string;
  headOffice: string;
  regulator: string;
  regulatorRationale: string;
  context: string;
  officeLocations: { headOffice?: string; regionalOffices?: string[] };
  services: string[];
  interestedParties: { internal?: string[]; external?: string[] };
  processes: string[];
  clientData: string[];
  informationAssets: { onPremises?: string[]; cloud?: string[] };
  mandatoryStandards: string[];
  optionalStandards: string[];
  regulatoryRequirements: string[];
  mentees: OrgMentee[];
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
  queue: (cursor?: string | null) =>
    api.get<Queue>(`/mentor/queue${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, opts()),
  /** The Review Desk roster. Paged and searched server-side — a mentor at scale has hundreds. */
  mentees: (params: { q?: string; waitingOnly?: boolean; cursor?: string | null } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.waitingOnly) qs.set("waiting_only", "true");
    if (params.cursor) qs.set("cursor", params.cursor);
    const tail = qs.toString();
    return api.get<MenteeList>(`/mentor/mentees${tail ? `?${tail}` : ""}`, opts());
  },
  /** That learner's engagement tree, from the learner's own builder. */
  menteeLearnings: (userId: string) =>
    api.get<Learnings>(`/mentor/mentees/${userId}/learnings`, opts()),
  /** That learner's gates, fetched once per desk so a gate step can open its own card. */
  menteeGates: (userId: string) =>
    api.get<MenteeDesk>(`/mentor/mentees/${userId}/gates`, opts()),
  /** One task's curriculum bundle in that learner's own variant — the brief they worked to. */
  menteeTaskContent: (userId: string, taskCode: string) =>
    api.get<unknown>(`/mentor/mentees/${userId}/task-content/${taskCode}`, opts()),
  menteeActivity: (userId: string, activityId: string) =>
    api.get<ActivityDetail>(`/mentor/mentees/${userId}/activities/${activityId}`, opts()),
  /** Their submissions at one step — the screen fills its workspace from these. */
  menteeActivitySubmissions: (userId: string, activityId: string) =>
    api.get<SubmissionDetail[]>(
      `/mentor/mentees/${userId}/activities/${activityId}/submissions`,
      opts(),
    ),
  earnings: () => api.get<Earnings>("/mentor/earnings", opts()),
  analytics: () => api.get<MentorAnalytics>("/mentor/analytics", opts()),
  orgs: () => api.get<OrgSummary[]>("/mentor/orgs", opts()),
  org: (orgId: string) => api.get<OrgDetail>(`/mentor/orgs/${orgId}`, opts()),
  stats: () => api.get<MentorStats>("/mentor/stats", opts()),
  card: (submissionId: number) => api.get<Card>(`/mentor/cards/${submissionId}`, opts()),
  /** Mark a submission as being worked on by this mentor. Idempotent; moves it to "In progress". */
  markStarted: (submissionId: number) =>
    api.post<{ ok: boolean }>(`/mentor/cards/${submissionId}/start`, undefined, opts()),
  /** The mentee's rendered task bundle, for replaying the two gate workspaces on the card. */
  cardTaskContent: (submissionId: number) =>
    api.get<unknown>(`/mentor/cards/${submissionId}/task-content`, opts()),
  /**
   * Record the decision and, with it, the whole review.
   *
   * The marks travel here rather than being saved as they are written: a review in progress is
   * the reviewer thinking, and it belongs in their browser until they commit to it.
   */
  decide: (
    submissionId: number,
    outcome: Verdict,
    note: string,
    requireAck: boolean,
    marks: ReviewMark[],
  ) =>
    api.post<DecisionResult>(
      `/mentor/cards/${submissionId}/decision`,
      { outcome, reasonCodes: [], note, requireAck, marks },
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
