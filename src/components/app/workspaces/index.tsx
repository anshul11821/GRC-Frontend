"use client";

// Registry + dispatcher for the per-verb Working Desk workspaces. Each bespoke workspace replaces
// the generic SchemaForm body for its verb while writing the same payload.fields keys, so the page's
// live acceptance checklist, draft/submit, and backend grading are untouched. Verbs without a
// bespoke workspace fall back to SchemaForm. A shared "Additional notes" field is always appended
// (matching the previous SchemaForm behaviour → value.notes).

import { SchemaForm } from "@/components/app/schema-form";
import { VERB_FORMS, GENERIC_FORM } from "@/lib/verb-forms";
import type { WorkspaceProps } from "./primitives";
import { RecordWorkspace, ApplyWorkspace, CrossRefWorkspace, IdentifyWorkspace, MapWorkspace } from "./data-verbs";
import { CalculateWorkspace, PrioritiseWorkspace, RecommendWorkspace, ValidateWorkspace, AssessWorkspace, ScoreWorkspace } from "./analysis-verbs";
import { ReviewWorkspace, DraftWorkspace, CompileWorkspace, BriefWorkspace, DocumentWorkspace } from "./doc-verbs";
import { RequestWorkspace, ConductWorkspace, InterviewWorkspace, ScheduleWorkspace, PresentWorkspace, SignoffWorkspace } from "./interaction-verbs";

const VERB_WORKSPACE: Record<string, (p: WorkspaceProps) => React.ReactElement> = {
  // data-shaped
  record: RecordWorkspace,
  apply: ApplyWorkspace,
  crossref: CrossRefWorkspace,
  identify: IdentifyWorkspace,
  map: MapWorkspace,
  // analysis-shaped
  calculate: CalculateWorkspace,
  prioritise: PrioritiseWorkspace,
  recommend: RecommendWorkspace,
  validate: ValidateWorkspace,
  assess: AssessWorkspace,
  score: ScoreWorkspace,
  // writing-shaped
  review: ReviewWorkspace,
  draft: DraftWorkspace,
  compile: CompileWorkspace,
  brief: BriefWorkspace,
  document: DocumentWorkspace,
  // interaction (chat removed)
  request: RequestWorkspace,
  conduct: ConductWorkspace,
  interview: InterviewWorkspace,
  schedule: ScheduleWorkspace,
  present: PresentWorkspace,
  signoff: SignoffWorkspace,
};

function NotesField({ value, onChange }: WorkspaceProps) {
  return (
    <div>
      <div className="text-[12px] font-medium text-slate-700 tracking-tight mb-1.5">Additional notes</div>
      <textarea
        value={String(value.notes ?? "")}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
        rows={4}
        placeholder="Anything else for the mentor to consider…"
        className="w-full rounded-lg bg-white ring-1 ring-slate-200/80 p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-y"
      />
    </div>
  );
}

export function VerbWorkspace({
  verbId,
  value,
  onChange,
}: {
  verbId: string;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const Workspace = VERB_WORKSPACE[verbId];
  if (!Workspace) {
    // Unmapped / generic verb → keep the existing data-driven form (it appends its own notes field).
    return <SchemaForm spec={VERB_FORMS[verbId] ?? GENERIC_FORM} value={value} onChange={onChange} />;
  }
  return (
    <div className="space-y-5">
      <Workspace value={value} onChange={onChange} />
      <NotesField value={value} onChange={onChange} />
    </div>
  );
}
