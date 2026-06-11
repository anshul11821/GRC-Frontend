"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, useMotionValue, animate } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/icon";
import { SOFT_TONES } from "@/lib/tones";

const STATS: { value: number; suffix?: string; label: string; icon: IconName; tone: string }[] = [
  { value: 35, label: "Hands-on tasks", icon: "checkSquare", tone: "indigo" },
  { value: 5, label: "Frameworks applied", icon: "shield", tone: "emerald" },
  { value: 22, label: "Method verbs", icon: "layers", tone: "violet" },
  { value: 3, label: "Career tracks", icon: "rocket", tone: "amber" },
];

/** Counts up to `value` once `start` is true; snaps instantly under reduced-motion. */
function CountUp({ value, start }: { value: number; start: boolean }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!start) return;
    // setState happens only inside animate's onUpdate callback (never synchronously in the effect
    // body); a 0-duration tween snaps straight to the value when motion is reduced.
    const controls = animate(mv, value, {
      duration: reduce ? 0 : 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [start, value, reduce, mv]);
  return <>{display}</>;
}

/** Premium trust strip: an elevated panel of mentor-program metrics that count up on scroll. */
export function LandingStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section className="relative -mt-4 md:-mt-8 z-10">
      <div ref={ref} className="max-w-[1140px] mx-auto px-6">
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-card grid grid-cols-2 md:grid-cols-4 divide-y divide-x divide-slate-100 md:divide-y-0 overflow-hidden">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3.5 px-5 py-5 md:py-6">
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 shrink-0 ${SOFT_TONES[s.tone] ?? SOFT_TONES.indigo}`}>
                <Icon name={s.icon} size={19} />
              </span>
              <div className="min-w-0">
                <div className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900 tabular-nums leading-none">
                  <CountUp value={s.value} start={inView} />
                  {s.suffix}
                </div>
                <div className="text-[12px] text-slate-500 tracking-tight mt-1.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
