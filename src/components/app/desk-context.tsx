"use client";

import { createContext, useCallback, useContext } from "react";
import { learningsApi, type Learnings } from "@/lib/learnings";
import { useCachedQuery } from "@/lib/use-query";

interface DeskLearningsValue {
  learnings: Learnings | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DeskLearningsContext = createContext<DeskLearningsValue>({
  learnings: null,
  loading: true,
  refresh: async () => {},
});

/**
 * Shares the engagement tree across the whole Working Desk (sidebar, overview, redirect),
 * via the app-wide cache key ("learnings:grc101") — so it's also shared with the Dashboard
 * and My Learnings pages, making navigation between them instant.
 */
export function DeskLearningsProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, mutate } = useCachedQuery("learnings:grc101", () => learningsApi.get("grc101"));

  // After a submit unlocks the next step, pull fresh data and update the shared cache.
  const refresh = useCallback(async () => {
    try {
      mutate(await learningsApi.get("grc101"));
    } catch {
      /* keep prior data on transient errors */
    }
  }, [mutate]);

  return (
    <DeskLearningsContext.Provider value={{ learnings: data ?? null, loading, refresh }}>
      {children}
    </DeskLearningsContext.Provider>
  );
}

export const useDeskLearnings = () => useContext(DeskLearningsContext);
