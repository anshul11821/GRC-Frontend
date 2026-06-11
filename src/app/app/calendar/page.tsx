"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Card } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/icon";
import { useCachedQuery } from "@/lib/use-query";
import { calendarApi, type CalendarEvent } from "@/lib/calendar";

const MotionLink = motion.create(Link);

const PROGRAM = "grc101";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (iso: string) => new Date(`${iso}T00:00:00`);

/** Visual tone per event type. */
const TYPE: Record<CalendarEvent["type"], { label: string; icon: IconName; dot: string; bar: string; avatar: string; accent: string }> = {
  interaction: { label: "Scheduled interaction", icon: "calendar", dot: "bg-indigo-500", bar: "bg-indigo-50 text-indigo-700 ring-indigo-100", avatar: "bg-indigo-50 text-indigo-600 ring-indigo-100", accent: "bg-indigo-500" },
  reminder: { label: "Review reminder", icon: "refresh", dot: "bg-amber-500", bar: "bg-amber-50 text-amber-700 ring-amber-100", avatar: "bg-amber-50 text-amber-600 ring-amber-100", accent: "bg-amber-500" },
};

const listV: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.045 } } };
const itemV: Variants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: "easeOut" } } };

function buildCells(year: number, month: number): Date[] {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((startDow + daysInMonth) / 7) * 7;
  const start = new Date(year, month, 1 - startDow);
  return Array.from({ length: total }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

function relativeDay(iso: string, todayISO: string): string {
  const diff = Math.round((parseISO(iso).getTime() - parseISO(todayISO).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1 && diff >= -7) return `${-diff} days ago`;
  return parseISO(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function EventCard({ e, dateLabel, onClick, reduce }: { e: CalendarEvent; dateLabel?: string; onClick?: () => void; reduce: boolean }) {
  const t = TYPE[e.type];
  return (
    <MotionLink
      href={`/app/desk/${e.activityId}`}
      onClick={onClick}
      variants={itemV}
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="group relative flex gap-3 rounded-xl p-3 pl-4 ring-1 ring-slate-200/70 bg-white hover:ring-slate-300/90 hover:shadow-[0_10px_24px_-16px_rgba(15,23,42,0.4)] no-underline overflow-hidden"
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${t.accent}`} />
      <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${t.avatar}`}><Icon name={t.icon} size={15} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">{t.label}</span>
          {dateLabel && <span className="ml-auto inline-flex items-center px-1.5 h-[18px] rounded-md bg-slate-100 text-[10px] font-medium text-slate-500 tracking-tight shrink-0">{dateLabel}</span>}
        </div>
        <div className="text-[12.5px] font-medium text-slate-800 tracking-tight leading-snug mt-0.5 group-hover:text-slate-950">{e.title}</div>
        {e.detail && <div className="text-[11.5px] text-slate-500 tracking-tight mt-0.5 line-clamp-2" style={{ textWrap: "pretty" }}>{e.detail}</div>}
        <div className="flex items-center gap-1.5 mt-1.5 text-slate-300">
          <span className="font-mono text-[10px]">{e.taskCode}·{e.activityCode}</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Open<Icon name="arrowRight" size={11} /></span>
        </div>
      </div>
    </MotionLink>
  );
}

export default function CalendarPage() {
  const { data, loading } = useCachedQuery(`calendar:${PROGRAM}`, () => calendarApi.get(PROGRAM));
  const events = useMemo(() => data ?? [], [data]);
  const reduce = !!useReducedMotion();

  const today = new Date();
  const todayISO = toISO(today);
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [dir, setDir] = useState(1);
  const [selected, setSelected] = useState<string | null>(todayISO);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      if (!e.eventDate) continue;
      const list = map.get(e.eventDate) ?? [];
      list.push(e);
      map.set(e.eventDate, list);
    }
    return map;
  }, [events]);

  const undated = useMemo(() => events.filter((e) => !e.eventDate), [events]);
  const upcoming = useMemo(
    () => events.filter((e) => e.eventDate && e.eventDate >= todayISO).sort((a, b) => (a.eventDate! < b.eventDate! ? -1 : 1)),
    [events, todayISO],
  );

  const cells = useMemo(() => buildCells(cursor.y, cursor.m), [cursor]);
  const selectedEvents = selected ? byDate.get(selected) ?? [] : [];
  const monthCount = useMemo(
    () => events.filter((e) => e.eventDate && e.eventDate.startsWith(`${cursor.y}-${pad(cursor.m + 1)}`)).length,
    [events, cursor],
  );

  const setMonth = (y: number, m: number) => {
    const target = y * 12 + m;
    setDir(target >= cursor.y * 12 + cursor.m ? 1 : -1);
    setCursor({ y, m });
  };
  const shift = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setDir(delta);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };
  const goToday = () => { setMonth(today.getFullYear(), today.getMonth()); setSelected(todayISO); };
  const jumpTo = (iso: string) => { const d = parseISO(iso); setMonth(d.getFullYear(), d.getMonth()); setSelected(iso); };

  if (loading && !data) {
    return (
      <div className="max-w-[1180px] mx-auto px-6 py-6 animate-pulse">
        <div className="h-6 w-40 rounded bg-slate-200 mb-1.5" />
        <div className="h-3 w-72 rounded bg-slate-100 mb-5" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-2xl ring-1 ring-slate-200/70 overflow-hidden">
            <div className="h-14 bg-slate-100/70" />
            <div className="grid grid-cols-7 gap-px bg-slate-100">
              {Array.from({ length: 35 }).map((_, i) => <div key={i} className="h-[88px] bg-white" />)}
            </div>
          </div>
          <div className="space-y-5">
            <div className="h-48 rounded-2xl bg-slate-100 ring-1 ring-slate-200/70" />
            <div className="h-40 rounded-2xl bg-slate-100 ring-1 ring-slate-200/70" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="max-w-[1180px] mx-auto px-6 py-6 space-y-5"
    >
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3.5">
          <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(79,70,229,0.6)] shrink-0">
            <Icon name="calendar" size={20} />
          </span>
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900">Calendar</h1>
            <p className="text-[12.5px] text-slate-500 mt-0.5">Your scheduled stakeholder interactions and revision reminders.</p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 text-[11.5px]">
          <span className="inline-flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Interaction</span>
          <span className="inline-flex items-center gap-1.5 text-slate-500"><span className="w-2 h-2 rounded-full bg-amber-500" /> Reminder</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Month grid */}
        <Card className="xl:col-span-2 overflow-hidden" pad={false}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-baseline gap-2.5 overflow-hidden">
              <motion.h2 key={`${cursor.y}-${cursor.m}`} initial={reduce ? false : { opacity: 0, x: dir * 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 tabular-nums">{MONTHS[cursor.m]} {cursor.y}</motion.h2>
              {monthCount > 0 && <span className="text-[11.5px] font-medium text-slate-400">{monthCount} event{monthCount === 1 ? "" : "s"}</span>}
            </div>
            <div className="inline-flex items-center rounded-lg ring-1 ring-slate-200/70 overflow-hidden">
              <button onClick={() => shift(-1)} aria-label="Previous month" className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors border-r border-slate-200/70 active:scale-95"><Icon name="chevronLeft" size={16} /></button>
              <button onClick={goToday} className="h-8 px-3 text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-r border-slate-200/70">Today</button>
              <button onClick={() => shift(1)} aria-label="Next month" className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors active:scale-95"><Icon name="chevronDown" size={16} className="-rotate-90" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 bg-slate-50/70 border-y border-slate-100">
            {DOW.map((d) => (
              <div key={d} className="text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-400 text-center py-2">{d}</div>
            ))}
          </div>
          {/* Keyed by month so each change replays a directional slide-in */}
          <motion.div
            key={`${cursor.y}-${cursor.m}`}
            initial={reduce ? false : { opacity: 0, x: dir * 26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="grid grid-cols-7 gap-px bg-slate-100"
          >
            {cells.map((dt) => {
              const iso = toISO(dt);
              const inMonth = dt.getMonth() === cursor.m;
              const weekend = dt.getDay() === 0 || dt.getDay() === 6;
              const dayEvents = byDate.get(iso) ?? [];
              const isToday = iso === todayISO;
              const isSel = iso === selected;
              const bg = !inMonth ? "bg-slate-50/50" : weekend ? "bg-slate-50/40" : "bg-white";
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  aria-pressed={isSel}
                  aria-label={parseISO(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
                  className={`group relative min-h-[88px] p-1.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 ${bg} hover:bg-slate-50`}
                >
                  {/* Shared highlight slides to whichever day is selected */}
                  {isSel && (
                    <motion.span
                      layoutId="cal-selected"
                      className="absolute inset-[2px] rounded-lg ring-2 ring-indigo-400 bg-indigo-50/70 pointer-events-none"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 42 }}
                    />
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1 rounded-full text-[11.5px] tabular-nums transition-colors ${isToday ? "bg-indigo-600 text-white font-semibold" : isSel ? "bg-indigo-100 text-indigo-700 font-semibold" : inMonth ? "text-slate-700 group-hover:text-slate-900" : "text-slate-300"}`}>{dt.getDate()}</span>
                      {dayEvents.length > 0 && !isSel && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/70 mr-0.5 xl:hidden" />}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((e, i) => {
                        const t = TYPE[e.type];
                        return (
                          <motion.div
                            key={e.id}
                            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: 0.12 + i * 0.04 }}
                            className={`hidden xl:flex items-center gap-1 px-1.5 h-[17px] rounded-md text-[9.5px] font-medium ring-1 ${t.bar} truncate`}
                          >
                            <span className={`w-1 h-1 rounded-full shrink-0 ${t.dot}`} />
                            <span className="truncate">{e.title}</span>
                          </motion.div>
                        );
                      })}
                      {dayEvents.length > 3 && <div className="hidden xl:block text-[9.5px] font-medium text-slate-400 px-1.5">+{dayEvents.length - 3} more</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </Card>

        {/* Agenda */}
        <div className="space-y-5">
          {/* Selected day */}
          <Card>
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="min-w-0">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-indigo-500">{selected ? relativeDay(selected, todayISO) : "—"}</div>
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900 leading-tight mt-0.5">{selected ? parseISO(selected).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : "Select a day"}</h2>
              </div>
              {selectedEvents.length > 0 && (
                <motion.span key={selectedEvents.length} initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }} className="shrink-0 inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-indigo-600 text-white text-[11.5px] font-semibold tabular-nums">{selectedEvents.length}</motion.span>
              )}
            </div>
            {selectedEvents.length === 0 ? (
              <motion.div key={`empty-${selected}`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col items-center text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 ring-1 ring-slate-200/70 flex items-center justify-center text-slate-300 mb-2.5"><Icon name="calendar" size={18} /></div>
                <div className="text-[12.5px] font-medium text-slate-600">Nothing scheduled</div>
                <div className="text-[11.5px] text-slate-400 mt-0.5">Pick another day to see its events.</div>
              </motion.div>
            ) : (
              <motion.div key={selected} variants={listV} initial="hidden" animate="show" className="space-y-2.5">
                {selectedEvents.map((e) => <EventCard key={e.id} e={e} reduce={reduce} />)}
              </motion.div>
            )}
          </Card>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="bolt" size={14} className="text-indigo-500" />
                <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Upcoming</h2>
                <span className="ml-auto text-[11px] font-medium text-slate-400">{upcoming.length}</span>
              </div>
              <motion.div variants={listV} initial="hidden" animate="show" className="space-y-2.5">
                {upcoming.slice(0, 6).map((e) => (
                  <EventCard key={e.id} e={e} dateLabel={relativeDay(e.eventDate!, todayISO)} onClick={() => jumpTo(e.eventDate!)} reduce={reduce} />
                ))}
              </motion.div>
            </Card>
          )}

          {/* Proposed / unscheduled */}
          {undated.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <Icon name="history" size={14} className="text-slate-400" />
                <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Proposed · unscheduled</h2>
              </div>
              <p className="text-[11.5px] text-slate-400 mb-3">Interactions without a confirmed date yet.</p>
              <motion.div variants={listV} initial="hidden" animate="show" className="space-y-2.5">
                {undated.map((e) => <EventCard key={e.id} e={e} dateLabel="No date" reduce={reduce} />)}
              </motion.div>
            </Card>
          )}

          {/* Empty */}
          {events.length === 0 && (
            <Card>
              <div className="flex flex-col items-center text-center py-7">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100 flex items-center justify-center text-indigo-400 mb-3"><Icon name="calendar" size={22} /></div>
                <div className="text-[13px] font-medium text-slate-700">No calendar items yet</div>
                <div className="text-[12px] text-slate-400 mt-1 max-w-xs leading-relaxed">Schedule a stakeholder interaction, or pick up a revision, and it&apos;ll appear here automatically.</div>
                <Link href="/app/desk" className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 text-white text-[12.5px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors">
                  Go to Working Desk <Icon name="arrowRight" size={13} />
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
