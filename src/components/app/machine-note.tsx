/**
 * Machine-generated output, marked as such.
 *
 * The programme already draws a hard line between what a model produced and what a person
 * decided: an AI grade is provisional and a mentor's decision at a gate is authoritative
 * (see services/mentor_review.py and docs/MENTOR_REVIEW.md). Until now that line existed only
 * in the copy — an AI rubric and a mentor's verdict rendered as the same kind of card, so a
 * learner had no way to read which one was binding without parsing the words.
 *
 * The form language names the rule (grc101-forms.css, law 3): violet + dotted means generated,
 * and machine output may never take a header band, a signature, or a human timestamp. The
 * dotted outline over a transparent fill is doing the work — it is deliberately the least
 * substantial object on the page, because it has no ground of its own.
 *
 * The counterpart is the sealed decision in mentor-decision.tsx: a solid band, a signature rule,
 * and the one place a human timestamp is allowed.
 */

/** The provenance tag. Six dots + a mono caption — no icon, so it cannot be mistaken for a status. */
export function MachineTag({
  label = "Generated · not authored · not a mentor decision",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[9.5px] font-medium tracking-[0.11em] uppercase text-violet-600 ${className}`}
    >
      <span aria-hidden className="inline-grid grid-cols-3 gap-[2px]">
        {/* ponytail: six literal dots, not a loop with a key — it is a texture, not data. */}
        <span className="w-[3px] h-[3px] rounded-full bg-violet-400" />
        <span className="w-[3px] h-[3px] rounded-full bg-violet-400" />
        <span className="w-[3px] h-[3px] rounded-full bg-violet-400" />
        <span className="w-[3px] h-[3px] rounded-full bg-violet-400" />
        <span className="w-[3px] h-[3px] rounded-full bg-violet-400" />
        <span className="w-[3px] h-[3px] rounded-full bg-violet-400" />
      </span>
      {label}
    </div>
  );
}

/** A block of model output: dotted violet outline, no fill, tagged at the top. */
export function MachineNote({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border-2 border-dotted border-violet-300 bg-transparent p-4 ${className}`}>
      <MachineTag label={label} className="mb-3" />
      {children}
    </div>
  );
}
