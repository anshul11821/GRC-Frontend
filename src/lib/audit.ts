/**
 * Auditor console — typed client mirroring the FastAPI `/audit/*` endpoints (camelCase side).
 * The backend is snake_case; lib/api.ts converts at the boundary.
 */
import { api } from "./api";
import type { IconName } from "@/components/ui/icon";

// ---------------------------------------------------------------- identity
export interface AuditorProfile {
  discipline: string;
  firm: string | null;
  yearsExperience: number | null;
  certifications: string[];
  bio: string | null;
  assignedStandards: string[];
  status: string;
  createdAt: string;
}

export interface AuditorMe {
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  isProfileComplete: boolean;
  profile: AuditorProfile | null;
}

// ---------------------------------------------------------------- review data
export interface StandardChip {
  id: string;
  label: string;
}

export interface AuditListItem {
  id: number;
  taskCode: string;
  taskTitle: string;
  programId: string;
  orgName: string | null;
  menteeName: string;
  menteeInitials: string;
  standards: StandardChip[];
  status: string;
  round: number;
  selfScore: number | null;
  overallScore: number | null;
  verdict: string | null;
  openFindings: number;
  blockingFindings: number;
  notesCount: number;
  waitedHours: number;
  createdAt: string;
  decidedAt: string | null;
}

export interface DeliverableSection {
  id: string;
  code: string;
  title: string;
  verb: string;
  fields: Record<string, unknown>;
  notes: string;
  aiScore: number | null;
  aiDecision: string | null;
  aiFeedback: string | null;
}

export interface Finding {
  id: number;
  kind: string;
  severity: string;
  anchor: string | null;
  text: string;
  status: string;
  round: number;
  createdAt: string;
}

export interface RubricScore {
  id: string;
  label: string;
  value: number;
}

export interface AuditDetail {
  item: AuditListItem;
  deliverable: DeliverableSection[];
  findings: Finding[];
  rubric: RubricScore[];
  menteeSelfScore: number | null;
}

export interface StatCard {
  id: string;
  label: string;
  value: string;
  sub: string;
}

export interface MenteeRow {
  userId: string;
  name: string;
  initials: string;
  programId: string;
  reviewed: number;
  approved: number;
  rework: number;
  open: number;
  avg: number | null;
}

export interface AuditOverview {
  stats: StatCard[];
  newRequests: AuditListItem[];
  awaitingVerdict: AuditListItem[];
  flagged: AuditListItem[];
  approved: AuditListItem[];
  mentees: MenteeRow[];
}

// reports / standards
export interface ReportKpi { id: string; label: string; value: string; sub: string; tone: string }
export interface NameValue { label: string; value: number; tone: string }
export interface MonthVolume { m: string; v: number }
export interface StandardBar { name: string; reviewed: number; approvalPct: number; tone: string }
export interface Reports {
  kpis: ReportKpi[];
  turnaround: number[];
  volume: MonthVolume[];
  verdictMix: NameValue[];
  rubric: NameValue[];
  byStandard: StandardBar[];
}
export interface StandardCard {
  id: string; name: string; reviewed: number; approvalPct: number;
  open: number; focus: string; controls: string; tone: string;
}

// ---------------------------------------------------------------- inbound
export interface FindingInput {
  kind: string;
  severity: string;
  anchor?: string | null;
  text: string;
}
export interface RubricScoreInput { id: string; value: number }
export interface VerdictInput {
  verdict: string;
  scores: RubricScoreInput[];
  message?: string | null;
}

export type AuditScope = "queue" | "in_progress" | "flagged" | "approved";

export const auditApi = {
  me: () => api.get<AuditorMe>("/audit/me"),
  overview: () => api.get<AuditOverview>("/audit/overview"),
  queue: (scope: AuditScope = "queue") =>
    api.get<AuditListItem[]>("/audit/queue", { query: { scope } }),
  mentees: () => api.get<MenteeRow[]>("/audit/mentees"),
  reports: () => api.get<Reports>("/audit/reports"),
  standards: () => api.get<StandardCard[]>("/audit/standards"),
  detail: (id: number) => api.get<AuditDetail>(`/audit/tasks/${id}`),
  claim: (id: number) => api.post<AuditDetail>(`/audit/tasks/${id}/claim`),
  addFinding: (id: number, body: FindingInput) =>
    api.post<Finding>(`/audit/tasks/${id}/findings`, body),
  removeFinding: (findingId: number) => api.delete<void>(`/audit/findings/${findingId}`),
  saveRubric: (id: number, scores: RubricScoreInput[]) =>
    api.put<RubricScore[]>(`/audit/tasks/${id}/rubric`, { scores }),
  verdict: (id: number, body: VerdictInput) =>
    api.post<AuditDetail>(`/audit/tasks/${id}/verdict`, body),
};

// ---------------------------------------------------------------- presentation maps
export interface ToneSet {
  bg: string; text: string; ring: string; dot: string; solid: string; grad: string;
}
export const A_TONE: Record<string, ToneSet> = {
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  ring: "ring-indigo-200/70",  dot: "bg-indigo-500",  solid: "bg-indigo-600",  grad: "from-indigo-400 to-violet-500" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  ring: "ring-violet-200/70",  dot: "bg-violet-500",  solid: "bg-violet-600",  grad: "from-violet-400 to-fuchsia-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200/70", dot: "bg-emerald-500", solid: "bg-emerald-600", grad: "from-emerald-400 to-teal-500" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    ring: "ring-teal-200/70",    dot: "bg-teal-500",    solid: "bg-teal-600",    grad: "from-teal-400 to-cyan-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200/70",   dot: "bg-amber-500",   solid: "bg-amber-500",   grad: "from-amber-400 to-orange-500" },
  yellow:  { bg: "bg-yellow-50",  text: "text-yellow-700",  ring: "ring-yellow-200/70",  dot: "bg-yellow-500",  solid: "bg-yellow-500",  grad: "from-yellow-300 to-amber-500" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200/70",    dot: "bg-rose-500",    solid: "bg-rose-600",    grad: "from-rose-400 to-pink-500" },
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     ring: "ring-sky-200/70",     dot: "bg-sky-500",     solid: "bg-sky-600",     grad: "from-sky-400 to-blue-500" },
  slate:   { bg: "bg-slate-100",  text: "text-slate-600",   ring: "ring-slate-200/70",   dot: "bg-slate-400",   solid: "bg-slate-600",   grad: "from-slate-400 to-slate-500" },
};
export const aTone = (t?: string): ToneSet => A_TONE[t || "slate"] || A_TONE.slate;

/** Standard → tone (mirrors backend Standard.tone, with a token fallback). */
export const STD_TONE: Record<string, string> = {
  iso27001: "indigo", nistcsf: "violet", cisv8: "emerald", soc2: "amber", gdpr: "rose",
};

export const FEEDBACK_KINDS: Record<string, { label: string; icon: IconName; tone: string }> = {
  comment: { label: "Comment", icon: "messageSquare", tone: "indigo" },
  observation: { label: "Observation", icon: "eye", tone: "teal" },
  recommendation: { label: "Recommendation", icon: "lightbulb", tone: "violet" },
};

export const SEVERITIES: Record<string, { label: string; tone: string }> = {
  critical: { label: "Critical", tone: "rose" },
  major: { label: "Major", tone: "amber" },
  minor: { label: "Minor", tone: "yellow" },
  advisory: { label: "Advisory", tone: "slate" },
};

export const VERDICTS: { id: string; label: string; icon: IconName; tone: string; desc: string }[] = [
  { id: "approve", label: "Approve", icon: "checkCircle", tone: "emerald", desc: "Meets the standard — clear it for the credential." },
  { id: "approve_with_observations", label: "Approve w/ observations", icon: "checkSquare", tone: "teal", desc: "Acceptable, with advisory notes attached." },
  { id: "request_changes", label: "Request changes", icon: "cornerUpRight", tone: "amber", desc: "Return to the mentee for rework before it can clear." },
];

export const verdictById = (id?: string | null) => VERDICTS.find((v) => v.id === id);

export const STATUS_LABEL: Record<string, string> = {
  pending: "In pool",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  approved_with_observations: "Approved · observations",
};
