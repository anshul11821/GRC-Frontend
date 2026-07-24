"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { useCachedQuery } from "@/lib/use-query";
import { calendarApi } from "@/lib/calendar";
import { buildUpNext } from "@/lib/up-next";
import { SOFT_TONES } from "@/lib/tones";
import { DropdownPanel } from "@/components/ui/motion";

const PROGRAM = "grc101";

export function UpNext() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Same cache key as the Calendar page — this costs no extra request.
  const { data: cal } = useCachedQuery(`calendar:${PROGRAM}`, () => calendarApi.get(PROGRAM));

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const items = useMemo(() => buildUpNext(cal ?? []), [cal]);
  const blocking = items.reduce((n, x) => n + (x.blocking ? 1 : 0), 0);
  const late = items.some((x) => x.tone === "rose");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Up next"
        className="focus-ring w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
      >
        <Icon name="clock" size={17} />
        {blocking > 0 && (
          <span
            className={`absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full text-white text-[9px] font-semibold flex items-center justify-center ring-2 ring-white tabular-nums ${late ? "bg-rose-500" : "bg-indigo-500"}`}
          >
            {blocking > 9 ? "9+" : blocking}
          </span>
        )}
      </button>

      <DropdownPanel open={open} className="absolute right-0 mt-2 w-[330px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-[13px] font-semibold text-slate-900 tracking-tight">Up next</span>
          <Link href="/app/calendar" onClick={() => setOpen(false)} className="text-[11px] text-slate-400 hover:text-slate-600 no-underline">
            Calendar
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-8 px-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-300 mb-2.5">
              <Icon name="checkCircle" size={18} />
            </div>
            <div className="text-[12.5px] font-medium text-slate-600">Nothing due</div>
            <div className="text-[11.5px] text-slate-400 mt-0.5 max-w-[220px]">
              Deadlines, outstanding revisions and booked sessions show up here.
            </div>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto py-1.5">
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex gap-3 px-3 py-2.5 hover:bg-slate-50 no-underline transition-colors"
              >
                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${SOFT_TONES[n.tone]}`}>
                  <Icon name={n.icon as IconName} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-slate-800 tracking-tight leading-snug">{n.title}</div>
                  <div className="text-[11.5px] text-slate-500 tracking-tight truncate">{n.detail}</div>
                </div>
                <span className={`text-[10.5px] shrink-0 mt-0.5 whitespace-nowrap ${n.tone === "rose" ? "text-rose-500 font-medium" : "text-slate-400"}`}>
                  {n.when}
                </span>
              </Link>
            ))}
          </div>
        )}
      </DropdownPanel>
    </div>
  );
}
