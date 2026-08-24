"use client";

// The judgment call, as the reviewer needs it.
//
// This is the one part of the card where the mentee was not asked for a correct answer. Two or
// three of the four options are genuinely defensible, so the review question is not "did they
// pick the one I would have picked" — it is whether the reasoning they wrote would survive being
// read back to them by someone the decision affected.
//
// The reference position is what the practitioner who authored the dilemma wrote about it. It is
// the closest thing to a second opinion in the room, and it is deliberately advisory: it names
// what a good answer notices, not which option is right.

import { Icon } from "@/components/ui/icon";
import type { JudgmentReview } from "@/lib/mentor";

function Verdict({ tone, children }: { tone: "green" | "amber" | "slate"; children: React.ReactNode }) {
  const cls = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 h-[19px] px-2 rounded-full ring-1 text-[10.5px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

/** The compact read, shown inline under the submission so a reviewer cannot miss it. */
export function JudgmentSummary({ j, onOpen }: { j: JudgmentReview; onOpen: () => void }) {
  if (!j.chose) {
    return (
      <div className="mt-5 rounded-[10px] border border-[#e6eaf0] bg-[#fafbfc] px-4 py-3">
        <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500">Judgment call</div>
        <p className="mt-1 text-[12.5px] text-slate-500">
          This step carries a judgment call, but this revision did not answer one.
        </p>
      </div>
    );
  }
  const chosen = j.options.find((o) => o.key === j.chose);
  return (
    <div className="mt-5 rounded-[10px] border border-violet-200 bg-violet-50/40">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-violet-200/70 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="bullseye" size={13} className="text-violet-600 shrink-0" />
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-violet-800">
            Judgment call
          </span>
          <span className="text-[11px] text-slate-500 truncate">{j.competenceLabel}</span>
        </div>
        <button
          onClick={onOpen}
          className="shrink-0 text-[11.5px] font-medium text-violet-700 hover:text-violet-900 underline underline-offset-2"
        >
          Reference position
        </button>
      </div>

      <div className="px-4 py-3">
        <p className="text-[12px] text-slate-500 tracking-tight">{j.question}</p>
        <div className="mt-2 flex items-start gap-2.5">
          <span className="shrink-0 mt-px w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10.5px] font-semibold uppercase">
            {j.chose}
          </span>
          <p className="text-[12.5px] text-slate-800 leading-relaxed">{chosen?.text ?? "—"}</p>
        </div>

        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          <Verdict tone={j.choseDefensible ? "green" : "amber"}>
            {j.choseDefensible ? "Defensible option" : "Library argues against this option"}
          </Verdict>
          <Verdict tone={j.aiPassed ? "green" : "amber"}>
            Reasoning {j.aiScore.toFixed(1)} / 4
          </Verdict>
          {j.gradedBy === "fallback" && <Verdict tone="slate">Model unreachable — ungraded</Verdict>}
        </div>

        <div className="mt-3">
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-1">
            Their reasoning
          </div>
          <p className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
            {j.justification || "—"}
          </p>
        </div>

        {/* An indefensible option is not, by itself, grounds to return. Say so where the reviewer
            is deciding, not in a document they read once during onboarding. */}
        {!j.choseDefensible && (
          <p className="mt-3 text-[11.5px] text-slate-500 leading-relaxed">
            The option is one the library argues against — but the grade here is the reasoning. A
            hard case argued honestly beats the safe option asserted. Read the basis under
            Reference position before you decide.
          </p>
        )}
      </div>
    </div>
  );
}

/** The full panel: the dilemma, every option with the library's basis, and the AI's read. */
export function JudgmentPanel({ j }: { j: JudgmentReview }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500">
          {j.name}
        </div>
        <div className="mt-0.5 text-[11.5px] text-slate-400">
          {j.slot} · competence {j.competence} — {j.competenceLabel}
        </div>
        <p className="mt-2.5 text-[13px] text-slate-800 leading-relaxed">{j.situation}</p>
        <p className="mt-2 text-[13px] font-semibold text-slate-900">{j.question}</p>
      </div>

      <div>
        <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-2">
          The options, and why
        </div>
        <div className="space-y-2">
          {j.options.map((o) => {
            const picked = o.key === j.chose;
            return (
              <div
                key={o.key}
                className={`rounded-[10px] border px-3.5 py-3 ${
                  picked ? "border-violet-300 bg-violet-50/50" : "border-[#e6eaf0] bg-white"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`shrink-0 mt-px w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-semibold uppercase ${
                      picked ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {o.key}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Verdict tone={o.defensible ? "green" : "slate"}>
                        {o.defensible ? "Defensible" : "Not defensible"}
                      </Verdict>
                      {picked && <Verdict tone="amber">Their choice</Verdict>}
                    </div>
                    <p className="mt-1.5 text-[12.5px] text-slate-800 leading-relaxed">{o.text}</p>
                    <p className="mt-1.5 text-[11.5px] text-slate-500 leading-relaxed">{o.basis}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {j.referencePosition && (
        <div className="rounded-[10px] border border-[#e6eaf0] bg-[#fafbfc] px-4 py-3">
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500">
            Reference position
          </div>
          <p className="mt-1.5 text-[12.5px] text-slate-700 leading-relaxed">{j.referencePosition}</p>
          {j.hardestWhen && (
            <p className="mt-2 text-[11.5px] text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-600">Hardest when:</span> {j.hardestWhen}
            </p>
          )}
          <p className="mt-2.5 text-[11px] text-slate-400 leading-relaxed">
            Authored guidance, not a mark scheme. You are the authority on whether this mentee
            defended their position.
          </p>
        </div>
      )}

      {j.chose && (
        <div>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-2">
            Their reasoning, and how it graded
          </div>
          <p className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
            {j.justification || "—"}
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {j.aiDimensions.map((d) => (
              <div key={d.label} className="rounded-[10px] border border-[#e6eaf0] px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] text-slate-500">{d.label}</span>
                  <span className="text-[12px] font-semibold text-slate-800 tabular-nums">
                    {d.score.toFixed(0)}/4
                  </span>
                </div>
                {d.hint && <p className="mt-1 text-[10.5px] text-slate-500 leading-snug">{d.hint}</p>}
              </div>
            ))}
          </div>
          {j.aiFeedback && (
            <p className="mt-3 text-[11.5px] text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-600">AI mentor:</span> {j.aiFeedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
