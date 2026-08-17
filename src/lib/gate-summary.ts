// Human-readable read-back of a task-boundary gate submission (RUA / Research Submission).
//
// The desk's generic payload walker renders these two verbs as unlabelled nested bullets —
// `study: [{passed: true, attempts: 2}]`, `inspect: [true, true]` — which tells the learner
// nothing about WHICH control, template, step or concept they answered, and buries the free text
// they actually wrote. Both gates lift a progress object whose arrays are positional against the
// task's RUA entry, so the labels come from the same bundle the workspace rendered from.
//
// Returns [label, text] pairs for the desk's "What you submitted" list; null when the payload
// isn't a gate (or holds nothing), so the caller falls back to the generic walker.

import { RESEARCH_METHODS } from "./research-methods";
import { boundaryItems, type RuaProgress } from "./rua-engine";
import type { RsProgress } from "./rs-engine";
import type { RuaTask } from "./rua-tasks";

export type GateEntry = [label: string, text: string];

const tick = (ok: boolean) => (ok ? "✓" : "—");
const sub = (label: string, text?: string | null) => (text?.trim() ? `    ${label}: ${text.trim()}` : null);

export function gateSummary(
  verbId: string,
  fields: Record<string, unknown>,
  taskCode: string,
  rua?: RuaTask,
): GateEntry[] | null {
  const entries =
    verbId === "rua" ? ruaEntries(fields as Partial<RuaProgress>, taskCode, rua)
    : verbId === "research" ? researchEntries(fields as RsProgress)
    : null;
  return entries && entries.length ? entries : null;
}

function ruaEntries(p: Partial<RuaProgress>, taskCode: string, rua?: RuaTask): GateEntry[] {
  const out: GateEntry[] = [];
  const push = (label: string, lines: (string | null)[]) => {
    const text = lines.filter(Boolean).join("\n");
    if (text.trim()) out.push([label, text]);
  };
  const at = (i: number, list: string[] | undefined, fallback: string) => list?.[i] ?? `${fallback} ${i + 1}`;

  if (p.attest) {
    push("Gate decision", [
      `${p.attest.decision.replace("_", " ")} — attested by ${p.attest.signature || "—"}`,
      p.attest.at ? `    ${new Date(p.attest.at).toLocaleString()}` : null,
    ]);
  }

  push("Control checks (Study)", (p.study ?? []).map((r, i) => {
    const c = rua?.controls?.[i];
    const name = c ? `${c.ref ? `${c.ref} — ` : ""}${c.name}` : `Control ${i + 1}`;
    if (!r) return `— ${name}: not answered`;
    return `${tick(r.passed)} ${name}${r.attempts > 1 ? ` (${r.attempts} attempts)` : ""}`;
  }));

  push("Templates inspected", (p.inspect ?? []).map((ok, i) =>
    `${tick(ok)} ${rua?.templates?.[i]?.name ?? `Template ${i + 1}`}`));

  push("Prerequisites acquired", [
    ...(p.acquire ?? []).map((ok, i) => `${tick(ok)} ${rua?.acquire?.[i]?.label ?? `Item ${i + 1}`}`),
    p.contextAck ? "✓ Organisation context acknowledged" : null,
  ]);

  push("Steps clarified", (p.clarify ?? []).flatMap((r, i) => {
    const s = rua?.steps?.[i];
    const head = `${tick(r?.state === "understood")} ${s ? `${s.verb} — ${s.text}` : `Step ${i + 1}`}`;
    if (!r) return [head];
    return [
      head,
      sub("In your words", r.paraphrase),
      sub("Raised as unclear", r.query?.unclear),
      sub("Your thinking", r.query?.think),
      r.query?.checked?.length ? `    Checked first: ${r.query.checked.join(", ")}` : null,
      sub(r.wasQueried ? "Resolution" : "Note", r.resolution),
    ];
  }));

  if (p.confirm) {
    const items = rua && taskCode ? boundaryItems(rua, taskCode) : [];
    push("Deliverable contract (Confirm)", [
      sub("What you'll produce", p.confirm.produce),
      sub("Accepted when", p.confirm.acceptWhen),
      Object.keys(p.confirm.boundaries ?? {}).length ? "    Scope sort:" : null,
      ...Object.entries(p.confirm.boundaries ?? {}).map(([k, v]) => {
        const it = items[Number(k)];
        return `      ${v === "in" ? "In scope" : "Out of scope"} — ${it?.text ?? `item ${Number(k) + 1}`}${it && it.answer !== v ? " (misclassified)" : ""}`;
      }),
      p.confirm.accepted ? "    ✓ Contract accepted" : null,
    ]);
  }

  push("Concepts explained", (p.explain ?? []).flatMap((r, i) => {
    const head = `${tick(!!r?.passed)} ${at(i, rua?.concepts, "Concept")}`;
    if (!r) return [head];
    return [
      `${head}${r.score ? ` · ${r.score}/4` : ""}${r.attempts > 1 ? ` (${r.attempts} attempts)` : ""}`,
      sub("Explanation", r.explain),
      sub("Example", r.example),
    ];
  }));

  push("Readiness Q&A (Answer)", (p.answer ?? []).flatMap((r, i) => {
    const head = `${r ? `[${r.outcome}]` : "—"} ${at(i, rua?.questions, "Question")}`;
    if (!r) return [head];
    return [head, sub("Your answer", r.answer), sub("Follow-up", r.fu)];
  }));

  return out;
}

function researchEntries(p: RsProgress): GateEntry[] {
  const out: GateEntry[] = [];
  for (const m of RESEARCH_METHODS) {
    const included = m.req || !!p.include?.[m.key];
    const e = p.methods?.[m.key];
    if (!included) continue;
    const sources = (e?.sources ?? []).filter((s) => s?.title?.trim());
    const text = [
      e?.findings?.trim() || null,
      e?.soWhat?.trim() ? `So what: ${e.soWhat.trim()}` : null,
      sources.length ? `Sources:\n${sources.map((s) => `    • ${s.type} — ${s.title}${s.link?.trim() ? ` (${s.link.trim()})` : ""}`).join("\n")}` : null,
    ].filter(Boolean).join("\n");
    if (text) out.push([`${m.name}${m.req ? "" : " · optional, included"}`, text]);
  }

  const DECL: [keyof NonNullable<RsProgress["decl"]>, string][] = [
    ["own", "This research and write-up are my own work, in my own words"],
    ["org", "Findings are specific to the assigned organisation"],
    ["probe", "The mentor may probe any claim or source in review"],
  ];
  const decl = DECL.map(([k, t]) => `${tick(!!p.decl?.[k])} ${t}`).join("\n");
  if (out.length || p.decl) out.push(["Declaration", decl]);

  return out;
}
