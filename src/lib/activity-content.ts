// Per-ACTION content for the activity workspace: Objective, What to do, and Reference material
// (required reading) for each individual verb action. Keyed by `${taskCode}/${activityCode}`,
// e.g. "AA-001/1.1". References carry the facts/rules you need for THAT step. Second person ("You will …").
import type { TaskReference } from "./taskmeta";

export interface ActivityContent {
  objective: string;
  whatToDo: string[];
  references?: TaskReference[];
}

export const ACTIVITY_CONTENT: Record<string, ActivityContent> = {
  // ───────────── AA-001 · Information Asset Inventory & Classification (CloudTech) ─────────────
  "AA-001/1.1": {
    objective: "You will request the starting list of information assets from the people who run CloudTech's systems, so you have a base to build the register from.",
    whatToDo: [
      "Address the request to a named role (IT / Operations Lead), not 'the team'.",
      "Ask for at least three specific things (systems list, what data each holds, who owns each).",
      "State a clear deadline and why you need it.",
    ],
    references: [
      {
        id: "aa001-1-1-what",
        title: "What IT/Operations Can Give You",
        kind: "Source document",
        summary: "What to actually ask for — and what they'll hand back.",
        body: `## Who to ask
The IT/Operations Lead at CloudTech maintains the day-to-day systems list.

## What they can provide (ask for these by name)
- A list of production systems and the cloud services in use (the "estate list").
- For each system, roughly what data it holds and the team that runs it.
- Network/architecture diagrams (you'll need these for step 1.5).

## What a good request looks like
Named recipient · 3+ specific items · a deadline · a one-line reason. A vague "please send me everything about our systems" gets ignored — be specific.`,
      },
    ],
  },
  "AA-001/1.2": {
    objective: "You will interview the process owners to find the assets IT doesn't know about — the spreadsheets, exports and shadow systems teams use day to day.",
    whatToDo: [
      "Use the interview guide to ask each owner what data they create, receive, store and share.",
      "Record the named owner for each asset you uncover.",
      "Probe for the 'unofficial' assets — local files, personal drives, exports.",
    ],
    references: [
      {
        id: "aa001-1-2-guide",
        title: "Process-Owner Interview Guide",
        kind: "Interview guide",
        summary: "The questions that surface hidden assets.",
        body: `## Ask each process owner
- What information do you create or collect to do your job?
- Where do you keep it — system, shared drive, your own laptop?
- Who else receives it, inside or outside CloudTech?
- Do you keep any spreadsheets or exports the official systems don't cover?
- Who would you say "owns" this data?

## What you'll uncover at CloudTech
The marketing email-list spreadsheet and the old database backup on an engineer's laptop only show up in interviews — IT's list won't have them. Capturing these is the point of this step.`,
      },
    ],
  },
  "AA-001/1.3": {
    objective: "You will turn everything you've gathered into structured rows in the Asset Register — one row per asset, with the mandatory fields populated.",
    whatToDo: [
      "Create one row per distinct asset from the intake notes and interviews.",
      "Populate every mandatory field: asset name, data held, location, and a named owner (a role, not a person).",
      "Leave classification blank for now — that's the next step.",
    ],
    references: [
      {
        id: "aa001-1-3-intake",
        title: "CloudTech — Asset Intake Notes",
        kind: "Source document",
        summary: "The assets to record (from IT + the interviews).",
        body: `## Assets gathered so far
- Customer accounts database (Postgres, AWS eu-west-1): names, emails, hashed passwords, billing addresses. Owner: Platform Engineering Lead.
- Support tickets (Zendesk): customer attachments, personal data. Owner: Head of Customer Success.
- Marketing email list (Mailchimp export, shared drive): prospect names + emails. Owner: none (intern keeps it) → record "owner: UNASSIGNED".
- Runbooks/process docs (Confluence). Owner: Engineering.
- Platform source code (private GitHub). Owner: CTO.
- HR & payroll (BambooHR). Owner: People Ops.
- Public website/blog (WordPress). Owner: Marketing.
- Old database backup (.sql on a laptop): unknown contents. Owner: UNASSIGNED.

## Register fields (mandatory)
Asset name · Data held · Storage location · Owner (role) · [Classification — next step].`,
      },
      {
        id: "aa001-1-3-rules",
        title: "Register Field Rules",
        kind: "Standard rules",
        summary: "How to fill the fields correctly.",
        body: `## Rules
- Owner must be a role/role-holder, not a department ("Platform Engineering Lead", not "Engineering").
- If there's genuinely no owner, record "UNASSIGNED" — don't leave it blank (it becomes a finding in step 1.6).
- "Data held" should name the data types, not just "customer data" — e.g. "names, emails, hashed passwords".
- One asset per row; don't merge the accounts DB and its backup into one row.`,
      },
    ],
  },
  "AA-001/1.4": {
    objective: "You will classify every asset in the register as Public, Internal or Confidential by applying CloudTech's scheme — consistently, with a rationale, never by gut feel.",
    whatToDo: [
      "For each asset, apply the classification rules from the scheme.",
      "Give every classification a one-line rationale.",
      "Where personal data, credentials, source code or financials are involved, classify Confidential — these are mandatory.",
    ],
    references: [
      {
        id: "aa001-1-4-scheme",
        title: "CloudTech Data Classification Scheme",
        kind: "Classification scheme",
        summary: "The rules you must apply.",
        body: `## Levels
- Public — for public release; harmless if seen by anyone (website, blog).
- Internal — operational, not public, low harm if leaked (runbooks, process docs).
- Confidential — material harm to CloudTech, customers or staff if disclosed.

## Mandatory rules (override intuition)
- Customer or staff personal data → at least Confidential.
- Credentials / secrets / at-rest passwords → Confidential.
- Source code / proprietary IP → Confidential.
- Financial / payroll data → Confidential.
- Unsure between two levels → pick the higher, note why.

## Watch-outs
Support tickets feel "Internal" but hold personal-data attachments → Confidential. The unknown backup could hold customer data → treat as Confidential until proven otherwise.`,
      },
    ],
  },
  "AA-001/1.5": {
    objective: "You will cross-reference your register against CloudTech's network diagrams to catch assets that exist on the network but never made it onto anyone's list.",
    whatToDo: [
      "Compare every system shown on the network diagram against your register.",
      "Flag at least one discrepancy class (on diagram but not in register, or vice-versa).",
      "Add any newly-found assets to the register and note the discovery method.",
    ],
    references: [
      {
        id: "aa001-1-5-diagram",
        title: "CloudTech — Network Diagram (annotated)",
        kind: "Source document",
        summary: "Systems on the network — some are missing from your register.",
        body: `## What the diagram shows
- App servers → Customer accounts DB (in your register ✓).
- A reporting/analytics database replicating customer data nightly → NOT in your register or the intake notes. (Discrepancy — add it; it holds a copy of personal data, so Confidential.)
- A staging environment with a copy of production data → NOT in your register. (Discrepancy — staging data is a classic blind spot.)
- The Zendesk and Mailchimp integrations (already captured ✓).
- A legacy SFTP server still receiving partner files → NOT captured. (Discrepancy.)

## The point of this step
The diagram reveals real assets that people forget to mention. Cross-referencing two sources is how you find them — you cannot complete this step without reading the diagram.`,
      },
    ],
  },
  "AA-001/1.6": {
    objective: "You will scan the completed register for assets with no owner and flag each for remediation with a proposed action and an accountable role.",
    whatToDo: [
      "Find every asset marked UNASSIGNED or with an unclear owner.",
      "For each flag, propose a specific action (e.g. 'assign owner', 'delete the backup', 'sign a DPA').",
      "Name the accountable role who should action it — every flag needs an owner of the fix.",
    ],
    references: [
      {
        id: "aa001-1-6-rules",
        title: "Flagging Rules (Identify)",
        kind: "Standard rules",
        summary: "What makes a valid flag.",
        body: `## A valid flag has both
- A proposed action (what should happen), and
- A named accountable role (who should do it).

## What to flag in this register
- The marketing email list — no owner + personal data. Action: assign an owner and sign a DPA with Mailchimp. Accountable: Head of Marketing.
- The old .sql backup — unknown owner/contents. Action: identify contents, then securely delete or bring under control. Accountable: Platform Engineering Lead.
- The reporting DB / staging copy (found in 1.5) — confirm owner and that personal data there is justified.

## Standard
ISO 27001 A.5.9 — every asset must have an owner; an ownerless asset is itself the finding.`,
      },
    ],
  },
  "AA-001/1.7": {
    objective: "You will submit the near-final register to your mentor for a quality check, with a cover note that makes it easy to review.",
    whatToDo: [
      "Write a short cover note: what the register covers, what you found, and what you're unsure about.",
      "Confirm you've addressed any earlier feedback.",
      "Submit for review (this is a quality gate, not the final sign-off).",
    ],
    references: [
      {
        id: "aa001-1-7-checklist",
        title: "Pre-Review Checklist",
        kind: "Checklist",
        summary: "What 'review-ready' means before you submit.",
        body: `## Before you submit, confirm
- Every asset has an owner (or an explicit UNASSIGNED + a flag).
- Every asset has a classification with a rationale.
- The discrepancies from the network diagram (step 1.5) are included.
- Your flags (step 1.6) each have an action and an accountable role.

## Cover note (keep it short)
1–2 sentences on scope, your top 2–3 findings, and any open questions for the mentor. A reviewer should know in 30 seconds what to look at.`,
      },
    ],
  },
  "AA-001/1.8": {
    objective: "You will present the finished register to the department head and obtain their acknowledgement/sign-off, anticipating the questions a busy manager will ask.",
    whatToDo: [
      "Prepare a short summary: how many assets, how many Confidential, the key gaps to fix.",
      "Anticipate at least three questions the department head will ask and have answers ready.",
      "Record the sign-off decision and date.",
    ],
    references: [
      {
        id: "aa001-1-8-questions",
        title: "What the Department Head Will Ask",
        kind: "Briefing notes",
        summary: "Anticipate these — and the sign-off you need.",
        body: `## Likely questions
- "What's our most sensitive data and is it protected?" → the customer accounts DB + its copies (reporting/staging) — all Confidential.
- "What's the biggest risk you found?" → the ownerless backup with unknown contents, and personal data flowing to Mailchimp with no DPA.
- "What do you need from me?" → owners assigned to the unassigned assets, and approval to deal with the backup.

## Sign-off
Record the decision (approved / approved with conditions), any conditions, and the date. A presentation with no recorded decision isn't finished.`,
      },
    ],
  },

  // ───────────── CRM-002 · ISO 27001 Control Mapping to Business Processes (CloudTech) ─────────────
  "CRM-002/8.1": {
    objective: "You will agree the five CloudTech business processes that the control-mapping exercise will cover, so the scope is clear and risk-relevant.",
    whatToDo: [
      "Pick five processes that actually create information-security risk (not trivial ones).",
      "Record why each is in scope in one line.",
    ],
    references: [
      {
        id: "crm002-8-1", title: "CloudTech — Candidate Processes", kind: "Source document",
        summary: "The processes available and the risk each carries.",
        body: `## Pick five from these
- User onboarding — creates accounts, stores personal data, sends credentials.
- Software release — weekly deploys, no formal change approval today.
- Customer data backup — nightly backups, restores never tested.
- Vendor contracting — informal security review.
- Incident logging — tracked in a chat channel, no severity/escalation.

## Rule
Choose processes where a control failure would actually hurt CloudTech — each carries a distinct risk above, which is why these five are the standard scope.`,
      },
    ],
  },
  "CRM-002/8.2": {
    objective: "You will identify, for each in-scope process, which ISO 27001 Annex A controls apply across all four control themes.",
    whatToDo: [
      "Go through each process and list the Annex A controls that address its risks.",
      "Cover all four themes (Organisational, People, Physical, Technological) — don't stop at technical controls.",
    ],
    references: [
      {
        id: "crm002-8-2", title: "Annex A — themes & likely controls", kind: "Standard extract",
        summary: "The control library and the controls these processes usually need.",
        body: `## The four themes
A.5 Organisational · A.6 People · A.7 Physical · A.8 Technological.

## Controls these processes usually need
- User onboarding → A.5.16 Identity mgmt, A.8.2 Privileged access, A.5.18 Access rights.
- Software release → A.8.32 Change management, A.8.28 Secure coding.
- Backup → A.8.13 Information backup.
- Vendor contracting → A.5.19/5.20 Supplier relationships.
- Incident logging → A.5.24–5.26 Incident management, A.8.15 Logging.

## Rule
A control is applicable only if the process creates the risk it addresses.`,
      },
    ],
  },
  "CRM-002/8.3": {
    objective: "You will document, for each control, whether it is applicable, partially applicable, or not applicable — with a rationale, so the judgement is defensible.",
    whatToDo: [
      "For every control you considered, mark Applicable / Partial / Not applicable.",
      "Give a one-line rationale for each call — especially the 'Not applicable' ones.",
    ],
    references: [
      {
        id: "crm002-8-3", title: "Applicability — how to decide", kind: "Standard rules",
        summary: "What 'applicable' really means.",
        body: `## Definitions
- Applicable — the process creates the risk and the control should operate.
- Partial — the control applies but only some elements are relevant.
- Not applicable — the risk genuinely doesn't exist for this process (must be justified).

## Rule
"Not applicable" is the riskiest call — an auditor scrutinises it most. Never mark a control N/A just because it isn't implemented; that's a gap, not an exclusion.`,
      },
    ],
  },
  "CRM-002/8.4": {
    objective: "You will record, for each applicable control, its current implementation status, the evidence you'd expect, and who owns it.",
    whatToDo: [
      "For each applicable control, record status: Implemented / Partial / Not implemented.",
      "Name the evidence type that would prove it operates, and the control owner (a role).",
    ],
    references: [
      {
        id: "crm002-8-4", title: "CloudTech — Implementation Snapshot", kind: "Source document",
        summary: "What's actually in place — record from this.",
        body: `## Current state
- A.8.2 Privileged access — partial; admin list exists, no quarterly review. Owner: Platform Eng Lead.
- A.8.32 Change management — not implemented; deploys auto, no approval record. Owner: CTO.
- A.8.13 Backup — partial; backups run, never restore-tested. Owner: Platform Eng Lead.
- A.5.19 Supplier relationships — not implemented; vendor review informal. Owner: COO.

## Rule
Status must be evidence-based: "Implemented" needs the evidence type named (e.g. "quarterly access review record"). No evidence = at best Partial.`,
      },
    ],
  },
  "CRM-002/8.5": {
    objective: "You will validate your control applicability for one process by walking it through with the actual process owner, catching anything the paper exercise missed.",
    whatToDo: [
      "Pick one process and walk each step with its owner.",
      "Confirm the controls you mapped really apply, and capture any control or risk you missed.",
    ],
    references: [
      {
        id: "crm002-8-5", title: "Process Walk-through Guide", kind: "Interview guide",
        summary: "What to confirm with the owner.",
        body: `## Ask the owner, step by step
- What actually happens here, in order?
- Where is the data, and who can access it at each step?
- What could go wrong, and what stops it today?
- Are there manual workarounds or exceptions I won't see on paper?

## Why
Owners reveal real gaps (a shared password, a manual export) that the control library never shows. Validation is what makes your matrix credible.`,
      },
    ],
  },
  "CRM-002/8.6": {
    objective: "You will build the Control Matrix — a process × control grid that shows, at a glance, applicability and implementation status for the whole scope.",
    whatToDo: [
      "Lay out processes as rows and controls as columns (or vice versa).",
      "Fill each cell with applicability + status; make gaps visually obvious.",
    ],
    references: [
      {
        id: "crm002-8-6", title: "Control Matrix — format rules", kind: "Template",
        summary: "How to structure the grid.",
        body: `## Matrix rules
- Every populated cell must trace to your applicability + status work — no blank "applicable" cells.
- Use a clear status key (e.g. Implemented / Partial / Not implemented / N/A).
- No orphan rows/columns: every process and every applicable control appears.

## Purpose
The matrix is the at-a-glance evidence; management should see the red (not-implemented, applicable) cells instantly.`,
      },
    ],
  },
  "CRM-002/8.7": {
    objective: "You will surface the top five uncontrolled risks — the applicable controls that aren't implemented — and explain the exposure each creates.",
    whatToDo: [
      "Scan the matrix for applicable-but-not-implemented controls.",
      "Pick the five highest-exposure gaps and name the risk each creates for CloudTech.",
    ],
    references: [
      {
        id: "crm002-8-7", title: "Prioritising the gaps", kind: "Standard rules",
        summary: "How to rank the uncontrolled risks.",
        body: `## Rank by exposure
A missing control on a process handling customer personal data (onboarding, backup) outranks one on an internal process.

## Likely top gaps at CloudTech
- No change management on weekly production deploys (A.8.32).
- Backups never restore-tested (A.8.13).
- No supplier security review (A.5.19).

## Rule
Each flagged gap needs a proposed action and an owner — a risk with no owner of the fix is just a complaint.`,
      },
    ],
  },
  "CRM-002/8.8": {
    objective: "You will review the completed matrix with your mentor and refine it, so it's accurate and defensible before it informs the roadmap.",
    whatToDo: [
      "Write a short cover note: scope, top gaps, and anything you're unsure about.",
      "Address the mentor's feedback and finalise the matrix.",
    ],
    references: [
      {
        id: "crm002-8-8", title: "Review Checklist", kind: "Checklist",
        summary: "What 'review-ready' means here.",
        body: `## Before review, confirm
- Every applicability and N/A call has a rationale.
- Status reflects real evidence, not optimism.
- The top-five gaps each have an action + owner.
- The walk-through findings (8.5) are reflected.

## Cover note
Scope + your top 2–3 gaps + open questions. Keep it to a few lines so the mentor reviews the right things.`,
      },
    ],
  },

  // ───────────── CRM-003 · SOC 2 Awareness — Trust Services Criteria Mapping (CloudTech) ─────────────
  "CRM-003/9.1": {
    objective: "You will read and annotate a sample SOC 2 Type II report so you understand what a SOC 2 control and audit test actually look like before mapping CloudTech to them.",
    whatToDo: ["Read the sample report and annotate the control descriptions and test results.", "Note the structure: criterion, control, test performed, result."],
    references: [{ id: "crm003-9-1", title: "Sample SOC 2 Report — what to look for", kind: "Source document", summary: "How a SOC 2 report is structured.", body: `## A SOC 2 Type II report contains
- The Trust Services Criteria (here: Security / Common Criteria).
- For each: the service organisation's control, the auditor's test, and the result (no exceptions / exceptions noted).

## What to notice
"Exceptions noted" = a control that failed testing. The report is evidence the control operated over a period (Type II), not just at a point in time.` }],
  },
  "CRM-003/9.2": {
    objective: "You will list the SOC 2 Common Criteria control points relevant to the Security category, so you have the checklist to map CloudTech against.",
    whatToDo: ["List the CC1–CC9 criteria.", "Focus on CC6 (access) and CC8 (change) — the heaviest for CloudTech."],
    references: [{ id: "crm003-9-2", title: "Common Criteria CC1–CC9", kind: "Standard extract", summary: "The criteria you must list and map.", body: `## Common Criteria (Security)
CC1 Control environment · CC2 Communication & information · CC3 Risk assessment · CC4 Monitoring · CC5 Control activities · CC6 Logical & physical access · CC7 System operations · CC8 Change management · CC9 Risk mitigation.

## Note
CC6 and CC8 overlap directly with your ISO work (access control, change management) — reuse that evidence.` }],
  },
  "CRM-003/9.3": {
    objective: "You will document, for each criterion, an example audit test, the evidence expected, and which CloudTech control or policy addresses it.",
    whatToDo: ["For each criterion record: example test, expected evidence, mapped CloudTech control.", "Be specific about evidence (the actual artefact an auditor would request)."],
    references: [{ id: "crm003-9-3", title: "CloudTech controls to map", kind: "Source document", summary: "What CloudTech has, to map against each criterion.", body: `## CloudTech controls
- MFA on admin + AWS; SSO for staff (CC6).
- Joiner/leaver process, but deprovisioning manual & delayed (CC6 partial).
- Code review before merge; automated deploys, no approval record (CC8 partial).
- No documented risk assessment (CC3 gap).
- No central deficiency monitoring (CC4 gap).

## Rule
Map each criterion to one of these; name the evidence (e.g. "MFA policy screenshot", "access-review record").` }],
  },
  "CRM-003/9.4": {
    objective: "You will identify the criteria where CloudTech has no internal control mapped — the gaps.",
    whatToDo: ["Flag every criterion with no mapped control.", "Note whether it's a full gap or a partial."],
    references: [{ id: "crm003-9-4", title: "Spotting gaps", kind: "Standard rules", summary: "What counts as a gap.", body: `## Gap rules
- No control mapped to a criterion = a Red gap.
- Control exists but fails testing or is informal = Amber/partial.

## CloudTech's likely gaps
CC3 (risk assessment) and CC4 (deficiency monitoring) have nothing mapped → Red. CC6 deprovisioning is partial → Amber.` }],
  },
  "CRM-003/9.5": {
    objective: "You will cross-reference your SOC 2 findings against the ISO 27001 Control Matrix (CRM-002) to reuse evidence and spot inconsistencies.",
    whatToDo: ["Match each SOC 2 criterion to the equivalent ISO control.", "Flag anywhere the two assessments disagree."],
    references: [{ id: "crm003-9-5", title: "SOC 2 ↔ ISO 27001 overlap", kind: "Standard extract", summary: "Where the frameworks line up.", body: `## Common overlaps
- CC6 Access ↔ ISO A.8.2/A.5.18.
- CC8 Change ↔ ISO A.8.32.
- CC7 Operations ↔ ISO A.5.24–5.26 incident mgmt + A.8.15 logging.

## Why
If your ISO matrix says A.8.32 is "not implemented" but your SOC 2 mapping says CC8 is fine, one of them is wrong — cross-referencing catches it.` }],
  },
  "CRM-003/9.6": {
    objective: "You will summarise CloudTech's SOC 2 readiness on a simple Green/Amber/Red dashboard per criteria cluster.",
    whatToDo: ["Rate each CC cluster Green/Amber/Red from your mapping.", "Make the Reds (real gaps) unmissable."],
    references: [{ id: "crm003-9-6", title: "Readiness RAG rules", kind: "Standard rules", summary: "How to rate each cluster.", body: `## RAG
- Green — control mapped and operating with evidence.
- Amber — control exists but partial/informal/untested.
- Red — no control mapped.

## Rule
Be honest. A dashboard that's all Green to look good is worse than useless — the point is to show management where the work is.` }],
  },
  "CRM-003/9.7": {
    objective: "You will review your readiness summary with the Information Security Auditor mentor and refine it.",
    whatToDo: ["Share the dashboard + mapping with a short cover note.", "Address feedback and finalise."],
    references: [{ id: "crm003-9-7", title: "Review checklist", kind: "Checklist", summary: "Before you submit.", body: `## Confirm
- Every criterion mapped or flagged.
- RAG ratings backed by evidence.
- ISO cross-reference done (9.5).

## Cover note
Scope + top gaps + open questions, kept short.` }],
  },
  "CRM-003/9.8": {
    objective: "You will write a two-page SOC 2 Awareness Briefing that explains, in plain language, what SOC 2 means for the IT team and where CloudTech stands.",
    whatToDo: ["Explain SOC 2 in plain terms and why a customer wants it.", "State the top gaps and what the team needs to do."],
    references: [{ id: "crm003-9-8", title: "Briefing rules", kind: "Template", summary: "How to write for a non-audit audience.", body: `## Two-page briefing
- What SOC 2 is, in one paragraph (no jargon).
- Why it matters to CloudTech (the enterprise customer).
- Where we are (the RAG summary).
- The 3 things the IT team must do next.

## Rule
Audience is engineers, not auditors. Concrete actions beat criteria numbers.` }],
  },

  // ───────────── SPA-001 · GRC Programme Roadmap — 12-Month Plan (CloudTech) ─────────────
  "SPA-001/1": {
    objective: "You will consolidate the findings from the gap analysis, risk register and maturity assessment into one place, so the roadmap is built from real evidence.",
    whatToDo: ["Pull the open gaps and risks from the three prior deliverables.", "De-duplicate overlapping items."],
    references: [{ id: "spa001-1", title: "CloudTech — Consolidated Findings", kind: "Source document", summary: "The items your roadmap schedules.", body: `## Rolled up from earlier work
- CIS IG1 at 41%; gaps: MFA everywhere, asset inventory, backup testing.
- Top risks: delayed deprovisioning (High), untested backups (High), informal vendor reviews (Medium).
- Maturity: Identify/Protect Tier 1; Detect/Respond weak.

## Rule
Every roadmap line must trace to one of these — don't invent new work.` }],
  },
  "SPA-001/2": {
    objective: "You will categorise every gap into Quick Wins, Medium-Term, or Strategic horizons using defined rules.",
    whatToDo: ["Assign each item a horizon (0–3m / 3–6m / 6–12m).", "Sequence so quick wins build momentum for strategic items."],
    references: [{ id: "spa001-2", title: "Horizon rules", kind: "Planning rules", summary: "How to bucket each item.", body: `## Horizons
- Quick Win (0–3m) — low effort, high risk-reduction; config/docs (enable MFA, turn on logging).
- Medium-Term (3–6m) — small project/budget (backup testing, deprovisioning automation).
- Strategic (6–12m) — org change/programme (risk framework, vendor-risk programme).

## Rule
Categorise by effort + risk-reduction, not by how interesting it is.` }],
  },
  "SPA-001/3": {
    objective: "You will specify each planned action in full: what, which control it addresses, effort, owner, success metric, and target date.",
    whatToDo: ["For each action capture all six fields.", "Make the success metric measurable."],
    references: [{ id: "spa001-3", title: "Action record fields", kind: "Template", summary: "What every roadmap action needs.", body: `## Per action
Description · ISO clause/control addressed · effort (hours estimate) · owner (role) · success metric · target date.

## Rule
A success metric must be measurable ("MFA on 100% of systems"), not vague ("improve security"). An action with no owner or metric is incomplete.` }],
  },
  "SPA-001/4": {
    objective: "You will lay the actions onto a 12-month Gantt so the sequence and dependencies are visible.",
    whatToDo: ["Place each action in its month(s) on the Gantt.", "Show dependencies (what must finish before what starts)."],
    references: [{ id: "spa001-4", title: "Gantt layout rules", kind: "Template", summary: "How to lay it out.", body: `## Rules
- Quick wins in months 1–3, strategic items later.
- Show dependencies (e.g. "risk framework" before "vendor-risk programme").
- Don't overload month 1 — a roadmap that front-loads everything isn't realistic.` }],
  },
  "SPA-001/5": {
    objective: "You will estimate the overall compliance uplift the roadmap will deliver, to show the return on the investment.",
    whatToDo: ["Estimate the end-state compliance (e.g. CIS IG1 %) after the roadmap.", "Show the before → after figure."],
    references: [{ id: "spa001-5", title: "Estimating uplift", kind: "Standard rules", summary: "How to compute the figure.", body: `## Method
Start from the current measured baseline (CIS IG1 41%). Estimate the % each planned action adds (e.g. MFA everywhere +8%, backup testing +5%). Sum to an end state (e.g. 70%).

## Rule
Tie the uplift to the specific actions — "40% to 70%" must be the sum of named items, not a guess.` }],
  },
  "SPA-001/6": {
    objective: "You will draft a one-page Management Briefing that sells the roadmap: the priorities and why they're worth funding.",
    whatToDo: ["Summarise the horizons, the uplift, and the investment ask.", "Lead with the business benefit, not the controls."],
    references: [{ id: "spa001-6", title: "Management briefing rules", kind: "Template", summary: "How to pitch it.", body: `## One page
- The goal (e.g. SOC 2 readiness in 9 months).
- The three horizons at a glance.
- The uplift (41% → 70%) and the cost.
- The decision you need.

## Rule
Executives fund outcomes and risk reduction, not control lists — lead with those.` }],
  },
  "SPA-001/7": {
    objective: "You will review the roadmap with the Cybersecurity Program Manager mentor and refine it before presenting.",
    whatToDo: ["Share with a short cover note.", "Address feedback."],
    references: [{ id: "spa001-7", title: "Review checklist", kind: "Checklist", summary: "Before review.", body: `## Confirm
- Every action traces to a finding.
- Each has an owner, metric, date.
- The uplift is built from named actions.
- The sequence is realistic.` }],
  },
  "SPA-001/8": {
    objective: "You will present the roadmap to CloudTech's IT/management team for input and endorsement, and capture their decision.",
    whatToDo: ["Present the priorities and the ask.", "Anticipate the cost/resourcing questions and record the endorsement."],
    references: [{ id: "spa001-8", title: "What management will ask", kind: "Briefing notes", summary: "Anticipate these.", body: `## Likely questions
- "Why this order?" → quick wins reduce the most risk fastest and fund credibility.
- "Can the team absorb this?" → the Gantt is paced; strategic items are later.
- "What do you need from us?" → budget + owners.

## Capture
Record endorsement (full / with conditions) and date.` }],
  },

  // ───────────── TV-001 · Access Control Review — User Account Validation (CloudTech) ─────────────
  "TV-001/1": {
    objective: "You will obtain the current list of active system accounts from the system owner — one side of the reconciliation.",
    whatToDo: ["Request the account extract (accounts, roles, last-login dates) from a named owner.", "Specify the format and a deadline."],
    references: [{ id: "tv001-1", title: "System Account Extract", kind: "Source document", summary: "What you're requesting (and will receive).", body: `## You will receive
| Account | Role | Last login |
| a.shah | Platform Admin | 2 days ago |
| r.kapoor | Developer | 96 days ago |
| j.lee | Finance (read) | yesterday |
| svc-deploy | Service/CI | n/a |
| m.osei | Developer (also has Admin) | 5 days ago |
| t.brown | Support Agent | 210 days ago |

## Note
You need last-login dates to spot dormant accounts — ask for them explicitly.` }],
  },
  "TV-001/2": {
    objective: "You will obtain the current HR list of active staff — the other side of the reconciliation.",
    whatToDo: ["Request the active-staff list (names, start dates, department) from HR.", "Make sure it shows who has left."],
    references: [{ id: "tv001-2", title: "HR Active-Staff List", kind: "Source document", summary: "The authoritative list of who actually works here.", body: `## HR active staff
- a.shah — Platform Engineering (active)
- j.lee — Finance (active)
- m.osei — Engineering (active)
- r.kapoor — LEFT 3 months ago
- t.brown — LEFT 7 months ago

## Why this matters
HR is the source of truth for who should have access. Anyone with an account but not on this list is an orphaned account.` }],
  },
  "TV-001/3": {
    objective: "You will cross-reference the two lists to find orphaned, dormant, and role-mismatched accounts — the actual findings.",
    whatToDo: ["Compare accounts vs HR: flag leavers still active (orphaned).", "Flag no-login-90-days (dormant) and excess privilege (mismatch)."],
    references: [{ id: "tv001-3", title: "Finding definitions", kind: "Testing rules", summary: "How to label each account.", body: `## Findings
- Orphaned — account for someone no longer employed (r.kapoor, t.brown). Disable now.
- Dormant — no login in 90 days. Confirm need or disable.
- Mismatch/excess privilege — more rights than the job needs (m.osei has Admin + Developer). Remove excess.
- Service account — svc-deploy: identify, assign an owner, don't treat as a person.

## Standard
ISO A.5.18 / A.8.2 — access to need, reviewed regularly.` }],
  },
  "TV-001/4": {
    objective: "You will record every account in the Access Review Worksheet with its finding type and recommended action.",
    whatToDo: ["One row per account: finding + recommended action.", "Don't omit the 'clean' accounts — they're evidence the review was complete."],
    references: [{ id: "tv001-4", title: "Worksheet fields", kind: "Template", summary: "What each row needs.", body: `## Per account
Account · owner/employee · role · last login · finding (clean/orphaned/dormant/mismatch) · recommended action.

## Rule
Every account is reviewed, not just the bad ones — completeness is the point of an access review.` }],
  },
  "TV-001/5": {
    objective: "You will calculate the percentage of accounts that are clean vs orphaned/dormant/mismatched — the headline metric.",
    whatToDo: ["Count each finding type and compute percentages.", "Re-check the arithmetic."],
    references: [{ id: "tv001-5", title: "The metric", kind: "Standard rules", summary: "What to report.", body: `## Calculate
% clean, % orphaned, % dormant, % mismatched (of total accounts).

## Why
Management understands "33% of accounts had a problem" far better than a list. The number drives the remediation urgency.` }],
  },
  "TV-001/6": {
    objective: "You will write the Access Control Testing Report with findings and remediation recommendations.",
    whatToDo: ["Summarise findings, the metric, and the worst cases.", "Recommend specific remediation with owners."],
    references: [{ id: "tv001-6", title: "Report rules", kind: "Template", summary: "What to include.", body: `## Report
- Scope + method (reconciled accounts vs HR).
- The metric + finding breakdown.
- Specific cases (orphaned leavers, excess privilege).
- Remediation recommendations with owners and a deadline.` }],
  },
  "TV-001/7": {
    objective: "You will review the findings with the Information Security Auditor mentor before issuing the report.",
    whatToDo: ["Share with a short cover note.", "Address feedback."],
    references: [{ id: "tv001-7", title: "Review checklist", kind: "Checklist", summary: "Before issuing.", body: `## Confirm
- Every account reviewed.
- Orphaned accounts correctly identified vs HR.
- The metric arithmetic is right.
- Recommendations have owners + a deadline.` }],
  },
  "TV-001/8": {
    objective: "You will submit the report to the IT Manager with a recommended remediation deadline.",
    whatToDo: ["Deliver the report and the metric.", "Recommend a specific deadline for disabling orphaned accounts."],
    references: [{ id: "tv001-8", title: "Remediation timing", kind: "Briefing notes", summary: "What to recommend.", body: `## Recommend
- Orphaned accounts (leavers) → disable within 24–48 hours (active risk).
- Excess privilege → remove within a week.
- Set a quarterly access-review cadence so this doesn't recur.

## Note
Frame the leaver accounts as the urgent item — an ex-employee with live access is an immediate risk.` }],
  },

  // ───────────── CA-002 · Management Compliance Status Report (CloudTech) ─────────────
  "CA-002/1": {
    objective: "You will gather the outputs from all completed CloudTech tasks into one data pack, so the report is built from facts not impressions.",
    whatToDo: ["Collect the headline numbers from each prior deliverable.", "Note the source of each figure."],
    references: [{ id: "ca002-1", title: "CloudTech — Prior Task Outputs", kind: "Source document", summary: "The numbers your report draws on.", body: `## Available data
- CIS IG1: 41% → 58% after quick wins.
- Risk register: 14 open; 2 High (untested backups, delayed deprovisioning).
- Access review: 2 orphaned accounts disabled, 1 excess-privilege fixed.
- Awareness training: 82% complete.
- Decisions needed: fund deprovisioning automation (~£8k); approve quarterly access reviews.

## Rule
Every statement in the report must trace to a figure here.` }],
  },
  "CA-002/2": {
    objective: "You will identify the five most important messages for management — the things they actually need to know and decide.",
    whatToDo: ["Pick the top risks, gaps, improvements, and decisions.", "Cut anything that isn't decision-relevant."],
    references: [{ id: "ca002-2", title: "What management cares about", kind: "Standard rules", summary: "How to choose the five.", body: `## Prioritise
- Top risks (what could hurt us).
- Decisions you need from them (with the cost).
- Improvements made (credibility).

## Rule
Five messages, not fifty. If it doesn't change a decision, it doesn't go on the page.` }],
  },
  "CA-002/3": {
    objective: "You will draft the report on the one-page executive template.",
    whatToDo: ["Fill the template: RAG, top risks, achievements, decisions, outlook.", "Keep it to one page."],
    references: [{ id: "ca002-3", title: "Executive report template", kind: "Template", summary: "The structure.", body: `## One page
1. Overall RAG + one-line summary.
2. Top 3 risks + treatment.
3. Top 3 achievements.
4. Decisions needed (ask + cost).
5. 30-day outlook.` }],
  },
  "CA-002/4": {
    objective: "You will populate the report content: RAG status, top risks, achievements, open decisions, and outlook.",
    whatToDo: ["Fill each section with concrete figures.", "Name the open decisions and their cost."],
    references: [{ id: "ca002-4", title: "Content rules", kind: "Standard rules", summary: "What goes in each box.", body: `## Use numbers
- RAG: Amber (improving but key risks open).
- Top risks: untested backups, delayed deprovisioning.
- Achievements: IG1 41%→58%, orphaned accounts closed.
- Decision: fund deprovisioning automation (£8k).` }],
  },
  "CA-002/5": {
    objective: "You will apply plain-English principles so a non-technical executive can act on it in two minutes.",
    whatToDo: ["Remove jargon; expand acronyms on first use.", "Replace vague words with numbers."],
    references: [{ id: "ca002-5", title: "Plain-English rules", kind: "Standard rules", summary: "How to write for executives.", body: `## Rules
- Lead with the decision, not the detail.
- Percentages and counts, never "several/many".
- No acronym without expansion on first use.
- One page max.` }],
  },
  "CA-002/6": {
    objective: "You will review the draft with the Compliance Manager mentor for accuracy and messaging.",
    whatToDo: ["Share with a short cover note.", "Address feedback."],
    references: [{ id: "ca002-6", title: "Review checklist", kind: "Checklist", summary: "Before finalising.", body: `## Confirm
- Every figure is correct and sourced.
- The decisions are clear with costs.
- It fits on one page.
- No jargon.` }],
  },
  "CA-002/7": {
    objective: "You will incorporate the feedback and finalise the report.",
    whatToDo: ["Apply the changes.", "Final proof for numbers and tone."],
    references: [{ id: "ca002-7", title: "Finalising", kind: "Checklist", summary: "Last checks.", body: `## Final pass
- Numbers reconcile with the data pack.
- One page.
- Decisions and costs explicit.` }],
  },
  "CA-002/8": {
    objective: "You will deliver the report to management and offer to answer questions.",
    whatToDo: ["Send the report with a one-line summary.", "Offer a short walkthrough."],
    references: [{ id: "ca002-8", title: "Delivery", kind: "Briefing notes", summary: "How to hand it over.", body: `## Delivery
- A two-sentence email: the headline + the decision you need.
- Offer 15 minutes to walk through it.
- Make the ask unmissable.` }],
  },

  // ───────────── RR-001 · Tabletop Incident Simulation — Observer (CloudTech) ─────────────
  "RR-001/1": {
    objective: "You will study the incident procedure and the scenario brief before the exercise, so you know what 'good' looks like to observe against.",
    whatToDo: ["Read the IR procedure (DD-001) and the scenario.", "Note the required timings and escalation steps."],
    references: [{ id: "rr001-1", title: "Scenario + procedure", kind: "Source document", summary: "What you're observing against.", body: `## Scenario: ransomware on the build server
09:14 — CI/CD server encrypted, deploys blocked, ransom note also on a shared drive.

## Procedure requires
- Declare an incident within 15 min, assign an Incident Lead.
- Classify severity (Sev-1).
- Isolate before investigating.
- Notify management + DPO (if personal data) within 1 hour.
- Keep a timestamped decision log.` }],
  },
  "RR-001/2": {
    objective: "You will attend the full simulation and observe how the team responds in real time.",
    whatToDo: ["Watch the whole exercise without intervening.", "Track who does what and when."],
    references: [{ id: "rr001-2", title: "Observer role", kind: "Briefing notes", summary: "How to observe.", body: `## As observer
- Stay silent; you record, you don't help.
- Note times, decisions, and who made them.
- Watch for what the procedure says vs what actually happens.` }],
  },
  "RR-001/3": {
    objective: "You will take structured notes on the observation sheet — decisions, timings, escalation, gaps, deviations.",
    whatToDo: ["Capture each phase with timestamps and quotes.", "Record every deviation from the procedure."],
    references: [{ id: "rr001-3", title: "Observation sheet", kind: "Template", summary: "The fields to fill.", body: `## Capture per phase
- Decision + who + timestamp.
- Time-to-detect / declare / contain.
- Escalation path used vs documented.
- Communication and tool gaps.
- Deviations (and whether they helped or hurt).

## Rule
An observation without a timestamp or quote isn't usable.` }],
  },
  "RR-001/4": {
    objective: "You will raise one observation point during the debrief, based on your notes.",
    whatToDo: ["Pick the single most useful observation.", "State it factually, tied to a timestamp."],
    references: [{ id: "rr001-4", title: "Debrief contribution", kind: "Briefing notes", summary: "How to raise it.", body: `## Make it count
- One concrete, evidenced point (e.g. "containment started 22 min after detection vs the 15-min target").
- Factual, not blaming.
- Tied to the procedure step it relates to.` }],
  },
  "RR-001/5": {
    objective: "You will write up the Post-Exercise Lessons Learned Report within 48 hours, while it's fresh.",
    whatToDo: ["Summarise what happened vs the procedure.", "Draw out the lessons, with evidence."],
    references: [{ id: "rr001-5", title: "Lessons-learned report", kind: "Template", summary: "Structure.", body: `## Sections
- What happened (timeline).
- What went well.
- Gaps between procedure and reality (with timestamps).
- Lessons + recommended changes.

## Rule
Write within 48 hours — memory and notes fade fast.` }],
  },
  "RR-001/6": {
    objective: "You will identify the top three process improvements and map each to the incident procedure as a proposed amendment.",
    whatToDo: ["Pick the three highest-value fixes.", "Map each to a specific procedure clause to amend."],
    references: [{ id: "rr001-6", title: "From lesson to amendment", kind: "Standard rules", summary: "How to propose changes.", body: `## Each improvement
- Names the gap observed.
- Maps to the procedure clause it fixes.
- States the specific wording/step change.

## Example
"Containment was delayed because no one was sure who could isolate systems → amend the procedure to pre-authorise the Incident Lead to isolate."` }],
  },
  "RR-001/7": {
    objective: "You will review the report with the Incident Response & Crisis Manager mentor.",
    whatToDo: ["Share with a cover note.", "Address feedback."],
    references: [{ id: "rr001-7", title: "Review checklist", kind: "Checklist", summary: "Before filing.", body: `## Confirm
- Timeline is evidenced.
- Each lesson maps to a procedure change.
- Tone is no-blame and factual.` }],
  },
  "RR-001/8": {
    objective: "You will file the report and proposed amendments in the evidence repository.",
    whatToDo: ["File the final report and the procedure amendments.", "Note the review date for the procedure."],
    references: [{ id: "rr001-8", title: "Filing", kind: "Briefing notes", summary: "Where it goes.", body: `## File
- The lessons-learned report (dated).
- The proposed procedure amendments, linked to DD-001.

## Why
Post-incident review evidence (CIS 17.8 / ISO A.5.27) shows the organisation learns from incidents — a real audit ask.` }],
  },

  // ───────────── BCRP-002 · ICT Disaster Recovery Checklist (CloudTech) ─────────────
  "BCRP-002/1": {
    objective: "You will agree the one system the DR checklist will cover, with the IT Manager and mentor.",
    whatToDo: ["Pick the most business-critical system in scope.", "Confirm why it's the priority."],
    references: [{ id: "bcrp002-1", title: "System selection", kind: "Source document", summary: "The candidate and why.", body: `## Recommended: Customer accounts database
Postgres, AWS eu-west-1 — the most business-critical store; a customer audit is coming. Its recovery objectives (BCRP-001): RTO 4h, RPO 1h.

## Rule
Pick the system whose loss hurts most — recovery effort follows business impact.` }],
  },
  "BCRP-002/2": {
    objective: "You will review the system's existing backup configuration to ground the checklist in reality.",
    whatToDo: ["Capture the backup schedule, media, retention, and off-site copy.", "Note what's never been tested."],
    references: [{ id: "bcrp002-2", title: "Backup configuration", kind: "Source document", summary: "The real config your checklist must match.", body: `## Customer accounts DB
- Nightly snapshot 02:00 UTC, retained 14 days.
- Cross-region copy to eu-central-1 (off-site).
- Point-in-time recovery (5-min granularity) — this is what makes RPO 1h achievable.
- Restores have NEVER been tested (the key gap).` }],
  },
  "BCRP-002/3": {
    objective: "You will interview the system owner to capture the manual recovery steps and any runbooks.",
    whatToDo: ["Ask how a restore would actually be done, step by step.", "Capture who has the access and credentials needed."],
    references: [{ id: "bcrp002-3", title: "Recovery interview guide", kind: "Interview guide", summary: "What to ask.", body: `## Ask the owner
- Walk me through a restore from scratch.
- Who has the credentials/access to do it?
- What's documented, and what's only in your head?
- What would slow a restore down at 3am?

## Why
The undocumented steps are the ones that fail under pressure — surface them.` }],
  },
  "BCRP-002/4": {
    objective: "You will draft the DR checklist covering preparation through return-to-normal sign-off.",
    whatToDo: ["Write each phase as ordered, verifiable steps.", "Include who does each step."],
    references: [{ id: "bcrp002-4", title: "DR checklist sections", kind: "Template", summary: "The phases to cover.", body: `## Sections
1. Pre-incident prep (access, credentials, contacts, backup locations).
2. Detection & declaration.
3. Backup retrieval (which backup, which region, integrity check).
4. Restoration sequence (ordered, dependencies).
5. Validation testing.
6. Return-to-normal & sign-off.

## Rule
Each step needs an owner and a verification.` }],
  },
  "BCRP-002/5": {
    objective: "You will embed the RTO and RPO from the BIA as explicit success criteria in the checklist.",
    whatToDo: ["State the RTO (4h) and RPO (1h) as pass/fail criteria.", "Show how point-in-time recovery meets the 1h RPO."],
    references: [{ id: "bcrp002-5", title: "RTO/RPO as criteria", kind: "Standard rules", summary: "How to use them.", body: `## Success criteria
- Restore complete within RTO (4 hours).
- Data loss ≤ RPO (1 hour) — use point-in-time recovery to the last 5-minute point.

## Rule
A DR checklist without measurable success criteria can't tell you if recovery actually worked.` }],
  },
  "BCRP-002/6": {
    objective: "You will validate the checklist with a talk-through (not a real restore) and find what wouldn't work.",
    whatToDo: ["Walk each step aloud with the owner.", "Note any step that can't be done as written."],
    references: [{ id: "bcrp002-6", title: "Talk-through validation", kind: "Testing rules", summary: "How to test on paper.", body: `## Talk-through
Read each step and ask "could we actually do this, now, with the access we have?" Common failures: no one has the restore credentials, the off-site copy location is unknown, no way to verify the restore is good.

## Rule
Validation finds the gaps before a real disaster does.` }],
  },
  "BCRP-002/7": {
    objective: "You will incorporate the corrections found during the talk-through.",
    whatToDo: ["Fix each step that failed validation.", "Re-check the sequence still holds."],
    references: [{ id: "bcrp002-7", title: "Applying corrections", kind: "Checklist", summary: "What to fix.", body: `## Typical fixes
- Add a pre-step to confirm who holds credentials.
- Add an integrity check on the retrieved backup.
- Add an explicit validation test (query a known record).` }],
  },
  "BCRP-002/8": {
    objective: "You will file the finalised checklist and advise the IT Manager to schedule a live restoration test.",
    whatToDo: ["File the checklist in the DR library.", "Recommend a date for the first real restore test."],
    references: [{ id: "bcrp002-8", title: "Filing + next step", kind: "Briefing notes", summary: "Close the gap.", body: `## Advise
The biggest remaining risk is that restores have never been tested. Recommend a live restore test (in a safe environment) within 30 days — a checklist that's never executed is unproven.

## File
Store the checklist in the DR documentation library with a review date.` }],
  },

  // ───────────── TPRM-001 · Supplier Inventory & Basic Risk Rating (CloudTech) ─────────────
  "TPRM-001/1": {
    objective: "You will gather a complete list of CloudTech's vendors from every source, so no third party is missed.",
    whatToDo: ["Pull vendor names from contracts, accounts payable, IT procurement, and dept heads.", "Cross-check sources — shadow vendors hide between them."],
    references: [{ id: "tprm001-1", title: "Where vendors hide", kind: "Source document", summary: "The sources to pull from.", body: `## Sources
- Contract management system (the official ones).
- Accounts payable (anyone you pay — catches the freelancers).
- IT procurement / SaaS subscriptions (Mailchimp, Slack, etc.).
- Department heads (the offshore QA contractor only shows up here).

## Watch for
The offshore QA contractor with a copy of production data appears only in interviews — that's the one that matters most.` }],
  },
  "TPRM-001/2": {
    objective: "You will record each vendor's key facts: what they do, what data they access, what they connect to, contract status, and contact.",
    whatToDo: ["One row per vendor with all fields.", "Be precise about data access (none/view/process/store)."],
    references: [{ id: "tprm001-2", title: "Vendor register fields", kind: "Template", summary: "What to capture per vendor.", body: `## Per vendor
Name · service · data access (none/view/process/store) · systems connected · contract status · DPA in place? · primary contact.

## Why data access matters
"Stores customer personal data" drives the risk score far more than "views the website" — capture it accurately.` }],
  },
  "TPRM-001/3": {
    objective: "You will apply the five-criterion risk rating to each vendor, consistently.",
    whatToDo: ["Score each vendor 1–3 on the five criteria.", "Don't rate from gut feel — use the criteria."],
    references: [{ id: "tprm001-3", title: "The five criteria", kind: "Rating rules", summary: "How to score.", body: `## Score each 1 (low) – 3 (high)
1. Data access level. 2. System access level. 3. Service criticality. 4. Geographic location (outside UK/EU raises it). 5. Certification (ISO/SOC 2 lowers; none raises).

## Apply
Stripe (certified, DPA) scores low; the offshore QA contractor (stores prod data, no cert, no DPA) scores high.` }],
  },
  "TPRM-001/4": {
    objective: "You will calculate a composite Low/Medium/High score for each vendor.",
    whatToDo: ["Average the five criteria to a composite.", "Map to Low/Medium/High bands."],
    references: [{ id: "tprm001-4", title: "Composite scoring", kind: "Rating rules", summary: "How to band.", body: `## Composite
Average the five → Low (<1.7) / Medium (1.7–2.3) / High (>2.3).

## Override
Any vendor storing personal data with no DPA is escalated regardless of score (GDPR Art. 28).` }],
  },
  "TPRM-001/5": {
    objective: "You will flag every High-rated vendor for escalation to the mentor.",
    whatToDo: ["List the High vendors with the reason.", "Recommend the next step for each."],
    references: [{ id: "tprm001-5", title: "Escalation", kind: "Standard rules", summary: "What to escalate.", body: `## Escalate
- The offshore QA contractor (prod data, no DPA, no cert) — highest risk.
- Any High vendor with privileged system access.

## Each flag needs
The reason + a proposed action (e.g. "stop sharing prod data; require a DPA + ISO cert").` }],
  },
  "TPRM-001/6": {
    objective: "You will identify vendors with no data-processing agreement in place — a GDPR gap.",
    whatToDo: ["Check each vendor that processes personal data for a DPA.", "Flag every missing DPA."],
    references: [{ id: "tprm001-6", title: "DPA requirement", kind: "Standard extract", summary: "Why missing DPAs matter.", body: `## GDPR Article 28
Where a processor handles personal data on your behalf, a written contract (DPA) is mandatory.

## CloudTech gaps
- Mailchimp — processes prospect personal data, no DPA.
- The offshore QA contractor — has prod personal data, no DPA.
Both are legal gaps, not just risks.` }],
  },
  "TPRM-001/7": {
    objective: "You will produce the Supplier Register and a summary highlighting high-risk vendors and missing DPAs.",
    whatToDo: ["Finalise the register.", "Write a short summary of the High vendors and DPA gaps."],
    references: [{ id: "tprm001-7", title: "Register + summary", kind: "Template", summary: "What to produce.", body: `## Deliverable
- The full supplier register (all vendors, scored).
- A one-page summary: the High vendors, the missing DPAs, and recommended actions.

## Rule
Lead the summary with the offshore contractor + the DPA gaps — those are the actionable risks.` }],
  },
  "TPRM-001/8": {
    objective: "You will review the register with the Vendor/Third-Party Risk Analyst mentor.",
    whatToDo: ["Share with a cover note.", "Address feedback."],
    references: [{ id: "tprm001-8", title: "Review checklist", kind: "Checklist", summary: "Before sign-off.", body: `## Confirm
- No vendor missed (all sources cross-checked).
- Scores applied consistently from the criteria.
- DPA gaps flagged.
- High vendors have actions.` }],
  },

  // ───────────── PE-001 · GRC Project Charter — Kick-Off (CloudTech) ─────────────
  "PE-001/1": {
    objective: "You will meet the Programme Manager to agree the scope of the compliance initiative before writing anything.",
    whatToDo: ["Confirm the goal, deadline, budget, and what's in/out of scope.", "Write down what was agreed."],
    references: [{ id: "pe001-1", title: "Initiative brief", kind: "Source document", summary: "The scope facts from the sponsor.", body: `## From the CTO (sponsor)
- Goal: SOC 2 readiness in 9 months to win an enterprise customer.
- Budget: £60k; one part-time security hire.
- In scope: the customer platform + cloud infra.
- OUT of scope: marketing website; the billing system (Finance owns it).
- Hard deadline: customer audit in 9 months.` }],
  },
  "PE-001/2": {
    objective: "You will define the project objectives, success criteria, and explicit out-of-scope items.",
    whatToDo: ["Write measurable objectives and success criteria.", "List out-of-scope items explicitly."],
    references: [{ id: "pe001-2", title: "Objectives & scope rules", kind: "Standard rules", summary: "How to write them.", body: `## Rules
- Objectives measurable ("achieve SOC 2 Type I by month 6").
- Success criteria tied to the audit outcome.
- Out-of-scope written down (marketing site, billing) — most project conflict comes from assumed inclusions.` }],
  },
  "PE-001/3": {
    objective: "You will identify the project team: sponsor, lead, workstream owners, and stakeholders.",
    whatToDo: ["Name each role and who fills it.", "Confirm each person knows they're on the team."],
    references: [{ id: "pe001-3", title: "Team roles", kind: "Template", summary: "Who you need.", body: `## Roles
- Sponsor (the CTO — funds and unblocks).
- Project lead (you / the GRC lead).
- Workstream owners (access, change, backup, vendor).
- Stakeholders (the customer, Finance for budget).` }],
  },
  "PE-001/4": {
    objective: "You will draft the Project Charter to the template.",
    whatToDo: ["Fill every section of the charter.", "Make scope and governance explicit."],
    references: [{ id: "pe001-4", title: "Charter sections", kind: "Template", summary: "What it must contain.", body: `## Sections
Background · objectives & success criteria · scope (in) and out-of-scope · deliverables & milestones · timeline · resources & budget · risks/assumptions/dependencies · governance.

## Rule
Out-of-scope must be explicit.` }],
  },
  "PE-001/5": {
    objective: "You will build a high-level milestone timeline (not task-level).",
    whatToDo: ["Place the major milestones across the 9 months.", "Keep it milestones-only at this stage."],
    references: [{ id: "pe001-5", title: "Milestone timeline", kind: "Template", summary: "Level of detail.", body: `## Milestones only
e.g. M2 gap analysis done · M4 quick wins implemented · M6 SOC 2 Type I · M9 customer audit.

## Rule
A charter timeline shows milestones, not every task — detail comes later.` }],
  },
  "PE-001/6": {
    objective: "You will identify the top three project risks and initial mitigations.",
    whatToDo: ["Name the three biggest risks to delivery.", "State an initial mitigation for each."],
    references: [{ id: "pe001-6", title: "Project risks", kind: "Standard rules", summary: "The likely risks here.", body: `## Likely risks
- Small, stretched team (mitigation: the part-time hire + ruthless scope).
- The 9-month deadline (mitigation: front-load quick wins).
- Dependence on engineering availability (mitigation: sponsor commitment).

## Rule
A project risk needs an owner and a mitigation, not just a worry.` }],
  },
  "PE-001/7": {
    objective: "You will circulate the Charter for review and obtain the sponsor's sign-off.",
    whatToDo: ["Send to the sponsor and stakeholders.", "Capture the sign-off decision and date."],
    references: [{ id: "pe001-7", title: "Sign-off", kind: "Standard rules", summary: "What sign-off means.", body: `## Sign-off
The sponsor formally approves scope, budget, and timeline. Record the decision and date. Without sign-off the project has no mandate — work that starts before it is at risk.` }],
  },
  "PE-001/8": {
    objective: "You will run the kick-off meeting and distribute the signed Charter to the team.",
    whatToDo: ["Run the kick-off to the agenda.", "Distribute the signed charter and confirm everyone's role."],
    references: [{ id: "pe001-8", title: "Kick-off agenda", kind: "Template", summary: "What to cover.", body: `## Kick-off
- Why we're doing this (the customer + deadline).
- Scope and out-of-scope.
- Roles and who owns what.
- The milestones and the first actions.
- How we'll govern (cadence, decisions).` }],
  },

  // ───────────── QA-002 · Control Testing Methodology Development (CloudTech) ─────────────
  "QA-002/1": {
    objective: "You will select three controls to build test methodologies for, with the auditor mentor.",
    whatToDo: ["Pick three controls of different types from the ISO matrix.", "Confirm what 'working' means for each."],
    references: [{ id: "qa002-1", title: "Three controls", kind: "Source document", summary: "The controls and what 'working' looks like.", body: `## Selected
1. A.8.2 Privileged access — only approved admins, reviewed quarterly.
2. A.8.13 Backup — backups run + periodically restore-tested.
3. A.8.32 Change management — production changes reviewed and approved.

## Rule
Choose different control types so you practise different test approaches.` }],
  },
  "QA-002/2": {
    objective: "You will define, for each control, its objective, the test approach, the steps, the evidence, and pass/fail criteria.",
    whatToDo: ["For each control, design the test fully.", "State explicit pass/fail criteria."],
    references: [{ id: "qa002-2", title: "Test approaches", kind: "Testing rules", summary: "The four ways to test.", body: `## Approaches (weakest → strongest)
Inquiry → Observation → Inspection → Re-performance.

## Pick the strongest feasible
- A.8.2 → Inspection of the admin list + review records.
- A.8.13 → Re-performance (attempt a restore yourself).
- A.8.32 → Inspection of change records vs deploys.

## Rule
Define pass/fail before testing.` }],
  },
  "QA-002/3": {
    objective: "You will research how professional audit firms test comparable controls, to lift your methodology to a professional standard.",
    whatToDo: ["Read the provided audit-standard extracts.", "Note the sampling and evidence expectations."],
    references: [{ id: "qa002-3", title: "Professional testing norms", kind: "Standard extract", summary: "How real auditors test these.", body: `## Norms
- Auditors sample (e.g. a sample of deploys, not all) and state how the sample was chosen.
- They require independent evidence (logs, records), not management assertions.
- They re-perform where feasible (e.g. independently confirm a restore).

## Apply
Bring these norms into your methodology so it would survive a real audit.` }],
  },
  "QA-002/4": {
    objective: "You will complete a Control Testing Methodology Sheet for each of the three controls.",
    whatToDo: ["Fill the sheet per control.", "Make it repeatable by someone else."],
    references: [{ id: "qa002-4", title: "Methodology sheet", kind: "Template", summary: "Fields per control.", body: `## Per control
Control objective · test approach · test steps · evidence required · sample size + selection · pass/fail criteria.

## Rule
Another person should be able to run your test and get the same result — that's the point of a methodology.` }],
  },
  "QA-002/5": {
    objective: "You will write a one-page methodology overview covering sampling, frequency, and documentation standards.",
    whatToDo: ["Explain the overall approach (sampling, frequency).", "State how test evidence is documented."],
    references: [{ id: "qa002-5", title: "Overview content", kind: "Template", summary: "What the overview covers.", body: `## Overview
- Sampling approach and rationale.
- Testing frequency (e.g. quarterly for access, annually for DR).
- How results and evidence are recorded.

## Rule
Consistency is the goal — the overview makes every control test follow the same standard.` }],
  },
  "QA-002/6": {
    objective: "You will review the methodology sheets with the auditor mentor for professional adequacy.",
    whatToDo: ["Share with a cover note.", "Address feedback on rigour."],
    references: [{ id: "qa002-6", title: "Review checklist", kind: "Checklist", summary: "Before finalising.", body: `## Confirm
- Each test has explicit pass/fail criteria.
- The strongest feasible approach is used.
- Sampling is defined.
- Evidence is independent, not assertion-based.` }],
  },
  "QA-002/7": {
    objective: "You will incorporate the feedback and add the methodology to the GRC Quality Assurance library.",
    whatToDo: ["Apply the changes.", "File it so future audits can reuse it."],
    references: [{ id: "qa002-7", title: "Filing", kind: "Briefing notes", summary: "Where it goes.", body: `## File
Add the methodology sheets + overview to the QA library, with a version and review date so they're reused, not reinvented each audit.` }],
  },
  "QA-002/8": {
    objective: "You will brief the Compliance Manager on the methodology so it can be reused in future audits.",
    whatToDo: ["Explain the methodology in plain terms.", "Show how it makes future testing consistent and faster."],
    references: [{ id: "qa002-8", title: "Briefing", kind: "Briefing notes", summary: "How to present it.", body: `## Brief
- What the methodology is and why it matters (repeatable, audit-grade testing).
- How to use it for the three controls now and others later.
- Keep it short and practical.` }],
  },
};
