"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MENTOR_NAV, isNavActive } from "./nav";
import {
  getMentorToken,
  isAuthError,
  mentorApi,
  setMentorToken,
  type Mentor,
  type MentorStats,
} from "@/lib/mentor";

/**
 * Console chrome + auth gate.
 *
 * Its own shell rather than the learner's AppShell: a mentor has no program, no schedule, no
 * up-next bell and no access window, and teaching every one of those widgets to render for
 * somebody who has none of that state costs more than a second rail. But the *shape* is the
 * learner's on purpose — same sidebar geometry, same collapse behaviour, same account menu — so
 * the two consoles read as one product.
 *
 * Which items a mentor gets, and which of the learner's are dropped, is argued in `./nav`.
 */
export function MentorShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="h-dvh flex overflow-hidden bg-[#FAFAF7]">
      <MentorSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar mentor={mentor} onSignOut={signOut} openMobile={() => setMobileOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function MentorSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  closeMobile,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  closeMobile: () => void;
}) {
  const pathname = usePathname();
  // Labels hide only on desktop when collapsed; the mobile drawer is always full width.
  const hideWhenCollapsed = collapsed ? "md:hidden" : "";
  return (
    <aside
      aria-label="Sidebar"
      className={[
        "bg-white/60 backdrop-blur-xl border-r border-[#e6eaf0] flex flex-col",
        "fixed inset-y-0 left-0 z-50 w-[244px] transition-transform duration-300",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        "md:static md:z-auto md:translate-x-0 md:shadow-none md:h-full md:shrink-0 md:transition-all",
        collapsed ? "md:w-[68px]" : "md:w-[244px] 2xl:w-[276px]",
      ].join(" ")}
    >
      <div className="h-16 flex items-center px-4 gap-3 border-b border-[#e6eaf0]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-9 h-9 rounded-lg items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Icon name="menu" size={18} />
        </button>
        <button
          onClick={closeMobile}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <Icon name="x" size={18} />
        </button>
        <Link href="/mentor" className={`flex items-baseline gap-0 no-underline ${hideWhenCollapsed}`}>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900">grc</span>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
        </Link>
      </div>
      <nav className="flex-1 min-h-0 p-3 flex flex-col gap-0.5">
        {MENTOR_NAV.map((item) => {
          const active = isNavActive(item.href, pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={closeMobile}
              title={item.label}
              className={`group w-full h-10 px-3 rounded-lg flex items-center gap-3 transition-all no-underline ${
                active
                  ? "bg-indigo-50/80 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
              }`}
            >
              <Icon name={item.icon} size={17} strokeWidth={active ? 2 : 1.6} className="shrink-0" />
              <span
                className={`text-[13.5px] tracking-tight truncate ${hideWhenCollapsed} ${active ? "font-medium" : ""}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      {/* The one thing the learner's rail never has to say. */}
      <div className={`p-3 border-t border-[#e6eaf0] ${hideWhenCollapsed}`}>
        <p className="text-[10.5px] text-slate-400 leading-relaxed">
          Your decisions are final. Approving releases a step; returning it reopens that step and
          everything below.
        </p>
      </div>
    </aside>
  );
}

function TopBar({
  mentor,
  onSignOut,
  openMobile,
}: {
  mentor: Mentor;
  onSignOut: () => void;
  openMobile: () => void;
}) {
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
    <header className="relative z-30 h-16 shrink-0 border-b border-[#e6eaf0] bg-white/85 backdrop-blur-md">
      <div className="h-full px-4 md:px-6 flex items-center gap-4">
        {/* The brand lives in the rail now; the bar keeps only what identifies the console. */}
        <button
          onClick={openMobile}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Icon name="menu" size={18} />
        </button>
        <span className="inline-flex items-center h-[18px] px-1.5 rounded bg-slate-900 text-white text-[9.5px] font-semibold tracking-[0.12em]">
          MENTOR
        </span>

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
