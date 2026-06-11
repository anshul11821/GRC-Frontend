"use client";

import { Icon, type IconName } from "@/components/ui/icon";
import { aTone, STATUS_LABEL, verdictById, type AuditListItem, type MenteeRow, type StatCard } from "@/lib/audit";
import { ACard, Avatar, StdChip, Pill, ABar } from "./primitives";

export function StatCardView({ s, icon, tone }: { s: StatCard; icon: IconName; tone: string }) {
  const t = aTone(tone);
  return (
    <ACard className="flex items-start gap-3.5">
      <span className={`w-10 h-10 rounded-xl ${t.bg} ${t.text} flex items-center justify-center shrink-0`}>
        <Icon name={icon} size={19} />
      </span>
      <div className="min-w-0">
        <div className="text-[24px] font-semibold tracking-tight text-slate-900 leading-none">{s.value}</div>
        <div className="text-[12.5px] font-medium text-slate-700 mt-1.5 tracking-tight">{s.label}</div>
        <div className="text-[11px] text-slate-400">{s.sub}</div>
      </div>
    </ACard>
  );
}

/** A request waiting in the pool — the primary "Review" CTA row. */
export function RequestRow({ r, onOpen }: { r: AuditListItem; onOpen: (id: number) => void }) {
  return (
    <div className="group flex items-center gap-3.5 p-3 rounded-xl ring-1 ring-slate-200/70 hover:ring-indigo-300/70 hover:bg-indigo-50/20 transition-all">
      <Avatar initials={r.menteeInitials} tone="indigo" size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-slate-500">{r.taskCode}</span>
          {r.round > 1 && <Pill tone="slate" dot={false}>Round {r.round}</Pill>}
          {r.orgName && <span className="text-[11px] text-slate-400">· {r.orgName}</span>}
        </div>
        <div className="text-[13.5px] font-medium text-slate-900 tracking-tight truncate mt-0.5">{r.taskTitle}</div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11.5px] text-slate-500">{r.menteeName}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1 flex-wrap">{r.standards.map((s) => <StdChip key={s.id} chip={s} />)}</div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400"><Icon name="clock" size={12} />{r.waitedHours}h</span>
      </div>
      <button onClick={() => onOpen(r.id)} className="shrink-0 h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12.5px] font-medium tracking-tight transition-colors inline-flex items-center gap-1.5">
        Review<Icon name="arrowRight" size={14} />
      </button>
    </div>
  );
}

/** Claimed, in-review row. */
export function ProgressRow({ r, onOpen }: { r: AuditListItem; onOpen: (id: number) => void }) {
  return (
    <button onClick={() => onOpen(r.id)} className="group w-full text-left flex items-center gap-3.5 p-3 rounded-xl ring-1 ring-slate-200/70 hover:ring-indigo-300/70 hover:bg-indigo-50/20 transition-all">
      <Avatar initials={r.menteeInitials} tone="indigo" size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-slate-500">{r.taskCode}</span>
          <span className="text-[11px] text-slate-400">{r.menteeName}</span>
        </div>
        <div className="text-[13px] font-medium text-slate-900 tracking-tight truncate mt-0.5">{r.taskTitle}</div>
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">{r.standards.map((s) => <StdChip key={s.id} chip={s} />)}</div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <Pill tone="indigo" dot={false}>In review</Pill>
        {r.notesCount > 0 && <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-medium"><Icon name="messageSquare" size={12} />{r.notesCount}</span>}
      </div>
      <Icon name="chevronRight" size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
    </button>
  );
}

/** Returned-for-rework row. */
export function FlaggedRow({ r, onOpen }: { r: AuditListItem; onOpen: (id: number) => void }) {
  return (
    <button onClick={() => onOpen(r.id)} className="group w-full text-left flex items-center gap-3.5 p-3 rounded-xl ring-1 ring-slate-200/70 hover:ring-amber-300/70 hover:bg-amber-50/20 transition-all">
      <Avatar initials={r.menteeInitials} tone="amber" size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-slate-500">{r.taskCode}</span>
          <Pill tone="amber">Changes requested</Pill>
          <span className="px-1.5 h-[18px] rounded text-[10px] font-medium bg-slate-100 text-slate-500 flex items-center">Round {r.round}</span>
        </div>
        <div className="text-[13px] font-medium text-slate-900 tracking-tight truncate mt-0.5">{r.taskTitle}</div>
        <div className="text-[11.5px] text-slate-500 mt-1">{r.menteeName}</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[15px] font-semibold text-amber-600 leading-none">{r.openFindings}</span>
        <span className="text-[10.5px] text-slate-400">open items</span>
      </div>
      <Icon name="chevronRight" size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
    </button>
  );
}

/** Compact approved/decided row. */
export function ApprovedRow({ r }: { r: AuditListItem }) {
  const obs = r.verdict === "approve_with_observations";
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar initials={r.menteeInitials} tone="emerald" size={30} />
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium text-slate-800 tracking-tight truncate">{r.taskTitle}</div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="font-mono">{r.taskCode}</span><span>·</span><span>{r.menteeName}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Pill tone={obs ? "teal" : "emerald"}>{obs ? "Cond." : "Approved"}</Pill>
        {r.overallScore != null && <span className="text-[11px] text-slate-400 font-medium">{r.overallScore.toFixed(1)}/5</span>}
      </div>
    </div>
  );
}

export function MenteeCard({ m }: { m: MenteeRow }) {
  const statusTone = m.rework > 0 ? "amber" : m.reviewed === 0 ? "slate" : "emerald";
  const statusLabel = m.rework > 0 ? "In rework" : m.reviewed === 0 ? "New" : "Active";
  return (
    <div className="group p-3.5 rounded-xl ring-1 ring-slate-200/70 hover:ring-slate-300 hover:shadow-[0_8px_24px_-14px_rgba(15,23,42,0.18)] transition-all bg-white">
      <div className="flex items-center gap-3">
        <Avatar initials={m.initials} tone="violet" size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-slate-900 tracking-tight truncate">{m.name}</div>
          <div className="text-[11px] text-slate-500 truncate uppercase">{m.programId}</div>
        </div>
        {m.open > 0 && <span className="shrink-0 px-1.5 h-[19px] rounded-md text-[10.5px] font-semibold bg-amber-100 text-amber-700 flex items-center">{m.open} open</span>}
      </div>
      <div className="grid grid-cols-4 gap-1 mt-3.5 pt-3 border-t border-slate-100">
        {[
          { k: "Reviewed", v: m.reviewed, c: "text-slate-900" },
          { k: "Approved", v: m.approved, c: "text-emerald-600" },
          { k: "Rework", v: m.rework, c: "text-amber-600" },
          { k: "Avg", v: m.avg != null ? m.avg.toFixed(1) : "—", c: "text-slate-900" },
        ].map((x) => (
          <div key={x.k} className="text-center">
            <div className={`text-[15px] font-semibold tracking-tight ${x.c}`}>{x.v}</div>
            <div className="text-[9.5px] uppercase tracking-[0.08em] text-slate-400 mt-0.5">{x.k}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
        <Pill tone={statusTone}>{statusLabel}</Pill>
      </div>
    </div>
  );
}

/** Table-style row for the Review Queue / Approved list pages. */
export function QueueTableRow({ r, onOpen }: { r: AuditListItem; onOpen: (id: number) => void }) {
  return (
    <div className="group grid grid-cols-[2.4fr_1.3fr_1fr_0.9fr_auto] gap-4 px-5 py-3 items-center hover:bg-slate-50/60 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={r.menteeInitials} tone="indigo" size={34} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-medium text-slate-500">{r.taskCode}</span>
            {r.round > 1 && <Pill tone="slate" dot={false}>Round {r.round}</Pill>}
          </div>
          <div className="text-[13px] font-medium text-slate-900 tracking-tight truncate">{r.taskTitle}</div>
          <div className="text-[11px] text-slate-400">{r.menteeName}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-wrap">{r.standards.map((s) => <StdChip key={s.id} chip={s} />)}</div>
      <span className="text-[12px] text-slate-500">{r.orgName ?? "—"}</span>
      <div>
        <div className="text-[12.5px] font-medium text-slate-700">{STATUS_LABEL[r.status] ?? r.status}</div>
        <div className="text-[10.5px] text-slate-400">{r.waitedHours}h in queue</div>
      </div>
      <button onClick={() => onOpen(r.id)} className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-medium tracking-tight transition-colors inline-flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
        Review<Icon name="arrowRight" size={13} />
      </button>
    </div>
  );
}

export { verdictById, ABar };
