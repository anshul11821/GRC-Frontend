// Mentor credentials — what a reviewer can point at outside the product.
//
// Derived on the frontend from /mentor/stats, exactly like the learner's badges are derived from
// /me/learnings (lib/badges.ts). No table, no issue step, no backend: a badge here is a *reading*
// of facts already recorded, so it cannot drift from the record and cannot be awarded by mistake.
//
// Every threshold is volume the mentor actually did, or a role the register actually granted them.
// Nothing is a participation award and nothing counts a withdrawn decision — `decidedTotal`
// already excludes those, because an undone review was not a review.

import type { MentorStats } from "./mentor";

export interface MentorBadgeDef {
  id: string;
  name: string;
  /** Tier family — shared centre text across badges of the same kind. */
  family: string;
  /** What holding it actually attests. Written to be quotable on a profile. */
  certifies: string;
  /** How many of `unit` are needed. */
  threshold: number;
  unit: "reviews" | "mentees" | "certified" | "roles";
}

export interface MentorBadge extends MentorBadgeDef {
  earned: boolean;
  /** Current count against the threshold, for the progress line on an unearned badge. */
  progress: number;
}

/** Ranked bands, reusing the learner medal's vocabulary so the two sets read as one scheme. */
export type MentorBandName = "FOUNDATION" | "PRACTITIONER" | "MASTERY";
export const bandForThreshold = (n: number): MentorBandName =>
  n >= 250 ? "MASTERY" : n >= 25 ? "PRACTITIONER" : "FOUNDATION";

export const MENTOR_BADGES: MentorBadgeDef[] = [
  // ---- Gates reviewed -------------------------------------------------------------------
  {
    id: "first-decision",
    name: "First Decision",
    family: "Gate Review",
    certifies: "Has taken a binding decision on a learner's work at a designated review gate.",
    threshold: 1,
    unit: "reviews",
  },
  {
    id: "reviewer-25",
    name: "Reviewer",
    family: "Gate Review",
    certifies: "Has decided 25 review gates against the programme's six-question checklist.",
    threshold: 25,
    unit: "reviews",
  },
  {
    id: "senior-reviewer-100",
    name: "Senior Reviewer",
    family: "Gate Review",
    certifies: "Has decided 100 review gates, with a documented reason on every one.",
    threshold: 100,
    unit: "reviews",
  },
  {
    id: "principal-reviewer-250",
    name: "Principal Reviewer",
    family: "Gate Review",
    certifies: "Has decided 250 review gates across the GRC 101 gate register.",
    threshold: 250,
    unit: "reviews",
  },
  // ---- People mentored ------------------------------------------------------------------
  {
    id: "mentor-of-record",
    name: "Mentor of Record",
    family: "Mentorship",
    certifies: "Named mentor of record for a learner's whole GRC 101 engagement.",
    threshold: 1,
    unit: "mentees",
  },
  {
    id: "cohort-mentor-10",
    name: "Cohort Mentor",
    family: "Mentorship",
    certifies: "Holds mentor of record for ten or more learners at once.",
    threshold: 10,
    unit: "mentees",
  },
  {
    id: "programme-mentor-50",
    name: "Programme Mentor",
    family: "Mentorship",
    certifies: "Holds mentor of record for fifty or more learners at once.",
    threshold: 50,
    unit: "mentees",
  },
  // ---- Outcomes -------------------------------------------------------------------------
  // The only figures here about somebody else's result rather than the mentor's own volume, and
  // the strongest thing on the profile for exactly that reason.
  {
    id: "first-certified",
    name: "Saw One Through",
    family: "Outcomes",
    certifies: "Mentored a learner all the way to a verifiable GRC 101 certificate.",
    threshold: 1,
    unit: "certified",
  },
  {
    id: "ten-certified",
    name: "Ten Certified",
    family: "Outcomes",
    certifies: "Mentored ten learners to a verifiable GRC 101 certificate.",
    threshold: 10,
    unit: "certified",
  },
  // ---- Scope ----------------------------------------------------------------------------
  {
    id: "full-bench",
    name: "Full Bench",
    family: "Scope",
    certifies: "Qualified to review every reviewer role in the gate register, all nine of them.",
    threshold: 9,
    unit: "roles",
  },
];

/** Read the badge set off a mentor's own record. Pure — same stats in, same badges out. */
export function mentorBadges(stats: MentorStats): MentorBadge[] {
  const counts: Record<MentorBadgeDef["unit"], number> = {
    reviews: stats.decidedTotal,
    mentees: stats.mentees,
    certified: stats.menteesCertified,
    roles: stats.roles,
  };
  return MENTOR_BADGES.map((b) => ({
    ...b,
    progress: counts[b.unit],
    earned: counts[b.unit] >= b.threshold,
  }));
}

export const UNIT_LABEL: Record<MentorBadgeDef["unit"], string> = {
  reviews: "gates reviewed",
  mentees: "learners mentored",
  certified: "learners certified",
  roles: "reviewer roles held",
};
