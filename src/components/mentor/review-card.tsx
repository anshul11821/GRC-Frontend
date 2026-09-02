"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { UndoToast } from "@/components/mentor/undo-toast";
import { ApiError } from "@/lib/api";
import {
  isAuthError,
  mentorApi,
  willEscalate,
  type Card,
  type DecisionResult,
  type ReviewMark,
} from "@/lib/mentor";

/**
 * Load one review card. Split out so a surface can compose the review itself — the brief, the
 * submission, the decision — in its own layout, rather than embedding the whole tabbed card and
 * inheriting a second header with it.
 */
export function useReviewCard(submissionId: number | null) {
  const [card, setCard] = useState<Card | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Reset during render when the card changes, not inside the effect — walking down a task would
  // otherwise paint the previous step's submission under the new step's heading for a frame.
  const [prevId, setPrevId] = useState(submissionId);
  if (submissionId !== prevId) {
    setPrevId(submissionId);
    setCard(null);
    setLoadError(null);
  }

  useEffect(() => {
    // Null on a step the learner has not submitted: there is no card, and asking for one would be
    // a 404 for every unsubmitted step a reviewer walks past.
    if (submissionId === null) return;
    let live = true;
    mentorApi
      .card(submissionId)
      .then((c) => {
        if (live) setCard(c);
      })
      .catch((e) => {
        if (!live || isAuthError(e)) return;
        setLoadError(e instanceof ApiError ? e.message : "Could not load this card.");
      });
    return () => {
      live = false;
    };
  }, [submissionId, nonce]);

  return { card, loadError, reload: useCallback(() => setNonce((n) => n + 1), []) };
}

/**
 * The decision: the gate's six questions, Approve / Return, and everything that hangs off them —
 * the reason sheet, the undo window, and the race when somebody else closes the card first.
 *
 * Owns its own state so any layout can drop it in. The learner-shaped step page on the Review Desk
 * puts it under the deliverable, where a mentee's Submit button sits; the standalone card puts it
 * in the right-hand rail. Same component, so the two can never become two different reviews.
 */
export function ReviewDecision({
  card,
  onDecided,
  className = "",
  /**
   * Anchors still to be marked reviewed or commented on. While any remain the decision is not
   * available: a mentor who has read three rows of a thirty-row register has not reviewed it, and
   * the count is the only thing that can tell them apart.
   */
  outstanding = 0,
  /** True when the reviewer has written at least one comment on the work. */
  hasComments = false,
  /** The whole review, held in the browser until this moment. */
  marks = [],
}: {
  card: Card;
  onDecided?: () => void;
  className?: string;
  outstanding?: number;
  hasComments?: boolean;
  marks?: ReviewMark[];
}) {
  const router = useRouter();
  // Confirming happens in place. It was a right-hand drawer, which is a lot of machinery for
  // "are you sure" — it covered the work being decided on, and the reviewer had just read the
  // whole review in the panel below the buttons anyway.
  const [confirming, setConfirming] = useState<"approve" | "disapprove" | null>(null);
  const [note, setNote] = useState("");
  const [requireAck, setRequireAck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<DecisionResult | null>(null);
  const [raced, setRaced] = useState(false);

  const open = useCallback((mode: "approve" | "disapprove") => {
    setError(null);
    setConfirming(mode);
  }, []);

  async function confirm() {
    if (!confirming) return;
    setBusy(true);
    setError(null);
    try {
      // No reason codes: the checklist that produced them is gone, and the comments on the work
      // are the reasons now.
      const res = await mentorApi.decide(
        card.submissionId,
        confirming,
        note,
        requireAck && !!note.trim(),
        marks,
      );
      setConfirming(null);
      setToast(res);
    } catch (e) {
      // 409 means someone else closed this card while it was open — the design's race case.
      if (e instanceof ApiError && e.status === 409) {
        setConfirming(null);
        setRaced(true);
      } else {
        setError(e instanceof ApiError ? e.message : "Could not record the decision.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    if (!toast) return;
    try {
      await mentorApi.undo(toast.decisionId);
    } finally {
      setToast(null);
    }
  }

  const decisionBlocked = card.decidedBy !== null || raced;
  const incomplete = outstanding > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* The six-question checklist is gone. It was inherited from the gate register's generic
          library — "is the population complete", "is the owner a role" — and asked the same six
          things of a stakeholder map and a risk calculation alike, so on most steps it did not
          describe the work in front of the reviewer. The comments on the entries are the reasons
          now, and the note is optional alongside them. */}
      <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-4">
        {confirming === null ? (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => open("approve")}
                disabled={decisionBlocked || incomplete}
                className="flex-1 h-10 rounded-lg bg-[#1e7a46] text-white text-[13px] font-semibold hover:bg-[#1a6b3d] disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => open("disapprove")}
                disabled={decisionBlocked || incomplete || !hasComments}
                title={
                  !hasComments
                    ? "Comment on what needs changing before returning the step"
                    : undefined
                }
                className="flex-1 h-10 rounded-lg border border-[#f0c2c2] text-[#a31d1d] text-[13px] font-semibold hover:bg-[#fdecec] disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent transition-colors"
              >
                Return with reasons
              </button>
            </div>
            {decisionBlocked ? (
              <p className="text-[11px] text-slate-500 mt-2.5">
                {raced
                  ? "Decided elsewhere while you had it open. Nothing you selected was submitted."
                  : `Already decided by ${card.decidedBy}.`}
              </p>
            ) : incomplete ? (
              <p className="text-[11px] text-slate-500 mt-2.5">
                {outstanding} {outstanding === 1 ? "entry has" : "entries have"} not been marked
                reviewed or commented on yet.
              </p>
            ) : (
              !hasComments && (
                <p className="text-[11px] text-slate-500 mt-2.5">
                  Returning a step needs at least one comment — the mentee has to be told what to
                  change.
                </p>
              )
            )}
          </>
        ) : (
          <div>
            <div className="text-[13px] font-semibold text-slate-900">
              {confirming === "approve"
                ? "Approve this step?"
                : willEscalate(card.priorReturns, card.maxReturns)
                  ? "Escalate this step?"
                  : "Return this step?"}
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed mt-1">
              {confirming === "approve"
                ? "The step is released and your review is sent to the mentee. It cannot be edited afterwards."
                : willEscalate(card.priorReturns, card.maxReturns)
                  ? `This gate has already been returned ${card.priorReturns} times — the limit is ${card.maxReturns}. Confirming raises it to the Programme Manager and the gate does not reopen.`
                  : "The step reopens for the mentee with an extra attempt, and your review is sent."}
            </p>

            <label className="block mt-3">
              <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
                Note to the mentee <span className="font-normal normal-case tracking-normal">(optional)</span>
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Anything to say about the step as a whole."
                className="w-full rounded-lg border border-[#e6eaf0] px-2.5 py-2 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300"
              />
            </label>

            {/* Approve with note: good enough to release, but a habit needs correcting. Costs no
                revision — the step simply does not complete until they have read it. */}
            {confirming === "approve" && note.trim() && (
              <label className="mt-2 flex items-start gap-2.5 rounded-lg border border-[#e6eaf0] px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={requireAck}
                  onChange={(e) => setRequireAck(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-indigo-600"
                />
                <span className="text-[12px] text-slate-700 leading-snug">
                  The mentee must read this note before the step completes
                </span>
              </label>
            )}

            {error && (
              <div className="mt-2 rounded-lg border border-[#f0c2c2] bg-[#fdecec] px-3 py-2 text-[12px] text-[#a31d1d]">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={confirm}
                disabled={busy}
                className={`h-9 px-4 rounded-lg text-[12.5px] font-semibold text-white transition-colors disabled:bg-slate-200 disabled:text-slate-400 ${
                  confirming === "approve"
                    ? "bg-[#1e7a46] hover:bg-[#1a6b3d]"
                    : "bg-[#a31d1d] hover:bg-[#8f1919]"
                }`}
              >
                {busy
                  ? "Sending…"
                  : confirming === "approve"
                    ? "Yes, approve"
                    : "Yes, return"}
              </button>
              <button
                onClick={() => setConfirming(null)}
                disabled={busy}
                className="h-9 px-3.5 rounded-lg border border-[#e6eaf0] bg-white text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <UndoToast
          outcome={toast.outcome}
          gateId={toast.gateId}
          seconds={toast.undoSeconds}
          onUndo={undo}
          onExpire={() => (onDecided ? onDecided() : router.push("/mentor"))}
        />
      )}

      {raced && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/40 px-6">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.4)]">
            <h2 className="text-[15px] font-semibold text-slate-900">This card was closed elsewhere</h2>
            <p className="text-[12.5px] text-slate-600 leading-relaxed mt-2">
              Another reviewer decided it while you had it open. Nothing you selected was submitted.
            </p>
            <button
              onClick={() => (onDecided ? onDecided() : router.push("/mentor"))}
              className="mt-5 w-full h-10 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 transition-colors"
            >
              Return to queue
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
