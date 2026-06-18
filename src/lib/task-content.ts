// Rich per-task content for the Working Desk task overview: Objective, What to do, and the
// Reference material (required reading). References carry the case facts/rules/standards you NEED
// to produce a correct deliverable — so a task can't be done well without reading them.
// Merged into TASK_META by taskmeta.ts. Written in second person ("You will …").
import type { TaskReference } from "./taskmeta";

export interface TaskContent {
  objective: string;
  whatToDo: string[];
  references: TaskReference[];
}

export const TASK_CONTENT: Record<string, TaskContent> = {
  // ───────────────────────── CloudTech Solutions Enterprise · Technology & IT Services ─────────────────────────
  "AA-001": {
    objective:
      "You will produce a complete, classified inventory of the information assets owned by CloudTech's Customer Platform team — a single source of truth for what data exists, where it lives, who owns it, and how sensitive it is. Every later task builds on this register, so it must be accurate.",
    whatToDo: [
      "Read the intake notes and extract every distinct information asset mentioned.",
      "Record each asset with: name, the data it holds, where it is stored, and a named owner (a role, not a person).",
      "Apply CloudTech's classification scheme (Public / Internal / Confidential) using the rules — do not guess.",
      "Flag any asset with no named owner, or that holds personal data, as a remediation gap.",
      "Check each classification against ISO 27001 A.5.9 and A.5.12 before you sign the register off.",
    ],
    references: [
      {
        id: "aa001-intake",
        title: "CloudTech — Asset Intake Notes (Customer Platform team)",
        kind: "Source document",
        summary: "Raw notes from the team — the assets you must inventory are in here.",
        body: `## What the team told you
These working notes are unorganised — turn them into a clean register. Read carefully: some assets have no owner and some hold personal data.

- Customer accounts database (Postgres, AWS eu-west-1): customer names, emails, hashed passwords, billing addresses. Looked after by the Platform Engineering Lead.
- Support tickets (Zendesk): customers often attach documents containing personal data. Owned by the Head of Customer Success.
- Marketing email list (Mailchimp export on the shared drive): names + emails of prospects. No clear owner; the marketing intern updates it.
- Internal runbooks and process docs (Confluence): owned by Engineering.
- Platform source code (private GitHub org): proprietary. Owned by the CTO.
- Employee HR and payroll records (BambooHR): owned by People Ops.
- Public website and blog (WordPress): owned by Marketing.
- An old database backup (.sql dump) on an engineer's laptop — no one is sure who made it or what's in it.

## Hint
The backup and the marketing list are exactly the kind of thing this task wants you to catch and flag.`,
      },
      {
        id: "aa001-scheme",
        title: "CloudTech Data Classification Scheme",
        kind: "Classification scheme",
        summary: "The rules you must apply — don't classify from intuition.",
        body: `## The three levels
- Public — intended for public release; harmless if seen by anyone (website, blog).
- Internal — operational info not for the public, low harm if leaked (runbooks, process docs).
- Confidential — would cause material harm to CloudTech, its customers or staff if disclosed.

## Mandatory rules (override intuition)
- Any asset with customer or staff personal data → at least Confidential.
- Any asset with credentials/secrets/at-rest passwords → Confidential.
- Source code / proprietary IP → Confidential.
- Financial and payroll data → Confidential.
- Unsure between two levels → pick the higher and note why.

## Worked example
Support tickets hold customer attachments with personal data → Confidential, even though "tickets" might feel only Internal.`,
      },
      {
        id: "aa001-iso",
        title: "ISO/IEC 27001:2022 — A.5.9 & A.5.12 (extract)",
        kind: "Standard extract",
        summary: "The two controls your register is evidence for.",
        body: `## A.5.9 — Inventory of information and associated assets
An inventory, including owners, shall be developed and maintained. An asset with no named owner is a finding.

## A.5.12 — Classification of information
Information shall be classified per the organisation's needs (confidentiality, integrity, availability) using a defined scheme — not ad hoc.

## Maps to your deliverable
A reviewer checks that every asset has an owner (A.5.9) and a scheme-derived classification (A.5.12).`,
      },
    ],
  },

  "CRM-002": {
    objective:
      "You will map ISO/IEC 27001:2022 Annex A controls onto five real CloudTech business processes and build a Control Matrix that shows, per process, which controls apply and whether they are actually implemented — exposing where the organisation is exposed.",
    whatToDo: [
      "Take the five processes from the brief and, for each, identify the applicable Annex A controls across all four themes.",
      "Record applicability (applicable / partial / not applicable) with a one-line rationale for each.",
      "For applicable controls, capture implementation status, the evidence you'd expect, and the control owner.",
      "Build the process × control matrix and surface the top five uncontrolled risks from the gaps.",
    ],
    references: [
      {
        id: "crm002-processes",
        title: "CloudTech — The Five In-Scope Processes",
        kind: "Source document",
        summary: "The processes you must map controls to, with the facts that drive applicability.",
        body: `## Processes in scope (agreed with the Compliance Manager)
1. User onboarding — new customer sign-up; creates accounts, stores personal data, sends credentials.
2. Software release — code is built and deployed to production weekly; no formal change approval today.
3. Customer data backup — nightly backups to a second AWS region; restores have never been tested.
4. Vendor contracting — new suppliers are engaged; security review is informal/ad hoc.
5. Incident logging — issues are tracked in a chat channel; no defined severity or escalation.

## Why this matters for applicability
Each fact above points to specific controls (e.g. "no change approval" → A.8.32 Change management; "restores never tested" → A.8.13 Information backup). You can't judge applicability without these process facts.`,
      },
      {
        id: "crm002-annexa",
        title: "ISO 27001:2022 Annex A — the four themes",
        kind: "Standard extract",
        summary: "The control library you're mapping from (themes + key controls).",
        body: `## The four Annex A themes
- A.5 Organisational (37 controls) — policies, roles, supplier & incident management, classification.
- A.6 People (8) — screening, awareness, disciplinary, remote working.
- A.7 Physical (14) — secure areas, equipment, media.
- A.8 Technological (34) — access control, crypto, change mgmt, backup, logging, vuln mgmt.

## Controls you'll likely cite for these processes
A.5.19/5.20 Supplier relationships; A.8.2/8.3 Privileged & access rights; A.8.13 Backup; A.8.32 Change management; A.5.24–5.26 Incident management.

## Rule
A control is "applicable" only if the process actually creates the risk it addresses — justify every applicable/not-applicable call.`,
      },
    ],
  },

  "CRM-003": {
    objective:
      "You will map the SOC 2 Security (Common Criteria) controls onto CloudTech's existing controls, find the gaps where no internal control answers a criterion, and summarise readiness on a simple traffic-light dashboard for the IT team.",
    whatToDo: [
      "Read the sample SOC 2 report extract and the CC1–CC9 criteria list.",
      "For each criterion, record an example audit test, the expected evidence, and which CloudTech control/policy addresses it.",
      "Flag criteria with no mapped control as gaps; cross-reference your ISO 27001 matrix (CRM-002) where it overlaps.",
      "Rate readiness Green/Amber/Red per CC cluster and write a two-page awareness briefing.",
    ],
    references: [
      {
        id: "crm003-cc",
        title: "SOC 2 — Common Criteria (CC1–CC9) summary",
        kind: "Standard extract",
        summary: "The criteria you must map controls to.",
        body: `## The Common Criteria (Security)
- CC1 Control Environment — governance, integrity, org structure.
- CC2 Communication & Information — internal/external comms of objectives.
- CC3 Risk Assessment — identify and analyse risks to objectives.
- CC4 Monitoring — evaluate and report control deficiencies.
- CC5 Control Activities — policies/procedures that mitigate risk.
- CC6 Logical & Physical Access — the big one: provisioning, authentication, deprovisioning, encryption.
- CC7 System Operations — detect and respond to incidents/anomalies.
- CC8 Change Management — authorise, design, test, approve changes.
- CC9 Risk Mitigation — vendor risk and business disruption.

## Note
CC6 and CC8 map closely to your ISO work (access control, change management) — reuse that evidence.`,
      },
      {
        id: "crm003-sample",
        title: "CloudTech — Existing Control Snapshot",
        kind: "Source document",
        summary: "What CloudTech actually has today — the basis for your gap calls.",
        body: `## Controls CloudTech has
- MFA on the admin console and AWS; SSO for staff apps (CC6).
- Joiner/leaver process exists but deprovisioning is manual and sometimes delayed (CC6 — partial).
- Code review required before merge; deployments are automated (CC8 — partial, no formal approval record).
- No documented risk assessment process (CC3 — gap).
- No central monitoring of control deficiencies (CC4 — gap).
- Vendor security review is informal (CC9 — partial).

## How to use this
Map each criterion to one of these. Where nothing here answers a criterion, that's a Red/gap on your dashboard.`,
      },
    ],
  },

  "SPA-001": {
    objective:
      "You will turn CloudTech's accumulated findings (gap analysis, risk register, maturity assessment) into a prioritised, costed 12-month GRC roadmap that management can actually fund and act on.",
    whatToDo: [
      "Consolidate the open gaps/risks from the consolidated findings sheet.",
      "Categorise each into Quick Wins (0–3m), Medium-Term (3–6m), or Strategic (6–12m) using the horizon rules.",
      "For each action specify the control addressed, an effort estimate, an owner, a success metric and a target date.",
      "Build the 12-month Gantt, estimate the compliance uplift, and write a one-page management briefing.",
    ],
    references: [
      {
        id: "spa001-findings",
        title: "CloudTech — Consolidated Findings (AA-002 / GRM-001 / GRM-003)",
        kind: "Source document",
        summary: "The gaps and risks you must schedule — your roadmap is built from these.",
        body: `## Open items rolled up from earlier work
- CIS IG1 at 41% — biggest gaps: no MFA on all systems, no asset/software inventory tooling, no data recovery testing.
- Top risks (from register): delayed deprovisioning (High), untested backups (High), informal vendor reviews (Medium).
- Maturity: Identify and Protect at Tier 1 (Partial); Detect/Respond very weak.
- Quick technical wins available: enable MFA everywhere, turn on cloud logging, document the backup schedule.
- Strategic items: stand up a risk-assessment process, formal change management, a vendor-risk programme.

## Use this
Every roadmap line must trace back to one of these items — don't invent new work.`,
      },
      {
        id: "spa001-horizons",
        title: "Roadmap Horizon Rules",
        kind: "Planning rules",
        summary: "How to decide which horizon each action belongs in.",
        body: `## Definitions
- Quick Win (0–3 months) — low effort, low cost, high risk-reduction; mostly configuration or documentation (e.g. enable MFA, turn on logging).
- Medium-Term (3–6 months) — needs a small project or budget; a new process or tool (e.g. backup testing schedule, deprovisioning automation).
- Strategic (6–12 months) — organisational change, ongoing programme, or significant spend (e.g. risk-management framework, vendor-risk programme).

## Rule
Sequence so that quick wins fund credibility for the strategic items. Each action needs an owner, a metric and a date — an action with no measurable success metric is incomplete.`,
      },
    ],
  },

  "TV-001": {
    objective:
      "You will test CloudTech's user access by reconciling the live account list against HR records, find orphaned / dormant / mismatched accounts, and report the findings with a remediation deadline.",
    whatToDo: [
      "Take the two extracts (system accounts and HR staff list) from the reference.",
      "Cross-reference them: find accounts for people who have left (orphaned), accounts with no recent login (dormant), and roles that don't match the job.",
      "Complete the Access Review Worksheet — one row per account with finding type and recommended action.",
      "Calculate the % clean / orphaned / dormant / mismatched and write the report with remediation recommendations.",
    ],
    references: [
      {
        id: "tv001-accounts",
        title: "CloudTech — System Account Extract & HR List",
        kind: "Source document",
        summary: "The two lists you must reconcile. The findings are only visible by comparing them.",
        body: `## Active system accounts (admin console export)
| Account | Role | Last login |
| a.shah | Platform Admin | 2 days ago |
| r.kapoor | Developer | 96 days ago |
| j.lee | Finance (read) | yesterday |
| svc-deploy | Service/CI | n/a |
| m.osei | Developer (also has Admin) | 5 days ago |
| t.brown | Support Agent | 210 days ago |

## HR active-staff list
- a.shah — Platform Engineering (active)
- j.lee — Finance (active)
- m.osei — Engineering (active)
- (r.kapoor LEFT the company 3 months ago)
- (t.brown LEFT the company 7 months ago)

## What the comparison reveals
r.kapoor & t.brown = orphaned (left but still active). r.kapoor/t.brown also dormant by login. m.osei has Admin on top of Developer = role mismatch / excess privilege. svc-deploy is a service account — note it, don't treat as a person.`,
      },
      {
        id: "tv001-rules",
        title: "Access Review — Finding Definitions",
        kind: "Testing rules",
        summary: "How to label each account.",
        body: `## Finding types
- Orphaned — account belongs to someone no longer employed. Action: disable immediately.
- Dormant — no login within 90 days. Action: confirm still needed, else disable.
- Mismatched / excess privilege — role grants more than the job requires (e.g. Admin on a developer). Action: remove excess rights (least privilege).
- Clean — active employee, appropriate role, recent login.

## Standard
ISO 27001 A.5.18 Access rights & A.8.2 Privileged access — access must be provisioned to need and reviewed regularly. Service accounts must be identified and owned.`,
      },
    ],
  },

  "CA-002": {
    objective:
      "You will distil everything done for CloudTech into a one-page Management Compliance Status Report that a busy executive can read in two minutes and act on — clear status, top risks, achievements, and the decisions you need from them.",
    whatToDo: [
      "Pull the headline numbers and findings from the prior deliverables (the data pack).",
      "Pick the five most important messages: top risks, key gaps, improvements made, decisions needed.",
      "Draft to the one-page executive template — RAG status, top 3 risks, top 3 achievements, open decisions, 30-day outlook.",
      "Apply plain-English rules (concrete numbers, no jargon) and finalise.",
    ],
    references: [
      {
        id: "ca002-pack",
        title: "CloudTech — Data Pack (prior task outputs)",
        kind: "Source document",
        summary: "The numbers and facts your report must be built from.",
        body: `## Headline data
- CIS IG1 compliance: 41% → 58% after quick wins this quarter.
- Risk register: 14 open risks; 2 High (untested backups, delayed deprovisioning), 5 Medium.
- Access review: 6 accounts tested, 2 orphaned (now disabled), 1 excess-privilege fixed.
- Awareness training: 82% of staff completed.
- Decisions needed from management: fund deprovisioning automation (~£8k); approve a quarterly access-review cadence.

## Rule
Every statement in the report must trace to a number here. "Things are improving" is not acceptable; "IG1 rose from 41% to 58%" is.`,
      },
      {
        id: "ca002-template",
        title: "Executive Compliance Status Report — Template & rules",
        kind: "Template",
        summary: "The one-page structure and the plain-English rules.",
        body: `## One-page structure
1. Overall status (RAG) + one-sentence summary.
2. Top 3 risks (with current treatment).
3. Top 3 achievements this period.
4. Open actions requiring a management decision (with the ask and the cost).
5. 30-day outlook.

## Plain-English rules
- Lead with the decision, not the detail.
- Use percentages and counts, never "many"/"several".
- No acronym without expansion on first use.
- One page maximum — if it doesn't fit, it isn't prioritised enough.`,
      },
    ],
  },

  "RR-001": {
    objective:
      "You will act as the observer/note-taker in a tabletop incident simulation, capture exactly how the team responded against the documented procedure, and turn your notes into a lessons-learned report with concrete procedure improvements.",
    whatToDo: [
      "Read the incident procedure and the scenario brief before the exercise so you know what 'good' looks like.",
      "During the exercise, capture decisions, timings, escalation paths used, and any deviation from the procedure on the observation sheet.",
      "Write the post-exercise lessons-learned report within 48 hours.",
      "Identify the top three improvements and map each to a specific clause of the incident procedure as a proposed amendment.",
    ],
    references: [
      {
        id: "rr001-scenario",
        title: "Tabletop Scenario Brief — 'Ransomware on the build server'",
        kind: "Source document",
        summary: "The scenario and the procedure steps you're observing against.",
        body: `## Scenario
At 09:14 the CI/CD build server is found encrypted with a ransom note. Deploys are blocked. Two developers report the same note on a shared drive.

## What the procedure (DD-001) requires
- Declare an incident within 15 minutes of detection and assign an Incident Lead.
- Classify severity (this is Sev-1: production impact + possible data at risk).
- Isolate affected systems before investigating.
- Notify management and, if personal data may be affected, the DPO within 1 hour.
- Keep a timestamped decision log.

## Your job
Note where the team meets, delays, or skips each of these — the gaps between procedure and reality are the lessons.`,
      },
      {
        id: "rr001-sheet",
        title: "Tabletop Observation Sheet — what to capture",
        kind: "Template",
        summary: "The structured fields your notes must fill.",
        body: `## Capture for each phase
- Decision made + who made it + timestamp.
- Time-to-detect, time-to-declare, time-to-contain.
- Escalation path actually used vs the documented one.
- Communication gaps (who wasn't told, when).
- Tool/resource gaps (anything the team wished they had).
- Deviations from the procedure (and whether the deviation helped or hurt).

## Rule
An observation without a timestamp or a specific quote is not usable evidence — be concrete.`,
      },
    ],
  },

  "BCRP-002": {
    objective:
      "You will build a practical ICT Disaster Recovery checklist for one CloudTech system, grounded in its real backup configuration and the recovery objectives from the BIA, and validate it with a talk-through.",
    whatToDo: [
      "Take the system's backup facts and the RTO/RPO from the reference.",
      "Draft the DR checklist: preparation, detection/declaration, backup retrieval, restoration sequence, validation, return-to-normal sign-off.",
      "Embed the RTO and RPO as explicit success criteria.",
      "Talk the checklist through against the documented restoration steps and fix anything that wouldn't work.",
    ],
    references: [
      {
        id: "bcrp002-system",
        title: "CloudTech — Customer Accounts DB: Backup & Recovery Facts",
        kind: "Source document",
        summary: "The real configuration your checklist must match.",
        body: `## The system
Customer accounts database (Postgres, AWS eu-west-1). The most business-critical store.

## Backup configuration
- Nightly automated snapshot at 02:00 UTC; retained 14 days.
- Cross-region copy to eu-central-1 (off-site copy).
- Point-in-time recovery enabled (5-minute granularity).
- Restores have never actually been tested.

## Recovery objectives (from BCRP-001 BIA)
- RTO (max downtime): 4 hours.
- RPO (max data loss): 1 hour.

## Implication
Your checklist must achieve restore within 4 hours and lose ≤1 hour of data — point-in-time recovery is what makes the 1-hour RPO achievable, so it must be in the steps.`,
      },
      {
        id: "bcrp002-sections",
        title: "ICT DR Checklist — required sections",
        kind: "Template",
        summary: "The phases every DR checklist must cover.",
        body: `## Sections
1. Pre-incident preparation (access, credentials, contacts, where backups live).
2. Detection & declaration (who declares, severity, who is notified).
3. Backup retrieval (which backup, from which region, integrity check).
4. Restoration sequence (ordered, with dependencies).
5. Validation testing (how you confirm the restore is good — not just "it started").
6. Return-to-normal & sign-off (who confirms service restored).

## Rule
Each step needs an owner and a way to verify it's done. A step you can't verify is a step that will fail under pressure.`,
      },
    ],
  },

  "TPRM-001": {
    objective:
      "You will build CloudTech's supplier register and assign each vendor a basic security risk rating, so the business knows which third parties pose the most risk and where required agreements are missing.",
    whatToDo: [
      "Take the vendor list from the reference and record each with data access, systems connected, contract status and contact.",
      "Apply the five-criterion rating to each vendor and calculate a composite Low/Medium/High score.",
      "Flag every High vendor for escalation, and every vendor missing a GDPR data-processing agreement (DPA).",
      "Produce the Supplier Register and a summary of high-risk vendors and missing DPAs.",
    ],
    references: [
      {
        id: "tprm001-vendors",
        title: "CloudTech — Vendor List",
        kind: "Source document",
        summary: "The vendors you must rate — the data-access facts drive the score.",
        body: `## Vendors in use
- Stripe — payment processing; processes customer payment + personal data; ISO 27001 + PCI certified; DPA in place.
- Mailchimp — marketing email; stores prospect names/emails; SOC 2 certified; DPA NOT signed.
- A freelance designer — occasional access to the marketing site CMS; no certification; no DPA.
- AWS — hosting; stores all customer data; ISO 27001/SOC 2; DPA in place.
- An offshore QA contractor — given a copy of production data for testing (!); no certification; no DPA.
- Slack — internal comms; may contain personal data in messages; SOC 2; DPA in place.

## Watch for
The QA contractor with a copy of production data and no DPA is your highest risk and a GDPR problem. Mailchimp processes personal data with no DPA — also a gap.`,
      },
      {
        id: "tprm001-rating",
        title: "Vendor Risk Rating — five criteria",
        kind: "Rating rules",
        summary: "How to score each vendor.",
        body: `## Score each criterion 1 (low) – 3 (high)
1. Data access level — none / view / process / store personal or sensitive data.
2. System access level — no access / limited / privileged into CloudTech systems.
3. Criticality of service — could the business run without them?
4. Geographic location — data transfers outside the UK/EU raise the score.
5. Certification — ISO 27001 / SOC 2 lowers residual risk; none raises it.

## Composite
Average the five → Low (<1.7) / Medium (1.7–2.3) / High (>2.3). Any vendor that stores personal data with no DPA is automatically escalated regardless of score (GDPR Art. 28).`,
      },
    ],
  },

  "PE-001": {
    objective:
      "You will write the project charter that kicks off CloudTech's compliance initiative — the document that aligns the sponsor and team on scope, objectives, deliverables, timeline and governance before any work starts.",
    whatToDo: [
      "Use the initiative brief to define objectives, success criteria and explicit out-of-scope items.",
      "Identify the team: sponsor, project lead, workstream owners and stakeholders.",
      "Draft the charter to the template, build a milestone-only timeline, and name the top three project risks with mitigations.",
      "Circulate for sponsor sign-off, then run the kick-off.",
    ],
    references: [
      {
        id: "pe001-brief",
        title: "CloudTech — Compliance Initiative Brief",
        kind: "Source document",
        summary: "The scope facts your charter must reflect.",
        body: `## The initiative (from the sponsor)
CloudTech wants to be "SOC 2 ready" within 9 months to win enterprise customers.

## Known constraints & facts
- Sponsor: the CTO. Budget approved: £60k. One part-time security hire planned.
- In scope: the customer platform and its supporting cloud infrastructure.
- Explicitly OUT of scope: the marketing website, and the separate billing system (handled by Finance).
- Hard deadline: a flagship customer audit in 9 months.
- Known risk: the team is small and already stretched on product delivery.

## Use this
Objectives, scope boundaries and risks in your charter must match these facts — inventing scope the sponsor didn't agree to is the classic charter failure.`,
      },
      {
        id: "pe001-charter",
        title: "Project Charter — required sections",
        kind: "Template",
        summary: "What a charter must contain.",
        body: `## Sections
- Background & business case.
- Objectives & measurable success criteria.
- Scope (in) and out-of-scope (explicit).
- Key deliverables & milestones.
- Timeline (milestones only at this stage).
- Resources & budget.
- Risks, assumptions, dependencies.
- Governance (who decides what; meeting cadence).

## Rule
Out-of-scope must be written down explicitly — most project conflict comes from things people assumed were included.`,
      },
    ],
  },

  "QA-002": {
    objective:
      "You will develop a repeatable control-testing methodology for three CloudTech controls, so that anyone can test them the same way and produce audit-quality evidence.",
    whatToDo: [
      "Take the three controls from the reference.",
      "For each, define the control objective, the test approach, specific test steps, the evidence required, and pass/fail criteria.",
      "Write a one-page methodology overview (sampling, frequency, documentation standards).",
      "Review for professional adequacy and add to the QA library.",
    ],
    references: [
      {
        id: "qa002-controls",
        title: "CloudTech — Three Controls to Test",
        kind: "Source document",
        summary: "The controls and what 'working' means for each.",
        body: `## Controls selected (from the ISO matrix)
1. A.8.2 Privileged access — only approved admins have admin rights; reviewed quarterly.
2. A.8.13 Information backup — nightly backups run and are periodically restore-tested.
3. A.8.32 Change management — production changes are reviewed and approved before deploy.

## What "working" looks like
- A.8.2: admin list matches the approved register; no leavers; quarterly review evidenced.
- A.8.13: backup logs show success; at least one successful test restore in the period.
- A.8.32: every production deploy has a linked, approved change record.`,
      },
      {
        id: "qa002-approaches",
        title: "Control Test Approaches",
        kind: "Testing rules",
        summary: "The four ways to test a control — pick the right one.",
        body: `## The four approaches (weakest → strongest evidence)
- Inquiry — ask someone how it works. Weakest; never sufficient alone.
- Observation — watch the control operate.
- Inspection — examine records/config/evidence (logs, the approved change record).
- Re-performance — independently redo the control (e.g. attempt a restore yourself).

## Rule
Choose the strongest approach that's feasible, and define explicit pass/fail criteria before you test — "looks fine" is not a result. State your sample size and how it was chosen.`,
      },
    ],
  },

  // ───────────────────────── LearnTech Educational Solutions · Education & Research ─────────────────────────
  "AA-003": {
    objective:
      "You will map how personal data flows through one LearnTech process (student enrolment), establish the lawful basis for the processing, and produce the two foundational GDPR artefacts: a RoPA entry and a DPIA screening decision.",
    whatToDo: [
      "Use the enrolment data-flow facts to draw the flow: what personal data, collected from whom, stored where, shared with whom, kept how long.",
      "Determine the lawful basis for each processing purpose.",
      "Complete the RoPA entry to Article 30, then run the 9-criterion DPIA screening.",
      "Record a disposition: full DPIA required or not — with the reason — and get process-owner sign-off.",
    ],
    references: [
      {
        id: "aa003-flow",
        title: "LearnTech — Student Enrolment Data-Flow Facts",
        kind: "Source document",
        summary: "The personal data and flows you must map. Some involve children — that matters.",
        body: `## The process
A school signs up; teachers create student accounts; students (many under 16) log in and use the learning platform.

## Personal data involved
- Student: name, date of birth, school, email, learning progress, and behavioural analytics (time on task, scores).
- Teacher: name, work email.
- Special category? Some accessibility data (e.g. dyslexia support flags) — this is health-adjacent, higher risk.

## Flows
- Collected from the school (controller) and the student.
- Stored in AWS (eu-west-1); analytics processed via a third-party tool (Mixpanel, US).
- Retained "indefinitely" today (a gap).

## Why this triggers a DPIA
Large-scale processing of children's data + behavioural profiling + a US transfer = several DPIA criteria. You can't make the screening call without these facts.`,
      },
      {
        id: "aa003-ropa",
        title: "GDPR — RoPA (Art. 30) fields & DPIA screening (9 criteria)",
        kind: "Standard extract",
        summary: "The required RoPA fields and the DPIA triggers.",
        body: `## RoPA entry (Article 30) must record
Purpose · categories of data subjects · categories of personal data · recipients · international transfers · retention period · security measures · lawful basis.

## DPIA screening — a DPIA is required if ≥2 apply
1. Systematic profiling/scoring. 2. Large-scale processing. 3. Special-category or highly personal data. 4. Data about vulnerable subjects (children). 5. Innovative technology. 6. Matching/combining datasets. 7. Prevents subjects exercising a right. 8. Systematic monitoring. 9. Transfers outside the UK/EU without adequacy.

## Apply it
Children + behavioural profiling + US transfer already meets three → a full DPIA is required.`,
      },
    ],
  },

  "CRM-001": {
    objective:
      "You will build LearnTech's obligations register — a single list of every legal, regulatory, contractual and voluntary requirement that applies to the business, who owns each, and whether it's currently met.",
    whatToDo: [
      "Use the regulatory-context facts to list applicable obligations across legislation, sector rules, contracts and standards.",
      "For each, record the source, the specific requirement, the owner, compliance status (Met/Partial/Gap) and next review date.",
      "Map each obligation to the relevant ISO 27001 clause/control.",
      "Highlight obligations with no owner or no evidence as gaps.",
    ],
    references: [
      {
        id: "crm001-context",
        title: "LearnTech — Regulatory Context",
        kind: "Source document",
        summary: "The facts that determine which laws apply to LearnTech.",
        body: `## The business
UK-based EdTech. Sells to UK schools and a growing number of US school districts. Processes children's personal data. Runs email marketing to teachers.

## What this triggers
- UK GDPR + Data Protection Act 2018 (processing personal data of UK individuals, including children — see the ICO Children's Code / Age Appropriate Design Code).
- EU GDPR (some EU schools).
- US: FERPA and COPPA exposure via US districts and under-13 users.
- PECR — because of the teacher marketing emails (consent for electronic marketing).
- Contractual: school Data Processing Agreements impose security and breach-notification terms.
- Voluntary: ISO 27001 (a customer is asking for it); Cyber Essentials.

## Use this
Every obligation in your register must trace to one of these — and children's-data rules (ICO Children's Code, COPPA) are easy to miss.`,
      },
      {
        id: "crm001-register",
        title: "Obligations Register — fields",
        kind: "Template",
        summary: "What each register row must capture.",
        body: `## Per obligation
- Source (the law/standard/contract clause).
- Specific requirement (what it actually demands).
- Applicability rationale (why it applies to LearnTech).
- Responsible owner (a role).
- Compliance status: Met / Partial / Gap.
- Evidence (or note that none exists).
- Next review date.

## Rule
An obligation with status "Met" but no evidence is really a Gap — flag it. An obligation with no owner is a governance failure.`,
      },
    ],
  },

  "DD-001": {
    objective:
      "You will replace LearnTech's informal, ad-hoc incident handling with a clear written Incident Reporting Procedure that any staff member can follow, plus a one-page quick-reference card.",
    whatToDo: [
      "Use the current-state facts to understand how reporting happens today and where it breaks.",
      "Draft the procedure to the template: scope, definitions, how to recognise an incident, how/when/what to report, escalation, confidentiality.",
      "Create a one-page quick-reference card for staff.",
      "Map each procedure step to ISO 27001 A.6.8, circulate for readability, and finalise.",
    ],
    references: [
      {
        id: "dd001-current",
        title: "LearnTech — How Incidents Are Handled Today",
        kind: "Source document",
        summary: "The current informal path and its gaps — your procedure must fix these.",
        body: `## What happens now (from staff)
- Staff "mention it in the support Slack channel" if they spot something odd.
- There's no definition of what counts as an incident, so phishing emails go unreported.
- No one owns triage; sometimes the CTO sees it days later.
- No severity levels, no timeline, no record kept.
- Staff worry they'll be blamed, so they stay quiet (a culture gap).

## What good looks like
A single reporting channel, a clear "if in doubt, report it" rule, a named triage owner, defined timing, and a no-blame statement. Your procedure must close each of these gaps.`,
      },
      {
        id: "dd001-template",
        title: "Procedure Template + ISO 27001 A.6.8",
        kind: "Template",
        summary: "The required sections and the control it satisfies.",
        body: `## Procedure sections
Scope · Definitions (what is an incident?) · How to recognise one (examples) · How to report (channel, timing, info required) · Escalation path · Roles · Confidentiality / no-blame · Review cycle.

## ISO 27001 A.6.8 — Information security event reporting
"Personnel shall report observed or suspected information security events through appropriate channels in a timely manner." Your procedure is the evidence for A.6.8 — it must name the channel and the timing.`,
      },
    ],
  },

  "SPA-002": {
    objective:
      "You will map the stakeholders of a LearnTech GRC initiative onto an Influence–Interest matrix and define how to engage each group, so the programme has the right people on side at the right level.",
    whatToDo: [
      "Use the initiative + stakeholder facts to list every internal and external stakeholder.",
      "Complete the stakeholder register (role, interest, influence, communication needs) for each.",
      "Plot everyone on the 2×2 Influence–Interest matrix.",
      "Assign each quadrant an engagement strategy and draft a communication plan.",
    ],
    references: [
      {
        id: "spa002-stakeholders",
        title: "LearnTech — Initiative & Stakeholders",
        kind: "Source document",
        summary: "Who's involved and their stake — this drives the matrix placement.",
        body: `## The initiative
Achieving ISO 27001 certification to satisfy a major school-district customer.

## Stakeholders & their stake
- CEO — sponsor; high influence, high interest (wants the customer).
- CTO — owns delivery; high influence, high interest.
- Engineering team — must change how they work; low influence, low/grudging interest.
- Customer (the district) — external; high influence (can walk away), high interest.
- ICO / regulator — external; high influence, low day-to-day interest.
- Teachers/end users — low influence, low interest, but affected.
- Finance — controls budget; medium influence, low interest.

## Use this
Placement on the matrix must reflect these influence/interest facts — not a guess.`,
      },
      {
        id: "spa002-matrix",
        title: "Influence–Interest Matrix — quadrant strategies",
        kind: "Planning rules",
        summary: "How to engage each quadrant.",
        body: `## The four quadrants
- High influence + High interest → Manage Closely (involve in decisions; e.g. CEO, CTO, customer).
- High influence + Low interest → Keep Satisfied (regular high-level updates; e.g. regulator, Finance).
- Low influence + High interest → Keep Informed (consult, use as advocates).
- Low influence + Low interest → Monitor (minimal effort; e.g. end users).

## Rule
The engagement strategy must match the quadrant. Over-communicating to "Monitor" wastes effort; under-communicating to "Manage Closely" sinks the programme.`,
      },
    ],
  },

  "CA-001": {
    objective:
      "You will deliver a 30-minute security-awareness briefing to LearnTech staff, then measure whether it actually worked using a knowledge check and a completion report.",
    whatToDo: [
      "Schedule the session and send a pre-session communication explaining the purpose.",
      "Deliver the module, adapting the language for a non-technical audience.",
      "Administer the five-question knowledge check and record attendance.",
      "Score results, calculate the pass rate against the target, and produce a completion report with follow-up recommendations.",
    ],
    references: [
      {
        id: "ca001-audience",
        title: "LearnTech — Audience & Knowledge Check",
        kind: "Source document",
        summary: "Who you're training and the exact check + pass rule.",
        body: `## Audience
~40 staff: teachers, support agents, and a few engineers. Mostly non-technical. Recent issue: two staff fell for a phishing email last month.

## The 5-question knowledge check
1. What should you do if you receive a suspicious email? 2. Why must you never reuse your work password? 3. What counts as personal data of a student? 4. Where do you report a security incident? 5. What is the risk of using public Wi-Fi without a VPN?

## Pass rule
Target ≥ 80% of questions correct across attendees. Below 80% → recommend a follow-up session. You must report the actual pass rate, not "it went well".`,
      },
      {
        id: "ca001-checklist",
        title: "Delivery & Measurement Checklist",
        kind: "Template",
        summary: "What to do before, during and after — and what to record.",
        body: `## Before
Calendar invite + purpose note; test the room/AV; print the attendance register and the check.

## During
Adapt language (no jargon); use the recent phishing incident as a real example; run the knowledge check at the end.

## After
- Record attendance (who attended / who didn't).
- Score the check; calculate the pass rate.
- Completion Report: attendance %, pass rate, weakest question, follow-up recommendation.

## Rule
Training with no measurement isn't evidence. The completion report is what proves the control operated.`,
      },
    ],
  },

  "LRC-001": {
    objective:
      "You will review LearnTech's current privacy notice against the GDPR mandatory-elements checklist, find what's missing or unclear, and draft an improved, plain-language version fit for an audience that includes children.",
    whatToDo: [
      "Read the current notice and run the 14-element Articles 13/14 checklist, marking each present / partial / absent.",
      "Note elements that are present but unclear or not in plain language.",
      "Draft an improved notice addressing every gap, in plain language (Grade-8 readability).",
      "Submit for DPO/Legal review and produce the final for sign-off.",
    ],
    references: [
      {
        id: "lrc001-current",
        title: "LearnTech — Current Privacy Notice (extract)",
        kind: "Source document",
        summary: "The actual notice — its gaps are what you must find.",
        body: `## Current notice (as published)
"LearnTech cares about your privacy. We collect some information to provide our services and may share it with partners. We keep your data secure. For questions, contact us. We may update this policy from time to time."

## What's obviously wrong (you'll find more with the checklist)
- No identity/contact of the controller or DPO.
- No purposes or lawful basis stated.
- "Some information" / "partners" — not specified.
- No retention period, no list of data-subject rights, no mention of children, no international-transfer info.
- Not written for the children who actually use the product.

## Your job
Run the checklist against this to produce a complete gap list — then rewrite it.`,
      },
      {
        id: "lrc001-checklist",
        title: "Privacy Notice — 14 mandatory elements (Art. 13/14)",
        kind: "Standard extract",
        summary: "The checklist every compliant notice must satisfy.",
        body: `## Must be present
1. Controller identity & contact. 2. DPO contact. 3. Purposes of processing. 4. Lawful basis. 5. Legitimate interests (if used). 6. Recipients/categories of recipients. 7. International transfers + safeguards. 8. Retention period. 9. Data-subject rights (access, erasure, etc.). 10. Right to withdraw consent. 11. Right to complain to the ICO. 12. Whether provision is statutory/contractual. 13. Existence of automated decision-making/profiling. 14. Source of data (if not from the subject).

## Children's rule (ICO Children's Code)
If children use the service, the notice must be in clear, age-appropriate language — a key gap in the current version.`,
      },
    ],
  },

  "KT-001": {
    objective:
      "You will create a New Joiner GRC onboarding pack so that every new LearnTech employee knows, from day one, the key security and privacy rules, how to report problems, and who to ask.",
    whatToDo: [
      "Use the org facts to identify the top ten things a new joiner must know.",
      "Compile a four-page reference guide (key policies, how to report incidents, classification rules, acceptable use, phishing signs, who to contact).",
      "Create a day-by-day checklist (Days 1, 7, 30) and a five-slide Day-1 briefing.",
      "Pilot with a recent joiner, refine, and hand over to HR.",
    ],
    references: [
      {
        id: "kt001-facts",
        title: "LearnTech — What a New Joiner Must Know",
        kind: "Source document",
        summary: "The real LearnTech facts your pack must contain.",
        body: `## Key facts
- Policies live in Confluence under "GRC"; the Acceptable Use and Data Protection policies are mandatory reading.
- Incidents are reported via the #security channel and to the IT Manager (per DD-001).
- Data classification: Public / Internal / Confidential — student data is always Confidential.
- MFA is mandatory on all accounts; password manager provided.
- The DPO is the Head of Legal; GRC questions go to the Compliance Manager.
- Top current threat: phishing emails impersonating school customers.

## Rule
Every item in the pack must be a real, findable LearnTech fact — a new joiner should be able to act on it, not just read theory.`,
      },
      {
        id: "kt001-sections",
        title: "Onboarding Pack — required sections",
        kind: "Template",
        summary: "What the pack must contain.",
        body: `## Pack contents
1. Key policies & where to find them.
2. How to report a security incident (channel + who).
3. Data classification rules (with examples).
4. Acceptable use of systems.
5. Top phishing warning signs.
6. Who to contact for GRC/privacy questions.

## Plus
- A Day 1 / Day 7 / Day 30 checklist (joiner + manager actions).
- A five-slide Day-1 briefing for the manager.

## Rule
Four pages maximum — a pack no one finishes reading protects no one.`,
      },
    ],
  },

  // ───────────────────────── GlobalConnect Customer Solutions · BPO & KPO (Call Centres) ─────────────────────────
  "AA-002": {
    objective:
      "You will score GlobalConnect's current security against the CIS Controls v8 IG1 safeguards, producing a clear, evidence-based gap analysis that shows management exactly where basic cyber-hygiene is missing before any harder framework work.",
    whatToDo: [
      "Walk the IG1 safeguards worksheet and, for each, record the current state with evidence (implemented / partial / not).",
      "Calculate compliance % per CIS Control group.",
      "Prioritise the top five gaps by risk exposure.",
      "Draft remediation recommendations and compile the gap-analysis report.",
    ],
    references: [
      {
        id: "aa002-state",
        title: "GlobalConnect — Current Security State (walkthrough notes)",
        kind: "Source document",
        summary: "The facts you score the IG1 safeguards against.",
        body: `## What the walkthroughs found
- No central asset/software inventory; agents use a mix of company and personal laptops (BYOD, uncontrolled).
- MFA only on email, not on the customer CRM that holds client data.
- Local admin rights are common on agent machines.
- No vulnerability scanning or patch tracking.
- Backups run for the CRM but have never been restore-tested.
- Security awareness training is one-off at induction only.
- Logging exists but no one reviews it.

## Use this
Each fact maps to specific IG1 safeguards (inventory, MFA, admin rights, patching, backup, training, logging). Score from the evidence here — don't assume.`,
      },
      {
        id: "aa002-ig1",
        title: "CIS Controls v8 — IG1 overview & scoring",
        kind: "Standard extract",
        summary: "What IG1 covers and how to score it.",
        body: `## IG1 — essential cyber hygiene (56 safeguards across 18 Controls)
Key groups: C1 Asset inventory · C2 Software inventory · C4 Secure configuration · C5 Account management · C6 Access control (MFA) · C7 Vulnerability management · C8 Audit logs · C11 Data recovery · C14 Awareness training.

## Scoring per safeguard
Implemented (full evidence) / Partial (some, gaps) / Not implemented. Compliance % per Control = implemented ÷ applicable safeguards.

## Prioritisation rule
Rank gaps by exposure: a missing safeguard on the CRM that holds client data outranks one on the marketing site.`,
      },
    ],
  },

  "GRM-002": {
    objective:
      "You will draft one production-ready information-security policy (an Acceptable Use or Remote Working policy) for GlobalConnect, written to fit the house style and mapped to the ISO 27001 controls it satisfies.",
    whatToDo: [
      "Review the house-style notes from existing policies so yours fits.",
      "Pick the policy type and draft the body to the template (purpose, scope, roles, statements, exceptions, review cycle).",
      "Map each policy statement to a specific ISO 27001 Annex A control.",
      "Circulate for review, track changes, and submit for sign-off.",
    ],
    references: [
      {
        id: "grm002-context",
        title: "GlobalConnect — Policy Context & House Style",
        kind: "Source document",
        summary: "The real-world facts the policy must address + the style to match.",
        body: `## The reality the policy must govern
- Agents work from home and the office on a mix of devices (BYOD problem).
- They handle clients' customer data on calls and screens.
- Shared workstations on the call floor; tailgating into the building happens.
- Staff use WhatsApp to coordinate shifts (shadow IT).

## House style (from existing policies)
- Numbered statements ("3.1 Staff must…").
- Each policy has a control block: owner, version, approval date, review date.
- Plain, directive language; references ISO controls in a side column.

## Rule
Policy statements must address the real risks above (BYOD, shared screens, shadow IT) — a generic AUP that ignores them fails review.`,
      },
      {
        id: "grm002-mapping",
        title: "Policy Template + ISO 27001 control mapping",
        kind: "Template",
        summary: "Structure and the controls to map statements to.",
        body: `## Template sections
Purpose · Scope · Roles & responsibilities · Policy statements · Exceptions process · Review cycle · Document control block.

## Likely ISO control mappings
A.5.10 Acceptable use of information & assets; A.6.7 Remote working; A.8.1 User endpoint devices; A.5.14 Information transfer; A.8.5 Secure authentication.

## Rule
Every policy statement should map to at least one control — an unmapped statement is either redundant or you've missed the control it implements.`,
      },
    ],
  },

  "GRM-003": {
    objective:
      "You will assess one GlobalConnect department's GRC maturity against the NIST CSF 2.0 tiers, score each function with evidence, and produce a one-page roadmap to reach at least Tier 2.",
    whatToDo: [
      "Familiarise yourself with the four CSF tiers.",
      "Request maturity evidence from the department head and IT lead.",
      "Score each CSF function (Govern, Identify, Protect, Detect, Respond, Recover) 1–4 with justification.",
      "Plot current vs target on the spider diagram and draft a roadmap for the top three gaps.",
    ],
    references: [
      {
        id: "grm003-tiers",
        title: "NIST CSF 2.0 — Tier definitions",
        kind: "Standard extract",
        summary: "The 1–4 scale you must score against.",
        body: `## The four tiers
- Tier 1 Partial — ad hoc, reactive; risk managed inconsistently; little awareness.
- Tier 2 Risk-Informed — risk awareness exists but not org-wide policy; some processes defined.
- Tier 3 Repeatable — formally approved policies; consistent, repeatable processes; regular review.
- Tier 4 Adaptive — continuous improvement; risk-informed culture; adapts to new threats.

## The six functions
Govern · Identify · Protect · Detect · Respond · Recover.

## Rule
A score needs evidence. "Tier 2 because they seem aware" is not defensible; "Tier 1 — no documented risk process, confirmed in interview" is.`,
      },
      {
        id: "grm003-dept",
        title: "GlobalConnect — Operations Dept: Current State",
        kind: "Source document",
        summary: "Interview facts to score from.",
        body: `## From the interview
- Govern: no documented risk appetite; security decisions made ad hoc by the ops manager → Tier 1.
- Identify: partial asset list, no risk register → Tier 1/2.
- Protect: MFA on email, training at induction only → Tier 2.
- Detect: logs exist but unmonitored → Tier 1.
- Respond: no incident procedure (being built in DD-001) → Tier 1.
- Recover: backups run, never tested → Tier 1.

## Use this
Your scores must reflect these facts; the biggest gaps (Detect, Respond, Recover) are where your roadmap should focus.`,
      },
    ],
  },

  "DD-002": {
    objective:
      "You will build a short, effective security-awareness training module for GlobalConnect's agents covering the three behaviours that cause most incidents: phishing, passwords, and data handling.",
    whatToDo: [
      "Define one learning objective per topic.",
      "Draft the 30-minute content outline and the 10–12 slide deck.",
      "Write a five-question knowledge check aligned to the objectives.",
      "Produce a facilitator guide, pilot with two colleagues, and finalise.",
    ],
    references: [
      {
        id: "dd002-topics",
        title: "GlobalConnect — Why These Three Topics",
        kind: "Source document",
        summary: "The incident data behind the content — use real examples.",
        body: `## Last 6 months of incidents
- 4 phishing emails clicked (one led to a credential theft).
- 3 cases of password reuse found in a breach-check.
- 2 cases of agents emailing client customer lists to personal accounts to "work from home".

## Audience
Call-centre agents, high turnover, non-technical, short attention — content must be concrete and scenario-based, not theory.

## Rule
Each topic's content must be grounded in these real incidents — generic "be careful online" training won't change behaviour.`,
      },
      {
        id: "dd002-objectives",
        title: "Learning-Objective & Knowledge-Check rules",
        kind: "Template",
        summary: "How to write objectives and the check.",
        body: `## A good learning objective
Starts with an action verb and is observable: "After this module, you will be able to identify three signs of a phishing email." (Not "understand phishing".)

## Knowledge check
One question per objective + two scenario questions. Multiple choice, one clearly correct answer, plausible distractors. Aligned 1:1 to the objectives.

## Rule
If a check question doesn't map to a stated objective, either the objective or the question is wrong.`,
      },
    ],
  },

  "IE-001": {
    objective:
      "You will take five CIS IG1 safeguards from gap to implemented at GlobalConnect, tracking the work, collecting the evidence, and verifying each against its acceptance criteria.",
    whatToDo: [
      "Take the five selected safeguards and create an implementation task card for each (what, who, tools, acceptance criteria, evidence).",
      "Track progress weekly and collect evidence per completed safeguard.",
      "Verify each implementation against its acceptance criteria — pass/fail.",
      "Raise a remediation issue for any failure and update the CIS gap analysis.",
    ],
    references: [
      {
        id: "ie001-safeguards",
        title: "GlobalConnect — Five Safeguards to Implement",
        kind: "Source document",
        summary: "The five safeguards + what 'done' means for each.",
        body: `## Selected from the AA-002 gap analysis
1. 6.3 Require MFA on the customer CRM. Done = MFA enforced for all CRM users, screenshot of policy.
2. 5.3 Disable dormant accounts (>45 days). Done = process running + list of disabled accounts.
3. 4.1 Secure baseline config for agent laptops. Done = documented baseline + applied to 100% of managed devices.
4. 1.1 Maintain an asset inventory. Done = inventory tool live, ≥95% of devices enrolled.
5. 14.1 Security awareness programme. Done = module delivered (DD-002) + completion records.

## Rule
"Done" is the acceptance criterion, not "we started it". Evidence (screenshot, export, record) is mandatory for each.`,
      },
      {
        id: "ie001-tracking",
        title: "Implementation Task Card + verification",
        kind: "Template",
        summary: "What each card and the verification must contain.",
        body: `## Task card fields
What must be done · Owner (IT) · Tools/systems involved · Acceptance criteria · Evidence required · Status (Not started / In progress / Done) · Verified (pass/fail).

## Verification
Independently check the evidence against the acceptance criteria. If it doesn't meet the criterion, mark fail and raise a remediation issue — do not mark "done" on the owner's say-so.`,
      },
    ],
  },

  "IE-002": {
    objective:
      "You will bring order to GlobalConnect's chaotic document storage by defining a document-control standard (versioning, naming, access, review) and migrating the GRC documents into it.",
    whatToDo: [
      "Audit how documents are stored today.",
      "Define the document control policy (versioning scheme, naming convention, location, access, review frequency).",
      "Build the document register and the folder structure, then migrate existing docs with correct naming.",
      "Train the document owners and set review-date reminders.",
    ],
    references: [
      {
        id: "ie002-current",
        title: "GlobalConnect — Current Document Storage Audit",
        kind: "Source document",
        summary: "The mess you must fix — your standard has to solve these specific problems.",
        body: `## What the audit found
- Policies live in three places: a shared drive, email attachments, and one person's laptop.
- Multiple versions of the "Security Policy" exist; no one knows which is current.
- Files named "policy_final_v2_FINAL_use this one.docx".
- No owners, no review dates; some policies are 4 years old.
- Everyone has edit access to everything.

## Rule
Your document control policy must explicitly solve each of these: single source of truth, one current version, a naming convention, named owners, review dates, and access control.`,
      },
      {
        id: "ie002-standard",
        title: "Document Control — required standard",
        kind: "Template",
        summary: "What the policy must define.",
        body: `## The standard must set
- Versioning scheme (e.g. v1.0 approved, v1.1 minor edit, draft = v0.x).
- Naming convention (e.g. ISMS-POL-AccUse-v1.0).
- Single storage location + access rights (who can read vs edit).
- A document register (master index: title, version, status, owner, approval date, review date).
- Review frequency (e.g. annual).

## ISO link
A.5.1/A.5.37 require documented, controlled policies and operating procedures — the register is the evidence they're controlled.`,
      },
    ],
  },

  "MM-001": {
    objective:
      "You will define a small set of meaningful GRC KPIs for GlobalConnect, build a monthly tracker, and populate the first month so management can actually see whether compliance is improving.",
    whatToDo: [
      "Use the candidate indicators to pick five measurable KPIs.",
      "Complete a KPI definition card for each (formula, source, frequency, owner, target, RAG thresholds).",
      "Build the monthly tracker and collect month-1 data.",
      "Write a three-sentence management commentary interpreting the RAG status.",
    ],
    references: [
      {
        id: "mm001-kpis",
        title: "GlobalConnect — Candidate KPIs & first-month data",
        kind: "Source document",
        summary: "The indicators and the real numbers to load.",
        body: `## Five candidate KPIs (with month-1 data)
1. % staff completed security awareness training — 68%.
2. % policies reviewed in last 12 months — 40%.
3. Open risk-register items — 14 (3 overdue).
4. % systems with up-to-date patching — 72%.
5. Mean time to close audit findings — 38 days.

## Targets (agreed with the Compliance Manager)
1. ≥95%  2. ≥90%  3. <10 open  4. ≥90%  5. <30 days.

## Use this
Your tracker must use these formulas and targets — a KPI without a target and a data source can't be RAG-rated.`,
      },
      {
        id: "mm001-card",
        title: "KPI Definition Card + RAG rules",
        kind: "Template",
        summary: "What defines a usable KPI.",
        body: `## KPI definition card
Name · Formula (exactly how it's calculated) · Data source · Measurement frequency · Owner · Target threshold · RAG thresholds.

## RAG rule
- Green = meets target. Amber = within 10% of target. Red = worse than that.
- Define the thresholds up front so the colour isn't subjective.

## Rule
A KPI you can't compute from a named data source is an opinion, not a metric.`,
      },
    ],
  },

  "CA-003": {
    objective:
      "You will run structured discovery interviews with three GlobalConnect stakeholders to surface what the GRC programme actually needs to address — the real concerns, gaps and priorities — and turn them into a needs report.",
    whatToDo: [
      "Prepare a structured interview guide (8–10 open questions per stakeholder type).",
      "Brief each stakeholder in advance, then request input from the three stakeholders, probing for specifics.",
      "Write up each interview summary within 24 hours.",
      "Identify themes across all three and compile a needs-discovery report.",
    ],
    references: [
      {
        id: "ca003-stakeholders",
        title: "GlobalConnect — The Three Interviewees",
        kind: "Source document",
        summary: "Who you're interviewing and what each cares about.",
        body: `## Stakeholders
- Operations Manager — worried about agents handling client data on personal devices; wants practical rules, not paperwork.
- Client Account Lead — clients are demanding ISO 27001 and SOC 2 in contracts; fears losing deals.
- IT Lead — overstretched; concerned any new controls will slow agents down and increase handle time.

## Why this matters
Each has a different (sometimes conflicting) need. Your report must surface the tension between "more control" (client lead) and "don't slow us down" (IT/Ops) — that tension is the real finding.`,
      },
      {
        id: "ca003-guide",
        title: "Structured Interview Guide — how to run it",
        kind: "Template",
        summary: "Question design and note structure.",
        body: `## Good discovery questions are open
"What worries you most about how we handle client data today?" — not "Do you think we're secure?" (yes/no).

## Per interview capture
- The concern, in their words (quote it).
- A specific example they gave.
- What they think 'good' looks like.
- What they fear about change.

## Theme analysis
Across the three, group recurring concerns, knowledge gaps, and conflicting priorities — themes, not a transcript, are the deliverable.`,
      },
    ],
  },

  "BCRP-001": {
    objective:
      "You will run a Business Impact Analysis for one GlobalConnect department — identifying its critical functions, what they depend on, and how much downtime/data-loss the business can tolerate — to set the recovery objectives everything else plans around.",
    whatToDo: [
      "Run the BIA interview with the department manager.",
      "Identify the top five critical functions and what each depends on (people/systems/data).",
      "Define RTO and RPO for each critical function using the impact rules.",
      "Identify single points of failure and rank functions by impact in the BIA summary.",
    ],
    references: [
      {
        id: "bcrp001-dept",
        title: "GlobalConnect — Customer Operations: BIA Facts",
        kind: "Source document",
        summary: "The functions and dependencies you must analyse.",
        body: `## The department
Customer Operations — agents answer calls/chats for three client brands; 24/7 service with SLAs.

## Critical functions & dependencies
- Live call/chat handling → depends on the telephony platform (Genesys) + the CRM + internet.
- Client SLA reporting → depends on the CRM data + the reporting tool.
- Agent scheduling/WFM → depends on the WFM tool.
- Each client contract has SLA penalties for downtime > 2 hours.

## Impact facts
- If telephony is down: ~£4k/hour in SLA penalties + reputational damage; this is the highest-impact function.
- CRM data older than ~1 hour causes mis-routing and compliance issues.

## Use this
Your RTO/RPO must be driven by these impact and SLA facts — not chosen arbitrarily.`,
      },
      {
        id: "bcrp001-rules",
        title: "BIA — RTO/RPO & impact scoring",
        kind: "Standard extract",
        summary: "How to set the recovery objectives.",
        body: `## Definitions
- RTO (Recovery Time Objective) — max tolerable downtime before unacceptable impact.
- RPO (Recovery Point Objective) — max tolerable data loss (how far back a restore can be).

## How to set them
Drive RTO from when impact becomes unacceptable (here: the 2-hour SLA penalty → RTO < 2h for telephony). Drive RPO from how stale data can be before it causes harm (CRM → RPO ≤ 1h).

## Rank
Score each function by financial + operational + reputational impact of unavailability; rank to prioritise recovery investment.`,
      },
    ],
  },

  "TPRM-002": {
    objective:
      "You will complete and assess a security due-diligence review of one GlobalConnect vendor — reviewing their questionnaire responses, mapping them to controls, chasing weak answers, and scoring the residual risk.",
    whatToDo: [
      "Customise and send the security questionnaire to the vendor's contact.",
      "Review the returned responses for completeness and credibility.",
      "Request clarification for any vague or unsupported answers.",
      "Map responses to ISO controls, calculate a due-diligence score, and produce the assessment report.",
    ],
    references: [
      {
        id: "tprm002-responses",
        title: "Vendor 'DataDial Ltd' — Questionnaire Responses",
        kind: "Source document",
        summary: "The vendor's actual answers — your job is to judge them.",
        body: `## Selected responses
- "Do you encrypt customer data at rest?" → "Yes." (no detail, no standard cited — weak; needs clarification.)
- "Do you hold ISO 27001 or SOC 2?" → "We follow ISO 27001 principles." (NOT certified — a red flag.)
- "How do you handle sub-processors?" → left blank.
- "Do you have an incident-response plan?" → "Yes, tested annually." (credible.)
- "Where is data stored?" → "AWS, various regions." (vague — possible non-UK transfer; clarify.)
- "Do you run background checks on staff?" → "No."

## Use this
You must distinguish credible answers from weak/unsupported ones and chase the gaps (encryption detail, certification status, sub-processors, data location, staff screening).`,
      },
      {
        id: "tprm002-scoring",
        title: "Due-Diligence Scoring",
        kind: "Rating rules",
        summary: "How to score and decide.",
        body: `## Scoring
For each question rate the response: Satisfactory / Partial / Unsatisfactory / No response.
Due-Diligence Score = % satisfactory.

## Decision guide
- "Follows principles" ≠ certified → treat as Partial at best.
- Blank or "No" on a key control (sub-processors, screening) → Unsatisfactory.
- A vendor handling client personal data with a low score needs contractual mitigations (DPA clauses, right to audit) before approval.

## Rule
Map each material gap to the ISO control it fails (e.g. encryption → A.8.24; sub-processors → A.5.19) so the recommendation is defensible.`,
      },
    ],
  },

  // ───────────────────────── Strategic Advisory Consultants · Legal, Accounting & Consulting ─────────────────────────
  "GRM-001": {
    objective:
      "You will run the firm's first structured operational-risk identification, build a basic risk register with scored risks, and recommend a treatment for each — giving leadership a clear, ranked view of what could go wrong.",
    whatToDo: [
      "Review the asset register to understand the risk surface, then run identification workshops with two business-unit managers.",
      "Document each risk (description, threat source, existing controls, likelihood 1–5, impact 1–5, inherent score).",
      "Apply the 5×5 matrix to categorise each as Critical/High/Medium/Low.",
      "Recommend a treatment option (accept/mitigate/transfer/avoid) and present the top five.",
    ],
    references: [
      {
        id: "grm001-inputs",
        title: "Strategic Advisory — Risk Workshop Inputs",
        kind: "Source document",
        summary: "The asset surface + risks raised in the workshops.",
        body: `## The firm
A consultancy holding highly sensitive client data (financials, legal documents, M&A info). Reputation is everything.

## Risks raised in the workshops
- Consultants email client documents to personal accounts to work remotely (likelihood 4, impact 5).
- A laptop with unencrypted client files was lost last year (likelihood 3, impact 5).
- No NDA tracking — unclear which staff are covered for which client (likelihood 3, impact 4).
- Over-reliance on one partner who holds all client relationships (likelihood 2, impact 4).
- Phishing targeting finance for fraudulent payments (likelihood 4, impact 4).

## Use this
Score each risk from these likelihood/impact figures — the register must be built from real workshop input, not invented risks.`,
      },
      {
        id: "grm001-matrix",
        title: "5×5 Risk Matrix & Treatment Options",
        kind: "Standard extract",
        summary: "How to score and what to recommend.",
        body: `## Inherent score = likelihood × impact (1–25)
- 1–4 Low · 5–9 Medium · 10–15 High · 16–25 Critical.

## Treatment options (pick one per risk)
- Mitigate — add/strengthen a control (most common).
- Transfer — insurance or contract (e.g. cyber insurance).
- Avoid — stop the activity causing the risk.
- Accept — only for Low risks, with sign-off.

## Rule
Every risk needs a named owner and a treatment. A Critical/High risk marked "accept" without leadership sign-off is itself a finding.`,
      },
    ],
  },

  "DD-003": {
    objective:
      "You will create a defensible data-retention schedule for one data category at the firm — stating how long each data element is kept, why (the legal basis), and how it's disposed of — so the firm neither over-retains nor deletes too early.",
    whatToDo: [
      "Identify the target data category and research the applicable legal retention requirements.",
      "Request from the data and system owners where the data lives, is backed up and archived.",
      "Complete the retention schedule row by row (trigger, period, review point, disposal method).",
      "Map each entry to the relevant ISO control and obtain Legal sign-off.",
    ],
    references: [
      {
        id: "dd003-legal",
        title: "Strategic Advisory — Retention Requirements (HR/Payroll data)",
        kind: "Source document",
        summary: "The legal retention periods you must apply — these are not optional.",
        body: `## Target category: HR & payroll records (UK)
- Payroll/tax records — HMRC requires retention for 6 years (current + 5 prior years).
- Statutory maternity/paternity pay records — 3 years.
- Right-to-work checks — 2 years after employment ends.
- Recruitment records for unsuccessful candidates — 6–12 months (data-minimisation: don't keep longer).
- General HR file — typically 6 years after leaving (limitation period for claims).

## The conflict to resolve
GDPR says don't keep personal data longer than necessary; tax law says keep 6 years. Your schedule must reconcile the two — keep for the legal minimum, then dispose securely.`,
      },
      {
        id: "dd003-schedule",
        title: "Retention Schedule — fields & disposal",
        kind: "Template",
        summary: "What each row must specify.",
        body: `## Per data element
- Retention trigger (e.g. "end of employment", "tax year end").
- Retention period (the legal minimum from the requirements).
- Review point.
- Disposal method: secure deletion / anonymisation / archive.

## Disposal rule
Personal data must be securely deleted or anonymised at end of life — not just "left in the system". Map each entry to ISO A.8.10 (Information deletion) and A.5.33 (Protection of records).`,
      },
    ],
  },

  "TV-002": {
    objective:
      "You will desk-test whether three of the firm's policies are actually being followed by examining real evidence, rate each control compliant/partial/non-compliant, and report a compliance rate with remediation.",
    whatToDo: [
      "Select three policies and, for each, define two or three testable control statements and the evidence that would prove compliance.",
      "Request the evidence samples and evaluate each against the control statement.",
      "Document findings in the workpaper and calculate a compliance rate per policy.",
      "Draft remediation recommendations and compile the spot-check report.",
    ],
    references: [
      {
        id: "tv002-evidence",
        title: "Strategic Advisory — Evidence Samples",
        kind: "Source document",
        summary: "The actual evidence to test — you judge compliance from this.",
        body: `## Policy 1 — Security Awareness ("all staff trained annually")
Evidence: training log shows 22 of 30 staff completed this year. → 73% — partial compliance.

## Policy 2 — Access Control ("access reviewed quarterly")
Evidence: last documented access review was 14 months ago. → non-compliant.

## Policy 3 — Encryption ("all laptops encrypted")
Evidence: endpoint report shows 28 of 30 encrypted; 2 unmanaged personal laptops not. → partial.

## Use this
Your findings must be driven by these numbers. "Mostly compliant" is not a finding; "73% trained vs 100% required = partial" is.`,
      },
      {
        id: "tv002-rules",
        title: "Control Testing — rating rules",
        kind: "Testing rules",
        summary: "How to rate and calculate.",
        body: `## Rating each control statement
- Compliant — evidence fully meets the statement.
- Partially compliant — meets it for most, with clear exceptions.
- Non-compliant — evidence shows the control isn't operating (or no evidence exists).

## Compliance rate per policy
(# compliant statements ÷ total statements), or weight by control statements tested.

## Rule
"No evidence provided" = non-compliant, not "unknown" — the absence of evidence is itself the finding.`,
      },
    ],
  },

  "MM-002": {
    objective:
      "You will run the monthly risk-register review for the firm — re-scoring risks, updating treatment status, capturing new risks, and reporting whether the overall risk position improved or worsened.",
    whatToDo: [
      "Schedule the review and circulate the current register for pre-reading.",
      "Facilitate the meeting: for each risk, check whether likelihood/impact changed and whether treatments are on track.",
      "Update scores and add any new risks in the standard format.",
      "Calculate whether residual risk improved/worsened/held and produce the updated register + one-page summary.",
    ],
    references: [
      {
        id: "mm002-register",
        title: "Strategic Advisory — Current Risk Register (last month)",
        kind: "Source document",
        summary: "The starting position — you update from here.",
        body: `## Open risks last month
- R1 Client data on personal devices — High (12); treatment: rolling out MDM (40% done).
- R2 Lost-laptop / unencrypted data — High (15); treatment: encryption project (now complete → re-score).
- R3 No NDA tracking — Medium (9); treatment: not started.
- R4 Finance phishing/fraud — High (16); treatment: payment-verification process being introduced.

## New since last month
- A consultant clicked a phishing link; no breach, but raises R4's likelihood.

## Use this
R2's encryption project is done → its impact/likelihood should drop; the phishing event affects R4. Your re-scores must reflect these real changes.`,
      },
      {
        id: "mm002-rules",
        title: "Risk Review — re-scoring & portfolio rules",
        kind: "Standard rules",
        summary: "How to re-score and judge the portfolio.",
        body: `## Re-scoring
- A completed mitigation reduces residual risk (drop likelihood and/or impact) — record the new score and why.
- A new event can raise a risk's likelihood.
- New risks get a risk ID and full scoring in the standard format.

## Portfolio direction
Compare total/average residual risk vs last month: improved, worsened, or stable. Management wants the one-line trend, backed by the numbers.

## Rule
Don't close a risk just because the treatment finished — confirm the residual score is now acceptable first.`,
      },
    ],
  },

  "PE-002": {
    objective:
      "You will assemble an audit-ready evidence pack for a selected ISO 27001 control area — collecting, labelling and quality-checking the evidence an auditor would demand, so the firm walks into the audit prepared.",
    whatToDo: [
      "Select the clause/controls and identify every evidence item an auditor would expect.",
      "Collect each item from the relevant owners and label it to the convention.",
      "Reject anything outdated or incomplete; compile the structured evidence pack with an index.",
      "Self-review against the audit checklist and present for a mock-audit check.",
    ],
    references: [
      {
        id: "pe002-evidence",
        title: "Audit Evidence Requirements — A.8.2 Privileged Access",
        kind: "Source document",
        summary: "Exactly what an auditor will ask to see for this control.",
        body: `## Control under audit: A.8.2 Privileged access rights
An auditor will expect:
- The approved list of privileged users (the register).
- Evidence of approval for each grant (tickets/emails).
- Evidence of the last quarterly access review (dated, signed).
- Evidence that leavers' privileged access was removed (HR leaver list vs access logs).
- The policy that defines how privileged access is governed.

## What's missing today
There's a privileged-user list but no approval records for two grants, and the last review is undated. Those are your gaps to flag, not to hide.`,
      },
      {
        id: "pe002-labelling",
        title: "Evidence Labelling & Quality rules",
        kind: "Template",
        summary: "How to label and what to reject.",
        body: `## Labelling convention
Evidence ID · Control reference (A.8.2) · Date · Version · Source (who/where it came from).

## Quality rules — reject evidence that is
- Out of date (a review from 14 months ago doesn't evidence "quarterly").
- Unsigned/undated where approval is the point.
- A screenshot with no context (no date, no system shown).

## Rule
An evidence pack with gaps, honestly indexed, beats a pack that hides them — auditors test completeness, and a hidden gap becomes a finding plus a trust problem.`,
      },
    ],
  },

  "QA-001": {
    objective:
      "You will quality-review three of the firm's GRC documents against a structured checklist, log every deficiency with a severity, and confirm the corrections close out — raising the quality bar of the document set.",
    whatToDo: [
      "Apply the document-quality checklist to each of the three documents.",
      "Log each deficiency on a correction request (description, section, severity, recommended fix).",
      "Compile the quality-review report and discuss major deficiencies with each owner.",
      "Re-check corrected documents and confirm closure.",
    ],
    references: [
      {
        id: "qa001-docs",
        title: "Strategic Advisory — Three Documents Under Review",
        kind: "Source document",
        summary: "The documents and the deficiencies planted in them.",
        body: `## Documents
1. Information Security Policy — has no version number or approval date in its control block; references "ISO 27001:2013" (outdated).
2. Incident Response Procedure — internally inconsistent: section 2 says report within 1 hour, section 5 says 24 hours.
3. Access Control Policy — full of jargon ("RBAC least-privilege entitlement reconciliation") with no plain-language explanation; no review date.

## Use this
The deficiencies above are real and findable with the checklist — your report must catch each (control-block gaps, outdated reference, internal inconsistency, plain-language failure, missing review date).`,
      },
      {
        id: "qa001-checklist",
        title: "Document Quality Review — checklist & severity",
        kind: "Template",
        summary: "What to check and how to grade deficiencies.",
        body: `## Checklist (per document)
- Document control block correct (owner, version, approval & review dates)?
- Internally consistent (no contradictory statements)?
- Plain-language compliant?
- ISO 27001 control references correct and current?
- Approval signatures present?
- Review date current (not overdue)?

## Severity
- Major — affects correctness or compliance (outdated standard, contradiction, no approval).
- Minor — cosmetic or stylistic.

## Rule
A correction request must say what's wrong, where, and the recommended fix — "improve this" is not actionable.`,
      },
    ],
  },

  "KT-002": {
    objective:
      "You will close out your GRC 101 rotation by capturing what you learned and what the programme could do better — producing a lessons-learned report a future mentee could actually use to prepare.",
    whatToDo: [
      "Review all your completed deliverables from the rotation.",
      "Complete the lessons-learned worksheet honestly (what you learned, what was hard, what you'd do differently, remaining gaps).",
      "Identify the top three improvements to the programme itself.",
      "Write the lessons-learned report and compile a portfolio index of everything you produced.",
    ],
    references: [
      {
        id: "kt002-portfolio",
        title: "Your GRC 101 Deliverables (for the portfolio index)",
        kind: "Source document",
        summary: "What you produced across the rotation — the basis of your reflection.",
        body: `## Across four placements you produced (among others)
- Asset register & classification (AA-001), CIS IG1 gap analysis (AA-002), GDPR RoPA/DPIA (AA-003).
- Risk register (GRM-001), policies (GRM-002), maturity assessment (GRM-003).
- Incident procedure (DD-001), BIA & DR checklist (BCRP-001/002), evidence pack (PE-002).
- Roadmap (SPA-001), KPIs (MM-001), management report (CA-002).

## Use this
The portfolio index must list every deliverable with where it lives — and your reflection should reference specific tasks, not generalities ("the BIA taught me to drive RTO from impact, not opinion").`,
      },
      {
        id: "kt002-worksheet",
        title: "Lessons-Learned Worksheet — structure",
        kind: "Template",
        summary: "The honest questions to answer.",
        body: `## Answer each
- What did I learn? (concrete skills/insights, tied to specific tasks)
- What went well?
- What was difficult, and why?
- What would I do differently next time?
- What knowledge gaps do I still have?

## Programme improvements
Top three concrete suggestions (a missing template, a task that needed more guidance, an unclear instruction).

## Rule
Useful lessons are specific and transferable. "It was a good experience" helps no one; "I underestimated how much evidence an auditor wants — start the evidence pack earlier" does.`,
      },
    ],
  },
};
