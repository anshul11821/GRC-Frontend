"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { isAuthError, mentorApi, OUTCOME_LABEL, type MenteeGate } from "@/lib/mentor";

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
  loading: boolean;
  refresh: () => void;
}

const MenteeGatesContext = createContext<GatesValue>({
  byActivity: new Map(),
  gates: [],
  loading: true,
  refresh: () => {},
});

export function MenteeGatesProvider({
  menteeId,
  children,
}: {
  menteeId: string;
  children: React.ReactNode;
}) {
  const [gates, setGates] = useState<MenteeGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  // Reset during render when the desk switches learner, not inside the effect: an effect-time
  // reset paints one mentee's gate states under another mentee's tree for a frame, and on a review
  // surface that frame says the wrong person has work waiting.
  const [prevKey, setPrevKey] = useState(menteeId);
  if (menteeId !== prevKey) {
    setPrevKey(menteeId);
    setGates([]);
    setLoading(true);
  }

  useEffect(() => {
    let live = true;
    mentorApi
      .menteeGates(menteeId)
      .then((g) => {
        if (live) setGates(g);
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

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  const value = useMemo<GatesValue>(
    () => ({ byActivity: new Map(gates.map((g) => [g.activityId, g])), gates, loading, refresh }),
    [gates, loading, refresh],
  );

  return <MenteeGatesContext.Provider value={value}>{children}</MenteeGatesContext.Provider>;
}

export const useMenteeGates = () => useContext(MenteeGatesContext);

/** Awaiting > decided > not submitted — the order a reviewer cares about. */
export function gateTone(g: MenteeGate): { label: string; cls: string } {
  if (g.state === "awaiting") {
    return { label: "Needs your decision", cls: "bg-[#fdecec] text-[#a31d1d]" };
  }
  if (g.state === "decided") {
    const approved = g.outcome?.startsWith("approve");
    return {
      label: g.outcome ? OUTCOME_LABEL[g.outcome] : "Decided",
      cls: approved ? "bg-[#e8f5ee] text-[#1e7a46]" : "bg-[#fdecec] text-[#a31d1d]",
    };
  }
  return { label: "Not submitted", cls: "bg-slate-100 text-slate-500" };
}

/** The chip a gate step wears wherever it appears on the desk. */
export function GateChip({ gate }: { gate: MenteeGate }) {
  const tone = gateTone(gate);
  return (
    <span
      className={`shrink-0 inline-flex items-center h-[19px] px-2 rounded text-[10px] font-semibold ${tone.cls}`}
    >
      {tone.label}
    </span>
  );
}

/**
 * The link that opens this gate for review. Rendered as plain text when there is nothing to open —
 * a learner who has not submitted has no submission, and therefore nothing to review. Showing a
 * dead "Review" button there would be the same dead end in a different coat.
 *
 * `href` lets the desk point at its own step page, which now carries the review inline, while the
 * Dashboard worklist keeps opening the standalone card. Both render the same component; the
 * difference is only whether the learner's tree is around it.
 */
export function OpenCardLink({
  gate,
  href,
  className = "",
}: {
  gate: MenteeGate;
  href?: string;
  className?: string;
}) {
  if (gate.submissionId === null) {
    return (
      <span className={`shrink-0 text-[11.5px] text-slate-300 ${className}`}>Nothing to review</span>
    );
  }
  return (
    <Link
      href={href ?? `/mentor/card/${gate.submissionId}`}
      className={`shrink-0 inline-flex items-center gap-1 text-[12px] font-medium no-underline transition-colors ${
        gate.state === "awaiting"
          ? "text-indigo-600 hover:text-indigo-800"
          : "text-slate-500 hover:text-slate-800"
      } ${className}`}
    >
      {gate.state === "awaiting" ? "Review" : "Open"}
      <Icon name="arrowRight" size={13} />
    </Link>
  );
}
