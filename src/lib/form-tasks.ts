// Form-style worked tasks: Recommend / Validate / Draft / Schedule. Source: the respective verb
// registers. Each is a per-item completeness form (gate = required fields filled; Layer-2 quality is
// graded separately). `kind` selects the field schema in the workspace (FormFlow).

export type FormKind = "recommend" | "validate" | "draft" | "schedule" | "compile" | "document" | "signoff" | "score" | "assess";
export interface FormItem { id: number; label: string; options?: Record<string, string[]>; weight?: number; }
export interface FormTask {
  kind: FormKind; title: string; standard: string; itemLabel: string;
  owners?: string[];
  /** Assess only: the maturity/RAG scale (label → numeric value, for outlier detection). */
  scale?: { label: string; value: number }[];
  items: FormItem[]; feedsNext: string;
}

export const FORM_TASKS: Record<string, FormTask> = {
  "AA-002/2.6": {
    kind: "recommend", title: "CIS Gap Remediation", standard: "CIS Controls v8 IG1", itemLabel: "gap",
    owners: ["Compliance Manager", "IT Manager", "Operations Manager"],
    feedsNext: "Feeds the Compile / Present step.",
    items: [
      { id: 1, label: "Default admin passwords" },
      { id: 2, label: "No MFA for admin/remote" },
      { id: 3, label: "No asset inventory" },
      { id: 4, label: "No patching policy" },
      { id: 5, label: "No data-protection process" },
      { id: 6, label: "No secure-config baseline" },
    ],
  },
  "GRM-001/4.6": {
    kind: "recommend", title: "Risk Treatment Options", standard: "ISO 27001 Cl 6.1.3", itemLabel: "gap",
    owners: ["Cyber Risk Manager", "IT Manager", "Vendor Risk Analyst"],
    feedsNext: "Feeds the Compile / Present step.",
    items: [
      { id: 1, label: "Phishing → account compromise (25, Critical)" },
      { id: 2, label: "Mis-sent client email (16, High)" },
      { id: 3, label: "Ransomware (15, High)" },
      { id: 4, label: "Unpatched VPN (12, Medium)" },
      { id: 5, label: "Vendor breach (8, Medium)" },
    ],
  },
  "IE-001/5": {
    kind: "validate", title: "Implementations vs Acceptance Criteria", standard: "CIS Controls v8 IG1 (acceptance criteria)", itemLabel: "finding",
    feedsNext: "Feeds the Recommend / Draft step.",
    items: [
      { id: 1, label: "Asset inventory deployed (CIS 1.1)" },
      { id: 2, label: "Data ACLs configured (CIS 3.3)" },
      { id: 3, label: "MFA on admin accounts (CIS 6.5)" },
      { id: 4, label: "Default accounts disabled (CIS 4.7)" },
      { id: 5, label: "Patch SLA operating (CIS 7.3)" },
      { id: 6, label: "Software inventory maintained (CIS 2.1)" },
    ],
  },
  "QA-001/7": {
    kind: "validate", title: "Correction-Request Closure", standard: "ISO 27001 Cl 7.5.2/7.5.3; A.5.36", itemLabel: "finding",
    feedsNext: "Feeds the Recommend / Draft step.",
    items: [
      { id: 1, label: "CR-01 Document control block added" },
      { id: 2, label: "CR-02 Review date updated" },
      { id: 3, label: "CR-03 MFA contradiction resolved (§3/§5)" },
      { id: 4, label: "CR-04 ISO citation corrected" },
      { id: 5, label: "CR-05 Acronyms defined" },
      { id: 6, label: "CR-06 Approval signatures obtained" },
    ],
  },
  "AA-002/2.7": {
    kind: "validate", title: "Gap Findings before Issue", standard: "CIS Controls v8 IG1", itemLabel: "finding",
    feedsNext: "Feeds the Recommend / Draft step.",
    items: [
      { id: 1, label: "No asset inventory (gap)" },
      { id: 2, label: "Default admin passwords (gap)" },
      { id: 3, label: "No MFA for admin (gap)" },
      { id: 4, label: "No patching policy (gap)" },
      { id: 5, label: "Weak data-protection process (gap)" },
      { id: 6, label: "No secure-config baseline (gap)" },
    ],
  },
  "GRM-002/5.3": {
    kind: "draft", title: "Acceptable Use Policy", standard: "ISO 27001 Cl 5.2; A.5.1; A.6.7; A.8.1", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Document Control" },
      { id: 2, label: "Purpose" },
      { id: 3, label: "Scope" },
      { id: 4, label: "Definitions" },
      { id: 5, label: "Policy Statements" },
      { id: 6, label: "Roles & Responsibilities" },
      { id: 7, label: "Exceptions" },
      { id: 8, label: "Related Documents" },
      { id: 9, label: "Review History" },
    ],
  },
  "DD-001/3": {
    kind: "draft", title: "Incident Reporting Procedure", standard: "ISO 27001 A.6.8; A.5.26; A.5.28", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Purpose" },
      { id: 2, label: "Scope" },
      { id: 3, label: "Definitions" },
      { id: 4, label: "How to Recognise an Incident" },
      { id: 5, label: "How to Report" },
      { id: 6, label: "Escalation Path" },
      { id: 7, label: "Confidentiality Obligations" },
      { id: 8, label: "Responsibilities" },
      { id: 9, label: "Document Control" },
    ],
  },
  "DD-003/6": {
    kind: "draft", title: "Data Disposal Instruction", standard: "GDPR Art 5(1)(e); Art 17", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Purpose" },
      { id: 2, label: "Scope" },
      { id: 3, label: "Disposal Methods" },
      { id: 4, label: "Verification & Evidence" },
      { id: 5, label: "Responsibilities" },
      { id: 6, label: "Records" },
      { id: 7, label: "Document Control" },
    ],
  },
  "LRC-001/5": {
    kind: "draft", title: "Privacy Notice", standard: "GDPR Art 13; Art 14", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Who We Are" },
      { id: 2, label: "Data We Collect" },
      { id: 3, label: "Purposes & Lawful Basis" },
      { id: 4, label: "Recipients" },
      { id: 5, label: "International Transfers" },
      { id: 6, label: "Retention" },
      { id: 7, label: "Your Rights" },
      { id: 8, label: "Right to Complain" },
      { id: 9, label: "Automated Decisions" },
      { id: 10, label: "Source of Data" },
      { id: 11, label: "Contact / DPO" },
    ],
  },
  "PE-001/4": {
    kind: "draft", title: "Project Charter", standard: "ISO 27001 Cl 6.2; Cl 5.3", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Background" },
      { id: 2, label: "Objectives" },
      { id: 3, label: "Success Criteria" },
      { id: 4, label: "Scope" },
      { id: 5, label: "Out-of-Scope" },
      { id: 6, label: "Deliverables" },
      { id: 7, label: "Team & Governance" },
      { id: 8, label: "Risks/Assumptions" },
      { id: 9, label: "Sign-off" },
    ],
  },
  "BCRP-002/4": {
    kind: "draft", title: "ICT DR Checklist", standard: "ISO 27001 A.5.30; A.8.13; A.8.14", itemLabel: "section",
    feedsNext: "Feeds the Review (mentor sign-off) / Present step.",
    items: [
      { id: 1, label: "Preparation" },
      { id: 2, label: "Incident Detection/Declaration" },
      { id: 3, label: "Backup Retrieval" },
      { id: 4, label: "Restoration Sequence" },
      { id: 5, label: "Validation Testing" },
      { id: 6, label: "Return to Normal & Sign-off" },
      { id: 7, label: "RTO/RPO Criteria" },
      { id: 8, label: "Document Control" },
    ],
  },
  "AA-002/2.2": {
    kind: "schedule", title: "Evidence Walkthroughs", standard: "CIS Controls v8 IG1", itemLabel: "interaction",
    feedsNext: "Confirmed calendar entry persisted; reminder armed.",
    items: [
      { id: 1, label: "IT Manager", options: { time: ["Mon 10:00", "Tue 14:00", "Wed 11:00"] } },
      { id: 2, label: "Systems Administrator", options: { time: ["Tue 10:00", "Wed 15:00", "Thu 09:00"] } },
      { id: 3, label: "Network/Operations Lead", options: { time: ["Wed 10:00", "Thu 13:00", "Fri 11:00"] } },
      { id: 4, label: "Data Owner", options: { time: ["Thu 10:00", "Fri 14:00", "Mon 09:00"] } },
      { id: 5, label: "Service Desk Lead", options: { time: ["Fri 10:00", "Mon 11:00", "Tue 15:00"] } },
    ],
  },
  "MM-001/8": {
    kind: "schedule", title: "Recurring KPI Data Invites", standard: "ISO 27001 Cl 9.1", itemLabel: "interaction",
    feedsNext: "Confirmed calendar entry persisted; reminder armed.",
    items: [
      { id: 1, label: "Policy data owner", options: { time: ["1st Mon 09:00", "1st Tue 09:00", "1st Wed 09:00"] } },
      { id: 2, label: "Training data owner", options: { time: ["1st Mon 10:00", "1st Tue 10:00", "1st Wed 10:00"] } },
      { id: 3, label: "Incident data owner", options: { time: ["1st Mon 11:00", "1st Tue 11:00", "1st Wed 11:00"] } },
      { id: 4, label: "Access data owner", options: { time: ["1st Tue 09:00", "1st Wed 09:00", "1st Thu 09:00"] } },
      { id: 5, label: "Vendor data owner", options: { time: ["1st Tue 10:00", "1st Wed 10:00", "1st Thu 10:00"] } },
    ],
  },
  "MM-002/1": {
    kind: "schedule", title: "Risk Register Review Meeting", standard: "ISO 27001 Cl 9.1; 6.1", itemLabel: "interaction",
    feedsNext: "Confirmed calendar entry persisted; reminder armed.",
    items: [
      { id: 1, label: "Risk Owner 1 (Business-Unit Manager)", options: { time: ["Tue 14:00", "Wed 10:00", "Thu 15:00"] } },
      { id: 2, label: "Risk Owner 2 (Operations Lead)", options: { time: ["Tue 14:00", "Wed 10:00", "Thu 15:00"] } },
      { id: 3, label: "Cyber Risk Manager (mentor)", options: { time: ["Wed 10:00", "Wed 11:00"] } },
      { id: 4, label: "Pre-read circulation", options: { time: ["Mon 09:00", "Mon 13:00"] } },
    ],
  },
  "CA-001/1": {
    kind: "schedule", title: "All-Staff Awareness Session", standard: "ISO 27001 A.6.3", itemLabel: "interaction",
    feedsNext: "Confirmed calendar entry persisted; reminder armed.",
    items: [
      { id: 1, label: "HR Manager", options: { time: ["Wed 11:00", "Thu 14:00", "Fri 10:00"] } },
      { id: 2, label: "Facilities/Operations", options: { time: ["Thu 13:30", "Thu 14:00"] } },
      { id: 3, label: "Department heads", options: { time: ["Thu 14:00"] } },
      { id: 4, label: "IT (AV test)", options: { time: ["Thu 13:30", "Thu 13:45"] } },
    ],
  },
  "AA-002/2.8": {
    kind: "compile", title: "CIS Gap Analysis Report", standard: "CIS Controls v8 IG1", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Executive Summary" },
      { id: 2, label: "Scope & Objectives" },
      { id: 3, label: "Methodology" },
      { id: 4, label: "Compliance Findings" },
      { id: 5, label: "Top Gaps" },
      { id: 6, label: "Remediation Plan" },
      { id: 7, label: "Conclusion" },
    ],
  },
  "TV-002/8": {
    kind: "compile", title: "Spot-Check Report", standard: "ISO 27001 A.5.36; A.6.3", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Executive Summary" },
      { id: 2, label: "Scope (3 policies)" },
      { id: 3, label: "Method" },
      { id: 4, label: "Compliance Rates" },
      { id: 5, label: "Findings" },
      { id: 6, label: "Recommendations" },
      { id: 7, label: "Conclusion" },
    ],
  },
  "CA-003/6": {
    kind: "compile", title: "Stakeholder Needs Discovery Report", standard: "ISO 27001 Cl 4.2", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Executive Summary" },
      { id: 2, label: "Interviews Conducted" },
      { id: 3, label: "Method" },
      { id: 4, label: "Common Themes" },
      { id: 5, label: "Key Quotes" },
      { id: 6, label: "Implications" },
      { id: 7, label: "Recommendations" },
    ],
  },
  "PE-002/6": {
    kind: "compile", title: "Audit Evidence Pack", standard: "ISO 27001 Cl 7.5; A.5.35", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Cover / Index" },
      { id: 2, label: "Controls Covered" },
      { id: 3, label: "Evidence Items" },
      { id: 4, label: "Validation Notes" },
      { id: 5, label: "Gaps / Pending" },
      { id: 6, label: "Self-Review" },
      { id: 7, label: "Sign-off Block" },
    ],
  },
  "QA-001/4": {
    kind: "compile", title: "Quality Review Report", standard: "ISO 27001 Cl 7.5.2/7.5.3", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Executive Summary" },
      { id: 2, label: "Documents Reviewed" },
      { id: 3, label: "Method" },
      { id: 4, label: "Correction Requests" },
      { id: 5, label: "Major Deficiencies" },
      { id: 6, label: "Minor Deficiencies" },
      { id: 7, label: "Closure Status" },
    ],
  },
  "KT-002/6": {
    kind: "compile", title: "Mentee Portfolio Index", standard: "ISO 27001 (programme close)", itemLabel: "section",
    feedsNext: "The assembled deliverable is the task's primary audit artefact.",
    items: [
      { id: 1, label: "Index Cover" },
      { id: 2, label: "Deliverables Produced" },
      { id: 3, label: "Verbs Practised" },
      { id: 4, label: "Badges Earned" },
      { id: 5, label: "Links / References" },
      { id: 6, label: "Lessons Learned" },
      { id: 7, label: "Sign-off" },
    ],
  },
  "AA-003/3.6": {
    kind: "document", title: "Data-Flow Findings", standard: "GDPR Art 30/35", itemLabel: "section",
    feedsNext: "The documented artefact feeds future Compile / Review steps.",
    items: [
      { id: 1, label: "Process" },
      { id: 2, label: "Data flow" },
      { id: 3, label: "Lawful basis" },
      { id: 4, label: "Gaps" },
      { id: 5, label: "Disposition" },
      { id: 6, label: "References" },
    ],
  },
  "CRM-002/8.3": {
    kind: "document", title: "Control Applicability Record", standard: "ISO 27001 Annex A", itemLabel: "section",
    feedsNext: "The documented artefact feeds future Compile / Review steps.",
    items: [
      { id: 1, label: "Control" },
      { id: 2, label: "Applicability rationale" },
      { id: 3, label: "Status" },
      { id: 4, label: "Evidence type" },
      { id: 5, label: "Owner" },
      { id: 6, label: "References" },
    ],
  },
  "AA-003/3.8": {
    kind: "signoff", title: "RoPA/DPIA (Process Owner)", standard: "GDPR Art 30/35", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "RoPA entry — student enrolment" },
      { id: 2, label: "DPIA screening disposition (required)" },
      { id: 3, label: "Lawful-basis documentation" },
    ],
  },
  "GRM-002/5.7": {
    kind: "signoff", title: "InfoSec Policy (Management)", standard: "ISO 27001 Cl 5.2; A.5.1", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "Acceptable Use Policy v1.0" },
      { id: 2, label: "ISO control references" },
      { id: 3, label: "Exceptions process" },
    ],
  },
  "DD-003/8": {
    kind: "signoff", title: "Retention Schedule (Legal/Owner)", standard: "GDPR Art 5(1)(e); Art 17", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "Retention Schedule (employee records)" },
      { id: 2, label: "Disposal Instruction" },
      { id: 3, label: "Payroll retention (7-year)" },
    ],
  },
  "LRC-001/8": {
    kind: "signoff", title: "Privacy Notice (DPO/Legal)", standard: "GDPR Art 13/14", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "Revised Privacy Notice draft" },
      { id: 2, label: "Transfer safeguards (US email)" },
      { id: 3, label: "Retention statements" },
    ],
  },
  "PE-001/7": {
    kind: "signoff", title: "Project Charter (Sponsor)", standard: "ISO 27001 Cl 6.2; 5.3", itemLabel: "decision",
    feedsNext: "The Approval Record gates the next task.",
    items: [
      { id: 1, label: "Project Charter v1.0" },
      { id: 2, label: "Scope & out-of-scope" },
      { id: 3, label: "Resource plan" },
    ],
  },
  "CA-001/7": {
    kind: "score", title: "Knowledge-Check Rubric", standard: "ISO 27001 A.6.3", itemLabel: "dimension",
    feedsNext: "The scored rubric feeds Prioritise / Compile.",
    items: [
      { id: 1, label: "Phishing recognition", weight: 1 },
      { id: 2, label: "Passwords & MFA", weight: 1 },
      { id: 3, label: "Clean desk / clear screen", weight: 1 },
      { id: 4, label: "Data handling / classification", weight: 1 },
      { id: 5, label: "Incident reporting", weight: 1 },
    ],
  },
  "GRM-003/6.4": {
    kind: "score", title: "CSF Maturity Rubric", standard: "NIST CSF 2.0", itemLabel: "dimension",
    feedsNext: "The scored rubric feeds Prioritise / Compile.",
    items: [
      { id: 1, label: "Govern", weight: 2 },
      { id: 2, label: "Identify", weight: 1 },
      { id: 3, label: "Protect", weight: 2 },
      { id: 4, label: "Detect", weight: 2 },
      { id: 5, label: "Respond", weight: 1 },
      { id: 6, label: "Recover", weight: 1 },
    ],
  },
  "CRM-003/9.6": {
    kind: "assess", title: "SOC 2 Readiness (RAG)", standard: "SOC 2 Type II (AICPA TSC)", itemLabel: "item",
    scale: [{ label: "Red", value: 1 }, { label: "Amber", value: 2 }, { label: "Green", value: 3 }],
    feedsNext: "The assessment feeds Prioritise / Recommend / Compile.",
    items: [
      { id: 1, label: "CC1 Control Environment" },
      { id: 2, label: "CC2 Communication & Information" },
      { id: 3, label: "CC3 Risk Assessment" },
      { id: 4, label: "CC5 Control Activities" },
      { id: 5, label: "CC6 Logical & Physical Access" },
      { id: 6, label: "CC7 System Monitoring" },
    ],
  },
};

export function getFormTask(taskCode?: string, activityCode?: string): FormTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return FORM_TASKS[`${taskCode}/${activityCode}`];
}
