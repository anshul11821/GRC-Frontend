// Research-method catalogue for the Research Submission gate — the closing step of every task.
// Six methods: 3 required + 3 optional (mentee includes ≥ 1). Task-agnostic — {org} {standard}
// {deliverable} {title} {cat} placeholders are filled from the task's RUA entry / TASK_META at
// render time via rsFill(). Ported verbatim from the Research Submission (standalone) mockup.
import type { IconName } from "@/components/ui/icon";

export interface ResearchMethod {
  key: string;
  name: string;
  /** Required methods must all pass; optional methods are included by the mentee (pick ≥ 1). */
  req: boolean;
  icon: IconName;
  tag: string;
  definition: string;
  why: string;
  prompts: string[];
  sourceHint: string;
}

export const RESEARCH_METHODS: ResearchMethod[] = [
  {
    key: "contextual",
    name: "Contextual Analysis",
    req: true,
    icon: "briefcase",
    tag: "Tailor, don't template",
    definition: "Studying the organisation's specific business model, sector and operating environment so your work fits the organisation — not a cookie-cutter template.",
    why: "A generic answer proves you can copy; a contextual one proves you understood {org}.",
    prompts: [
      "What does {org} actually do, and how does that shape this {cat} work?",
      "If “{title}” went wrong, which part of {org} would notice first?",
      "Name one thing about {org} that a generic, copy-paste answer would miss.",
    ],
    sourceHint: "Organisation brief in your task pack, sector overviews, company-profile material.",
  },
  {
    key: "gap",
    name: "Gap Analysis",
    req: true,
    icon: "gauge",
    tag: "Current state vs required state",
    definition: "Researching the difference between the current state (how things are done now) and the desired state required by a specific standard or regulatory requirement.",
    why: "The distance between today and {standard} is where all the real work in this task lives.",
    prompts: [
      "How does {org} currently handle this {cat} area? What evidence shows that?",
      "What does {standard} say it should look like instead? Name the clause or control.",
      "Which gap matters most, and which one would be quickest to fix?",
    ],
    sourceHint: "The governing clauses of {standard}, prior task outputs, internal documents you inspected.",
  },
  {
    key: "horizon",
    name: "Horizon Scanning",
    req: true,
    icon: "globe",
    tag: "What's coming next",
    definition: "Proactively researching upcoming changes in legislation and emerging cyber threats that could impact the business's compliance or risk posture.",
    why: "A deliverable built only for today's rules is already ageing — show you looked 12–24 months out.",
    prompts: [
      "What's one upcoming law or rule change that could affect {org}'s {cat} work in the next year or two?",
      "What's one new threat that matters most for {org}'s industry, and why that one?",
      "What did you add to the {deliverable} to prepare for that change?",
    ],
    sourceHint: "Regulator announcements, ENISA / NCSC / CISA advisories, reputable threat-landscape reports.",
  },
  {
    key: "benchmark",
    name: "Benchmarking",
    req: false,
    icon: "target",
    tag: "How do peers set the bar?",
    definition: "Comparing the organisation's practices against industry peers and recognised good practice to judge whether the bar is set in the right place.",
    why: "Knowing what “normal” looks like in {org}'s sector stops you gold-plating — or under-shooting.",
    prompts: [
      "How do similar organisations usually handle this {cat} work?",
      "What good-practice source did you compare {org} against?",
      "Is {org} ahead, on par, or behind that bar — and how do you know?",
    ],
    sourceHint: "Industry surveys, peer case studies, published good-practice guides.",
  },
  {
    key: "crosswalk",
    name: "Standards Cross-Referencing",
    req: false,
    icon: "link",
    tag: "One requirement, many frameworks",
    definition: "Tracing the same requirement across frameworks — ISO 27001, NIST CSF, CIS Controls — to understand its intent rather than memorising one wording.",
    why: "If you can say it in three frameworks, you understand the control — not just the sentence.",
    prompts: [
      "How does {standard} describe the core requirement behind this task?",
      "How does one other framework describe that same requirement?",
      "Where do the two genuinely differ, and does it matter for {org}?",
    ],
    sourceHint: "The standards themselves, published cross-walk mappings, the task's cross-walk references.",
  },
  {
    key: "rootcause",
    name: "Root Cause Analysis",
    req: false,
    icon: "treeDown",
    tag: "Why does the gap exist?",
    definition: "Digging beneath observed gaps to the process, ownership or resourcing causes behind them — so recommendations fix causes, not symptoms.",
    why: "A finding without a cause produces a fix that fails; show why the gap exists at {org}.",
    prompts: [
      "Pick the biggest gap you found in this {cat} review. Why does it exist? Keep asking “why” until you reach the real cause.",
      "Is that cause about process, people, resources, or awareness? What evidence points there?",
      "How does knowing the real cause change your recommendation?",
    ],
    sourceHint: "Interview notes, process documents, incident or ticket history you reviewed.",
  },
];

export const RESEARCH_SOURCE_TYPES = [
  "Standard / framework", "Regulation / law", "Regulator guidance",
  "Industry report", "Threat advisory", "News / analysis", "Internal document", "Interview / SME",
];
