"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GuidedTour, markTourSeen, useTourOnce, type TourStep } from "./guided-tour";
import { useAuth } from "@/components/auth/auth-provider";
import { TOUR_SEEN_KEY } from "./nav";

/** Fire from anywhere to (re)start the main guide — the User Guide page, the account menu and the
 *  dashboard's own Guide button use it. A window event keeps the trigger decoupled from AppShell,
 *  which owns the tour state. */
export const TOUR_EVENT = "grc:welcome-tour";
export const startWelcomeTour = () => window.dispatchEvent(new Event(TOUR_EVENT));

/** Spotlight a piece of app chrome by its data-tour tag. */
const tag = (name: string) => () => document.querySelector<HTMLElement>(`[data-tour="${name}"]`);

/**
 * The main guide: one walkthrough of the whole app. It covers the shell's navigation and, in the
 * middle, walks the dashboard itself — opening it if the mentee is somewhere else. The dashboard
 * has no separate tour; these are the same steps, in reading order.
 *
 * Mounted by AppShell, which persists across every /app route, so the tour survives the navigation
 * it performs. The Working Desk keeps its own deeper walkthrough (organisation, tree, task brief).
 */
function steps(showNav: () => void, goto: (href: string) => void): TourStep[] {
  /** Nav steps: the rail is always mounted; reveal the drawer on small screens. */
  const nav = (name: string): Pick<TourStep, "getEl" | "onEnter"> => ({ getEl: tag(name), onEnter: showNav });
  /** Dashboard steps: make sure we're on the dashboard (also covers stepping Back into them). */
  const dash = (name: string): Pick<TourStep, "getEl" | "onEnter"> => ({ getEl: tag(name), onEnter: () => goto("/app") });

  return [
    {
      title: "Welcome — here's how this works",
      body: "You're joining a simulated company as its GRC practitioner. Two minutes now and you'll know where everything lives. Use Next, or Skip if you'd rather explore.",
      icon: "sparkle",
      getEl: () => null, // no target — the card floats, page dimmed
    },
    {
      title: "Your dashboard",
      body: "Start every session here. It's the first item in the nav, and it's where your progress, your scores and your next move all live.",
      icon: "home",
      ...nav("nav-dashboard"),
    },
    {
      title: "Your next move, always on top",
      body: "This banner points at the exact task and step to continue, with your enrol status and certificate progress beside it. Continue jumps straight into the Working Desk.",
      icon: "play",
      ...dash("dash-hero"),
    },
    {
      title: "Your numbers at a glance",
      body: "Activities completed, your average mentor score, and anything due soon — a quick read on where you stand this track.",
      icon: "checkSquare",
      optional: true, // a locked track shows a preview instead
      ...dash("dash-stats"),
    },
    {
      title: "Your organisations",
      body: "Each card is a simulated enterprise engagement. Open one and you land in the Working Desk, on that organisation's context page.",
      icon: "briefcase",
      optional: true,
      ...dash("dash-orgs"),
    },
    {
      title: "Standards you're covering",
      body: "The GRC frameworks behind your tasks. Use the tabs to move across every framework in the track — each opens its own panel showing the tasks and activities it drives.",
      icon: "shield",
      optional: true,
      ...dash("dash-standards"),
    },
    {
      title: "Track your growth",
      body: "Your skill rubric radar and progress bars fill in as the mentor grades your work. Come back here to watch badges and scores climb.",
      icon: "star",
      optional: true,
      ...dash("dash-grid"),
    },
    {
      title: "The Working Desk — where you actually work",
      body: "Your engagement nests: organisation → project → task → activity. Read the brief → read the reference documents → fill in the workspace → submit → act on the feedback. Every activity runs that same loop, and the desk has its own walkthrough when you get there.",
      icon: "desk",
      ...nav("nav-desk"),
    },
    {
      title: "Read the documents. That's the job.",
      body: "Each task hands you real source material — intake notes, a classification scheme, a standard extract. The facts you need are only in there. Answers written from general knowledge instead of the documents are the single most common reason work comes back.",
      icon: "book",
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
      body: "The clock shows what's on you right now — overdue stages, revisions still outstanding, and anything due in the next week. Profile, password and billing sit under your avatar — along with a link back to this guide.",
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
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(-1);

  // On desktop the sidebar is always present — don't pop the drawer open behind the spotlight.
  const showNav = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) openNav();
  }, [openNav]);

  // replace, not push: a fourteen-step guide shouldn't bury the mentee's real history.
  const goto = useCallback((href: string) => {
    if (window.location.pathname !== href) router.replace(href);
  }, [router]);

  const tourSteps = useMemo(() => steps(showNav, goto), [showNav, goto]);

  // First run, per mentee. Delayed so the shell has painted and the nav targets are measurable.
  useTourOnce(TOUR_SEEN_KEY, user?.email, true, () => setStep(0), 600);

  // Manual relaunch.
  useEffect(() => {
    const onStart = () => setStep(0);
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, []);

  const close = useCallback(() => {
    setStep(-1);
    markTourSeen(TOUR_SEEN_KEY, user?.email);
  }, [user?.email]);

  return <GuidedTour steps={tourSteps} step={step} onStep={setStep} onClose={close} />;
}
