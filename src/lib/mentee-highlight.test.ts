// Run: npx tsx src/lib/mentee-highlight.test.ts
//
// A reviewer's screen has one job that matters more than any other: show what the mentee actually
// wrote, and never let anything else on the page be mistaken for it. Nothing type-checks that.
//
// It used to be enforced by CSS — the learner's workspace was replayed in a disabled fieldset and
// a `.mentee-entry` rule tinted the controls they could type into. That is gone: the review
// surface renders `card.entries`, the server's walk of the payload, so what is on screen is the
// submission itself rather than a form re-seeded from it. The guarantee moved with it, and the
// two ways it can silently break moved with it too:
//
//   1. The entries stop being rendered from `card.entries` and go back to replaying a workspace.
//      A payload outlives its workspace — an `apply` submitted before the rewrite holds
//      `rows`/`summary` where today's holds `outcomes`/`notes` — so a replay paints a pristine
//      empty form, which tells the reviewer the mentee submitted nothing. The one wrong answer
//      this screen can give.
//   2. The highlight ground is dropped from one of the three entry kinds, so a table of the
//      mentee's rows reads as ordinary page furniture.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(
  new URL("../components/mentor/commentable-submission.tsx", import.meta.url),
  "utf8",
);

// 1. The submission comes from the server's entries, not from a replayed form.
assert.match(
  src,
  /card\.entries\.map\(/,
  "the delivery must be rendered from card.entries",
);
assert.doesNotMatch(
  src,
  /VerbWorkspace/,
  "the review surface must never replay the learner's workspace — payloads outlive workspaces",
);

// 2. The highlighter ground, on every kind of entry a mentee can submit. `text` and `list` carry
//    it directly; a table's rows carry it until a verdict recolours them.
const HIGHLIGHT = "#fefce8";
for (const kind of ["text", "list"] as const) {
  const block = src.match(new RegExp(`entry\\.kind === "${kind}"[\\s\\S]{0,700}`))?.[0] ?? "";
  assert.ok(
    block.includes(HIGHLIGHT) || block.includes("${tone}"),
    `a ${kind} entry must render on the mentee-entry highlight`,
  );
}
assert.match(
  src,
  /bg-\[#fefce8\]\/50/,
  "an undecided table row must render on the mentee-entry highlight",
);

// 3. The default tone — before any verdict — is the highlight, not a neutral card.
assert.match(
  src,
  /const tone = given \? VERDICT\[given\.kind\]\.card : "bg-\[#fefce8\] ring-\[#fde68a\]"/,
  "an entry with no verdict yet must sit on the highlight ground",
);

console.log("mentee highlight OK");
