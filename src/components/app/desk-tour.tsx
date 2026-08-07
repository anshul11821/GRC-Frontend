"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GuidedTour, markTourSeen, useTourOnce, type TourStep } from "./guided-tour";
import { Icon } from "@/components/ui/icon";
import { Gloss } from "@/components/app/glossary";
import { useAuth } from "@/components/auth/auth-provider";
import { DESK_TOUR_EVENT, showDeskTree, useDeskLearnings } from "./desk-context";
import { DESK_TOUR_SEEN_KEY } from "./nav";
import { TASK_META } from "@/lib/taskmeta";
import { CONTROLS_BY_TASK } from "@/lib/controls";

/** Spotlight a piece of desk chrome by its data-tour tag. */
const tag = (name: string) => () => document.querySelector<HTMLElement>(`[data-tour="${name}"]`);

/**
 * The Working Desk walkthrough — one continuous tour across the desk's two surfaces: the engagement
 * tree, the organisation you're placed at, and then a real task brief, which it opens for you.
 *
 * It's mounted by DeskLayout rather than by a page, because a page unmounts the moment the tour
 * navigates. `goto` moves the route from inside a step; GuidedTour waits for the new page's target
 * to mount before placing the spotlight.
 */
function steps(goto: (href: string) => void, orgHref: string, task: { href: string; code: string } | null): TourStep[] {
  /** Tree steps: reveal the rail (an off-canvas drawer on mobile) — no route change needed. */
  const tree = (name: string): Pick<TourStep, "getEl" | "onEnter"> => ({ getEl: tag(name), onEnter: () => showDeskTree(true) });
  /** Page steps: put the drawer away and make sure we're on the right route (also covers going Back). */
  const at = (href: string, name: string): Pick<TourStep, "getEl" | "onEnter"> => ({
    getEl: tag(name),
    onEnter: () => { showDeskTree(false); goto(href); },
  });

  const s: TourStep[] = [
    {
      title: "This is the Working Desk",
      body: "Your engagement has started — this is where you'll do every piece of work from here on. You're looking at the organisation you've been placed at; the tree on the left is everything you'll do for them.",
      icon: "desk",
      getEl: () => null, // no target — the card floats, page dimmed
    },
    {
      // Second, before any content — it's the key to reading everything the rest of the tour shows,
      // and skimmers who bail after two cards still leave with it. Targetless, so the demo in the
      // card is the whole step: one click and the mechanic is learnt.
      title: "Stuck on a word? Click it.",
      body: "Every technical term is underlined wherever it appears — briefs, the organisation profile, reference documents, grading criteria. You never have to leave to look one up.",
      icon: "book",
      getEl: () => null,
      demo: (
        <div className="gloss-above guide-blink mt-3 rounded-xl bg-gradient-to-br from-indigo-50 via-violet-50/70 to-fuchsia-50/60 ring-1 ring-indigo-100 px-3.5 py-3">
          <p className="text-[12.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
            <Gloss>Every information asset needs a named asset owner before sign-off.</Gloss>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-tight text-fuchsia-600">
            <Icon name="bolt" size={12} /> Try it now — click a dotted word
          </p>
        </div>
      ),
    },
    {
      title: "Your engagement, top to bottom",
      body: "Everything nests: organisation → task → activity. This rail stays with you the whole way, so you can always see where you are and jump anywhere that's open.",
      icon: "layers",
      ...tree("desk-tree"),
    },
    {
      title: "The organisation you're placed at",
      body: "Its name in the rail always brings you back to the context page. One placement runs at a time; the next unlocks when this one is complete.",
      icon: "briefcase",
      ...tree("desk-org"),
    },
    {
      title: "Tasks, grouped by method",
      body: "Tasks sit under the method category they belong to, and open in order — the lock lifts as you finish the one before. Each row shows its standard, how many activities you've done, and when the next one is due. Your current task is already expanded.",
      icon: "checkSquare",
      ...tree("desk-task"),
    },
    {
      title: "Activities — and the two gates",
      body: "Inside a task, each row is one activity built on a method verb. The shield opens the task (a readiness check on its controls and templates) and the globe closes it (your research and sources). Both are graded, and the activities between them stay locked until the shield is passed.",
      icon: "shield",
      ...tree("desk-steps"),
    },
    {
      title: "Your progress, always in view",
      body: "Activities completed across the whole GRC 101 track. Each organisation above carries its own bar too.",
      icon: "chart",
      ...tree("desk-progress"),
    },
    {
      title: "Know who you're working for",
      body: "This page is the client brief: what they do, where they operate, and who regulates them. Read it before your first task — answers that ignore the organisation's actual context are the most common reason work comes back.",
      icon: "book",
      ...at(orgHref, "org-identity"),
    },
    {
      title: "Their footprint, systems and people",
      body: "Offices, services, the data they hold, their assets, every stakeholder with a stake in the outcome, and the standards they're bound by. Tasks ask you to scope, classify and assign ownership using exactly these facts — this grid is where you look them up.",
      icon: "layers",
      ...at(orgHref, "org-grid"),
    },
  ];

  // No open task yet (a fresh placement can be fully locked) — close on the org page instead.
  if (!task) return s;
  const taskHref = task.href;
  // Only spotlight what this task actually renders, or the step would poll for a target that never
  // mounts. Both catalogues are static client-side data, so this needs no fetch.
  const hasControls = (CONTROLS_BY_TASK[task.code]?.controls.length ?? 0) > 0;
  const hasObjective = !!TASK_META[task.code]?.deliverable;

  return [
    ...s,
    {
      title: "Now a real task",
      body: "This is your current task, opened for you. Every task starts with this banner: the framework behind it, the domain it sits in, and what the task is about. The grading follows that standard's language.",
      icon: "play",
      ...at(taskHref, "task-banner"),
    },
    ...(hasObjective ? [{
      title: "Read the objective",
      body: "What the task has to achieve, and the final deliverable it builds toward. Everything below serves this.",
      icon: "target",
      ...at(taskHref, "task-objective"),
    } as TourStep] : []),
    ...(hasControls ? [{
      title: "Check the control references",
      body: "The clauses and controls the task is graded against. Open it and read them before you start — your work should trace back to each one.",
      icon: "shield",
      ...at(taskHref, "task-controls"),
    } as TourStep] : []),
    {
      title: "Work through the actions",
      body: "The same activities as the tree, in full: verb, title and due date. Do them in order — the earlier ones produce what the later ones need.",
      icon: "list",
      ...at(taskHref, "task-actions"),
    },
    {
      title: "Start when you're ready",
      body: "This drops you into your next unfinished activity, where the brief, the reference documents and the form you fill in all sit on one screen. Every activity has its own Guide button if you need it there too.",
      icon: "play",
      ...at(taskHref, "task-start"),
    },
  ];
}

/**
 * Module scope, deliberately — not React state.
 *
 * `app/template.tsx` is re-keyed by Next on every navigation, so everything under it (DeskLayout,
 * and this component with it) remounts whenever the mentee moves between desk pages. React state
 * therefore can't hold a walkthrough that walks from the org page into a task brief: `step` would
 * reset to -1 at the very step that navigates, the tour would vanish, and — because it never
 * reached `onClose` — it would count as unseen and start again on the next navigation.
 *
 * These two survive the remount. `liveStep` keeps the tour running across pages; `offered` stops a
 * remount re-offering a walkthrough the mentee has already been shown this session, even if they
 * walked away from it rather than dismissing it.
 */
let liveStep = -1;
let offered = false;

/** Auto-runs on the mentee's first visit to the desk — which, because the desk is gated behind the
 *  start-date picker, is the moment right after they pick their start date — and any time
 *  `startDeskTour` fires from the org page's Guide button. */
export function DeskTour() {
  const router = useRouter();
  const { user } = useAuth();
  const { learnings } = useDeskLearnings();
  // Seeded from module scope so a remount mid-tour resumes instead of restarting. Safe for
  // hydration: a client-side navigation isn't a hydration pass, and on first load this is -1.
  const [step, setStepState] = useState(liveStep);
  const setStep = useCallback((i: number) => {
    liveStep = i;
    setStepState(i);
  }, []);

  // Where the tour goes: the active placement, and the task it's currently on.
  const { orgHref, task } = useMemo(() => {
    const orgs = learnings?.orgs ?? [];
    const org = orgs.find((o) => o.status === "active") ?? orgs.find((o) => o.status !== "locked" && o.status !== "upcoming" && o.status !== "complete");
    const tasks = org?.projects.flatMap((p) => p.tasks) ?? [];
    const task = tasks.find((t) => t.status === "in-progress") ?? tasks.find((t) => t.status === "not-started") ?? tasks[0];
    return {
      orgHref: org ? `/app/desk/org/${org.id}` : null,
      task: task ? { href: `/app/desk/task/${task.code}`, code: task.code } : null,
    };
  }, [learnings]);

  // replace, not push: stepping back and forth through the tour shouldn't bury the mentee's real
  // history under a dozen desk routes.
  const goto = useCallback((href: string) => {
    if (window.location.pathname !== href) router.replace(href);
  }, [router]);

  const tourSteps = useMemo(
    () => (orgHref ? steps(goto, orgHref, task) : []),
    [goto, orgHref, task],
  );

  const close = useCallback(() => {
    setStep(-1);
    showDeskTree(false);
    markTourSeen(DESK_TOUR_SEEN_KEY, user?.email);
  }, [setStep, user?.email]);

  const open = useCallback(() => {
    offered = true;
    setStep(0);
  }, [setStep]);

  // First run, per mentee — held until we know which organisation the tour opens on, and never
  // re-offered by a remount (submitting a gate navigates, which remounts this whole subtree).
  useTourOnce(DESK_TOUR_SEEN_KEY, user?.email, !!orgHref && !offered, open, 700);

  // Manual relaunch from the org page.
  useEffect(() => {
    window.addEventListener(DESK_TOUR_EVENT, open);
    return () => window.removeEventListener(DESK_TOUR_EVENT, open);
  }, [open]);

  return <GuidedTour steps={tourSteps} step={step} onStep={setStep} onClose={close} />;
}
