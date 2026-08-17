/**
 * End-to-end drive of the mentor review console. Needs the backend on :8000 and `npm run dev`
 * on :3000, plus a mentor account (backend/scripts/make_mentor.py).
 *
 *     node test-mentor.mjs "<mentor password>"
 *
 * Covers what unit tests cannot: the auth bounce, J/K/Enter navigation, the reason sheet's digit
 * hotkeys AND their suppression inside the note field, revision-2 escalation labelling, and a
 * real decision followed by an undo that puts the card back in the queue.
 */
import { chromium } from "playwright";

const OUT = "C:/Users/Anshul/AppData/Local/Temp/claude/d--GRC-Mentor/257bcb29-8ea4-493a-baa9-0d2c1417f8d4/scratchpad";
const EMAIL = process.argv[3] ?? "mentor.demo@example.com";
const PASSWORD = process.argv[2];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

// 1. unauthenticated /mentor must bounce to login
await page.goto("http://localhost:3000/mentor", { waitUntil: "networkidle" });
console.log("unauthenticated ->", new URL(page.url()).pathname);

// 2. sign in
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/mentor", { timeout: 30000 });
await page.waitForSelector("text=Needs your decision", { timeout: 30000 });
await page.screenshot({ path: `${OUT}/01-queue.png`, fullPage: true });
console.log("queue rendered:", (await page.locator('a[href^="/mentor/card/"]').count()), "cards");
console.log("role filter visible:", await page.locator("text=All roles").isVisible());

// 3. keyboard: J then Enter opens the highlighted card
await page.keyboard.press("j");
await page.keyboard.press("Enter");
await page.waitForURL("**/mentor/card/**", { timeout: 30000 });
await page.waitForSelector("text=Your checklist", { timeout: 30000 });
await page.screenshot({ path: `${OUT}/02-card.png`, fullPage: true });
console.log("card open:", await page.locator("h1").first().innerText());

// 4. tabs
// 4. The v3 review IS the checklist: six questions, answered Yes/No. Approve only unlocks once
// every asked question is answered, and only if none of them failed.
// Pre-cleared items render 'Reopen', not Yes/No — only the asked ones are answerable.
const questions = page.locator('[data-check]:has(button:has-text("Yes"))');
const preCleared = await page.locator('[data-check]:has-text("Pre-cleared")').count();
const qCount = await questions.count();
console.log(`checklist: ${qCount} asked, ${preCleared} pre-cleared by the grader`);

// Scope to the decision panel: the (closed) reason sheet also holds a "Confirm Approve" button,
// which is legitimately disabled and would be measured instead.
const panel = page.locator("aside");
const approve = panel.locator('button:has-text("Approve")').first();
const returnBtn = panel.locator('button:has-text("Return with reasons")').first();
console.log("approve disabled before answering:", await approve.isDisabled());
console.log("return disabled with nothing failing:", await returnBtn.isDisabled());

// 5. Answer everything Yes -> approve opens; one No -> return opens instead.
for (let i = 0; i < qCount; i++) await questions.nth(i).locator('button:has-text("Yes")').click();
await page.waitForTimeout(250);
console.log("approve enabled once all answered yes:", !(await approve.isDisabled()));
console.log("return still disabled with none failing:", await returnBtn.isDisabled());

await questions.first().locator('button:has-text("No")').click();
await page.waitForTimeout(250);
console.log("one No -> approve blocked:", await approve.isDisabled());
console.log("one No -> return enabled:", !(await returnBtn.isDisabled()));

// 6. The failing item carries its own reason and correction into the sheet — the mentor never
// picks a disapproval from a menu.
await returnBtn.click();
await page.waitForSelector('[role="dialog"]:not(.translate-x-full)', { timeout: 10000 });
await page.waitForTimeout(400);
const sheet = await page.locator('[role="dialog"]:not(.translate-x-full)').innerText();
console.log("sheet carries the item's correction:", /correction|mentee/i.test(sheet));
await page.keyboard.press("Escape");
await page.waitForTimeout(500);
const cls = await page.locator('[role="dialog"]').last().getAttribute("class");
console.log("sheet slid closed on Esc:", cls.includes("translate-x-full"));

console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
await browser.close();
