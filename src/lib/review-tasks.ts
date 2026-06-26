// Review worked tasks (mentor quality-gate). Source: Review_Verb_Task_Register.xlsx.
// Mentee submits a near-final artefact with a cover note + confirms prior feedback addressed (Layer 1,
// the submit gate). The 5-dimension rubric, outcome (SIGN-OFF/REVISE) and RA-MENTOR coaching are the
// mentor's demo result shown after submitting for review.

export interface ReviewDim { dim: string; score: string; anchor: string; }

export interface ReviewTask {
  title: string; standard: string; reviewer: string;
  artefact: string; attempt: string;
  /** Example cover note (placeholder for the mentee's own). */
  coverExample: string;
  /** Prior grading feedback to confirm addressed (empty on a first submission). */
  feedback: string[];
  rubric: ReviewDim[]; aggregate: string; lowest: string;
  outcome: string; coaching: string; feedsNext: string;
}

export const REVIEW_TASKS: Record<string, ReviewTask> = {
  "AA-001/1.7": {
    title: "Information Asset Register", standard: "ISO 27001 A.5.9 Inventory; A.5.12 Classification", reviewer: "Policy & Governance Analyst · Analytical Sleuth",
    artefact: "Information Asset Register v1.0 (185 assets, classified, owners assigned)", attempt: "1 of 3",
    coverExample: "First submission. All 185 assets recorded and classified; 8 ownerless assets flagged with remediation owners; CIA rationale added for all Confidential items.",
    feedback: [],
    rubric: [
      { dim: "Specificity", score: "4", anchor: "All assets named with system/location; no vague entries." },
      { dim: "Standards Alignment", score: "4", anchor: "Three-tier scheme applied per A.5.12; personal-data items not Public." },
      { dim: "Reasoning Quality", score: "3", anchor: "Classification rationale sound; ownerless-asset findings logically derived." },
      { dim: "Communication Quality", score: "3", anchor: "Register readable; minor inconsistency in owner-role naming." },
      { dim: "Risk Awareness", score: "3", anchor: "Sensitivity recognised; could note retention risk for archived PII." },
    ],
    aggregate: "3.4", lowest: "3", outcome: "SIGN-OFF",
    coaching: "You classified well — but ask yourself: are two of your 'Internal' shared drives really free of personal data? Walk me through how you'd confirm that before we sign off.", feedsNext: "Present the register for sign-off.",
  },
  "GRM-001/4.7": {
    title: "Basic Risk Register", standard: "ISO 27001 Clause 6.1.2/6.1.3 (risk assessment & treatment)", reviewer: "Cyber Risk Manager · Analytical Sleuth",
    artefact: "Basic Risk Register v2.0 (30 risks, 5×5 scored, treatments drafted)", attempt: "2 of 3",
    coverExample: "Revised after round-1 feedback: added threat sources to all risks, corrected 3 mis-banded categories, and added treatment owners + target dates.",
    feedback: ["Add an explicit threat source to every risk", "Fix 3 risks where the 5×5 category didn't match the score", "Assign a treatment owner and target date per risk"],
    rubric: [
      { dim: "Specificity", score: "4", anchor: "Risks specific with named assets and threat sources." },
      { dim: "Standards Alignment", score: "4", anchor: "Scoring and treatment align with Clause 6.1.2/6.1.3." },
      { dim: "Reasoning Quality", score: "4", anchor: "5×5 categories now match the arithmetic; treatment logic sound." },
      { dim: "Communication Quality", score: "3", anchor: "Clear; one-page management summary still a little dense." },
      { dim: "Risk Awareness", score: "4", anchor: "Top risks correctly prioritised by exposure." },
    ],
    aggregate: "3.8", lowest: "3", outcome: "SIGN-OFF",
    coaching: "Strong recovery from round 1. Before you present: which single risk would you escalate first, and can you justify it from the matrix alone? Rehearse that answer.", feedsNext: "Present the top-5 risks to management.",
  },
  "CRM-002/8.8": {
    title: "ISO 27001 Control Matrix", standard: "ISO 27001 Annex A (93 controls, 4 themes)", reviewer: "Compliance Manager · Analytical Sleuth",
    artefact: "ISO 27001 Control Matrix v1.0 (5 processes × 93 controls)", attempt: "1 of 3",
    coverExample: "First submission. Applicability marked for all 5 processes; implementation status and evidence type documented; top-5 uncontrolled risks identified.",
    feedback: [],
    rubric: [
      { dim: "Specificity", score: "3", anchor: "Most controls mapped specifically; a few 'N/A' lack rationale." },
      { dim: "Standards Alignment", score: "4", anchor: "Annex A mapping accurate across all four themes." },
      { dim: "Reasoning Quality", score: "3", anchor: "Gap-to-risk derivation logical." },
      { dim: "Communication Quality", score: "3", anchor: "Matrix legible; legend could be clearer." },
      { dim: "Risk Awareness", score: "2", anchor: "Under-weights the prod-DB access gap — a high-impact exposure treated as Medium." },
    ],
    aggregate: "3", lowest: "2", outcome: "SIGN-OFF",
    coaching: "Your mapping is solid, but look again at the production-database access gap. What's the worst-case if it's exploited? Re-justify its rating before we finalise.", feedsNext: "Feeds the readiness dashboard / briefing.",
  },
  "TV-001/7": {
    title: "Access Control Testing Report", standard: "ISO 27001 A.8.2/8.3/8.5/5.18 (access)", reviewer: "Information Security Auditor · Guardian Watchdog",
    artefact: "Access Control Testing Report v1.0 (30 accounts reviewed)", attempt: "1 of 3",
    coverExample: "First submission. Findings table complete with percentages; remediation actions listed for orphaned and dormant accounts.",
    feedback: [],
    rubric: [
      { dim: "Specificity", score: "3", anchor: "Findings specific per account." },
      { dim: "Standards Alignment", score: "3", anchor: "Aligned with A.8.2 privileged-access expectations." },
      { dim: "Reasoning Quality", score: "3", anchor: "Logic mostly sound." },
      { dim: "Communication Quality", score: "3", anchor: "Report clear and well-structured." },
      { dim: "Risk Awareness", score: "1", anchor: "CRITICAL MISS: an orphaned ADMIN account (lapsed employee) was logged as low priority — fails to recognise the severity; this is the headline risk." },
    ],
    aggregate: "2.6", lowest: "1", outcome: "REVISE",
    coaching: "Stop before issuing. You found an orphaned admin account for someone who left — why is that not your number-one finding? Re-rank by blast radius and resubmit; we don't sign off with that buried.", feedsNext: "Issue the Access Control Testing Report to the IT Manager.",
  },
  "BCRP-001/8": {
    title: "BIA Report", standard: "ISO 27001 A.5.29/5.30 (continuity & ICT readiness)", reviewer: "Business Continuity & Resilience Analyst · Operational Maestro",
    artefact: "BIA Report v1.0 (1 department, 5 critical functions)", attempt: "1 of 3",
    coverExample: "First submission. Five critical functions ranked by impact; RTO/RPO set; 10 single points of failure flagged with proposed workarounds and owners.",
    feedback: [],
    rubric: [
      { dim: "Specificity", score: "4", anchor: "Functions and dependencies specifically described." },
      { dim: "Standards Alignment", score: "3", anchor: "RTO/RPO consistent with A.5.30 readiness expectations." },
      { dim: "Reasoning Quality", score: "4", anchor: "Impact ranking well-reasoned." },
      { dim: "Communication Quality", score: "3", anchor: "Report clear; RTO/RPO table could note assumptions." },
      { dim: "Risk Awareness", score: "4", anchor: "SPOFs and continuity risks well recognised." },
    ],
    aggregate: "3.6", lowest: "3", outcome: "SIGN-OFF",
    coaching: "Good analysis. The single-ISP-link SPOF — what's the realistic cost of an hour's outage to call handling? Put a number on it; the manager will ask, and it strengthens your case for redundancy.", feedsNext: "Finalise and present the BIA Report.",
  },
  "CA-002/6": {
    title: "Executive Compliance Status Report", standard: "ISO 27001 Clause 9.3 (management review); 9.1", reviewer: "Compliance Manager · Bridge Builder",
    artefact: "Executive Compliance Status Report v2.0 (one page)", attempt: "2 of 3",
    coverExample: "Revised after round-1 feedback: removed jargon (leverage/synergy/posture), added concrete percentages to every claim, and sharpened the open-decisions section.",
    feedback: ["Replace jargon with plain English", "Add concrete numbers/percentages to every status claim", "Make the 'decision needed' items explicit with dates"],
    rubric: [
      { dim: "Specificity", score: "4", anchor: "Each claim now backed by a specific figure." },
      { dim: "Standards Alignment", score: "3", anchor: "RAG status consistent with the underlying tasks." },
      { dim: "Reasoning Quality", score: "3", anchor: "Conclusions follow from the data." },
      { dim: "Communication Quality", score: "4", anchor: "Plain, jargon-free, fits one page — clear improvement." },
      { dim: "Risk Awareness", score: "3", anchor: "Top risks surfaced; outlook reasonable." },
    ],
    aggregate: "3.4", lowest: "3", outcome: "SIGN-OFF",
    coaching: "Much clearer than round 1. One last thing: your 'Amber' overall status — if the CEO asks 'what one decision turns this Green?', can you answer in a sentence? Lead with that.", feedsNext: "Email the one-page report to management.",
  },
};

export function getReviewTask(taskCode?: string, activityCode?: string): ReviewTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return REVIEW_TASKS[`${taskCode}/${activityCode}`];
}
