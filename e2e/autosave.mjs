// E2E: typing in a desk workspace must autosave without touching "Save draft".
// Run from web/ with the app + backend up:
//   GRC_EMAIL=<learner> GRC_TOKEN=<access token> node e2e/autosave.mjs
import assert from "node:assert/strict";
import { chromium } from "playwright";

const TOKEN = process.env.GRC_TOKEN;
const EMAIL = process.env.GRC_EMAIL;
const ACTIVITY = process.env.GRC_ACTIVITY ?? "step_aa_001_1";
const APP = process.env.GRC_APP ?? "http://localhost:3000";

if (!TOKEN || !EMAIL) {
  console.error("Needs a signed-in learner. From backend/:");
  console.error("  python -c \"from app.core.security import create_access_token as t; print(t('you@example.com'))\"");
  console.error("Then:  GRC_EMAIL=you@example.com GRC_TOKEN=<token> node e2e/autosave.mjs");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();

// Sign in the way the app does (access token in localStorage) and satisfy the client-side
// entitlement gate, which is localStorage-only preview billing — see lib/entitlement.ts.
await page.addInitScript(({ t, e }) => {
  window.localStorage.setItem("grc_access_token", t);
  window.localStorage.setItem(`grcmentor:paid:${e}`, new Date().toISOString());
}, { t: TOKEN, e: EMAIL });

const draftPuts = [];
page.on("request", (r) => {
  if (r.method() === "PUT" && r.url().includes(`/me/activities/${ACTIVITY}/draft`)) {
    draftPuts.push(JSON.parse(r.postData() ?? "{}"));
  }
});

await page.goto(`${APP}/app/desk/${ACTIVITY}`, { waitUntil: "networkidle" });

const box = page.locator("textarea, input[type=text]").first();
await box.waitFor({ state: "visible", timeout: 20000 });

// 1. Type, then sit still. No button click anywhere in this test.
const typed = `autosave ${Date.now()}`;
// Real key events, not fill(): the page only autosaves after genuine interaction, so a
// synthetic value-set must NOT be enough to trigger it.
await box.fill(""); // clear whatever a previous run left; a synthetic set must not autosave
await box.focus();
await page.keyboard.type(typed);

assert.equal(draftPuts.length, 0, "must not save on every keystroke — it is debounced");

await page.waitForTimeout(3500);
assert.equal(draftPuts.length, 1, `expected exactly 1 autosave, got ${draftPuts.length}`);
assert.ok(
  JSON.stringify(draftPuts[0]).includes(typed),
  "the autosaved payload must contain what was typed",
);

// 2. The "Saved <time>" indicator appears without the user pressing anything.
await assert.doesNotReject(
  page.getByText(/^Saved /).waitFor({ timeout: 5000 }),
  "the Saved indicator should confirm the autosave",
);

// 3. Idling with no further edits must not keep re-saving.
await page.waitForTimeout(3000);
assert.equal(draftPuts.length, 1, "an unchanged workspace must not re-save");

// 4. The work survives a full reload — the real point of the feature.
await page.reload({ waitUntil: "networkidle" });
const reloaded = page.locator("textarea, input[type=text]").first();
await reloaded.waitFor({ state: "visible", timeout: 20000 });
assert.equal(await reloaded.inputValue(), typed, "the draft must come back after a reload");

// 5. Reloading must not immediately re-save the draft it just loaded.
const afterReload = draftPuts.length;
await page.waitForTimeout(3500);
assert.equal(draftPuts.length, afterReload, "loading a draft must not trigger a save");

await browser.close();
console.log(`ok — autosave fired once, survived reload, no redundant writes (${draftPuts.length} PUT total)`);
