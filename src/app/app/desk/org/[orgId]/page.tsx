"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgDetail } from "@/components/app/org-context";
import { useDeskLearnings } from "@/components/app/desk-context";
import type { LearningOrg } from "@/lib/learnings";

/** Working Desk org page — the full organisation context (same panel as the dashboard drawer). */
export default function OrgContext() {
  const { orgId } = useParams<{ orgId: string }>();
  const { learnings, loading } = useDeskLearnings();
  const org: LearningOrg | null = useMemo(
    () => learnings?.orgs.find((o) => o.id === orgId) ?? null,
    [learnings, orgId],
  );

  if (loading) {
    return (
      <div className="max-w-[920px] mx-auto px-5 sm:px-8 py-6 sm:py-7 space-y-5 animate-pulse">
        <Skeleton className="h-7 w-2/3 max-w-md" />
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-[680px] mx-auto px-6 py-10">
        <Card className="text-center py-12">
          <div className="w-11 h-11 mx-auto rounded-xl bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-400 mb-3"><Icon name="briefcase" size={20} /></div>
          <div className="text-[13px] font-medium text-slate-700">Organisation not found</div>
          <Link href="/app/desk" className="inline-block mt-4 text-[12.5px] text-indigo-600 hover:text-indigo-700">← Back to Working Desk</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[920px] mx-auto px-5 sm:px-8 py-6 sm:py-7 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-medium ring-1 bg-indigo-50 text-indigo-600 ring-indigo-100"><Icon name="briefcase" size={12} /> Organisation context</span>
        </div>
        <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-slate-900">{org.name}</h1>
      </div>
      <Card>
        <OrgDetail org={org} defaultOpen />
      </Card>
    </div>
  );
}
