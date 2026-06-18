"use client";

// Writing-shaped verbs: Review, Draft, Compile, Brief, Document.
// Editable, empty-by-default; write the same payload.fields keys the verb's VERB_FORMS spec defines.

import { Icon } from "@/components/ui/icon";
import {
  SectionLabel,
  WsTextArea,
  WsInput,
  RepeaterList,
  Segmented,
  asList,
  str,
  fields,
  type WorkspaceProps,
} from "./primitives";

// ── REVIEW · cover note + prior-feedback status ─────────────────────────────────
export function ReviewWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const cover = str(f.get("coverNote"));
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel hint={`${cover.length} chars · min 30`}>Cover note</SectionLabel>
        <WsTextArea
          value={cover}
          onChange={(v) => f.set("coverNote", v)}
          rows={4}
          placeholder="Summarise what changed since the last revision and any open questions for the mentor."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <SectionLabel>Prior feedback addressed?</SectionLabel>
          <Segmented
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
              { value: "N/A — first review", label: "First review" },
            ]}
            value={str(f.get("priorFeedbackAddressed"))}
            onChange={(v) => f.set("priorFeedbackAddressed", v)}
          />
        </div>
        <div>
          <SectionLabel>Revision number</SectionLabel>
          <WsInput type="number" value={str(f.get("revisionNo"))} onChange={(v) => f.set("revisionNo", v)} placeholder="e.g. 2" />
        </div>
      </div>
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="eye" size={12} className="text-slate-400" />
        Submission limit is 3 revisions per artefact — make the cover note easy to review.
      </p>
    </div>
  );
}

// ── DRAFT · titled document + sections + cited standards ─────────────────────────
export function DraftWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const body = str(f.get("sections"));
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Document title</SectionLabel>
        <WsInput value={str(f.get("docTitle"))} onChange={(v) => f.set("docTitle", v)} placeholder="e.g. Information Classification Policy" />
      </div>
      <div>
        <SectionLabel hint={`${body.split(/\s+/).filter(Boolean).length} words`}>Body / sections</SectionLabel>
        <WsTextArea
          value={body}
          onChange={(v) => f.set("sections", v)}
          rows={10}
          placeholder="Draft the document. Use clear headings for every required section — none may be empty."
          footer={<><Icon name="info" size={11} />Define any acronyms on first use; cite standards where claims are made.</>}
        />
      </div>
      <div>
        <SectionLabel>Standards cited</SectionLabel>
        <RepeaterList items={asList(f.get("standardsCited"))} onChange={(v) => f.set("standardsCited", v)} placeholder="e.g. ISO 27001 A.5.12" addLabel="Add citation" />
      </div>
    </div>
  );
}

// ── COMPILE · assembled sections + executive summary ────────────────────────────
export function CompileWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const summary = str(f.get("executiveSummary"));
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Included sections</SectionLabel>
        <RepeaterList items={asList(f.get("sections"))} onChange={(v) => f.set("sections", v)} placeholder="A section / source artefact title" addLabel="Add section" />
      </div>
      <div>
        <SectionLabel hint={`${summary.length} chars`}>Executive summary</SectionLabel>
        <WsTextArea
          value={summary}
          onChange={(v) => f.set("executiveSummary", v)}
          rows={5}
          placeholder="The headline findings, decisions, and highest risks — readable on its own."
        />
      </div>
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="cube" size={12} className="text-slate-400" />
        Every required section present, executive summary non-empty, no numeric conflicts between sources.
      </p>
    </div>
  );
}

// ── BRIEF · plain-language update with one explicit ask ──────────────────────────
export function BriefWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const msg = str(f.get("keyMessage"));
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Format</SectionLabel>
        <Segmented
          options={[
            { value: "One-page document", label: "One-page document" },
            { value: "Short slide deck", label: "Short slide deck (≤5)" },
          ]}
          value={str(f.get("format"))}
          onChange={(v) => f.set("format", v)}
        />
      </div>
      <div>
        <SectionLabel>Audience</SectionLabel>
        <WsInput value={str(f.get("audience"))} onChange={(v) => f.set("audience", v)} placeholder="Be specific: who is reading this?" />
      </div>
      <div>
        <SectionLabel hint={`${msg.split(/\s+/).filter(Boolean).length} words`}>Key message (plain language)</SectionLabel>
        <WsTextArea
          value={msg}
          onChange={(v) => f.set("keyMessage", v)}
          rows={6}
          placeholder="What is changing, why, and what the audience will see. No undefined jargon."
        />
      </div>
      <div>
        <SectionLabel>Explicit ask</SectionLabel>
        <WsTextArea value={str(f.get("ask"))} onChange={(v) => f.set("ask", v)} rows={2} placeholder="One clear action — what should the audience do?" />
      </div>
    </div>
  );
}

// ── DOCUMENT · sectioned write-up + cross-references ────────────────────────────
export function DocumentWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Write-up</SectionLabel>
        <WsTextArea
          value={str(f.get("sections"))}
          onChange={(v) => f.set("sections", v)}
          rows={9}
          placeholder="Context · Decision · Rationale · Lessons learned. Prefer third person and active voice."
          footer={<><Icon name="file" size={11} />Use the Process / Lessons-Learned structure; keep headings explicit.</>}
        />
      </div>
      <div>
        <SectionLabel>Cross-references</SectionLabel>
        <RepeaterList items={asList(f.get("crossReferences"))} onChange={(v) => f.set("crossReferences", v)} placeholder="An upstream artefact this references" addLabel="Add cross-reference" />
      </div>
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="link" size={12} className="text-slate-400" />
        All sections complete, cross-references valid, no broken links.
      </p>
    </div>
  );
}
