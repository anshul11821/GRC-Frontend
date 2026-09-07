"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { UndoToast } from "@/components/mentor/undo-toast";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api";
import { loadCard, peekCard } from "@/components/mentor/desk-context";
import { VERDICTS, VERDICT, rollUp, type Verdict } from "@/lib/verdicts";
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
  const seed = (id: number | null) => (id === null ? null : (peekCard(id) ?? null));
  // Seeded from the cache, so a step already read this session paints with no skeleton at all.
  const [card, setCard] = useState<Card | null>(() => seed(submissionId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Reset during render when the card changes, not inside the effect — walking down a task would
  // otherwise paint the previous step's submission under the new step's heading for a frame.
  const [prevId, setPrevId] = useState(submissionId);
  if (submissionId !== prevId) {
    setPrevId(submissionId);
    setCard(seed(submissionId));
    setLoadError(null);
  }

  useEffect(() => {
    // Null on a step the learner has not submitted: there is no card, and asking for one would be
    // a 404 for every unsubmitted step a reviewer walks past.
    if (submissionId === null) return;
    let live = true;
    loadCard(submissionId)
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
 * The verdict on the whole delivery — the same four the reviewer gave each part, one scope up.
 *
 * They map onto the four outcomes the programme already had (`VERDICT_OUTCOME` on the server), so
 * nothing about progression changes: approve releases the step, observe releases it but the mentee
 * must read the note first, changes returns it with an extra attempt, reject escalates and does
 * not reopen. What changes is that the reviewer names the judgement instead of choosing between
 * "Approve" and "Return with reasons" and hoping the note carries the difference.
 *
 * It lives in the pipeline bar, beside the stage the delivery has reached, so the decision is one
 * click away from wherever the reviewer has scrolled to in a thirty-row register. Committing opens
 * a centred prompt rather than expanding the bar: what it says depends on the verdict, and a bar
 * that changes height under the cursor moves the work being decided.
 */
export function ReviewDecision({
  card,
  onDecided,
  /**
   * Parts with no verdict yet. While any remain the delivery cannot be decided: a mentor who has
   * read three rows of a thirty-row register has not reviewed it, and the count is the only thing
   * that can tell them apart.
   */
  outstanding = 0,
  /** The whole review, held in the browser until this moment. */
  marks = [],
}: {
  card: Card;
  onDecided?: () => void;
  outstanding?: number;
  marks?: ReviewMark[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Verdict | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<DecisionResult | null>(null);
  const [raced, setRaced] = useState(false);

  const blocked = card.decidedBy !== null || raced;
  const incomplete = outstanding > 0;
  // What the parts add up to. Offered, never imposed — a reviewer may want changes on one row of a
  // thirty-row register and still release the step, and only they can say.
  const suggested = rollUp(marks.map((m) => m.kind));

  async function confirm() {
    if (!pending) return;
    const d = VERDICT[pending];
    if (d.needsNote && !note.trim()) return;
    setBusy(true);
    setError(null);
    try {
      // No reason codes: the checklist that produced them is gone, and the verdicts on the parts
      // are the reasons now. `requireAck` is implied by `observe` on the server.
      const res = await mentorApi.decide(card.submissionId, pending, note, false, marks);
      setPending(null);
      setToast(res);
    } catch (e) {
      // 409 means someone else closed this card while it was open — the design's race case.
      if (e instanceof ApiError && e.status === 409) {
        setPending(null);
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

  const d = pending ? VERDICT[pending] : null;
  const why = blocked
    ? raced
      ? "Decided elsewhere while you had it open."
      : `Already decided by ${card.decidedBy}.`
    : incomplete
      ? `${outstanding} part${outstanding === 1 ? "" : "s"} still to decide`
      : null;

  // No label of its own. "6 parts still to decide" sat beside a pill already reading 0/6 — the
  // same fact twice, taking the width that made the bar wrap onto a second line. The pill says
  // how far along the review is; these buttons only have to say what they do.
  return (
    <>
      {blocked && (
        <span className="text-[11px] text-slate-500">
          {raced ? "Decided elsewhere" : `Decided by ${card.decidedBy}`}
        </span>
      )}
      {VERDICTS.map((v) => (
        <button
          key={v.id}
          onClick={() => {
            setError(null);
            setNote("");
            setPending(v.id);
          }}
          disabled={blocked || incomplete}
          title={why ?? v.label}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[12.5px] font-semibold ring-1 transition-colors disabled:bg-slate-50 disabled:text-slate-300 disabled:ring-slate-200 ${v.idle}`}
        >
          <Icon name={v.icon} size={13} strokeWidth={2.1} />
          {/* "Approve with observation" is the one that costs the bar a second row. */}
          <span className="hidden 2xl:inline">{v.label}</span>
          <span className="2xl:hidden">{v.terse}</span>
          {/* A dot, not the word "suggested": four labelled buttons plus a pipeline is already the
              whole width of the bar. */}
          {suggested === v.id && !blocked && !incomplete && (
            <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} title="What your verdicts on the parts add up to" />
          )}
        </button>
      ))}

      {d &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[75] flex items-start justify-center bg-slate-900/25 px-4 pt-[14vh]"
            onMouseDown={() => !busy && setPending(null)}
          >
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full max-w-[480px] rounded-xl border border-[#e6eaf0] bg-white p-4 shadow-[0_24px_60px_-18px_rgba(15,23,42,0.4)]"
            >
              <div className="flex items-baseline gap-2">
                <h3 className="text-[14px] font-semibold tracking-tight text-slate-900">
                  {d.id === "approve"
                    ? "Approve this delivery?"
                    : d.id === "observe"
                      ? "Approve with an observation?"
                      : d.id === "changes"
                        ? willEscalate(card.priorReturns, card.maxReturns)
                          ? "This will escalate instead"
                          : "Request changes on this delivery?"
                        : "Reject this delivery?"}
                </h3>
                {d.needsNote && (
                  <span className="text-[11px] font-semibold text-[#a31d1d]">note required</span>
                )}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                {d.id === "approve"
                  ? "The step is released and your review is sent to the mentee. It cannot be edited afterwards."
                  : d.id === "observe"
                    ? "The step is released, but does not complete until the mentee has read your note. It costs them no attempt."
                    : d.id === "changes"
                      ? willEscalate(card.priorReturns, card.maxReturns)
                        ? `This gate has already been returned ${card.priorReturns} times — the limit is ${card.maxReturns}. Confirming raises it to the Programme Manager and the gate does not reopen.`
                        : "The step reopens with an extra attempt. Resubmitting spends it, so say exactly what has to change."
                      : "The gate does not reopen. The mentee is shown the worked reference answer instead, and acknowledging it releases the step — nobody is left permanently stuck."}
              </p>

              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder={
                  d.id === "observe"
                    ? "What should they note for next time?"
                    : d.id === "changes"
                      ? "What has to change before they resubmit?"
                      : d.id === "reject"
                        ? "Why does this delivery end here?"
                        : "Anything to say about the delivery as a whole (optional)."
                }
                className="mt-3 w-full resize-none rounded-lg border border-[#e6eaf0] px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
              />

              {error && (
                <div className="mt-2 rounded-lg border border-[#f0c2c2] bg-[#fdecec] px-3 py-2 text-[12px] text-[#a31d1d]">
                  {error}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={confirm}
                  disabled={busy || (d.needsNote && !note.trim())}
                  className={`h-9 rounded-md px-3.5 text-[12.5px] font-semibold transition-colors ${
                    busy || (d.needsNote && !note.trim())
                      ? "bg-slate-100 text-slate-400"
                      : d.btn
                  }`}
                >
                  {busy ? "Sending…" : `Yes, ${d.label.toLowerCase()}`}
                </button>
                <button
                  onClick={() => setPending(null)}
                  disabled={busy}
                  className="h-9 rounded-md px-3 text-[12.5px] font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                {d.needsNote && !note.trim() && (
                  <span className="text-[11px] text-slate-400">
                    This verdict has to say what it is asking for.
                  </span>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

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
    </>
  );
}
