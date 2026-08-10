"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import {
  formatRemaining,
  formatSubmitted,
  isAuthError,
  mentorApi,
  OUTCOME_LABEL,
  type DecidedRow,
  type Queue,
  type QueueRow,
} from "@/lib/mentor";

export default function MentorQueuePage() {
  return (
    <MentorShell>
      <QueueBody />
    </MentorShell>
  );
}

function QueueBody() {
  const router = useRouter();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [role, setRole] = useState<string | null>(null);

  const load = useCallback(() => {
    mentorApi
      .queue()
      .then((q) => {
        setQueue(q);
        setError(null);
      })
      .catch((e) => {
        if (!isAuthError(e)) setError("Could not load the queue.");
      });
  }, []);

  useEffect(load, [load]);

  // A single-role mentor sees exactly the designed screen; the filter only appears when a mentor
  // actually holds more than one role and cannot otherwise tell why a card is theirs.
  const multiRole = (queue?.roles.length ?? 0) > 1;
  const rows = useMemo(
    () => (queue?.needsDecision ?? []).filter((r) => !role || r.reviewerRole === role),
    [queue, role],
  );

  // Reset the keyboard cursor during render when the role filter changes, rather than in an
  // effect — an effect would let one frame paint with a cursor pointing past the filtered list.
  const [prevRole, setPrevRole] = useState(role);
  if (role !== prevRole) {
    setPrevRole(role);
    setCursor(0);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (!rows.length) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(rows.length - 1, c + 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        router.push(`/mentor/card/${rows[cursor].submissionId}`);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [rows, cursor, router]);

  if (!queue) {
    return (
      <div className="mx-auto max-w-[1320px] px-6 pt-7">
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[68px] rounded-2xl border border-[#e6eaf0] bg-white animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px] px-6 pt-7 pb-16">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Your review queue</h1>
          <p className="text-[12.5px] text-slate-500 mt-1">
            Submissions at gates you review, overdue first. Your decision is recorded for calibration
            and does not change the mentee&rsquo;s result.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#f0c2c2] bg-[#fdecec] px-4 py-3">
          <span className="text-[12.5px] text-[#a31d1d] flex-1">{error}</span>
          <button
            onClick={load}
            className="h-8 px-3 rounded-lg border border-[#f0c2c2] bg-white text-[12px] font-medium text-[#a31d1d]"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        <Stat label="Overdue" value={queue.stats.overdue} tone={queue.stats.overdue > 0 ? "danger" : "plain"} />
        <Stat label="Due today" value={queue.stats.dueToday} />
        <Stat label="Awaiting you" value={queue.stats.awaitingYou} />
        <Stat label="Decided today" value={queue.stats.decidedToday} />
      </div>

      {multiRole && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <Chip active={role === null} onClick={() => setRole(null)}>
            All roles
          </Chip>
          {queue.roles.map((r) => (
            <Chip key={r.name} active={role === r.name} onClick={() => setRole(r.name)} title={`${r.name} · ${r.nice}`}>
              <span className="font-mono text-[10.5px] mr-1.5 opacity-70">{r.code}</span>
              {r.name}
            </Chip>
          ))}
        </div>
      )}

      <Section title="Needs your decision" count={rows.length}>
        {rows.length === 0 ? (
          <Empty>Nothing is waiting on you. New submissions at your gates land here.</Empty>
        ) : (
          <div className="space-y-1.5">
            {rows.map((row, i) => (
              <Row key={row.submissionId} row={row} active={i === cursor} showRole={multiRole} />
            ))}
          </div>
        )}
      </Section>

      {queue.waiting.length > 0 && (
        <Section title="Held by another mentor" count={queue.waiting.length}>
          <div className="space-y-1.5">
            {queue.waiting.map((row) => (
              <Row key={row.submissionId} row={row} readOnly showRole={multiRole} />
            ))}
          </div>
        </Section>
      )}

      {queue.decided.length > 0 && (
        <Section title="Recently decided" count={queue.decided.length}>
          <div className="space-y-1.5">
            {queue.decided.map((d) => (
              <DecidedRowView key={d.decisionId} row={d} onChanged={load} />
            ))}
          </div>
        </Section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl border border-[#e6eaf0] bg-white px-4 py-2.5 text-[11px] text-slate-500">
        <Key k="J / K">move</Key>
        <Key k="Enter">open</Key>
        <Key k="A">approve</Key>
        <Key k="D">disapprove</Key>
        <Key k="U">undo</Key>
      </div>
    </div>
  );
}

function Key({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{k}</span>
      {children}
    </span>
  );
}

function Chip({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-7 px-2.5 rounded-full text-[11.5px] font-medium transition-colors ${
        active ? "bg-indigo-600 text-white" : "bg-white border border-[#e6eaf0] text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, tone = "plain" }: { label: string; value: number; tone?: "plain" | "danger" }) {
  return (
    <div className="rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3.5">
      <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400">{label}</div>
      <div className={`text-[26px] font-semibold tracking-tight mt-1 ${tone === "danger" ? "text-[#a31d1d]" : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <div className="flex items-baseline gap-2 mb-2.5">
        <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
        <span className="text-[11.5px] text-slate-400">{count}</span>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/50 px-5 py-8 text-center text-[12.5px] text-slate-500">
      {children}
    </div>
  );
}

function GateBadge({ type }: { type: string }) {
  const foundation = type === "FOUNDATION";
  return (
    <span
      className={`shrink-0 w-6 h-6 rounded-[7px] grid place-items-center text-[9px] font-bold ${
        foundation ? "bg-[#e0e7ff] text-[#3730a3]" : "bg-[#e8f5ee] text-[#1e7a46]"
      }`}
      title={type}
    >
      {foundation ? "F" : "R"}
    </span>
  );
}

function Row({ row, active, readOnly, showRole }: { row: QueueRow; active?: boolean; readOnly?: boolean; showRole?: boolean }) {
  const overdue = row.remainingMin < 0;
  const body = (
    <>
      <GateBadge type={row.gateType} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-[14.5px] font-semibold text-slate-900 truncate">{row.gateName}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.gateId}</span>
          {row.revision > 1 && (
            <span className="inline-flex items-center h-[17px] px-1.5 rounded bg-[#fdf1e6] text-[#a3541d] text-[10px] font-semibold">
              Revision {row.revision}
            </span>
          )}
        </span>
        {showRole && <span className="block text-[10.5px] text-slate-400 mt-0.5">{row.reviewerRole}</span>}
      </span>
      <span className="hidden md:block w-[150px] shrink-0 text-right">
        <span className="block text-[12px] text-slate-700 truncate">{row.menteeName}</span>
        <span className="block text-[10.5px] text-slate-400">{formatSubmitted(row.submittedAt)}</span>
      </span>
      <span className="hidden sm:block w-[70px] shrink-0 text-center">
        <span
          className={`inline-flex items-center h-[19px] px-1.5 rounded text-[10px] font-semibold ${
            row.grader === "PASS"
              ? "bg-[#e8f5ee] text-[#1e7a46]"
              : row.grader === "FAIL"
                ? "bg-[#fdecec] text-[#a31d1d]"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {row.grader}
        </span>
      </span>
      <span
        className={`hidden lg:block w-[132px] shrink-0 text-right text-[11.5px] ${overdue ? "text-[#a31d1d] font-medium" : "text-slate-500"}`}
      >
        {formatRemaining(row.remainingMin)}
      </span>
      {!readOnly && (
        <span className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-indigo-600">
          Review <Icon name="arrowRight" size={13} />
        </span>
      )}
    </>
  );

  const shell = `w-full flex items-center gap-3 rounded-[14px] border bg-white px-4 py-3 text-left ${
    active ? "border-indigo-300 ring-2 ring-indigo-100" : "border-[#e6eaf0]"
  }`;

  if (readOnly) {
    return <div className={`${shell} opacity-70`}>{body}</div>;
  }
  return (
    <Link href={`/mentor/card/${row.submissionId}`} className={`${shell} hover:bg-[#f8fafc] transition-colors`}>
      {body}
    </Link>
  );
}

function DecidedRowView({ row, onChanged }: { row: DecidedRow; onChanged: () => void }) {
  const [left, setLeft] = useState(row.undoSeconds);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function undo() {
    setBusy(true);
    try {
      await mentorApi.undo(row.decisionId);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full flex items-center gap-3 rounded-[14px] border border-[#e6eaf0] bg-white px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-slate-800 truncate">{row.gateName}</span>
          <span className="font-mono text-[10.5px] text-slate-500">{row.gateId}</span>
        </span>
        <span className="block text-[11px] text-slate-500 mt-0.5">
          {row.menteeName} · {row.reasonCount} reason{row.reasonCount === 1 ? "" : "s"}
        </span>
      </span>
      <span
        className={`shrink-0 inline-flex items-center h-[19px] px-2 rounded text-[10px] font-semibold ${
          row.outcome.startsWith("approve") ? "bg-[#e8f5ee] text-[#1e7a46]" : "bg-[#fdecec] text-[#a31d1d]"
        }`}
      >
        {OUTCOME_LABEL[row.outcome]}
      </span>
      {left > 0 && (
        <button
          onClick={undo}
          disabled={busy}
          className="shrink-0 h-7 px-2.5 rounded-lg border border-[#e6eaf0] text-[11.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Undo ({left}s)
        </button>
      )}
    </div>
  );
}
