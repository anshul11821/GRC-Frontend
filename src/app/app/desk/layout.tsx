"use client";

import { useEffect, useState } from "react";
import { DeskLearningsProvider } from "@/components/app/desk-context";
import { DeskSidebar } from "@/components/app/desk-sidebar";
import { Icon } from "@/components/ui/icon";

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  const [treeOpen, setTreeOpen] = useState(false);

  // Close the drawer on Escape.
  useEffect(() => {
    if (!treeOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTreeOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [treeOpen]);

  return (
    <DeskLearningsProvider>
      <div className="flex h-full min-h-0">
        {/* Drawer backdrop (mobile only). */}
        {treeOpen && (
          <div
            onClick={() => setTreeOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Activity tree: static rail on md+, off-canvas drawer on mobile.
            The wrapper carries an opaque bg on mobile so the (translucent) sidebar reads
            cleanly over the dimmed backdrop. */}
        <div
          onClick={(e) => {
            // Close the drawer when a tree link is tapped (mobile); category toggles are
            // <button>s, so expanding a section won't dismiss it.
            if ((e.target as HTMLElement).closest("a")) setTreeOpen(false);
          }}
          className={`fixed inset-y-0 left-0 z-50 bg-white md:bg-transparent transition-transform duration-300 md:static md:z-auto md:shrink-0 md:translate-x-0 ${
            treeOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"
          }`}
        >
          <button
            onClick={() => setTreeOpen(false)}
            aria-label="Close activities"
            className="focus-ring md:hidden absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-lg bg-white/80 ring-1 ring-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Icon name="x" size={16} />
          </button>
          <DeskSidebar />
        </div>

        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Mobile-only desk subheader: opens the activity tree. */}
          <div className="md:hidden shrink-0 flex items-center gap-2 px-4 h-12 border-b border-slate-200/70 bg-white/60 backdrop-blur-xl">
            <button
              onClick={() => setTreeOpen(true)}
              aria-label="Open activities"
              className="focus-ring inline-flex items-center gap-2 h-9 px-3 rounded-lg ring-1 ring-slate-200/70 bg-white text-slate-700 text-[12.5px] font-medium tracking-tight hover:bg-slate-50 transition-colors"
            >
              <Icon name="menu" size={16} /> Activities
            </button>
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
        </div>
      </div>
    </DeskLearningsProvider>
  );
}
