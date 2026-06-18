"use client";

// Shared building blocks for the per-verb Working Desk workspaces. Every workspace is a controlled
// component: it reads from `value` and writes back through `onChange`, under the same keys the
// verb's VERB_FORMS spec defines — so the page's live acceptance checklist, draft/submit payload,
// and backend Layer-1 grading keep working unchanged. None of these primitives hold submit state.
//
// IMPORTANT: the real app uses compiled Tailwind, so dynamic class names (`bg-${tone}-50`) get
// purged. Always pick classes from the static maps below.

import { Icon, type IconName } from "@/components/ui/icon";
import { inputCls } from "@/components/ui/forms";

export type Values = Record<string, unknown>;
export type Row = Record<string, string>;
export type WorkspaceProps = { value: Values; onChange: (next: Values) => void };

export const asRows = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);
export const asList = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
export const str = (v: unknown): string => String(v ?? "");

/** Per-key getter/setter helper for a workspace's controlled value object. */
export function fields({ value, onChange }: WorkspaceProps) {
  return {
    get: (k: string) => value[k],
    set: (k: string, v: unknown) => onChange({ ...value, [k]: v }),
    patch: (next: Values) => onChange({ ...value, ...next }),
  };
}

// ── Tones (static class maps; never interpolate) ───────────────────────────────
export type Tone = "indigo" | "violet" | "emerald" | "amber" | "rose" | "slate";
const TONE: Record<Tone, { bg: string; text: string; ring: string; dot: string; solid: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-200", dot: "bg-indigo-500", solid: "bg-indigo-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200", dot: "bg-violet-500", solid: "bg-violet-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500", solid: "bg-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", dot: "bg-amber-500", solid: "bg-amber-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", dot: "bg-rose-500", solid: "bg-rose-500" },
  slate: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-200", dot: "bg-slate-400", solid: "bg-slate-600" },
};
export const tone = (t: Tone) => TONE[t];

// ── Section label ──────────────────────────────────────────────────────────────
export function SectionLabel({
  children,
  hint,
  action,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <div className="flex items-baseline gap-2 min-w-0">
        <h3 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">{children}</h3>
        {hint && <span className="text-[11px] text-slate-400 truncate">{hint}</span>}
      </div>
      {action}
    </div>
  );
}

// ── Text inputs ─────────────────────────────────────────────────────────────────
export function WsInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} ${className}`}
    />
  );
}

export function WsTextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
  footer,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-slate-200/80 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-shadow">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3.5 py-2.5 bg-transparent outline-none resize-y text-[13px] text-slate-900 placeholder:text-slate-400 leading-relaxed tracking-tight"
      />
      {(footer || hint) && (
        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">{footer}</div>
          {hint && <span className="text-[11px] text-slate-400 tabular-nums">{hint}</span>}
        </div>
      )}
    </div>
  );
}

// ── Segmented selector ────────────────────────────────────────────────────────
export function Segmented({
  options,
  value,
  onChange,
  toneOf,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  /** optional per-option tone when active */
  toneOf?: (v: string) => Tone;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((o) => {
        const active = value === o.value;
        const t = TONE[toneOf ? toneOf(o.value) : "indigo"];
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`h-9 px-3 rounded-lg text-[12.5px] font-medium tracking-tight transition-all ${
              active ? `${t.bg} ${t.text} ring-1 ${t.ring}` : "bg-white ring-1 ring-slate-200/80 text-slate-600 hover:ring-slate-300"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Classification / status pill ────────────────────────────────────────────────
const PILL: Record<string, string> = {
  Public: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Internal: "bg-amber-50 text-amber-800 ring-amber-200",
  Confidential: "bg-rose-50 text-rose-700 ring-rose-200",
  Low: "bg-slate-100 text-slate-600 ring-slate-200",
  Medium: "bg-amber-50 text-amber-800 ring-amber-200",
  High: "bg-rose-50 text-rose-700 ring-rose-200",
};
export function Pill({ children }: { children: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium ring-1 ${PILL[children] ?? PILL.Low}`}>
      {children}
    </span>
  );
}

// ── Editable typed data table ───────────────────────────────────────────────────
export type Col = {
  key: string;
  label: string;
  type?: "text" | "select" | "number" | "date";
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

export function DataTable({
  columns,
  rows,
  onChange,
  addLabel = "Add row",
  minRows = 1,
}: {
  columns: Col[];
  rows: Row[];
  onChange: (rows: Row[]) => void;
  addLabel?: string;
  minRows?: number;
}) {
  const blank = (): Row => Object.fromEntries(columns.map((c) => [c.key, ""])) as Row;
  const display = rows.length ? rows : Array.from({ length: minRows }, blank);
  const setCell = (ri: number, ck: string, v: string) => {
    const next = display.map((r) => ({ ...r }));
    next[ri][ck] = v;
    onChange(next);
  };
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200/80 bg-white">
      <table className="w-full text-left border-collapse min-w-[560px]">
        <thead>
          <tr className="bg-slate-50/70 border-b border-slate-100">
            {columns.map((c) => (
              <th key={c.key} className="px-2.5 py-2 text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-500">
                {c.label}
                {c.required && <span className="text-rose-500 ml-0.5">*</span>}
              </th>
            ))}
            <th className="w-9" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {display.map((row, ri) => (
            <tr key={ri}>
              {columns.map((c) => (
                <td key={c.key} className="px-1.5 py-1.5 align-top">
                  {c.type === "select" ? (
                    <select
                      value={row[c.key] ?? ""}
                      onChange={(e) => setCell(ri, c.key, e.target.value)}
                      className="w-full h-9 px-2 rounded-md bg-white ring-1 ring-slate-200/70 text-[12px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="">—</option>
                      {(c.options ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={c.type === "number" ? "number" : c.type === "date" ? "date" : "text"}
                      value={row[c.key] ?? ""}
                      placeholder={c.placeholder}
                      onChange={(e) => setCell(ri, c.key, e.target.value)}
                      className="w-full h-9 px-2 rounded-md bg-white ring-1 ring-slate-200/70 text-[12px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  )}
                </td>
              ))}
              <td className="px-1">
                <button
                  type="button"
                  aria-label="Remove row"
                  onClick={() => onChange(display.filter((_, j) => j !== ri))}
                  className="focus-ring w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                >
                  <Icon name="x" size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onChange([...display, blank()])}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Icon name="plus" size={13} /> {addLabel}
        </button>
      </div>
    </div>
  );
}

// ── Repeater (list of free-text rows) ───────────────────────────────────────────
export function RepeaterList({
  items,
  onChange,
  placeholder,
  addLabel = "Add item",
  numbered = true,
  minRows = 1,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  numbered?: boolean;
  minRows?: number;
}) {
  const rows = items.length ? items : Array.from({ length: minRows }, () => "");
  const update = (next: string[]) => onChange(next);
  return (
    <div className="space-y-2">
      {rows.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          {numbered && <span className="w-5 text-[11.5px] font-mono text-slate-400 text-right shrink-0">{i + 1}.</span>}
          <input
            value={it}
            placeholder={placeholder}
            onChange={(e) => {
              const n = [...rows];
              n[i] = e.target.value;
              update(n);
            }}
            className={inputCls}
          />
          <button
            type="button"
            aria-label="Remove item"
            onClick={() => update(rows.filter((_, j) => j !== i))}
            className="focus-ring w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-rose-600 shrink-0"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update([...rows, ""])}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-indigo-600 hover:text-indigo-700"
      >
        <Icon name="plus" size={13} /> {addLabel}
      </button>
    </div>
  );
}

// ── 0–N score slider ─────────────────────────────────────────────────────────
export function ScoreSlider({
  value,
  onChange,
  min = 0,
  max = 4,
  anchorLow,
  anchorHigh,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  anchorLow?: string;
  anchorHigh?: string;
}) {
  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-indigo-600 cursor-pointer"
      />
      {(anchorLow || anchorHigh) && (
        <div className="flex justify-between text-[10.5px] font-mono text-slate-400 mt-1 px-0.5">
          <span>{min} · {anchorLow}</span>
          <span>{anchorHigh} · {max}</span>
        </div>
      )}
    </div>
  );
}

// ── Card shell used by several workspaces ───────────────────────────────────────
export function Panel({
  title,
  icon,
  children,
  className = "",
}: {
  title?: string;
  icon?: IconName;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          {icon && <Icon name={icon} size={13} className="text-slate-500" />}
          <h4 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">{title}</h4>
        </div>
      )}
      {children}
    </div>
  );
}

// ── Radar / spider chart (generic) ──────────────────────────────────────────────
const RADAR_STROKE: Record<Tone, string> = {
  indigo: "#6366F1",
  violet: "#7C3AED",
  emerald: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  slate: "#64748B",
};
export function Radar({
  axes,
  max,
  toneName = "indigo",
}: {
  axes: { label: string; value: number }[];
  max: number;
  toneName?: Tone;
}) {
  const size = 220, cx = size / 2, cy = size / 2, R = 78;
  const n = Math.max(axes.length, 3);
  const at = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const stroke = RADAR_STROKE[toneName];
  const poly = axes.map((ax, i) => at(i, (Math.min(ax.value, max) / max) * R).join(",")).join(" ");
  const ring = (f: number) => axes.map((_, i) => at(i, R * f).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block mx-auto">
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <polygon key={i} points={ring(f)} fill="none" stroke="#E2E8F0" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = at(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E2E8F0" />;
      })}
      <polygon points={poly} fill={`${stroke}2e`} stroke={stroke} strokeWidth="1.5" />
      {axes.map((ax, i) => {
        const [x, y] = at(i, (Math.min(ax.value, max) / max) * R);
        return <circle key={i} cx={x} cy={y} r="3" fill={stroke} />;
      })}
      {axes.map((ax, i) => {
        const [x, y] = at(i, R + 16);
        return (
          <text key={i} x={x} y={y} fontSize="9" fill="#64748B" textAnchor="middle" dominantBaseline="middle">
            {ax.label}
          </text>
        );
      })}
      {/* keep n referenced for lint parity with axis count */}
      <desc>{n} axes</desc>
    </svg>
  );
}
