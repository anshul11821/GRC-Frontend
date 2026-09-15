// NIST CSF 2.0 Core — 6 Functions, 22 Categories. The framework is a US Government work and free to
// reproduce, but everything below is still OUR wording: the CLAUSE_TEXT rule is "copied, not
// recalled", and a summary is not a copy.

import { item, type LibStandard } from "./types";

const PART = "CSF 2.0 Core · 6 Functions";

export const NIST_CSF: LibStandard = {
  id: "nistcsf",
  source: "NIST Cybersecurity Framework 2.0 · public domain",
  publishedTitles: true,
  groups: [
    {
      name: "Govern (GV)", part: PART, unit: "categories", items: [
        item("GV.OC", "Organizational Context", undefined, [
          "Know the mission and how cybersecurity supports it",
          "Know internal and external stakeholders and what they expect",
          "Know the legal, regulatory and contractual requirements",
          "Know the objectives and services others depend on",
          "Know what the organisation itself depends on",
        ]),
        item("GV.RM", "Risk Management Strategy", undefined, [
          "Agree what risk management should achieve",
          "State risk appetite and tolerance",
          "Fold cybersecurity into enterprise risk management",
          "Use one consistent way to calculate and prioritise risk",
          "Account for supplier risk in the strategy",
          "Choose standard responses to risk",
        ]),
        item("GV.RR", "Roles, Responsibilities, and Authorities",
          "Make clear who is accountable for cybersecurity, and give them the authority and resources to act.", [
          "Leaders are accountable and build a risk-aware culture",
          "Roles and authorities are set and communicated",
          "Enough resources are allocated",
          "Cybersecurity is part of HR practice",
        ]),
        item("GV.PO", "Policy", undefined, [
          "Write policy from context, strategy and priorities",
          "Communicate it and enforce it",
          "Update it as requirements, threats and technology change",
        ]),
        item("GV.OV", "Oversight", "Use what risk management reveals to review and adjust the strategy.", [
          "Review outcomes to inform strategy",
          "Adjust strategy so coverage stays adequate",
          "Evaluate performance and act on it",
        ]),
        item("GV.SC", "Cybersecurity Supply Chain Risk Management",
          "Identify, assess and manage the cybersecurity risk that arrives through suppliers.", [
          "Run a supply-chain risk programme stakeholders agree to",
          "Set supplier roles and responsibilities",
          "Know your suppliers and rank them by criticality",
          "Write security requirements into contracts",
          "Do due diligence before engaging",
          "Monitor suppliers throughout the relationship",
          "Plan for how the relationship ends",
        ]),
      ],
    },
    {
      name: "Identify (ID)", part: PART, unit: "categories", items: [
        item("ID.AM", "Asset Management", "Know your assets and manage each in line with how much it matters.", [
          "Inventory hardware",
          "Inventory software, services and systems",
          "Map network communication and data flows",
          "Inventory the services suppliers provide",
          "Prioritise assets by criticality and impact",
          "Inventory data and its metadata",
          "Manage assets across their lifecycle",
        ]),
        item("ID.RA", "Risk Assessment", "Understand the risk to the organisation, its assets and its people.", [
          "Find and record vulnerabilities",
          "Gather threat intelligence",
          "Identify the threats that apply",
          "Estimate impact and likelihood",
          "Use all of it to rank risk",
          "Choose, prioritise and track responses",
          "Manage changes and exceptions",
          "Handle vulnerability disclosures",
          "Check hardware and software integrity before use",
          "Assess critical suppliers before acquiring from them",
        ]),
        item("ID.IM", "Improvement", "Find improvements to cybersecurity across every Function.", [
          "Learn from evaluations",
          "Learn from tests and exercises",
          "Learn from how operations actually run",
          "Keep incident and continuity plans current",
        ]),
      ],
    },
    {
      name: "Protect (PR)", part: PART, unit: "categories", items: [
        item("PR.AA", "Identity Management, Authentication, and Access Control",
          "Limit access to authorised people, services and hardware.", [
          "Manage identities and credentials",
          "Prove identities before binding credentials",
          "Authenticate users, services and hardware",
          "Protect and verify identity assertions",
          "Grant access by least privilege and separation of duties",
          "Manage physical access",
        ]),
        item("PR.AT", "Awareness and Training", "Give people the awareness and skills to do their security tasks, general and specialised."),
        item("PR.DS", "Data Security", undefined, [
          "Protect data at rest",
          "Protect data in transit",
          "Protect data in use",
          "Take, protect and test backups",
        ]),
        item("PR.PS", "Platform Security", "Manage the hardware, software and services of platforms securely.", [
          "Apply configuration management",
          "Maintain, replace and remove software by risk",
          "Maintain, replace and remove hardware by risk",
          "Generate logs for monitoring",
          "Stop unauthorised software being installed or run",
          "Build security into the software lifecycle",
        ]),
        item("PR.IR", "Technology Infrastructure Resilience", "Design infrastructure to protect assets and keep them running.", [
          "Protect networks from unauthorised access",
          "Protect assets from environmental threats",
          "Build resilience for bad days as well as good",
          "Keep enough capacity for availability",
        ]),
      ],
    },
    {
      name: "Detect (DE)", part: PART, unit: "categories", items: [
        item("DE.CM", "Continuous Monitoring", undefined, [
          "Monitor networks and network services",
          "Monitor the physical environment",
          "Monitor personnel activity and technology use",
          "Monitor external service providers",
          "Monitor hardware, software and their environments",
        ]),
        item("DE.AE", "Adverse Event Analysis", "Analyse anomalies and indicators to understand what is happening.", [
          "Analyse events to understand them",
          "Correlate information from many sources",
          "Estimate impact and scope",
          "Share findings with those who can act",
          "Bring threat intelligence into the analysis",
          "Declare an incident when the criteria are met",
        ]),
      ],
    },
    {
      name: "Respond (RS)", part: PART, unit: "categories", items: [
        item("RS.MA", "Incident Management", "Manage the response once an incident is detected.", [
          "Execute the response plan, with third parties",
          "Triage and validate incident reports",
          "Categorise and prioritise incidents",
          "Escalate as needed",
          "Apply the criteria for starting recovery",
        ]),
        item("RS.AN", "Incident Analysis", "Investigate so the response is effective and evidence survives.", [
          "Establish what happened and why",
          "Record actions and protect those records",
          "Collect and preserve incident data",
          "Estimate and confirm the incident's size",
        ]),
        item("RS.CO", "Incident Response Reporting and Communication", "Keep internal and external stakeholders informed during the response."),
        item("RS.MI", "Incident Mitigation", "Contain the incident, then eradicate it."),
      ],
    },
    {
      name: "Recover (RC)", part: PART, unit: "categories", items: [
        item("RC.RP", "Incident Recovery Plan Execution", "Restore the systems and services the incident affected.", [
          "Start recovery when the response allows",
          "Choose, scope and order recovery actions",
          "Check backups before restoring from them",
          "Confirm critical functions are back",
          "Verify systems are back to normal",
          "Declare recovery over, and document it",
        ]),
        item("RC.CO", "Incident Recovery Communication", "Coordinate restoration with internal and external parties, including public updates."),
      ],
    },
  ],
};
