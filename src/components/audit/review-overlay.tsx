"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  auditApi, aTone, FEEDBACK_KINDS, SEVERITIES, VERDICTS, verdictById,
  type AuditDetail, type Finding, type RubricScore,
} from "@/lib/audit";
import { Avatar, StdChip, Pill, Ring2, LoadingState } from "./primitives";

function renderValue(v: unknown): React.ReactNode {
  if (v == null || v === "") return <span className="text-slate-400">—</span>;
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="text-slate-400">—</span>;
    if (typeof v[0] === "object") {
      const cols = Array.from(new Set(v.flatMap((r) => Object.keys(r as object))));
      return (
        <div className="rounded-lg ring-1 ring-slate-200/70 overflow-hidden mt-1">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50">
                {cols.map((c) => <th key={c} className="text-left font-medium text-slate-500 px-3 py-2 capitalize">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {(v as Record<string, unknown>[]).map((row, i) => (
                <tr key={i} className="border-t border-slate-100">
                  {cols.map((c) => <td key={c} className="px-3 py-2 text-slate-700">{String(row[c] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <span className="text-slate-700">{(v as unknown[]).map(String).join(", ")}</span>;
  }
  if (typeof v === "object") return <span className="text-slate-700">{JSON.stringify(v)}</span>;
  return <span className="text-slate-700 whitespace-pre-wrap">{String(v)}</span>;
}

export function ReviewOverlay({
  auditId, onClose, onDecided,
}: { auditId: number; onClose: () => void; onDecided: () => void }) {
  const [detail, setDetail] = useState<AuditDetail | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [rubric, setRubric] = useState<RubricScore[]>([]);
  const [tab, setTab] = useState<"feedback" | "rubric">("feedback");

  const [kind, setKind] = useState("comment");
  const [severity, setSeverity] = useState("minor");
  const [anchor, setAnchor] = useState<string>("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const [verdict, setVerdict] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [recorded, setRecorded] = useState<string | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Claim (or re-open) on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await auditApi.claim(auditId);
        if (cancelled) return;
        setDetail(d);
        setFindings(d.findings);
        setRubric(d.rubric);
        setAnchor(d.deliverable[0]?.id ?? "");
        if (d.item.status === "changes_requested" || d.item.status.startsWith("approved")) {
          setRecorded(d.item.verdict);
        }
      } catch (e) {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : "Couldn't open this review.");
      }
    })();
    return () => { cancelled = true; };
  }, [auditId]);

  // Esc to close.
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const overall = useMemo(
    () => (rubric.length ? rubric.reduce((a, b) => a + b.value, 0) / rubric.length : 0),
    [rubric],
  );
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    findings.forEach((f) => { if (f.anchor) m[f.anchor] = (m[f.anchor] || 0) + 1; });
    return m;
  }, [findings]);
  const blockingOpen = findings.filter((f) => f.status === "open" && (f.severity === "critical" || f.severity === "major")).length;

  const sectionLabel = (id: string | null) => detail?.deliverable.find((d) => d.id === id)?.title ?? null;

  const addFinding = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const f = await auditApi.addFinding(auditId, { kind, severity, anchor: anchor || null, text: text.trim() });
      setFindings((prev) => [f, ...prev]);
      setText("");
    } catch { /* surfaced inline via disabled state */ } finally { setBusy(false); }
  };

  const removeFinding = async (id: number) => {
    setFindings((prev) => prev.filter((f) => f.id !== id));
    try { await auditApi.removeFinding(id); } catch { /* ignore */ }
  };

  const setScore = (id: string, value: number) => {
    setRubric((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
    auditApi.saveRubric(auditId, rubric.map((r) => (r.id === id ? { id, value } : { id: r.id, value: r.value }))).catch(() => {});
  };

  const pinTo = (id: string) => {
    setAnchor(id);
    setTab("feedback");
    setTimeout(() => composerRef.current?.focus(), 60);
  };

  const submitVerdict = async () => {
    if (!verdict || busy) return;
    setBusy(true);
    try {
      await auditApi.verdict(auditId, {
        verdict,
        scores: rubric.map((r) => ({ id: r.id, value: r.value })),
        message: message.trim() || null,
      });
      setRecorded(verdict);
      onDecided();
    } catch { /* keep open */ } finally { setBusy(false); }
  };

  const sub = detail?.item;

  return (
    <div className="fixed inset-0 z-[60] flex" style={{ animation: "fadeIn 0.2s ease" }}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-[1240px] bg-[#FAFAF7] shadow-2xl flex flex-col">
        {/* header */}
        <div className="h-16 shrink-0 px-5 flex items-center gap-4 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Icon name="arrowLeft" size={18} />
          </button>
          {sub ? (
            <>
              <Avatar initials={sub.menteeInitials} tone="indigo" size={36} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-medium text-slate-500">{sub.taskCode}</span>
                  <span className="px-1.5 h-[17px] rounded text-[10px] font-medium bg-slate-100 text-slate-500 flex items-center">Round {sub.round}</span>
                  {sub.standards.map((s) => <StdChip key={s.id} chip={s} />)}
                </div>
                <div className="text-[14px] font-semibold text-slate-900 tracking-tight truncate">{sub.taskTitle}</div>
              </div>
              <div className="ml-auto flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-[10.5px] text-slate-400">Submitted by</div>
                  <div className="text-[12px] font-medium text-slate-700">{sub.menteeName}{sub.orgName ? ` · ${sub.orgName}` : ""}</div>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <Icon name="x" size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-[13px] text-slate-500">Opening review…</div>
          )}
        </div>

        {/* body */}
        {loadErr ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-rose-600">{loadErr}</div>
        ) : !detail ? (
          <LoadingState label="Loading submission…" />
        ) : (
          <div className="flex-1 min-h-0 flex">
            {/* LEFT — deliverable */}
            <div className="flex-1 min-w-0 overflow-y-auto">
              <div className="max-w-[760px] mx-auto px-8 py-7">
                <article className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] px-8 py-7">
                  <div className="pb-5 mb-5 border-b border-slate-100">
                    <h1 className="text-[20px] font-semibold tracking-tight text-slate-900">{detail.item.taskTitle}</h1>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                        <Icon name="gauge" size={13} className="text-slate-400" />
                        AI mentor score{" "}
                        <span className="font-semibold text-slate-700">{detail.menteeSelfScore ?? "—"}</span>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {detail.deliverable.map((s) => {
                      const fields = Object.entries(s.fields || {});
                      return (
                        <section key={s.id} className={`group/sec relative rounded-lg -mx-3 px-3 py-2 transition-colors ${anchor === s.id ? "bg-indigo-50/40 ring-1 ring-indigo-200/50" : "hover:bg-slate-50/70"}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-[10.5px] text-slate-400">{s.code}</span>
                            <h2 className="text-[14.5px] font-semibold text-slate-900 tracking-tight">{s.title}</h2>
                            {counts[s.id] > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 h-[18px] rounded bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                                <Icon name="pin" size={10} />{counts[s.id]}
                              </span>
                            )}
                            <button onClick={() => pinTo(s.id)} className="ml-auto opacity-0 group-hover/sec:opacity-100 inline-flex items-center gap-1 h-7 px-2 rounded-md bg-white ring-1 ring-slate-200/80 text-[11px] font-medium text-slate-600 hover:text-indigo-600 hover:ring-indigo-300 transition-all">
                              <Icon name="plus" size={12} />Note
                            </button>
                          </div>
                          {fields.length > 0 ? (
                            <dl className="space-y-2 mt-2">
                              {fields.map(([k, v]) => (
                                <div key={k} className="text-[13px]">
                                  <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wide capitalize">{k.replace(/_/g, " ")}</dt>
                                  <dd className="mt-0.5 leading-relaxed">{renderValue(v)}</dd>
                                </div>
                              ))}
                            </dl>
                          ) : (
                            <p className="text-[12.5px] text-slate-400 italic">No structured fields submitted.</p>
                          )}
                          {s.notes && (
                            <p className="text-[13px] leading-relaxed text-slate-600 mt-2 whitespace-pre-wrap">{s.notes}</p>
                          )}
                          {s.aiScore != null && (
                            <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-slate-50 ring-1 ring-slate-200/70 px-3 py-2">
                              <Icon name="bot" size={14} className="text-slate-400 mt-0.5 shrink-0" />
                              <div className="text-[11.5px] text-slate-500">
                                <span className="font-medium text-slate-700">AI mentor · {s.aiScore}/5</span>
                                {s.aiFeedback ? ` — ${s.aiFeedback}` : ""}
                              </div>
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </article>
                <div className="h-6" />
              </div>
            </div>

            {/* RIGHT — assessment panel */}
            <div className="w-[420px] shrink-0 border-l border-slate-200/70 bg-white flex flex-col">
              <div className="px-4 pt-3.5 pb-0 flex items-center gap-1 border-b border-slate-100">
                {([
                  { id: "feedback", label: "Feedback", icon: "messageSquare", n: findings.length },
                  { id: "rubric", label: "Rubric", icon: "gauge", n: null },
                ] as const).map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`relative h-9 px-3 rounded-t-lg flex items-center gap-1.5 text-[12.5px] font-medium tracking-tight transition-colors ${tab === t.id ? "text-indigo-700" : "text-slate-500 hover:text-slate-800"}`}>
                    <Icon name={t.icon} size={14} />{t.label}
                    {t.n != null && <span className="px-1.5 h-[17px] rounded text-[10px] bg-slate-100 text-slate-500 flex items-center">{t.n}</span>}
                    {tab === t.id && <span className="absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-indigo-600" />}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {tab === "feedback" ? (
                  <div className="p-4 space-y-4">
                    {/* composer */}
                    <div className="rounded-xl ring-1 ring-slate-200/80 bg-slate-50/40 p-3">
                      <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                        {Object.entries(FEEDBACK_KINDS).map(([id, k]) => {
                          const on = kind === id; const t = aTone(k.tone);
                          return (
                            <button key={id} onClick={() => setKind(id)} className={`h-[52px] rounded-lg flex flex-col items-center justify-center gap-1 ring-1 transition-all ${on ? `${t.bg} ${t.text} ring-transparent` : "bg-white text-slate-500 ring-slate-200/80 hover:ring-slate-300"}`}>
                              <Icon name={k.icon} size={15} />
                              <span className="text-[10.5px] font-medium">{k.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {kind !== "observation" && (
                        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                          <span className="text-[10.5px] font-medium text-slate-400 uppercase tracking-wide mr-0.5">Severity</span>
                          {Object.entries(SEVERITIES).map(([id, s]) => {
                            const on = severity === id; const t = aTone(s.tone);
                            return (
                              <button key={id} onClick={() => setSeverity(id)} className={`px-2 h-6 rounded text-[10.5px] font-medium transition-all ${on ? `${t.bg} ${t.text} ring-1 ${t.ring}` : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}>
                                {s.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon name="pin" size={12} className="text-slate-400 shrink-0" />
                        <select value={anchor} onChange={(e) => setAnchor(e.target.value)} className="flex-1 h-7 px-2 rounded-md bg-white ring-1 ring-slate-200/80 text-[11.5px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                          <option value="">No section</option>
                          {detail.deliverable.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                      </div>
                      <textarea ref={composerRef} value={text} onChange={(e) => setText(e.target.value)} rows={3}
                        placeholder={`Add a ${FEEDBACK_KINDS[kind].label.toLowerCase()} for the mentee…`}
                        className="w-full px-3 py-2 rounded-lg bg-white ring-1 ring-slate-200/80 text-[12.5px] text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10.5px] text-slate-400">{anchor ? `Anchored to ${sectionLabel(anchor)}` : "Not anchored"}</span>
                        <button onClick={addFinding} disabled={!text.trim() || busy} className="h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[12px] font-medium tracking-tight transition-colors inline-flex items-center gap-1.5">
                          <Icon name="plus" size={13} />Add note
                        </button>
                      </div>
                    </div>

                    {/* thread */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Thread · {findings.length}</span>
                        {blockingOpen > 0 && <span className="text-[11px] font-medium text-amber-600">{blockingOpen} blocking</span>}
                      </div>
                      {findings.length === 0 && <p className="text-[12px] text-slate-400">No notes yet. Anchor feedback to a section above.</p>}
                      {findings.map((f) => {
                        const k = FEEDBACK_KINDS[f.kind]; const kt = aTone(k?.tone);
                        const sev = SEVERITIES[f.severity];
                        return (
                          <div key={f.id} className={`group relative rounded-xl ring-1 ${kt.ring} bg-white p-3`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`w-6 h-6 rounded-md ${kt.bg} ${kt.text} flex items-center justify-center shrink-0`}>
                                <Icon name={k?.icon ?? "messageSquare"} size={13} />
                              </span>
                              <span className={`text-[11.5px] font-semibold ${kt.text}`}>{k?.label ?? f.kind}</span>
                              {sev && f.kind !== "observation" && <Pill tone={sev.tone} dot={false}>{sev.label}</Pill>}
                              {f.status === "resolved" && <Pill tone="emerald" dot={false}>Resolved</Pill>}
                              <button onClick={() => removeFinding(f.id)} className="ml-auto opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                <Icon name="trash" size={13} />
                              </button>
                            </div>
                            <p className="text-[12.5px] leading-relaxed text-slate-700 whitespace-pre-wrap">{f.text}</p>
                            {f.anchor && (
                              <div className="mt-2 inline-flex items-center gap-1 px-1.5 h-[18px] rounded bg-slate-50 ring-1 ring-slate-200/70 text-[10px] font-medium text-slate-500">
                                <Icon name="pin" size={10} />{sectionLabel(f.anchor)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-indigo-200">Overall score</div>
                          <div className="text-[30px] font-semibold tracking-tight leading-none mt-1">{overall.toFixed(1)}<span className="text-[16px] text-indigo-200 font-normal"> / 5</span></div>
                        </div>
                        <Ring2 pct={(overall / 5) * 100} light />
                      </div>
                      <div className="text-[11.5px] text-indigo-100 mt-2">AI mentor scored {detail.menteeSelfScore ?? "—"}</div>
                    </div>
                    <div className="rounded-xl ring-1 ring-slate-200/70 p-3 divide-y divide-slate-100">
                      {rubric.map((r) => (
                        <div key={r.id} className="py-2">
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-[12.5px] font-medium text-slate-700 tracking-tight">{r.label}</span>
                            <span className="text-[12px] font-semibold text-slate-900 tabular-nums">{r.value.toFixed(1)}<span className="text-slate-400 font-normal"> / 5</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-300" style={{ width: `${(r.value / 5) * 100}%` }} />
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} onClick={() => setScore(r.id, n)} title={`${n}.0`} className={`w-4 h-4 transition-colors ${n <= Math.round(r.value) ? "text-amber-400" : "text-slate-200 hover:text-slate-300"}`}>
                                  <Icon name="star" size={15} fill="currentColor" strokeWidth={0} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 px-1">Tap the stars to score each dimension. Scores are shared with the mentee with your verdict.</p>
                  </div>
                )}
              </div>

              {/* verdict footer */}
              <div className="shrink-0 border-t border-slate-200/70 bg-white p-3.5">
                {recorded ? (
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-xl ${aTone(verdictById(recorded)?.tone).bg} ${aTone(verdictById(recorded)?.tone).text} flex items-center justify-center`}>
                      <Icon name={verdictById(recorded)?.icon ?? "checkCircle"} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-slate-900 tracking-tight">{verdictById(recorded)?.label}</div>
                      <div className="text-[11.5px] text-slate-500">Sent to {sub?.menteeName.split(" ")[0]} · {findings.length} notes · {overall.toFixed(1)}/5</div>
                    </div>
                    <button onClick={() => { setRecorded(null); setVerdict(null); }} className="h-8 px-3 rounded-lg text-[12px] font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors">Change verdict</button>
                    <button onClick={onClose} className="h-8 px-3 rounded-lg text-[12px] font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors">Done</button>
                  </div>
                ) : (
                  <>
                    {verdict === "request_changes" && (
                      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Summary message for the mentee (optional)…"
                        className="w-full mb-2 px-3 py-2 rounded-lg bg-white ring-1 ring-slate-200/80 text-[12px] text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Verdict</span>
                      <span className="text-[11px] text-slate-400">{findings.length} notes · {overall.toFixed(1)} / 5</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 mb-2.5">
                      {VERDICTS.map((v) => {
                        const on = verdict === v.id; const t = aTone(v.tone);
                        return (
                          <button key={v.id} onClick={() => setVerdict(v.id)} title={v.desc} className={`h-9 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-medium tracking-tight ring-1 transition-all ${on ? `${t.solid} text-white ring-transparent shadow-sm` : `bg-white ${t.text} ${t.ring} hover:${t.bg}`}`}>
                            <Icon name={v.icon} size={14} /><span className="truncate">{v.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={submitVerdict} disabled={!verdict || busy} className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[13px] font-semibold tracking-tight transition-colors inline-flex items-center justify-center gap-2">
                      <Icon name="send" size={15} />{busy ? "Sending…" : verdict ? `Submit & send to ${sub?.menteeName.split(" ")[0]}` : "Select a verdict"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
