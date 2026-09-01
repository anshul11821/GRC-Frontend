"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { VerbBadge } from "@/components/mentor/verb-badge";
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

/**
 * The mentor's Dashboard — their equivalent of the learner's, and the surface they land on.
 *
 * The flat worklist lives here rather than on the Review Desk deliberately. A mentor carries
 * roughly a quarter of the learner base (four reviewers, round-robin at signup), so at a thousand
 * users that is ~250 mentees and at ten thousand it is ~2,500. Finding today's work by opening
 * mentees one at a time is the thing that quietly multiplies a reviewer's day. The roster is for
 * "how is Priyanshi getting on"; this is for "what do I do next", and it arrives sorted by how
 * overdue it is.
 */
export default function MentorDashboardPage() {
  return (
    <MentorShell>
      <DashboardBody />
    </MentorShell>
  );
}

function DashboardBody() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [extra, setExtra] = useState<QueueRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const load = useCallback(() => {
    mentorApi
      .queue()
      .then((q) => {
        setQueue(q);
        setExtra([]);
        setCursor(q.nextCursor);
        setError(null);
      })
      .catch((e) => {
        if (!isAuthError(e)) setError("Could not load your worklist.");
      });
  }, []);

  useEffect(load, [load]);

  // Paged, not infinite-scrolled: the mentor asks for the next page. An automatic fetch-on-scroll
  // over a 2,500-item worklist is a way to read a caseload by accident.
  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await mentorApi.queue(cursor);
      setExtra((rows) => [...rows, ...next.needsDecision]);
      setCursor(next.nextCursor);
    } catch (e) {
      if (!isAuthError(e)) setError("Could not load more.");
    } finally {
      setLoadingMore(false);
    }
  }

  // The filter only appears when a mentor holds more than one role and cannot otherwise tell why
  // a card is theirs. It filters what has been loaded — the server orders by SLA, not by role.
  const multiRole = (queue?.roles.length ?? 0) > 1;
  const rows = useMemo(() => {
    const all = [...(queue?.needsDecision ?? []), ...extra];
    return role ? all.filter((r) => r.reviewerRole === role) : all;
  }, [queue, extra, role]);

  if (!queue) {
    return (
      <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px] 3xl:max-w-[1880px] px-6 pt-7">
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[68px] rounded-2xl border border-[#e6eaf0] bg-white animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const shown = rows.length;
  const total = queue.stats.awaitingYou;

  return (
    <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px] 3xl:max-w-[1880px] px-6 pt-7 pb-16">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-[12.5px] text-slate-500 mt-1">
            Everything waiting on you, most overdue first. Your decision is final: approving
            releases the step, returning it reopens the step and everything below it.
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

      {/* Counted over the whole worklist server-side, not over the page on screen — a mentor needs
          to know 40 things are overdue while looking at the first 50 rows. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        <Stat label="Awaiting you" value={queue.stats.awaitingYou} />
        <Stat label="Overdue" value={queue.stats.overdue} tone={queue.stats.overdue > 0 ? "danger" : "plain"} />
        <Stat label="Due today" value={queue.stats.dueToday} />
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

      <Section title="Needs your decision" count={total}>
        {rows.length === 0 ? (
          <Empty>Nothing is waiting on you. New submissions at your gates land here.</Empty>
        ) : (
          <>
            <div className="space-y-1.5">
              {rows.map((row) => (
                <Row key={row.submissionId} row={row} showRole={multiRole} />
              ))}
            </div>
            {cursor && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-3 w-full h-10 rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/60 text-[12.5px] font-medium text-slate-600 hover:bg-white transition-colors disabled:text-slate-400"
              >
                {loadingMore ? "Loading…" : `Load more — showing ${shown} of ${total}`}
              </button>
            )}
          </>
        )}
      </Section>

      {queue.decided.length > 0 && (
        <Section title="Recently decided" count={queue.decided.length}>
          <div className="space-y-1.5">
            {queue.decided.map((d) => (
              <DecidedRowView key={d.decisionId} row={d} onChanged={load} />
            ))}
          </div>
        </Section>
      )}
    </div>
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
      <div
        className={`text-[26px] font-semibold tracking-tight mt-1 tabular-nums ${
          tone === "danger" ? "text-[#a31d1d]" : "text-slate-900"
        }`}
      >
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

function Row({ row, showRole }: { row: QueueRow; showRole?: boolean }) {
  const overdue = row.remainingMin < 0;
  return (
    <Link
      href={`/mentor/card/${row.submissionId}`}
      className="w-full flex items-center gap-3 rounded-[14px] border border-[#e6eaf0] bg-white px-3 sm:px-4 py-3 text-left hover:bg-[#f8fafc] transition-colors"
    >
      <GateBadge type={row.gateType} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 flex-wrap">
          {/* The verb first: it says what kind of work this is before the gate's own wording does. */}
          <VerbBadge verbId={row.verbId} />
          <span className="text-[14.5px] font-semibold text-slate-900 truncate">{row.gateName}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.gateId}</span>
        </span>
        {showRole && <span className="block text-[10.5px] text-slate-400 mt-0.5">{row.reviewerRole}</span>}
      </span>
      <span className="hidden md:block w-[150px] shrink-0 text-right">
        <span className="block text-[12px] text-slate-700 truncate">{row.menteeName}</span>
        <span className="block text-[10.5px] text-slate-400">{formatSubmitted(row.submittedAt)}</span>
      </span>
      <span
        className={`hidden lg:block w-[132px] shrink-0 text-right text-[11.5px] ${overdue ? "text-[#a31d1d] font-medium" : "text-slate-500"}`}
      >
        {formatRemaining(row.remainingMin)}
      </span>
      <span className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-indigo-600">
        Review <Icon name="arrowRight" size={13} />
      </span>
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
