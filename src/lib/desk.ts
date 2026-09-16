/**
 * Working Desk — activity workspace + grading loop. Mirrors the FastAPI Slice-A contract:
 * GET /me/activities/{id}, PUT …/draft, POST …/submit, GET /me/submissions/{id}.
 */
import { api } from "./api";
import type { Verdict } from "./verdicts";

export interface ActivityPayload {
  fields: Record<string, unknown>;
  notes: string;
  attachments: unknown[];
}

export interface Layer1Check {
  label: string;
  passed: boolean;
  detail: string;
}
export interface Layer1Result {
  passed: boolean;
  checks: Layer1Check[];
}

export interface ReviewDimension {
  id: string;
  label: string;
  score: number;
  justification: string;
  /** The one concrete thing that would have scored higher. Empty at full marks. */
  missing?: string;
}
export interface Review {
  id: number;
  submissionId: number;
  overallScore: number;
  dimensions: ReviewDimension[];
  feedback: string;
  decision: "pass" | "revise" | string;
  model: string;
  createdAt: string;
}

export interface MentorReview {
  decisionId: number;
  outcome: "approve" | "approve_note" | "disapprove_return" | "disapprove_escalate";
  gateName: string;
  /** `action` is the corrective step, shown verbatim as the reviewer selected it. */
  reasons: { text: string; action: string | null }[];
  note: string;
  reviewerName: string;
  reviewerRole: string;
  decidedAt: string;
  advisory: boolean;
  /** approve_note only: the step stays incomplete, and the next one locked, until acknowledged. */
  needsAcknowledgement: boolean;
  /** Remarks on specific things you entered — anchored to a field, or to one row of a table. */
  /** One per part of the delivery the mentor said something about, each carrying its verdict. */
  comments: {
    id: number;
    kind: Verdict;
    anchor: string;
    anchorLabel: string;
    body: string;
    sentAt: string | null;
  }[];
}

/** A mentor decision as it appears in the Up-next bell. Full detail lives on the step itself. */
export interface MentorFeedback {
  id: string;
  activityId: string;
  taskCode: string;
  activityCode: string;
  gateName: string;
  outcome: MentorReview["outcome"];
  reviewerName: string;
  decidedAt: string;
}

/**
 * The reference answer. Present only when the learner can no longer reach it themselves — an
 * escalated gate, or attempts exhausted without a pass. Never sent in any other state.
 */
export interface ModelAnswer {
  reason: "attempts_exhausted" | "escalated";
  artefact: string;
  acceptance: string;
  worked: string;
  /**
   * Escalated only: acknowledging this decision releases the step. Null when nothing is owed —
   * including for `attempts_exhausted`, which releases through `deskApi.releaseAfterAnswer`
   * instead, there being no mentor decision to acknowledge.
   */
  acknowledgeDecisionId: number | null;
}

/**
 * The judgment call: one step in each task carries a situation with no clean answer, four courses
 * of action and a box for the reasoning. Two or three of the options are genuinely defensible —
 * which, deliberately, this type cannot tell you. The grade is on the reasoning, not the pick,
 * and the answer key stays on the server (backend/app/services/judgment.py).
 */
export interface JudgmentOption {
  key: string;
  text: string;
}
export interface JudgmentPrompt {
  slot: string;
  /** What the dilemma is about, e.g. "Where the assessment population stops". */
  name: string;
  competence: string;
  competenceLabel: string;
  situation: string;
  question: string;
  options: JudgmentOption[];
}
export interface JudgmentDimension {
  label: string;
  score: number;
  hint: string;
}
export interface JudgmentResult {
  slot: string;
  competence: string;
  competenceLabel: string;
  option: string;
  /** Whether the option taken was one of the defensible ones. Told after grading, never before. */
  defensible: boolean;
  justification: string;
  score: number;
  passed: boolean;
  dimensions: JudgmentDimension[];
  feedback: string;
  /** "fallback" when the model was unreachable and the mentor will read the reasoning instead. */
  gradedBy: string;
}

/** What the workspace lifts into `payload.fields.decision`. */
export interface DecisionAnswer {
  option: string;
  justification: string;
}

export interface ActivityDetail {
  id: string;
  code: string;
  verb: { id: string };
  title: string;
  taskCode: string;
  taskTitle: string;
  status: string;
  draft: ActivityPayload | null;
  latestReview: Review | null;
  /**
   * Present only on the 70 mentor review-gate steps, once a mentor has decided. While `advisory`
   * is true the decision is shown to the learner but gates nothing — their result is still the
   * AI's. Do not branch progression on this.
   */
  mentorReview: MentorReview | null;
  modelAnswer: ModelAnswer | null;
  /** Set only on the one step per task that carries a judgment call. */
  judgment: JudgmentPrompt | null;
  /** How they answered it last time, if they have. */
  judgmentResult: JudgmentResult | null;
  attemptsUsed: number;
  attemptsRemaining: number;
  maxAttempts: number;
}

export interface SubmitResponse {
  submissionId: number;
  layer1: Layer1Result;
  review: Review | null;
  judgmentResult: JudgmentResult | null;
  attemptsUsed: number;
  attemptsRemaining: number;
  maxAttempts: number;
}

export interface SubmissionSummary {
  id: number;
  activityId?: string;
  payload?: ActivityPayload;
  revisionNo: number;
  status: string;
  createdAt: string;
  layer1: Layer1Result | null;
}
export interface SubmissionDetail {
  submission: SubmissionSummary;
  review: Review | null;
}

export const deskApi = {
  activity: (id: string) => api.get<ActivityDetail>(`/me/activities/${id}`),
  mentorFeedback: () => api.get<MentorFeedback[]>("/me/mentor-feedback"),
  acknowledgeMentorFeedback: (decisionId: number) =>
    api.post<{ ok: boolean }>(`/me/mentor-feedback/${decisionId}/acknowledge`),
  /** Confirm the worked answer has been read on a step with no attempts left. Completes the step. */
  releaseAfterAnswer: (id: string) => api.post<{ ok: boolean }>(`/me/activities/${id}/release`),
  saveDraft: (id: string, payload: ActivityPayload) =>
    api.put<{ ok: boolean }>(`/me/activities/${id}/draft`, { payload }),
  submit: (id: string, payload: ActivityPayload) =>
    api.post<SubmitResponse>(`/me/activities/${id}/submit`, { payload }),
  submissions: (id: string) => api.get<SubmissionDetail[]>(`/me/activities/${id}/submissions`),
};

/**
 * Opening a step costs two round trips — the activity and its submission history — and neither is
 * cacheable across a submit, so every click in the tree paid for both before anything rendered.
 * Hovering a step link starts them early: by the time the click lands the answers are usually
 * back, and a hover that never becomes a click costs two GETs the learner was about to make anyway.
 *
 * Deliberately NOT a cache. An entry is handed out once and then dropped, and expires on its own
 * shortly after, because a submit changes both reads and serving a stale activity would show a
 * spent attempt as unspent. The learner's own endpoints only — a mentor's desk reads a different
 * learner through its own source and must never be served from here.
 */
export interface WarmStep {
  activity: Promise<ActivityDetail>;
  submissions: Promise<SubmissionDetail[] | null>;
}
const warm = new Map<string, { at: number; step: WarmStep }>();
const WARM_MS = 30_000;

export function prefetchStep(id: string): void {
  if (warm.has(id)) return;
  const step: WarmStep = {
    activity: deskApi.activity(id),
    submissions: deskApi.submissions(id).catch(() => null),
  };
  // Keep the rejection handled here too, so a failed prefetch nobody consumed stays quiet; the
  // original promise still carries the error for a consumer that does take it.
  step.activity.catch(() => warm.delete(id));
  warm.set(id, { at: Date.now(), step });
}

/** Take the warmed reads for a step, if they're fresh. Always removes the entry. */
export function takeWarmStep(id: string): WarmStep | null {
  const e = warm.get(id);
  warm.delete(id);
  return e && Date.now() - e.at < WARM_MS ? e.step : null;
}
