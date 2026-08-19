"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { ReasonSheet } from "@/components/mentor/reason-sheet";
import { UndoToast } from "@/components/mentor/undo-toast";
import { SubmittedWork } from "@/components/mentor/submitted-work";
import { ReferenceMaterial } from "@/components/app/reference-material";
import { ApiError } from "@/lib/api";
import {
  formatRemaining,
  formatSubmitted,
  isAuthError,
  itemAsReason,
  mentorApi,
  OUTCOME_LABEL,
  type Brief,
  type Card,
  type DecisionResult,
  type HistoryEntry,
  type Step,
} from "@/lib/mentor";

export default function MentorCardPage() {
  return (
    <MentorShell>
      <CardBody />
    </MentorShell>
  );
}

// The submission opens; the prototype's other two views (step chain, deliverable) sit beside it,
// and everything from the gate register that isn't needed to judge the work stays under Background.
type Tab = "submission" | "chain" | "deliverable" | "background";

type Answer = "yes" | "no";

/* Answering the six questions IS the review. A "no" produces its own reason code and the
   correction the mentee receives, so the mentor never picks a disapproval from a menu.
   Every question is the reviewer's own: nothing is pre-cleared, and no agent result is shown. */
const askable = (card: Card) => card.checklist;
const failingItems = (card: Card, answers: Record<string, Answer>) =>
  card.checklist.filter((i) => answers[i.id] === "no");

function CardBody() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const id = Number(submissionId);
  const router = useRouter();

  const [card, setCard] = useState<Card | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("submission");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [sheet, setSheet] = useState<"approve" | "disapprove" | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<DecisionResult | null>(null);
  const [raced, setRaced] = useState(false);

  useEffect(() => {
    mentorApi
      .card(id)
      .then(setCard)
      .catch((e) => {
        if (isAuthError(e)) return;
        setLoadError(e instanceof ApiError ? e.message : "Could not load this card.");
      });
  }, [id]);

  const openSheet = useCallback((mode: "approve" | "disapprove") => {
    setSheetError(null);
    setSheet(mode);
  }, []);

  async function confirm(codes: string[], note: string, requireAck: boolean) {
    if (!card || !sheet) return;
    setBusy(true);
    setSheetError(null);
    try {
      const res = await mentorApi.decide(card.submissionId, sheet, codes, note, requireAck);
      setSheet(null);
      setToast(res);
    } catch (e) {
      // 409 means someone else closed this card while it was open — the design's race case.
      if (e instanceof ApiError && e.status === 409) {
        setSheet(null);
        setRaced(true);
      } else {
        setSheetError(e instanceof ApiError ? e.message : "Could not record the decision.");
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

  if (loadError) {
    return (
      <div className="mx-auto max-w-[900px] px-6 pt-10">
        <div className="rounded-xl border border-[#f0c2c2] bg-[#fdecec] px-4 py-3 text-[12.5px] text-[#a31d1d]">
          {loadError}
        </div>
        <Link href="/mentor" className="inline-block mt-4 text-[12.5px] text-indigo-600">
          ← Back to the queue
        </Link>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px] 3xl:max-w-[1880px] px-6 pt-7">
        <div className="h-[120px] rounded-2xl border border-[#e6eaf0] bg-white animate-pulse" />
      </div>
    );
  }

  const overdue = card.remainingMin < 0;
  const decisionBlocked = card.decidedBy !== null || raced;
  const setAnswer = (itemId: string, value: Answer) =>
    setAnswers((a) => ({ ...a, [itemId]: value }));

  const asked = askable(card);
  const askableCount = asked.length;
  const answeredCount = asked.filter((i) => answers[i.id]).length;
  const failing = failingItems(card, answers);

  return (
    <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px] 3xl:max-w-[1880px] px-6 pt-6 pb-20">
      <Link
        href="/mentor"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-slate-800 transition-colors mb-4"
      >
        <Icon name="arrowLeft" size={14} /> Back to the queue
      </Link>

      <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-5 py-4 mb-3">
        <div className="flex items-start gap-3 flex-wrap">
          <span
            className={`shrink-0 mt-0.5 w-6 h-6 rounded-[7px] grid place-items-center text-[9px] font-bold ${
              card.gateType === "FOUNDATION" ? "bg-[#e0e7ff] text-[#3730a3]" : "bg-[#e8f5ee] text-[#1e7a46]"
            }`}
          >
            {card.gateType === "FOUNDATION" ? "F" : "R"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] text-slate-500">{card.gateId}</span>
              <span className="text-[11px] text-slate-400">
                {card.taskCode} · {card.category}
              </span>
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 mt-1">{card.gateName}</h1>
            <div className="text-[11.5px] text-slate-500 mt-0.5">
              {card.activityTitle}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className={`text-[11.5px] mt-1 ${overdue ? "text-[#a31d1d] font-medium" : "text-slate-500"}`}>
              {formatRemaining(card.remainingMin)}
            </div>
          </div>
        </div>

        <ContextPack card={card} />
      </div>

      {card.tier === "T3" && (
        <Banner tone="slate">
          This gate is Tier 3. It is in your queue because it was sampled, not because every
          submission at this gate is reviewed.
        </Banner>
      )}
      {card.priorReturns > 0 && (
        <Banner tone="amber">
          Returned {card.priorReturns} time{card.priorReturns === 1 ? "" : "s"} at this gate
          {card.priorReturns >= card.maxReturns
            ? ` — the limit is ${card.maxReturns}, so a further disapproval escalates to the Programme Manager instead of returning.`
            : ` of ${card.maxReturns} allowed.`}
        </Banner>
      )}
      {decisionBlocked && (
        <Banner tone="red">
          {raced
            ? "This card was decided elsewhere while you had it open. Nothing you selected was submitted."
            : `Already decided by ${card.decidedBy}.`}
        </Banner>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-3 items-start">
        <div className="rounded-[14px] border border-[#e6eaf0] bg-white">
          <div className="flex items-center gap-1 border-b border-[#f1f5f9] px-3">
            <TabButton active={tab === "submission"} onClick={() => setTab("submission")}>
              Submission
            </TabButton>
            <TabButton active={tab === "chain"} onClick={() => setTab("chain")}>
              Step chain
            </TabButton>
            <TabButton active={tab === "deliverable"} onClick={() => setTab("deliverable")}>
              Deliverable
            </TabButton>
            <TabButton active={tab === "background"} onClick={() => setTab("background")}>
              Background &amp; history
              {card.history.length > 0 && (
                <span className="ml-1.5 inline-flex items-center h-[15px] px-1 rounded bg-slate-100 text-slate-500 text-[9.5px] font-semibold align-middle">
                  {card.history.length}
                </span>
              )}
            </TabButton>
          </div>
          {/* No height cap: the submission reads on the page's own scroll. The aside is sticky, so
              Approve/Disapprove stay in reach however long the deliverable runs. */}
          <div className="px-6 py-6">
            {tab === "submission" && (
              <div>
                <TheAsk brief={card.brief} title={card.activityTitle} />
                <SubmittedWork card={card} />
              </div>
            )}
            {tab === "chain" && <StepChain steps={card.stepChain} feedsInto={card.feedsInto} />}
            {tab === "deliverable" && (
              <div className="space-y-4">
                <Field label="Artefact under review">
                  {card.artefact}
                  {card.outputId && (
                    <span className="font-mono text-[11px] text-slate-400"> · {card.outputId}</span>
                  )}
                </Field>
                <Field label="Deliverable format">{card.deliverableFormat || "—"}</Field>
                <Field label="Analytical lens">{card.analyticalLens || "—"}</Field>
                <Field label="Scope objects">
                  {[card.scopeAsset, card.scopeVendor].filter(Boolean).join(" · ") || "—"}
                </Field>
                <Field label="What this output feeds">{card.feedsInto || "—"}</Field>
                <Field label="Gate acceptance">{card.acceptance}</Field>
              </div>
            )}
            {tab === "background" && (
              <div className="space-y-4">
                {/* The header carries the task code; this is the only place the task is named. */}
                <Field label="Task">
                  {card.taskCode} — {card.taskName}
                </Field>
                <Field label="Gate acceptance">{card.acceptance}</Field>
                <div>
                  <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-1">
                    Inputs it consumed
                  </div>
                  <ul className="text-[12.5px] text-slate-700 leading-relaxed">
                    {card.priorOutputs.map((input) => (
                      <li key={input} className="flex gap-2">
                        <span className="text-slate-300 mt-1.5 shrink-0">•</span>
                        <span>{input}</span>
                      </li>
                    ))}
                    {card.priorOutputs.length === 0 && (
                      <li className="text-slate-400">Nothing — this is the first step of the task.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-2">
                    Revision history at this gate
                  </div>
                  <History entries={card.history} />
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[76px] lg:self-start">
          <div className="rounded-[14px] border border-[#e0e7ff] bg-[#eef2ff] px-4 py-3.5">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#3730a3] mb-1.5">
              What this output feeds
            </div>
            <p className="text-[12px] text-[#3730a3]/90 leading-relaxed">{card.feedsInto}</p>
          </div>

          <ReviewChecklist card={card} answers={answers} onAnswer={setAnswer} />

          <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-4">
            <div className="flex items-center justify-between text-[11.5px] text-slate-500 mb-2.5">
              <span>
                <b className="text-slate-800">{answeredCount}</b> of {askableCount} answered
              </span>
              <span>
                {failing.length > 0 ? (
                  <b className="text-[#a31d1d]">{failing.length} failing</b>
                ) : (
                  "none failing"
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openSheet("approve")}
                disabled={decisionBlocked || failing.length > 0 || answeredCount < askableCount}
                className="flex-1 h-10 rounded-lg bg-[#1e7a46] text-white text-[13px] font-semibold hover:bg-[#1a6b3d] disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => openSheet("disapprove")}
                disabled={decisionBlocked || failing.length === 0}
                className="flex-1 h-10 rounded-lg border border-[#f0c2c2] text-[#a31d1d] text-[13px] font-semibold hover:bg-[#fdecec] disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent transition-colors"
              >
                Return with reasons
              </button>
            </div>
            {decisionBlocked ? (
              <p className="text-[11px] text-slate-500 mt-2.5">This card is closed.</p>
            ) : (
              answeredCount < askableCount && (
                <p className="text-[11px] text-slate-500 mt-2.5">
                  Answer every question to decide.
                </p>
              )
            )}
          </div>
        </aside>
      </div>

      <ReasonSheet
        mode={sheet}
        reasons={sheet === "approve" ? card.approve : failing.map(itemAsReason)}
        locked={sheet === "disapprove"}
        priorReturns={card.priorReturns}
        maxReturns={card.maxReturns}
        busy={busy}
        error={sheetError}
        onCancel={() => setSheet(null)}
        onConfirm={confirm}
      />

      {toast && (
        <UndoToast
          outcome={toast.outcome}
          gateId={toast.gateId}
          seconds={toast.undoSeconds}
          onUndo={undo}
          onExpire={() => router.push("/mentor")}
        />
      )}

      {raced && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/40 px-6">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.4)]">
            <h2 className="text-[15px] font-semibold text-slate-900">This card was closed elsewhere</h2>
            <p className="text-[12.5px] text-slate-600 leading-relaxed mt-2">
              Another reviewer decided it while you had it open. Nothing you selected was submitted.
            </p>
            <button
              onClick={() => router.push("/mentor")}
              className="mt-5 w-full h-10 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 transition-colors"
            >
              Return to queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** The prompt the mentee actually read, above their answer. Without it the reviewer judges against
 *  the gate register's org-agnostic wording while the mentee worked a rotated engagement — the
 *  most common way a correct submission gets disapproved. The acceptance points collapse because
 *  they are a re-read, not something needed on every card. */
function TheAsk({ brief, title }: { brief?: Brief; title: string }) {
  // Optional on purpose: backend and frontend deploy separately, so a card served by an older
  // backend has no brief at all. Drop the panel rather than take the console down.
  const { engagement = "", objective = "", whatToDo = [], references = [] } = brief ?? {};
  if (!engagement && !objective) return null;
  return (
    <div className="rounded-xl border border-[#e0e7ff] bg-[#f6f7ff] px-4 py-3.5 mb-5">
      <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#3730a3] mb-1.5">
        What the mentee was asked
      </div>
      <p className="text-[12.5px] text-slate-800 leading-relaxed">{objective || title}</p>
      {engagement && (
        <p className="text-[11.5px] text-slate-500 leading-relaxed mt-2">{engagement}</p>
      )}
      {whatToDo.length > 0 && (
        <details className="mt-2 group">
          <summary className="cursor-pointer list-none text-[11.5px] font-medium text-indigo-700 hover:text-indigo-900">
            <span className="group-open:hidden">Show the {whatToDo.length} acceptance points they saw</span>
            <span className="hidden group-open:inline">Hide acceptance points</span>
          </summary>
          <ul className="mt-1.5 space-y-1">
            {whatToDo.map((item, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] text-slate-600 leading-snug">
                <span className="text-indigo-300 mt-1 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {references.length > 0 && (
        <details className="mt-1.5 group">
          <summary className="cursor-pointer list-none text-[11.5px] font-medium text-indigo-700 hover:text-indigo-900">
            <span className="group-open:hidden">
              Show the {references.length} reference document{references.length === 1 ? "" : "s"} they were given
            </span>
            <span className="hidden group-open:inline">Hide reference material</span>
          </summary>
          <div className="mt-2">
            {/* The learner's own component and drawer — same cards, same body renderer, so the
                reviewer reads the document exactly as it was handed over. */}
            <ReferenceMaterial references={references} />
          </div>
        </details>
      )}
    </div>
  );
}

/** The acceptance checklist, as the mentee saw it on the Working Desk — same criteria, same
 *  order, with the deterministic Layer 1 verdict that was run against their submission. It was
 *  previously folded inside the collapsed Agent-grading accordion, which is the wrong place: the
 *  criteria are what the work was written to satisfy, not a footnote about how it scored. */
/** The review itself: the gate's questions, answered yes/no. Mirrors the v3 prototype's rail. */
function ReviewChecklist({
  card,
  answers,
  onAnswer,
}: {
  card: Card;
  answers: Record<string, Answer>;
  onAnswer: (id: string, value: Answer) => void;
}) {
  const [showReserve, setShowReserve] = useState(false);
  return (
    <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3.5">
      <div className="text-[12.5px] font-semibold text-slate-900">
        Your checklist — {card.checklist.length} questions
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
        Answering these is the review. Every “no” carries its own reason code and the correction the
        mentee receives. Every question is yours to answer — nothing is decided for you.
      </p>

      <ul className="mt-3 space-y-2">
        {card.checklist.map((item) => {
          const answer = answers[item.id];
          return (
            <li
              key={item.id}
              data-check={item.id}
              className={`rounded-xl border px-3 py-2.5 transition-colors ${
                answer === "no"
                  ? "border-[#f0c2c2] bg-[#fdecec]"
                  : answer === "yes"
                    ? "border-[#cfe8da] bg-[#f2f9f5]"
                    : "border-[#e6eaf0] bg-white"
              }`}
            >
              <div className="flex gap-2.5">
                <span className="mt-0.5 shrink-0 grid place-items-center w-[18px] h-[18px] rounded-full bg-slate-100 font-mono text-[10px] text-slate-500">
                  {item.slot}
                </span>
                <span className="text-[12px] text-slate-800 leading-snug">{item.question}</span>
              </div>
              <div className="mt-1.5 pl-[28px] font-mono text-[10px] uppercase tracking-wide text-slate-400">
                {item.layer}
                {item.layer === "COORDINATE" && " · resolved from this task's coordinate"}
              </div>
              <div className="mt-2 pl-[28px] flex items-center gap-1.5">
                    <button
                      aria-pressed={answer === "yes"}
                      onClick={() => onAnswer(item.id, "yes")}
                      className={`h-7 px-3 rounded-md text-[11.5px] font-semibold transition-colors ${
                        answer === "yes"
                          ? "bg-[#1e7a46] text-white"
                          : "border border-[#e6eaf0] text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      aria-pressed={answer === "no"}
                      onClick={() => onAnswer(item.id, "no")}
                      className={`h-7 px-3 rounded-md text-[11.5px] font-semibold transition-colors ${
                        answer === "no"
                          ? "bg-[#a31d1d] text-white"
                          : "border border-[#e6eaf0] text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      No
                    </button>
              </div>
              {answer === "no" && (
                <div className="mt-2 pl-[28px] text-[11px] leading-relaxed text-slate-600">
                  <span className="font-semibold">Records {item.disapproveCode}:</span> {item.reason}
                  <br />
                  <span className="font-semibold">Correction sent:</span> {item.correction}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {card.reserve.length > 0 && (
        <>
          <button
            onClick={() => setShowReserve((s) => !s)}
            className="mt-3 w-full text-left text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            Reserve set — {card.reserve.length} further items in scope{" "}
            <span className="font-mono">{showReserve ? "−" : "+"}</span>
          </button>
          {showReserve && (
            <ul className="mt-2 space-y-1.5">
              {card.reserve.map((item) => (
                <li key={item.id} className="text-[11px] text-slate-500 leading-snug">
                  <span className="font-mono text-[10px] uppercase text-slate-400">{item.layer}</span>{" "}
                  {item.question}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

/* The v3 context pack: six lines by default, the rest behind one control. Every learner works a
   different organisation, so the register's org-agnostic text is not what this mentee read. */
function ContextPack({ card }: { card: Card }) {
  const [open, setOpen] = useState(false);
  // Counted, not hard-coded: the pack has been trimmed twice and the label drifted both times.
  const hidden = 3;
  return (
    <>
      {/* gap-px over a border-coloured background draws the hairlines, so an unfilled cell
          shows as a grey block — the last item spans the remainder to close the row. */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#e6eaf0] mt-4 rounded-lg overflow-hidden max-lg:[&>*:last-child]:col-span-2">
        <Meta label="Organisation" value={card.orgName} sub={card.orgIndustry} />
        <Meta label="Office" value={card.orgHeadOffice || "—"} />
        <Meta label="Regulator" value={card.orgRegulator || "—"} />
      </div>
      {open && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#e6eaf0] mt-px rounded-lg overflow-hidden max-lg:[&>*:last-child]:col-span-2">
          <Meta label="Mandatory standards" value={card.mandatoryStandards || "—"} />
          <Meta label="Artefact" value={card.artefact} sub={card.outputId} mono={false} />
          <Meta label="Reviewer" value={card.reviewerRole} sub={`NICE ${card.reviewerRoleNice}`} />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-2 text-[11.5px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        {open ? "Hide the rest of the context pack" : `Show the full context pack (${hidden} more fields)`}
      </button>
    </>
  );
}

/** Where this gate sits in the task — a return reopens everything downstream, not just this step. */
function StepChain({ steps, feedsInto }: { steps: Step[]; feedsInto: string }) {
  if (steps.length === 0) {
    return <p className="text-[12.5px] text-slate-400">No step chain for this task.</p>;
  }
  return (
    <div>
      <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
        The run of work this gate sits in. Returning it reopens this step and everything below that
        inherits from it.
      </p>
      <ol className="space-y-1">
        {steps.map((s) => (
          <li
            key={s.n}
            className={`flex gap-3 rounded-lg px-3 py-2.5 ${
              s.state === "now"
                ? "bg-[#eef2ff] border border-[#c7d2fe]"
                : s.state === "past"
                  ? "opacity-60"
                  : ""
            }`}
          >
            <span
              className={`shrink-0 grid place-items-center w-[20px] h-[20px] rounded-full font-mono text-[10px] ${
                s.state === "now"
                  ? "bg-indigo-600 text-white"
                  : s.state === "past"
                    ? "bg-slate-200 text-slate-500"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {s.n}
            </span>
            <span className="text-[12.5px] text-slate-700 leading-snug">
              {s.name}
              {s.state === "now" && (
                <b className="text-indigo-700"> &larr; this gate</b>
              )}
            </span>
          </li>
        ))}
      </ol>
      {feedsInto && (
        <p className="mt-4 text-[11.5px] text-slate-500 leading-relaxed">
          <b className="text-slate-700">Feeds into:</b> {feedsInto}
        </p>
      )}
    </div>
  );
}

function Meta({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div className="bg-white px-3 py-2.5">
      <div className="text-[9.5px] font-semibold tracking-[0.1em] uppercase text-slate-400">{label}</div>
      <div className={`text-[12px] text-slate-800 mt-0.5 break-words ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </div>
      {sub && <div className="text-[10.5px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Banner({ tone, children }: { tone: "amber" | "blue" | "red" | "slate"; children: React.ReactNode }) {
  const tones = {
    amber: "border-[#e8c48a] bg-[#fdf1e6] text-[#7c4a10]",
    blue: "border-[#b8d9ea] bg-[#eef6fb] text-[#0b4a66]",
    red: "border-[#f0c2c2] bg-[#fdecec] text-[#a31d1d]",
    slate: "border-[#e6eaf0] bg-[#f8fafc] text-slate-600",
  } as const;
  return (
    <div className={`rounded-xl border px-4 py-3 mb-3 text-[12.5px] leading-relaxed ${tones[tone]}`}>{children}</div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-11 px-3 text-[12.5px] font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-indigo-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-1">{label}</div>
      <div className="text-[12.5px] text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}

function History({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-[12.5px] text-slate-500">
        First time this learner has reached this gate — no prior decision.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {entries.map((e, i) => (
        <div
          key={i}
          className={`rounded-xl border px-3.5 py-3 ${
            e.withdrawn ? "border-[#e6eaf0] bg-slate-50/60 opacity-70" : "border-[#e6eaf0] bg-white"
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center h-[18px] px-1.5 rounded text-[10px] font-semibold ${
                e.outcome.startsWith("approve") ? "bg-[#e8f5ee] text-[#1e7a46]" : "bg-[#fdecec] text-[#a31d1d]"
              }`}
            >
              {OUTCOME_LABEL[e.outcome]}
            </span>
            <span className="text-[11px] text-slate-400">
              {e.mentorName} · {formatSubmitted(e.decidedAt)}
            </span>
            {e.withdrawn && (
              <span className="inline-flex items-center h-[16px] px-1.5 rounded bg-slate-200 text-slate-600 text-[9.5px] font-semibold">
                WITHDRAWN
              </span>
            )}
          </div>
          {e.reasons.length > 0 && (
            <ul className="mt-2 space-y-1">
              {e.reasons.map((r) => (
                <li key={r} className="flex gap-2 text-[12px] text-slate-700 leading-snug">
                  <span className="text-slate-300 mt-1.5 shrink-0">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
          {e.note && <p className="mt-2 text-[11.5px] text-slate-500 italic leading-relaxed">{e.note}</p>}
        </div>
      ))}
    </div>
  );
}
