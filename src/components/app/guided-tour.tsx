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
const OFFSCREEN: Box = { top: -9999, left: -9999, width: 0, height: 0 }; // hole hidden → whole screen dimmed

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** driver.js-style placement: prefer the side with room (bottom→top→right→left); for missing or
 *  oversized targets, float the card at the bottom-centre (no arrow). Returns the arrow's cross-axis offset. */
function place(r: DOMRect | null, th: number): Pos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const float: Pos = { side: "float", top: vh - th - 24, left: (vw - TIP_W) / 2, arrow: 0 };
  if (!r || r.height > vh * 0.7 || r.width > vw * 0.85) return float;

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

  const active = step >= 0 && step < steps.length;
  stepRef.current = active ? steps[step] : null;

  const reposition = useCallback(() => {
    const s = stepRef.current;
    if (!s) return;
    const r = s.getEl()?.getBoundingClientRect() ?? null;
    setBox(r ? { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 } : OFFSCREEN);
    setPos(place(r, tipRef.current?.offsetHeight ?? 170));
  }, []);

  // Step change: reveal the target, scroll to it if off-screen, then track it for a beat (catches the
  // smooth-scroll, a brief expand, or a HUD reveal). Card fades in once placed.
  useLayoutEffect(() => {
    if (!active) return;
    const s = stepRef.current!;
    setShown(false);
    s.onEnter?.();

    const el = s.getEl();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = el?.getBoundingClientRect();
    const needsScroll = !r || !inView(r);
    if (needsScroll && el) {
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: r && r.height > window.innerHeight * 0.7 ? "start" : "center" });
    }

    const deadline = performance.now() + (needsScroll ? 650 : 380);
    let raf = 0;
    const loop = () => {
      reposition();
      if (performance.now() < deadline) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const showId = setTimeout(() => setShown(true), reduce ? 0 : needsScroll ? 380 : 100);
    return () => { cancelAnimationFrame(raf); clearTimeout(showId); };
  }, [step, active, reposition]);

  // Reset when the tour closes so the next open appears cleanly (no stale hole).
  useEffect(() => {
    if (active) return;
    setShown(false);
    setBox(OFFSCREEN);
  }, [active]);

  // Stay glued through manual scroll / resize.
  useEffect(() => {
    if (!active) return;
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
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
      {/* spotlight cutout — one div: the giant shadow dims the page, while a crisp white separation
          ring + indigo halo + soft glow make the target read as "lit", on-brand and not harsh. */}
      <div
        className="absolute rounded-xl pointer-events-none"
        style={{
          ...box,
          boxShadow:
            "0 0 0 9999px rgba(15,23,42,0.62), 0 0 0 1.5px rgba(255,255,255,0.95), 0 0 0 4px rgba(99,102,241,0.45), 0 0 30px 5px rgba(217,70,239,0.40)",
        }}
      />
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
