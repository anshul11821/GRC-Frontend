"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { DeskLearningsProvider, type DeskSource } from "@/components/app/desk-context";
import { DeskSidebar } from "@/components/app/desk-sidebar";
import { MenteeGatesProvider } from "@/components/mentor/mentee-gates";
import { mentorApi } from "@/lib/mentor";

/**
 * One mentee's Working Desk, mounted inside the mentor console.
 *
 * This is the learner's own desk — the same `DeskSidebar`, fed by the same `build_learnings_response`
 * on the server — pointed at a different learner and linked to a different route prefix. Nothing
 * about the tree is reimplemented, which is the point: a mentor arguing with a mentee about what
 * their desk shows would be a bug we could not see from here.
 *
 * No schedule is loaded. Deadlines are the learner's own, they mean nothing to the reviewer, and
 * fetching them would be a round trip per desk open for a column nobody reads.
 */
export default function MenteeDeskLayout({ children }: { children: React.ReactNode }) {
  const { menteeId } = useParams<{ menteeId: string }>();

  // Keyed per mentee, or the cache serves one learner's tree for another — the single worst thing
  // this page could do. Memoised so the provider does not remount on every render.
  const source = useMemo<DeskSource>(
    () => ({
      key: `mentor:learnings:${menteeId}`,
      fetch: () => mentorApi.menteeLearnings(menteeId),
      schedule: null,
    }),
    [menteeId],
  );

  return (
    <MentorShell>
      <DeskLearningsProvider source={source} basePath={`/mentor/desk/${menteeId}`}>
        <MenteeGatesProvider menteeId={menteeId}>
        <div className="h-full flex min-h-0">
          <div className="hidden md:block w-[300px] shrink-0 border-r border-[#e6eaf0] bg-white/50 overflow-y-auto">
            <DeskSidebar />
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="px-6 pt-5">
              <Link
                href="/mentor/desk"
                className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-slate-800 transition-colors no-underline"
              >
                <Icon name="arrowLeft" size={14} /> All mentees
              </Link>
            </div>
            {children}
          </div>
        </div>
        </MenteeGatesProvider>
      </DeskLearningsProvider>
    </MentorShell>
  );
}
