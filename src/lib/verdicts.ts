import type { IconName } from "@/components/ui/icon";

/**
 * The four things a reviewer can say — about one part of a delivery, or about the whole of it.
 *
 * They are a face on the four outcomes the programme already had, not a fifth review model:
 * approve → `approve`, observe → `approve_note`, changes → `disapprove_return`,
 * reject → `disapprove_escalate` (`services/mentor_review.VERDICT_OUTCOME`). Progression is
 * untouched — what changes is that the reviewer names the judgement instead of picking between
 * "Approve" and "Return with reasons" and hoping the note carries the difference.
 *
 * Only Approve may be wordless: the work stands and there is nothing for the learner to do. Every
 * other verdict asks something of them or takes something from them — an observation nobody wrote,
 * a change request with nothing to change, a rejection with no explanation — so `needsNote` is
 * enforced on the server too. Rejection most of all: it is the one that never reopens.
 */
export type Verdict = "approve" | "observe" | "changes" | "reject";

export interface VerdictDef {
  id: Verdict;
  /** On the button. */
  label: string;
  /** The same button below xl, where the full label costs the bar a second row. */
  terse: string;
  /** On the pill, once given. */
  short: string;
  icon: IconName;
  needsNote: boolean;
  /** Chosen. */
  btn: string;
  /** Not chosen. */
  idle: string;
  /** The card the reviewed part sits in. */
  card: string;
  /** The same, for a table row — Tailwind only sees classes written out in full. */
  row: string;
  pill: string;
  dot: string;
}

export const VERDICTS: VerdictDef[] = [
  {
    id: "approve",
    label: "Approve",
    terse: "Approve",
    short: "Approved",
    icon: "check",
    needsNote: false,
    btn: "bg-[#1e7a46] text-white ring-[#1e7a46] hover:bg-[#1a6b3d]",
    idle: "ring-slate-200 text-slate-500 hover:ring-[#1e7a46]/50 hover:text-[#1e7a46]",
    row: "bg-[#f2f9f5] border-l-2 border-l-[#1e7a46]",
    card: "bg-[#f2f9f5] ring-[#c6e6d3]",
    pill: "bg-[#1e7a46] text-white",
    dot: "bg-[#1e7a46]",
  },
  {
    id: "observe",
    label: "Approve with observation",
    terse: "Observe",
    short: "Approved with observation",
    icon: "eye",
    needsNote: true,
    btn: "bg-[#0f6f72] text-white ring-[#0f6f72] hover:bg-[#0c5c5e]",
    idle: "ring-slate-200 text-slate-500 hover:ring-[#0f6f72]/50 hover:text-[#0f6f72]",
    row: "bg-[#f0f9f9] border-l-2 border-l-[#0f6f72]",
    card: "bg-[#f0f9f9] ring-[#bfe0e1]",
    pill: "bg-[#0f6f72] text-white",
    dot: "bg-[#0f6f72]",
  },
  {
    id: "changes",
    label: "Request changes",
    terse: "Changes",
    short: "Changes requested",
    icon: "refresh",
    needsNote: true,
    btn: "bg-[#b4741a] text-white ring-[#b4741a] hover:bg-[#9c6316]",
    idle: "ring-slate-200 text-slate-500 hover:ring-[#b4741a]/50 hover:text-[#b4741a]",
    row: "bg-[#fefce8] border-l-2 border-l-[#b4741a]",
    card: "bg-[#fefce8] ring-[#fde68a]",
    pill: "bg-[#b4741a] text-white",
    dot: "bg-[#b4741a]",
  },
  {
    id: "reject",
    label: "Reject",
    terse: "Reject",
    short: "Rejected",
    icon: "x",
    needsNote: true,
    btn: "bg-[#a31d1d] text-white ring-[#a31d1d] hover:bg-[#8f1919]",
    idle: "ring-slate-200 text-slate-500 hover:ring-[#a31d1d]/50 hover:text-[#a31d1d]",
    row: "bg-[#fdecec] border-l-2 border-l-[#a31d1d]",
    card: "bg-[#fdecec] ring-[#f0c2c2]",
    pill: "bg-[#a31d1d] text-white",
    dot: "bg-[#a31d1d]",
  },
];

export const VERDICT = Object.fromEntries(VERDICTS.map((v) => [v.id, v])) as Record<
  Verdict,
  VerdictDef
>;

/** Severest first. A delivery is only as good as its weakest part. */
const SEVERITY: Verdict[] = ["reject", "changes", "observe", "approve"];

/**
 * What the parts add up to. Offered as the delivery verdict, never imposed — a reviewer may want
 * changes on one row of a thirty-row register and still release the step, and only they can say.
 */
export function rollUp(verdicts: Verdict[]): Verdict | null {
  if (verdicts.length === 0) return null;
  return SEVERITY.find((v) => verdicts.includes(v)) ?? "approve";
}
