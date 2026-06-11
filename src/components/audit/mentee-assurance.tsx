"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { meAuditsApi, auditStatusTone, type MeAudits, type MeAuditItem } from "@/lib/me-audits";
import { aTone } from "@/lib/audit";

/** Mentee-facing "independent assurance" panel — where each completed task stands in auditor review,
 *  with the findings to action and a rework deep-link. Drives the resubmit loop from the mentee side. */
export function MenteeAssurancePanel({ program = "grc101" }: { program?: string }) {
  const [data, setData] = useState<MeAudits | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    meAuditsApi.list(program)
      .then((r) => { if (!cancelled) setData(r); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [program]);

  if (loading || !data || data.auditedTasks === 0) return null;

  const changes = data.tasks.filter((t) => t.status === "changes_requested");
  const reviewing = data.tasks.filter((t) => t.status === "pending" || t.status === "in_review");

  return (
    <div className="mt-8 cert-noprint">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="shield" size={15} className="text-indigo-600" />
        <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">Independent assurance</h2>
        <span className="text-[12px] text-slate-400">— auditor review of your completed tasks</span>
      </div>

      {/* summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { k: "Cleared", v: data.cleared, tone: "emerald" },
          { k: "Under review", v: data.underReview, tone: "indigo" },
          { k: "Needs rework", v: data.withOpenFindings, tone: "amber" },
        ].map((s) => {
          const t = aTone(s.tone);
          return (
            <div key={s.k} className="bg-white rounded-xl ring-1 ring-slate-200/70 px-4 py-3">
              <div className={`text-[22px] font-semibold tracking-tight ${t.text}`}>{s.v}</div>
              <div className="text-[11.5px] text-slate-500 mt-0.5">{s.k}</div>
            </div>
          );
        })}
      </div>

      {changes.length > 0 && (
        <div className="rounded-xl bg-amber-50/50 ring-1 ring-amber-200/60 p-3 mb-3">
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-amber-800">
            <Icon name="cornerUpRight" size={14} />
            {changes.length} task{changes.length === 1 ? "" : "s"} need rework before your certificate can issue.
          </div>
        </div>
      )}

      <div className="space-y-2">
        {[...changes, ...reviewing, ...data.tasks.filter((t) => t.status.startsWith("approved"))].map((t) => (
          <TaskRow key={t.taskId} t={t} open={open === t.taskId} onToggle={() => setOpen(open === t.taskId ? null : t.taskId)} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ t, open, onToggle }: { t: MeAuditItem; open: boolean; onToggle: () => void }) {
  const tone = aTone(auditStatusTone(t.status));
  const hasFindings = t.findings.length > 0;
  return (
    <div className="rounded-xl ring-1 ring-slate-200/70 bg-white overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/60 transition-colors">
        <span className="font-mono text-[11px] font-medium text-slate-500 shrink-0">{t.taskCode}</span>
        <span className="text-[13px] font-medium text-slate-900 tracking-tight truncate flex-1">{t.taskTitle}</span>
        {t.round > 1 && <span className="text-[10.5px] text-slate-400 shrink-0">Round {t.round}</span>}
        <span className={`inline-flex items-center gap-1 px-2 h-[22px] rounded-md text-[11px] font-medium shrink-0 ${tone.bg} ${tone.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />{t.label}
        </span>
        {hasFindings && <Icon name="chevronDown" size={15} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>
      {open && hasFindings && (
        <div className="px-4 pb-3.5 pt-1 border-t border-slate-100 space-y-2">
          {t.findings.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-[12.5px]">
              <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${f.status === "resolved" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <div className="min-w-0">
                <span className={f.status === "resolved" ? "line-through text-slate-400" : "text-slate-700"}>{f.text}</span>
                <span className="ml-1.5 text-[10.5px] text-slate-400 uppercase tracking-wide">{f.kind}{f.anchor ? ` · ${f.anchor}` : ""}</span>
              </div>
            </div>
          ))}
          {t.status === "changes_requested" && (
            <Link href={`/app/desk/task/${t.taskCode}`} className="inline-flex items-center gap-1.5 mt-1 text-[12.5px] font-medium text-indigo-600 hover:text-indigo-700">
              <Icon name="edit" size={13} /> Open task to revise &amp; resubmit
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
