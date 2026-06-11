/**
 * Mentee-facing audit standing — mirrors FastAPI GET /me/audits (MeAuditsOut).
 * Shows where each completed task sits in independent auditor review.
 */
import { api } from "./api";

export interface MeAuditFinding {
  kind: string;
  severity: string;
  anchor: string | null;
  text: string;
  status: string;
  createdAt: string;
}

export interface MeAuditItem {
  taskId: string;
  taskCode: string;
  taskTitle: string;
  status: string;        // pending | in_review | changes_requested | approved | approved_with_observations
  label: string;         // mentee-friendly label
  round: number;
  verdict: string | null;
  overallScore: number | null;
  openFindings: number;
  decidedAt: string | null;
  findings: MeAuditFinding[];
}

export interface MeAudits {
  allClear: boolean;
  auditedTasks: number;
  cleared: number;
  underReview: number;
  withOpenFindings: number;
  openBlockingFindings: number;
  tasks: MeAuditItem[];
}

export const meAuditsApi = {
  list: (program = "grc101") => api.get<MeAudits>("/me/audits", { query: { program } }),
};

/** Tone for a mentee audit status chip. */
export function auditStatusTone(status: string): string {
  if (status === "approved" || status === "approved_with_observations") return "emerald";
  if (status === "changes_requested") return "amber";
  return "indigo"; // pending / in_review
}
