// Brief worked tasks. Source: Brief_Verb_Task_Register.xlsx. Mentee defines the audience + explicit
// ask and writes <=5 plain-language key messages. Gate = audience + ask + >=3 messages (no jargon is
// Layer-2). Answer-key audience/ask shown as placeholders.

export interface BriefTask { title: string; standard: string; format: string; audience: string; ask: string; messages: string[]; }

export const BRIEF_TASKS: Record<string, BriefTask> = {
  "CRM-003/9.8": {
    title: "SOC 2 Awareness (IT team)", standard: "SOC 2 Type II", format: "≤2 pages",
    audience: "IT team (non-audit)", ask: "Send your team's access-review and change-tickets evidence to the GRC inbox by 31 July.",
    messages: ["SOC 2 is a customer-trust audit of how we keep their data safe — it checks our day-to-day controls.", "We are mostly ready: 16 of 20 control areas are in good shape.", "The main gap is security monitoring — we don't yet watch system logs for problems.", "To pass, we need each team to keep simple evidence: who has access, and a record of changes.", "What we need from you: send your access-review and change records to the GRC inbox by month-end."],
  },
  "IE-002/7": {
    title: "Document Control Policy (stakeholders)", standard: "ISO 27001 Cl 7.5", format: "1 page",
    audience: "All GRC stakeholders", ask: "From 1 August, save all GRC documents in the new shared library using the naming rule on the intranet.",
    messages: ["We now have one place and one naming rule for all GRC documents.", "Every document has a version number, an owner, and a review date.", "Old copies on personal drives should be deleted to avoid using out-of-date versions.", "If you need to change a document, ask the owner — they keep the master copy.", "What we need: from 1 August, save all GRC documents in the new shared library."],
  },
  "QA-002/8": {
    title: "Control-Testing Methodology (mentor)", standard: "ISO 27001 A.5.35/5.36", format: "1 page",
    audience: "Compliance Manager", ask: "Adopt this four-step testing method as the standard for future internal control checks.",
    messages: ["I built a simple, repeatable way to test whether a control actually works.", "It has four steps: pick the control, define what 'good' looks like, gather evidence, judge pass or fail.", "Each test records the evidence so the result can be checked later.", "It can be reused for any control without re-inventing the approach each time.", "What we need: adopt this four-step method as our standard for internal control checks."],
  },
};

export function getBriefTask(taskCode?: string, activityCode?: string): BriefTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return BRIEF_TASKS[`${taskCode}/${activityCode}`];
}
