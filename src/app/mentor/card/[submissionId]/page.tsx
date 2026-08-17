"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { ReasonSheet } from "@/components/mentor/reason-sheet";
import { UndoToast } from "@/components/mentor/undo-toast";
import { ReferenceMaterial } from "@/components/app/reference-material";
import { ApiError } from "@/lib/api";
import {
  formatRemaining,
  formatSubmitted,
  isAuthError,
  itemAsReason,
  mentorApi,
  OUTCOME_LABEL,
  type Block,
  type Brief,
  type Card,
  type DecisionResult,
  type Grader,
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

/* Answering the six questions IS the review (prototype v3). A "no" produces its own reason code and
   the correction the mentee receives, so the mentor never picks a disapproval from a menu.
   Agent-testable items arrive pre-cleared outside T1; reopening one puts it back in the asked set. */
const askable = (card: Card, reopened: string[]) =>
  card.checklist.filter((i) => !i.preCleared || reopened.includes(i.id));
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
  const [reopened, setReopened] = useState<string[]>([]);
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (sheet || toast || raced) return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        openSheet("approve");
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        openSheet("disapprove");
      } else if (e.key === "Escape") {
        e.preventDefault();
        router.push("/mentor");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheet, toast, raced, openSheet, router]);

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
      <div className="mx-auto max-w-[1320px] px-6 pt-7">
        <div className="h-[120px] rounded-2xl border border-[#e6eaf0] bg-white animate-pulse" />
      </div>
    );
  }

  const overdue = card.remainingMin < 0;
  const decisionBlocked = card.decidedBy !== null || raced;
  // Reopening a pre-cleared item records it as failing, per the prototype — the mentor is saying
  // they disagree with the grader. They can still flip it to yes once they have looked.
  const setAnswer = (itemId: string, value: Answer) => {
    setReopened((r) => (r.includes(itemId) ? r : [...r, itemId]));
    setAnswers((a) => ({ ...a, [itemId]: value }));
  };

  const asked = askable(card, reopened);
  const askableCount = asked.length;
  const answeredCount = asked.filter((i) => answers[i.id]).length;
  const preClearedCount = card.checklist.length - askableCount;
  const failing = failingItems(card, answers);

  return (
    <div className="mx-auto max-w-[1320px] px-6 pt-6 pb-20">
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
              <Pill title={TIER_HINT[card.tier]}>{card.tier}</Pill>
              <Pill>Impact {card.impact.toFixed(1)} / 10</Pill>
              {card.revision > 1 && <Pill>Revision {card.revision}</Pill>}
              <span
                className="inline-flex items-center h-[17px] px-1.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold"
                title={`${card.reviewerRole} · NICE ${card.reviewerRoleNice}`}
              >
                {card.reviewerRoleCode}
              </span>
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 mt-1">{card.gateName}</h1>
            <div className="text-[11.5px] text-slate-500 mt-0.5">
              {card.activityTitle} · {card.gateType} gate at step {card.step}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span
              className={`inline-flex items-center h-[20px] px-2 rounded text-[10.5px] font-semibold ${
                card.grader.result === "PASS"
                  ? "bg-[#e8f5ee] text-[#1e7a46]"
                  : card.grader.result === "FAIL"
                    ? "bg-[#fdecec] text-[#a31d1d]"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              Agent {card.grader.result}
            </span>
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
      {card.grader.result === "FAIL" && (
        <Banner tone="amber">
          The agent returned FAIL on Layer 2. It has not established whether the weakness is the
          mentee&apos;s understanding or the evidence their organisation could give.
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
                <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-3">
                  What they submitted · revision {card.revision} · {formatSubmitted(card.submittedAt)}
                </div>
                <Blocks blocks={card.blocks} />
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
                {card.grader.feedback && <Field label="Agent feedback">{card.grader.feedback}</Field>}
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
          <Checklist checks={card.grader.layer1} />

          <div className="rounded-[14px] border border-[#e0e7ff] bg-[#eef2ff] px-4 py-3.5">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#3730a3] mb-1.5">
              What this output feeds
            </div>
            <p className="text-[12px] text-[#3730a3]/90 leading-relaxed">{card.feedsInto}</p>
          </div>

          <ReviewChecklist card={card} answers={answers} onAnswer={setAnswer} />

          <GraderPanel card={card} />

          <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-4">
            <div className="flex items-center justify-between text-[11.5px] text-slate-500 mb-2.5">
              <span>
                <b className="text-slate-800">{answeredCount}</b> of {askableCount} answered
                {preClearedCount > 0 && ` (${preClearedCount} pre-cleared)`}
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
                Approve <span className="font-mono text-[11px] opacity-70">A</span>
              </button>
              <button
                onClick={() => openSheet("disapprove")}
                disabled={decisionBlocked || failing.length === 0}
                className="flex-1 h-10 rounded-lg border border-[#f0c2c2] text-[#a31d1d] text-[13px] font-semibold hover:bg-[#fdecec] disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent transition-colors"
              >
                Return with reasons <span className="font-mono text-[11px] opacity-70">D</span>
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
        mentee receives.
        {card.tier !== "T1" &&
          " Items the grader can test are shown pre-cleared at this tier — reopen any of them if you want to look."}
      </p>

      <ul className="mt-3 space-y-2">
        {card.checklist.map((item) => {
          const answer = answers[item.id];
          const cleared = item.preCleared && !answer;
          return (
            <li
              key={item.id}
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
                {item.layer === "COORDINATE" && " · resolved from this task's coordinate"} ·{" "}
                {item.testableBy.toLowerCase().replace("-", " ")}
              </div>
              <div className="mt-2 pl-[28px] flex items-center gap-1.5">
                {cleared ? (
                  <>
                    <span className="inline-flex items-center h-6 px-2 rounded-md bg-[#e8f5ee] text-[10.5px] font-semibold text-[#1e7a46]">
                      Pre-cleared by the grader
                    </span>
                    <button
                      onClick={() => onAnswer(item.id, "no")}
                      className="h-6 px-2 rounded-md border border-[#e6eaf0] text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Reopen
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

function Checklist({ checks }: { checks: Grader["layer1"] }) {
  if (checks.length === 0) return null;
  const met = checks.filter((c) => c.passed).length;
  const allMet = met === checks.length;
  return (
    <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 flex-1">
          Acceptance checklist
        </span>
        <span className={`text-[12px] font-semibold tabular-nums ${allMet ? "text-[#1e7a46]" : "text-slate-600"}`}>
          {met}
          <span className="text-slate-400 mx-px">/</span>
          {checks.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className={`mt-px shrink-0 w-[15px] h-[15px] rounded-full grid place-items-center text-white text-[9px] font-bold ${
                c.passed ? "bg-[#1e7a46]" : "bg-[#a31d1d]"
              }`}
            >
              {c.passed ? "✓" : "✕"}
            </span>
            <span className="text-[12px] leading-snug text-slate-700">
              {c.rule}
              {c.note && <span className="text-slate-400"> — {c.note}</span>}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10.5px] text-slate-400 mt-2.5">
        The criteria the mentee wrote against, with the automatic Layer 1 result. Your decision is
        independent of it.
      </p>
    </div>
  );
}

const TIER_HINT: Record<string, string> = {
  T1: "Tier 1 — every submission at this gate is reviewed.",
  T2: "Tier 2 — reviewed, with the agent-testable questions pre-cleared.",
  T3: "Tier 3 — reviewed only when sampled or escalated.",
};

function Pill({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center h-[17px] px-1.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold"
    >
      {children}
    </span>
  );
}

/* The v3 context pack: six lines by default, the rest behind one control. Every learner works a
   different organisation, so the register's org-agnostic text is not what this mentee read. */
function ContextPack({ card }: { card: Card }) {
  const [open, setOpen] = useState(false);
  const later = card.stepChain.filter((s) => s.state === "future").length;
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#e6eaf0] mt-4 rounded-lg overflow-hidden">
        <Meta
          label="This gate"
          value={
            card.gateType === "FOUNDATION"
              ? `A determination the later steps inherit and none re-tests`
              : "The artefact leaves the exercise and is acted on"
          }
        />
        <Meta label="Mentee" value={card.menteeName} sub={card.menteeRotation} />
        <Meta label="Organisation" value={card.orgName} sub={card.orgIndustry} />
        <Meta label="Office" value={card.orgHeadOffice || "—"} />
        <Meta label="Regulator" value={card.orgRegulator || "—"} />
        <Meta
          label="Trigger and format"
          value={card.scenario ? `Picked up ${card.scenario}` : "—"}
          sub={card.deliverableFormat}
        />
      </div>
      {open && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#e6eaf0] mt-px rounded-lg overflow-hidden">
          <Meta label="Mandatory standards" value={card.mandatoryStandards || "—"} />
          <Meta label="Analytical lens" value={card.analyticalLens || "—"} />
          <Meta label="Scope objects" value={card.scopeAsset || "—"} sub={card.scopeVendor} />
          <Meta label="Artefact" value={card.artefact} sub={card.outputId} mono={false} />
          <Meta label="Archetype" value={card.archetype || "—"} sub={card.verbFamily} />
          <Meta label="Reviewer" value={card.reviewerRole} sub={`NICE ${card.reviewerRoleNice}`} />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-2 text-[11.5px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        {open ? "Hide the rest of the context pack" : "Show the full context pack (6 more fields)"}
      </button>
      <div className="mt-2 rounded-lg bg-[#f8fafc] border border-[#e6eaf0] px-3 py-2.5 text-[11.5px] text-slate-600 leading-relaxed">
        <b className="text-slate-800">What depends on this decision.</b>{" "}
        {later > 0
          ? `${later} later step${later === 1 ? "" : "s"} and the final deliverable.`
          : "The final deliverable."}{" "}
        {card.feedsInto && <span className="text-slate-500">Feeds: {card.feedsInto}</span>}
      </div>
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
            <span className="text-[11px] text-slate-500">revision {e.revision}</span>
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

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.t === "h")
          return (
            <h3 key={i} className="text-[13px] font-semibold text-slate-900 pt-2 first:pt-0">
              {b.text}
            </h3>
          );
        if (b.t === "p")
          return (
            <p key={i} className="text-[12.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {b.text}
            </p>
          );
        if (b.t === "list")
          return (
            <ul key={i} className="space-y-1.5">
              {(b.items ?? []).map((item, j) => (
                <li key={j} className="flex gap-2 text-[12.5px] text-slate-700 leading-relaxed">
                  <span className="text-slate-300 mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        return (
          <div key={i} className="overflow-x-auto rounded-lg border border-[#e6eaf0]">
            <table className="w-full text-[11.5px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {(b.head ?? []).map((h) => (
                    <th key={h} className="text-left font-semibold text-slate-600 px-3 py-2 border-b border-[#e6eaf0] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(b.rows ?? []).map((row, r) => (
                  <tr key={r} className="border-b border-[#f1f5f9] last:border-0">
                    {row.map((cell, c) => (
                      <td key={c} className="px-3 py-2 text-slate-700 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function GraderPanel({ card }: { card: Card }) {
  const [open, setOpen] = useState(false);
  const g = card.grader;

  return (
    <div className="rounded-[14px] border border-[#e6eaf0] bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 flex-1">
          Agent grading
        </span>
        <Icon name="chevronDown" size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {!g.available ? (
        <div className="px-4 pb-4">
          <div className="rounded-lg border border-[#e8c48a] bg-[#fdf1e6] px-3 py-2.5 text-[12px] text-[#7c4a10]">
            Agent grading unavailable for this submission.
          </div>
        </div>
      ) : (
        open && (
          <div className="px-4 pb-4 space-y-4">
            {/* Layer 1 lives in the Acceptance checklist panel above — it is the mentee's criteria,
                not a grading footnote. Only the rubric and the written feedback remain here. */}
            {g.dims.length > 0 && (
              <div>
                <div className="text-[10.5px] font-semibold text-slate-500 mb-1.5">
                  Layer 2 — rubric · mean {g.mean} · low {g.min} ({g.minDim})
                </div>
                <div className="space-y-1.5">
                  {g.dims.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="w-[120px] shrink-0 text-[11px] text-slate-600 truncate">{d.label}</span>
                      <span className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <span
                          className="block h-full rounded-full bg-indigo-500"
                          style={{ width: `${Math.min(100, (d.score / 5) * 100)}%` }}
                        />
                      </span>
                      <span className="w-7 shrink-0 text-right font-mono text-[10.5px] text-slate-500">{d.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10.5px] text-slate-400 leading-relaxed border-t border-[#f1f5f9] pt-2.5">
              Shown for information. Your decision is independent of it.
            </p>
          </div>
        )
      )}
    </div>
  );
}
