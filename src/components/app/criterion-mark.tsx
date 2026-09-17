"use client";

import { createContext, useContext } from "react";
import { criteriaFor } from "@/lib/criterion-map";

/**
 * The checklist's R-numbers, projected onto the working sheet.
 *
 * Not a new form: these are the rule strip's own counters (form 04) — mono, `R1`, met/open — worn by
 * the part of the deliverable that fills them, so the mentee can read "this box is R2" without
 * matching words across the page. Steel while open, because the criterion is the programme's; green
 * once met; mute where no criterion reads the part. Hairline, never dashed (law 4 — the field is
 * already theirs) and never a fill of the field itself: inputs carry their own validation colours
 * and a mark must not compete with them.
 *
 * `step-screen.tsx` provides the checklist state. Outside it — anywhere a workspace is mounted
 * without a checklist — every mark renders nothing.
 */
/** `graded`: the states are the last submission's result, where an unmet row reads "not met". */
export type CriterionState = { verbId: string; texts: string[]; states: boolean[]; graded: boolean };

const Ctx = createContext<CriterionState | null>(null);
export const CriterionProvider = Ctx.Provider;
export const useCriterionState = () => useContext(Ctx);

const chip = "inline-flex items-center gap-1 h-[17px] px-1.5 rounded-[3px] ring-1 font-mono font-medium text-[10px] leading-none tracking-normal normal-case whitespace-nowrap align-middle";
const OPEN = "text-sky-700 bg-sky-50 ring-sky-200";
const MET = "text-emerald-700 bg-emerald-50 ring-emerald-200";
// The checklist's own "not met" colour, so a mark never disagrees with the row it points at.
const FAILED = "text-amber-700 bg-amber-50 ring-amber-200";
const NONE = "text-slate-500 bg-slate-50 ring-slate-200";

/**
 * One mark. Three ways to use it:
 *
 *  - `guide="to"` or `rs={[2, 3]}` — mirrors the checklist: one chip per criterion, in the state
 *    the checklist row is showing (live before a submission, the graded result after one).
 *  - `rs={[1]} done={…} part="2 of 9"` — a *share* of a criterion that several parts fill together.
 *    Mirroring there would say "open" next to finished work, because the criterion only goes met
 *    with the last part; so the chip reports this part, and says it is a part.
 *  - a part the map sends to `[]` — "Rubric only": written by the mentee, read by no criterion.
 */
export function CriterionMark({ guide, rs, done, part, className = "" }: {
  guide?: string;
  rs?: number[];
  done?: boolean;
  part?: string;
  className?: string;
}) {
  const ctx = useCriterionState();
  if (!ctx) return null;
  const list = rs ?? (guide ? criteriaFor(ctx.verbId, guide) : undefined);
  if (!list) return null;
  const text = (r: number) => ctx.texts[r - 1] ?? "";

  if (list.length === 0) {
    return (
      <span className={`${chip} ${NONE} ${className}`} title="Not on the checklist. The rubric that scores the quality of your work reads this.">
        Rubric only
      </span>
    );
  }

  if (done !== undefined) {
    const r = list[0];
    return (
      <span
        className={`${chip} ${done ? MET : OPEN} ${className}`}
        title={`Checklist R${r}: ${text(r)}${part ? ` — this is part ${part}` : ""}`}
        aria-label={`Checklist R${r}, ${part ? `part ${part}, ` : ""}${done ? "done" : "to do"}`}
      >
        R{r}
        {part && !done && <span className="opacity-75">· {part}</span>}
        {done && <span aria-hidden>✓</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {list.map((r) => {
        const met = !!ctx.states[r - 1];
        const word = met ? "met" : ctx.graded ? "not met" : "open";
        return (
          <span
            key={r}
            className={`${chip} ${met ? MET : ctx.graded ? FAILED : OPEN}`}
            title={`Checklist R${r}: ${text(r)} — ${word}`}
            aria-label={`Checklist R${r}, ${word}`}
          >
            R{r}
            {met && <span aria-hidden>✓</span>}
          </span>
        );
      })}
    </span>
  );
}
