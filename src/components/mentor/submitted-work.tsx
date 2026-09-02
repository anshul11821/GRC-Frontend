"use client";

import { useCallback, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { VerbWorkspace } from "@/components/app/workspaces";
import { TaskBundleSourceProvider, type TaskBundle, type TaskBundleSource } from "@/lib/task-bundle";
import { mentorApi, type Block, type Card } from "@/lib/mentor";

/**
 * The mentee's submission: their entries first, then their own workspace replayed around them.
 *
 * A mapping table, a risk matrix, a register — each verb has a bespoke workspace, and a flattened
 * transcription of its payload loses the thing the reviewer needs to judge: which value sat in
 * which column, against which row. So the card mounts the real workspace, seeded with the
 * submitted fields and disabled, rather than re-describing it.
 *
 * But the workspace cannot be the only view. Several verbs commit — once the request is sent or
 * the interview run, the form is replaced by a scripted transcript and the mentee's words become
 * static text inside it. There is then nothing on screen to mark as theirs. So the payload leads
 * and the workspace explains it, never the other way round.
 *
 * The fieldset is what makes it read-only: every control inside inherits `disabled`, so there is
 * no per-workspace read-only mode to write or to keep in step across 24 of them.
 */
/** Keys match ignoring case and separators: payloads carry both `objectiveMet` and `objective_met`. */
const norm = (k: string) => k.replace(/[_-]/g, "").toLowerCase();
// `decision` is the judgment call. It rides in the same payload but has its own panel on the
// card, so it is excluded here — otherwise the drift check below reads it as a field the
// workspace failed to represent and warns the reviewer about a submission that is fine.
const CONTROL = new Set(["objectivemet", "scripted", "ready", "slips", "decision"]);

export function SubmittedWork({ card }: { card: Card }) {
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

  return (
    <div>
      {/* The mentee's entries, from the payload, always and first.
        *
        * This used to be the far side of a "Show as plain text" toggle, with the replayed
        * workspace as the default view — and for a third of the verbs that hid the submission
        * completely. A workspace commits: send the request, run the interview, and it re-renders
        * what the mentee wrote as a static transcript bubble. There is then no control on screen
        * holding their words, so nothing to mark up, and the reviewer is reading a scripted
        * conversation trying to work out which lines are the work.
        *
        * `blocks` is the server's walk of payload.fields — only the graded input, every verb, no
        * markup to depend on. So it leads, and the workspace follows as context. */}
      {/* Marked header, white body: a submission runs to whole tables, and flooding those with the
          highlight colour is harder to read than the thing it is trying to make stand out. */}
      {(
        <div className="rounded-xl border border-[#e7d9a8] bg-white overflow-hidden">
          <div className="px-4 py-2.5 bg-[#fefce8] border-b border-[#e7d9a8]/70 flex items-center gap-2">
            <Icon name="edit" size={13} className="text-[#8a6d1f] shrink-0" />
            <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#8a6d1f]">
              What the mentee entered
            </span>
          </div>
          <div className="px-4 py-3.5">
            {empty ? (
              <p className="text-[12.5px] text-slate-500">
                The learner submitted no content for this step.
              </p>
            ) : (
              <Blocks blocks={card.blocks} />
            )}
          </div>
        </div>
      )}

      {drifted && (
        <div className="mt-3 rounded-xl border border-[#e8c48a] bg-[#fdf1e6] px-4 py-2.5 text-[12px] text-[#7c4a10] leading-relaxed">
          This submission predates the current {card.verbId} workspace, so the form cannot be
          replayed in it. Everything the mentee sent is above.
        </div>
      )}

      {!empty && !drifted && (
        <Disclosure
          summary={
            <>
              The mentee&rsquo;s workspace, replayed
              <span className="font-normal text-slate-400">
                {" "}
                — the same form, so a mapping table reads as the table they filled in
              </span>
            </>
          }
        >
        <TaskBundleSourceProvider source={source}>
          {/* disabled: the reviewer reads the work, never edits it. pointer-events stays on so
              the workspace's own tabs, rails and Open buttons still work for reading. */}
          {/* The workspace is built for the learner's full-width desk; in the review column its
              inputs clip their own values, and a reviewer cannot judge a rationale they can only
              see the first forty characters of. `field-sizing: content` lets each control grow to
              its text, and the wrapper scrolls rather than squeezing the table. Where the browser
              lacks it (Firefox, Safari today) the values still clip — the panel above carries the
              whole submission and is the escape hatch. */}
          {/* Most of the workspace was handed to the mentee — scripted rows, transcripts,
              reference cards — so the fields they could type into are tinted to separate the work
              from the scaffolding. It only reaches controls that are still on screen: a workspace
              that has committed shows their words as static text instead, which is why the panel
              above is the authority on what was submitted, not this. */}
          <p className="mb-3 flex items-center gap-2 text-[11.5px] text-slate-500 leading-relaxed">
            <span className="shrink-0 inline-block w-3.5 h-3.5 rounded-[4px] bg-[#fefce8] shadow-[inset_0_0_0_1px_#fde68a]" />
            Tinted fields are the mentee&rsquo;s; everything else the workspace supplied. A tinted
            field left empty is one they did not fill in.
          </p>
          <div className="overflow-x-auto">
            <fieldset
              disabled
              className="mentee-entry min-w-0 [&_*]:cursor-default [&_input]:[field-sizing:content] [&_select]:[field-sizing:content] [&_textarea]:[field-sizing:content] [&_input]:!max-w-none [&_textarea]:!max-w-none"
            >
            <VerbWorkspace
              verbId={card.verbId}
              taskCode={card.taskCode}
              activityCode={card.activityCode}
              value={fields}
              onChange={onLift}
              openRef={NOOP_REF}
            />
            </fieldset>
          </div>
        </TaskBundleSourceProvider>
        </Disclosure>
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

/** The replayed form, collapsible. */
function Disclosure({
  summary,
  children,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details open className="mt-4 group">
      <summary className="cursor-pointer list-none flex items-center gap-2 text-[11.5px] font-medium text-slate-600 hover:text-slate-900">
        <Icon
          name="chevronDown"
          size={13}
          className="text-slate-400 transition-transform group-open:rotate-0 -rotate-90"
        />
        {summary}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

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
