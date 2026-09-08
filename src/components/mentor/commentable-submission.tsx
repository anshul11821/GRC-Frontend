"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { JudgmentPanel } from "@/components/mentor/judgment-review";
import { VERDICT, VERDICTS, type Verdict } from "@/lib/verdicts";
import { alignColumns, columnsFor, rowLabel } from "@/lib/workspace-columns";
import { type WorkspaceColumn } from "@/lib/workspace-columns";
import {
  type Card,
  type JudgmentReview,
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
 * The mentee's submission, laid out so a mentor can decide on exactly one part of it.
 *
 * Built from `card.entries` — the server's walk of the payload — rather than from the workspace
 * that produced it. That is what makes it work for all 24 verbs without any of them knowing about
 * verdicts, and what makes it work at all for a submission whose payload has outlived its
 * workspace: replaying the form there paints a blank page, but the entries are still the answers.
 *
 * Each part carries **one** verdict, not a tick and a pile of remarks. Two remarks on one row left
 * the mentee to work out which one the decision rested on, and a remark with no verdict was
 * feedback nobody had to act on. The four are the same four the whole delivery gets, one scope
 * down — see `lib/verdicts.ts`.
 *
 * Verdicts are drafts. Nothing here reaches the learner until the mentor decides the step, which
 * is the moment the whole review is released — see `record_decision`.
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
  // One composer open at a time, held here rather than inside the button. A composer that lives in
  // the button renders wherever the button sits — and the button for a table row sits in a narrow
  // column, which squeezed the textarea to four characters wide.
  const [composing, setComposing] = useState<{ anchor: string; verdict: Verdict } | null>(null);

  // Anchors are only unique within a submission — `field:outcomes` exists on many of them — so an
  // open note box carried across a change of card would reopen itself against a different
  // learner's answer of the same name. Reset during render, before anything is painted.
  // The register's own columns, if this step is one. Looked up once per card rather than per
  // entry: it is a constant for the whole submission.
  const spec = useMemo(
    () => columnsFor(card.taskCode, card.activityCode),
    [card.taskCode, card.activityCode],
  );

  const [prevSub, setPrevSub] = useState(card.submissionId);
  if (prevSub !== card.submissionId) {
    setPrevSub(card.submissionId);
    setComposing(null);
  }

  const byAnchor = useMemo(() => {
    const map = new Map<string, ReviewComment>();
    for (const c of comments) map.set(c.anchor, c);
    return map;
  }, [comments]);

  if (card.entries.length === 0) {
    return (
      <p className="text-[12.5px] text-slate-500">
        The learner submitted no content for this step.
      </p>
    );
  }

  const shared: Shared = { onChange, byAnchor, composing, setComposing };
  const required = requiredAnchors(card);
  const done = required.filter((a) => byAnchor.has(a)).length;

  return (
    <div className="space-y-5">
      <p className="text-[11.5px] text-slate-500">
        Decide on each part the mentee wrote — approve it, approve it with an observation, ask for
        changes, or reject it. Everything you say here is sent when you decide the step.{" "}
        <b className={done === required.length ? "text-[#1e7a46]" : "text-slate-700"}>
          <span className="tabular-nums">
            {done} of {required.length}
          </span>
        </b>{" "}
        done.
      </p>
      {card.entries.map((e) => (
        <Entry key={e.anchor} entry={e} spec={spec} {...shared} />
      ))}

      {card.judgment?.chose && <JudgmentSection judgment={card.judgment} {...shared} />}
    </div>
  );
}

/**
 * The judgment call, decided like any other part of the delivery.
 *
 * It is the one place in a task where the mentee had to choose between defensible options and
 * defend the choice, so it is the part least suited to being read past — and it used to sit below
 * the deliverable as a read-only panel with no verdict on it at all, which meant a step could be
 * approved without anyone saying anything about the only genuinely hard thing in it.
 *
 * Two or three of the four options are defensible by design, so the pick is not the grade: the
 * reviewer is judging the reasoning. The library's own view is on the panel as guidance, clearly
 * labelled as such.
 */
function JudgmentSection({ judgment, ...s }: { judgment: JudgmentReview } & Shared) {
  const given = s.byAnchor.get(JUDGMENT_ANCHOR);
  const label = "Judgment call";

  return (
    <section className="rounded-xl border border-[#e6eaf0] bg-[#fafbfc] px-4 py-4">
      <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500">
          {label}
        </h3>
        <Control anchor={JUDGMENT_ANCHOR} label={label} {...s} />
      </div>
      <JudgmentPanel j={judgment} />
      {s.composing?.anchor === JUDGMENT_ANCHOR && s.composing && (
        <Composer
          key={`${JUDGMENT_ANCHOR}:${s.composing.verdict}`}
          anchor={JUDGMENT_ANCHOR}
          label={label}
          {...s}
        />
      )}
      {given && <Given mark={given} {...s} />}
    </section>
  );
}

/**
 * Where the judgment call hangs its verdict. Not an entry — the dilemma lives in
 * `judgment_responses`, not in the submission payload — but it is a part of the delivery the
 * reviewer must decide on, so it gets an anchor like any other.
 */
export const JUDGMENT_ANCHOR = "judgment";

/**
 * The parts a reviewer has to address before the step can be decided: one per field, one per table
 * row, and the judgment call where there is one. A table's own field anchor is not among them — a
 * register is reviewed row by row, and requiring a verdict on the table *and* on each of its rows
 * would be asking twice for the same read.
 */
export function requiredAnchors(card: Card): string[] {
  const parts = card.entries.flatMap((e) =>
    e.kind === "table"
      ? (e.rows ?? []).map((_, i) => e.rowAnchors[i] ?? `${e.anchor}:${i}`)
      : [e.anchor],
  );
  // Only when they actually answered one. A step that carries a dilemma the mentee left blank has
  // nothing there for a mentor to judge.
  return card.judgment?.chose ? [...parts, JUDGMENT_ANCHOR] : parts;
}

/** Which of them carry a verdict. */
export function addressedAnchors(comments: ReviewComment[]): Set<string> {
  return new Set(comments.map((c) => c.anchor));
}

interface Shared {
  onChange: React.Dispatch<React.SetStateAction<ReviewComment[]>>;
  byAnchor: Map<string, ReviewComment>;
  composing: { anchor: string; verdict: Verdict } | null;
  setComposing: (v: { anchor: string; verdict: Verdict } | null) => void;
}

function Entry({
  entry,
  spec,
  ...s
}: { entry: SubmissionEntry; spec: WorkspaceColumn[] | null } & Shared) {
  // Headers and cells in the order the mentee saw them, under the names the mentee saw. Only the
  // display changes: `entry.rowAnchors` is per row, so nothing a mark points at moves.
  const table = alignColumns(entry.head ?? [], entry.rows ?? [], spec);
  const cols = table.head.length + 1;
  const given = s.byAnchor.get(entry.anchor);
  const tone = given ? VERDICT[given.kind].card : "bg-[#fefce8] ring-[#fde68a]";

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-1.5 flex-wrap">
        <h3 className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500">
          {entry.label}
        </h3>
        {entry.kind !== "table" && <Control anchor={entry.anchor} label={entry.label} {...s} />}
      </div>

      {/* Their words wear the same highlighter as everywhere else a mentee's entry appears, until
          a verdict recolours them. */}
      {entry.kind === "text" && (
        <p
          className={`text-[12.5px] text-slate-800 leading-relaxed whitespace-pre-wrap rounded-lg ring-1 px-3 py-2 ${tone}`}
        >
          {entry.text}
        </p>
      )}

      {entry.kind === "list" && (
        <ul className="space-y-1">
          {(entry.items ?? []).map((item, i) => (
            <li
              key={i}
              className={`flex gap-2 text-[12.5px] text-slate-800 leading-relaxed rounded-lg ring-1 px-3 py-1.5 ${tone}`}
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
                {table.head.map((h) => (
                  <th
                    key={h}
                    className="text-left font-semibold text-slate-600 px-3 py-2 border-b border-[#e6eaf0] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
                {/* Every row gets its own verdict — a register is reviewed row by row or not at all. */}
                <th className="w-[132px] border-b border-[#e6eaf0]" />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, r) => {
                const anchor = entry.rowAnchors[r] ?? `${entry.anchor}:${r}`;
                return (
                  <FragmentRow
                    key={anchor}
                    anchor={anchor}
                    // Recomputed only when the columns moved: the server names a row by its first
                    // cell, which is the wrong cell once the order is the form's rather than the
                    // payload's.
                    label={
                      table.reordered
                        ? rowLabel(row, r)
                        : (entry.rowLabels[r] ?? `Row ${r + 1}`)
                    }
                    cols={cols}
                    row={row}
                    {...s}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Non-table composers and verdicts sit under the field, where there is full width. */}
      {/* Keyed by verdict as well as part: switching from "request changes" to "observe" is a
          different thing to say, and carrying the half-typed reason across is how the wrong words
          end up under the wrong verdict. */}
      {entry.kind !== "table" && s.composing?.anchor === entry.anchor && (
        <Composer
          key={`${entry.anchor}:${s.composing.verdict}`}
          anchor={entry.anchor}
          label={entry.label}
          {...s}
        />
      )}
      {entry.kind !== "table" && given && <Given mark={given} {...s} />}
    </section>
  );
}

/** One table row, plus the full-width row its composer and verdict live in. */
function FragmentRow({
  row,
  anchor,
  label,
  cols,
  ...s
}: { row: string[]; anchor: string; label: string; cols: number } & Shared) {
  const given = s.byAnchor.get(anchor);
  const open = s.composing?.anchor === anchor;
  const tone = open
    ? "bg-indigo-50/50"
    : given
      ? VERDICT[given.kind].row
      : "bg-[#fefce8]/50";

  return (
    <>
      <tr className={`border-b border-[#f1f5f9] ${tone}`}>
        {row.map((cell, c) => (
          <td key={c} className="px-3 py-2 text-slate-800 align-top">
            {cell}
          </td>
        ))}
        <td className="px-2 py-1.5 align-top whitespace-nowrap text-right">
          <Control anchor={anchor} label={label} compact {...s} />
        </td>
      </tr>
      {(open || (given && given.body)) && (
        <tr className="border-b border-[#f1f5f9]">
          {/* Spanning the whole table: a composer in the action column is four characters wide. */}
          <td colSpan={cols} className="px-3 pb-3 pt-0 bg-slate-50/60">
            {given && given.body && <Given mark={given} rowLabel={label} {...s} />}
            {open && s.composing && (
              <Composer
                key={`${anchor}:${s.composing.verdict}`}
                anchor={anchor}
                label={label}
                {...s}
              />
            )}
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * The verdict control for one part: four buttons before, one pill after.
 *
 * Approve and Reject land immediately — they are complete on their own. Observe and Changes open
 * a composer first, because an observation nobody wrote and a change request with nothing to
 * change are not things a learner can act on.
 */
function Control({
  anchor,
  label,
  compact,
  onChange,
  byAnchor,
  composing,
  setComposing,
}: { anchor: string; label: string; compact?: boolean } & Shared) {
  const given = byAnchor.get(anchor);

  const set = (kind: Verdict, body: string) => {
    // Close any note box open on this part first. Approving a part while its "request changes" box
    // was open used to record the approval and leave the box standing underneath it — a reason
    // being written for a verdict that is no longer the verdict.
    setComposing(null);
    onChange((prev) => [
      ...prev.filter((c) => c.anchor !== anchor),
      { ...local(), kind, anchor, anchorLabel: label, body },
    ]);
  };

  if (given) {
    const d = VERDICT[given.kind];
    return (
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${d.pill}`}
        >
          <Icon name={d.icon} size={11} strokeWidth={2.4} />
          {compact ? d.short.split(" ")[0] : d.short}
        </span>
        <button
          onClick={() => {
            setComposing(null);
            onChange((prev) => prev.filter((c) => c.anchor !== anchor));
          }}
          title={`Change the verdict on ${label}`}
          aria-label={`Change the verdict on ${label}`}
          className="text-slate-300 hover:text-indigo-600 transition-colors"
        >
          <Icon name="refresh" size={12} />
        </button>
      </span>
    );
  }

  // A note is being written for this part. The other three are held until it is sent or cancelled,
  // so a half-written reason cannot be abandoned by a stray click on a neighbouring verdict.
  const writing = composing?.anchor === anchor;

  return (
    // Wraps: four labelled verdicts are wider than a phone, and a row of buttons that runs off the
    // edge is a row of buttons nobody can press.
    <span className="inline-flex flex-wrap items-center gap-1">
      {VERDICTS.map((d) => {
        const open = writing && composing.verdict === d.id;
        const held = writing && !open;
        return (
          <button
            key={d.id}
            onClick={() =>
              d.needsNote
                ? setComposing(open ? null : { anchor, verdict: d.id })
                : set(d.id, "")
            }
            disabled={held}
            title={held ? `Finish or cancel the note first` : `${d.label} — ${label}`}
            aria-label={`${d.label}: ${label}`}
            aria-pressed={open}
            className={`shrink-0 inline-flex items-center gap-1 rounded-md ring-1 transition-colors h-6 ${
              compact ? "w-6 justify-center" : "px-2"
            } ${open ? d.btn : held ? "bg-slate-50 text-slate-300 ring-slate-200" : `bg-white ${d.idle}`}`}
          >
            <Icon name={d.icon} size={12} strokeWidth={2.2} />
            {!compact && <span className="text-[11px] font-medium">{d.label}</span>}
          </button>
        );
      })}
    </span>
  );
}

function Composer({
  anchor,
  label,
  onChange,
  composing,
  setComposing,
}: { anchor: string; label: string } & Shared) {
  const [body, setBody] = useState("");
  const d = VERDICT[composing?.verdict ?? "changes"];

  const save = () => {
    if (!body.trim()) return;
    onChange((prev) => [
      ...prev.filter((c) => c.anchor !== anchor),
      { ...local(), kind: d.id, anchor, anchorLabel: label, body: body.trim() },
    ]);
    setBody("");
    setComposing(null);
  };

  return (
    <div className="mt-2 rounded-xl border border-[#e6eaf0] bg-white p-3">
      <div className="flex items-baseline gap-2 mb-1.5">
        <Icon name={d.icon} size={13} className="text-slate-500 shrink-0 self-center" />
        <span className="text-[12px] font-semibold text-slate-800">
          {d.id === "observe" ? "Observation" : "Changes"} on <b>{label}</b>
        </span>
        <span className="text-[10.5px] font-semibold text-[#a31d1d]">required</span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") save();
          if (e.key === "Escape") setComposing(null);
        }}
        rows={3}
        autoFocus
        placeholder={
          d.id === "observe"
            ? "What should they note for next time?"
            : "What has to change here before they resubmit?"
        }
        className="w-full min-w-0 resize-y rounded-lg border border-[#e6eaf0] px-2.5 py-2 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300"
      />
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button
          onClick={save}
          disabled={!body.trim()}
          className={`h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
            body.trim() ? d.btn : "bg-slate-100 text-slate-400"
          }`}
        >
          {d.id === "observe" ? "Approve with observation" : "Request changes"}
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

/** The words attached to a verdict already given. A draft can be withdrawn; a sent one is on the record. */
function Given({
  mark,
  rowLabel,
  onChange,
}: { mark: ReviewComment; rowLabel?: string } & Shared) {
  if (!mark.body) return null;
  const d = VERDICT[mark.kind];

  return (
    <div className={`mt-2 flex items-start gap-2 rounded-lg ring-1 px-3 py-2 ${d.card}`}>
      <Icon name={d.icon} size={12} className="text-slate-500 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        {rowLabel && <div className="text-[10.5px] text-slate-500 mb-0.5">on {rowLabel}</div>}
        <p className="text-[12px] text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
          {mark.body}
        </p>
        <div className="text-[10.5px] text-slate-500 mt-1">
          {mark.sentAt ? `Sent · ${mark.mentorName}` : "Draft — sent when you decide"}
        </div>
      </div>
      {!mark.sentAt && (
        <button
          onClick={() => onChange((prev) => prev.filter((c) => c.anchor !== mark.anchor))}
          title="Withdraw this verdict"
          aria-label="Withdraw this verdict"
          className="shrink-0 text-slate-300 hover:text-[#a31d1d] transition-colors"
        >
          <Icon name="x" size={13} />
        </button>
      )}
    </div>
  );
}
