"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { willEscalate, type Reason } from "@/lib/mentor";

/**
 * Forces at least one documented reason code before a decision commits. Approve reasons carry no
 * corrective action; disapprove reasons show the text the mentee would be given for each.
 *
 * Hotkeys 1-6 toggle reasons, Esc cancels, Cmd/Ctrl+Enter confirms — but everything except Esc and
 * Cmd/Ctrl+Enter is suppressed while the note field has focus, so typing a digit in the note can
 * never silently toggle a reason.
 */
export function ReasonSheet({
  mode,
  reasons,
  priorReturns,
  maxReturns,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  mode: "approve" | "disapprove" | null;
  reasons: Reason[];
  priorReturns: number;
  maxReturns: number;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (codes: string[], note: string, requireAck: boolean) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [requireAck, setRequireAck] = useState(false);
  const open = mode !== null;
  const escalating = mode === "disapprove" && willEscalate(priorReturns, maxReturns);

  // Clear the previous decision's selection during render when the sheet opens or switches mode,
  // so an approve sheet can never paint holding a disapprove sheet's checked reasons.
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setSelected([]);
    setNote("");
    setRequireAck(false);
  }

  // The drawer stays mounted when closed, so a focused note field keeps focus after Esc — and the
  // card's A/D hotkeys, which ignore keys typed into a field, would silently stop working. Hand
  // focus back to the document when the sheet closes.
  useEffect(() => {
    if (!open) (document.activeElement as HTMLElement | null)?.blur();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === "TEXTAREA" || target?.tagName === "INPUT";
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (selected.length && !busy) onConfirm(selected, note, requireAck && !!note.trim());
        return;
      }
      if (typing) return; // Esc is handled by the Drawer itself
      if (/^[1-9]$/.test(e.key)) {
        const reason = reasons[Number(e.key) - 1];
        if (reason) {
          e.preventDefault();
          toggle(reason.code);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  function toggle(code: string) {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  const outcomeLabel =
    mode === "approve" ? "Approve" : escalating ? "Disapprove — escalate" : "Disapprove — return";

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      width="min(560px,100vw)"
      eyebrow={mode === "approve" ? "Approve" : "Disapprove"}
      title="Document your reason"
    >
      {escalating && (
        <div className="mb-4 rounded-xl border border-[#f4cccc] bg-[#fdecec] px-4 py-3">
          <div className="text-[12.5px] font-semibold text-[#a31d1d]">
            This converts to “Disapprove — escalate”
          </div>
          <div className="text-[12px] text-[#a31d1d]/85 leading-relaxed mt-1">
            This gate has already been returned {priorReturns} time{priorReturns === 1 ? "" : "s"} —
            the limit is {maxReturns}. Confirming raises it to the Programme Manager and the gate
            does not reopen for the mentee.
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {reasons.map((reason, i) => {
          const on = selected.includes(reason.code);
          return (
            <button
              key={reason.code}
              onClick={() => toggle(reason.code)}
              className={`w-full text-left flex gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                on ? "border-indigo-300 bg-indigo-50/60" : "border-[#e6eaf0] bg-white hover:bg-slate-50"
              }`}
            >
              <span
                className={`mt-0.5 shrink-0 w-4 h-4 rounded border grid place-items-center ${
                  on ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white"
                }`}
              >
                {on && (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3.5}>
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[10.5px] text-slate-500">{reason.code}</span>
                <span className="block text-[12.5px] text-slate-800 leading-snug mt-0.5">{reason.text}</span>
                {reason.action && (
                  <span className="block text-[11.5px] text-[#a3541d] leading-snug mt-1.5">
                    <span className="font-semibold">Mentee sees:</span> {reason.action}
                  </span>
                )}
              </span>
              <span className="shrink-0 self-start font-mono text-[10px] text-slate-400 mt-0.5">{i + 1}</span>
            </button>
          );
        })}
      </div>

      <label className="block mt-4">
        <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
          Note (optional)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Anything the reason codes do not capture."
          className="w-full rounded-xl border border-[#e6eaf0] bg-white px-3 py-2.5 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300"
        />
      </label>

      {/* Approve with note: the work is good enough to release, but a habit needs correcting.
          Releases the step and costs no revision — it just will not complete until they read it. */}
      {mode === "approve" && (
        <label
          className={`mt-2 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 ${
            note.trim() ? "cursor-pointer border-[#e6eaf0] hover:bg-slate-50" : "border-[#f1f5f9] opacity-50"
          }`}
        >
          <input
            type="checkbox"
            checked={requireAck && !!note.trim()}
            disabled={!note.trim()}
            onChange={(e) => setRequireAck(e.target.checked)}
            className="mt-0.5 w-4 h-4 shrink-0 accent-indigo-600"
          />
          <span className="text-[12.5px] text-slate-700 leading-snug">
            The mentee must read this note before the step completes
            <span className="block text-[11.5px] text-slate-400 mt-0.5">
              {note.trim()
                ? "Approves and releases the work; costs them no revision."
                : "Write a note above to use this."}
            </span>
          </span>
        </label>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-[#f0c2c2] bg-[#fdecec] px-3 py-2 text-[12px] text-[#a31d1d]">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 -mx-6 mt-5 border-t border-[#e6eaf0] bg-white px-6 pt-3 pb-1">
        <div className="text-[11.5px] text-slate-500 mb-2.5">
          {selected.length === 0
            ? "Select at least one reason."
            : `${outcomeLabel} · ${selected.length} reason${selected.length > 1 ? "s" : ""} · ${selected
                .map((c) => c.split(".").pop())
                .join(", ")}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="h-9 px-3.5 rounded-lg border border-[#e6eaf0] bg-white text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selected, note, requireAck && !!note.trim())}
            disabled={selected.length === 0 || busy}
            className={`h-9 px-4 rounded-lg text-[12.5px] font-semibold transition-colors ${
              selected.length === 0 || busy
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : mode === "approve"
                  ? "bg-[#1e7a46] text-white hover:bg-[#1a6b3d]"
                  : "bg-[#a31d1d] text-white hover:bg-[#8f1919]"
            }`}
          >
            {busy ? "Saving…" : `Confirm ${outcomeLabel}`}
          </button>
          <span className="ml-auto text-[10.5px] text-slate-400 font-mono hidden sm:block">
            1–{Math.min(reasons.length, 9)} toggle · ⌘/Ctrl+Enter confirm · Esc cancel
          </span>
        </div>
      </div>
    </Drawer>
  );
}
