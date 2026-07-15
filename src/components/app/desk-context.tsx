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
 * Shares the engagement tree across the whole Working Desk (sidebar, overview, redirect),
 * via the app-wide cache key ("learnings:grc101") — so it's also shared with the Dashboard
 * and My Learnings pages, making navigation between them instant.
 */
export function DeskLearningsProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, mutate } = useCachedQuery("learnings:grc101", () => learningsApi.get("grc101"));
  const { data: schedule, mutate: mutateSchedule } = useCachedQuery("schedule:grc101", () => scheduleApi.get("grc101"));

  const scheduleByActivity = useMemo(
    () => new Map((schedule ?? []).map((s) => [s.activityId, s])),
    [schedule],
  );

  // After a submit unlocks the next step, pull fresh data and update the shared cache.
  const refresh = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([learningsApi.get("grc101"), scheduleApi.get("grc101")]);
      mutate(l);
      mutateSchedule(s);
    } catch {
      /* keep prior data on transient errors */
    }
  }, [mutate, mutateSchedule]);

  return (
    <DeskLearningsContext.Provider value={{ learnings: data ?? null, loading, refresh, scheduleByActivity }}>
      {children}
    </DeskLearningsContext.Provider>
  );
}

export const useDeskLearnings = () => useContext(DeskLearningsContext);
