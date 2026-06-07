"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeskLearnings } from "@/components/app/desk-context";
import { Card } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { PageSkeleton } from "@/components/ui/skeleton";

/** Working Desk entry — routes to the current task's overview (first in-progress, else first task). */
export default function DeskHome() {
  const router = useRouter();
  const { learnings, loading } = useDeskLearnings();
  // Resolve where to send the user: the current task's code, undefined while loading, null when nothing is open.
  const targetCode = useMemo<string | null | undefined>(() => {
    if (loading) return undefined;
    if (!learnings) return null;
    for (const org of learnings.orgs) {
      if (org.status === "locked") continue;
      for (const proj of org.projects) {
        const task = proj.tasks.find((t) => t.status === "in-progress") ?? proj.tasks.find((t) => t.status === "not-started") ?? proj.tasks[0];
        if (task) return task.code;
      }
    }
    return null;
  }, [loading, learnings]);

  useEffect(() => {
    if (targetCode) router.replace(`/app/desk/task/${targetCode}`);
  }, [targetCode, router]);

  // Still resolving, or navigating to the resolved task → keep the skeleton up.
  if (targetCode === undefined || targetCode) {
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
