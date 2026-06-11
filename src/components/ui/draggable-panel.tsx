"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { Icon } from "./icon";

/** Tracks whether the viewport is phone-sized (so the floating panel can shrink). */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

/**
 * A **non-modal**, free-floating draggable reference panel — the page stays interactive underneath,
 * so you drag it aside by its header and keep working. On mobile it shrinks to a compact window
 * (small footprint, capped height) so the working form stays usable; on desktop it's larger.
 * Drag is header-only (body stays scrollable) and constrained to the viewport.
 */
export function DraggablePanel({
  open,
  onClose,
  title,
  eyebrow,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  const controls = useDragControls();
  const boundsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Full-width but short on phones (drag mostly to slide it up/down); a roomier window on desktop.
  const panelSize = isMobile
    ? "inset-x-3 top-16 max-h-[42dvh]"
    : "right-6 top-24 max-h-[82dvh] w-[min(440px,calc(100vw-1.5rem))]";

  return (
    // Full-viewport bounds box for drag constraints; click-through everywhere except the panel.
    <div ref={boundsRef} className="pointer-events-none fixed inset-0 z-[60]">
      <motion.div
        drag
        dragListener={false}
        dragControls={controls}
        dragConstraints={boundsRef}
        dragElastic={0.04}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className={`pointer-events-auto absolute flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_28px_80px_-24px_rgba(15,23,42,0.5)] ${panelSize}`}
      >
        {/* header = drag handle */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="shrink-0 flex items-center justify-between gap-3 pl-4 pr-2.5 py-2.5 border-b border-slate-200/70 bg-slate-50/70 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="min-w-0 flex items-center gap-2.5">
            <Icon name="move" size={15} className="text-slate-400 shrink-0" />
            <div className="min-w-0">
              {eyebrow && <div className="text-[10px] font-semibold tracking-[0.13em] uppercase text-indigo-600">{eyebrow}</div>}
              {title && <h2 className="text-[14.5px] font-semibold tracking-tight text-slate-900 mt-0.5 truncate">{title}</h2>}
            </div>
          </div>
          <button
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close reference material"
            className="shrink-0 w-11 h-11 -mr-1 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4">{children}</div>
      </motion.div>
    </div>
  );
}
