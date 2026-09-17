"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgLogo } from "@/components/app/org-logo";
import { OrgBrief } from "@/components/app/org-window";
import { startDeskTour, useDeskLearnings } from "@/components/app/desk-context";
import type { LearningOrg } from "@/lib/learnings";

/** Working Desk org page — the desk's landing surface: the full organisation context, and the one
 *  place the walkthrough is launched from (the tour itself is mounted by DeskLayout, since it
 *  navigates on into a task brief). */
export default function OrgContext() {
  const { orgId } = useParams<{ orgId: string }>();
  const { learnings, loading } = useDeskLearnings();
  const org: LearningOrg | null = useMemo(
    () => learnings?.orgs.find((o) => o.id === orgId) ?? null,
    [learnings, orgId],
  );

  if (loading) {
    return (
      <div className="max-w-[920px] 2xl:max-w-[1280px] 3xl:max-w-[1440px] mx-auto px-5 sm:px-8 py-6 sm:py-7 space-y-5 animate-pulse">
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
    <div className="max-w-[920px] 2xl:max-w-[1280px] 3xl:max-w-[1440px] mx-auto px-5 sm:px-8 py-6 sm:py-7">
      {/* The window carries the name in its title bar; the page needs its own. Everything under it
          is the window's body, so the page and the i-button briefing read identically. */}
      <header data-tour="org-identity" className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <OrgLogo org={org} className="w-10 h-10 rounded-xl text-[13px] shrink-0" iconSize={20} />
          <h1 className="truncate text-[20px] font-semibold tracking-[-0.02em] text-slate-900">{org.name}</h1>
        </div>
        {/* the desk's single guide trigger; blinks thrice on load to hint the walkthrough */}
        <button
          onClick={startDeskTour}
          className="guide-blink focus-ring shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-indigo-50 ring-1 ring-indigo-200/70 text-indigo-700 hover:bg-indigo-100 text-[12.5px] font-medium tracking-tight transition-colors cursor-pointer"
        >
          <Icon name="help" size={14} /> Guide
        </button>
      </header>
      <OrgBrief key={org.id} org={org} />
    </div>
  );
}
