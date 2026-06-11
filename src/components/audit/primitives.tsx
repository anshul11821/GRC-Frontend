/** Auditor console primitives — ported from the design mockup. Mirrors the mentee app's look
 *  but with the assessment-console palette. */
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { aTone, STD_TONE, type StandardChip } from "@/lib/audit";

export function ACard({
  className = "", children, pad = true, onClick, hover = false,
}: { className?: string; children: ReactNode; pad?: boolean; onClick?: () => void; hover?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] ${pad ? "p-5" : ""} ${
        hover ? "transition-all hover:ring-slate-300/80 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_14px_32px_-14px_rgba(15,23,42,0.18)] cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function ASectionTitle({
  children, count, action, icon,
}: { children: ReactNode; count?: number | null; action?: ReactNode; icon?: IconName }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={15} className="text-slate-400" />}
        <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500">{children}</h3>
        {count != null && (
          <span className="px-1.5 h-[18px] rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 flex items-center">{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

export function Avatar({
  initials, tone = "slate", size = 36, ring = true,
}: { initials: string; tone?: string; size?: number; ring?: boolean }) {
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${aTone(tone).grad} flex items-center justify-center text-white font-semibold shrink-0 ${ring ? "ring-2 ring-white" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function StdChip({ chip }: { chip: StandardChip }) {
  const t = aTone(STD_TONE[chip.id] || "slate");
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 h-[19px] rounded text-[10.5px] font-medium ${t.bg} ${t.text} ring-1 ${t.ring}`}>
      <span className={`w-1 h-1 rounded-full ${t.dot}`} />
      {chip.label}
    </span>
  );
}

export function ABar({ pct, tone = "indigo", className = "" }: { pct: number; tone?: string; className?: string }) {
  return (
    <div className={`h-1.5 rounded-full bg-slate-100 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full ${aTone(tone).solid} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Pill({ tone = "slate", children, dot = true }: { tone?: string; children: ReactNode; dot?: boolean }) {
  const c = aTone(tone);
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 h-[19px] rounded text-[10.5px] font-medium ${c.bg} ${c.text}`}>
      {dot && <span className={`w-1 h-1 rounded-full ${c.dot}`} />}
      {children}
    </span>
  );
}

/** Small progress ring used in the rubric header. */
export function Ring2({ pct, size = 52, light = false }: { pct: number; size?: number; light?: boolean }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" className="-rotate-90">
      <circle cx="26" cy="26" r={r} stroke={light ? "rgba(255,255,255,0.25)" : "#EEF2F7"} strokeWidth="5" fill="none" />
      <circle
        cx="26" cy="26" r={r} stroke={light ? "#fff" : "#6366F1"} strokeWidth="5" fill="none"
        strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} className="transition-all duration-500"
      />
    </svg>
  );
}

export function PageHeader({ title, desc, children }: { title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">{title}</h1>
        {desc && <p className="text-[13px] text-slate-500 mt-1">{desc}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ icon = "inbox", title, sub }: { icon?: IconName; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <span className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <Icon name={icon} size={22} />
      </span>
      <div className="text-[14px] font-medium text-slate-700">{title}</div>
      {sub && <div className="text-[12.5px] text-slate-400 mt-1 max-w-sm">{sub}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
        <span className="text-[12.5px]">{label}</span>
      </div>
    </div>
  );
}
