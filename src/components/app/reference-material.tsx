"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Drawer } from "@/components/ui/drawer";
import type { TaskReference } from "@/lib/taskmeta";

/** Renders a reference body: "## " headings, "- " bullets, "| " table rows, blank lines split paragraphs. */
export function RefBody({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  let rows: string[][] = [];
  const flushBullets = (k: string) => {
    if (bullets.length) {
      out.push(<ul key={k} className="list-disc pl-5 space-y-1.5 my-2">{bullets.map((b, j) => <li key={j} className="text-[13px] text-slate-700 leading-relaxed tracking-tight">{b}</li>)}</ul>);
      bullets = [];
    }
  };
  const flushRows = (k: string) => {
    if (rows.length) {
      out.push(
        <div key={k} className="my-2 rounded-lg ring-1 ring-slate-200/70 overflow-hidden">
          {rows.map((r, ri) => (
            <div key={ri} className={`flex gap-3 px-3 py-1.5 text-[12px] ${ri === 0 ? "bg-slate-50 font-medium text-slate-600" : "text-slate-700"} ${ri ? "border-t border-slate-100" : ""}`}>
              {r.map((c, ci) => <span key={ci} className="flex-1 min-w-0 tracking-tight">{c}</span>)}
            </div>
          ))}
        </div>,
      );
      rows = [];
    }
  };
  text.split("\n").forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("## ")) { flushBullets(`b${i}`); flushRows(`r${i}`); out.push(<h3 key={i} className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mt-5 mb-1.5 first:mt-0">{t.slice(3)}</h3>); }
    else if (t.startsWith("- ")) { flushRows(`r${i}`); bullets.push(t.slice(2)); }
    else if (t.startsWith("| ")) { flushBullets(`b${i}`); rows.push(t.slice(2).split(" | ").map((c) => c.trim())); }
    else if (t === "") { flushBullets(`b${i}`); flushRows(`r${i}`); }
    else { flushBullets(`b${i}`); flushRows(`r${i}`); out.push(<p key={i} className="text-[13px] text-slate-700 leading-relaxed tracking-tight my-1.5" style={{ textWrap: "pretty" }}>{t}</p>); }
  });
  flushBullets("bend"); flushRows("rend");
  return <>{out}</>;
}

/** A list of reference cards; each opens a right-side drawer with its body. */
export function ReferenceMaterial({ references }: { references: TaskReference[] }) {
  const [openRef, setOpenRef] = useState<TaskReference | null>(null);
  if (!references.length) return null;
  return (
    <>
      <div className="space-y-2">
        {references.map((r) => (
          <button key={r.id} onClick={() => setOpenRef(r)} className="w-full flex items-center gap-3 text-left rounded-xl ring-1 ring-slate-200/70 bg-white hover:bg-slate-50 px-3.5 py-3 transition-colors group">
            <span className="w-9 h-9 rounded-lg bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Icon name="book" size={16} /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-medium text-slate-900 tracking-tight">{r.title}</span>
                <span className="text-[9.5px] font-semibold tracking-[0.08em] uppercase text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{r.kind}</span>
              </span>
              <span className="block text-[12px] text-slate-500 tracking-tight mt-0.5" style={{ textWrap: "pretty" }}>{r.summary}</span>
            </span>
            <Icon name="arrowRight" size={15} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
          </button>
        ))}
      </div>
      <Drawer open={!!openRef} onClose={() => setOpenRef(null)} title={openRef?.title} eyebrow={openRef?.kind}>
        {openRef && <RefBody text={openRef.body} />}
      </Drawer>
    </>
  );
}
