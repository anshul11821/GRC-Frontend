// The action verb under review.
//
// A reviewer opening "Record the asset register" is judging a *Record*: mandatory fields, schema,
// owner-is-a-role. The same submission judged as a *Draft* fails for the wrong reasons. The verb
// was on the learner's desk and nowhere on the mentor's card until now.
//
// No colour: `VerbMeta.color` is a Tailwind palette name and the console is deliberately neutral,
// so a slate chip carries it without a static class map to keep in step with 24 verbs.
import { VERBS, GATE_VERBS } from "@/lib/verbs";

export const verbMeta = (verbId: string) => VERBS[verbId] ?? GATE_VERBS[verbId];

export function VerbBadge({ verbId, className = "" }: { verbId: string; className?: string }) {
  const verb = verbMeta(verbId);
  if (!verb) return null;
  return (
    <span
      title={verb.when}
      className={`shrink-0 inline-flex items-center gap-1.5 h-[19px] pl-1.5 pr-2 rounded bg-slate-100 text-slate-700 text-[10.5px] font-semibold ${className}`}
    >
      <span className="font-mono text-[9.5px] text-slate-400">{verb.code}</span>
      {verb.label}
    </span>
  );
}
