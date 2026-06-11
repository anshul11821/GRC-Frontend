"use client";

import { useCachedQuery } from "@/lib/use-query";
import { auditApi } from "@/lib/audit";
import { useReview } from "@/components/audit/review-context";
import { PageHeader, LoadingState, EmptyState } from "@/components/audit/primitives";
import { ProgressRow } from "@/components/audit/rows";

export default function InProgressPage() {
  const { version, openReview } = useReview();
  const { data, loading } = useCachedQuery(`audit:queue:in_progress:${version}`, () => auditApi.queue("in_progress"));

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-7">
      <PageHeader title="In Progress" desc="Reviews you've opened but not yet sent a verdict for. Pick up where you left off." />
      {loading ? (
        <LoadingState />
      ) : (data ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
          <EmptyState icon="clipboard" title="No reviews in progress" sub="Claim a submission from the Review Queue to start." />
        </div>
      ) : (
        <div className="space-y-2.5">
          {data!.map((r) => <ProgressRow key={r.id} r={r} onOpen={openReview} />)}
        </div>
      )}
    </div>
  );
}
