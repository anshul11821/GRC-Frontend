"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { MentorShell } from "@/components/mentor/shell";
import { isAuthError, mentorApi, type MenteeRow } from "@/lib/mentor";

/**
 * The Review Desk — the mentor's answer to the learner's Working Desk.
 *
 * Where the learner's desk is their own engagement tree, the mentor's is the list of people whose
 * engagements they are responsible for. Opening one drops into that learner's desk, which is
 * literally the learner's own desk rendered read-only.
 *
 * Everything about this page assumes there are hundreds of rows and not nine: the search runs
 * server-side against the whole roster rather than filtering what is loaded, paging is keyset, and
 * nothing here fetches per-learner detail — the progress figures come back with the page.
 */
export default function ReviewDeskPage() {
  return (
    <MentorShell>
      <RosterBody />
    </MentorShell>
  );
}

function RosterBody() {
  const [rows, setRows] = useState<MenteeRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [waitingOnly, setWaitingOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (search: string, waiting: boolean) => {
      try {
        const page = await mentorApi.mentees({ q: search, waitingOnly: waiting });
        setRows(page.mentees);
        setTotal(page.total);
        setCursor(page.nextCursor);
        setError(null);
      } catch (e) {
        if (!isAuthError(e)) setError("Could not load your mentees.");
      }
    },
    [],
  );

  // Debounced: the search is a round trip, and one per keystroke over a roster of thousands is a
  // query storm for a box somebody is still typing in.
  useEffect(() => {
    const t = setTimeout(() => void load(q, waitingOnly), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, waitingOnly, load]);

  async function loadMore() {
    if (!cursor || busy) return;
    setBusy(true);
    try {
      const page = await mentorApi.mentees({ q, waitingOnly, cursor });
      setRows((prev) => [...(prev ?? []), ...page.mentees]);
      setCursor(page.nextCursor);
    } catch (e) {
      if (!isAuthError(e)) setError("Could not load more.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px] 3xl:max-w-[1880px] px-6 pt-7 pb-16">
      <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">Review Desk</h1>
      <p className="text-[12.5px] text-slate-500 mt-1 mb-6">
        The learners assigned to you. Open one to see their engagement exactly as they see it, and
        decide the gates they have reached.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-[380px]">
          <Icon
            name="search"
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#e6eaf0] bg-white text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300"
          />
        </div>
        <button
          onClick={() => setWaitingOnly((v) => !v)}
          aria-pressed={waitingOnly}
          className={`h-9 px-3 rounded-lg text-[12px] font-medium transition-colors ${
            waitingOnly
              ? "bg-indigo-600 text-white"
              : "bg-white border border-[#e6eaf0] text-slate-600 hover:bg-slate-50"
          }`}
        >
          Waiting on me
        </button>
        <span className="ml-auto text-[11.5px] text-slate-400 tabular-nums">
          {rows ? `${rows.length} of ${total}` : ""}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-[#f0c2c2] bg-[#fdecec] px-4 py-3 text-[12.5px] text-[#a31d1d]">
          {error}
        </div>
      )}

      {rows === null ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[64px] rounded-[14px] border border-[#e6eaf0] bg-white animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/50 px-5 py-10 text-center text-[12.5px] text-slate-500">
          {q || waitingOnly
            ? "No mentee matches that."
            : "No learners are assigned to you yet. They are assigned round-robin at signup."}
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {rows.map((m) => (
              <MenteeCard key={m.userId} m={m} />
            ))}
          </div>
          {cursor && (
            <button
              onClick={loadMore}
              disabled={busy}
              className="mt-3 w-full h-10 rounded-[14px] border border-dashed border-[#e6eaf0] bg-white/60 text-[12.5px] font-medium text-slate-600 hover:bg-white transition-colors disabled:text-slate-400"
            >
              {busy ? "Loading…" : `Load more — showing ${rows.length} of ${total}`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function MenteeCard({ m }: { m: MenteeRow }) {
  const pct = m.totalSteps > 0 ? Math.round((m.passedSteps / m.totalSteps) * 100) : 0;
  const initials =
    m.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?";
  return (
    <Link
      href={`/mentor/desk/${m.userId}`}
      className="w-full flex items-center gap-3 sm:gap-3.5 rounded-[14px] border border-[#e6eaf0] bg-white px-3 sm:px-4 py-3 no-underline hover:bg-[#f8fafc] transition-colors"
    >
      <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-[12px] font-semibold grid place-items-center">
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-slate-900 truncate">{m.name}</span>
        <span className="block text-[11px] text-slate-400 truncate">{m.email}</span>
      </span>

      {/* Steps cleared, not a completion claim: this counts passing grades, and a gate the mentor
          later returns drops back out on their desk. The desk itself is the authority. */}
      <span className="hidden sm:block w-[150px] shrink-0">
        <span className="flex items-baseline justify-between text-[10.5px] text-slate-400 mb-1">
          <span>{pct}%</span>
          <span className="tabular-nums">
            {m.passedSteps}/{m.totalSteps}
          </span>
        </span>
        <span className="block h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <span className="block h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
        </span>
      </span>

      <span className="w-[92px] sm:w-[104px] shrink-0 text-right">
        {m.awaitingYou > 0 ? (
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2 rounded-full bg-[#fdecec] text-[#a31d1d] text-[11px] font-semibold">
            {m.awaitingYou} waiting
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">Nothing due</span>
        )}
      </span>
      <Icon name="chevronRight" size={15} className="shrink-0 text-slate-300" />
    </Link>
  );
}
