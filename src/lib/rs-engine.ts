// Deterministic engine behind the Research Submission gate — ported from the design mockup's
// window.RS grading helpers (rsCheckMethod / rsGateFor / RS_BARS). No network: every quality
// check and the submission gate are reproducible from the task context + the mentee's inputs.
// The AI mentor (Layer 2) still grades the submitted payload; this drives the in-workspace
// live quality bar and the gate decision that unlocks the real Submit button.

import { tokenize, jaccard, coverage, wordCount } from "./rua-engine";
import { RESEARCH_METHODS, type ResearchMethod } from "./research-methods";

/** Task context the method prompts and checks are filled/graded against. */
export interface RsTaskContext {
  org: string;
  standard: string;
  deliverable: string;
  title: string;
  catName: string;
  /** Vocabulary pool for the "uses this task's real language" coverage check. */
  poolText: string;
}

export const RS_PARROT = 0.62;

/** Quality-bar thresholds (findings words, so-what words, min sources, task-vocabulary coverage). */
export const RS_BARS = {
  lenient: { find: 40, so: 10, src: 1, cov: 0.04 },
  balanced: { find: 60, so: 14, src: 1, cov: 0.06 },
  strict: { find: 90, so: 20, src: 2, cov: 0.08 },
} as const;
export type RsBarName = keyof typeof RS_BARS;

const rsSet = (s: string) => new Set(tokenize(s));

/** Fill {org} {standard} {deliverable} {title} {cat} placeholders with this task's context. */
export function rsFill(tpl: string, ctx: RsTaskContext): string {
  return (tpl || "")
    .replaceAll("{org}", ctx.org)
    .replaceAll("{standard}", ctx.standard)
    .replaceAll("{deliverable}", ctx.deliverable)
    .replaceAll("{title}", ctx.title)
    .replaceAll("{cat}", ctx.catName);
}

export interface RsSource { type: string; title: string; link?: string }
export interface RsMethodEntry { findings?: string; soWhat?: string; sources?: RsSource[] }

export interface RsCheck { key: string; label: string; pass: boolean; ev: string }
export interface RsMethodResult { checks: RsCheck[]; pass: boolean; words: number; sources: number }

/** Per-method live checks → the six-point quality bar shown under each method editor. */
export function rsCheckMethod(ctx: RsTaskContext, m: ResearchMethod, e: RsMethodEntry | undefined, barName: RsBarName): RsMethodResult {
  const b = RS_BARS[barName] ?? RS_BARS.balanced;
  const findings = e?.findings ?? "";
  const so = e?.soWhat ?? "";
  const sources = (e?.sources ?? []).filter((s) => s && s.title && s.title.trim());
  const wf = wordCount(findings);
  const ws = wordCount(so);
  const cov = coverage(`${findings} ${so}`, rsSet(ctx.poolText));
  const sim = jaccard(rsSet(findings), rsSet(`${m.definition} ${ctx.poolText}`));
  const orgHit = new RegExp(ctx.org.split(/\s+/)[0], "i").test(`${findings} ${so}`);
  const checks: RsCheck[] = [
    { key: "depth", label: `Findings — at least ${b.find} words`, pass: wf >= b.find, ev: `${wf} word${wf === 1 ? "" : "s"}` },
    { key: "sowhat", label: `Implication for the deliverable — at least ${b.so} words`, pass: ws >= b.so, ev: `${ws} word${ws === 1 ? "" : "s"}` },
    { key: "own", label: "Written in your own words", pass: wf > 0 && sim <= RS_PARROT, ev: wf ? `${Math.round(sim * 100)}% overlap with source text` : "nothing written yet" },
    { key: "task", label: "Uses this task's real language", pass: cov >= b.cov, ev: `${Math.round(cov * 100)}% of task vocabulary used` },
    { key: "org", label: "Anchored in the assigned organisation", pass: orgHit, ev: orgHit ? "organisation named" : "organisation not mentioned" },
    { key: "src", label: `At least ${b.src} source${b.src > 1 ? "s" : ""} cited`, pass: sources.length >= b.src, ev: `${sources.length} cited` },
  ];
  return { checks, pass: checks.every((c) => c.pass), words: wf + ws, sources: sources.length };
}

export interface RsProgress {
  methods?: Record<string, RsMethodEntry>;
  include?: Record<string, boolean>;
  decl?: { own?: boolean; org?: boolean; probe?: boolean };
}

export interface RsGateRow { m: ResearchMethod; included: boolean; res: RsMethodResult }
export interface RsGate {
  rows: RsGateRow[];
  required: number; reqDone: number;
  minOptional: number; optChosen: number; optDone: number;
  declDone: boolean; ready: boolean; canSubmit: boolean;
  totalWords: number; totalSources: number;
}

/** Submission-gate roll-up across all methods + the declaration. `ready`/`canSubmit` unlock submit. */
export function rsGateFor(ctx: RsTaskContext, prog: RsProgress | undefined, barName: RsBarName, minOptional: number): RsGate {
  const p = prog ?? {};
  const required = RESEARCH_METHODS.filter((m) => m.req);
  const included = (m: ResearchMethod) => m.req || !!p.include?.[m.key];
  const rows: RsGateRow[] = RESEARCH_METHODS.map((m) => ({
    m, included: included(m),
    res: rsCheckMethod(ctx, m, p.methods?.[m.key], barName),
  }));
  const reqDone = rows.filter((r) => r.m.req && r.res.pass).length;
  const optRows = rows.filter((r) => !r.m.req && r.included);
  const optDone = optRows.filter((r) => r.res.pass).length;
  const decl = p.decl ?? {};
  const declDone = !!(decl.own && decl.org && decl.probe);
  const ready = reqDone === required.length && optRows.length >= minOptional && optRows.every((r) => r.res.pass);
  return {
    rows, required: required.length, reqDone,
    minOptional, optChosen: optRows.length, optDone,
    declDone, ready, canSubmit: ready && declDone,
    totalWords: rows.filter((r) => r.included).reduce((a, r) => a + r.res.words, 0),
    totalSources: rows.filter((r) => r.included).reduce((a, r) => a + r.res.sources, 0),
  };
}
