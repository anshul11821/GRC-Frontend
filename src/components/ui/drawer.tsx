"use client";

import { useEffect } from "react";
import { Icon } from "./icon";

/** A right-side slide-in drawer. Closes on overlay click or Esc. */
export function Drawer({
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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      {/* panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 h-full w-[min(520px,100vw)] bg-white shadow-[0_0_60px_-12px_rgba(15,23,42,0.4)] flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200/70">
          <div className="min-w-0">
            {eyebrow && <div className="text-[10px] font-semibold tracking-[0.13em] uppercase text-indigo-600">{eyebrow}</div>}
            {title && <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mt-0.5">{title}</h2>}
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Icon name="x" size={17} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
