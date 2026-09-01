"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgDetail } from "@/components/app/org-context";
import { useDeskLearnings } from "@/components/app/desk-context";
import type { LearningOrg } from "@/lib/learnings";

/**
 * The client this mentee is working for — the learner's own ten-panel organisation context,
 * unchanged.
 *
 * Every learner rotates through a different organisation, so this is the single most useful thing
 * a reviewer can read before judging their work: the regulator, the mandatory standards and the
 * interested parties on this page are the ones the submission was written against. It was a
 * three-field summary here; that was a second, thinner description of the same organisation.
 *
 * No Guide button: the walkthrough is the learner's onboarding, and it navigates on into a task
 * brief as if the reader were about to work it.
 */
export default function MenteeOrgPage() {
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
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-[680px] mx-auto px-6 py-10">
        <Card className="text-center py-12">
          <div className="w-11 h-11 mx-auto rounded-xl bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-400 mb-3">
            <Icon name="briefcase" size={20} />
          </div>
          <div className="text-[13px] font-medium text-slate-700">Organisation not found on this desk</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[920px] 2xl:max-w-[1280px] 3xl:max-w-[1440px] mx-auto px-5 sm:px-8 py-6 sm:py-7">
      <OrgDetail org={org} />
    </div>
  );
}
