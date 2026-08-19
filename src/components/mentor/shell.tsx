"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import {
  getMentorToken,
  isAuthError,
  mentorApi,
  setMentorToken,
  type Mentor,
  type MentorStats,
} from "@/lib/mentor";

/**
 * Console chrome + auth gate. Kept out of the learner AppShell deliberately: mentors are staff,
 * they have no program, no schedule and no sidebar — sharing the learner shell would mean
 * teaching every one of its widgets to render for someone who has none of that state.
 */
export function MentorShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    // No synchronous setState here: the no-token path just redirects, and the resolved/rejected
    // paths land in promise callbacks, which is where React wants state updates to happen.
    if (!getMentorToken()) {
      router.replace("/mentor/login");
      return;
    }
    mentorApi
      .me()
      .then(setMentor)
      .catch((e) => {
        if (isAuthError(e)) {
          setMentorToken(null);
          router.replace("/mentor/login");
        }
      });
  }, [router]);

  const signOut = useCallback(() => {
    setMentorToken(null);
    router.replace("/mentor/login");
  }, [router]);

  if (!mentor) {
    return (
      <div className="min-h-dvh grid place-items-center bg-[#FAFAF7]">
        <div className="text-[13px] text-slate-500">Loading the console…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAFAF7]">
      <TopBar mentor={mentor} onSignOut={signOut} />
      <main>{children}</main>
    </div>
  );
}

function TopBar({ mentor, onSignOut }: { mentor: Mentor; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const roleLine = mentor.roles.length === 1 ? mentor.roles[0] : `${mentor.roles.length} roles`;

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-[#e6eaf0] bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1320px] 2xl:max-w-[1600px] 3xl:max-w-[1880px] h-full px-6 flex items-center gap-4">
        <Link href="/mentor" className="flex items-center gap-2 shrink-0">
          <span className="text-[17px] font-semibold tracking-tight">
            <span className="text-slate-900">grc</span>
            <span className="text-indigo-600">mentor</span>
          </span>
          <span className="inline-flex items-center h-[18px] px-1.5 rounded bg-slate-900 text-white text-[9.5px] font-semibold tracking-[0.12em]">
            MENTOR
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {offline && (
            <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#fdf1e6] text-[#7c4a10] text-[11.5px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a3541d]" />
              Offline
            </span>
          )}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2.5 h-10 pl-1 pr-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[11.5px] font-semibold grid place-items-center">
                {mentor.initials}
              </span>
              <span className="text-left leading-tight hidden sm:block">
                <span className="block text-[12.5px] font-semibold text-slate-900">{mentor.name}</span>
                <span className="block text-[10.5px] text-slate-500">{roleLine}</span>
              </span>
              <Icon
                name="chevronDown"
                size={14}
                className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-12 z-20 w-[268px] rounded-xl border border-[#e6eaf0] bg-white p-1.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]">
                  <MyRecord />
                  <div className="px-2.5 py-2 border-b border-[#f1f5f9] mb-1">
                    <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
                      Reviewing as
                    </div>
                    {mentor.roles.map((r) => (
                      <div key={r} className="text-[11.5px] text-slate-600 leading-relaxed">
                        {r}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={onSignOut}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-[12.5px] text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * The reviewer's own record, in their own menu.
 *
 * Deliberately private and non-comparative: no cohort figure, no ranking, no target. The
 * programme measures checklist items and gates, not people — a badly worded item is a
 * programme-wide defect, not a reviewer who needs correcting (v3 §11) — so putting a scoreboard
 * on the queue would measure the wrong thing in public. Fetched when the menu opens, not on every
 * page load, because nothing else needs it.
 */
function MyRecord() {
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    mentorApi.stats().then(setStats).catch(() => setFailed(true));
  }, []);

  if (failed) return null;
  if (!stats) {
    return <div className="px-2.5 py-3 text-[11.5px] text-slate-400">Loading your record…</div>;
  }

  return (
    <div className="px-2.5 py-2 border-b border-[#f1f5f9] mb-1">
      <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-2">
        Your record
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <Figure value={stats.decidedTotal} label="decided" />
        <Figure value={stats.decidedWeek} label="this week" />
        <Figure value={stats.decidedToday} label="today" />
      </div>
      <dl className="space-y-1">
        <Line term="Approved" value={stats.approved} />
        <Line term="Returned" value={stats.returned} />
        {stats.escalated > 0 && <Line term="Escalated" value={stats.escalated} />}
        {stats.withdrawn > 0 && <Line term="Withdrawn" value={stats.withdrawn} />}
        <Line term="Gates in your scope" value={stats.gatesInScope} />
      </dl>
    </div>
  );
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-center">
      <div className="text-[15px] font-semibold text-slate-900 tabular-nums leading-none">{value}</div>
      <div className="text-[9.5px] text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function Line({ term, value }: { term: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[11.5px] text-slate-500">{term}</dt>
      <dd className="text-[11.5px] font-medium text-slate-800 tabular-nums">{value}</dd>
    </div>
  );
}
