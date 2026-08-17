// Does the mentor see the mentee's filled workspace, read-only?
// Run: node test-submitted-work.mjs "<super mentor password>"
import { chromium } from "playwright";

const OUT = "C:/Users/Anshul/AppData/Local/Temp/claude/d--GRC-Mentor/257bcb29-8ea4-493a-baa9-0d2c1417f8d4/scratchpad";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:3000/mentor/login", { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "super.mentor@example.com");
await page.fill('input[type="password"]', process.argv[2]);
await page.click('button[type="submit"]');
await page.waitForSelector("text=Needs your decision", { timeout: 30000 });

const rows = await page.locator('a[href^="/mentor/card/"]').count();
console.log(`queue: ${rows} cards`);

for (let i = 0; i < Math.min(rows, 4); i++) {
  await page.goto("http://localhost:3000/mentor", { waitUntil: "networkidle" });
  const href = await page.locator('a[href^="/mentor/card/"]').nth(i).getAttribute("href");
  await page.goto("http://localhost:3000" + href, { waitUntil: "networkidle" });
  await page.waitForSelector("text=What they submitted", { timeout: 30000 });
  await page.waitForTimeout(1200); // let the workspace mount (gates fetch their bundle)

  const gate = await page.locator("h1").first().innerText().catch(() => "?");
  // The workspace is inside the disabled fieldset; count what the mentee actually filled in.
  const stats = await page.evaluate(() => {
    const fs = document.querySelector("fieldset[disabled]");
    if (!fs) return null;
    const inputs = [...fs.querySelectorAll("input,textarea,select")];
    const filled = inputs.filter((el) => (el.value ?? "").toString().trim() !== "").length;
    const checked = inputs.filter((el) => el.type === "checkbox" && el.checked).length;
    return {
      tables: fs.querySelectorAll("table").length,
      rows: fs.querySelectorAll("tbody tr").length,
      inputs: inputs.length,
      filled,
      checked,
      // A control inside a disabled fieldset is non-interactive but its own .disabled property
      // stays false — :disabled is the only check that reflects the inherited state.
      allDisabled: inputs.every((el) => el.matches(":disabled")),
      text: fs.innerText.trim().length,
    };
  });
  console.log(`\n${href}  ${gate.slice(0, 52)}`);
  const drift = await page.locator("text=predates the current").count();
  if (!stats) {
    console.log(drift ? "   schema drift -> plain text (guarded)" : "   NO WORKSPACE — fell back to plain text");
  } else {
    console.log(`   workspace: ${stats.tables} table(s), ${stats.rows} row(s), ` +
      `${stats.filled}/${stats.inputs} inputs carrying the mentee's values, ` +
      `${stats.checked} checked · ${stats.text} chars`);
    console.log(`   read-only: every control disabled = ${stats.allDisabled}`);
  }
  await page.screenshot({ path: `${OUT}/work-${i}.png`, fullPage: false });

  // the plain-text fallback must still be reachable
  const toggle = page.locator('button:has-text("Show as plain text")');
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(300);
    const hasFieldset = await page.locator("fieldset[disabled]").count();
    console.log(`   plain-text toggle works: ${hasFieldset === 0}`);
  }
}

console.log(errors.length ? "\nCONSOLE ERRORS:\n" + errors.slice(0, 6).join("\n") : "\nno console errors");
await browser.close();
