/**
 * Self-check for the persisted query cache — the part that survives a refresh.
 * Run: npx tsx src/lib/use-query.test.ts
 *
 * ponytail: plain asserts, same as up-next.test.ts — no runner in this repo. Covers the storage
 * layer only; the hook itself needs a DOM and its behaviour was already there.
 */
import assert from "node:assert/strict";

// --- a sessionStorage stand-in with a byte budget, so the quota path is actually exercised ---
class FakeStorage {
  map = new Map<string, string>();
  budget = Infinity;
  get length() { return this.map.size; }
  key(i: number) { return [...this.map.keys()][i] ?? null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
  setItem(k: string, v: string) {
    const used = [...this.map].reduce((n, [a, b]) => n + (a === k ? 0 : a.length + b.length), 0);
    if (used + k.length + v.length > this.budget) throw new Error("QuotaExceededError");
    this.map.set(k, v);
  }
}
const store = new FakeStorage();
// Object.keys(sessionStorage) must list the entries, as the browser's does.
const g = globalThis as Record<string, unknown>;
g.sessionStorage = new Proxy(store, {
  ownKeys: (t) => [...t.map.keys()],
  getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  get: (t, p) => {
    const v = (t as unknown as Record<string | symbol, unknown>)[p];
    return typeof v === "function" ? v.bind(t) : v;
  },
}) as unknown as Storage;
g.localStorage = g.sessionStorage;

// Static import is safe: the module touches storage only from inside its functions, and the stub
// above is in place before the first call.
import { clearPersistedCache, hydrateQueryCache, invalidateQuery, persistJSON, prefetchQuery } from "./use-query";

// userKey() reads the access token's `sub`; with no token it is "anon", which is all this needs.
const K = "grcq:anon:learnings:grc101";

// --- round-trip: what is written is what comes back, under the user-scoped prefix ---
persistJSON(K, { orgs: [1, 2, 3] });
assert.deepEqual(JSON.parse(store.getItem(K)!), { orgs: [1, 2, 3] });

// --- eviction sweeps both namespaces, and nothing else ---
persistJSON("grcb:anon:me:AA-001", { rua: "x" });
store.setItem("grc_access_token", "keep-me");
clearPersistedCache();
assert.equal(store.getItem(K), null);
assert.equal(store.getItem("grcb:anon:me:AA-001"), null);
assert.equal(store.getItem("grc_access_token"), "keep-me", "only our own keys may be swept");

// --- over quota: evict our entries once, then the write fits ---
store.clear();
store.budget = 200;
persistJSON("grcq:anon:a", { pad: "x".repeat(100) });
persistJSON("grcq:anon:b", { pad: "y".repeat(100) }); // no room for both → a goes, b lands
assert.equal(store.getItem("grcq:anon:a"), null);
assert.ok(store.getItem("grcq:anon:b"), "the newest value wins the space");

// --- a value that can never fit leaves storage usable rather than wedged ---
persistJSON("grcq:anon:huge", { pad: "z".repeat(10_000) });
assert.equal(store.getItem("grcq:anon:huge"), null);
persistJSON("grcq:anon:c", { ok: 1 });
assert.ok(store.getItem("grcq:anon:c"), "still writable after an impossible value");

// --- hydrate: a refresh reads the mirror back, and prefetch then costs no request ---
store.clear();
store.budget = Infinity;
persistJSON("grcq:anon:progress:grc101", { done: 7 });
hydrateQueryCache();
let calls = 0;
prefetchQuery("progress:grc101", async () => { calls += 1; return { done: 0 }; });
assert.equal(calls, 0, "hydrated key must not refetch");
prefetchQuery("cold:key", async () => { calls += 1; return { done: 0 }; });
assert.equal(calls, 1, "a key nobody has seen still fetches");

// --- sign-out drops the mirror, not just the in-memory map ---
invalidateQuery();
assert.equal(store.getItem("grcq:anon:progress:grc101"), null);

console.log("use-query: ok");
