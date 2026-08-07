// Record worked tasks. Source: Record_Verb_Task_Register.xlsx. The mentee enters rows into an
// authoritative register; there is no answer key — the gate is Layer-1 deterministic validation
// (mandatory fields, ID format, controlled vocab, owner-is-a-role, no duplicate IDs, conditional
// rationale, pass↔score consistency).

export interface RecCol {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  required?: boolean;
  options?: string[];
  /** Regex source the value must match (e.g. asset-ID format). */
  idFormat?: { pattern: string; example: string };
  /** Owner-is-a-role rule: reject department/team/division values. */
  notDepartment?: boolean;
  /** Required only when another column equals a value (e.g. rationale if Confidential). */
  condReq?: { key: string; equals: string };
  /** No duplicate values across rows (e.g. Asset ID, Participant Name). */
  unique?: boolean;
}

export interface RecordTask {
  title: string;
  standard: string;
  registerName: string;
  requiredRows: number;
  /** Title of the reference document the rows are transcribed from — shown in the workspace so the
   *  register isn't a blank table with no stated source. Must match a doc in the step's reference
   *  strip (see backend _seed/grc101_content.json → activities[code].references). */
  source?: string;
  columns: RecCol[];
  /** Cross-field rule: Pass iff score ≥ threshold (when both present). */
  passRule?: { passKey: string; scoreKey: string; threshold: number };
  feedsNext: string;
}

export const RECORD_TASKS: Record<string, RecordTask> = {
  // Columns mirror the step's own brief and source document (see grc101_content.json AA-001 → 1.3):
  // "asset name, data held, location, and a named owner", one row per asset in the intake notes.
  // Classification is deliberately NOT here — the brief says "leave classification blank for now,
  // that's the next step", and step 1.4 (Apply) is that step. It used to be a *required* CIA column,
  // so a mentee who followed the instruction could never submit.
  "AA-001/1.3": {
    title: "Information Asset Register",
    standard: "ISO 27001 A.5.9 Inventory",
    registerName: "Information Asset Register",
    requiredRows: 8, // the intake notes list 8 distinct assets; the brief says one row per asset
    source: "CloudTech — Asset Intake Notes",
    feedsNext: "Feeds Step 1.4 (Apply classification) and Step 1.5 (Cross-reference).",
    columns: [
      { key: "assetId", label: "Asset ID", type: "text", required: true, idFormat: { pattern: "^AST-\\d{4}$", example: "AST-0001" }, unique: true },
      { key: "name", label: "Asset Name", type: "text", required: true },
      { key: "type", label: "Asset Type", type: "select", required: true, options: ["Application/SaaS", "Server", "Database", "Endpoint", "Network Share", "Document Store", "Source Code"] },
      // The source rules are explicit that this names the data types ("names, emails, hashed
      // passwords"), not a vague "customer data" — it was mandatory in the brief but had no column.
      { key: "dataHeld", label: "Data Held", type: "text", required: true },
      { key: "location", label: "Storage Location", type: "text", required: true },
      { key: "owner", label: "Owner (role)", type: "text", required: true, notDepartment: true },
    ],
  },
  "CA-001/6": {
    title: "Training Attendance Register",
    standard: "ISO 27001 A.6.3 Awareness & training",
    registerName: "Training Attendance Register",
    requiredRows: 4,
    feedsNext: "Feeds Step 7 (Score / pass-rate) and Step 8 (Training Completion Report).",
    passRule: { passKey: "pass", scoreKey: "score", threshold: 80 },
    columns: [
      { key: "name", label: "Participant Name", type: "text", required: true, unique: true },
      { key: "role", label: "Role", type: "text", required: true },
      { key: "dept", label: "Department/Unit", type: "text", required: true },
      { key: "date", label: "Session Date", type: "date", required: true },
      { key: "status", label: "Attendance Status", type: "select", required: true, options: ["Present in-person", "Present remote", "Absent", "Excused"] },
      { key: "score", label: "K-Check Score %", type: "number" },
      { key: "pass", label: "Pass/Fail", type: "select", options: ["Pass", "Fail"] },
    ],
  },
};

export function getRecordTask(taskCode?: string, activityCode?: string): RecordTask | undefined {
  if (!taskCode || !activityCode) return undefined;
  return RECORD_TASKS[`${taskCode}/${activityCode}`];
}
