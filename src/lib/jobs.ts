// Curated entry-level GRC job catalogue — fixed product reference data (mirrors the mockup).
// Match is NOT stored: it's *derived at runtime* from the user's /me/learnings tree, so it
// rises as the mentee completes the tasks each role's responsibilities are mapped to.

import type { Learnings, TaskStatus } from "./learnings";
import { TASK_META } from "./taskmeta";

export type JobSource = "LinkedIn" | "We Work Remotely" | "Remote.co" | "Indeed";

export interface JobResponsibility {
  /** The real duty as it would read on a job post. */
  duty: string;
  /** Canonical method verb this duty exercises (matches lib/verbs.ts). */
  verb: string;
  /** The GRC 101 task code whose work backs this duty (matches lib/taskmeta.ts). */
  task: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  initials: string;
  tone: "indigo" | "violet" | "emerald" | "amber" | "rose";
  source: JobSource;
  location: string;
  type: string;
  level: string;
  salary: string;
  /** The role's primary function, surfaced as the "maps to your work" anchor. */
  jobFunction: string;
  /** A short grouping anchor (method-category code + name) the function maps to. */
  project: { code: string; title: string };
  /** Standards the role expects, matched against the standards you've engaged. */
  standards: string[];
  responsibilities: JobResponsibility[];
}

export const JOB_SOURCES = ["All sources", "LinkedIn", "We Work Remotely", "Remote.co", "Indeed"] as const;

export const JOBS: Job[] = [
  {
    id: "grc-analyst-cloudbridge",
    title: "GRC Analyst",
    company: "CloudBridge Technologies",
    initials: "CB",
    tone: "indigo",
    source: "LinkedIn",
    location: "Remote · UK",
    type: "Full-time",
    level: "Entry / Analyst",
    salary: "£32k–£40k",
    jobFunction: "Risk & Controls Assessment",
    project: { code: "AA", title: "Assessment and Analysis" },
    standards: ["ISO/IEC 27001:2022", "CIS Controls v8", "GDPR"],
    responsibilities: [
      { duty: "Maintain the information asset inventory and apply data classification", verb: "record", task: "AA-001" },
      { duty: "Run security control gap analysis against CIS Controls v8 IG1", verb: "assess", task: "AA-002" },
      { duty: "Map personal-data flows and assess GDPR applicability", verb: "map", task: "AA-003" },
      { duty: "Maintain the operational risk register", verb: "record", task: "GRM-001" },
    ],
  },
  {
    id: "infosec-analyst-northwind",
    title: "Information Security Analyst",
    company: "Northwind Digital",
    initials: "NW",
    tone: "violet",
    source: "LinkedIn",
    location: "Hybrid · Manchester",
    type: "Full-time",
    level: "Entry / Analyst",
    salary: "£34k–£42k",
    jobFunction: "Policy & Governance",
    project: { code: "GRM", title: "Governance and Risk Management" },
    standards: ["ISO/IEC 27001:2022", "NIST CSF 2.0"],
    responsibilities: [
      { duty: "Draft information security policies aligned to ISO 27001", verb: "draft", task: "GRM-002" },
      { duty: "Assess departmental GRC maturity against NIST CSF", verb: "assess", task: "GRM-003" },
      { duty: "Develop the incident reporting procedure", verb: "draft", task: "DD-001" },
      { duty: "Set up document version control for policy roll-out", verb: "document", task: "IE-002" },
    ],
  },
  {
    id: "compliance-analyst-meridian",
    title: "Compliance Analyst",
    company: "Meridian Trust",
    initials: "MT",
    tone: "emerald",
    source: "Indeed",
    location: "Remote · EU",
    type: "Full-time",
    level: "Entry / Associate",
    salary: "€36k–€45k",
    jobFunction: "Compliance Management",
    project: { code: "CRM", title: "Compliance and Regulatory Management" },
    standards: ["ISO/IEC 27001:2022", "SOC 2"],
    responsibilities: [
      { duty: "Build and maintain the regulatory obligations register", verb: "record", task: "CRM-001" },
      { duty: "Map ISO 27001 controls to core business processes", verb: "map", task: "CRM-002" },
      { duty: "Map operations to SOC 2 Trust Services Criteria", verb: "map", task: "CRM-003" },
      { duty: "Prepare and file audit evidence for assessors", verb: "compile", task: "PE-002" },
    ],
  },
  {
    id: "privacy-associate-lumen",
    title: "Privacy & Data Protection Associate",
    company: "Lumen Health",
    initials: "LH",
    tone: "rose",
    source: "Remote.co",
    location: "Remote · UK",
    type: "Full-time",
    level: "Entry / Associate",
    salary: "£33k–£41k",
    jobFunction: "Data Privacy",
    project: { code: "AA", title: "Assessment and Analysis" },
    standards: ["GDPR", "ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Map data flows and assess GDPR applicability", verb: "map", task: "AA-003" },
      { duty: "Develop and maintain data retention schedules", verb: "draft", task: "DD-003" },
      { duty: "Review privacy notices and assess disclosure gaps", verb: "review", task: "LRC-001" },
      { duty: "Maintain the inventory of information assets and owners", verb: "record", task: "AA-001" },
    ],
  },
  {
    id: "it-risk-associate-vantage",
    title: "IT Risk & Controls Associate",
    company: "Vantage Systems",
    initials: "VS",
    tone: "indigo",
    source: "LinkedIn",
    location: "Hybrid · London",
    type: "Full-time",
    level: "Entry / Associate",
    salary: "£35k–£44k",
    jobFunction: "Risk Management",
    project: { code: "GRM", title: "Governance and Risk Management" },
    standards: ["ISO/IEC 27001:2022", "CIS Controls v8"],
    responsibilities: [
      { duty: "Identify operational risks and maintain the risk register", verb: "identify", task: "GRM-001" },
      { duty: "Track CIS Controls IG1 remediation to closure", verb: "record", task: "IE-001" },
      { duty: "Run access-control reviews and validate user accounts", verb: "validate", task: "TV-001" },
      { duty: "Run the monthly risk register review cycle", verb: "review", task: "MM-002" },
    ],
  },
  {
    id: "awareness-coordinator-brightpath",
    title: "Security Awareness & Training Coordinator",
    company: "BrightPath Learning",
    initials: "BP",
    tone: "amber",
    source: "We Work Remotely",
    location: "Remote · Global",
    type: "Full-time",
    level: "Entry / Coordinator",
    salary: "$48k–$58k",
    jobFunction: "Security Culture",
    project: { code: "DD", title: "Design and Development" },
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Develop security awareness training content", verb: "draft", task: "DD-002" },
      { duty: "Deliver staff security awareness briefings", verb: "present", task: "CA-001" },
      { duty: "Build the new-joiner GRC onboarding pack", verb: "compile", task: "KT-001" },
    ],
  },
  {
    id: "grc-coordinator-axiom",
    title: "GRC Programme Coordinator",
    company: "Axiom Advisory",
    initials: "AX",
    tone: "violet",
    source: "LinkedIn",
    location: "Hybrid · Edinburgh",
    type: "Full-time",
    level: "Entry / Coordinator",
    salary: "£34k–£43k",
    jobFunction: "Programme Management",
    project: { code: "SPA", title: "Strategic Planning and Architecture" },
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Build a 12-month GRC programme roadmap", verb: "draft", task: "SPA-001" },
      { duty: "Map programme stakeholders and influence", verb: "map", task: "SPA-002" },
      { duty: "Author the GRC project charter at initiative kick-off", verb: "draft", task: "PE-001" },
      { duty: "Define and track programme GRC KPIs", verb: "calculate", task: "MM-001" },
    ],
  },
  {
    id: "vendor-risk-analyst-keystone",
    title: "Third-Party / Vendor Risk Analyst",
    company: "Keystone Procurement",
    initials: "KP",
    tone: "emerald",
    source: "Indeed",
    location: "Remote · UK",
    type: "Full-time",
    level: "Entry / Analyst",
    salary: "£33k–£42k",
    jobFunction: "Vendor Risk",
    project: { code: "TPRM", title: "Third-Party Risk Management" },
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Maintain the supplier inventory with security risk ratings", verb: "record", task: "TPRM-001" },
      { duty: "Score supplier security risk against a defined rubric", verb: "score", task: "TPRM-001" },
      { duty: "Complete and review vendor due-diligence questionnaires", verb: "review", task: "TPRM-002" },
    ],
  },
  {
    id: "bc-analyst-harbor",
    title: "Business Continuity Analyst",
    company: "Harbor Logistics",
    initials: "HL",
    tone: "amber",
    source: "Remote.co",
    location: "Hybrid · Bristol",
    type: "Full-time",
    level: "Entry / Analyst",
    salary: "£34k–£43k",
    jobFunction: "Resilience & Recovery",
    project: { code: "BCRP", title: "Business Continuity and Resilience Planning" },
    standards: ["ISO/IEC 27001:2022"],
    responsibilities: [
      { duty: "Conduct a single-department business impact analysis", verb: "assess", task: "BCRP-001" },
      { duty: "Develop ICT disaster recovery checklists", verb: "draft", task: "BCRP-002" },
      { duty: "Observe and document tabletop incident simulations", verb: "document", task: "RR-001" },
    ],
  },
  {
    id: "audit-associate-sterling",
    title: "Audit & Assurance Associate",
    company: "Sterling Assurance",
    initials: "SA",
    tone: "indigo",
    source: "LinkedIn",
    location: "Hybrid · London",
    type: "Full-time",
    level: "Entry / Associate",
    salary: "£36k–£46k",
    jobFunction: "Internal Audit",
    project: { code: "QA", title: "Quality Assurance" },
    standards: ["ISO/IEC 27001:2022", "SOC 2"],
    responsibilities: [
      { duty: "Perform desk-based control testing spot-checks", verb: "validate", task: "TV-002" },
      { duty: "Develop a repeatable control testing methodology", verb: "draft", task: "QA-002" },
      { duty: "Run GRC document quality reviews", verb: "review", task: "QA-001" },
      { duty: "Prepare and file audit evidence", verb: "compile", task: "PE-002" },
    ],
  },
];

// ---- runtime match derivation ----

export type RespState = "matched" | "partial" | "gap";

export interface DerivedResponsibility extends JobResponsibility {
  state: RespState;
}
export interface DerivedStandard {
  label: string;
  state: RespState;
}
export interface DerivedJob extends Job {
  /** 0–100 match, derived from how much of the role's work you've executed. */
  match: number;
  derivedResponsibilities: DerivedResponsibility[];
  derivedStandards: DerivedStandard[];
}

const isComplete = (s?: TaskStatus) => s === "complete";
const isStarted = (s?: TaskStatus) => s === "in-progress" || s === "active";

/** Flatten the learnings tree once into the signals the match rule needs. */
function indexLearnings(learnings: Learnings | null) {
  const taskStatus = new Map<string, TaskStatus>();
  const completedVerbs = new Set<string>();
  const stdComplete = new Set<string>();
  const stdStarted = new Set<string>();
  if (learnings) {
    for (const org of learnings.orgs) {
      for (const proj of org.projects) {
        for (const t of proj.tasks) {
          taskStatus.set(t.code, t.status);
          const std = TASK_META[t.code]?.standardLabel;
          if (std) {
            if (isComplete(t.status)) stdComplete.add(std);
            else if (isStarted(t.status)) stdStarted.add(std);
          }
          for (const s of t.steps) if (s.status === "complete") completedVerbs.add(s.verb);
        }
      }
    }
  }
  return { taskStatus, completedVerbs, stdComplete, stdStarted };
}

/** Derive every job's live match from the user's learnings. Pure — safe to memoise. */
export function deriveJobs(learnings: Learnings | null): DerivedJob[] {
  const { taskStatus, completedVerbs, stdComplete, stdStarted } = indexLearnings(learnings);

  return JOBS.map((job) => {
    const derivedResponsibilities: DerivedResponsibility[] = job.responsibilities.map((r) => {
      const ts = taskStatus.get(r.task);
      let state: RespState;
      if (isComplete(ts)) state = "matched";
      else if (isStarted(ts) || completedVerbs.has(r.verb)) state = "partial";
      else state = "gap";
      return { ...r, state };
    });

    const derivedStandards: DerivedStandard[] = job.standards.map((label) => ({
      label,
      state: stdComplete.has(label) ? "matched" : stdStarted.has(label) ? "partial" : "gap",
    }));

    const score = derivedResponsibilities.reduce(
      (n, r) => n + (r.state === "matched" ? 1 : r.state === "partial" ? 0.5 : 0),
      0,
    );
    const match = derivedResponsibilities.length
      ? Math.round((score / derivedResponsibilities.length) * 100)
      : 0;

    return { ...job, match, derivedResponsibilities, derivedStandards };
  });
}

export interface MatchMeta {
  label: string;
  ring: string;
  txt: string;
  soft: string;
}
export function matchMeta(p: number): MatchMeta {
  if (p >= 90) return { label: "Strong match", ring: "#10b981", txt: "text-emerald-600", soft: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
  if (p >= 80) return { label: "Great match", ring: "#6366F1", txt: "text-indigo-600", soft: "bg-indigo-50 text-indigo-700 ring-indigo-100" };
  if (p >= 60) return { label: "Good match", ring: "#8b5cf6", txt: "text-violet-600", soft: "bg-violet-50 text-violet-700 ring-violet-100" };
  if (p >= 30) return { label: "Emerging match", ring: "#f59e0b", txt: "text-amber-700", soft: "bg-amber-50 text-amber-700 ring-amber-100" };
  return { label: "Build to match", ring: "#94a3b8", txt: "text-slate-500", soft: "bg-slate-100 text-slate-600 ring-slate-200/70" };
}
