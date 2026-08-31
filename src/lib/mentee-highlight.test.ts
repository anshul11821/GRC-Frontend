// Run: npx tsx src/lib/mentee-highlight.test.ts
//
// The mentor card replays the learner's workspace in a disabled fieldset, and the styling that
// tells the reviewer which parts of it are the mentee's own entries lives in globals.css, keyed on
// one class name. Nothing type-checks that pairing: drop the class from the component, or rename
// the rule, and the card still renders — the mentee's values just go back to being the faintest
// grey text on it, with untouched placeholders indistinguishable from real answers. Silent, and
// the exact failure the highlight exists to prevent. So assert the contract holds.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const component = readFileSync(
  new URL("../components/mentor/submitted-work.tsx", import.meta.url),
  "utf8",
);

// The payload panel leads, unconditionally. This is the one that actually broke: the submission
// used to be reachable only by toggling out of the replayed workspace, and several verbs commit —
// `request` routes to a conversation view once sent, `conduct` and `interview` likewise — so the
// mentee's words render as static transcript text with no control holding them. Tinting reaches
// nothing there, and the reviewer sees a scripted conversation with the work invisible inside it.
// `blocks` is the server's walk of payload.fields, so it works for every verb; keep it unguarded.
const panel = component.match(/What the mentee entered[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? "";
assert.match(panel, /<Blocks blocks=\{card\.blocks\}/, "the entries panel must render the payload");
// The toggle's own identifiers, not its label — the label survives in the comment explaining why
// it went.
for (const gone of ["setRaw", "showWorkspace"]) {
  assert.doesNotMatch(
    component,
    new RegExp(`\b${gone}\b`),
    `${gone}: the submission must not go back behind a view toggle`,
  );
}

// The workspace is context underneath it, and its tint needs the class and the legend.
assert.match(component, /className="mentee-entry /, "the replayed workspace must carry .mentee-entry");
assert.match(component, /Tinted fields are the mentee/, "the tint needs its legend");

// A disabled control is greyed by the UA. `color` alone does not undo it in Chrome or Safari —
// they grey through -webkit-text-fill-color — so both have to be set.
const disabled = css.match(/\.mentee-entry :disabled \{[^}]*\}/)?.[0] ?? "";
assert.match(disabled, /-webkit-text-fill-color/, "disabled values must beat the UA grey");
assert.match(disabled, /opacity:\s*1/, "disabled values must be full opacity");

// A greyed placeholder reads exactly like a greyed value, so an untouched field would look answered.
assert.match(css, /\.mentee-entry :disabled::placeholder \{\s*color: transparent;/);

// Every control the mentee could type into gets the tint — but a tinted checkbox is just a broken
// checkbox, and selection chips are buttons that already carry their own selected colour.
const tint = css.match(/\.mentee-entry input[^{]*\{[^}]*\}/)?.[0] ?? "";
assert.match(tint, /:not\(\[type="checkbox"\]\)/);
assert.match(tint, /:not\(\[type="radio"\]\)/);
assert.match(tint, /\btextarea\b/);
assert.match(tint, /\bselect\b/);

console.log("mentee highlight OK");
