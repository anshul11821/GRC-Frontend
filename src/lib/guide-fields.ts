import type { IconName } from "@/components/ui/icon";

/**
 * The Guide's walk through the deliverable itself, field by field, per verb.
 *
 * The rest of the walkthrough points at furniture — the brief, the references, the checklist — and
 * a caption is enough, because those are things to read. The deliverable is the one place the
 * mentee has to *produce* something, and "do your work here, then Submit" is no help at all to
 * somebody looking at an empty workspace for the first time. So each verb's workspace gets its
 * inputs walked in the order they are filled, each one saying what that input is for and what a
 * good one does.
 *
 * **Never the answer.** These say what the input is *for*, what makes one good, and what the common
 * mistake is. They must not name the role, write the subject, say which items belong, or which
 * outcome is right: the step is graded on the mentee's judgment and a guide that hands it over
 * grades nothing. Anything task-specific belongs in the brief and the reference material, which
 * the mentee has to read.
 *
 * `key` is matched against `data-guide="<key>"` in the workspace, so an input the current stage does
 * not render drops out of the walkthrough — Request's compose fields once the request is sent, a
 * conditional form field whose condition is unmet, a tiebreaker with no tie. Every step built from
 * this table is `optional` for that reason, and `guide-fields.test.ts` fails if a key here has no
 * anchor in any workspace.
 *
 * Several verbs share a workspace — Conduct and Present are one component, Apply and Map another,
 * nine form verbs a third — so the same anchors appear under different verbs with different words.
 * That is the point: the shape is shared, the professional judgment is not.
 */
export type FieldGuide = {
  /** Matches `data-guide` on the input's wrapper in the workspace. */
  key: string;
  title: string;
  body: string;
  icon?: IconName;
};

/** Shared by the nine verbs that render through `FormFlow`. */
const formItem = (what: string): FieldGuide => ({
  key: "item",
  title: `One entry per ${what}`,
  body:
    `Every ${what} below needs completing — they are not examples to pick from. Work down them in ` +
    `order; the card turns red if you try to finish with one unfilled, and the count at the bottom ` +
    `tells you how many are still outstanding.`,
  icon: "list",
});

const formCheck: FieldGuide = {
  key: "check",
  title: "Check completeness",
  body:
    "Press this before you submit. It marks every entry that is still missing a required field, " +
    "which is cheaper than spending an attempt to be told the same thing.",
  icon: "checkSquare",
};

/** Shared by the two table verbs whose rows are graded against an answer key. */
const tableCheck = (what: string): FieldGuide => ({
  key: "check",
  title: `Check your ${what}`,
  body:
    `This compares your entries with the reference and marks the ones that do not agree. It costs ` +
    `you nothing and spends no attempt, so use it until it comes back clean — then submit.`,
  icon: "checkSquare",
});

export const FIELD_GUIDE: Record<string, FieldGuide[]> = {
  // ── set-a · scripted flows ───────────────────────────────────────────────────────────────
  request: [
    {
      key: "to",
      title: "Address it to a role",
      body:
        "Name the role that owns the information you need — not a person's name, and not a " +
        "department. A request addressed to a department has nobody accountable for answering it, " +
        "which is the commonest reason a real one goes unanswered. The brief tells you who holds this.",
      icon: "user",
    },
    {
      key: "subject",
      title: "Write a scoped subject",
      body:
        "One line that tells them what this is about before they open it. Specific and narrow beats " +
        "broad: “Information request” could be anything, and gets treated as if it were. " +
        "You have 80 characters and the counter on the right shows what is left.",
      icon: "mail",
    },
    {
      key: "purpose",
      title: "Say why you need it",
      body:
        "Why you are asking and what you will do with the answer. A stakeholder who can see the " +
        "purpose answers the question you meant to ask; one who cannot will guess, and you will get " +
        "back something you cannot use. Two or three sentences is plenty.",
      icon: "target",
    },
    {
      key: "items",
      title: "Choose what to ask for",
      body:
        "Tick the items this request actually needs — at least three. Not every option belongs: some " +
        "are out of scope for this step, and asking for those is a real mistake, not a trick. Read " +
        "each one against the objective before you tick it, and leave out anything you cannot justify.",
      icon: "checkSquare",
    },
    {
      key: "send",
      title: "Then send it",
      body:
        "Sending opens the conversation, and how well-scoped your request was decides how the " +
        "stakeholder receives it. From there you steer the exchange until you have what you came " +
        "for. So get the request right first — don't send it to see what happens.",
      icon: "send",
    },
    {
      key: "reply",
      title: "Steer the exchange",
      body:
        "Each round offers you three replies and only one moves the conversation towards what you " +
        "need. Read what they actually said — a stakeholder who deflects is not being difficult, " +
        "they are telling you the ask was unclear. A wrong reply is coached, not fatal.",
      icon: "chat",
    },
  ],
  conduct: [
    {
      key: "opening",
      title: "Choose how to open",
      body:
        "Your opening sets how forthcoming this person will be for the rest of the walkthrough. " +
        "Think about what they are accountable for and what they risk by talking to you. An opening " +
        "that reads as an audit gets audit answers.",
      icon: "handshake",
    },
    {
      key: "probe",
      title: "Probe, don't accept",
      body:
        "Three probes each round; one takes you to the fact you need. Follow what they just said " +
        "rather than your own running order — the weak probes are the ones that accept a vague " +
        "answer, or ask something they have already told you.",
      icon: "search",
    },
  ],
  present: [
    {
      key: "prep",
      title: "Read your own deck first",
      body:
        "The deck and the anticipated questions are prepared for you. Read both before you open: " +
        "the questions are the ones a senior will actually ask, and the whole point of preparing " +
        "them is that you are not hearing them for the first time in the room.",
      icon: "clipboard",
    },
    {
      key: "opening",
      title: "Frame it for a senior",
      body:
        "Your framing sets how the senior receives everything after it. They have limited time, they " +
        "care about decision and risk, and they did not read the detail. An opening that starts with " +
        "your process rather than their decision spends the goodwill you needed.",
      icon: "target",
    },
    {
      key: "probe",
      title: "Answer what was asked",
      body:
        "Each question offers three answers. Pick the one that answers it — the traps are the ones " +
        "that dodge, over-claim, or bury the answer in detail. Saying you do not yet know, with what " +
        "you will do about it, is a legitimate answer to a senior.",
      icon: "chat",
    },
  ],
  record: [
    {
      key: "register",
      title: "Transcribe into the register",
      body:
        "One row per distinct item from the source document — open it from the card above this " +
        "deliverable rather than working from memory. Mandatory columns are starred. IDs must match " +
        "the register's format and may not repeat, and an owner must be a role, never a department.",
      icon: "table",
    },
    {
      key: "check",
      title: "Check the register",
      body:
        "This validates your rows against the register's own rules and tells you which fail. " +
        "It spends no attempt, so use it before submitting rather than after.",
      icon: "checkSquare",
    },
  ],
  apply: [
    {
      key: "table",
      title: "Apply the scheme to every row",
      body:
        "Pick each item's outcome from the dropdown — every row, not just the obvious ones. The " +
        "scheme's definitions decide this, so read them in the reference material; an outcome that " +
        "feels right but does not match a definition is wrong. Where a note is asked for, say what " +
        "in the item drove the outcome.",
      icon: "treeDown",
    },
    tableCheck("outcomes"),
  ],
  map: [
    {
      key: "table",
      title: "Map every row across",
      body:
        "Link each item on the left to the one it corresponds to on the right. Map on what the " +
        "requirement actually demands, not on similar wording — two clauses can share vocabulary " +
        "and ask for different things. Leave nothing unmapped.",
      icon: "grid",
    },
    tableCheck("mappings"),
  ],
  crossref: [
    {
      key: "method",
      title: "State your method first",
      body:
        "How did you compare the two sources — clause by clause, field by field, by sample? A " +
        "reconciliation nobody can repeat is not evidence. Write it before you start, because the " +
        "method is what makes the differences you find defensible.",
      icon: "layers",
    },
    {
      key: "table",
      title: "Status every row, act on the gaps",
      body:
        "Set a status on every row, then give each row that is not clean a corrective action — " +
        "specific enough that somebody else could carry it out. A discrepancy with no action is a " +
        "note, not a finding. “Check reconciliation” marks the rows that disagree with the reference.",
      icon: "table",
    },
  ],
  identify: [
    {
      key: "criterion",
      title: "State the criterion before you flag",
      body:
        "Write the rule you are about to mark by. Stating it first is what makes the exercise " +
        "repeatable and stops the criterion quietly widening to fit whatever you noticed — which is " +
        "the failure this step exists to teach.",
      icon: "flag",
    },
    {
      key: "table",
      title: "Mark every row against it",
      body:
        "Go down the whole dataset and mark each row in or out — a row you skipped is not the same " +
        "as a row you cleared. Each flagged row needs a one-line action and a named accountable " +
        "role. “Check flags” tells you where your marking disagrees with the criterion.",
      icon: "eye",
    },
  ],
  review: [
    {
      key: "feedback",
      title: "Account for prior feedback",
      body:
        "Tick each earlier point only once you have actually dealt with it in the artefact. This is " +
        "the part a reviewer checks first: resubmitting with old feedback unaddressed is the fastest " +
        "way to have work returned a second time.",
      icon: "history",
    },
    {
      key: "cover",
      title: "Write the cover note",
      body:
        "Say what changed since last time and what you want the reviewer to look at. A reviewer " +
        "reading a cover note that says “please review” has to rediscover your changes for " +
        "themselves — which is time they then do not spend on the substance.",
      icon: "edit",
    },
    {
      key: "send",
      title: "Submit to the mentor",
      body:
        "This hands the artefact over for review. It unlocks once the cover note is written and every " +
        "prior point is accounted for.",
      icon: "send",
    },
  ],
  // ── set-b ────────────────────────────────────────────────────────────────────────────────
  calculate: [
    {
      key: "cite",
      title: "Cite the formula",
      body:
        "Name the formula you are using, exactly as the reference gives it. A number with no stated " +
        "formula cannot be checked or reproduced, and in a real assessment that makes it unusable — " +
        "the citation is part of the deliverable, not admin.",
      icon: "book",
    },
    {
      key: "table",
      title: "Compute every row",
      body:
        "Work the formula for each row and enter your result. The engine re-runs it and requires an " +
        "exact match, so mind the rounding and the units. “Check results” shows which rows " +
        "do not agree, and costs you no attempt.",
      icon: "chart",
    },
  ],
  prioritise: [
    {
      key: "table",
      title: "Score against every criterion",
      body:
        "Give each item a score on each criterion — the aggregate and the rank compute themselves " +
        "from those. Score the criterion in front of you rather than the answer you expect: the " +
        "ranking is only defensible if the scores that produced it are.",
      icon: "sliders",
    },
    {
      key: "tiebreak",
      title: "Break the ties on the record",
      body:
        "Two items with the same aggregate need a documented reason for which goes first. “It " +
        "felt more urgent” is not one — name the factor that decided it, because this is exactly " +
        "the line somebody will question later.",
      icon: "sortDesc",
    },
    {
      key: "check",
      title: "Check the ranking",
      body: "This flags unresolved ties and any item you have not finished scoring, before you submit.",
      icon: "checkSquare",
    },
  ],
  draft: [
    formItem("section"),
    {
      key: "f:content",
      title: "Write the section",
      body:
        "Plain language, and specific to this organisation — a paragraph that would fit any company " +
        "is the single commonest weakness in a drafted policy. Say who does what, and when.",
      icon: "edit",
    },
    {
      key: "f:citation",
      title: "Cite where it applies",
      body:
        "Where the section implements a control, name it. Optional, but a drafted policy that traces " +
        "to the standard it satisfies is the one an auditor can actually use.",
      icon: "book",
    },
    formCheck,
  ],
  recommend: [
    formItem("gap"),
    {
      key: "f:action",
      title: "Make the action specific",
      body:
        "What exactly should be done — concrete enough that the owner could start on Monday. " +
        "“Improve access control” is a heading, not a remediation; name the change.",
      icon: "rocket",
    },
    {
      key: "f:control",
      title: "Tie it to a control",
      body:
        "Which control does this close? A recommendation with no control reference cannot be tracked " +
        "to closure, and it is the first thing a reviewer looks for.",
      icon: "shield",
    },
    {
      key: "f:owner",
      title: "Give it a named owner role",
      body:
        "Pick the role accountable for delivering it. An action owned by everybody is owned by nobody " +
        "— and the owner must be able to actually authorise the change you are proposing.",
      icon: "user",
    },
    {
      key: "f:date",
      title: "Set a target date",
      body:
        "A date the owner could realistically hit, proportionate to the risk. A remediation plan " +
        "where everything is due at once is a plan nobody sequenced.",
      icon: "calendar",
    },
    {
      key: "f:rationale",
      title: "Say why it matters",
      body:
        "The risk this closes, in terms the owner's management would recognise. This is the part " +
        "that gets the work funded — and the part that justifies the priority you gave it.",
      icon: "target",
    },
    formCheck,
  ],
  validate: [
    formItem("finding"),
    {
      key: "f:citation",
      title: "Cite what you checked it against",
      body:
        "Name the control or source, and how you confirmed it — document, system, or someone's " +
        "word. Validation is the evidence, not the verdict: a verdict with no source behind it is " +
        "just an opinion recorded formally.",
      icon: "book",
    },
    {
      key: "f:status",
      title: "Give the verdict",
      body:
        "Verified or unverified, on what you actually saw. Marking something verified because it is " +
        "probably fine is how a finding survives into a report and fails an audit later.",
      icon: "checkCircle",
    },
    {
      key: "f:followup",
      title: "Follow up what you could not verify",
      body:
        "Unverified is a legitimate outcome, but it needs a next step: what would confirm it, and " +
        "who can produce that. This field only appears where you marked something unverified.",
      icon: "cornerUpRight",
    },
    formCheck,
  ],
  schedule: [
    formItem("session"),
    {
      key: "f:purpose",
      title: "State the purpose",
      body:
        "Why this session needs to happen, in one line. An invitation with no purpose is the one " +
        "that gets declined or turns into a meeting with no outcome.",
      icon: "target",
    },
    {
      key: "f:agenda",
      title: "Write the agenda",
      body:
        "What you will cover, in the order you will cover it. An agenda is also a contract on the " +
        "person's time — it tells them what they need to bring, and what they do not.",
      icon: "list",
    },
    {
      key: "f:time",
      title: "Pick from the times they offered",
      body:
        "Choose one of the slots the stakeholder has actually made available. Proposing a time " +
        "outside them is how a scheduled session quietly becomes an unscheduled one.",
      icon: "clock",
    },
    formCheck,
  ],
  assess: [
    formItem("area"),
    {
      key: "f:level",
      title: "Assign a level from the scale",
      body:
        "Read the scale's own definition of each level and pick the one the evidence supports — not " +
        "the one that feels fair. An assessment that clusters everything in the middle tells the " +
        "organisation nothing it can act on.",
      icon: "gauge",
    },
    {
      key: "f:evidence",
      title: "Cite the evidence for it",
      body:
        "The specific thing that puts this area at that level — a document, a system state, an " +
        "interview. This is what makes the rating reviewable; a level with no evidence is a guess " +
        "with a number on it.",
      icon: "file",
    },
    {
      key: "f:outlier",
      title: "Justify the outlier",
      body:
        "This area sits well away from the rest of your ratings, so it needs explaining. Outliers " +
        "are often right and always questioned — say what makes this one different. Appears only " +
        "where your rating is far from the cluster.",
      icon: "alertTriangle",
    },
    formCheck,
  ],
  score: [
    formItem("item"),
    {
      key: "f:score",
      title: "Score against the anchor",
      body:
        "Use the rubric's description of each score rather than your impression of the item. The " +
        "weighted aggregate at the bottom is computed from these, so one lazily-placed score moves " +
        "the whole result.",
      icon: "sliders",
    },
    {
      key: "f:justification",
      title: "Justify the score",
      body:
        "Why this score and not the one above or below it. Naming the anchor you matched is the " +
        "difference between a score somebody can challenge on the facts and one they can only " +
        "disagree with.",
      icon: "edit",
    },
    formCheck,
  ],
  compile: [
    formItem("section"),
    {
      key: "f:source",
      title: "Name the source artefact",
      body:
        "Which earlier step this section comes from. A compiled deliverable is only as traceable as " +
        "its sources — and the reviewer will check that the figures match them.",
      icon: "link",
    },
    {
      key: "f:content",
      title: "Summarise without changing it",
      body:
        "Condense the section for a reader who will not open the detail, keeping every figure " +
        "consistent with the source. A summary that contradicts its own annex is the error this " +
        "verb exists to catch.",
      icon: "cube",
    },
    formCheck,
  ],
  signoff: [
    formItem("item"),
    {
      key: "f:decision",
      title: "Take the decision",
      body:
        "Approve, approve with conditions, or reject. Sign-off is an accountable act: approving " +
        "something you have reservations about, rather than attaching conditions to it, is how the " +
        "reservation disappears from the record.",
      icon: "handshake",
    },
    {
      key: "f:date",
      title: "Date the decision",
      body:
        "When it was decided. A sign-off with no date cannot be tied to the version of the artefact " +
        "it applied to, which is the whole point of recording it.",
      icon: "calendar",
    },
    {
      key: "f:conditions",
      title: "Write the conditions",
      body:
        "What must be done for this approval to stand — specific, and checkable by someone else. " +
        "Appears only where you approved with conditions.",
      icon: "clipboard",
    },
    {
      key: "f:revision",
      title: "Say what to fix",
      body:
        "What has to change before it comes back, so the work is not repeated blind. Appears only " +
        "where you rejected it.",
      icon: "refresh",
    },
    formCheck,
  ],
  document: [
    formItem("section"),
    {
      key: "f:content",
      title: "Write it for the record",
      body:
        "Professional register: no first person, no contractions, nothing that reads as a chat " +
        "message. This is a record somebody will read a year from now without you there to explain it.",
      icon: "file",
    },
    {
      key: "f:crossref",
      title: "Cross-reference the artefact",
      body:
        "Point to the prior-step artefact this section rests on. A record that cannot be traced back " +
        "is a claim; one that can is evidence.",
      icon: "link",
    },
    formCheck,
  ],
  // ── set-c ────────────────────────────────────────────────────────────────────────────────
  brief: [
    {
      key: "audience",
      title: "Name the audience",
      body:
        "Who is this for? Everything after this depends on it — a board, a team lead and a supplier " +
        "need the same facts at three different altitudes. “Stakeholders” is not an audience.",
      icon: "users",
    },
    {
      key: "ask",
      title: "State the one ask",
      body:
        "The single thing you want this audience to do — decide, approve, fund, act. A brief with " +
        "no explicit ask gets read, agreed with, and forgotten.",
      icon: "target",
    },
    {
      key: "messages",
      title: "Write three to five messages",
      body:
        "Short, plain-language points — no jargon, no acronyms this audience does not already use. " +
        "If a message needs a technical term to make sense, it is not yet written for them.",
      icon: "list",
    },
  ],
  interview: [
    {
      key: "questions",
      title: "Prepare open questions",
      body:
        "At least five, and open: anything answerable with yes or no ends the thread you were trying " +
        "to open. Ask about what happened, and when — a person recounting a real event tells you " +
        "more than one answering a question about policy.",
      icon: "messageSquare",
    },
    {
      key: "dialogue",
      title: "Read the exchange",
      body:
        "The dialogue is fixed — read it as evidence rather than as a chat you are having. Note what " +
        "they volunteered, what they avoided, and what they said about how the decision was actually " +
        "made rather than how it is supposed to be.",
      icon: "chat",
    },
    {
      key: "summary",
      title: "Close with what you learned",
      body:
        "The most important insight, the biggest thing still open, and what you would probe next. " +
        "The value of an interview is in the synthesis; a transcript with no summary leaves that " +
        "work for the next person.",
      icon: "edit",
    },
  ],
  // ── the two task-boundary gates ──────────────────────────────────────────────────────────
  //
  // Both are tab rails, so the walk is over the steps of the rail rather than over fields, and the
  // anchors come from the shared `TabRail` (`tab:<key>`). The card sits beside the tab it is
  // describing and the tab stays clickable through the spotlight, so the mentee can open the pane
  // the Guide is talking about and come back.
  rua: [
    {
      key: "tab:study",
      title: "Study the governing controls",
      body:
        "Read each control document and pass its comprehension check. These are the requirements the " +
        "task is graded against, so this is not background reading — everything downstream assumes " +
        "you know what they demand.",
      icon: "book",
    },
    {
      key: "tab:inspect",
      title: "Inspect every template",
      body:
        "Open each template you will have to fill in and complete its short exercise. The point is " +
        "to meet the format before the work, not during it — a register you first see while " +
        "transcribing into it is where the avoidable mistakes happen.",
      icon: "table",
    },
    {
      key: "tab:acquire",
      title: "Acquire your prerequisites",
      body:
        "Each ticket is an input, an access or a prior artefact you need before starting. Resolve " +
        "every one; a dashed ticket means it is not yours yet, and starting the task without it is " +
        "how you get half way and stall.",
      icon: "download",
    },
    {
      key: "tab:clarify",
      title: "Clarify each step",
      body:
        "Walk the task's steps and put each one in your own words. Paraphrasing is the test: if you " +
        "cannot say what a step asks without re-reading it, you are not ready to do it, and this is " +
        "the cheap place to find that out.",
      icon: "messageSquare",
    },
    {
      key: "tab:confirm",
      title: "Confirm the deliverable contract",
      body:
        "Lock down what you are expected to produce and what “done” means. Disagreement " +
        "about scope discovered at review is the most expensive kind — this is where it costs nothing " +
        "to settle.",
      icon: "handshake",
    },
    {
      key: "tab:explain",
      title: "Explain the concepts",
      body:
        "Define each key concept in your own words — not the definition you just read. This is " +
        "marked by the mentor model on whether you actually explained it, so copying the source back " +
        "does not pass.",
      icon: "lightbulb",
    },
    {
      key: "tab:answer",
      title: "Pass the verification Q&A",
      body:
        "An adaptive set of questions on what you have just covered. It is the gate's real check " +
        "that the preparation stuck, and it adapts — a shaky area gets asked about again.",
      icon: "chat",
    },
    {
      key: "tab:attest",
      title: "Attest and request the decision",
      body:
        "Sign that you are ready and ask for the gate decision. Ready, conditional and not-ready are " +
        "all real outcomes; attesting to readiness you do not have is the one that costs you later.",
      icon: "shield",
    },
  ],
  research: [
    {
      key: "tab:contextual",
      title: "Three methods are required",
      body:
        "Contextual analysis, gap analysis and horizon scanning all have to clear the quality bar. " +
        "The rail on the left is your route through them, and you can work them in any order — each " +
        "turns green once it passes.",
      icon: "globe",
    },
    {
      key: "rs:prompts",
      title: "Answer the guiding prompts",
      body:
        "These are the questions your findings have to answer for this method. They are not a " +
        "template to paste back — treat them as the shape of the enquiry, and answer them about this " +
        "organisation.",
      icon: "list",
    },
    {
      key: "rs:findings",
      title: "Write what you found",
      body:
        "In your own words, naming the organisation explicitly, and saying what you consulted. " +
        "Research that could have been written before you started is the thing the quality bar on " +
        "the right is looking for — and it checks live as you type.",
      icon: "edit",
    },
    {
      key: "rs:sowhat",
      title: "Say what it changes",
      body:
        "One or two concrete decisions this research changed in your deliverable. Findings with no " +
        "consequence are the most common failure here: if nothing about your work would differ, the " +
        "research has not landed.",
      icon: "target",
    },
    {
      key: "rs:sources",
      title: "Cite your sources",
      body:
        "What you consulted, with enough detail that somebody else could reach the same material. " +
        "Every method you include needs at least one source and the organisation it came from — an " +
        "uncited finding is an assertion.",
      icon: "book",
    },
    {
      key: "rs:include",
      title: "Include an optional method",
      body:
        "At least one of the optional methods has to be included and cleared as well. Choose the one " +
        "that genuinely helps this deliverable — benchmarking, cross-referencing and root-cause " +
        "answer different questions, and picking the easiest is visible in the write-up.",
      icon: "plus",
    },
    {
      key: "tab:review",
      title: "Sign the declaration",
      body:
        "The last step reviews every method and takes your declaration that the work and the words " +
        "are yours. It unlocks the submission — and it is a statement of fact, so read it before you " +
        "sign it.",
      icon: "send",
    },
  ],
};

/** The field walk for a verb, or nothing where one has not been written yet. */
export const fieldGuide = (verbId: string): FieldGuide[] => FIELD_GUIDE[verbId] ?? [];
