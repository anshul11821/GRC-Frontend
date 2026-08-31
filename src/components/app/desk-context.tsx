"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { learningsApi, type Learnings } from "@/lib/learnings";
import { scheduleApi, type ScheduleItem } from "@/lib/schedule";
import { useCachedQuery } from "@/lib/use-query";

interface DeskLearningsValue {
  learnings: Learnings | null;
  loading: boolean;
  refresh: () => Promise<void>;
  /** activityId -> its scheduled day + status (for deadlines on the desk). */
  scheduleByActivity: Map<string, ScheduleItem>;
}

const DeskLearningsContext = createContext<DeskLearningsValue>({
  learnings: null,
  loading: true,
  refresh: async () => {},
  scheduleByActivity: new Map(),
});

/**
 * Where the desk gets its tree from.
 *
 * Defaults to the signed-in learner's own. A mentor reviewing somebody's work mounts the same desk
 * pointed at *that* learner — same components, same rendering, so the mentor cannot be looking at
 * a different desk from the one the mentee worked in. Same shape as `TaskBundleSourceProvider` in
 * `lib/task-bundle`, which already does this for the review card's workspace replay.
 */
export interface DeskSource {
  /** Cache key. Must be distinct per learner or one mentee's tree is served for another. */
  key: string;
  fetch: () => Promise<Learnings>;
  /** A mentor's view has no schedule of its own — deadlines belong to the learner. */
  schedule?: { key: string; fetch: () => Promise<ScheduleItem[]> } | null;
}

const OWN_DESK: DeskSource = {
  key: "learnings:grc101",
  fetch: () => learningsApi.get("grc101"),
  schedule: { key: "schedule:grc101", fetch: () => scheduleApi.get("grc101") },
};

/**
 * Shares the engagement tree across the whole Working Desk (sidebar, overview, redirect),
 * via the app-wide cache key ("learnings:grc101") — so it's also shared with the Dashboard
 * and My Learnings pages, making navigation between them instant.
 */
export function DeskLearningsProvider({
  children,
  source = OWN_DESK,
  basePath = "/app/desk",
}: {
  children: React.ReactNode;
  source?: DeskSource;
  basePath?: string;
}) {
  const { data, loading, mutate } = useCachedQuery(source.key, source.fetch);
  const sched = source.schedule;
  const { data: schedule, mutate: mutateSchedule } = useCachedQuery(
    sched ? sched.key : null,
    sched ? sched.fetch : async () => [] as ScheduleItem[],
  );

  const scheduleByActivity = useMemo(
    () => new Map((schedule ?? []).map((s) => [s.activityId, s])),
    [schedule],
  );

  // After a submit unlocks the next step, pull fresh data and update the shared cache. On a
  // mentor's view the same call re-reads that learner's tree after a gate decision, which is
  // exactly what has to happen: a return re-locks the step underneath them.
  const refresh = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([
        source.fetch(),
        sched ? sched.fetch() : Promise.resolve([] as ScheduleItem[]),
      ]);
      mutate(l);
      mutateSchedule(s);
    } catch {
      /* keep prior data on transient errors */
    }
  }, [source, sched, mutate, mutateSchedule]);

  return (
    <DeskBaseContext.Provider value={basePath}>
      <DeskLearningsContext.Provider value={{ learnings: data ?? null, loading, refresh, scheduleByActivity }}>
        {children}
      </DeskLearningsContext.Provider>
    </DeskBaseContext.Provider>
  );
}

export const useDeskLearnings = () => useContext(DeskLearningsContext);

/**
 * Route prefix the desk links against. The learner's desk lives at `/app/desk`; a mentor viewing
 * a mentee's desk lives at `/mentor/desk/<menteeId>`. Everything below — the tree, the task list,
 * the step links — is the same components either way, so the one thing that genuinely differs is
 * where a click goes. A context rather than a prop because the sidebar threads links three levels
 * deep and every level would otherwise have to pass it on.
 */
const DeskBaseContext = createContext("/app/desk");
export const useDeskBase = () => useContext(DeskBaseContext);

/** Show/hide the activity tree from outside DeskLayout — the walkthrough runs on a child route but
 *  has to spotlight the tree, which is an off-canvas drawer on small screens. No-op on md+, where
 *  the rail is always there. */
/** Fire from anywhere inside the desk to (re)start the walkthrough — the org page's Guide button
 *  uses it. A window event keeps the trigger decoupled from DeskLayout, which owns the tour. */
export const DESK_TOUR_EVENT = "grc:desk-tour";
export const startDeskTour = () => window.dispatchEvent(new Event(DESK_TOUR_EVENT));

export const DESK_TREE_EVENT = "grc:desk-tree";
export const showDeskTree = (open: boolean) => {
  if (window.matchMedia("(max-width: 767px)").matches) {
    window.dispatchEvent(new CustomEvent(DESK_TREE_EVENT, { detail: { open } }));
  }
};
