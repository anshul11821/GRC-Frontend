"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useCachedQuery } from "@/lib/use-query";
import { auditApi } from "@/lib/audit";
import { useReview } from "@/components/audit/review-context";
import { PageHeader, LoadingState, EmptyState } from "@/components/audit/primitives";
import { QueueTableRow } from "@/components/audit/rows";

export default function ReviewQueuePage() {
  const { version, openReview } = useReview();
  const { data, loading } = useCachedQuery(`audit:queue:queue:${version}`, () => auditApi.queue("queue"));
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"waited" | "mentee">("waited");

  const rows = useMemo(() => {
    let list = (data ?? []).filter((r) =>
      q === "" || (r.menteeName + r.taskTitle + r.taskCode).toLowerCase().includes(q.toLowerCase()),
    );
    list = [...list].sort((a, b) => (sort === "waited" ? b.waitedHours - a.waitedHours : a.menteeName.localeCompare(b.menteeName)));
    return list;
  }, [data, q, sort]);

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-7">
      <PageHeader title="Review Queue" desc={`${data?.length ?? 0} submission${(data?.length ?? 0) === 1 ? "" : "s"} in your pool, routed by your assigned standards.`}>
        <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white ring-1 ring-slate-200/70 text-slate-500 w-[220px]">
          <Icon name="search" size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search queue…" className="flex-1 bg-transparent text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none" />
        </div>
        <button onClick={() => setSort(sort === "waited" ? "mentee" : "waited")} className="h-9 px-3.5 rounded-lg bg-white ring-1 ring-slate-200/80 hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium tracking-tight transition-colors inline-flex items-center gap-1.5">
          <Icon name="sortDesc" size={14} />{sort === "waited" ? "Longest waiting" : "By mentee"}
        </button>
      </PageHeader>

      {loading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
          <EmptyState icon="inbox" title="Nothing waiting" sub="When mentees complete tasks under your standards, they land here." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] overflow-hidden">
          <div className="grid grid-cols-[2.4fr_1.3fr_1fr_0.9fr_auto] gap-4 px-5 py-2.5 border-b border-slate-100 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            <span>Submission</span><span>Standards</span><span>Placement</span><span>Waiting</span><span></span>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((r) => <QueueTableRow key={r.id} r={r} onOpen={openReview} />)}
          </div>
        </div>
      )}
    </div>
  );
}
