"use client";

import { useCallback, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { VerbWorkspace } from "@/components/app/workspaces";
import { TaskBundleSourceProvider, type TaskBundle, type TaskBundleSource } from "@/lib/task-bundle";
import { mentorApi, type Block, type Card } from "@/lib/mentor";

/**
 * The mentee's submission, replayed in their own workspace.
 *
 * A mapping table, a risk matrix, a register — each verb has a bespoke workspace, and a flattened
 * transcription of its payload loses the thing the reviewer needs to judge: which value sat in
 * which column, against which row. So the card mounts the real workspace, seeded with the
 * submitted fields and disabled, rather than re-describing it.
 *
 * The fieldset is what makes it read-only: every control inside inherits `disabled`, so there is
 * no per-workspace read-only mode to write or to keep in step across 24 of them.
 */
/** Keys match ignoring case and separators: payloads carry both `objectiveMet` and `objective_met`. */
const norm = (k: string) => k.replace(/[_-]/g, "").toLowerCase();
const CONTROL = new Set(["objectivemet", "scripted", "ready", "slips"]);

export function SubmittedWork({ card }: { card: Card }) {
  const [raw, setRaw] = useState(false);
  // Set when the workspace turns out not to understand this submission — see `drifted` below.
  const [liftedKeys, setLiftedKeys] = useState<string[] | null>(null);

  // The two task-boundary workspaces build themselves from the task bundle. Point them at the
  // mentee's rendering of it — reviewing a Manila answer against the Berlin framing would fail
  // correct work. Memoised so the provider does not remount the workspace on every render.
  const source = useMemo<TaskBundleSource>(
    () => ({
      key: `card:${card.submissionId}`,
      fetch: () => mentorApi.cardTaskContent(card.submissionId) as Promise<TaskBundle>,
    }),
    [card.submissionId],
  );

  const fields = (card.payload?.fields ?? {}) as Record<string, unknown>;
  const notes = card.payload?.notes?.trim();
  const attachments = card.payload?.attachments ?? [];
  const submittedKeys = Object.keys(fields).filter((k) => !CONTROL.has(norm(k)));
  const empty = submittedKeys.length === 0;

  /**
   * The workspace lifts its own field set on mount, so comparing that against what the mentee
   * actually submitted tells us whether this workspace can represent this payload.
   *
   * Older submissions predate the current workspaces — an `apply` from before the rewrite carries
   * `rows`/`summary`/`findings` where today's lifts `results`/`notes`/`outcomes`. Replaying the
   * workspace against those would render a pristine empty form, which tells the reviewer the
   * mentee submitted nothing. That is the one wrong answer here, so drift falls back to the text.
   */
  // The workspace lifts on mount; there is nowhere to lift to on a review card, so the only use
  // for it is learning which fields this workspace speaks.
  const onLift = useCallback((next: Record<string, unknown>) => {
    const keys = Object.keys(next);
    setLiftedKeys((prev) => (prev && prev.length >= keys.length ? prev : keys));
  }, []);

  const drifted =
    liftedKeys !== null &&
    submittedKeys.length > 0 &&
    !submittedKeys.some((k) => liftedKeys.some((l) => norm(l) === norm(k)));
  const showWorkspace = !raw && !drifted;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400">
          What they submitted · revision {card.revision}
        </div>
        {!drifted && (
          <button
            onClick={() => setRaw((v) => !v)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-[#e6eaf0] bg-white text-[11.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Icon name={raw ? "desk" : "list"} size={13} />
            {raw ? "Show their workspace" : "Show as plain text"}
          </button>
        )}
      </div>

      {drifted && (
        <div className="mb-3 rounded-xl border border-[#e8c48a] bg-[#fdf1e6] px-4 py-2.5 text-[12px] text-[#7c4a10] leading-relaxed">
          This submission predates the current {card.verbId} workspace, so it cannot be replayed in
          it. Everything the mentee sent is below.
        </div>
      )}

      {empty ? (
        <p className="text-[12.5px] text-slate-500">
          The learner submitted no content for this step.
        </p>
      ) : !showWorkspace ? (
        <Blocks blocks={card.blocks} />
      ) : (
        <TaskBundleSourceProvider source={source}>
          {/* disabled: the reviewer reads the work, never edits it. pointer-events stays on so
              the workspace's own tabs, rails and Open buttons still work for reading. */}
          <fieldset disabled className="min-w-0 [&_*]:cursor-default">
            <VerbWorkspace
              verbId={card.verbId}
              taskCode={card.taskCode}
              activityCode={card.activityCode}
              value={fields}
              onChange={onLift}
              openRef={NOOP_REF}
            />
          </fieldset>
        </TaskBundleSourceProvider>
      )}

      {notes && (
        <div className="mt-5 rounded-xl border border-[#e6eaf0] bg-slate-50/60 px-4 py-3">
          <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-1">
            Notes to the mentor
          </div>
          <p className="text-[12.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">{notes}</p>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mt-3">
          <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-400 mb-1">
            Attachments
          </div>
          <ul className="space-y-1">
            {attachments.map((a, i) => (
              <li key={i} className="text-[12.5px] text-slate-700">
                {typeof a === "string" ? a : ((a as { name?: string }).name ?? JSON.stringify(a))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const NOOP_REF = () => {};

/** The server-rendered flattening — kept as the plain-text view and the fallback for a verb with
 *  no bespoke workspace. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.t === "h")
          return (
            <h3 key={i} className="text-[13px] font-semibold text-slate-900 pt-2 first:pt-0">
              {b.text}
            </h3>
          );
        if (b.t === "p")
          return (
            <p key={i} className="text-[12.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {b.text}
            </p>
          );
        if (b.t === "list")
          return (
            <ul key={i} className="space-y-1.5">
              {(b.items ?? []).map((item, j) => (
                <li key={j} className="flex gap-2 text-[12.5px] text-slate-700 leading-relaxed">
                  <span className="text-slate-300 mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        return (
          <div key={i} className="overflow-x-auto rounded-lg border border-[#e6eaf0]">
            <table className="w-full text-[11.5px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {(b.head ?? []).map((h) => (
                    <th
                      key={h}
                      className="text-left font-semibold text-slate-600 px-3 py-2 border-b border-[#e6eaf0] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(b.rows ?? []).map((row, r) => (
                  <tr key={r} className="border-b border-[#f1f5f9] last:border-0">
                    {row.map((cell, c) => (
                      <td key={c} className="px-3 py-2 text-slate-700 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
