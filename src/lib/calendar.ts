/**
 * Calendar feed (authed). Mirrors the FastAPI GET /me/calendar contract.
 * Events are derived server-side from the user's own work:
 * - "interaction" — a scheduled stakeholder interaction (from a `schedule`-verb submission)
 * - "reminder"    — a follow-up to revise & resubmit (from a review that asked for changes)
 */
import { api } from "./api";

export type CalendarEventType = "deadline" | "leave" | "interaction" | "reminder";
export type DeadlineStage = "rua" | "actions" | "research";
export type DeadlineStatus = "done" | "overdue" | "upcoming";

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  detail: string | null;
  /** ISO date (YYYY-MM-DD) or null when a proposed time couldn't be parsed. */
  eventDate: string | null;
  /** Null for "leave" events (they point at no activity). */
  activityId: string | null;
  activityCode: string | null;
  taskCode: string | null;
  verb: string | null;
  /** Set on "deadline" events. */
  stage: DeadlineStage | null;
  status: DeadlineStatus | null;
  createdAt: string;
}

export interface LeaveState {
  allowance: number;
  used: number;
  remaining: number;
  days: string[];
}

export const calendarApi = {
  get: (program = "grc101") =>
    api.get<CalendarEvent[]>("/me/calendar", { query: { program } }),
};

export const leaveApi = {
  get: (program = "grc101") => api.get<LeaveState>("/me/leave", { query: { program } }),
  add: (day: string, program = "grc101") =>
    api.post<LeaveState>("/me/leave", { day }, { query: { program } }),
  remove: (day: string, program = "grc101") =>
    api.delete<LeaveState>("/me/leave", { query: { program, day } }),
};
