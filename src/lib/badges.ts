// 8 GRC 101 credential badges — artwork spec + task mapping (from the Achievement Badges mockup).
// Earned-state is derived on the frontend from /me/learnings task completion (no backend needed).

export interface BadgeDef {
  id: string;
  /** Credential name — bottom arc of the medal and the card title. */
  name: string;
  /** Tier family — the large centre text shared by badges of the same level. */
  family: string;
  code: string;
  /** 1–16; picks the rank band. */
  level: number;
  blurb: string;
  taskCodes: string[];
  /**
   * What the badge certifies about the holder's *judgment*, from the v4 judgment library's own
   * badge map (backend `_seed/grc101_judgment.json` → `badges`). Static here for the same reason
   * `taskCodes` is: badges are derived on the frontend from task completion and need no backend
   * call. Keep in step with the seed — `scripts/build_judgment.py` prints the mapping.
   */
  certifies: string;
  competences: string[];
}

/** Rank bands: levels 01–05 Foundation, 06–11 Practitioner, 12–16 Mastery. */
export interface Band { rank: string; field: string; gold: string; muted: string }

const BANDS: [number, Band][] = [
  [5, { rank: "FOUNDATION", field: "#312e81", gold: "#e9c46a", muted: "#c7d2fe" }],
  [11, { rank: "PRACTITIONER", field: "#1e1b4b", gold: "#f0c674", muted: "#b7bce8" }],
  [16, { rank: "MASTERY", field: "#0b1020", gold: "#f5cf72", muted: "#dbb96a" }],
];

export const bandFor = (level: number): Band => (BANDS.find(([max]) => level <= max) ?? BANDS[2])[1];

export const BADGES: BadgeDef[] = [
  {
    id: "foundation-grc-discovery",
    name: "Foundation GRC Discovery",
    family: "Foundation & Discovery",
    code: "GRC101-B01-A",
    level: 1,
    blurb: "Discover GRC maturity, metrics and stakeholder needs across a function.",
    taskCodes: ["GRM-003", "MM-001", "CA-001", "CA-002", "CA-003", "KT-002"],
    certifies: "Can establish what applies, to what, and show that the population is complete.",
    competences: ["Scoping", "Standards application", "Completeness discipline"],
  },
  {
    id: "foundation-discovery",
    name: "Foundation Discovery",
    family: "Foundation & Discovery",
    code: "GRC101-B01-B",
    level: 1,
    blurb: "Plan and charter a GRC initiative from the ground up.",
    taskCodes: ["SPA-001", "SPA-002", "PE-001"],
    certifies: "Can scope an initiative and state what it commits the organisation to.",
    competences: ["Scoping", "Stakeholder framing", "Consequence awareness"],
  },
  {
    id: "process-mapping",
    name: "Process Mapping Specialist",
    family: "Technical Competency",
    code: "GRC101-B02-A",
    level: 2,
    blurb: "Catalogue and classify an organisation's information assets end to end.",
    taskCodes: ["AA-001"],
    certifies: "Can determine where controls sit in real work and evidence the determination.",
    competences: ["Determination", "Completeness discipline", "Evidence sufficiency"],
  },
  {
    id: "documentation-excellence",
    name: "Documentation Excellence",
    family: "Technical Competency",
    code: "GRC101-B02-B",
    level: 2,
    blurb: "Produce clear, standard-aligned GRC policies, procedures and guides.",
    taskCodes: ["GRM-002", "DD-001", "DD-002", "DD-003", "IE-002", "QA-001", "KT-001"],
    certifies: "Can write a controlled document a stranger can operate from.",
    competences: ["Stakeholder framing", "Completeness discipline", "Standards application"],
  },
  {
    id: "risk-assessment",
    name: "Risk Assessment Specialist",
    family: "Technical Competency",
    code: "GRC101-B02-C",
    level: 2,
    blurb: "Identify, register and rate operational and third-party risk.",
    taskCodes: ["GRM-001", "MM-002", "BCRP-001", "TPRM-001", "TPRM-002"],
    certifies: "Can produce a rating a second assessor would reproduce, and state its limits.",
    competences: ["Determination", "Quantification", "Consequence awareness"],
  },
  {
    id: "audit-prep",
    name: "Audit Preparation Support",
    family: "Support & Operations",
    code: "GRC101-B03-A",
    level: 3,
    blurb: "Support control testing, audit evidence and incident drills.",
    taskCodes: ["TV-001", "TV-002", "RR-001", "PE-002", "QA-002"],
    certifies: "Can assemble evidence that supports the conclusion rather than accompanying it.",
    competences: ["Evidence sufficiency", "Completeness discipline", "Quantification"],
  },
  {
    id: "control-framework",
    name: "Control Framework Understanding",
    family: "Support & Operations",
    code: "GRC101-B03-B",
    level: 3,
    blurb: "Map and assess security controls against ISO 27001, CIS v8 and SOC 2.",
    taskCodes: ["AA-002", "CRM-002", "CRM-003", "IE-001", "BCRP-002"],
    certifies: "Can apply a framework's intent, not its wording, and defend the reading.",
    competences: ["Standards application", "Determination", "Defensibility"],
  },
  {
    id: "compliance-readiness",
    name: "Compliance Readiness",
    family: "Support & Operations",
    code: "GRC101-B03-C",
    level: 3,
    blurb: "Demonstrate regulatory and privacy compliance fundamentals.",
    taskCodes: ["AA-003", "CRM-001", "LRC-001"],
    certifies: "Can determine applicability and knows which determinations are not theirs.",
    competences: ["Standards application", "Escalation judgment", "Consequence awareness"],
  },
];
