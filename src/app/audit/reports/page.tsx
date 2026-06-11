"use client";

import { useCachedQuery } from "@/lib/use-query";
import { useReview } from "@/components/audit/review-context";
import { auditApi, aTone, type NameValue } from "@/lib/audit";
import { Icon } from "@/components/ui/icon";
import { PageHeader, LoadingState, StdChip } from "@/components/audit/primitives";

function LineChart({ data, height = 96 }: { data: number[]; height?: number }) {
  if (data.length < 2) return <div className="h-[96px] flex items-center justify-center text-[12px] text-slate-400">Not enough data yet</div>;
  const w = 320, pad = 8;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), pad + (1 - (v - min) / span) * (height - pad * 2)] as const);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${pts[pts.length - 1][0].toFixed(1)} ${height - pad} L${pts[0][0].toFixed(1)} ${height - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lg-rep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg-rep)" />
      <path d={d} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3.5 : 0} fill="#6366F1" />)}
    </svg>
  );
}

function BarChart({ data, height = 120 }: { data: { m: string; v: number }[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.v));
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <span className="text-[10.5px] font-medium text-slate-500">{d.v}</span>
          <div className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400 transition-all" style={{ height: `${(d.v / max) * (height - 36)}px` }} />
          <span className="text-[10.5px] text-slate-400">{d.m}</span>
        </div>
      ))}
    </div>
  );
}

const card = "bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] p-5";

export default function ReportsPage() {
  const { version } = useReview();
  const { data: R, loading } = useCachedQuery(`audit:reports:${version}`, () => auditApi.reports());

  if (loading || !R) return <LoadingState />;
  const mixTotal = R.verdictMix.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-7">
      <PageHeader title="Reports" desc="Your assessment throughput, quality and outcomes." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {R.kpis.map((k) => {
          const t = aTone(k.tone);
          return (
            <div key={k.id} className={card}>
              <span className={`w-9 h-9 rounded-lg ${t.bg} ${t.text} flex items-center justify-center mb-3`}><Icon name="chart" size={17} /></span>
              <div className="text-[26px] font-semibold tracking-tight text-slate-900 leading-none">{k.value}</div>
              <div className="text-[12.5px] font-medium text-slate-700 mt-1.5">{k.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{k.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className={card}>
          <h3 className="text-[13.5px] font-semibold text-slate-900 tracking-tight mb-1">Turnaround trend</h3>
          <p className="text-[11.5px] text-slate-400 mb-2">Average days to verdict · last 8 weeks</p>
          <LineChart data={R.turnaround} />
        </div>
        <div className={card}>
          <h3 className="text-[13.5px] font-semibold text-slate-900 tracking-tight mb-1">Review volume</h3>
          <p className="text-[11.5px] text-slate-400 mb-3">Verdicts per month</p>
          <BarChart data={R.volume} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5">
        <div className={card}>
          <h3 className="text-[13.5px] font-semibold text-slate-900 tracking-tight mb-1">Verdict mix</h3>
          <p className="text-[11.5px] text-slate-400 mb-4">{R.verdictMix.reduce((a, b) => a + b.value, 0)} verdicts</p>
          {R.verdictMix.length === 0 ? (
            <p className="text-[12.5px] text-slate-400">No verdicts recorded yet.</p>
          ) : (
            <>
              <div className="h-3 rounded-full overflow-hidden flex mb-4">
                {R.verdictMix.map((v: NameValue) => <div key={v.label} className={aTone(v.tone).solid} style={{ width: `${(v.value / mixTotal) * 100}%` }} />)}
              </div>
              <div className="space-y-2.5">
                {R.verdictMix.map((v: NameValue) => (
                  <div key={v.label} className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${aTone(v.tone).solid}`} />
                    <span className="text-[12.5px] text-slate-600 flex-1">{v.label}</span>
                    <span className="text-[12.5px] font-semibold text-slate-800 tabular-nums">{v.value}</span>
                    <span className="text-[11px] text-slate-400 w-9 text-right">{Math.round((v.value / mixTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={card}>
          <h3 className="text-[13.5px] font-semibold text-slate-900 tracking-tight mb-1">Rubric averages</h3>
          <p className="text-[11.5px] text-slate-400 mb-4">Mean score you award per dimension · /5</p>
          {R.rubric.length === 0 ? (
            <p className="text-[12.5px] text-slate-400">No scored reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {R.rubric.map((d) => (
                <div key={d.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12.5px] text-slate-600">{d.label}</span>
                    <span className="text-[12px] font-semibold text-slate-800 tabular-nums">{d.value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500" style={{ width: `${(d.value / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {R.byStandard.length > 0 && (
        <div className={`${card} mt-5`}>
          <h3 className="text-[13.5px] font-semibold text-slate-900 tracking-tight mb-4">Reviews by standard</h3>
          <div className="space-y-3.5">
            {R.byStandard.map((s) => {
              const maxReviewed = Math.max(1, ...R.byStandard.map((x) => x.reviewed));
              return (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="w-28 shrink-0"><StdChip chip={{ id: "", label: s.name }} /></div>
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${aTone(s.tone).solid}`} style={{ width: `${(s.reviewed / maxReviewed) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[12px] text-slate-500 w-20 text-right">{s.reviewed} reviewed</span>
                  <span className="text-[12px] font-semibold text-slate-700 w-20 text-right tabular-nums">{s.approvalPct}% appr.</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
