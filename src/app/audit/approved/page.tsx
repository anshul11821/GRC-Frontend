"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useCachedQuery } from "@/lib/use-query";
import { auditApi, verdictById } from "@/lib/audit";
import { useReview } from "@/components/audit/review-context";
import { PageHeader, LoadingState, EmptyState, Avatar, StdChip, Pill } from "@/components/audit/primitives";

export default function ApprovedPage() {
  const { version, openReview } = useReview();
  const { data, loading } = useCachedQuery(`audit:queue:approved:${version}`, () => auditApi.queue("approved"));
  const [q, setQ] = useState("");

  const rows = useMemo(
    () => (data ?? []).filter((r) => q === "" || (r.menteeName + r.taskTitle + r.taskCode).toLowerCase().includes(q.toLowerCase())),
    [data, q],
  );
  const scores = (data ?? []).map((r) => r.overallScore).filter((s): s is number => s != null);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
  const obs = (data ?? []).filter((r) => r.verdict === "approve_with_observations").length;

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-7">
      <PageHeader title="Approved" desc="Your approval history with verdicts and rubric scores.">
        <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white ring-1 ring-slate-200/70 text-slate-500 w-[220px]">
          <Icon name="search" size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search approvals…" className="flex-1 bg-transparent text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none" />
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { k: "Total approved", v: String(data?.length ?? 0), c: "text-emerald-600" },
          { k: "With observations", v: String(obs), c: "text-teal-600" },
          { k: "Avg score", v: avg, c: "text-amber-600" },
        ].map((s) => (
          <div key={s.k} className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] px-5 py-4">
            <div className={`text-[24px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
            <div className="text-[12px] text-slate-500 mt-0.5">{s.k}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
          <EmptyState icon="checkSquare" title="No approvals yet" sub="Tasks you approve will be listed here." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] overflow-hidden">
          <div className="grid grid-cols-[2.4fr_1.3fr_1.1fr_0.7fr] gap-4 px-5 py-2.5 border-b border-slate-100 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            <span>Task</span><span>Standards</span><span>Verdict</span><span>Score</span>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((r) => {
              const v = verdictById(r.verdict);
              return (
                <button key={r.id} onClick={() => openReview(r.id)} className="w-full text-left grid grid-cols-[2.4fr_1.3fr_1.1fr_0.7fr] gap-4 px-5 py-3 items-center hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={r.menteeInitials} tone="emerald" size={32} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-slate-900 tracking-tight truncate">{r.taskTitle}</div>
                      <div className="text-[11px] text-slate-400"><span className="font-mono">{r.taskCode}</span> · {r.menteeName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">{r.standards.map((s) => <StdChip key={s.id} chip={s} />)}</div>
                  <span><Pill tone={v?.tone ?? "emerald"}>{r.verdict === "approve_with_observations" ? "Conditional" : "Approved"}</Pill></span>
                  <span className="text-[13px] font-semibold text-slate-800 tabular-nums">{r.overallScore != null ? r.overallScore.toFixed(1) : "—"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
