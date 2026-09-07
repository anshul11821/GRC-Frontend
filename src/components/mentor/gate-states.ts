import type { IconName } from "@/components/ui/icon";
import type { MenteeGate } from "@/lib/mentor";

/**
 * The four states a reviewer sorts a learner's work into — and a fifth that only appears when it
 * has actually happened.
 *
 * These replaced a five-stage progress pipeline that tracked one gate through Submitted → In
 * review → Changes → Approved → Certified. Two things were wrong with it. It described a single
 * step, so it answered "where is this one?" when the reviewer's question is "what needs me?"; and
 * **Certified** was drawn but unreachable, because a certificate is issued at 100% programme
 * completion, not at a gate — a stage that can never light up is a stage that teaches the reader
 * nothing.
 *
 * So they are tabs over the whole caseload of one learner instead, each showing what its label
 * says. All four are states of the **reviewer's** work, not the learner's: a step is Submitted
 * until the mentor marks something on it, In progress from their first verdict on any part until
 * they decide the delivery, and then Approved or Changes requested. A step the learner has not delivered belongs to none of
 * them — it is not the reviewer's work at all — so `reviewable` drops it before it reaches a tab.
 *
 * `rejected` is not in the fixed set because an escalation is rare and terminal; a tab that reads
 * "Rejected 0" on every healthy learner is noise, so it appears only when one exists.
 */
export type GateState = "submitted" | "in_progress" | "changes" | "approved" | "rejected";

export interface GateStateDef {
  id: GateState;
  label: string;
  /** What this tab means, for the empty state and the tooltip. */
  hint: string;
  icon: IconName;
  dot: string;
  /** The tab when it is the selected one. */
  on: string;
  /** The count badge when it is not. */
  badge: string;
}

export const GATE_STATES: GateStateDef[] = [
  {
    id: "submitted",
    label: "Submitted",
    hint: "Delivered and waiting on your decision.",
    icon: "inbox",
    dot: "bg-indigo-500",
    on: "bg-indigo-600 text-white",
    badge: "bg-indigo-50 text-indigo-700",
  },
  {
    id: "in_progress",
    label: "In progress",
    hint: "You have started marking these up and not decided them yet.",
    icon: "edit",
    dot: "bg-violet-500",
    on: "bg-violet-600 text-white",
    badge: "bg-violet-50 text-violet-700",
  },
  {
    id: "changes",
    label: "Changes requested",
    hint: "Returned to them, with an extra attempt.",
    icon: "refresh",
    dot: "bg-[#b4741a]",
    on: "bg-[#b4741a] text-white",
    badge: "bg-[#fefce8] text-[#8a5a14]",
  },
  {
    id: "approved",
    label: "Approved",
    hint: "Released. Approved, or approved with an observation.",
    icon: "check",
    dot: "bg-[#1e7a46]",
    on: "bg-[#1e7a46] text-white",
    badge: "bg-[#f2f9f5] text-[#1e7a46]",
  },
  {
    id: "rejected",
    label: "Rejected",
    hint: "Escalated. The gate does not reopen.",
    icon: "x",
    dot: "bg-[#a31d1d]",
    on: "bg-[#a31d1d] text-white",
    badge: "bg-[#fdecec] text-[#a31d1d]",
  },
];

export const GATE_STATE = Object.fromEntries(GATE_STATES.map((s) => [s.id, s])) as Record<
  GateState,
  GateStateDef
>;

/**
 * Whether a gate is the reviewer's business at all.
 *
 * A step the learner has not delivered has nothing to review and no verdict to give, so it is not
 * in any of the four states — it is on the learner's desk, not this one. Counted in the footer so
 * it is visibly excluded rather than silently missing.
 */
export const reviewable = (gate: MenteeGate) => gate.state !== "not_submitted";

/** Which tab a gate belongs under. Every reviewable gate lands in exactly one. */
export function stateOf(gate: MenteeGate): GateState {
  if (gate.state === "awaiting") return gate.started ? "in_progress" : "submitted";
  if (gate.outcome === "approve" || gate.outcome === "approve_note") return "approved";
  if (gate.outcome === "disapprove_escalate") return "rejected";
  return "changes";
}

/** The tabs to show: the four, plus Rejected only if this learner has one. */
export function tabsFor(gates: MenteeGate[]): { def: GateStateDef; count: number }[] {
  const counts = new Map<GateState, number>();
  for (const g of gates.filter(reviewable))
    counts.set(stateOf(g), (counts.get(stateOf(g)) ?? 0) + 1);
  return GATE_STATES.filter((s) => s.id !== "rejected" || (counts.get("rejected") ?? 0) > 0).map(
    (def) => ({ def, count: counts.get(def.id) ?? 0 }),
  );
}
