"use client";

import { Icon } from "@/components/ui/icon";
import { useCachedQuery } from "@/lib/use-query";
import { useReview } from "@/components/audit/review-context";
import { auditApi, aTone } from "@/lib/audit";
import { PageHeader, LoadingState, EmptyState } from "@/components/audit/primitives";

export default function StandardsPage() {
  const { version } = useReview();
  const { data, loading } = useCachedQuery(`audit:standards:${version}`, () => auditApi.standards());

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-7">
      <PageHeader title="Standards" desc="The frameworks assigned to you, with your review activity against each." />
      {loading ? (
        <LoadingState />
      ) : (data ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
          <EmptyState icon="shield" title="No standards assigned" sub="Add standards to your auditor profile to start receiving submissions." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data!.map((s) => {
            const t = aTone(s.tone);
            return (
              <div key={s.id} className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] p-5">
                <div className="flex items-start gap-3.5">
                  <span className={`w-11 h-11 rounded-xl ${t.bg} ${t.text} flex items-center justify-center shrink-0`}><Icon name="shield" size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">{s.name}</h3>
                      {s.open > 0 && <span className="px-1.5 h-[18px] rounded text-[10px] font-semibold bg-amber-100 text-amber-700 flex items-center">{s.open} open</span>}
                    </div>
                    {s.controls && <p className="text-[11.5px] text-slate-500 mt-0.5">{s.controls}</p>}
                  </div>
                </div>
                <p className="text-[12px] text-slate-500 mt-3 leading-relaxed">{s.focus}</p>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-[20px] font-semibold tracking-tight text-slate-900">{s.reviewed}</div>
                    <div className="text-[10.5px] uppercase tracking-wide text-slate-400">Reviewed</div>
                  </div>
                  <div>
                    <div className={`text-[20px] font-semibold tracking-tight ${t.text}`}>{s.approvalPct}%</div>
                    <div className="text-[10.5px] uppercase tracking-wide text-slate-400">Approval rate</div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                      <div className={`h-full rounded-full ${t.solid}`} style={{ width: `${s.approvalPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
