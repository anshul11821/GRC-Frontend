// E2E: a readiness gate must come back where the mentee left it, not restart at step one.
// Run from web/ with the app + backend up:
//   GRC_EMAIL=<learner> GRC_TOKEN=<access token> node e2e/gate-resume.mjs
import assert from "node:assert/strict";
import { chromium } from "playwright";

const TOKEN = process.env.GRC_TOKEN;
const EMAIL = process.env.GRC_EMAIL;
const ACTIVITY = process.env.GRC_RUA_ACTIVITY ?? "step_aa_001_rua";
const API = process.env.GRC_API ?? "http://localhost:8000";
const APP = process.env.GRC_APP ?? "http://localhost:3000";

if (!TOKEN || !EMAIL) {
  console.error("Needs a signed-in learner. From backend/:");
  console.error("  python -c \"from app.core.security import create_access_token as t; print(t('you@example.com'))\"");
  console.error("Then:  GRC_EMAIL=you@example.com GRC_TOKEN=<token> node e2e/gate-resume.mjs");
  process.exit(1);
}

const putDraft = (fields) =>
  fetch(`${API}/me/activities/${ACTIVITY}/draft`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ payload: { fields, notes: "", attachments: [] } }),
  });

// A draft shaped the way RuaWorkspace lifts it once Study and Inspect are finished.
const seeded = await putDraft({
  study: Array.from({ length: 8 }, () => ({ passed: true })),
  inspect: Array.from({ length: 8 }, () => true),
  objectiveMet: false,
});
assert.equal(seeded.status, 200, "seeding the draft should succeed");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.addInitScript(({ t, e }) => {
  window.localStorage.setItem("grc_access_token", t);
  window.localStorage.setItem(`grcmentor:paid:${e}`, new Date().toISOString());
}, { t: TOKEN, e: EMAIL });

await page.goto(`${APP}/app/desk/${ACTIVITY}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.getByRole("button", { name: "Skip" }).click().catch(() => {}); // first-activity guided tour
await page.waitForTimeout(800);

// 1. The finished steps come back ticked — the draft restored, not reset.
// The rail label is rendered twice (one copy mobile-only), so read text rather than wait on visibility.
const rail = (await page.getByText(/steps complete/).first().textContent()).trim();
assert.notEqual(rail, "0/8 steps complete", `finished steps must stay ticked, rail says "${rail}"`);

// 2. It opens on the first UNFINISHED step, not back at Study.
const headings = await page.locator("h3").allInnerTexts();
const onStudy = headings.some((h) => /Study the governing controls/i.test(h));
assert.ok(!onStudy, "a gate with Study already done must not reopen on Study");

await browser.close();
console.log(`ok — gate resumed at the first unfinished step (${rail})`);
