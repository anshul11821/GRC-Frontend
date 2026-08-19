// Run: npx tsx src/lib/token.test.ts
// Storage keys scoped by userKey() are what stop one account's browser-local state (saved jobs,
// dismissed Up-next items) showing up under the next account signing in on the same machine.
import assert from "node:assert/strict";
import { setAccessToken, userKey } from "./token";

// Minimal localStorage/sessionStorage so the module works outside a browser. token.ts reads
// `window` lazily inside its functions, so installing this before the first call is enough.
const store = new Map<string, string>();
const fake = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};
(globalThis as Record<string, unknown>).window = { localStorage: fake, sessionStorage: fake };

/** An unsigned JWT with the given `sub` — userKey only reads the claim, it never verifies. */
const tokenFor = (sub: string) =>
  `x.${Buffer.from(JSON.stringify({ sub })).toString("base64url")}.y`;

setAccessToken(null);
assert.equal(userKey(), "anon", "no session -> anon bucket");

setAccessToken(tokenFor("priyanshiarora.sitl@gmail.com"));
const a = userKey();
assert.equal(a, "priyanshiarora.sitl@gmail.com", "reads sub from the access token");

setAccessToken(tokenFor("user.vaptfix@gmail.com"));
const b = userKey();
assert.notEqual(a, b, "a different account must get a different key, or its storage leaks in");

// Base64url (- and _) must decode, or a whole class of tokens silently falls back to "anon"
// and every one of those accounts shares the same bucket.
const urlSafe = tokenFor("a?b~c@d.com"); // this payload encodes to a '-' in base64url
assert.ok(/[-_]/.test(urlSafe.split(".")[1]), "fixture should exercise base64url chars");
setAccessToken(urlSafe);
assert.equal(userKey(), "a?b~c@d.com", "base64url payloads decode");

setAccessToken("not-a-jwt");
assert.equal(userKey(), "anon", "malformed token degrades to anon, never throws");

setAccessToken(null);
console.log("token.test.ts ok");
