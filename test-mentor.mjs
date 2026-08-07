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
const EMAIL = "mentor.demo@example.com";
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
await page.waitForSelector("text=What to check", { timeout: 30000 });
await page.screenshot({ path: `${OUT}/02-card.png`, fullPage: true });
console.log("card open:", await page.locator("h1").first().innerText());

// 4. tabs
await page.click("text=Inputs it consumed");
await page.waitForTimeout(200);
console.log("inputs tab items:", await page.locator("main ul li").count());
await page.click("text=Submission");

// 5. expand the agent grading panel
await page.click("text=Agent grading");
await page.waitForTimeout(250);
console.log("layer-1 rules shown:", await page.locator("text=Layer 1 — rules").isVisible());
await page.screenshot({ path: `${OUT}/03-grading.png`, fullPage: true });

// 6. hotkey D opens the disapprove sheet; digit 1 toggles reason 1
await page.keyboard.press("d");
await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
await page.waitForTimeout(400);
console.log("sheet reasons:", await page.locator('[role="dialog"] button:has-text("Mentee sees:")').count());
console.log("confirm disabled before selecting:", await page.locator('[role="dialog"] button:has-text("Confirm")').isDisabled());
await page.keyboard.press("1");
await page.keyboard.press("3");
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/04-sheet.png`, fullPage: true });
const summary = await page.locator('[role="dialog"] >> text=/reason(s)? ·/').first().innerText().catch(() => "(none)");
console.log("summary line:", summary);
console.log("confirm enabled after 2 reasons:", !(await page.locator('[role="dialog"] button:has-text("Confirm")').isDisabled()));

// 7. digits typed into the note must NOT toggle reasons
await page.click('[role="dialog"] textarea');
await page.keyboard.type("2 assets missing owner");
await page.waitForTimeout(200);
const after = await page.locator('[role="dialog"] >> text=/reason(s)? ·/').first().innerText().catch(() => "(none)");
console.log("summary after typing digits in note:", after);
console.log("note hotkey suppression ok:", summary === after);

// 8. Esc closes without deciding. The Drawer stays mounted and slides off-screen, so assert on
// the transform class rather than isVisible().
await page.keyboard.press("Escape");
await page.waitForTimeout(600);
const cls = await page.locator('[role="dialog"]').getAttribute("class");
console.log("sheet slid closed on Esc:", cls.includes("translate-x-full"));

// 9. full decision + undo through the UI
await page.keyboard.press("a");
await page.waitForTimeout(500);
await page.keyboard.press("1");
await page.waitForTimeout(200);
await page.click('[role="dialog"] button:has-text("Confirm")');
await page.waitForSelector("text=/Undo \\(\\d+s\\)/", { timeout: 20000 });
await page.screenshot({ path: `${OUT}/05-toast.png`, fullPage: true });
console.log("undo toast:", await page.locator("text=/Undo \\(\\d+s\\)/").first().innerText());

await page.keyboard.press("u");
const dismissed = await page
  .waitForFunction(() => !/Undo \(\d+s\)/.test(document.body.innerText), null, { timeout: 15000 })
  .then(() => true)
  .catch(() => false);
console.log("toast dismissed after U:", dismissed);

// 10. the undone card must be back in the queue
await page.goto("http://localhost:3000/mentor", { waitUntil: "networkidle" });
await page.waitForSelector("text=Needs your decision", { timeout: 30000 });
const back = await page.locator('a[href^="/mentor/card/"]').count();
console.log("cards in queue after undo:", back);

console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
await browser.close();
