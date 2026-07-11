// Controls register per task code. Derived from RUA_TASKS — each task already carries its
// primary-standard `controls` and its NIST CSF `crosswalk`, so this file adds only what the UI
// needs on top: a tone, a domain label, and a one-line purpose per clause.

import { RUA_TASKS } from "./rua-tasks";
import { TASK_META } from "./taskmeta";

export interface Control { standard: string; tone: string; domain: string; num: string; name: string; purpose?: string; }
export interface TaskControls { category: string; controls: Control[]; }

const TONE: Record<string, string> = {
  "ISO/IEC 27001:2022": "indigo",
  "NIST CSF 2.0": "violet",
  "CIS Controls v8": "emerald",
  "GDPR (EU) 2016/679": "rose",
  "SOC 2 Type II (AICPA Trust Services Criteria)": "amber",
};

const CSF_FUNCTION: Record<string, string> = {
  GV: "Govern", ID: "Identify", PR: "Protect", DE: "Detect", RS: "Respond", RC: "Recover",
};

/** ISO Annex A theme by clause number; management-system clauses handled separately. */
const ISO_THEME = ["Organizational controls", "People controls", "Physical controls", "Technological controls"];

function domainOf(standard: string, ref: string): string {
  if (standard.startsWith("ISO")) {
    if (ref.startsWith("Clause")) return "Management system clause";
    const n = Number(ref.replace("Annex A ", "").split(".")[0]);
    return ISO_THEME[n - 5] ?? "Annex A";
  }
  if (standard.startsWith("NIST")) return CSF_FUNCTION[ref.slice(0, 2)] ?? "Implementation Tiers";
  if (standard.startsWith("CIS")) return "Basic Cyber Hygiene (IG1)";
  if (standard.startsWith("GDPR")) return ref.startsWith("Recital") ? "Recital" : "Regulation article";
  return "Trust Services Criteria";
}

/** One line on why the control exists. Keyed by ref — a clause means the same thing in every task. */
const PURPOSE: Record<string, string> = {
  // ISO/IEC 27001:2022 — management system clauses
  "Clause 4.1": "Determine the internal and external issues that affect the ISMS.",
  "Clause 4.2": "Identify interested parties and what they require of the ISMS.",
  "Clause 5.2": "Establish an information security policy appropriate to the organisation.",
  "Clause 5.3": "Assign and communicate roles, responsibilities and authorities.",
  "Clause 6.1.2": "Define and apply a repeatable information security risk assessment process.",
  "Clause 6.1.3": "Select risk treatment options and the controls needed to implement them.",
  "Clause 6.2": "Set measurable information security objectives and plan how to reach them.",
  "Clause 7.5": "Maintain the documented information the ISMS requires.",
  "Clause 7.5.2": "Ensure documents are properly identified, formatted and approved when created or changed.",
  "Clause 7.5.3": "Control distribution, access, versioning and retention of documented information.",
  "Clause 9.1": "Monitor, measure, analyse and evaluate security performance.",
  "Clause 9.3": "Review the ISMS at management level for continuing suitability and effectiveness.",
  "Clause 10.1": "Continually improve the suitability, adequacy and effectiveness of the ISMS.",
  "Clause 10.2": "React to nonconformities, correct them and address their causes.",
  // ISO/IEC 27001:2022 — Annex A
  "Annex A": "The full control set an organisation selects from when treating risk.",
  "Annex A 5.1": "Define, approve and communicate information security policies.",
  "Annex A 5.9": "Establish and maintain a complete inventory of information assets and their owners.",
  "Annex A 5.12": "Classify information by confidentiality, integrity and availability needs.",
  "Annex A 5.18": "Provision, review and revoke access rights in line with the access control policy.",
  "Annex A 5.19": "Manage the information security risks that come with using suppliers.",
  "Annex A 5.20": "Agree and document security requirements with each supplier.",
  "Annex A 5.21": "Manage security risk across the ICT products and services supply chain.",
  "Annex A 5.22": "Monitor, review and manage change in the services suppliers deliver.",
  "Annex A 5.26": "Respond to information security incidents according to documented procedures.",
  "Annex A 5.27": "Use knowledge gained from incidents to strengthen controls.",
  "Annex A 5.28": "Identify, collect and preserve evidence relating to security events.",
  "Annex A 5.29": "Plan how information security is maintained during disruption.",
  "Annex A 5.30": "Ensure ICT is ready to meet business continuity objectives.",
  "Annex A 5.31": "Identify and meet legal, statutory, regulatory and contractual requirements.",
  "Annex A 5.35": "Have the approach to information security reviewed independently at intervals.",
  "Annex A 5.36": "Check that policies, rules and standards are actually being followed.",
  "Annex A 6.1": "Verify the background of candidates before employment.",
  "Annex A 6.2": "State information security responsibilities in employment terms.",
  "Annex A 6.3": "Give personnel awareness, education and training relevant to their role.",
  "Annex A 6.6": "Put confidentiality and non-disclosure agreements in place where needed.",
  "Annex A 6.7": "Protect information accessed, processed or stored while working remotely.",
  "Annex A 6.8": "Give personnel a route to report observed or suspected security events.",
  "Annex A 8.1": "Protect information on user endpoint devices.",
  "Annex A 8.2": "Restrict and manage the allocation of privileged access rights.",
  "Annex A 8.3": "Restrict access to information in line with the access control policy.",
  "Annex A 8.5": "Require secure authentication before granting access to systems.",
  "Annex A 8.13": "Take and test backups of information, software and systems.",
  "Annex A 8.14": "Provide enough redundancy to meet availability requirements.",
  // NIST CSF 2.0 — categories referenced as primary standard
  "GV.OC": "Understand the organisational context that shapes cybersecurity risk decisions.",
  "GV.PO": "Establish, communicate and enforce cybersecurity policy.",
  "GV.RM": "Establish risk management objectives, appetite and tolerance.",
  "Tiers 1–4": "Describe how rigorous and adaptive an organisation's risk practices are.",
  // CIS Controls v8
  "CIS 1": "Actively manage all enterprise assets connected to the infrastructure.",
  "CIS 2": "Actively manage all software so that only authorised software is installed.",
  "CIS 3": "Identify, classify and securely handle and dispose of data.",
  "CIS 4": "Establish and maintain secure configurations for hardware and software.",
  "CIS 5": "Manage the lifecycle of system and application accounts.",
  "CIS 6": "Grant, manage and revoke access based on least privilege.",
  "CIS 1.1": "Keep a detailed inventory of every enterprise asset, reviewed twice a year.",
  "CIS 3.3": "Restrict data access to the users and services that need it.",
  "CIS 5.2": "Require unique, sufficiently long passwords on every account.",
  "CIS 5.3": "Disable accounts that have gone dormant, within 45 days.",
  "CIS 6.1": "Run a documented process for granting access on hire or role change.",
  // GDPR
  "Article 4": "Establish what counts as personal data, processing, controller and processor.",
  "Article 5(1)(e)": "Keep personal data no longer than necessary for the stated purpose.",
  "Article 13": "Tell data subjects how their data is used when you collect it from them.",
  "Article 14": "Tell data subjects how their data is used when you obtained it elsewhere.",
  "Article 13 & 14": "Ensure data subjects are informed about the processing of their data.",
  "Article 17": "Erase personal data on request where no lawful ground to retain it remains.",
  "Article 30": "Maintain a record of processing activities for each process.",
  "Article 35": "Determine whether a Data Protection Impact Assessment is required.",
  "Recital 39": "Processing must be transparent to the people whose data it is.",
  // SOC 2
  "CC1–CC9": "The Common Criteria every SOC 2 report is assessed against.",
  "A1": "Criteria covering system availability against the service commitment.",
  "C1": "Criteria covering protection of information designated as confidential.",
};

function toControls(code: string): TaskControls | undefined {
  const rua = RUA_TASKS[code];
  if (!rua) return undefined;
  const primary: Control[] = rua.controls.map((c) => ({
    standard: rua.standard,
    tone: TONE[rua.standard] ?? "indigo",
    domain: domainOf(rua.standard, c.ref),
    num: c.ref,
    name: c.name,
    purpose: PURPOSE[c.ref],
  }));
  // Skip the crosswalk when the task's own standard is already NIST CSF.
  const crosswalk: Control[] = rua.standard.startsWith("NIST") ? [] : rua.crosswalk.map((x) => ({
    standard: "NIST CSF 2.0",
    tone: "violet",
    domain: CSF_FUNCTION[x.code.slice(0, 2)] ?? "Cross-walk",
    num: x.code,
    name: x.desc,
  }));
  return { category: TASK_META[code]?.methodCategory ?? rua.standard, controls: [...primary, ...crosswalk] };
}

export const CONTROLS_BY_TASK: Record<string, TaskControls> = Object.fromEntries(
  Object.keys(RUA_TASKS).map((code) => [code, toControls(code)!]),
);
