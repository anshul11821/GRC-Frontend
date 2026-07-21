/**
 * Self-check for the derived country/dial-code list.
 * Run: cd web && node --experimental-strip-types src/lib/countries.test.ts
 *
 * ponytail: plain asserts, no test runner — the repo doesn't have one and this file
 * doesn't justify adding one. Move into a real suite if a second lib test appears.
 */
import assert from "node:assert/strict";
import { COUNTRIES, DIAL_CODES, findCountry } from "./countries.ts";

assert.ok(COUNTRIES.length > 200, "expected 200+ countries");
assert.ok(COUNTRIES.every((c) => /^[A-Z]{2}$/.test(c.iso)), "iso must be alpha-2");
assert.ok(COUNTRIES.every((c) => /^\+\d{1,4}$/.test(c.dial)), "dial must be +digits");
assert.ok(COUNTRIES.every((c) => c.name && c.name !== c.iso), "every country needs a real name");

// Sorted for the picker, and unique so React <option> keys don't collide.
assert.ok(
  COUNTRIES.every((c, i) => i === 0 || COUNTRIES[i - 1].name.localeCompare(c.name) <= 0),
  "countries must be name-sorted",
);
assert.equal(new Set(COUNTRIES.map((c) => c.iso)).size, COUNTRIES.length, "duplicate iso");
assert.equal(new Set(DIAL_CODES.map((d) => d.dial)).size, DIAL_CODES.length, "duplicate dial");

// Shared codes stand alone; codes owned by one country carry its name.
assert.equal(DIAL_CODES.find((d) => d.dial === "+1")?.label, "+1");
assert.equal(DIAL_CODES.find((d) => d.dial === "+376")?.label, "+376 · Andorra");

// What the form stores must resolve back to a selectable option, or the select blanks.
const names = new Set(COUNTRIES.map((c) => c.name));
assert.ok(COUNTRIES.every((c) => names.has(findCountry(c.name)!.name)), "stored name must re-resolve");
assert.equal(findCountry("IN")?.name, "India", "legacy iso must resolve");
assert.equal(findCountry("india")?.name, "India", "lookup must be case-insensitive");
assert.equal(findCountry("India")?.dial, "+91", "dial prefill wrong");
assert.equal(findCountry(""), undefined);
assert.equal(findCountry(null), undefined);
assert.equal(findCountry("Notacountry"), undefined);

console.log(`ok — ${COUNTRIES.length} countries, ${DIAL_CODES.length} dial codes`);
