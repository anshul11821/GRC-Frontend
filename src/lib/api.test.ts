// Run: npx tsx src/lib/api.test.ts
// Parallel 401s must collapse into ONE /auth/refresh. Rotating the refresh cookie more than once
// makes the backend's reuse detection revoke the whole token family and log the learner out.
import assert from "node:assert/strict";
import { refreshOnce, setRefreshHandler } from "./api";

const tick = () => new Promise((r) => setTimeout(r, 10));

let calls = 0;
const handler = (result: boolean) => async () => {
  calls++;
  await tick();
  return result;
};

async function main() {
  // 5 requests hit 401 together -> one rotation, everyone gets the same answer.
  setRefreshHandler(handler(true));
  calls = 0;
  const results = await Promise.all([refreshOnce(), refreshOnce(), refreshOnce(), refreshOnce(), refreshOnce()]);
  assert.equal(calls, 1, `5 parallel refreshes should rotate once, rotated ${calls}x`);
  assert.deepEqual(results, [true, true, true, true, true], "every waiter gets the refreshed result");

  // The slot clears afterwards, so a later expiry can still refresh.
  await refreshOnce();
  assert.equal(calls, 2, "a refresh after the first settles must actually run");

  // A failed refresh resolves false and must not wedge the slot shut.
  setRefreshHandler(handler(false));
  calls = 0;
  assert.deepEqual(await Promise.all([refreshOnce(), refreshOnce()]), [false, false], "failure propagates");
  assert.equal(calls, 1, "failures dedupe too");
  await refreshOnce();
  assert.equal(calls, 2, "slot reopens after a failure");

  // A rejecting handler must not leave the slot permanently occupied either.
  setRefreshHandler(async () => {
    calls++;
    throw new Error("network down");
  });
  calls = 0;
  await assert.rejects(refreshOnce(), /network down/);
  await assert.rejects(refreshOnce(), /network down/);
  assert.equal(calls, 2, "a rejected refresh clears the slot for the next attempt");

  // No handler registered (signed out) -> false, never a crash.
  setRefreshHandler(null);
  assert.equal(await refreshOnce(), false, "no handler = no refresh");

  console.log("ok — refreshOnce dedupes concurrent refreshes");
}

main();
