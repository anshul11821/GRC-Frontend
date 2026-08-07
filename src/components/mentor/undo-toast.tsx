"use client";

import { useEffect, useState } from "react";
import { OUTCOME_LABEL, type Outcome } from "@/lib/mentor";

/**
 * Sixty-second withdrawal window after a decision, also triggered by U. The countdown here is
 * cosmetic — the server enforces the real window and rejects a late undo, so a paused tab or a
 * skewed clock cannot buy extra time.
 */
export function UndoToast({
  outcome,
  gateId,
  seconds,
  onUndo,
  onExpire,
}: {
  outcome: Outcome;
  gateId: string;
  seconds: number;
  onUndo: () => void;
  onExpire: () => void;
}) {
  const [left, setLeft] = useState(seconds);

  // Restart the countdown during render when a new decision replaces the current toast, so the
  // old decision's remaining seconds never show against the new gate id.
  const [prevKey, setPrevKey] = useState(`${gateId}:${seconds}`);
  if (prevKey !== `${gateId}:${seconds}`) {
    setPrevKey(`${gateId}:${seconds}`);
    setLeft(seconds);
  }

  useEffect(() => {
    if (left <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onExpire]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA" || target?.tagName === "INPUT") return;
      if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        onUndo();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onUndo]);

  if (left <= 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 rounded-full bg-[#0f172a] pl-5 pr-2 py-2 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.6)]">
      <span className="text-[12.5px] text-white">
        {OUTCOME_LABEL[outcome]} · <span className="font-mono text-[11.5px] text-white/70">{gateId}</span>
      </span>
      <button
        onClick={onUndo}
        className="h-7 px-3 rounded-full bg-white/12 text-[12px] font-medium text-white hover:bg-white/20 transition-colors"
      >
        Undo ({left}s)
      </button>
    </div>
  );
}
