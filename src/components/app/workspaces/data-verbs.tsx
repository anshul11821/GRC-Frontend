"use client";

// Data-shaped verbs: Record, Apply, Cross-reference, Identify, Map.
// Each renders an editable, empty-by-default deliverable that writes the same payload.fields keys
// the verb's VERB_FORMS spec defines (so the live checklist + backend Layer-1 still line up).

import { Icon } from "@/components/ui/icon";
import {
  DataTable,
  SectionLabel,
  WsTextArea,
  Panel,
  asRows,
  str,
  fields,
  type WorkspaceProps,
  type Row,
} from "./primitives";

const CLASS = ["Public", "Internal", "Confidential"];

// ── RECORD · validated register table ───────────────────────────────────────────
export function RecordWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("register"));
  return (
    <div className="space-y-3">
      <SectionLabel hint={`${rows.length} row${rows.length === 1 ? "" : "s"}`}>Register entries</SectionLabel>
      <DataTable
        columns={[
          { key: "name", label: "Asset / item", required: true, placeholder: "e.g. Customer database" },
          { key: "type", label: "Type", required: true, placeholder: "e.g. Data store" },
          { key: "owner", label: "Owner (role)", required: true, placeholder: "A role title, not a person" },
          { key: "location", label: "Location", placeholder: "e.g. AWS eu-west-1" },
          { key: "classification", label: "Classification", type: "select", options: CLASS, required: true },
        ]}
        rows={rows}
        onChange={(r) => f.set("register", r)}
        addLabel="Add asset"
      />
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="info" size={12} className="text-slate-400" />
        Owner must be a role title (e.g. &ldquo;Head of Platform&rdquo;), never a department or a person&rsquo;s name.
      </p>
    </div>
  );
}

// ── APPLY · classification scheme + live distribution ───────────────────────────
export function ApplyWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("items"));
  const dist = CLASS.map((c) => ({ c, n: rows.filter((r) => r.classification === c).length }));
  const total = rows.filter((r) => r.classification).length;
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel hint="Every item needs a classification and a rationale">Classified items</SectionLabel>
        <DataTable
          columns={[
            { key: "item", label: "Item", required: true, placeholder: "Asset / data item" },
            { key: "classification", label: "Classification", type: "select", options: CLASS, required: true },
            { key: "rationale", label: "Rationale", required: true, placeholder: "Why this classification?" },
          ]}
          rows={rows}
          onChange={(r) => f.set("items", r)}
          addLabel="Add item"
        />
      </div>
      <Panel title="Distribution">
        <div className="space-y-3">
          {dist.map(({ c, n }) => {
            const pct = total ? (n / total) * 100 : 0;
            const bar = c === "Public" ? "bg-emerald-500" : c === "Internal" ? "bg-amber-500" : "bg-rose-500";
            return (
              <div key={c}>
                <div className="flex justify-between text-[11.5px] mb-1">
                  <span className="text-slate-700 font-medium">{c}</span>
                  <span className="text-slate-500 tabular-nums">{n}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">Personal-data items must not land in Public.</p>
      </Panel>
    </div>
  );
}

// ── CROSS-REFERENCE · method + discrepancy table ────────────────────────────────
export function CrossRefWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("discrepancies"));
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Comparison method</SectionLabel>
        <WsTextArea
          value={str(f.get("method"))}
          onChange={(v) => f.set("method", v)}
          rows={2}
          placeholder="How did you compare the two sources? What did you join on?"
          footer={<><Icon name="info" size={11} />Describe the comparison approach before submitting.</>}
        />
      </div>
      <div>
        <SectionLabel hint={`${rows.length} logged`}>Discrepancies</SectionLabel>
        <DataTable
          columns={[
            { key: "item", label: "Item", required: true, placeholder: "What differs" },
            { key: "sourceA", label: "Source A", placeholder: "Value in source A" },
            { key: "sourceB", label: "Source B", placeholder: "Value in source B" },
            {
              key: "discrepancyClass",
              label: "Discrepancy class",
              type: "select",
              options: ["Missing in A", "Missing in B", "Owner mismatch", "Duplicate entry", "Schema drift"],
              required: true,
            },
          ]}
          rows={rows}
          onChange={(r) => f.set("discrepancies", r)}
          addLabel="Add discrepancy"
        />
      </div>
    </div>
  );
}

// ── IDENTIFY · flag → action + accountable role ─────────────────────────────────
export function IdentifyWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("flags"));
  return (
    <div className="space-y-3">
      <SectionLabel hint={`${rows.length} flagged`}>Flagged items</SectionLabel>
      <DataTable
        columns={[
          { key: "item", label: "Item", required: true, placeholder: "The item you're flagging" },
          { key: "proposedAction", label: "Proposed action", required: true, placeholder: "One-line action" },
          { key: "accountableRole", label: "Accountable role", required: true, placeholder: "A role title" },
        ]}
        rows={rows}
        onChange={(r) => f.set("flags", r)}
        addLabel="Add flag"
      />
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="flag" size={12} className="text-slate-400" />
        Every flag needs a proposed action and a named accountable role.
      </p>
    </div>
  );
}

// ── MAP · cross-domain links with rationale ─────────────────────────────────────
export function MapWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const rows = asRows(f.get("mappings")) as Row[];
  return (
    <div className="space-y-3">
      <SectionLabel hint={`${rows.length} link${rows.length === 1 ? "" : "s"}`}>Mappings · domain A ↔ domain B</SectionLabel>
      <DataTable
        columns={[
          { key: "itemA", label: "Item (domain A)", required: true, placeholder: "e.g. a regulation / driver" },
          { key: "itemB", label: "Item (domain B)", required: true, placeholder: "e.g. an asset / control" },
          { key: "rationale", label: "Rationale", required: true, placeholder: "Why these are linked" },
        ]}
        rows={rows}
        onChange={(r) => f.set("mappings", r)}
        addLabel="Add link"
      />
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="grid" size={12} className="text-slate-400" />
        Every populated link needs a rationale; unmatched items should be explained in your notes.
      </p>
    </div>
  );
}
