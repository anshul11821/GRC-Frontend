"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/ui/icon";

/**
 * A small window that floats over the review: reference material, the submission's history.
 *
 * A drawer or a modal would cover the work being reviewed, which is exactly the thing the mentor
 * is holding it up against. This can be dragged out of the way and left open while they read.
 *
 * Portalled to `document.body` because `position: fixed` is relative to the nearest ancestor with
 * a `filter`, `transform` or `backdrop-filter` — and the working sheet has one, which put an
 * earlier drawer off the top of the screen.
 */
export function FloatWindow({
  title,
  sub,
  icon,
  width = 420,
  height,
  onClose,
  children,
}: {
  title: string;
  sub?: string;
  icon?: IconName;
  width?: number;
  height?: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Null until the reviewer drags it. Until then the window is placed by CSS against the right
  // edge, where a reference sits beside the work rather than on top of it — which means no layout
  // measurement on mount, and nothing to reconcile between the server's render and the browser's.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [folded, setFolded] = useState(false);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const shell = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      setPos({
        x: Math.max(8, Math.min(window.innerWidth - 200, e.clientX - drag.current.dx)),
        y: Math.max(56, Math.min(window.innerHeight - 60, e.clientY - drag.current.dy)),
      });
    };
    const up = () => {
      drag.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={shell}
      role="dialog"
      aria-label={title}
      className="fixed z-[70] flex flex-col overflow-hidden rounded-xl border border-[#e6eaf0] bg-white shadow-[0_24px_60px_-18px_rgba(15,23,42,0.35)]"
      style={{
        // Dragged: wherever they put it. Otherwise pinned to the right edge, and it stays there
        // through a resize without anything having to listen for one.
        ...(pos ? { left: pos.x, top: pos.y } : { right: 24, top: 96 }),
        width,
        maxWidth: "calc(100vw - 24px)",
        height: folded ? "auto" : height,
        maxHeight: "calc(100vh - 120px)",
      }}
    >
      <div
        onPointerDown={(e) => {
          // The first drag has no stored position to offset from — take it off the element, which
          // is where CSS put it.
          const box = shell.current?.getBoundingClientRect();
          if (!box) return;
          drag.current = { dx: e.clientX - box.left, dy: e.clientY - box.top };
          document.body.style.userSelect = "none";
        }}
        className="shrink-0 flex items-center gap-2 border-b border-[#e6eaf0] bg-slate-50 px-3.5 py-2.5 cursor-grab active:cursor-grabbing"
      >
        {icon && <Icon name={icon} size={14} className="text-indigo-600 shrink-0" />}
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-slate-800 truncate">{title}</div>
          {sub && <div className="text-[11px] text-slate-500 truncate">{sub}</div>}
        </div>
        <button
          onClick={() => setFolded(!folded)}
          aria-label={folded ? `Unfold ${title}` : `Fold ${title}`}
          className="w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-slate-200"
        >
          <Icon name={folded ? "plus" : "minus"} size={13} />
        </button>
        <button
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="w-6 h-6 grid place-items-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
        >
          <Icon name="x" size={13} />
        </button>
      </div>
      {!folded && <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3.5">{children}</div>}
    </div>,
    document.body,
  );
}
