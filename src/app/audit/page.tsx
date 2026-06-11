"use client";

import { useCachedQuery } from "@/lib/use-query";
import { auditApi } from "@/lib/audit";
import { useReview } from "@/components/audit/review-context";
import { ASectionTitle, ACard, LoadingState, EmptyState } from "@/components/audit/primitives";
import {
  StatCardView, RequestRow, ProgressRow, FlaggedRow, ApprovedRow, MenteeCard,
} from "@/components/audit/rows";

const STAT_META: Record<string, { icon: "inbox" | "clipboard" | "flag" | "star"; tone: string }> = {
  queue: { icon: "inbox", tone: "indigo" },
  awaiting: { icon: "clipboard", tone: "violet" },
  flagged: { icon: "flag", tone: "amber" },
  avg: { icon: "star", tone: "emerald" },
};

export default function AuditOverviewPage() {
  const { version, openReview } = useReview();
  const { data, loading } = useCachedQuery(`audit:overview:${version}`, () => auditApi.overview());

  if (loading || !data) return <LoadingState label="Loading your console…" />;

  const totalPending = data.newRequests.length;

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-7 space-y-7">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Assessment console</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            You have <span className="font-medium text-slate-700">{totalPending} submission{totalPending === 1 ? "" : "s"}</span> awaiting review in your pool.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.stats.map((s) => {
          const meta = STAT_META[s.id] ?? { icon: "inbox" as const, tone: "slate" };
          return <StatCardView key={s.id} s={s} icon={meta.icon} tone={meta.tone} />;
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-7 items-start">
        <div className="space-y-7">
          <section>
            <ASectionTitle icon="inbox" count={data.newRequests.length}>New review requests</ASectionTitle>
            {data.newRequests.length === 0 ? (
              <ACard><EmptyState icon="inbox" title="Your pool is clear" sub="Completed tasks matching your standards will appear here for review." /></ACard>
            ) : (
              <div className="space-y-2.5">
                {data.newRequests.map((r) => <RequestRow key={r.id} r={r} onOpen={openReview} />)}
              </div>
            )}
          </section>

          {data.awaitingVerdict.length > 0 && (
            <section>
              <ASectionTitle icon="clipboard" count={data.awaitingVerdict.length}>Awaiting my verdict</ASectionTitle>
              <div className="space-y-2.5">
                {data.awaitingVerdict.map((r) => <ProgressRow key={r.id} r={r} onOpen={openReview} />)}
              </div>
            </section>
          )}

          {data.flagged.length > 0 && (
            <section>
              <ASectionTitle icon="flag" count={data.flagged.length} action={<span className="text-[11px] text-amber-600 font-medium">Returned for rework</span>}>
                Flagged · needs rework
              </ASectionTitle>
              <div className="space-y-2.5">
                {data.flagged.map((r) => <FlaggedRow key={r.id} r={r} onOpen={openReview} />)}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-7">
          <ACard pad={false} className="p-5">
            <ASectionTitle icon="checkCircle">Recently approved</ASectionTitle>
            {data.approved.length === 0 ? (
              <p className="text-[12.5px] text-slate-400">Nothing approved yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 -my-1">
                {data.approved.map((r) => <ApprovedRow key={r.id} r={r} />)}
              </div>
            )}
          </ACard>

          {data.mentees.length > 0 && (
            <section>
              <ASectionTitle icon="users" count={data.mentees.length}>Mentees I&apos;ve assessed</ASectionTitle>
              <div className="space-y-2.5">
                {data.mentees.slice(0, 4).map((m) => <MenteeCard key={m.userId} m={m} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
