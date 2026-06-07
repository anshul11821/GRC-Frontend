/**
 * Calendar feed (authed). Mirrors the FastAPI GET /me/calendar contract.
 * Events are derived server-side from the user's own work:
 * - "interaction" — a scheduled stakeholder interaction (from a `schedule`-verb submission)
 * - "reminder"    — a follow-up to revise & resubmit (from a review that asked for changes)
 */
import { api } from "./api";

export type CalendarEventType = "interaction" | "reminder";

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  detail: string | null;
  /** ISO date (YYYY-MM-DD) or null when a proposed time couldn't be parsed. */
  eventDate: string | null;
  activityId: string;
  activityCode: string;
  taskCode: string;
  verb: string;
  createdAt: string;
}

export const calendarApi = {
  get: (program = "grc101") =>
    api.get<CalendarEvent[]>("/me/calendar", { query: { program } }),
};
