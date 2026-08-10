/**
 * Derives the "Up next" list from the calendar feed: what the mentee still owes, soonest first.
 * Pure so it can be self-checked without React — see up-next.test.ts.
 *
 * ponytail: no notifications table, no read/unread state. The badge counts real outstanding
 * work and clears when the work is done. Add stored notifications only if we ever need to
 * notify about something that isn't already derivable from the calendar.
 */
import type { CalendarEvent } from "./calendar";
import type { MentorFeedback } from "./desk";

/** Only look this far ahead — beyond it, everything is "later", which is the Calendar page's job. */
export const HORIZON_DAYS = 7;

export interface UpNextItem {
  id: string;
  icon: string;
  tone: "rose" | "amber" | "indigo" | "sky";
  title: string;
  detail: string;
  when: string;
  href: string;
  date: string;
  /** Blocking = counted on the badge: overdue work, outstanding revisions, due today. */
  blocking: boolean;
}

const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Whole days from `from` (default: local today) to an ISO date — negative is in the past. */
export function daysOut(iso: string, from: string = isoDay(new Date())): number {
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

export function relDay(iso: string, from?: string): string {
  const d = daysOut(iso, from);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d < 0) return `${-d}d late`;
  return `in ${d}d`;
}

function toItem(e: CalendarEvent, from?: string): UpNextItem | null {
  if (!e.eventDate) return null; // unscheduled interactions live on the Calendar page
  const out = daysOut(e.eventDate, from);
  const where = `${e.taskCode ?? ""}${e.activityCode ? `·${e.activityCode}` : ""}`.replace(/^·/, "");
  const base = {
    id: e.id,
    when: relDay(e.eventDate, from),
    date: e.eventDate,
    href: e.activityId ? `/app/desk/${e.activityId}` : "/app/calendar",
    detail: where ? `${where} · ${e.title}` : e.title,
  };

  if (e.type === "deadline") {
    if (e.status === "done" || out > HORIZON_DAYS) return null;
    const late = e.status === "overdue";
    return {
      ...base,
      icon: late ? "alertTriangle" : "clock",
      tone: late ? "rose" : "indigo",
      title: late ? "Overdue" : out === 0 ? "Due today" : "Coming up",
      blocking: late || out === 0,
    };
  }
  if (e.type === "reminder") {
    // The backend only emits these while a revision is still outstanding.
    return { ...base, icon: "refresh", tone: "amber", title: "Revision outstanding", blocking: true };
  }
  if (e.type === "interaction" && out >= 0 && out <= HORIZON_DAYS) {
    return { ...base, icon: "calendar", tone: "sky", title: "Stakeholder session", href: "/app/calendar", detail: e.title, blocking: false };
  }
  return null; // leave days, far-future deadlines, past interactions
}

/**
 * A mentor decision, as a bell item. Always counted on the badge: unseen feedback is news whether
 * it is good or bad, and an approval nobody notices is an approval that did not land. The seen-set
 * clears it once the dropdown is opened.
 */
function feedbackItem(f: MentorFeedback, from?: string): UpNextItem {
  const day = f.decidedAt.slice(0, 10);
  const where = `${f.taskCode}·${f.activityCode}`;
  const style: Record<MentorFeedback["outcome"], { icon: string; tone: UpNextItem["tone"]; title: string }> = {
    approve: { icon: "checkCircle", tone: "indigo", title: "Mentor approved your work" },
    // Approved, but the step will not complete until they read the note — so it is action, not news.
    approve_note: { icon: "chat", tone: "amber", title: "Mentor left a note to read" },
    disapprove_return: { icon: "refresh", tone: "amber", title: "Mentor returned your work" },
    disapprove_escalate: { icon: "flag", tone: "rose", title: "Mentor escalated your work" },
  };
  const s = style[f.outcome];
  return {
    id: f.id,
    icon: s.icon,
    tone: s.tone,
    title: s.title,
    detail: `${where} · ${f.gateName}`,
    when: relDay(day, from),
    href: `/app/desk/${f.activityId}`,
    date: day,
    blocking: true,
  };
}

export function buildUpNext(
  events: CalendarEvent[],
  feedback: MentorFeedback[] = [],
  from?: string,
): UpNextItem[] {
  return [
    ...events.map((e) => toItem(e, from)).filter((x): x is UpNextItem => x !== null),
    ...feedback.map((f) => feedbackItem(f, from)),
  ]
    .sort((a, b) => a.date.localeCompare(b.date)) // past dates sort first
    .slice(0, 10);
}
