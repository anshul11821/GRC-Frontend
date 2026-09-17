// E2E: the desktop density layer (globals.css) — the app is painted at 90% above `lg`, full size
// below it, and nothing sized to the viewport comes up short because of it.
// Run from web/ with the app up (no sign-in needed — public pages carry the same shell rules):
//   node e2e/zoom.mjs            # or: GRC_APP=http://localhost:3100 node e2e/zoom.mjs
import assert from "node:assert/strict";
import { chromium } from "playwright";

const APP = process.env.GRC_APP ?? "http://localhost:3000";
const browser = await chromium.launch();

// [viewport width, expected zoom] — 1024px is the `lg` breakpoint the layer switches on.
for (const [width, expected] of [[1920, "0.9"], [1024, "0.9"], [1023, "1"], [390, "1"]]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await ctx.newPage();
  for (const route of ["/", "/signin", "/mentor/login"]) {
    await page.goto(APP + route, { waitUntil: "networkidle" });
    const got = await page.evaluate(() => {
      const de = document.documentElement;
      // Everything told to be the viewport's size: it must be exactly that, painted, or the zoom
      // has eaten 10% of it and the page ends in a dead strip.
      const full = [...document.querySelectorAll(".min-h-screen,.h-screen,.min-h-dvh,.h-dvh,.w-screen")]
        .map((el) => Math.round(el.getBoundingClientRect().height));
      return { zoom: getComputedStyle(de).zoom, overflowX: de.scrollWidth - de.clientWidth, full, vh: window.innerHeight };
    });
    assert.equal(got.zoom, expected, `${route} @${width}: zoom ${got.zoom}, expected ${expected}`);
    assert.equal(got.overflowX, 0, `${route} @${width}: page scrolls sideways by ${got.overflowX}px`);
    for (const h of got.full) assert.ok(h >= got.vh, `${route} @${width}: viewport-sized box is ${h}px of ${got.vh}px`);
  }
  await ctx.close();
  console.log(`ok  ${width}px → zoom ${expected}`);
}

await browser.close();
console.log("zoom layer ok");
