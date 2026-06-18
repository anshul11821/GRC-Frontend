"use client";

// Interaction verbs — in v2 these had live role-agent chat panes / auto-reply threads. Per the
// approved plan those chatbots are removed: each is reduced to a static, structured form that keeps
// the rich field shape (interview guide, prepared questions, decision capture, agenda + slots) but
// has no live conversation, send box, or auto-reply. Write the verb's VERB_FORMS payload keys.

import { Icon } from "@/components/ui/icon";
import {
  SectionLabel,
  WsTextArea,
  WsInput,
  RepeaterList,
  DataTable,
  Segmented,
  asList,
  asRows,
  str,
  fields,
  type WorkspaceProps,
  type Tone,
} from "./primitives";

// ── REQUEST · outreach form (no reply thread) ───────────────────────────────────
export function RequestWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const subject = str(f.get("subject"));
  const over = subject.length > 80;
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>To · named role</SectionLabel>
        <WsInput value={str(f.get("to"))} onChange={(v) => f.set("to", v)} placeholder="e.g. IT Operations Lead" />
      </div>
      <div>
        <SectionLabel hint={<span className={over ? "text-rose-600 font-medium" : undefined}>{subject.length} / 80</span>}>Subject</SectionLabel>
        <input
          value={subject}
          onChange={(e) => f.set("subject", e.target.value)}
          placeholder="A tight, specific subject line"
          className={`w-full h-10 px-3 rounded-lg bg-white text-[13.5px] text-slate-900 placeholder:text-slate-400 ring-1 focus:outline-none focus:ring-2 transition-shadow ${
            over ? "ring-rose-300 focus:ring-rose-500/40" : "ring-slate-200/80 focus:ring-indigo-500/60"
          }`}
        />
      </div>
      <div>
        <SectionLabel>Purpose</SectionLabel>
        <WsTextArea value={str(f.get("purpose"))} onChange={(v) => f.set("purpose", v)} rows={3} placeholder="Why you need this and what it unblocks." />
      </div>
      <div>
        <SectionLabel hint={`${asList(f.get("items")).filter((i) => i.trim()).length} of min 3`}>Requested items</SectionLabel>
        <RepeaterList items={asList(f.get("items"))} onChange={(v) => f.set("items", v)} placeholder="A specific item you're requesting" addLabel="Add item" minRows={3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <SectionLabel>Proposed deadline</SectionLabel>
          <WsInput type="date" value={str(f.get("deadline"))} onChange={(v) => f.set("deadline", v)} />
        </div>
        <div>
          <SectionLabel>Priority</SectionLabel>
          <Segmented
            options={[
              { value: "Low", label: "Low" },
              { value: "Medium", label: "Medium" },
              { value: "High", label: "High" },
            ]}
            value={str(f.get("priority"))}
            onChange={(v) => f.set("priority", v)}
          />
        </div>
      </div>
    </div>
  );
}

// ── CONDUCT · structured walkthrough guide (no chat) ────────────────────────────
export function ConductWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const guide = asRows(f.get("guide"));
  const answered = guide.filter((g) => str(g.answer).trim()).length;
  const total = guide.filter((g) => str(g.question).trim()).length;

  const setGuide = (rows: typeof guide) => {
    const a = rows.filter((g) => str(g.answer).trim()).length;
    const t = rows.filter((g) => str(g.question).trim()).length;
    f.patch({ guide: rows, questionsAnswered: t ? `${a} / ${t}` : "" });
  };

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Stakeholder / role interviewed</SectionLabel>
        <WsInput value={str(f.get("stakeholder"))} onChange={(v) => f.set("stakeholder", v)} placeholder="e.g. Process Owner" />
      </div>
      <div>
        <SectionLabel hint={total ? `${answered} / ${total} answered` : "question → answer"}>Walkthrough guide</SectionLabel>
        <DataTable
          columns={[
            { key: "question", label: "Guide question", required: true, placeholder: "What you asked" },
            { key: "answer", label: "Answer captured", placeholder: "Their answer (verbatim or summarised)" },
          ]}
          rows={guide}
          onChange={setGuide}
          addLabel="Add question"
          minRows={3}
        />
      </div>
      <div>
        <SectionLabel>Key findings</SectionLabel>
        <WsTextArea value={str(f.get("findings"))} onChange={(v) => f.set("findings", v)} rows={3} placeholder="The most important things you learned." />
      </div>
      <div>
        <SectionLabel>Closing summary</SectionLabel>
        <WsTextArea value={str(f.get("summary"))} onChange={(v) => f.set("summary", v)} rows={2} placeholder="Key findings, biggest gap, recommended follow-up." />
      </div>
    </div>
  );
}

const NOTE_TYPES = ["Quote", "Summary"];

// ── INTERVIEW · prepared questions + note capture (no live dialogue) ─────────────
export function InterviewWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const prepared = asList(f.get("questions")).filter((q) => q.trim()).length;
  const notes = asRows(f.get("notesPerQuestion"));
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel hint={`${prepared} of min 5`}>Prepared questions</SectionLabel>
        <RepeaterList items={asList(f.get("questions"))} onChange={(v) => f.set("questions", v)} placeholder="An open-ended question" addLabel="Add question" minRows={5} />
      </div>
      <div>
        <SectionLabel hint={`${notes.length} note${notes.length === 1 ? "" : "s"}`}>Note capture</SectionLabel>
        <DataTable
          columns={[
            { key: "type", label: "Type", type: "select", options: NOTE_TYPES, required: true },
            { key: "ref", label: "Attribution (Q#)", placeholder: "e.g. Q2" },
            { key: "note", label: "Note", required: true, placeholder: "Quote (verbatim) or summary" },
            { key: "followup", label: "Follow-up", placeholder: "If the answer was vague" },
          ]}
          rows={notes}
          onChange={(r) => f.set("notesPerQuestion", r)}
          addLabel="Add note"
        />
      </div>
      <div>
        <SectionLabel>Closing summary</SectionLabel>
        <WsTextArea value={str(f.get("summary"))} onChange={(v) => f.set("summary", v)} rows={3} placeholder="Most important insight, biggest open question, what to probe next." />
      </div>
    </div>
  );
}

// ── SCHEDULE · purpose + agenda + time slots (no role-agent reply) ───────────────
export function ScheduleWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Purpose</SectionLabel>
        <WsTextArea value={str(f.get("purpose"))} onChange={(v) => f.set("purpose", v)} rows={2} placeholder="What this session is for." />
      </div>
      <div>
        <SectionLabel>Agenda</SectionLabel>
        <WsTextArea value={str(f.get("agenda"))} onChange={(v) => f.set("agenda", v)} rows={5} placeholder="1. … (10 min)&#10;2. … (15 min)" />
      </div>
      <div>
        <SectionLabel>Proposed time slots</SectionLabel>
        <RepeaterList items={asList(f.get("proposedTimes"))} onChange={(v) => f.set("proposedTimes", v)} placeholder="e.g. Wed 2026-06-03 · 14:00" addLabel="Add slot" />
      </div>
      <div>
        <SectionLabel>Confirmation</SectionLabel>
        <WsInput value={str(f.get("confirmation"))} onChange={(v) => f.set("confirmation", v)} placeholder="Which slot was agreed, and by whom" />
      </div>
    </div>
  );
}

// ── PRESENT · deck + anticipated Q&A + decision (no live presentation) ───────────
export function PresentWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const qa = asRows(f.get("anticipatedQuestions"));
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Deck / artefact link</SectionLabel>
        <WsInput value={str(f.get("deckLink"))} onChange={(v) => f.set("deckLink", v)} placeholder="Link to the deck you'll present" />
      </div>
      <div>
        <SectionLabel hint={`${qa.length} of min 3`}>Anticipated Q&amp;A</SectionLabel>
        <DataTable
          columns={[
            { key: "question", label: "Expected question", required: true, placeholder: "What a senior reviewer will ask" },
            { key: "answer", label: "Prepared answer", required: true, placeholder: "Your prepared answer" },
          ]}
          rows={qa}
          onChange={(r) => f.set("anticipatedQuestions", r)}
          addLabel="Add Q&A"
          minRows={3}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <SectionLabel>Sign-off decision</SectionLabel>
          <Segmented
            options={[
              { value: "Approved", label: "Approved" },
              { value: "Approved with conditions", label: "With conditions" },
              { value: "Rejected", label: "Rejected" },
            ]}
            value={str(f.get("signoffDecision"))}
            onChange={(v) => f.set("signoffDecision", v)}
            toneOf={(v) => (v === "Approved" ? "emerald" : v === "Rejected" ? "rose" : "amber") as Tone}
          />
        </div>
        <div>
          <SectionLabel>Decision date</SectionLabel>
          <WsInput type="date" value={str(f.get("decisionDate"))} onChange={(v) => f.set("decisionDate", v)} />
        </div>
      </div>
    </div>
  );
}

// ── SIGN-OFF · decision capture (no Q&A chat) ───────────────────────────────────
export function SignoffWorkspace(p: WorkspaceProps) {
  const f = fields(p);
  const decision = str(f.get("decision"));
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Decision</SectionLabel>
        <Segmented
          options={[
            { value: "Approved", label: "Approved" },
            { value: "Approved with conditions", label: "Approved with conditions" },
            { value: "Rejected", label: "Rejected" },
          ]}
          value={decision}
          onChange={(v) => f.set("decision", v)}
          toneOf={(v) => (v === "Approved" ? "emerald" : v === "Rejected" ? "rose" : "amber") as Tone}
        />
      </div>
      {decision === "Approved with conditions" && (
        <div>
          <SectionLabel>Conditions</SectionLabel>
          <WsTextArea value={str(f.get("conditions"))} onChange={(v) => f.set("conditions", v)} rows={3} placeholder="The conditions attached to the approval." />
        </div>
      )}
      {decision === "Rejected" && (
        <div>
          <SectionLabel>Revision plan</SectionLabel>
          <WsTextArea value={str(f.get("revisionPlan"))} onChange={(v) => f.set("revisionPlan", v)} rows={3} placeholder="What you'll change before resubmission." />
        </div>
      )}
      <div>
        <SectionLabel>Decision date</SectionLabel>
        <WsInput type="date" value={str(f.get("date"))} onChange={(v) => f.set("date", v)} />
      </div>
      <p className="text-[11.5px] text-slate-500 flex items-center gap-1.5">
        <Icon name="handshake" size={12} className="text-slate-400" />
        Record the decision with a date; capture conditions if approved-with-conditions, or a revision plan if rejected.
      </p>
    </div>
  );
}
