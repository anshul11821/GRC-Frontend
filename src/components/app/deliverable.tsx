"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Gloss, TermsUsed } from "@/components/app/glossary";

/**
 * The two pieces that make a step read as *the deliverable screen*, shared by the learner who
 * fills it in and the mentor who reviews it.
 *
 * They were markup inside the learner's step page. The mentor's Review Desk needs the same screen
 * with different buttons under it, and rebuilding it there would have produced a second, drifting
 * description of the same work — which is the whole reason the desk mounts the learner's own
 * components rather than copies of them.
 *
 * Presentation only. Everything stateful — autosave, submit, attempts, the mentor's decision —
 * stays with whichever page owns it, because those are the parts that genuinely differ.
 */

/** The brief: what this step is for, and what doing it involves. Collapsible to reclaim the page. */
export function StepBrief({
  objective,
  whatToDo,
  glossTexts = [],
  objectiveRef,
  whatToDoRef,
  defaultOpen = true,
  // Both panels are written in the second person for the learner who has to act on them. A
  // reviewer is reading someone else's brief, so the headings say whose it is.
  objectiveTitle = "Objective",
  listTitle = "What to do",
}: {
  objective?: string;
  whatToDo?: string[];
  /** Extra prose whose glossary terms must also be defined on the page. */
  glossTexts?: string[];
  objectiveRef?: React.Ref<HTMLDivElement>;
  whatToDoRef?: React.Ref<HTMLDivElement>;
  defaultOpen?: boolean;
  objectiveTitle?: string;
  listTitle?: string;
}) {
  const [shown, setShown] = useState(defaultOpen);
  if (!objective && !(whatToDo && whatToDo.length)) return null;

  return (
    <div className="mb-5">
      <button
        onClick={() => setShown((s) => !s)}
        className="w-full flex items-center gap-2 px-1 mb-2 text-left group"
      >
        <Icon name="target" size={14} className="text-indigo-600 shrink-0" />
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500">Brief</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-slate-400 group-hover:text-slate-600">
          {shown ? "Hide" : "Show"}
          <Icon name="chevronDown" size={14} className={`transition-transform ${shown ? "" : "-rotate-90"}`} />
        </span>
      </button>
      {/* grid-rows 0fr→1fr animates the auto height smoothly without measuring it */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {objective && (
              <div
                ref={objectiveRef}
                className="rounded-2xl bg-gradient-to-br from-indigo-50/70 via-indigo-50/40 to-transparent ring-1 ring-indigo-100/80 p-4 flex flex-col justify-center"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="target" size={14} className="text-indigo-600" />
                  <h2 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-indigo-700">
                    {objectiveTitle}
                  </h2>
                </div>
                <p
                  className="text-[13px] text-slate-700 leading-relaxed tracking-tight"
                  style={{ textWrap: "pretty" }}
                >
                  <Gloss>{objective}</Gloss>
                </p>
              </div>
            )}
            {whatToDo && whatToDo.length > 0 && (
              <div
                ref={whatToDoRef}
                className="rounded-2xl bg-gradient-to-br from-emerald-50/60 via-emerald-50/30 to-transparent ring-1 ring-emerald-100/80 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="list" size={14} className="text-emerald-700" />
                  <h2 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-emerald-700">
                    {listTitle}
                  </h2>
                </div>
                <ol className="space-y-2.5">
                  {whatToDo.map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10.5px] font-semibold flex items-center justify-center mt-0.5 tabular-nums">
                        {i + 1}
                      </span>
                      <span
                        className="text-[12.5px] text-slate-700 leading-relaxed tracking-tight"
                        style={{ textWrap: "pretty" }}
                      >
                        <Gloss>{step}</Gloss>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
          {/* Every term this step's brief uses, defined in full — hover is opt-in, this isn't. */}
          <TermsUsed
            texts={[objective ?? "", ...(whatToDo ?? []), ...glossTexts]}
            className="mt-4"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The working sheet (form 06). The folded corner is the most valuable cue in the form language:
 * one glance answers "is this mine?".
 *
 * On a mentor's screen it answers the same question truthfully in the other direction — the corner
 * marks the sheet the *mentee* could edit, and the mentor is reading it. That is why the mentor's
 * copy still wears it: it is the learner's sheet, replayed.
 *
 * A clip-path plus drop-shadow rather than a ring, because a ring cannot be notched.
 */
export function WorkingSheet({
  title,
  subtitle,
  action,
  sheetRef,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  sheetRef?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={sheetRef}
      className="relative [filter:drop-shadow(0_1px_0_rgb(226,232,240))_drop-shadow(0_6px_16px_rgba(15,23,42,0.10))]"
    >
      <div className="bg-white p-4 sm:p-5 [clip-path:polygon(0_0,calc(100%-28px)_0,100%_28px,100%_100%,0_100%)]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">{title}</h2>
            {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
      {/* The fold itself — the lit triangle over the notch the clip-path cut. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-7 h-7 bg-slate-100 border-l border-b border-slate-200 [clip-path:polygon(100%_0,100%_100%,0_100%)]"
      />
    </div>
  );
}
