// Controls register per task code. Derived from RUA_TASKS — each task already carries its
// primary-standard `controls` and its NIST CSF `crosswalk`, so this file adds only what the UI
// needs on top: a tone, a domain label, and a one-line purpose per clause.

import { TASK_CONTROL_DATA } from "./task-controls";
import { TASK_META } from "./taskmeta";

export interface Control {
  standard: string; tone: string; domain: string; num: string; name: string;
  /** OUR one-line gloss. Never the standard's words — it renders labelled, outside the plaque. */
  purpose?: string;
  /**
   * The clause text itself, verbatim, when we are licensed to reproduce it.
   *
   * Empty for every ISO/IEC and AICPA clause: their text is copyright and we hold no licence, so
   * the plaque renders the published control *title* and says the clause text is not reproduced.
   * Fill this from a licensed copy — see CLAUSE_TEXT below — and the plaque quotes it instead,
   * with no other change. Nothing may be written here that is not word-for-word from the source.
   */
  text?: string;
}
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

/**
 * Verbatim clause text, keyed by reference — the only place the plaque may quote from.
 *
 * Deliberately empty. ISO/IEC 27001:2022 Annex A text is ISO's copyright and reproducing it in a
 * product served to learners needs a redistribution licence (national bodies: BSI, ANSI, DIN).
 * The same holds for the AICPA Trust Services Criteria. NIST CSF 2.0 is a US Government work and
 * free to reproduce; GDPR is Official Journal text and reusable with attribution — those two may
 * be filled in without a licence, from the published source, copied not recalled.
 *
 * Rules for anything added here:
 *   1. Word for word from the source document. Not a summary, not a tidy-up, not a recollection.
 *   2. Whole clause. The plaque may never truncate mid-clause.
 *   3. If you are unsure it is exact, leave it out — the plaque falls back to the published title
 *      and says so, which is honest. A wrong quotation under a "verbatim" caption is not.
 */
const CLAUSE_TEXT: Record<string, string> = {
  // e.g. "GV.SC-05": "Requirements to address cybersecurity risks in supply chains are …",
};

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
  // CIS Controls v8 — reached through the cross-walk on ISO- and GDPR-anchored tasks.
  "Control 5": "Know every account that exists, who owns it, and close the ones nobody owns.",
  "Control 6": "Grant access by role and least privilege, and withdraw it when the role changes.",
  "Control 11": "Be able to restore data after loss or corruption — and prove the restore works.",
  "Control 11.1": "Run a written, repeatable recovery process rather than improvising after a loss.",
  "Control 11.4": "Keep one recovery copy isolated, so whatever damages production cannot reach it.",
  "Control 14": "Train people against the risks their own role exposes them to.",
  "Control 14.1": "Run a standing awareness programme, not a one-off induction slide.",
  "Control 14.2": "Give role-specific training to anyone carrying security responsibilities.",
  "Control 14.7": "Train users to recognise social engineering and to know how to report it.",
  "Control 15": "Know which providers hold your data or run your processes, and manage that exposure.",
  "Control 15.2": "Have a route for raising a weakness found in a provider and seeing it closed.",
  "Control 17": "Define the incident response capability before an incident, not during one.",
  "Control 17.8": "Review each incident afterwards and feed what it taught you back into the plan.",
  "Control 18": "Test defences by attempting to defeat them; at GRC 101 you only need to know it exists.",
  "Control 3.11": "Encrypt sensitive data where it is stored, not only where it travels.",
  "Control 3.14": "Log access to sensitive data, so who saw what can be reconstructed later.",
  // NIST CSF 2.0 — the cross-walk target on every non-NIST task.
  "GV.OC-02": "Name the internal and external stakeholders whose interests shape security decisions.",
  "GV.OC-03": "Know which laws, regulations and contract terms apply, and who owns each obligation.",
  "GV.OC-04": "Make sure every party understands which security responsibilities are theirs.",
  "GV.OC-05": "Keep track of the legal, regulatory and contractual requirements you have to meet.",
  "GV.PO-01": "Set a written policy saying how cybersecurity risk will be managed here.",
  "GV.PO-02": "Review that policy on a schedule, and make sure the people bound by it have seen it.",
  "GV.RM-01": "Agree what risk management is meant to achieve before assessing anything.",
  "GV.RM-06": "Decide how much risk is acceptable, and tell the people who make decisions.",
  "GV.RM-07": "Choose a response to each risk — accept, mitigate, transfer, avoid — and see it through.",
  "GV.SC-04": "Tell suppliers and third parties what is expected of them.",
  "GV.SC-06": "Do the due diligence before signing, not after something has gone wrong.",
  "GV.SC-07": "Assess the risk each supplier brings, sized to what they can actually reach.",
  "ID.AM-01": "Keep a current inventory of hardware, with a named owner against each item.",
  "ID.AM-02": "Keep a current inventory of software, including anything no longer supported.",
  "ID.AM-05": "Rank assets by what their loss would cost, so effort goes where it matters.",
  "ID.AM-08": "Record the systems and services that involve an external party.",
  "ID.RA-01": "Find the weaknesses in your assets before somebody else finds them.",
  "ID.RA-04": "Work out what each risk would cost and how likely it is to happen.",
  "ID.RA-06": "Record risks in a form that can be owned, tracked and reviewed.",
  "ID.RA-09": "Assess the risk third parties carry, and reflect it in what you report.",
  "PR.AA-01": "Manage identities and credentials across their whole life, from issue to revocation.",
  "PR.AA-02": "Check a person is who they claim before binding a credential to them.",
  "PR.AT-01": "Give everyone the awareness training their role requires.",
  "PR.AT-02": "Give anyone holding elevated privileges training matched to that privilege.",
  "PR.DS-01": "Protect data where it is stored.",
  "PR.DS-02": "Protect data while it moves between systems and people.",
  "PR.DS-10": "Protect data while it is being processed.",
  "PR.DS-11": "Take backups — and know they restore.",
  "PR.PS-04": "Generate logs of what happened, so events can be reconstructed afterwards.",
  "DE.AE-06": "Get information about an adverse event to the people who can act on it.",
  "DE.CM-09": "Monitor hardware and software for signs that something is wrong.",
  "RS.CO-02": "Report incidents to the people and bodies who need to know, inside the time required.",
  "RS.MA-01": "Run the response the plan describes instead of improvising under pressure.",
  "RC.IM-01": "Fold what the incident taught you back into the recovery plan.",
  "RC.RP-01": "Execute the recovery plan when it is needed.",
  "RC.RP-02": "Update the recovery plan as systems and dependencies change.",
  "RC.RP-03": "Keep people informed about recovery progress while it is happening.",
  // Family- and framework-level references — cited whole, so they carry no clause number.
  "Functions": "The six CSF Functions — Govern, Identify, Protect, Detect, Respond, Recover — used as the mapping frame.",
  "PR.DS": "Protecting data itself — at rest, in transit and in use.",
  "DE.CM": "Watching systems and people for signs that something has gone wrong.",
  // SOC 2
  "CC1–CC9": "The Common Criteria every SOC 2 report is assessed against.",
  "A1": "Criteria covering system availability against the service commitment.",
  "C1": "Criteria covering protection of information designated as confidential.",
};

/**
 * Which standard a cross-walk reference actually belongs to.
 *
 * Every cross-walk entry used to be stamped "NIST CSF 2.0" regardless of its code, so fifteen
 * tasks rendered cards headed `NIST CSF 2.0 · Control 11` — a CIS Controls v8 reference under
 * someone else's name. Wrong on its face, and in a programme that teaches control mapping it is
 * the one kind of error a learner will repeat in real work. The code shape says who owns it.
 */
export function standardForRef(code: string): string {
  if (/^(GV|ID|PR|DE|RS|RC)\./.test(code)) return "NIST CSF 2.0";
  if (/^Control\s/.test(code) || /^CIS/.test(code)) return "CIS Controls v8";
  if (/^(Clause|Annex)/.test(code)) return "ISO/IEC 27001:2022";
  if (/^(Article|Recital)/.test(code)) return "GDPR (EU) 2016/679";
  return "NIST CSF 2.0";
}

/**
 * Repair a cross-walk entry the extractor split badly.
 *
 * "CIS Controls v8 Control 11.1 and 11.4" was split on whitespace, leaving a second entry whose
 * code is the literal "and 11.4"; a continuation gets its "Control " prefix back.
 *
 * Nothing is dropped. An earlier pass here binned any code without a digit as a fragment, which
 * quietly deleted two real references: "Functions" (the CSF Functions, cross-walked against the
 * whole of Annex A on CRM-002 and GRM-003) and, at family level, "GV.OC"/"PR.DS" and the like.
 * A reference to a whole framework or a whole category is a legitimate thing to cite — it is not
 * malformed just because it carries no number.
 */
function normaliseCrossRef(x: { code: string; desc: string }): { code: string; desc: string } {
  const code = x.code.trim();
  const cont = code.match(/^and\s+(\d[\d.]*)$/i);
  return cont ? { ...x, code: `Control ${cont[1]}` } : { ...x, code };
}

function toControls(code: string): TaskControls | undefined {
  const rua = TASK_CONTROL_DATA[code];
  if (!rua) return undefined;
  const primary: Control[] = rua.controls.map((c) => ({
    standard: rua.standard,
    tone: TONE[rua.standard] ?? "indigo",
    domain: domainOf(rua.standard, c.ref),
    num: c.ref,
    name: c.name,
    purpose: PURPOSE[c.ref],
    text: CLAUSE_TEXT[c.ref],
  }));
  // Drop only the cross-walk rows that resolve to the task's *own* standard — a task cannot be
  // cross-walked against itself. This used to bin the whole array whenever the task was
  // NIST-anchored, which was right while every row was assumed to target NIST and wrong the moment
  // standardForRef() started reading the code: GRM-003 maps NIST onto ISO Clause 9.1, a real
  // cross-walk that simply runs the other way, and it was being thrown away.
  const crosswalk: Control[] = rua.crosswalk
        .map(normaliseCrossRef)
        .filter((x) => standardForRef(x.code) !== rua.standard)
        .map((x) => {
          const std = standardForRef(x.code);
          return {
            standard: std,
            tone: TONE[std] ?? "violet",
            domain: domainOf(std, x.code),
            num: x.code,
            name: x.desc,
            purpose: PURPOSE[x.code],
            text: CLAUSE_TEXT[x.code],
          };
        });
  return { category: TASK_META[code]?.methodCategory ?? rua.standard, controls: [...primary, ...crosswalk] };
}

export const CONTROLS_BY_TASK: Record<string, TaskControls> = Object.fromEntries(
  Object.keys(TASK_CONTROL_DATA).map((code) => [code, toControls(code)!]),
);

/** OUR plain-terms line for a reference, wherever it is cited. Never the standard's wording. */
export function purposeForRef(ref: string): string | undefined {
  return PURPOSE[ref];
}

/** Repair the one extractor artefact that reaches reference bodies as well as the cross-walk. */
export function normaliseRef(ref: string): string {
  const cont = ref.trim().match(/^and\s+(\d[\d.]*)$/i);
  return cont ? `Control ${cont[1]}` : ref.trim();
}
