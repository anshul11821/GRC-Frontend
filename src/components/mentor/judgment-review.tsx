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
          {j.answeredOnStep && ` · answered at step ${j.answeredOnStep}`}
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
                      {picked && <Verdict tone="amber">Mentee&rsquo;s choice</Verdict>}
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
            The mentee&rsquo;s reasoning
          </div>
          {/* Their words, on the same highlighter every other mentee entry wears. */}
          <p className="rounded-lg bg-[#fefce8] px-3 py-2 text-[12.5px] leading-relaxed text-slate-800 whitespace-pre-wrap break-words ring-1 ring-[#fde68a]">
            {j.justification || "—"}
          </p>
          {/* The AI's three dimension scores and its feedback used to sit here. They are gone on
              purpose: this panel exists so a human decides whether the mentee defended a position,
              and a machine's 4/4 in front of the reviewer before they have read the reasoning is
              an anchor, not evidence. The same argument already removed the AI grade from the top
              of the card. The learner still sees it on their own screen, marked as machine output. */}
        </div>
      )}

    </div>
  );
}
