"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { DeskLearningsProvider, type DeskSource } from "@/components/app/desk-context";
import { DeskSidebar } from "@/components/app/desk-sidebar";
import { MenteeGatesProvider, useMenteeGates } from "@/components/mentor/mentee-gates";
import { TaskBundleSourceProvider, type TaskBundle, type TaskBundleSource } from "@/lib/task-bundle";
import { mentorApi } from "@/lib/mentor";

/**
 * One mentee's Working Desk, mounted inside the mentor console.
 *
 * This is the learner's own desk — the same `DeskSidebar`, the same task brief, the same
 * organisation context, fed by the same builders on the server — pointed at a different learner
 * and linked to a different route prefix. Nothing about it is reimplemented, which is the point: a
 * mentor and a mentee disagreeing about what the desk says would be a bug we could not see.
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
      {/* The gates load first because the tree is filtered by them: a mentor sees the steps they
          can decide, not all ten of a task's. */}
      <MenteeGatesProvider menteeId={menteeId}>
        <MenteeDesk menteeId={menteeId} source={source}>
          {children}
        </MenteeDesk>
      </MenteeGatesProvider>
    </MentorShell>
  );
}

/**
 * Sits inside MenteeGatesProvider so it can read the gate set and feed it to the desk as the step
 * filter. Split out because a provider cannot consume its own sibling's context.
 */
function MenteeDesk({
  menteeId,
  source,
  children,
}: {
  menteeId: string;
  source: DeskSource;
  children: React.ReactNode;
}) {
  const { gates, loading, menteeName, menteeEmail } = useMenteeGates();
  const [treeOpen, setTreeOpen] = useState(false);

  useEffect(() => {
    if (!treeOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTreeOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [treeOpen]);

  // Until the gates land, show nothing rather than every step: a tree that starts full and then
  // collapses to two rows reads as a bug.
  const stepFilter = useMemo(
    () => (loading ? new Set<string>() : new Set(gates.map((g) => g.activityId))),
    [gates, loading],
  );

  // The task brief is rendered per learner — same builder as the mentee's own desk, pointed at
  // them. Namespaced per mentee so one learner's Manila rendering is never served from cache for
  // another's Berlin one.
  const bundles = useMemo<TaskBundleSource>(
    () => ({
      key: `mentor:${menteeId}`,
      fetch: (taskCode: string) =>
        mentorApi.menteeTaskContent(menteeId, taskCode) as Promise<TaskBundle>,
    }),
    [menteeId],
  );

  return (
    <DeskLearningsProvider
      source={source}
      basePath={`/mentor/desk/${menteeId}`}
      stepFilter={stepFilter}
    >
      <TaskBundleSourceProvider source={bundles}>
        {/* Definite height so the rail and the content column each own their scroll. h-full
            resolves because MentorShell's <main> is a flex child with min-h-0. */}
        <div className="flex h-full min-h-0">
          {/* Drawer backdrop (mobile only). */}
          {treeOpen && (
            <div
              onClick={() => setTreeOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
          )}

          {/* The rail owns its own width — 288px, 344px at 2xl, 380px at 3xl. It used to sit in a
              fixed w-[300px] wrapper, which on a large screen clipped the wider rail and took the
              org expand chevron off the edge with it. Static on md+, off-canvas drawer below,
              which is also the only way to reach the tree on a narrow screen. */}
          <div
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setTreeOpen(false);
            }}
            className={`fixed inset-y-0 left-0 z-50 bg-white md:bg-transparent transition-transform duration-300 md:static md:z-auto md:shrink-0 md:translate-x-0 ${
              treeOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"
            }`}
          >
            <button
              onClick={() => setTreeOpen(false)}
              aria-label="Close activities"
              className="md:hidden absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-lg bg-white/80 ring-1 ring-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Icon name="x" size={16} />
            </button>
            <DeskSidebar />
          </div>

          <div className="flex-1 min-w-0 flex flex-col min-h-0">
            <div className="shrink-0 flex items-center gap-3 px-4 sm:px-6 h-14 border-b border-[#e6eaf0] bg-white/60 backdrop-blur-xl">
              <button
                onClick={() => setTreeOpen(true)}
                aria-label="Open activities"
                className="md:hidden inline-flex items-center gap-2 h-9 px-3 rounded-lg ring-1 ring-slate-200/70 bg-white text-slate-700 text-[12.5px] font-medium hover:bg-slate-50 transition-colors"
              >
                <Icon name="menu" size={16} /> Steps
              </button>
              <Link
                href="/mentor/desk"
                className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-slate-800 transition-colors no-underline shrink-0"
              >
                <Icon name="arrowLeft" size={14} /> All mentees
              </Link>

              {/* Whose desk this is, on every view of it. A reviewer several clicks into someone's
                  engagement with no name on screen has nothing to catch the mistake of reading the
                  wrong person's work — and the tree, the brief and the deliverable all look the
                  same whoever they belong to. */}
              {menteeName && (
                <div className="flex items-center gap-2 min-w-0 ml-1 pl-3 border-l border-[#e6eaf0]">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-[10px] font-semibold grid place-items-center">
                    {menteeName
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase() ?? "")
                      .join("") || "?"}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[12.5px] font-semibold text-slate-900 truncate">
                      {menteeName}
                    </span>
                    <span className="hidden sm:block text-[10.5px] text-slate-400 truncate">
                      {menteeEmail}
                    </span>
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
          </div>
        </div>
      </TaskBundleSourceProvider>
    </DeskLearningsProvider>
  );
}
