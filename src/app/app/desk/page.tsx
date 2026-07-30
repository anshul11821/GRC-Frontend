"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeskLearnings } from "@/components/app/desk-context";
import { Card } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { PageSkeleton } from "@/components/ui/skeleton";

/** Working Desk entry — routes to the current organisation's context page. That's the desk's landing
 *  surface: the client brief you work from, with the tree alongside already expanded on your current
 *  task (the sidebar opens the active org, category and task on its own). */
export default function DeskHome() {
  const router = useRouter();
  const { learnings, loading } = useDeskLearnings();
  // Resolve where to send the user: the active org's id, undefined while loading, null when nothing is open.
  const targetOrgId = useMemo<string | null | undefined>(() => {
    if (loading) return undefined;
    if (!learnings) return null;
    const orgs = learnings.orgs;
    const open = (o: (typeof orgs)[number]) => o.status !== "locked" && o.status !== "upcoming" && o.status !== "complete";
    return (orgs.find((o) => o.status === "active") ?? orgs.find(open))?.id ?? null;
  }, [loading, learnings]);

  useEffect(() => {
    if (targetOrgId) router.replace(`/app/desk/org/${targetOrgId}`);
  }, [targetOrgId, router]);

  // Still resolving, or navigating to the resolved org → keep the skeleton up.
  if (targetOrgId === undefined || targetOrgId) {
    return <PageSkeleton cards={4} />;
  }
  return (
    <div className="max-w-[680px] mx-auto px-6 py-10">
      <Card className="text-center py-12">
        <div className="w-11 h-11 mx-auto rounded-xl bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-400 mb-3"><Icon name="desk" size={20} /></div>
        <div className="text-[13px] font-medium text-slate-700">No open activity</div>
        <Link href="/app/learnings" className="inline-block mt-4 text-[12.5px] text-indigo-600 hover:text-indigo-700">Browse My Learnings →</Link>
      </Card>
    </div>
  );
}
