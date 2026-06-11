"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { useCachedQuery } from "@/lib/use-query";
import { deskApi } from "@/lib/desk";
import { calendarApi } from "@/lib/calendar";
import { SOFT_TONES } from "@/lib/tones";

const PROGRAM = "grc101";
const SEEN_KEY = "grcmentor:notif-seen";

interface Notif {
  id: string;
  icon: IconName;
  tone: string;
  title: string;
  detail: string;
  href: string;
  at: string;
}

function relTime(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  // Lazy init is SSR-safe (window guarded); the count stays 0 until feed/calendar data
  // arrives post-mount, so no hydration mismatch and no setState-in-effect.
  const [seenAt, setSeenAt] = useState<number>(() =>
    typeof window === "undefined" ? 0 : Number(localStorage.getItem(SEEN_KEY) ?? 0),
  );
  const ref = useRef<HTMLDivElement>(null);

  const { data: feed } = useCachedQuery(`feed:${PROGRAM}`, () => deskApi.activityFeed(PROGRAM));
  const { data: cal } = useCachedQuery(`calendar:${PROGRAM}`, () => calendarApi.get(PROGRAM));

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const notifs = useMemo<Notif[]>(() => {
    const out: Notif[] = [];
    for (const f of feed ?? []) {
      const pass = f.decision === "pass";
      out.push({
        id: `feed-${f.activityId}-${f.createdAt}`,
        icon: pass ? "check" : "refresh",
        tone: pass ? "emerald" : "amber",
        title: pass ? "Mentor approved your work" : "Revision requested",
        detail: `${f.taskCode}·${f.activityCode} · ${pass ? `Scored ${f.overallScore.toFixed(1)}/5` : "needs another pass"}`,
        href: `/app/desk/${f.activityId}`,
        at: f.createdAt,
      });
    }
    for (const e of cal ?? []) {
      if (e.type !== "interaction") continue; // revise reminders already surface as feedback above
      out.push({
        id: `cal-${e.id}`,
        icon: "calendar",
        tone: "indigo",
        title: "Stakeholder interaction scheduled",
        detail: e.eventDate
          ? `${e.title} · ${new Date(`${e.eventDate}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
          : e.title,
        href: "/app/calendar",
        at: e.createdAt,
      });
    }
    out.sort((a, b) => (a.at < b.at ? 1 : -1));
    return out.slice(0, 12);
  }, [feed, cal]);

  const unread = notifs.reduce((n, x) => n + (new Date(x.at).getTime() > seenAt ? 1 : 0), 0);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next && typeof window !== "undefined") {
        const now = Date.now();
        localStorage.setItem(SEEN_KEY, String(now));
        setSeenAt(now);
      }
      return next;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="focus-ring w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
      >
        <Icon name="bell" size={17} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-indigo-500 text-white text-[9px] font-semibold flex items-center justify-center ring-2 ring-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[330px] rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_8px_40px_-8px_rgba(15,23,42,0.22)] overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-[13px] font-semibold text-slate-900 tracking-tight">Notifications</span>
            {notifs.length > 0 && <span className="text-[11px] text-slate-400 tabular-nums">{notifs.length}</span>}
          </div>
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center text-center py-8 px-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-300 mb-2.5"><Icon name="bell" size={18} /></div>
              <div className="text-[12.5px] font-medium text-slate-600">You&apos;re all caught up</div>
              <div className="text-[11.5px] text-slate-400 mt-0.5 max-w-[220px]">Mentor feedback and scheduled interactions will show up here.</div>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto py-1.5">
              {notifs.map((n) => (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className="flex gap-3 px-3 py-2.5 hover:bg-slate-50 no-underline transition-colors">
                  <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${SOFT_TONES[n.tone] ?? SOFT_TONES.indigo}`}><Icon name={n.icon} size={14} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium text-slate-800 tracking-tight leading-snug">{n.title}</div>
                    <div className="text-[11.5px] text-slate-500 tracking-tight truncate">{n.detail}</div>
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">{relTime(n.at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
