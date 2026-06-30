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
  columns: RecCol[];
  /** Cross-field rule: Pass iff score ≥ threshold (when both present). */
  passRule?: { passKey: string; scoreKey: string; threshold: number };
  feedsNext: string;
}

export const RECORD_TASKS: Record<string, RecordTask> = {
  "AA-001/1.3": {
    title: "Information Asset Register",
    standard: "ISO 27001 A.5.9 Inventory; A.5.12 Classification",
    registerName: "Information Asset Register",
    requiredRows: 4,
    feedsNext: "Feeds Step 4 (Apply classification) and Step 5 (Cross-reference).",
    columns: [
      { key: "assetId", label: "Asset ID", type: "text", required: true, idFormat: { pattern: "^AST-\\d{4}$", example: "AST-0001" }, unique: true },
      { key: "name", label: "Asset Name", type: "text", required: true },
      { key: "type", label: "Asset Type", type: "select", required: true, options: ["Application/SaaS", "Server", "Database", "Endpoint", "Network Share", "Document Store"] },
      { key: "owner", label: "Owner (role)", type: "text", required: true, notDepartment: true },
      { key: "location", label: "Location/System", type: "text", required: true },
      { key: "cia", label: "CIA Class", type: "select", required: true, options: ["Public", "Internal", "Confidential"] },
      { key: "rationale", label: "Rationale (if Confidential)", type: "text", condReq: { key: "cia", equals: "Confidential" } },
      { key: "reviewDate", label: "Review Date", type: "date", required: true },
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
