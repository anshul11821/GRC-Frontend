"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useCachedQuery } from "@/lib/use-query";
import { auditApi } from "@/lib/audit";
import { useReview } from "@/components/audit/review-context";
import { PageHeader, LoadingState, EmptyState } from "@/components/audit/primitives";
import { MenteeCard } from "@/components/audit/rows";

export default function MenteesPage() {
  const { version } = useReview();
  const { data, loading } = useCachedQuery(`audit:mentees:${version}`, () => auditApi.mentees());
  const [q, setQ] = useState("");

  const rows = useMemo(
    () => (data ?? []).filter((m) => q === "" || m.name.toLowerCase().includes(q.toLowerCase())),
    [data, q],
  );

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-7">
      <PageHeader title="Mentees" desc="Everyone you've assessed, with their review history and standing.">
        <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white ring-1 ring-slate-200/70 text-slate-500 w-[220px]">
          <Icon name="search" size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mentees…" className="flex-1 bg-transparent text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none" />
        </div>
      </PageHeader>
      {loading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
          <EmptyState icon="users" title="No mentees yet" sub="Once you review a submission, that mentee shows up here." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((m) => <MenteeCard key={m.userId} m={m} />)}
        </div>
      )}
    </div>
  );
}
