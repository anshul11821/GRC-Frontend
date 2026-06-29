// Calculate worked tasks (deterministic metric derivation). Source: Calculate_Verb_Task_Register.xlsx.
// Mentee enters a computed result per row (engine recompute must match within ±0) and cites the
// formula ID. Submission is gated on every result matching `expected` + the formula cited.

export interface CalcRow { id: number; instance: string; inputs: { label: string; value: string }[]; expected: number; }

export interface CalcTask {
  title: string; standard: string; metric: string;
  formulaId: string; formula: string; unit: string;
  inputCols: string[];
  rows: CalcRow[];
  feedsNext: string;
}

export const CALC_TASKS: Record<string, CalcTask> = {
  "AA-002/2.4": {
    title: "CIS Compliance % per Control Group", standard: "CIS Controls v8 IG1", metric: "CIS compliance % per Control group",
    formulaId: "F-CIS-COMP", formula: "Compliance% = Implemented ÷ Applicable × 100", unit: "%",
    inputCols: ["Implemented", "Applicable"],
    feedsNext: "Feeds the gap analysis & top-gap identification.",
    rows: [
      { id: 1, instance: "Control 1 — Asset Inventory", inputs: [{ label: "Implemented", value: "3" }, { label: "Applicable", value: "4" }], expected: 75.0 },
      { id: 2, instance: "Control 2 — Software Inventory", inputs: [{ label: "Implemented", value: "4" }, { label: "Applicable", value: "7" }], expected: 57.1 },
      { id: 3, instance: "Control 3 — Data Protection", inputs: [{ label: "Implemented", value: "5" }, { label: "Applicable", value: "9" }], expected: 55.6 },
      { id: 4, instance: "Control 4 — Secure Configuration", inputs: [{ label: "Implemented", value: "6" }, { label: "Applicable", value: "12" }], expected: 50.0 },
      { id: 5, instance: "Control 5 — Account Management", inputs: [{ label: "Implemented", value: "8" }, { label: "Applicable", value: "10" }], expected: 80.0 },
      { id: 6, instance: "Control 6 — Access Control", inputs: [{ label: "Implemented", value: "7" }, { label: "Applicable", value: "9" }], expected: 77.8 },
    ],
  },
  "TV-001/5": {
    title: "Account % by Finding Category", standard: "ISO 27001 A.8.2/8.3/5.18", metric: "% accounts per finding category",
    formulaId: "F-ACCT-PCT", formula: "Category% = Count ÷ Total accounts × 100", unit: "%",
    inputCols: ["Count", "Total"],
    feedsNext: "Feeds the Access Control Testing Report.",
    rows: [
      { id: 1, instance: "Clean", inputs: [{ label: "Count", value: "15" }, { label: "Total", value: "30" }], expected: 50.0 },
      { id: 2, instance: "Orphaned", inputs: [{ label: "Count", value: "5" }, { label: "Total", value: "30" }], expected: 16.7 },
      { id: 3, instance: "Dormant", inputs: [{ label: "Count", value: "4" }, { label: "Total", value: "30" }], expected: 13.3 },
      { id: 4, instance: "Excessive privilege", inputs: [{ label: "Count", value: "4" }, { label: "Total", value: "30" }], expected: 13.3 },
      { id: 5, instance: "Missing account", inputs: [{ label: "Count", value: "2" }, { label: "Total", value: "30" }], expected: 6.7 },
    ],
  },
  "CA-001/7": {
    title: "Knowledge-Check Pass Rate", standard: "ISO 27001 A.6.3", metric: "Knowledge-check pass rate",
    formulaId: "F-PASS-RATE", formula: "Rate% = Correct (or Passed) ÷ Attendees × 100  (target ≥ 80%)", unit: "%",
    inputCols: ["Correct/Passed", "Attendees"],
    feedsNext: "Feeds the Training Completion Report.",
    rows: [
      { id: 1, instance: "Q1 — Phishing", inputs: [{ label: "Correct/Passed", value: "18" }, { label: "Attendees", value: "20" }], expected: 90.0 },
      { id: 2, instance: "Q2 — Passwords/MFA", inputs: [{ label: "Correct/Passed", value: "15" }, { label: "Attendees", value: "20" }], expected: 75.0 },
      { id: 3, instance: "Q3 — Clear desk", inputs: [{ label: "Correct/Passed", value: "19" }, { label: "Attendees", value: "20" }], expected: 95.0 },
      { id: 4, instance: "Q4 — Data handling", inputs: [{ label: "Correct/Passed", value: "14" }, { label: "Attendees", value: "20" }], expected: 70.0 },
      { id: 5, instance: "Q5 — Reporting", inputs: [{ label: "Correct/Passed", value: "17" }, { label: "Attendees", value: "20" }], expected: 85.0 },
      { id: 6, instance: "Overall pass rate (≥80% scored)", inputs: [{ label: "Correct/Passed", value: "16" }, { label: "Attendees", value: "20" }], expected: 80.0 },
    ],
  },
  "TPRM-001/4": {
    title: "Composite Vendor Risk Score", standard: "ISO 27001 A.5.19/5.20/5.22", metric: "Composite vendor risk score → band",
    formulaId: "F-VEND-COMP", formula: "Composite = Data×2 + Sys×2 + Crit + Geo + NoCert ; High≥11 · Medium 6–10 · Low≤5", unit: "",
    inputCols: ["Data", "Sys", "Crit", "Geo", "NoCert"],
    feedsNext: "Feeds the Supplier Register banding.",
    rows: [
      { id: 1, instance: "Cloud IaaS Co", inputs: [{ label: "Data", value: "3" }, { label: "Sys", value: "2" }, { label: "Crit", value: "5" }, { label: "Geo", value: "1" }, { label: "NoCert", value: "0" }], expected: 16.0 },
      { id: 2, instance: "Email SaaS Co", inputs: [{ label: "Data", value: "3" }, { label: "Sys", value: "2" }, { label: "Crit", value: "4" }, { label: "Geo", value: "1" }, { label: "NoCert", value: "0" }], expected: 15.0 },
      { id: 3, instance: "Payroll Co", inputs: [{ label: "Data", value: "3" }, { label: "Sys", value: "1" }, { label: "Crit", value: "4" }, { label: "Geo", value: "0" }, { label: "NoCert", value: "0" }], expected: 12.0 },
      { id: 4, instance: "Marketing email Co", inputs: [{ label: "Data", value: "2" }, { label: "Sys", value: "1" }, { label: "Crit", value: "2" }, { label: "Geo", value: "1" }, { label: "NoCert", value: "1" }], expected: 10.0 },
      { id: 5, instance: "Helpdesk SaaS Co", inputs: [{ label: "Data", value: "2" }, { label: "Sys", value: "1" }, { label: "Crit", value: "3" }, { label: "Geo", value: "0" }, { label: "NoCert", value: "0" }], expected: 9.0 },
      { id: 6, instance: "Office cleaning Co", inputs: [{ label: "Data", value: "0" }, { label: "Sys", value: "0" }, { label: "Crit", value: "1" }, { label: "Geo", value: "0" }, { label: "NoCert", value: "1" }], expected: 2.0 },
      { id: 7, instance: "Backup/DR Co", inputs: [{ label: "Data", value: "3" }, { label: "Sys", value: "1" }, { label: "Crit", value: "5" }, { label: "Geo", value: "1" }, { label: "NoCert", value: "0" }], expected: 14.0 },
      { id: 8, instance: "Survey tool Co", inputs: [{ label: "Data", value: "1" }, { label: "Sys", value: "0" }, { label: "Crit", value: "2" }, { label: "Geo", value: "1" }, { label: "NoCert", value: "1" }], expected: 6.0 },
    ],
  },
  "TPRM-002/7": {
    title: "Due-Diligence Score %", standard: "ISO 27001 A.5.19/5.20/5.21", metric: "Due-Diligence score %",
    formulaId: "F-DD-SCORE", formula: "DD Score% = Satisfactory ÷ Total questions × 100", unit: "%",
    inputCols: ["Satisfactory", "Total"],
    feedsNext: "Feeds the due-diligence assessment outcome.",
    rows: [
      { id: 1, instance: "Information security policy", inputs: [{ label: "Satisfactory", value: "4" }, { label: "Total", value: "5" }], expected: 80.0 },
      { id: 2, instance: "Access management", inputs: [{ label: "Satisfactory", value: "3" }, { label: "Total", value: "5" }], expected: 60.0 },
      { id: 3, instance: "Incident response", inputs: [{ label: "Satisfactory", value: "4" }, { label: "Total", value: "4" }], expected: 100.0 },
      { id: 4, instance: "Business continuity", inputs: [{ label: "Satisfactory", value: "2" }, { label: "Total", value: "4" }], expected: 50.0 },
      { id: 5, instance: "Supply chain", inputs: [{ label: "Satisfactory", value: "3" }, { label: "Total", value: "4" }], expected: 75.0 },
      { id: 6, instance: "OVERALL", inputs: [{ label: "Satisfactory", value: "16" }, { label: "Total", value: "22" }], expected: 72.7 },
    ],
  },
  "MM-002/6": {
    title: "Residual-Risk Portfolio Trend", standard: "ISO 27001 Cl 9.1; 6.1", metric: "Residual-risk portfolio trend",
    formulaId: "F-RISK-TREND", formula: "Per-risk Δ = This-month − Last-month residual ; Portfolio: Improved if ΣΔ<0 · Worsened if >0 · Stable if =0", unit: "",
    inputCols: ["Last-month", "This-month"],
    feedsNext: "Feeds the monthly risk-trend report.",
    rows: [
      { id: 1, instance: "R-01 Phishing", inputs: [{ label: "Last-month", value: "16" }, { label: "This-month", value: "12" }], expected: -4.0 },
      { id: 2, instance: "R-02 Mis-sent email", inputs: [{ label: "Last-month", value: "9" }, { label: "This-month", value: "9" }], expected: 0.0 },
      { id: 3, instance: "R-03 Ransomware", inputs: [{ label: "Last-month", value: "20" }, { label: "This-month", value: "15" }], expected: -5.0 },
      { id: 4, instance: "R-04 Tailgating", inputs: [{ label: "Last-month", value: "6" }, { label: "This-month", value: "6" }], expected: 0.0 },
      { id: 5, instance: "R-05 Lost laptop", inputs: [{ label: "Last-month", value: "12" }, { label: "This-month", value: "8" }], expected: -4.0 },
      { id: 6, instance: "R-06 Weak passwords", inputs: [{ label: "Last-month", value: "4" }, { label: "This-month", value: "4" }], expected: 0.0 },
      { id: 7, instance: "R-07 Unpatched VPN", inputs: [{ label: "Last-month", value: "15" }, { label: "This-month", value: "10" }], expected: -5.0 },
      { id: 8, instance: "R-08 Shadow IT", inputs: [{ label: "Last-month", value: "10" }, { label: "This-month", value: "12" }], expected: 2.0 },
    ],
  },
};

export function getCalcTask(taskCode?: string, activityCode?: string): CalcTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return CALC_TASKS[`${taskCode}/${activityCode}`];
}
