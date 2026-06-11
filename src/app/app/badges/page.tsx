"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, Bar } from "@/components/ui/primitives";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { SOFT_TONES } from "@/lib/tones";
import { BADGES, type BadgeDef } from "@/lib/badges";
import { learningsApi, type Learnings } from "@/lib/learnings";

type BadgeState = "earned" | "in-progress" | "locked";
interface BadgeProgress extends BadgeDef { done: number; total: number; state: BadgeState; pct: number }

function compute(badge: BadgeDef, status: Record<string, string>): BadgeProgress {
  const total = badge.taskCodes.length;
  const done = badge.taskCodes.filter((c) => status[c] === "complete").length;
  const state: BadgeState = total > 0 && done === total ? "earned" : done > 0 ? "in-progress" : "locked";
  return { ...badge, done, total, state, pct: total ? Math.round((done / total) * 100) : 0 };
}

const STATE_CHIP: Record<BadgeState, { label: string; cls: string }> = {
  earned: { label: "Earned", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  "in-progress": { label: "In progress", cls: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  locked: { label: "Locked", cls: "bg-slate-100 text-slate-500 ring-slate-200/70" },
};

// Per-tone medal treatment: gradient face (earned), ring colour, glow, and muted face colour.
const MEDAL: Record<string, { grad: string; ring: string; glow: string; face: string }> = {
  indigo: { grad: "from-indigo-500 to-violet-600", ring: "#6366F1", glow: "rgba(99,102,241,0.5)", face: "text-indigo-600" },
  violet: { grad: "from-violet-500 to-indigo-600", ring: "#7C3AED", glow: "rgba(124,58,237,0.5)", face: "text-violet-600" },
  emerald: { grad: "from-emerald-500 to-teal-600", ring: "#10B981", glow: "rgba(16,185,129,0.5)", face: "text-emerald-600" },
  amber: { grad: "from-amber-400 to-orange-500", ring: "#F59E0B", glow: "rgba(245,158,11,0.5)", face: "text-amber-600" },
  rose: { grad: "from-rose-500 to-pink-600", ring: "#F43F5E", glow: "rgba(244,63,94,0.5)", face: "text-rose-600" },
  sky: { grad: "from-sky-500 to-indigo-600", ring: "#0EA5E9", glow: "rgba(14,165,233,0.5)", face: "text-sky-600" },
};

/** Dimensional achievement medal with a progress ring (reuses badge %), earned glow + check. */
function Medallion({ b }: { b: BadgeProgress }) {
  const m = MEDAL[b.tone] ?? MEDAL.indigo;
  const earned = b.state === "earned";
  const locked = b.state === "locked";
  const size = 68, stroke = 4, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const arcPct = earned ? 100 : locked ? 0 : Math.max(b.pct, 6);
  return (
    <div className="group relative shrink-0" style={{ width: size, height: size }}>
      {/* earned glow */}
      {earned && (
        <div
          className="absolute inset-1 rounded-full blur-md opacity-60 transition-opacity duration-300 group-hover:opacity-90"
          style={{ background: m.glow }}
        />
      )}
      {/* completion / progress ring */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2F7" strokeWidth={stroke} fill="none" />
        {!locked && (
          <circle
            cx={size / 2} cy={size / 2} r={r} stroke={m.ring} strokeWidth={stroke} fill="none" strokeLinecap="round"
            strokeDasharray={`${(arcPct / 100) * c} ${c}`} className="transition-all duration-700"
          />
        )}
      </svg>
      {/* medal face */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative w-[46px] h-[46px] rounded-full flex items-center justify-center overflow-hidden ring-1 ${
            locked
              ? "bg-slate-100 text-slate-300 ring-slate-200/70"
              : earned
                ? `bg-gradient-to-br ${m.grad} text-white ring-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.55),0_4px_10px_-3px_rgba(15,23,42,0.3)]`
                : `bg-white ${m.face} ring-slate-200/70 shadow-[0_2px_6px_-2px_rgba(15,23,42,0.15)]`
          }`}
        >
          {/* top highlight for dimensionality */}
          {!locked && <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-6 rounded-full bg-white/40 blur-[6px]" />}
          <Icon name={locked ? "lock" : (b.icon as IconName)} size={22} strokeWidth={earned ? 2 : 1.8} className="relative" />
        </div>
      </div>
      {/* earned check sub-badge */}
      {earned && (
        <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-sm">
          <Icon name="check" size={11} strokeWidth={3.5} />
        </span>
      )}
    </div>
  );
}

export default function BadgesPage() {
  const [learnings, setLearnings] = useState<Learnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    learningsApi.get("grc101").then((l) => !cancelled && setLearnings(l)).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const { badges, earned, inProgress, tasksDone, tasksTotal } = useMemo(() => {
    const status: Record<string, string> = {};
    learnings?.orgs.forEach((o) => o.projects.forEach((p) => p.tasks.forEach((t) => { status[t.code] = t.status; })));
    const badges = BADGES.map((b) => compute(b, status));
    return {
      badges,
      earned: badges.filter((b) => b.state === "earned").length,
      inProgress: badges.filter((b) => b.state === "in-progress").length,
      tasksDone: badges.reduce((n, b) => n + b.done, 0),
      tasksTotal: badges.reduce((n, b) => n + b.total, 0),
    };
  }, [learnings]);

  const kpis: { icon: IconName; tone: string; value: string | number; label: string }[] = [
    { icon: "ribbon", tone: "emerald", value: earned, label: "Badges earned" },
    { icon: "history", tone: "indigo", value: inProgress, label: "In progress" },
    { icon: "star", tone: "amber", value: BADGES.length, label: "Available" },
    { icon: "checkSquare", tone: "violet", value: `${tasksDone}/${tasksTotal}`, label: "Tasks completed" },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-5">
      <div className="flex items-start gap-3.5">
        <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(245,158,11,0.6)] shrink-0">
          <Icon name="ribbon" size={20} />
        </span>
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">Badges</h1>
          <p className="text-[13px] text-slate-500 tracking-tight mt-0.5 max-w-xl" style={{ textWrap: "pretty" }}>
            Credential badges you earn by completing mentor-graded tasks — they compile onto your CV and certificate.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonCardGrid cards={8} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((s) => (
              <Card key={s.label} className="flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-200/70">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${SOFT_TONES[s.tone] ?? SOFT_TONES.indigo}`}><Icon name={s.icon} size={17} /></div>
                <div>
                  <div className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900 leading-none tabular-nums">{s.value}</div>
                  <div className="text-[11.5px] text-slate-500 tracking-tight mt-1">{s.label}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((b) => (
              <Card key={b.id} className="flex gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:ring-indigo-200/70">
                <Medallion b={b} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-[14px] font-semibold tracking-tight ${b.state === "locked" ? "text-slate-500" : "text-slate-900"}`}>{b.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium ring-1 tracking-tight ${STATE_CHIP[b.state].cls}`}>{STATE_CHIP[b.state].label}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 tracking-tight mt-1 leading-relaxed" style={{ textWrap: "pretty" }}>{b.blurb}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Bar pct={b.pct || 2} tone={b.state === "earned" ? "emerald" : b.state === "in-progress" ? "indigo" : "slate"} className="flex-1" />
                    <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{b.done}/{b.total} tasks</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">grcmentor · badges update automatically as you complete tasks</div>
    </div>
  );
}
