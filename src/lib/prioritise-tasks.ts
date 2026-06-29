// Prioritise worked tasks. Source: Prioritise_Verb_Task_Register.xlsx. Mentee scores each item per
// criterion; the aggregate + rank compute live; ties require a documented tiebreaker (Layer 1).
// Only AA-002/2.5 maps to a `prioritise`-tagged catalog step.

export interface PrioTask {
  title: string;
  standard: string;
  criteria: string[];
  scaleMax: number;
  aggregate: "sum" | "product";
  items: { id: number; label: string }[];
  feedsNext: string;
}

export const PRIORITISE_TASKS: Record<string, PrioTask> = {
  "AA-002/2.5": {
    title: "Prioritise top CIS control gaps by risk exposure",
    standard: "CIS Controls v8 IG1",
    criteria: ["Exploitability", "Impact", "Prevalence"],
    scaleMax: 5,
    aggregate: "sum",
    feedsNext: "The ranked gap list feeds the Recommend step.",
    items: [
      { id: 1, label: "Default admin passwords" },
      { id: 2, label: "No MFA for admin" },
      { id: 3, label: "No asset inventory" },
      { id: 4, label: "No patching policy" },
      { id: 5, label: "No data-protection process" },
      { id: 6, label: "No secure-config baseline" },
      { id: 7, label: "Unauthorised software" },
      { id: 8, label: "No access-revoke process" },
    ],
  },
};

export function getPrioTask(taskCode?: string, activityCode?: string): PrioTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return PRIORITISE_TASKS[`${taskCode}/${activityCode}`];
}
