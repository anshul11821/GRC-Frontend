// Minimal per-task control register data (public ISO/NIST clause refs + names + NIST cross-walk).
// Extracted from the curriculum so controls.ts can build CONTROLS_BY_TASK without importing the
// full (now server-side) RUA catalog. This is public standard text, not proprietary scenario
// content, so it stays client-side. Generated — regenerate rather than hand-editing.
// ponytail: control clause lists are public standard text; if max protection is wanted later,
// move CONTROLS_BY_TASK server-side too and make the 4 consumer pages fetch it.

export interface TaskControlData { standard: string; controls: { ref: string; name: string }[]; crosswalk: { code: string; desc: string }[]; }

export const TASK_CONTROL_DATA: Record<string, TaskControlData> = {
  "AA-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 5.9",
        "name": "Inventory of information and other associated assets"
      },
      {
        "ref": "Annex A 5.12",
        "name": "Classification of information"
      },
      {
        "ref": "Annex A 8.1",
        "name": "User endpoint devices"
      }
    ],
    "crosswalk": [
      {
        "code": "ID.AM-01",
        "desc": "Inventories of hardware maintained"
      },
      {
        "code": "ID.AM-02",
        "desc": "Inventories of software maintained"
      },
      {
        "code": "ID.AM-05",
        "desc": "Assets are prioritised"
      }
    ]
  },
  "AA-002": {
    "standard": "CIS Controls v8",
    "controls": [
      {
        "ref": "CIS 1",
        "name": "Inventory and Control of Enterprise Assets"
      },
      {
        "ref": "CIS 2",
        "name": "Inventory and Control of Software Assets"
      },
      {
        "ref": "CIS 3",
        "name": "Data Protection"
      },
      {
        "ref": "CIS 4",
        "name": "Secure Configuration of Enterprise Assets and Software"
      },
      {
        "ref": "CIS 5",
        "name": "Account Management"
      },
      {
        "ref": "CIS 6",
        "name": "Access Control Management (IG1 sub-controls only)"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.DS",
        "desc": "Protect: Identity Management; Data Security"
      }
    ]
  },
  "AA-003": {
    "standard": "GDPR (EU) 2016/679",
    "controls": [
      {
        "ref": "Article 4",
        "name": "Definitions (personal data, processing, controller, processor)"
      },
      {
        "ref": "Article 13 & 14",
        "name": "Information to be provided to data subjects"
      },
      {
        "ref": "Article 30",
        "name": "Records of processing activities (RoPA)"
      },
      {
        "ref": "Article 35",
        "name": "Data protection impact assessment screening"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-05",
        "desc": "Legal, regulatory and contractual requirements are understood"
      },
      {
        "code": "ID.AM-08",
        "desc": "Systems/services involving external parties are inventoried"
      }
    ]
  },
  "BCRP-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 5.29",
        "name": "Information security during disruption"
      },
      {
        "ref": "Annex A 5.30",
        "name": "ICT readiness for business continuity"
      }
    ],
    "crosswalk": [
      {
        "code": "RC.RP-01",
        "desc": "Recovery plan executed"
      },
      {
        "code": "RC.RP-03",
        "desc": "Recovery activities and progress communicated"
      },
      {
        "code": "Control 11",
        "desc": "Data Recovery"
      }
    ]
  },
  "BCRP-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 5.30",
        "name": "ICT readiness for business continuity"
      },
      {
        "ref": "Annex A 8.13",
        "name": "Information backup"
      },
      {
        "ref": "Annex A 8.14",
        "name": "Redundancy of information processing facilities"
      }
    ],
    "crosswalk": [
      {
        "code": "RC.RP-02",
        "desc": "Recovery plan updated"
      },
      {
        "code": "PR.DS-11",
        "desc": "Data backups created"
      },
      {
        "code": "Control 11.1",
        "desc": "Establish and maintain a data recovery process"
      },
      {
        "code": "and 11.4",
        "desc": "Establish and maintain an isolated instance of recovery data"
      }
    ]
  },
  "CA-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 6.3",
        "name": "Information security awareness, education and training"
      },
      {
        "ref": "Annex A 6.6",
        "name": "Confidentiality or non-disclosure agreements"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AT-01",
        "desc": "Personnel provided awareness and training"
      },
      {
        "code": "Control 14.2",
        "desc": "Training for all roles with security responsibilities"
      },
      {
        "code": "and 14.7",
        "desc": "Training for all users on identifying social engineering"
      }
    ]
  },
  "CA-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 9.3",
        "name": "Management review"
      },
      {
        "ref": "Clause 9.1",
        "name": "Monitoring, measurement, analysis and evaluation"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-06",
        "desc": "Risk management outcomes communicated"
      },
      {
        "code": "GV.OC-04",
        "desc": "Responsibilities are understood"
      },
      {
        "code": "ID.RA-09",
        "desc": "Third-party risk assessed — referenced in reporting"
      }
    ]
  },
  "CA-003": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 4.2",
        "name": "Understanding the needs and expectations of interested parties"
      },
      {
        "ref": "Clause 5.3",
        "name": "Organisational roles, responsibilities and authorities"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-02",
        "desc": "Internal and external stakeholders identified"
      },
      {
        "code": "GV.OC-03",
        "desc": "Legal, regulatory and contractual requirements understood"
      }
    ]
  },
  "CRM-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 4.1",
        "name": "Understanding the organisation and its context"
      },
      {
        "ref": "Clause 4.2",
        "name": "Understanding the needs and expectations of interested parties"
      },
      {
        "ref": "Annex A 5.31",
        "name": "Legal, statutory, regulatory and contractual requirements"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-03",
        "desc": "Legal, regulatory, and contractual requirements understood and managed"
      },
      {
        "code": "GV.OC-05",
        "desc": "Outcomes, capabilities, and services that the organisation depends on are understood"
      }
    ]
  },
  "CRM-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A",
        "name": "All 93 controls across 4 Themes: Organisational (37), People (8), Physical (14), Technological (34)"
      }
    ],
    "crosswalk": [
      {
        "code": "Functions",
        "desc": "cross-walk between ISO 27001 Annex A and NIST CSF Categories/Subcategories"
      }
    ]
  },
  "CRM-003": {
    "standard": "SOC 2 Type II (AICPA Trust Services Criteria)",
    "controls": [
      {
        "ref": "CC1–CC9",
        "name": "Common Criteria (Security)"
      },
      {
        "ref": "A1",
        "name": "Availability (awareness)"
      },
      {
        "ref": "C1",
        "name": "Confidentiality (awareness)"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.DS",
        "desc": "Policy; Identity Management; Data Security"
      }
    ]
  },
  "DD-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 6.8",
        "name": "Information security event reporting"
      },
      {
        "ref": "Annex A 5.26",
        "name": "Response to information security incidents"
      },
      {
        "ref": "Annex A 5.28",
        "name": "Collection of evidence"
      }
    ],
    "crosswalk": [
      {
        "code": "RS.CO-02",
        "desc": "Incidents reported"
      },
      {
        "code": "RS.MA-01",
        "desc": "Incident response activities aligned with plans"
      },
      {
        "code": "DE.AE-06",
        "desc": "Information on adverse events communicated"
      }
    ]
  },
  "DD-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 6.3",
        "name": "Information security awareness, education and training"
      },
      {
        "ref": "Annex A 6.6",
        "name": "Confidentiality or non-disclosure agreements"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AT-01",
        "desc": "Personnel are provided awareness and training"
      },
      {
        "code": "PR.AT-02",
        "desc": "Individuals with elevated privileges are provided awareness and training"
      },
      {
        "code": "Control 14",
        "desc": "Security Awareness and Skills Training"
      }
    ]
  },
  "DD-003": {
    "standard": "GDPR (EU) 2016/679",
    "controls": [
      {
        "ref": "Article 5(1)(e)",
        "name": "Storage limitation principle"
      },
      {
        "ref": "Article 17",
        "name": "Right to erasure"
      },
      {
        "ref": "Recital 39",
        "name": "Data kept no longer than necessary"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.DS-01",
        "desc": "Data at rest protected"
      },
      {
        "code": "PR.DS-10",
        "desc": "Data in use protected"
      },
      {
        "code": "Control 3.11",
        "desc": "Encrypt Sensitive Data at Rest"
      }
    ]
  },
  "GRM-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 6.1.2",
        "name": "Information security risk assessment"
      },
      {
        "ref": "Clause 6.1.3",
        "name": "Information security risk treatment"
      },
      {
        "ref": "Annex A 5.9",
        "name": "Inventory of information and other associated assets"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-01",
        "desc": "Risk management objectives established"
      },
      {
        "code": "ID.RA-01",
        "desc": "Vulnerabilities identified"
      },
      {
        "code": "ID.RA-04",
        "desc": "Potential impacts and likelihoods determined"
      }
    ]
  },
  "GRM-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 5.2",
        "name": "Policy"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      },
      {
        "ref": "Annex A 6.7",
        "name": "Remote working"
      },
      {
        "ref": "Annex A 8.1",
        "name": "User endpoint devices"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-01",
        "desc": "Policy for managing cybersecurity risks established"
      },
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed, updated, and communicated"
      }
    ]
  },
  "GRM-003": {
    "standard": "NIST CSF 2.0",
    "controls": [
      {
        "ref": "Tiers 1–4",
        "name": "Implementation Tier definitions (Partial → Adaptive)"
      },
      {
        "ref": "GV.OC",
        "name": "Organizational Context"
      },
      {
        "ref": "GV.RM",
        "name": "Risk Management Strategy"
      },
      {
        "ref": "GV.PO",
        "name": "Policy"
      }
    ],
    "crosswalk": [
      {
        "code": "Functions",
        "desc": "Govern, Identify, Protect, Detect, Respond, Recover"
      },
      {
        "code": "Clause 9.1",
        "desc": "Monitoring, measurement, analysis and evaluation"
      }
    ]
  },
  "IE-001": {
    "standard": "CIS Controls v8",
    "controls": [
      {
        "ref": "CIS 1.1",
        "name": "Establish and maintain detailed enterprise asset inventory"
      },
      {
        "ref": "CIS 3.3",
        "name": "Configure data access control lists"
      },
      {
        "ref": "CIS 5.2",
        "name": "Use unique passwords"
      },
      {
        "ref": "CIS 5.3",
        "name": "Disable dormant accounts"
      },
      {
        "ref": "CIS 6.1",
        "name": "Establish an access-granting process"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AA-01",
        "desc": "Identities managed"
      },
      {
        "code": "PR.DS-01",
        "desc": "Data at rest protected"
      },
      {
        "code": "PR.DS-02",
        "desc": "Data in transit protected"
      }
    ]
  },
  "IE-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 7.5",
        "name": "Documented information"
      },
      {
        "ref": "Clause 7.5.3",
        "name": "Control of documented information"
      },
      {
        "ref": "Annex A 5.1",
        "name": "Policies for information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed, updated, communicated"
      },
      {
        "code": "GV.OC",
        "desc": "Organisational context maintained through documented information"
      }
    ]
  },
  "KT-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 6.1",
        "name": "Screening"
      },
      {
        "ref": "Annex A 6.2",
        "name": "Terms and conditions of employment"
      },
      {
        "ref": "Annex A 6.3",
        "name": "Information security awareness, education and training"
      },
      {
        "ref": "Annex A 6.6",
        "name": "Confidentiality or non-disclosure agreements"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AT-01",
        "desc": "Personnel provided awareness and training"
      },
      {
        "code": "GV.PO-02",
        "desc": "Policy communicated"
      },
      {
        "code": "Control 14.1",
        "desc": "Establish and maintain a security awareness programme"
      }
    ]
  },
  "KT-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 10.1",
        "name": "Continual improvement"
      },
      {
        "ref": "Clause 10.2",
        "name": "Nonconformity and corrective action"
      },
      {
        "ref": "Annex A 5.27",
        "name": "Learning from information security incidents"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-07",
        "desc": "Risk responses managed and outcomes communicated"
      },
      {
        "code": "RC.IM-01",
        "desc": "Recovery plan incorporates lessons learned"
      },
      {
        "code": "Control 17.8",
        "desc": "Conduct post-incident reviews"
      }
    ]
  },
  "LRC-001": {
    "standard": "GDPR (EU) 2016/679",
    "controls": [
      {
        "ref": "Article 13",
        "name": "Information to be provided where personal data are collected from the data subject"
      },
      {
        "ref": "Article 14",
        "name": "Information to be provided where personal data have not been obtained from the data subject"
      },
      {
        "ref": "Recital 39",
        "name": "Principle of transparency"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-05",
        "desc": "Legal, regulatory and contractual requirements understood"
      },
      {
        "code": "PR.DS-01",
        "desc": "Data at rest protected — contextual"
      },
      {
        "code": "Control 3.14",
        "desc": "Log sensitive data access — contextual"
      }
    ]
  },
  "MM-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 9.1",
        "name": "Monitoring, measurement, analysis and evaluation"
      },
      {
        "ref": "Clause 9.3",
        "name": "Management review"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-06",
        "desc": "Risk management outcomes communicated"
      },
      {
        "code": "DE.CM-09",
        "desc": "Computing hardware and software monitored"
      },
      {
        "code": "PR.PS-04",
        "desc": "Logs of events created"
      }
    ]
  },
  "MM-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 6.1.2",
        "name": "Information security risk assessment (ongoing)"
      },
      {
        "ref": "Clause 9.1",
        "name": "Monitoring, measurement, analysis and evaluation"
      },
      {
        "ref": "Annex A 5.9",
        "name": "Inventory of information and other associated assets (maintained)"
      }
    ],
    "crosswalk": [
      {
        "code": "ID.RA-06",
        "desc": "Risks identified"
      },
      {
        "code": "GV.RM-07",
        "desc": "Risk responses managed"
      },
      {
        "code": "DE.CM",
        "desc": "Adverse events monitored"
      }
    ]
  },
  "PE-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 6.2",
        "name": "Information security objectives and planning to achieve them"
      },
      {
        "ref": "Clause 5.3",
        "name": "Organisational roles, responsibilities and authorities"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC",
        "desc": "Organisational Context"
      },
      {
        "code": "GV.RM-01",
        "desc": "Risk management objectives established"
      }
    ]
  },
  "PE-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 7.5",
        "name": "Documented information"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      },
      {
        "ref": "Annex A 5.36",
        "name": "Compliance with policies, rules and standards"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed, updated, communicated and enforced"
      },
      {
        "code": "ID.RA-01",
        "desc": "Vulnerabilities in assets identified"
      },
      {
        "code": "DE.CM-09",
        "desc": "Computing hardware and software monitored"
      }
    ]
  },
  "QA-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 7.5.2",
        "name": "Creating and updating documented information"
      },
      {
        "ref": "Clause 7.5.3",
        "name": "Control of documented information"
      },
      {
        "ref": "Annex A 5.36",
        "name": "Compliance with policies, rules and standards"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed, updated, communicated"
      },
      {
        "code": "GV.OC",
        "desc": "Organisational context maintained"
      }
    ]
  },
  "QA-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 9.1",
        "name": "Monitoring, measurement, analysis and evaluation"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      },
      {
        "ref": "Annex A 5.36",
        "name": "Compliance with policies, rules and standards"
      }
    ],
    "crosswalk": [
      {
        "code": "DE.CM-09",
        "desc": "Computing hardware and software monitored"
      },
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed and enforced"
      },
      {
        "code": "Control 18",
        "desc": "Penetration Testing — awareness only at GRC 101 level"
      }
    ]
  },
  "RR-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 5.26",
        "name": "Response to information security incidents"
      },
      {
        "ref": "Annex A 5.27",
        "name": "Learning from information security incidents"
      },
      {
        "ref": "Annex A 5.28",
        "name": "Collection of evidence"
      },
      {
        "ref": "Annex A 6.8",
        "name": "Information security event reporting"
      }
    ],
    "crosswalk": [
      {
        "code": "RS.MA-01",
        "desc": "Incident response activities aligned with plan"
      },
      {
        "code": "RS.CO-02",
        "desc": "Incidents reported"
      },
      {
        "code": "RC.RP-01",
        "desc": "Recovery plan executed"
      },
      {
        "code": "Control 17",
        "desc": "Incident Response Management"
      }
    ]
  },
  "SPA-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 6.2",
        "name": "Information security objectives and planning to achieve them"
      },
      {
        "ref": "Clause 9.3",
        "name": "Management review"
      },
      {
        "ref": "Annex A 5.35",
        "name": "Independent review of information security"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.RM-06",
        "desc": "Risk tolerance determined and communicated"
      },
      {
        "code": "GV.OC",
        "desc": "Organisational Context understood and used to prioritise cybersecurity risk"
      }
    ]
  },
  "SPA-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Clause 4.2",
        "name": "Understanding the needs and expectations of interested parties"
      },
      {
        "ref": "Clause 5.3",
        "name": "Organisational roles, responsibilities and authorities"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.OC-02",
        "desc": "Internal and external stakeholders identified"
      },
      {
        "code": "GV.SC-04",
        "desc": "Suppliers and third parties are informed of their roles"
      }
    ]
  },
  "TPRM-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 5.19",
        "name": "Information security in supplier relationships"
      },
      {
        "ref": "Annex A 5.20",
        "name": "Addressing information security within supplier agreements"
      },
      {
        "ref": "Annex A 5.22",
        "name": "Monitoring, review and change management of supplier services"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.SC-04",
        "desc": "Suppliers and third parties informed of their roles"
      },
      {
        "code": "GV.SC-06",
        "desc": "Planning and due diligence performed"
      },
      {
        "code": "Control 15",
        "desc": "Service Provider Management"
      }
    ]
  },
  "TPRM-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 5.20",
        "name": "Addressing information security within supplier agreements"
      },
      {
        "ref": "Annex A 5.21",
        "name": "Managing information security in the ICT supply chain"
      },
      {
        "ref": "Annex A 5.19",
        "name": "Information security in supplier relationships"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.SC-06",
        "desc": "Planning and due diligence performed"
      },
      {
        "code": "GV.SC-07",
        "desc": "Risks posed by suppliers assessed"
      },
      {
        "code": "Control 15.2",
        "desc": "Establish and maintain a process to address weaknesses in third-party service provider security"
      }
    ]
  },
  "TV-001": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 8.2",
        "name": "Privileged access rights"
      },
      {
        "ref": "Annex A 8.3",
        "name": "Information access restriction"
      },
      {
        "ref": "Annex A 8.5",
        "name": "Secure authentication"
      },
      {
        "ref": "Annex A 5.18",
        "name": "Access rights"
      }
    ],
    "crosswalk": [
      {
        "code": "PR.AA-01",
        "desc": "Identities and credentials managed"
      },
      {
        "code": "PR.AA-02",
        "desc": "Identities are proofed and bound to credentials"
      },
      {
        "code": "Control 5",
        "desc": "Account Management"
      },
      {
        "code": "Control 6",
        "desc": "Access Control Management"
      }
    ]
  },
  "TV-002": {
    "standard": "ISO/IEC 27001:2022",
    "controls": [
      {
        "ref": "Annex A 5.36",
        "name": "Compliance with policies, rules and standards for information security"
      },
      {
        "ref": "Annex A 6.3",
        "name": "Information security awareness, education and training"
      },
      {
        "ref": "Annex A 8.1",
        "name": "User endpoint devices"
      }
    ],
    "crosswalk": [
      {
        "code": "GV.PO-02",
        "desc": "Policy reviewed and communicated"
      },
      {
        "code": "PR.AT-01",
        "desc": "Personnel provided awareness and training"
      },
      {
        "code": "DE.CM",
        "desc": "Monitoring performed"
      }
    ]
  }
};
