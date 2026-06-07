"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useMotionValue, animate } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, Bar, Ring } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { DVerb } from "@/components/ui/dverb";
import { learningsApi, type Learnings, type LearningOrg } from "@/lib/learnings";
import { catalog, type RubricDimension } from "@/lib/catalog";
import { useCachedQuery } from "@/lib/use-query";
import { BADGES } from "@/lib/badges";
import { LRN_AVATAR } from "@/lib/tones";

const PROGRAM = "grc101";

interface Continue { activityId: string; taskCode: string; taskTitle: string; stepCode: string; verb: string; stepTitle: string }

/** Pick the task to surface: first in-progress, else first not-started. */
function deriveContinue(l: Learnings): Continue | null {
  for (const org of l.orgs) {
    if (org.status === "locked") continue;
    for (const proj of org.projects) {
      const ip = proj.tasks.find((t) => t.status === "in-progress");
      const target = ip ?? proj.tasks.find((t) => t.status === "not-started") ?? proj.tasks[0];
      if (target) {
        const step =
          target.steps.find((s) => s.status === "current" || s.status === "in-progress") ??
          target.steps.find((s) => s.status !== "complete" && s.status !== "locked") ??
          target.steps[0];
        return step ? { activityId: step.id, taskCode: target.code, taskTitle: target.title, stepCode: step.code, verb: step.verb, stepTitle: step.title } : null;
      }
    }
  }
  return null;
}

/** Roll up per-org engagement stats for the dashboard cards. */
function orgStats(o: LearningOrg): { total: number; done: number; pct: number } {
  let total = 0, done = 0;
  o.projects.forEach((p) => p.tasks.forEach((t) => { total++; if (t.status === "complete") done++; }));
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** Counts a number up from 0 on mount (respects reduced motion). */
function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    // setState only happens inside animate's onUpdate callback (not synchronously in the
    // effect body); a 0-duration tween snaps straight to the value when motion is reduced.
    const controls = animate(mv, value, {
      duration: reduce ? 0 : 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [value, decimals, reduce, mv]);
  return <>{display}</>;
}

function Stat({ icon, tone, value, decimals, sub, label }: { icon: IconName; tone: string; value: string | number; decimals?: number; sub?: string; label: string }) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100", emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100", amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${tones[tone]}`}><Icon name={icon} size={19} /></div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900 tabular-nums">{typeof value === "number" ? <CountUp value={value} decimals={decimals} /> : value}</span>
          {sub && <span className="text-[12px] text-slate-400 font-medium">{sub}</span>}
        </div>
        <div className="text-[12px] text-slate-500 tracking-tight truncate">{label}</div>
      </div>
    </Card>
  );
}

/** Pentagon-style radar of the five rubric dimensions (values out of 5). */
function RubricRadar({ dims }: { dims: { label: string; value?: number }[] }) {
  const N = dims.length;
  const size = 232, cx = size / 2, cy = size / 2, R = 74, MAX = 5;
  const angle = (i: number) => (-90 + (360 / N) * i) * (Math.PI / 180);
  const pt = (i: number, radius: number): [number, number] => [cx + radius * Math.cos(angle(i)), cy + radius * Math.sin(angle(i))];
  const poly = (radius: (i: number) => number) => dims.map((_, i) => pt(i, radius(i)).join(",")).join(" ");
  const reduce = useReducedMotion();
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
      {[1, 2, 3, 4, 5].map((lvl) => (
        <polygon key={lvl} points={poly(() => (R * lvl) / MAX)} fill="none" stroke="#EEF2F7" strokeWidth={1} />
      ))}
      {dims.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#EEF2F7" strokeWidth={1} />;
      })}
      <motion.polygon
        points={poly((i) => R * ((dims[i].value ?? 0) / MAX))}
        fill="rgba(99,102,241,0.16)" stroke="#6366F1" strokeWidth={2} strokeLinejoin="round"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={reduce ? false : { scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.12 }}
      />
      {dims.map((d, i) => {
        const [x, y] = pt(i, R * ((d.value ?? 0) / MAX));
        return d.value !== undefined ? (
          <motion.circle key={i} cx={x} cy={y} r={2.6} fill="#6366F1"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.05, duration: 0.25 }}
          />
        ) : null;
      })}
      {dims.map((d, i) => {
        const [x, y] = pt(i, R + 15);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="fill-slate-500" style={{ fontSize: 9.5, fontWeight: 500 }}>
            {d.label.split(" ")[0]}
          </text>
        );
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  // Shared, cached fetches — learnings/progress are reused across pages, so repeat visits are instant.
  const { data: progress, loading: pLoad } = useCachedQuery(`progress:${PROGRAM}`, () => learningsApi.progress(PROGRAM));
  const { data: learnings, loading: lLoad } = useCachedQuery(`learnings:${PROGRAM}`, () => learningsApi.get(PROGRAM));
  const { data: rubricData } = useCachedQuery("rubric", () => catalog.rubric());
  const rubric = rubricData ?? [];
  const loading = (pLoad || lLoad) && !progress && !learnings;

  const first = user?.firstName || "there";
  const cont = learnings ? deriveContinue(learnings) : null;
  const orgs = learnings?.orgs ?? [];

  const rubricScoreMap = new Map<string, number>();
  progress?.rubricScores.forEach((s) => { rubricScoreMap.set(s.id, s.value); rubricScoreMap.set(s.label.toLowerCase(), s.value); });
  const scoreFor = (r: RubricDimension) => rubricScoreMap.get(r.id) ?? rubricScoreMap.get(r.label.toLowerCase());
  const anyRubricScored = (progress?.rubricScores.length ?? 0) > 0;

  const completedTaskCodes = new Set<string>();
  let totalTasks = 0;
  learnings?.orgs.forEach((o) => o.projects.forEach((p) => { totalTasks += p.tasks.length; p.tasks.forEach((t) => { if (t.status === "complete") completedTaskCodes.add(t.code); }); }));
  const completedTasks = completedTaskCodes.size;
  const certPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const earnedBadges = BADGES.filter((b) => b.taskCodes.length > 0 && b.taskCodes.every((c) => completedTaskCodes.has(c)));

  if (loading) {
    return (
      <div className="max-w-[1180px] mx-auto px-6 py-6 space-y-5 animate-pulse">
        <div className="h-[168px] rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <Skeleton className="h-[230px] rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Skeleton className="h-[260px] rounded-2xl" />
              <Skeleton className="h-[260px] rounded-2xl" />
            </div>
          </div>
          <div className="space-y-5">
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[92px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-6 space-y-5">
      {/* Hero / continue */}
      <Reveal>
      <div className="relative overflow-hidden rounded-2xl text-white p-6 md:p-7 shadow-[0_12px_40px_-16px_rgba(79,70,229,0.55)]" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #5b53e8 45%, #7c3aed 100%)" }}>
        <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-indigo-100">{cont ? "Pick up where you left off" : "Welcome aboard"}</span>
            </div>
            <h1 className="text-[24px] md:text-[27px] font-semibold tracking-[-0.02em] leading-tight">Good to see you, {first}.</h1>
            <p className="text-[13.5px] text-indigo-100/90 mt-1 mb-4 tracking-tight max-w-xl">
              {cont ? <>Your next move is <span className="font-medium text-white">{cont.taskCode}</span> — step {cont.stepCode}.</> : <>You&apos;re enrolled in GRC 101. Open your first engagement to begin.</>}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={cont ? `/app/desk/${cont.activityId}` : "/app/desk"} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-indigo-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-indigo-50 transition-colors shadow-sm">
                <Icon name="play" size={13} /> {cont ? "Continue task" : "Start GRC 101"}
              </Link>
              {cont && (
                <div className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                  <span className="font-mono text-[11px] text-indigo-100">{cont.taskCode}·{cont.stepCode}</span>
                  <DVerb verbId={cont.verb} />
                  <span className="text-[12.5px] font-medium tracking-tight truncate max-w-[240px]">{cont.stepTitle}</span>
                </div>
              )}
            </div>
          </div>
          {progress && (
            <div className="shrink-0 md:w-[200px]">
              <div className="rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm p-4 flex items-center gap-3">
                <Ring pct={progress.overallPct} size={64} stroke={8}>
                  <span className="text-[13px] font-semibold text-white">{progress.overallPct}%</span>
                </Ring>
                <div>
                  <div className="text-[12px] font-medium tracking-tight">Program completion</div>
                  <div className="text-[11px] text-indigo-100/85 mt-0.5">Phase {progress.currentPhase} of {progress.totalPhases}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </Reveal>

      {/* Stat strip */}
      {progress && (
        <Reveal delay={0.08}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Stat icon="checkSquare" tone="indigo" value={progress.activitiesDone} sub={`/ ${progress.activitiesTotal}`} label="Activities completed" />
          <Stat icon="star" tone="amber" value={progress.reviewsCount ? progress.avgScore : "—"} decimals={1} sub={progress.reviewsCount ? `/ ${progress.scoreOutOf}` : undefined} label={`Avg mentor score · ${progress.reviewsCount} reviews`} />
        </div>
        </Reveal>
      )}

      <Reveal delay={0.16}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="xl:col-span-2 space-y-5">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Your organisations</h2>
              <span className="text-[11.5px] text-slate-400 font-medium">{orgs.length} engagement{orgs.length === 1 ? "" : "s"}</span>
            </div>
            {orgs.length === 0 ? (
              <p className="text-[13px] text-slate-500">No organisations assigned yet.</p>
            ) : (
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orgs.map((o) => {
                  const s = orgStats(o);
                  const locked = o.status === "locked";
                  const done = s.total > 0 && s.done === s.total;
                  return (
                    <StaggerItem key={o.id} className={`rounded-xl p-4 ring-1 bg-slate-50/60 ring-slate-200/60 ${locked ? "opacity-60" : ""}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${LRN_AVATAR[o.tone] ?? LRN_AVATAR.indigo} flex items-center justify-center text-white text-[13px] font-semibold shrink-0`}>{o.initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold tracking-tight text-slate-900 truncate">{o.name}</div>
                          <div className="text-[11px] text-slate-400 tracking-tight truncate">{o.industry}</div>
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-semibold tracking-tight ring-1 ${
                          locked ? "bg-slate-100 text-slate-500 ring-slate-200" : done ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-indigo-50 text-indigo-700 ring-indigo-100"
                        }`}>
                          {locked && <Icon name="lock" size={9} />}
                          {locked ? "Locked" : done ? "Complete" : "Active"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          { label: "Tasks", value: s.total },
                          { label: "Done", value: s.done },
                        ].map((m) => (
                          <div key={m.label} className="rounded-lg bg-white ring-1 ring-slate-200/60 px-2 py-1.5 text-center">
                            <div className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900 tabular-nums">{m.value}</div>
                            <div className="text-[10px] text-slate-400 tracking-tight">{m.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <Bar pct={s.pct || (locked ? 0 : 2)} tone={done ? "emerald" : locked ? "slate" : "indigo"} className="flex-1" />
                        <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{s.pct}%</span>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Skill rubric — radar */}
            <Card>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Skill rubric</h2>
                <span className="text-[11px] text-slate-400">/ 5</span>
              </div>
              {rubric.length > 0 ? (
                <RubricRadar dims={rubric.map((r) => ({ label: r.label, value: scoreFor(r) }))} />
              ) : (
                <div className="py-10 text-center text-[12.5px] text-slate-400">No rubric data.</div>
              )}
              {!anyRubricScored && (
                <div className="mt-1 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                  <Icon name="info" size={13} className="text-slate-400 shrink-0" /> Scores appear after your first mentor-graded activity.
                </div>
              )}
            </Card>

            {/* Certificate progress */}
            <Card className="flex flex-col">
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3">Certificate progress</h2>
              <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
                <Ring pct={certPct} size={108} stroke={9}>
                  <span className="text-[19px] font-semibold tracking-[-0.02em] text-slate-900">{certPct}%</span>
                </Ring>
                <div className="mt-3 text-[12.5px] font-medium text-slate-700 tracking-tight tabular-nums">{completedTasks} of {totalTasks} tasks complete</div>
                <div className="text-[11px] text-slate-400 mt-1 max-w-[210px]" style={{ textWrap: "pretty" }}>
                  {certPct >= 100 ? "All tasks done — your GRC 101 certificate is ready." : "Finish every task to unlock your GRC 101 certificate."}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {/* Progress overview */}
          <Card>
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3.5">Progress overview</h2>
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] text-slate-600 tracking-tight">Badges earned</span>
                  <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{earnedBadges.length} / {BADGES.length}</span>
                </div>
                <Bar pct={BADGES.length ? (earnedBadges.length / BADGES.length) * 100 : 0} tone="amber" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12.5px] text-slate-600 tracking-tight">Tasks completed</span>
                  <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{completedTasks} / {totalTasks}</span>
                </div>
                <Bar pct={certPct} tone="indigo" />
              </div>
              {progress && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12.5px] text-slate-600 tracking-tight">Activities completed</span>
                    <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{progress.activitiesDone} / {progress.activitiesTotal}</span>
                  </div>
                  <Bar pct={progress.activitiesTotal ? (progress.activitiesDone / progress.activitiesTotal) * 100 : 0} tone="emerald" />
                </div>
              )}
            </div>
          </Card>

          {/* Due soon — empty */}
          <Card>
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3">Due soon</h2>
            <div className="flex items-center gap-3 text-slate-500">
              <Icon name="calendar" size={16} className="text-slate-400" />
              <span className="text-[12.5px]">Nothing due — set your own pace.</span>
            </div>
          </Card>
        </div>
      </div>
      </Reveal>

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">grcmentor · GRC 101 · Foundations</div>
    </div>
  );
}
