"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  type Card,
  type ReviewComment,
  type SubmissionEntry,
} from "@/lib/mentor";

/**
 * Shape for a mark that only exists in this session. The id is a client-side key and never leaves
 * the browser — the server assigns real ones when the decision writes the review.
 */
let seq = 0;
const local = () => ({ id: ++seq, createdAt: "", sentAt: null, mentorName: "" });

/**
 * The mentee's submission, laid out so a mentor can comment on exactly one thing in it.
 *
 * Built from `card.entries` — the server's walk of the payload — rather than from the workspace
 * that produced it. That is what makes it work for all 24 verbs without any of them knowing about
 * comments, and what makes it work at all for a submission whose payload has outlived its
 * workspace: replaying the form there paints a blank page, but the entries are still the answers.
 *
 * Comments are drafts. Nothing here reaches the learner until the mentor approves or returns,
 * which is the moment the whole review is released — see `record_decision`.
 *
 * One composer is open at a time, and which one is held here rather than inside the button. A
 * composer that lives in the button renders wherever the button sits — and the button for a table
 * row sits in a 48px column, which squeezed the textarea to four characters wide. Held here, it
 * can be rendered where there is room for it: full width under the field, or as its own row
 * spanning the table.
 */
export function CommentableSubmission({
  card,
  comments,
  onChange,
}: {
  card: Card;
  comments: ReviewComment[];
  onChange: React.Dispatch<React.SetStateAction<ReviewComment[]>>;
}) {
  const [composing, setComposing] = useState<{ anchor: string; label: string } | null>(null);

  const byAnchor = useMemo(() => {
    const map = new Map<string, ReviewComment[]>();
    for (const c of comments.filter((x) => x.kind !== "approve")) {
      const list = map.get(c.anchor) ?? [];
      list.push(c);
      map.set(c.anchor, list);
    }
    return map;
  }, [comments]);

  // Ticks are a separate set: an entry can be ticked, commented, or both — a comment is
  // "approved with comment", never a rejection.
  const ticked = useMemo(
    () => new Set(comments.filter((c) => c.kind === "approve").map((c) => c.anchor)),
    [comments],
  );

  if (card.entries.length === 0) {
    return (
      <p className="text-[12.5px] text-slate-500">
        The learner submitted no content for this step.
      </p>
    );
  }

  const shared: Shared = {
    card,
    comments,
    onChange,
    byAnchor,
    ticked,
    composing,
    setComposing,
  };

  const required = requiredAnchors(card.entries);
  const addressed = addressedAnchors(comments);
  const done = required.filter((a) => addressed.has(a)).length;

  return (
    <div className="space-y-5">
      {/* Progress, not a requirement. Nothing here has to be touched to decide the step — the
          count is for a reviewer working a long register who wants to know where they got to. */}
      <p className="text-[11.5px] text-slate-500">
        Mark every entry reviewed, or comment on it — a comment is approval with a remark, not a
        rejection.{" "}
        <b className={done === required.length ? "text-[#1e7a46]" : "text-slate-700"}>
          <span className="tabular-nums">
            {done} of {required.length}
          </span>
        </b>{" "}
        done.
      </p>
      {card.entries.map((e) => (
        <Entry key={e.anchor} entry={e} {...shared} />
      ))}
    </div>
  );
}

/**
 * The anchors a reviewer has to address before the step can be decided: one per field, one per
 * table row. A table's own field anchor is not among them — a register is reviewed row by row, and
 * requiring a tick on the table *and* on each of its rows would be asking twice for the same read.
 */
export function requiredAnchors(entries: SubmissionEntry[]): string[] {
  return entries.flatMap((e) =>
    e.kind === "table"
      ? (e.rows ?? []).map((_, i) => e.rowAnchors[i] ?? `${e.anchor}:${i}`)
      : [e.anchor],
  );
}

/** Which of them have been ticked or commented on. Either counts — see the Actions comment. */
export function addressedAnchors(comments: ReviewComment[]): Set<string> {
  return new Set(comments.map((c) => c.anchor));
}

interface Shared {
  card: Card;
  comments: ReviewComment[];
  onChange: React.Dispatch<React.SetStateAction<ReviewComment[]>>;
  byAnchor: Map<string, ReviewComment[]>;
  ticked: Set<string>;
  composing: { anchor: string; label: string } | null;
  setComposing: (v: { anchor: string; label: string } | null) => void;
}

function Entry({ entry, ...s }: { entry: SubmissionEntry } & Shared) {
  const cols = (entry.head?.length ?? 0) + 1;
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <h3 className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500">
          {entry.label}
        </h3>
        {entry.kind !== "table" && <Actions anchor={entry.anchor} label={entry.label} {...s} />}
      </div>

      {/* Their words wear the same highlighter as everywhere else a mentee's entry appears. */}
      {entry.kind === "text" && (
        <p className="text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap rounded-lg bg-[#fefce8] ring-1 ring-[#fde68a] px-3 py-2">
          {entry.text}
        </p>
      )}

      {entry.kind === "list" && (
        <ul className="space-y-1">
          {(entry.items ?? []).map((item, i) => (
            <li
              key={i}
              className="flex gap-2 text-[12.5px] text-slate-800 leading-relaxed rounded-lg bg-[#fefce8] ring-1 ring-[#fde68a] px-3 py-1.5"
            >
              <span className="text-[#b8912a] mt-1 shrink-0">&bull;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {entry.kind === "table" && (
        <div className="overflow-x-auto rounded-lg ring-1 ring-[#e6eaf0]">
          <table className="w-full text-[11.5px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {(entry.head ?? []).map((h) => (
                  <th
                    key={h}
                    className="text-left font-semibold text-slate-600 px-3 py-2 border-b border-[#e6eaf0] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
                {/* Every row is commentable — a register is reviewed row by row or not at all. */}
                <th className="w-[76px] border-b border-[#e6eaf0]" />
              </tr>
            </thead>
            <tbody>
              {(entry.rows ?? []).map((row, r) => {
                const anchor = entry.rowAnchors[r] ?? `${entry.anchor}:${r}`;
                const label = entry.rowLabels[r] ?? `Row ${r + 1}`;
                const on = s.byAnchor.get(anchor) ?? [];
                const open = s.composing?.anchor === anchor;
                const done = s.ticked.has(anchor);
                return (
                  <FragmentRow
                    key={anchor}
                    open={open}
                    anchor={anchor}
                    label={label}
                    cols={cols}
                    highlighted={on.length > 0 || open}
                    done={done}
                    row={row}
                    threads={on}
                    {...s}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Non-table composers and threads sit under the field, where there is full width. */}
      {entry.kind !== "table" && s.composing?.anchor === entry.anchor && (
        <Composer anchor={entry.anchor} label={entry.label} {...s} />
      )}
      {entry.kind !== "table" && <Thread items={s.byAnchor.get(entry.anchor) ?? []} {...s} />}
    </section>
  );
}

/** One table row, plus the full-width row its composer and comments live in. */
function FragmentRow({
  row,
  anchor,
  label,
  cols,
  open,
  highlighted,
  done,
  threads,
  ...s
}: {
  row: string[];
  anchor: string;
  label: string;
  cols: number;
  open: boolean;
  highlighted: boolean;
  done: boolean;
  threads: ReviewComment[];
} & Shared) {
  return (
    <>
      <tr
        className={`border-b border-[#f1f5f9] ${
          highlighted ? "bg-indigo-50/50" : done ? "bg-[#f2f9f5]" : "bg-[#fefce8]/50"
        }`}
      >
        {row.map((cell, c) => (
          <td key={c} className="px-3 py-2 text-slate-800 align-top">
            {cell}
          </td>
        ))}
        <td className="px-2 py-1.5 align-top whitespace-nowrap text-right">
          <Actions anchor={anchor} label={label} compact {...s} />
        </td>
      </tr>
      {(open || threads.length > 0) && (
        <tr className="border-b border-[#f1f5f9]">
          {/* Spanning the whole table: a composer in the 44px pin column is four characters wide. */}
          <td colSpan={cols} className="px-3 pb-3 pt-0 bg-indigo-50/30">
            <Thread items={threads} rowLabel={label} {...s} />
            {open && <Composer anchor={anchor} label={label} {...s} />}
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * The two things a reviewer can do to one entry: tick it, or say something about it.
 *
 * Both optional, and not exclusive — an entry can be ticked, commented, or both. There is no third
 * button for "reject", because a comment already means "approved, and here is what I want you to
 * see"; sending work back is a decision about the whole step, not about one row of it.
 */
function Actions({
  anchor,
  label,
  compact,
  onChange,
  byAnchor,
  ticked,
  composing,
  setComposing,
}: { anchor: string; label: string; compact?: boolean } & Shared) {
  const count = (byAnchor.get(anchor) ?? []).length;
  const open = composing?.anchor === anchor;
  const isTicked = ticked.has(anchor);

  // Local only. Nothing about this review exists outside the browser until the mentor decides —
  // so a tick is instant, and walking away leaves nothing behind on the learner's submission.
  const toggleTick = () => {
    const drop = (list: ReviewComment[]) =>
      list.filter((c) => !(c.kind === "approve" && c.anchor === anchor));
    onChange((prev) =>
      isTicked
        ? drop(prev)
        : [...drop(prev), { ...local(), kind: "approve" as const, anchor, anchorLabel: label, body: "" }],
    );
  };

  return (
    <span className="inline-flex items-center gap-0.5">
      <button
        onClick={toggleTick}
        title={isTicked ? `Reviewed — ${label}` : `Mark ${label} as reviewed`}
        aria-label={isTicked ? `Reviewed: ${label}` : `Mark as reviewed: ${label}`}
        aria-pressed={isTicked}
        className={`shrink-0 inline-flex items-center justify-center rounded-md ring-1 transition-colors ${
          compact ? "h-6 w-6" : "h-6 px-2 gap-1"
        } ${
          isTicked
            ? "bg-[#1e7a46] text-white ring-[#1e7a46]"
            : "bg-white text-slate-400 ring-slate-200 hover:text-[#1e7a46] hover:ring-[#1e7a46]/40"
        }`}
      >
        <Icon name="check" size={13} strokeWidth={3} />
        {!compact && <span className="text-[11px] font-medium">{isTicked ? "Reviewed" : "Mark reviewed"}</span>}
      </button>
      <button
        onClick={() => setComposing(open ? null : { anchor, label })}
        title={`Comment on ${label}`}
        aria-label={`Comment on ${label}`}
        aria-expanded={open}
        className={`shrink-0 inline-flex items-center gap-1 rounded-md transition-colors ${
          compact ? "h-6 px-1.5" : "h-6 px-2"
        } ${
          open
            ? "bg-indigo-600 text-white"
            : count > 0
              ? "bg-indigo-100 text-indigo-700"
              : "text-slate-400 hover:text-indigo-700 hover:bg-indigo-50"
        }`}
      >
        <Icon name="chat" size={12} />
        {count > 0 && <span className="text-[10px] font-semibold tabular-nums">{count}</span>}
      </button>
    </span>
  );
}

function Composer({
  anchor,
  label,
  onChange,
  setComposing,
}: { anchor: string; label: string } & Shared) {
  const [body, setBody] = useState("");

  const save = () => {
    if (!body.trim()) return;
    onChange((prev) => [
      ...prev,
      { ...local(), kind: "comment" as const, anchor, anchorLabel: label, body: body.trim() },
    ]);
    setBody("");
    setComposing(null);
  };

  return (
    <div className="mt-2 rounded-xl border border-indigo-200 bg-white p-3">
      <div className="text-[10.5px] text-slate-500 mb-1.5">
        Commenting on <b className="text-slate-700">{label}</b>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void save();
          if (e.key === "Escape") setComposing(null);
        }}
        rows={3}
        autoFocus
        placeholder="What about this entry, and what should they do instead?"
        className="w-full min-w-0 resize-y rounded-lg border border-[#e6eaf0] px-2.5 py-2 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300"
      />
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button
          onClick={save}
          disabled={!body.trim()}
          className="h-8 px-3 rounded-lg bg-indigo-600 text-white text-[12px] font-semibold hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 transition-colors whitespace-nowrap"
        >
          Add comment
        </button>
        <button
          onClick={() => setComposing(null)}
          className="h-8 px-3 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-50 whitespace-nowrap"
        >
          Cancel
        </button>
        <span className="ml-auto text-[10.5px] text-slate-400 whitespace-nowrap">
          Sent when you decide
        </span>
      </div>
    </div>
  );
}

/** What is already attached to one anchor. A draft can be withdrawn; a sent one is on the record. */
function Thread({
  items,
  rowLabel,
  ...s
}: { items: ReviewComment[]; rowLabel?: string } & Shared) {
  if (items.length === 0) return null;

  const remove = (id: number) => s.onChange((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="mt-2 space-y-1.5">
      {items.map((c) => (
        <div
          key={c.id}
          className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-white px-3 py-2"
        >
          <Icon name="chat" size={12} className="text-indigo-500 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            {rowLabel && <div className="text-[10.5px] text-slate-500 mb-0.5">on {rowLabel}</div>}
            <p className="text-[12px] text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
              {c.body}
            </p>
            <div className="text-[10.5px] text-slate-400 mt-1">
              {c.sentAt ? `Sent · ${c.mentorName}` : "Draft — sent when you decide"}
            </div>
          </div>
          {!c.sentAt && (
            <button
              onClick={() => remove(c.id)}
              title="Delete this draft"
              aria-label="Delete this draft comment"
              className="shrink-0 text-slate-300 hover:text-[#a31d1d] transition-colors"
            >
              <Icon name="x" size={13} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
