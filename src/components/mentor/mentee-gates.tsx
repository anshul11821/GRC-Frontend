"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  forgetAnalytics,
  forgetMentee,
  loadGates,
  noteGateStarted,
  peekGates,
} from "@/components/mentor/desk-context";
import { isAuthError, type MenteeGate } from "@/lib/mentor";

/**
 * The learner's review gates, fetched once per desk and shared by every view inside it.
 *
 * The desk navigates by activity; a review card is keyed by *submission*. Without this map a gate
 * step on the desk has no way to open its own card, which is why the step page used to say "open
 * it from your worklist" — sending the reviewer back to a list of 50 rows to find the one they
 * were already looking at.
 *
 * One fetch, not one per step: a task has two gates and a tree has seventy, and asking per step
 * would be seventy round trips to render a page.
 */
interface GatesValue {
  byActivity: Map<string, MenteeGate>;
  gates: MenteeGate[];
  /** Whose desk this is. Empty until the fetch lands. */
  menteeName: string;
  menteeEmail: string;
  loading: boolean;
  refresh: () => void;
  /** Record locally that this mentor has begun marking a submission up. */
  noteStarted: (submissionId: number) => void;
}

const MenteeGatesContext = createContext<GatesValue>({
  byActivity: new Map(),
  gates: [],
  menteeName: "",
  menteeEmail: "",
  loading: true,
  refresh: () => {},
  noteStarted: () => {},
});

export function MenteeGatesProvider({
  menteeId,
  children,
}: {
  menteeId: string;
  children: React.ReactNode;
}) {
  // Seeded from the cache — a learner already opened this session paints with no loading state.
  const [gates, setGates] = useState<MenteeGate[]>(() => peekGates(menteeId)?.gates ?? []);
  const [who, setWho] = useState(() => {
    const hit = peekGates(menteeId);
    return { name: hit?.menteeName ?? "", email: hit?.menteeEmail ?? "" };
  });
  const [loading, setLoading] = useState(() => peekGates(menteeId) === undefined);
  const [nonce, setNonce] = useState(0);

  // Reset during render when the desk switches learner, not inside the effect: an effect-time
  // reset paints one mentee's gate states under another mentee's tree for a frame, and on a review
  // surface that frame says the wrong person has work waiting.
  const [prevKey, setPrevKey] = useState(menteeId);
  if (menteeId !== prevKey) {
    setPrevKey(menteeId);
    const known = peekGates(menteeId);
    setGates(known?.gates ?? []);
    setWho({ name: known?.menteeName ?? "", email: known?.menteeEmail ?? "" });
    setLoading(known === undefined);
  }

  useEffect(() => {
    let live = true;
    loadGates(menteeId)
      .then((d) => {
        if (!live) return;
        setGates(d.gates);
        setWho({ name: d.menteeName, email: d.menteeEmail });
      })
      .catch((e) => {
        // A desk that cannot load gate state is still a readable desk — degrade, don't blank.
        if (!isAuthError(e) && live) setGates([]);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [menteeId, nonce]);

  // A decision changes this learner's gate map, so the cached copy has to go with it — otherwise
  // the reviewer approves a step and it still reads "awaiting".
  const noteStarted = useCallback(
    (submissionId: number) => {
      setGates((prev) =>
        prev.map((g) => (g.submissionId === submissionId ? { ...g, started: true } : g)),
      );
      noteGateStarted(menteeId, submissionId);
    },
    [menteeId],
  );

  const refresh = useCallback(() => {
    forgetMentee(menteeId);
    // The dashboard counts what is awaiting, in rework and decided this week. Every one of those
    // moves when a gate is decided, so a stale copy would tell the reviewer nothing happened.
    forgetAnalytics();
    setNonce((n) => n + 1);
  }, [menteeId]);
  const value = useMemo<GatesValue>(
    () => ({
      byActivity: new Map(gates.map((g) => [g.activityId, g])),
      gates,
      menteeName: who.name,
      menteeEmail: who.email,
      loading,
      refresh,
      noteStarted,
    }),
    [gates, who, loading, refresh, noteStarted],
  );

  return <MenteeGatesContext.Provider value={value}>{children}</MenteeGatesContext.Provider>;
}

export const useMenteeGates = () => useContext(MenteeGatesContext);
