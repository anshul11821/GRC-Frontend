"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { DraggablePanel } from "@/components/ui/draggable-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { DVerb } from "@/components/ui/dverb";
import { VERB_TONES } from "@/lib/tones";
import { TASK_META } from "@/lib/taskmeta";
import { isGateVerb } from "@/lib/verbs";
import { CONTROLS_BY_TASK, type Control } from "@/lib/controls";
import type { LearningTask } from "@/lib/learnings";
import { useDeskLearnings } from "@/components/app/desk-context";
import { GuidedTour, type TourStep } from "@/components/app/guided-tour";
import { dueChip, fmtDue, type ScheduleItem } from "@/lib/schedule";

export default function TaskOverview() {
  const { taskCode } = useParams<{ taskCode: string }>();
  const meta = TASK_META[taskCode];
  const reg = CONTROLS_BY_TASK[taskCode];
  const { learnings, loading, scheduleByActivity } = useDeskLearnings();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [tourStep, setTourStep] = useState(-1); // -1 = closed
  const objectiveRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLButtonElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLAnchorElement>(null);
  const task: LearningTask | null = useMemo(() => {
    if (!learnings) return null;
    for (const o of learnings.orgs) for (const p of o.projects) {
      const t = p.tasks.find((x) => x.code === taskCode);
      if (t) return t;
    }
    return null;
  }, [learnings, taskCode]);

  // Task target = the latest planned day among its steps; status rolls up from the steps.
  const taskDue = useMemo(() => {
    const sched = (task?.steps ?? [])
      .map((s) => scheduleByActivity.get(s.id))
      .filter((x): x is ScheduleItem => !!x);
    if (!sched.length) return null;
    const latest = sched.reduce((a, b) => (a.date >= b.date ? a : b));
    const status = sched.every((s) => s.status === "done")
      ? "done"
      : sched.some((s) => s.status === "overdue")
        ? "overdue"
        : "upcoming";
    return { date: latest.date, status } as const;
  }, [task, scheduleByActivity]);

  const byStandard = useMemo(() => {
    const m = new Map<string, Control[]>();
    for (const c of reg?.controls ?? []) m.set(c.standard, [...(m.get(c.standard) ?? []), c]);
    return [...m];
  }, [reg]);

  const tone = meta ? VERB_TONES[meta.standardTone] ?? VERB_TONES.indigo : VERB_TONES.indigo;
  const nextStep = task?.steps.find((s) => s.status !== "complete") ?? task?.steps[0];

  if (loading) {
    return (
      <div className="max-w-[920px] mx-auto px-5 sm:px-8 py-6 sm:py-7 space-y-5 animate-pulse">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-2/3 max-w-md" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Guided walkthrough of the task brief, in reading order; skips anything this task doesn't have.
  const tourSteps: TourStep[] = [];
  if (meta?.objective || meta?.description) tourSteps.push({
    title: "Read the objective",
    body: "What this whole task has to achieve, and the final deliverable it builds toward. Everything below serves this.",
    icon: "target",
    getEl: () => objectiveRef.current,
  });
  if (reg && reg.controls.length > 0) tourSteps.push({
    title: "Check the control references",
    body: `The ${reg.controls.length} clauses and controls this task is graded against. Open it and read them before you start — your work should trace back to each one.`,
    icon: "shield",
    getEl: () => controlsRef.current,
  });
  tourSteps.push({
    title: "Work through the actions",
    body: "The task breaks into these steps, each one an action verb. Do them in order — the earlier ones produce what the later ones need.",
    icon: "list",
    getEl: () => actionsRef.current,
  });
  if (nextStep) tourSteps.push({
    title: "Start when you're ready",
    body: "This drops you into the working desk at your next unfinished step. Each step has its own Guide button if you need it there too.",
    icon: "play",
    getEl: () => startRef.current,
  });

  return (
    <div className="max-w-[920px] mx-auto px-5 sm:px-8 py-6 sm:py-7 space-y-5">
      <GuidedTour steps={tourSteps} step={tourStep} onStep={setTourStep} onClose={() => setTourStep(-1)} />

      {/* header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          {meta ? <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 bg-indigo-50 text-indigo-600 ring-indigo-100"><Icon name="layers" size={12} /> {meta.methodCategory}</span> : <span />}
          {/* guide trigger — mirrors the one on each activity; blinks thrice to hint it exists */}
          <button
            key={taskCode}
            onClick={() => setTourStep(0)}
            className="guide-blink focus-ring shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-indigo-50 ring-1 ring-indigo-200/70 text-indigo-700 hover:bg-indigo-100 text-[12.5px] font-medium tracking-tight transition-colors cursor-pointer"
          >
            <Icon name="help" size={14} /> Guide
          </button>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center justify-center px-2 h-7 rounded-md bg-slate-900 text-white text-[12px] font-mono font-semibold">{taskCode}</span>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-slate-900">{meta?.name ?? task?.title ?? taskCode}</h1>
          {meta && <span className={`inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}><Icon name="shield" size={12} /> {meta.standardLabel}</span>}
          {meta?.badge && (
            <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 bg-amber-50 text-amber-700 ring-amber-100" title="Badge earned on completion">
              <Icon name="ribbon" size={12} /> {meta.badge}
            </span>
          )}
          {taskDue && (() => { const c = dueChip(taskDue); return (
            <span className={`inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 ${c.cls}`} title={`Target completion — ${fmtDue(taskDue.date)}`}>
              <Icon name="calendar" size={12} /> {c.text}
            </span>
          ); })()}
        </div>
      </div>

      {/* objective */}
      {(meta?.objective || meta?.description) && (
        <div ref={objectiveRef}>
        <Card>
          <h2 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-2">Objective</h2>
          <p className="text-[13.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{meta?.objective ?? meta?.description}</p>
          {meta?.deliverable && (
            <div className="mt-4 rounded-xl bg-indigo-50/40 ring-1 ring-indigo-100 p-3.5">
              <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-indigo-600 mb-1">Final deliverable</div>
              <p className="text-[12.5px] text-slate-700 tracking-tight" style={{ textWrap: "pretty" }}>{meta.deliverable}</p>
            </div>
          )}
        </Card>
        </div>
      )}

      {/* controls register — opens in a drawer */}
      {reg && reg.controls.length > 0 && (
        <button
          ref={controlsRef}
          onClick={() => setControlsOpen(true)}
          className="focus-ring w-full flex items-center gap-3 text-left rounded-xl ring-1 ring-slate-200/70 bg-white hover:bg-slate-50 px-3.5 py-3 transition-colors group"
        >
          <span className="w-9 h-9 rounded-lg bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Icon name="shield" size={16} /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-slate-900 tracking-tight">Control references</span>
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold tabular-nums">{reg.controls.length}</span>
            </span>
            <span className="block text-[12px] text-slate-500 tracking-tight mt-0.5" style={{ textWrap: "pretty" }}>The clauses and controls this task is graded against — read them before you start.</span>
          </span>
          <Icon name="arrowRight" size={15} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
        </button>
      )}
      <DraggablePanel open={controlsOpen} onClose={() => setControlsOpen(false)} title="Control references" eyebrow={meta?.standardLabel}>
        <p className="text-[12.5px] text-slate-500 leading-relaxed tracking-tight mb-4" style={{ textWrap: "pretty" }}>
          The clauses and controls this task is graded against. Your deliverable should trace back to each one.
        </p>
        <div className="space-y-4">
          {byStandard.map(([standard, controls]) => {
            const tone = VERB_TONES[controls[0].tone] ?? VERB_TONES.indigo;
            return (
              <div key={standard}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                  <span className="text-[11.5px] font-semibold text-slate-700 tracking-tight">{standard}</span>
                  <span className="h-px flex-1 bg-slate-200/60" />
                </div>
                <div className="space-y-1.5">
                  {controls.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50/50 ring-1 ring-slate-200/50 p-3">
                      <span className={`font-mono text-[10.5px] font-semibold rounded px-1.5 py-1 shrink-0 whitespace-nowrap ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>{c.num}</span>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium text-slate-900 tracking-tight">{c.name}</div>
                        <div className="text-[11.5px] text-slate-500 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>{c.purpose}</div>
                        <div className="mt-1 text-[10.5px] uppercase tracking-[0.08em] text-slate-400">{c.domain}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DraggablePanel>

      {/* actions / verbs */}
      <div ref={actionsRef}>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Actions</h2>
          {nextStep && (
            <Link ref={startRef} href={`/app/desk/${nextStep.id}`} className="focus-ring inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 text-white text-[12.5px] font-medium hover:bg-indigo-700 transition-colors no-underline shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
              <Icon name="play" size={13} /> {task?.done ? "Continue" : "Start task"}
            </Link>
          )}
        </div>
        <div className="space-y-1.5">
          {task?.steps.map((s) => {
            const done = s.status === "complete";
            const gate = isGateVerb(s.verb);
            const sd = scheduleByActivity.get(s.id);
            return (
              <Link key={s.id} href={`/app/desk/${s.id}`} className={`focus-ring flex items-center gap-3 px-3 py-2.5 rounded-xl ring-1 no-underline transition-all duration-200 group ${gate ? "ring-violet-200/70 bg-violet-50/40 hover:bg-violet-50" : "ring-slate-200/60 bg-white hover:bg-slate-50 hover:ring-indigo-200/70"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ring-1 shrink-0 ${done ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : gate ? "bg-violet-50 text-violet-600 ring-violet-100" : s.status === "in-progress" ? "bg-indigo-50 text-indigo-600 ring-indigo-100" : "bg-slate-50 text-slate-300 ring-slate-200/60"}`}>
                  <Icon name={done ? "check" : gate ? (s.verb === "rua" ? "shield" : "globe") : "minus"} size={11} strokeWidth={done ? 3 : 2} />
                </span>
                <span className="font-mono text-[10.5px] text-slate-400 w-7 shrink-0">{s.code}</span>
                <DVerb verbId={s.verb} />
                <span className="text-[12.5px] text-slate-700 tracking-tight truncate flex-1">{s.title}</span>
                {gate && <span className="inline-flex items-center h-[16px] px-1.5 rounded bg-violet-50 ring-1 ring-violet-200 text-violet-600 text-[9px] font-semibold tracking-[0.08em] shrink-0">{s.verb === "rua" ? "RUA" : "RESEARCH"}</span>}
                {sd && !done && (() => { const c = dueChip(sd); return (
                  <span className={`hidden sm:inline-flex items-center h-[16px] px-1.5 rounded text-[9.5px] font-medium ring-1 shrink-0 ${c.cls}`} title={fmtDue(sd.date)}>{c.text}</span>
                ); })()}
                <Icon name="arrowRight" size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
              </Link>
            );
          })}
        </div>
      </Card>
      </div>
    </div>
  );
}
