"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { getMentorToken, isAuthError, mentorApi, setMentorToken, type Mentor } from "@/lib/mentor";

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
      <div className="mx-auto max-w-[1320px] h-full px-6 flex items-center gap-4">
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
                <div className="absolute right-0 top-12 z-20 w-64 rounded-xl border border-[#e6eaf0] bg-white p-1.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]">
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
