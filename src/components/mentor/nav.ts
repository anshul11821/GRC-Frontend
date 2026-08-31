import type { IconName } from "@/components/ui/icon";

/**
 * The mentor's primary navigation, deliberately shaped like the learner's (`components/app/nav.ts`)
 * so the two consoles feel like one product — but only carrying what a reviewer actually has.
 *
 * Dropped from the learner's rail: Calendar, Badges, Certificate, My CV, Career, Matching Jobs.
 * Those are credential surfaces a mentor never earns. Reports is folded into the Dashboard rather
 * than given its own item — the figures already exist in `build_stats` and a second analytics page
 * is one more place to check for the same numbers.
 */
export interface MentorNavItem {
  id: string;
  label: string;
  icon: IconName;
  href: string;
}

export const MENTOR_NAV: MentorNavItem[] = [
  // The flat, SLA-ordered worklist lives here, not on the Review Desk. With hundreds of learners
  // per mentor, finding work by browsing the roster is the thing that multiplies a reviewer's day.
  { id: "dashboard", label: "Dashboard", icon: "home", href: "/mentor" },
  { id: "desk", label: "Review Desk", icon: "desk", href: "/mentor/desk" },
  { id: "badges", label: "Recognition", icon: "ribbon", href: "/mentor/badges" },
  { id: "earnings", label: "My Earnings", icon: "chart", href: "/mentor/earnings" },
  { id: "guide", label: "Mentor Guide", icon: "help", href: "/mentor/guide" },
];

/** `/mentor` is the Dashboard, so it must match exactly or every route lights it up. */
export const isNavActive = (href: string, pathname: string) =>
  href === "/mentor" ? pathname === "/mentor" : pathname.startsWith(href);
