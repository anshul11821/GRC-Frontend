"use client";

// Analysis-shaped verbs: Calculate, Prioritise, Recommend, Validate, Assess, Score.
// Editable, empty-by-default; some carry a live computed panel (aggregate / radar) that updates as
// rows are filled. All write the same payload.fields keys the verb's VERB_FORMS spec defines.

import { Icon } from "@/components/ui/icon";
import {
  DataTable,
  SectionLabel,
  WsTextArea,
  WsInput,
  Panel,
  Radar,
  asRows,
  str,
  fields,
  type WorkspaceProps,
  type Row,
} from "./primitives";

const numOf = (v: string): number => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : NaN;
};

// ── CALCULATE · formula + inputs + result ───────────────────────────────────────
export function CalculateWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Formula / metric</SectionLabel>
        <WsInput value={str(f.get("formula"))} onChange={(v) => f.set("formula", v)} placeholder="Name and state the formula, e.g. Residual = Likelihood × Impact × (1 − ControlEff/4)" />
      </div>
      <div>
        <SectionLabel>Source data / inputs</SectionLabel>
        <WsTextArea
          value={str(f.get("inputs"))}
          onChange={(v) => f.set("inputs", v)}
          rows={4}
          placeholder="List every input value and cite its source."
          footer={<><Icon name="info" size={11} />Cite a source for every variable — the grader re-checks the working.</>}
        />
      </div>
      <div>
        <SectionLabel>Result</SectionLabel>
        <WsInput value={str(f.get("result"))} onChange={(v) => f.set("result", v)} placeholder="The computed result" />
      </div>
    </div>
  );
}

// ── PRIORITISE · ranked items by criterion ──────────────────────────────────────
export function PrioritiseWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("ranked"));
  return (
    <div className="space-y-3">
      <SectionLabel hint={`${rows.length} item${rows.length === 1 ? "" : "s"}`}>Prioritisation matrix</SectionLabel>
      <DataTable
        columns={[
          { key: "item", label: "Item", required: true, placeholder: "Risk / gap / item" },
          { key: "criterion", label: "Criterion score", type: "number", required: true, placeholder: "Weighted score" },
          { key: "rank", label: "Rank", type: "number", required: true, placeholder: "1 = highest" },
        ]}
        rows={rows}
        onChange={(r) => f.set("ranked", r)}
        addLabel="Add item"
      />
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="sortDesc" size={12} className="text-slate-400" />
        Rank by the criterion score. Resolve any ties with a written tiebreaker in your notes.
      </p>
    </div>
  );
}

// ── RECOMMEND · per-gap remediation cards (table) ───────────────────────────────
export function RecommendWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("recommendations"));
  return (
    <div className="space-y-3">
      <SectionLabel hint={`${rows.length} recommendation${rows.length === 1 ? "" : "s"}`}>Recommendations</SectionLabel>
      <DataTable
        columns={[
          { key: "action", label: "Action", required: true, placeholder: "Concrete, action-specific" },
          { key: "control", label: "Control ref", required: true, placeholder: "e.g. ISO 27001 A.8.15" },
          { key: "owner", label: "Owner (role)", required: true, placeholder: "A role title" },
          { key: "targetDate", label: "Target date", type: "date", required: true },
          { key: "rationale", label: "Rationale", placeholder: "Why this closes the gap" },
        ]}
        rows={rows}
        onChange={(r) => f.set("recommendations", r)}
        addLabel="Add recommendation"
      />
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="rocket" size={12} className="text-slate-400" />
        Each recommendation must cite a control, name an owner role, and have a target date.
      </p>
    </div>
  );
}

// ── VALIDATE · findings + citation + status ─────────────────────────────────────
export function ValidateWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("findings"));
  return (
    <div className="space-y-3">
      <SectionLabel hint={`${rows.length} finding${rows.length === 1 ? "" : "s"}`}>Findings · validation worksheet</SectionLabel>
      <DataTable
        columns={[
          { key: "finding", label: "Finding", required: true, placeholder: "What you verified" },
          { key: "citation", label: "Citation / source", required: true, placeholder: "Standard, control, or evidence" },
          { key: "status", label: "Status", type: "select", options: ["Verified", "Follow-up needed"], required: true },
          { key: "followup", label: "Follow-up action", placeholder: "Required if not verified" },
        ]}
        rows={rows}
        onChange={(r) => f.set("findings", r)}
        addLabel="Add finding"
      />
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="shield" size={12} className="text-slate-400" />
        Every finding needs a citation; anything not verified needs a follow-up action — none may sit indeterminate.
      </p>
    </div>
  );
}

const CMMI = ["1 · Initial", "2 · Repeatable", "3 · Defined", "4 · Managed", "5 · Optimising"];

// ── ASSESS · maturity scale + evidence + live radar ─────────────────────────────
export function AssessWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("items"));
  const rated = rows.filter((r) => Number.isFinite(numOf(str(r.rating))) && str(r.item).trim());
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel hint="Every level needs cited evidence">Maturity assessment</SectionLabel>
        <DataTable
          columns={[
            { key: "item", label: "Domain", required: true, placeholder: "e.g. Access Control" },
            { key: "rating", label: "Maturity (CMMI 1–5)", type: "select", options: CMMI, required: true },
            { key: "evidence", label: "Evidence", required: true, placeholder: "Cite the supporting evidence" },
          ]}
          rows={rows}
          onChange={(r) => f.set("items", r)}
          addLabel="Add domain"
        />
      </div>
      {rated.length >= 3 && (
        <Panel title="Maturity profile">
          <Radar axes={rated.map((r) => ({ label: str(r.item).slice(0, 8), value: numOf(str(r.rating)) }))} max={5} toneName="amber" />
        </Panel>
      )}
    </div>
  );
}

// ── SCORE · weighted rubric + auto aggregate + live spider ───────────────────────
export function ScoreWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("dimensions"));
  const scored = rows.filter((r) => Number.isFinite(numOf(str(r.score))));
  const aggregate = scored.length ? scored.reduce((s, r) => s + numOf(str(r.score)), 0) / scored.length : 0;

  const setRows = (r: Row[]) => {
    const sc = r.filter((x) => Number.isFinite(numOf(str(x.score))));
    const agg = sc.length ? (sc.reduce((s, x) => s + numOf(str(x.score)), 0) / sc.length).toFixed(2) : "";
    f.patch({ dimensions: r, aggregate: agg });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 items-start">
        <div>
          <SectionLabel hint="Justify every score">Scored dimensions</SectionLabel>
          <DataTable
            columns={[
              { key: "dimension", label: "Dimension", required: true, placeholder: "e.g. Specificity" },
              { key: "score", label: "Score (/5)", type: "number", required: true, placeholder: "0–5" },
              { key: "justification", label: "Justification", required: true, placeholder: "Why this score" },
            ]}
            rows={rows}
            onChange={setRows}
            addLabel="Add dimension"
          />
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white">
            <div className="text-[10.5px] font-medium tracking-[0.12em] uppercase text-indigo-100">Aggregate</div>
            <div className="mt-1 flex items-baseline gap-1">
              <div className="text-[36px] font-semibold tabular-nums leading-none">{aggregate.toFixed(2)}</div>
              <div className="text-[16px] text-indigo-200">/ 5</div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-indigo-700/40 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(aggregate / 5) * 100}%` }} />
            </div>
          </div>
          {scored.length >= 3 && (
            <Panel title="Breakdown">
              <Radar axes={scored.map((r) => ({ label: str(r.dimension).split(" ")[0].slice(0, 8), value: numOf(str(r.score)) }))} max={5} toneName="indigo" />
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
