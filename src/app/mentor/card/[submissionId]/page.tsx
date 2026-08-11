"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { ReasonSheet } from "@/components/mentor/reason-sheet";
import { UndoToast } from "@/components/mentor/undo-toast";
import { ApiError } from "@/lib/api";
import {
  formatRemaining,
  formatSubmitted,
  isAuthError,
  mentorApi,
  OUTCOME_LABEL,
  type Block,
  type Card,
  type DecisionResult,
  type HistoryEntry,
} from "@/lib/mentor";

export default function MentorCardPage() {
  return (
    <MentorShell>
      <CardBody />
    </MentorShell>
  );
}

type Tab = "submission" | "inputs" | "grading";

function CardBody() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const id = Number(submissionId);
  const router = useRouter();

  const [card, setCard] = useState<Card | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("submission");
  const [checked, setChecked] = useState<Record<number, boolean>>({});
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
                {card.taskCode} · {card.step} · {card.activityTitle}
              </span>
              <span
                className="inline-flex items-center h-[17px] px-1.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold"
                title={`${card.reviewerRole} · NICE ${card.reviewerRoleNice}`}
              >
                {card.reviewerRoleCode}
              </span>
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 mt-1">{card.gateName}</h1>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#e6eaf0] mt-4 rounded-lg overflow-hidden">
          <Meta label="Mentee" value={card.menteeName} sub={card.menteeRotation} />
          <Meta label="Organisation" value={card.orgName} sub={card.orgHeadOffice} />
          <Meta label="In scope" value={card.scopeAsset || "—"} sub={card.scopeVendor} />
          <Meta label="Organised" value={card.analyticalLens || "—"} />
          <Meta label="Artefact" value={card.artefact} sub={card.deliverableFormat} />
          <Meta label="Reviewed by" value={card.reviewerRole} sub={`NICE ${card.reviewerRoleNice}`} />
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-3">
        <div className="rounded-[14px] border border-[#e6eaf0] bg-white">
          <div className="flex items-center gap-1 border-b border-[#f1f5f9] px-3">
            <TabButton active={tab === "submission"} onClick={() => setTab("submission")}>
              Submission
            </TabButton>
            <TabButton active={tab === "inputs"} onClick={() => setTab("inputs")}>
              Inputs it consumed
            </TabButton>
            <TabButton active={tab === "grading"} onClick={() => setTab("grading")}>
              Step activity
              {card.history.length > 0 && (
                <span className="ml-1.5 inline-flex items-center h-[15px] px-1 rounded bg-slate-100 text-slate-500 text-[9.5px] font-semibold align-middle">
                  {card.history.length}
                </span>
              )}
            </TabButton>
          </div>
          <div className="max-h-[64vh] overflow-y-auto px-6 py-6">
            {tab === "submission" && <Blocks blocks={card.blocks} />}
            {tab === "inputs" && (
              <div>
                <p className="text-[12.5px] text-slate-500 mb-3">
                  What this step consumed, per the gate register.
                </p>
                <ul className="space-y-1.5">
                  {card.priorOutputs.map((input) => (
                    <li key={input} className="rounded-lg border border-[#e6eaf0] px-3 py-2 text-[12.5px] text-slate-700">
                      {input}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tab === "grading" && (
              <div className="space-y-4">
                <Field label="Activity">{card.activityTitle}</Field>
                <Field label="Acceptance">{card.acceptance}</Field>
                <Field label="Submitted">
                  {formatSubmitted(card.submittedAt)} · revision {card.revision}
                </Field>
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
          <div className="rounded-[14px] border border-[#e0e7ff] bg-[#eef2ff] px-4 py-3.5">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#3730a3] mb-1.5">
              What this output feeds
            </div>
            <p className="text-[12px] text-[#3730a3]/90 leading-relaxed">{card.feedsInto}</p>
            <p className="text-[11.5px] text-[#3730a3]/70 leading-relaxed mt-2">{card.why}</p>
          </div>

          <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3.5">
            <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-2">
              What to check
            </div>
            <div className="space-y-0.5">
              {card.checks.map((check, i) => (
                <button
                  key={i}
                  onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                  className="w-full min-h-[44px] flex items-start gap-2.5 text-left px-2 py-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={`mt-0.5 shrink-0 w-4 h-4 rounded border grid place-items-center ${
                      checked[i] ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                    }`}
                  >
                    {checked[i] && (
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3.5}>
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="text-[12px] text-slate-700 leading-snug">{check}</span>
                </button>
              ))}
            </div>
            <p className="text-[10.5px] text-slate-400 mt-2">Your own notepad — not required to decide.</p>
          </div>

          <GraderPanel card={card} />

          <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-4">
            <div className="flex gap-2">
              <button
                onClick={() => openSheet("approve")}
                disabled={decisionBlocked}
                className="flex-1 h-10 rounded-lg bg-[#1e7a46] text-white text-[13px] font-semibold hover:bg-[#1a6b3d] disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
              >
                Approve <span className="font-mono text-[11px] opacity-70">A</span>
              </button>
              <button
                onClick={() => openSheet("disapprove")}
                disabled={decisionBlocked}
                className="flex-1 h-10 rounded-lg border border-[#f0c2c2] text-[#a31d1d] text-[13px] font-semibold hover:bg-[#fdecec] disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent transition-colors"
              >
                Disapprove <span className="font-mono text-[11px] opacity-70">D</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5">
              {decisionBlocked
                ? "This card is closed."
                : `Typical time on this card: ${card.budgetMin} minutes.`}
            </p>
          </div>
        </aside>
      </div>

      <ReasonSheet
        mode={sheet}
        reasons={sheet === "approve" ? card.approve : card.disapprove}
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

function Banner({ tone, children }: { tone: "amber" | "blue" | "red"; children: React.ReactNode }) {
  const tones = {
    amber: "border-[#e8c48a] bg-[#fdf1e6] text-[#7c4a10]",
    blue: "border-[#b8d9ea] bg-[#eef6fb] text-[#0b4a66]",
    red: "border-[#f0c2c2] bg-[#fdecec] text-[#a31d1d]",
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
            <div>
              <div className="text-[10.5px] font-semibold text-slate-500 mb-1.5">Layer 1 — rules</div>
              <div className="space-y-1">
                {g.layer1.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11.5px]">
                    <span className={rule.passed ? "text-[#1e7a46]" : "text-[#a31d1d]"}>
                      {rule.passed ? "✓" : "✕"}
                    </span>
                    <span className="text-slate-600 leading-snug">
                      {rule.rule}
                      {rule.note && <span className="text-slate-400"> — {rule.note}</span>}
                    </span>
                  </div>
                ))}
                {g.layer1.length === 0 && <div className="text-[11.5px] text-slate-400">No Layer 1 record.</div>}
              </div>
            </div>

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
