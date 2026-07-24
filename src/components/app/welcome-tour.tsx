"use client";

import { useCallback, useEffect, useState } from "react";
import { GuidedTour, type TourStep } from "./guided-tour";
import { TOUR_SEEN_KEY } from "./nav";

/** Fire from anywhere to (re)start the welcome tour — the User Guide page and the account menu use
 *  it. A window event keeps the trigger decoupled from AppShell, which owns the tour state. */
export const TOUR_EVENT = "grc:welcome-tour";
export const startWelcomeTour = () => window.dispatchEvent(new Event(TOUR_EVENT));

/** Spotlight a piece of app chrome by its data-tour tag. */
const tag = (name: string) => () => document.querySelector<HTMLElement>(`[data-tour="${name}"]`);

/** First-run walkthrough of the app shell — same spotlight coach-marks the task and activity screens
 *  use, pointed at the real navigation instead. Covers what each surface is for and the working
 *  rhythm itself, ending on the written guide. */
function steps(showNav: () => void): TourStep[] {
  const nav = (name: string): Pick<TourStep, "getEl" | "onEnter"> => ({ getEl: tag(name), onEnter: showNav });
  return [
    {
      title: "Welcome — here's how this works",
      body: "You're joining a simulated company as its GRC practitioner. Two minutes now and you'll know where everything lives. Use Next, or Skip if you'd rather explore.",
      icon: "sparkle",
      getEl: () => null, // no target — the card floats, page dimmed
    },
    {
      title: "Your dashboard",
      body: "Progress at a glance, your rubric averages, and a Continue card that jumps straight into your next unfinished activity. Start here each session.",
      icon: "home",
      ...nav("nav-dashboard"),
    },
    {
      title: "The Working Desk — where you actually work",
      body: "Your engagement nests: organisation → project → task → activity. The desk gives you one activity at a time, with its brief, its reference documents and the form you fill in, all on one screen.",
      icon: "desk",
      ...nav("nav-desk"),
    },
    {
      title: "The rhythm never changes",
      body: "Read the brief → read the reference documents → fill in the workspace with the live checklist visible → submit → act on the feedback. Every activity in every track runs that same loop.",
      icon: "refresh",
      ...nav("nav-desk"),
    },
    {
      title: "Read the documents. That's the job.",
      body: "Each task hands you real source material — intake notes, a classification scheme, a standard extract. The facts you need are only in there. Answers written from general knowledge instead of the documents are the single most common reason work comes back.",
      icon: "book",
      ...nav("nav-desk"),
    },
    {
      title: "Every task opens and closes with a gate",
      body: "A readiness check proves you understand the controls and templates before the activities unlock; a research submission evidences your sources before the task closes. Both are graded.",
      icon: "shield",
      ...nav("nav-desk"),
    },
    {
      title: "Your engagements and deliverables",
      body: "My Learnings is the full tree — every organisation you've worked, its projects, tasks and the artefacts you produced. Earlier work is reference material for later tasks, so it stays available.",
      icon: "layers",
      ...nav("nav-learnings"),
    },
    {
      title: "Everything below compiles itself",
      body: "Badges, your certificate, your CV, career tools, reports and matched jobs are all generated from graded work. You never write them by hand — finish tasks and they fill in.",
      icon: "trophy",
      ...nav("nav"),
    },
    {
      title: "How your work is graded",
      body: "Mechanical checks first — mandatory fields, owners named as roles not departments, arithmetic that re-computes. Pass those and an AI mentor scores the substance on five rubric dimensions, with Socratic feedback. Write decision + the rule you applied + who owns what happens next, and you'll score well.",
      icon: "bullseye",
      ...nav("nav-reports"),
    },
    {
      title: "What's due, and your account",
      body: "The clock shows what's on you right now — overdue stages, revisions still outstanding, and anything due in the next week. Profile, password and billing sit under your avatar — along with a link back to this tour.",
      icon: "clock",
      getEl: tag("bell"),
    },
    {
      title: "The full written guide lives here",
      body: "Worth ten minutes before you start: it walks your actual first task end to end, and shows weak vs strong answers side by side so you know what good looks like. Come back to it whenever something's unclear.",
      icon: "help",
      ...nav("nav-guide"),
    },
  ];
}

/** Mounted once by AppShell. Auto-runs on the mentee's first visit, and any time `startWelcomeTour`
 *  fires. `openNav` reveals the mobile drawer so the nav targets exist on small screens. */
export function WelcomeTour({ openNav }: { openNav: () => void }) {
  const [step, setStep] = useState(-1);

  // On desktop the sidebar is always present — don't pop the drawer open behind the spotlight.
  const showNav = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) openNav();
  }, [openNav]);

  const close = useCallback(() => {
    setStep(-1);
    try {
      localStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      // Storage unavailable — the tour just offers itself again next visit.
    }
  }, []);

  // First run. Delayed so the shell has painted and the nav targets are measurable.
  useEffect(() => {
    let seen = true;
    try {
      seen = !!localStorage.getItem(TOUR_SEEN_KEY);
    } catch {
      // Can't tell → don't ambush them.
    }
    if (seen) return;
    const t = setTimeout(() => setStep(0), 600);
    return () => clearTimeout(t);
  }, []);

  // Manual relaunch.
  useEffect(() => {
    const onStart = () => setStep(0);
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, []);

  return <GuidedTour steps={steps(showNav)} step={step} onStep={setStep} onClose={close} />;
}
