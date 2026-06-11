"use client";

import { Icon } from "@/components/ui/icon";
import { useCachedQuery } from "@/lib/use-query";
import { auditApi } from "@/lib/audit";
import { useReview } from "@/components/audit/review-context";
import { PageHeader, LoadingState, EmptyState } from "@/components/audit/primitives";
import { FlaggedRow } from "@/components/audit/rows";

export default function FlaggedPage() {
  const { version, openReview } = useReview();
  const { data, loading } = useCachedQuery(`audit:queue:flagged:${version}`, () => auditApi.queue("flagged"));
  const openItems = (data ?? []).reduce((a, b) => a + b.openFindings, 0);

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-7">
      <PageHeader title="Flagged · Needs Rework" desc="Tasks you returned to mentees, tracked by round and open items.">
        {(data ?? []).length > 0 && (
          <span className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-amber-50 text-amber-700 text-[12.5px] font-medium ring-1 ring-amber-200/70">
            <Icon name="flag" size={14} />{openItems} open item{openItems === 1 ? "" : "s"}
          </span>
        )}
      </PageHeader>
      {loading ? (
        <LoadingState />
      ) : (data ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
          <EmptyState icon="flag" title="Nothing flagged" sub="Tasks you return for rework appear here until the mentee resubmits and you clear them." />
        </div>
      ) : (
        <div className="space-y-2.5">
          {data!.map((r) => <FlaggedRow key={r.id} r={r} onOpen={openReview} />)}
        </div>
      )}
    </div>
  );
}
