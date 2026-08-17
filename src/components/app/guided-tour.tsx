"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/ui/icon";

export type TourStep = {
  title: string;
  body: string;
  /** Icon shown in the card header — match it to the highlighted section's own icon. */
  icon?: IconName;
  /** Resolve the element to spotlight at the moment the step runs (so conditional/responsive targets work). */
  getEl: () => HTMLElement | null;
  /** Side-effect before measuring — e.g. expand a collapsed panel or reveal a HUD. */
  onEnter?: () => void;
  /** Skip this step when its target isn't on the page — for sections a given user's data doesn't
   *  render (a locked track has no stats, no org cards). Waits briefly, then moves on. */
  optional?: boolean;
  /** Live content rendered under the body — for a step that's better tried than described. The card
   *  already stops click propagation, so anything in here is interactive. */
  demo?: React.ReactNode;
};

/** Hidden-state offset for the card's directional entrance (settles toward the target). */
const ENTER_OFFSET: Record<Side, string> = {
  bottom: "translateY(-6px)",
  top: "translateY(6px)",
  left: "translateX(6px)",
  right: "translateX(-6px)",
  float: "translateY(8px)",
};

type Side = "top" | "bottom" | "left" | "right" | "float";
type Box = { top: number; left: number; width: number; height: number };
type Pos = { side: Side; top: number; left: number; arrow: number };

const GAP = 12; // tooltip ↔ target
const MARGIN = 14; // tooltip ↔ viewport edge
const PAD = 6; // spotlight padding around target
const TIP_W = 320;
const OFFSCREEN: Box = { top: -9999, left: -9999, width: 0, height: 0 }; // sentinel: no target → plain full-screen dim, no hole

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** driver.js-style placement: prefer the side with room (bottom→top→right→left); for oversized
 *  targets, float the card at the bottom-centre (no arrow), and with no target at all, dead-centre.
 *  Returns the arrow's cross-axis offset. */
function place(r: DOMRect | null, th: number): Pos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = (vw - TIP_W) / 2;
  // No target (the welcome card) — nothing to keep in view, so centre it. An oversized target still
  // floats at the bottom, where it covers least of what the step is pointing at.
  if (!r) return { side: "float", top: clamp((vh - th) / 2, MARGIN, vh - th - MARGIN), left: cx, arrow: 0 };
  const float: Pos = { side: "float", top: vh - th - 24, left: cx, arrow: 0 };
  if (r.height > vh * 0.7 || r.width > vw * 0.85) return float;

  const space = { top: r.top, bottom: vh - r.bottom, left: r.left, right: vw - r.right };
  const fits: Record<Exclude<Side, "float">, boolean> = {
    bottom: space.bottom >= th + GAP + MARGIN,
    top: space.top >= th + GAP + MARGIN,
    right: space.right >= TIP_W + GAP + MARGIN,
    left: space.left >= TIP_W + GAP + MARGIN,
  };
  const order: Exclude<Side, "float">[] = ["bottom", "top", "right", "left"];
  const side = order.find((s) => fits[s]);
  if (!side) return float;

  if (side === "bottom" || side === "top") {
    const left = clamp(r.left + r.width / 2 - TIP_W / 2, MARGIN, vw - TIP_W - MARGIN);
    const top = side === "bottom" ? r.bottom + GAP : r.top - GAP - th;
    return { side, top, left, arrow: clamp(r.left + r.width / 2 - left, 18, TIP_W - 18) };
  }
  const top = clamp(r.top + r.height / 2 - th / 2, MARGIN, vh - th - MARGIN);
  const left = side === "right" ? r.right + GAP : r.left - GAP - TIP_W;
  return { side, top, left, arrow: clamp(r.top + r.height / 2 - top, 18, th - 18) };
}

const inView = (r: DOMRect) => r.top >= 64 && r.bottom <= window.innerHeight - 16 && r.height < window.innerHeight;

/**
 * Queue a walkthrough to run the moment its surface next mounts.
 *
 * Call this at the event that earns the walkthrough — finishing signup, setting a start date —
 * rather than leaving the tour to infer "first time" from storage. The two are not the same: signup
 * finishes on the checkout page, not the dashboard, and a mentee can reach either surface on a
 * device that has never seen them. The event is the fact; storage is only a guess about it.
 */
export const requestTour = (base: string) => {
  try {
    sessionStorage.setItem(`${base}.pending`, "1");
  } catch {
    // Storage unavailable — the "never seen on this device" path below still covers most cases.
  }
};

/**
 * Auto-run a walkthrough: whenever one has been queued by `requestTour`, and otherwise the first
 * time a given mentee reaches this surface on this device.
 *
 * That second path is keyed per user, because localStorage is per browser: without the suffix a
 * second account signing up on the same machine inherits the first one's flags and silently gets
 * nothing. `ready` holds the run back until the data its first steps point at exists.
 *
 * Fires at most once per mount, and deliberately registers no cleanup for the delay: the data these
 * tours wait on settles more than once, and cancelling on a dependency change would swallow the
 * single run. Marked as seen when it starts, not when it ends, so a mid-tour reload doesn't ambush
 * them again.
 */
export function useTourOnce(base: string, who: string | null | undefined, ready: boolean, start: () => void, delay = 600) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !ready || !who) return;
    let queued = false;
    try {
      queued = !!sessionStorage.getItem(`${base}.pending`);
      if (!queued && localStorage.getItem(`${base}:${who}`)) return;
    } catch {
      return; // storage unavailable — leave the Guide button as the way in
    }
    fired.current = true; // once per mount, whatever else changes
    setTimeout(() => {
      try {
        sessionStorage.removeItem(`${base}.pending`);
      } catch { /* consumed either way */ }
      start();
    }, delay);
  }, [base, who, ready, delay, start]);
}

/** Record that a mentee has been through a walkthrough. Called when the tour closes — never when it
 *  merely starts. Marking on start means one silent failure to appear suppresses it forever, which
 *  is both a bad experience and impossible to retry without hand-editing storage. */
export const markTourSeen = (base: string, who: string | null | undefined) => {
  if (!who) return;
  try {
    localStorage.setItem(`${base}:${who}`, "1");
  } catch {
    // Storage unavailable — it'll offer itself again next visit. Harmless.
  }
};

/** A spotlight coach-mark tour: dims the page, cuts a hole around the current target, and shows a
 *  smartly-placed "Step X of N" tooltip with an arrow + Back / Next / Skip. Purely presentational —
 *  the parent owns `step` (‑1 = closed) and persistence.
 *
 *  Motion model (avoids the "spotlight slides across every target" glitch): the hole never tweens
 *  between targets — it repositions instantly and stays glued through scroll/resize/layout shifts.
 *  The only motion is the native smooth-scroll to reach an off-screen target and a clean cross-fade
 *  of the card. Respects prefers-reduced-motion. */
export function GuidedTour({ steps, step, onStep, onClose }: {
  steps: TourStep[];
  step: number;
  onStep: (i: number) => void;
  onClose: () => void;
}) {
  const [box, setBox] = useState<Box>(OFFSCREEN);
  const [pos, setPos] = useState<Pos | null>(null);
  const [shown, setShown] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<TourStep | null>(null);
  /** Mirror of what's committed, so a tracking frame that measures no change costs nothing. Null
   *  forces the next measurement through (step change / reopen). */
  const lastRef = useRef<{ box: Box | null; pos: Pos | null }>({ box: null, pos: null });

  const active = step >= 0 && step < steps.length;
  stepRef.current = active ? steps[step] : null;

  // Measure and commit only on actual movement. The tracking loop runs at frame rate, so setting
  // state unconditionally would re-render (and repaint the full-screen dim) 60×/second for nothing.
  const reposition = useCallback(() => {
    const s = stepRef.current;
    if (!s) return;
    const r = s.getEl()?.getBoundingClientRect() ?? null;
    const last = lastRef.current;

    const b = r ? { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 } : OFFSCREEN;
    if (!last.box || last.box.top !== b.top || last.box.left !== b.left || last.box.width !== b.width || last.box.height !== b.height) {
      last.box = b;
      setBox(b);
    }
    const p = place(r, tipRef.current?.offsetHeight ?? 170);
    if (!last.pos || last.pos.side !== p.side || last.pos.top !== p.top || last.pos.left !== p.left || last.pos.arrow !== p.arrow) {
      last.pos = p;
      setPos(p);
    }
  }, []);

  // Step change: reveal the target, scroll to it if off-screen, then track it for a beat (catches the
  // smooth-scroll, a brief expand, or a HUD reveal). Card fades in once placed.
  useLayoutEffect(() => {
    if (!active) return;
    const s = stepRef.current!;
    setShown(false);
    lastRef.current = { box: null, pos: null };
    s.onEnter?.();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollTo = (n: HTMLElement) => {
      const b = n.getBoundingClientRect();
      if (!inView(b)) n.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: b.height > window.innerHeight * 0.7 ? "start" : "center" });
    };

    let raf = 0;
    let poll = 0;
    let showId: ReturnType<typeof setTimeout> | undefined;

    // Track the target at frame rate for a beat, to catch the smooth-scroll, an expanding panel or
    // a late layout shift. Cheap now that reposition() only commits on real movement.
    const track = (ms: number) => {
      const stop = performance.now() + ms;
      const frame = () => {
        reposition();
        if (performance.now() < stop) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    const el = s.getEl();
    if (el) {
      const needsScroll = !inView(el.getBoundingClientRect());
      scrollTo(el);
      track(needsScroll ? 650 : 380);
      showId = setTimeout(() => setShown(true), reduce ? 0 : needsScroll ? 380 : 100);
    } else {
      // A step whose onEnter navigates elsewhere has no target until that page mounts and loads.
      // Wait for it on a timer — polling a missing element at 60fps is pure burn.
      reposition(); // drop the previous step's hole straight away: dim everything while it loads
      // Again once the card has painted: centring needs its real height, and on the first open
      // there was no card to measure. Cheap — reposition only commits when something moved.
      raf = requestAnimationFrame(reposition);
      // An optional step is one whose section may simply not exist for this user; give it just long
      // enough to appear, then move on rather than parking on a blank.
      const giveUp = performance.now() + (s.optional ? 600 : 4000);
      if (!s.optional) showId = setTimeout(() => setShown(true), reduce ? 0 : 250); // card reads while the page arrives
      poll = window.setInterval(() => {
        const late = stepRef.current?.getEl();
        if (late) {
          clearInterval(poll);
          scrollTo(late);
          setShown(true);
          track(650);
        } else if (performance.now() > giveUp) {
          clearInterval(poll);
          if (!s.optional) setShown(true); // never showed up — card floats over the dim
          else if (step + 1 < steps.length) onStep(step + 1);
          else onClose();
        }
      }, 120);
    }

    return () => { cancelAnimationFrame(raf); clearInterval(poll); clearTimeout(showId); };
  }, [step, active, reposition, steps.length, onStep, onClose]);

  // Reset when the tour closes so the next open appears cleanly (no stale hole).
  useEffect(() => {
    if (active) return;
    setShown(false);
    setBox(OFFSCREEN);
    lastRef.current = { box: null, pos: null };
  }, [active]);

  // Stay glued through manual scroll / resize, coalesced to one measurement per frame — scroll
  // fires far faster than that, and it's capture-phase so every nested scroller feeds it.
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const onMove = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; reposition(); });
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [active, reposition]);

  // Esc skips; arrows navigate.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(Math.min(steps.length - 1, step + 1));
      else if (e.key === "ArrowLeft") onStep(Math.max(0, step - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, step, steps.length, onStep, onClose]);

  if (!active || typeof document === "undefined") return null;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const side: Side = pos?.side ?? "float";
  const floating = side === "float";

  // Caret: a triangle on the card edge facing the target, two-toned (white face + soft slate base
  // line) so it reads as part of the bordered card rather than a loose shape.
  const caret: Record<Exclude<Side, "float">, React.CSSProperties> = {
    bottom: { top: -8, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "8px solid white", filter: "drop-shadow(0 -1px 0 rgba(148,163,184,0.4))" },
    top: { bottom: -8, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid white", filter: "drop-shadow(0 1px 0 rgba(148,163,184,0.4))" },
    right: { left: -8, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "8px solid white", filter: "drop-shadow(-1px 0 0 rgba(148,163,184,0.4))" },
    left: { right: -8, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "8px solid white", filter: "drop-shadow(1px 0 0 rgba(148,163,184,0.4))" },
  };
  const caretPos: React.CSSProperties =
    pos && pos.side !== "float"
      ? pos.side === "top" || pos.side === "bottom"
        ? { left: pos.arrow - 8, ...caret[pos.side] }
        : { top: pos.arrow - 8, ...caret[pos.side] }
      : {};

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      {/* Targetless step (the welcome card) — nothing to cut a hole around, so dim the page flat.
          The cutout below can't do this: its shadow spreads from the off-screen sentinel box and
          never reaches the viewport. */}
      {box === OFFSCREEN ? (
        <div className="absolute inset-0 bg-slate-900/[0.62] pointer-events-none" />
      ) : (
        /* spotlight cutout — one div: the giant shadow dims the page, while a crisp white separation
           ring + indigo halo + soft glow make the target read as "lit", on-brand and not harsh. */
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            ...box,
            boxShadow:
              "0 0 0 9999px rgba(15,23,42,0.62), 0 0 0 1.5px rgba(255,255,255,0.95), 0 0 0 4px rgba(99,102,241,0.45), 0 0 30px 5px rgba(217,70,239,0.40)",
          }}
        />
      )}
      {/* invisible blocker — stops interaction with the page; clicks do nothing (no accidental skips) */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />
      {/* card */}
      <div
        ref={tipRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: TIP_W,
          top: pos?.top ?? window.innerHeight / 2,
          left: pos?.left ?? (window.innerWidth - TIP_W) / 2,
          opacity: shown ? 1 : 0,
          transform: shown ? "translate(0) scale(1)" : `${ENTER_OFFSET[side]} scale(0.98)`,
        }}
        className="absolute rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.45)] p-4 transition-[opacity,transform] duration-200 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label={`Guide: ${current.title}`}
      >
        {!floating && <span className="absolute w-0 h-0" style={caretPos} aria-hidden />}

        {/* header — gradient icon tile (the one bold element) + title + step counter */}
        <div className="flex items-start gap-3">
          <span className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_4px_14px_-3px_rgba(217,70,239,0.6)]">
            <Icon name={current.icon ?? "sparkle"} size={17} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-[14px] font-semibold tracking-tight text-slate-900 leading-snug">{current.title}</h3>
            <p className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-fuchsia-600 mt-0.5">Step {step + 1} of {steps.length}</p>
          </div>
          <button onClick={onClose} aria-label="Skip guide" className="focus-ring shrink-0 -mr-1 -mt-1 w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <Icon name="x" size={14} />
          </button>
        </div>

        <p className="text-[12.5px] text-slate-600 leading-relaxed tracking-tight mt-2.5" style={{ textWrap: "pretty" }}>{current.body}</p>
        {current.demo}

        {/* footer — progress dots left, controls right */}
        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {steps.map((_, i) => (
              <span key={i} className={`shrink-0 h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-4 bg-fuchsia-500" : i < step ? "w-1.5 bg-fuchsia-300" : "w-1.5 bg-slate-200"}`} />
            ))}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {step > 0 ? (
              <button onClick={() => onStep(step - 1)} className="focus-ring h-8 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-[12px] font-medium tracking-tight inline-flex items-center gap-1 cursor-pointer transition-colors">
                <Icon name="arrowLeft" size={13} /> Back
              </button>
            ) : (
              <button onClick={onClose} className="focus-ring h-8 px-2.5 rounded-lg text-slate-400 hover:text-slate-600 text-[12px] font-medium tracking-tight cursor-pointer transition-colors">
                Skip
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : onStep(step + 1))}
              className="focus-ring h-8 px-3.5 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white text-[12px] font-semibold tracking-tight inline-flex items-center gap-1.5 shadow-[0_4px_14px_-5px_rgba(217,70,239,0.7)] cursor-pointer transition-colors"
            >
              {isLast ? "Got it" : "Next"} <Icon name={isLast ? "check" : "arrowRight"} size={13} strokeWidth={isLast ? 3 : 2} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
