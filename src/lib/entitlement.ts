"use client";

// Course entitlement — tracks whether a user has paid for the GRC 101 Foundations course.
//
// This is a PREVIEW gate: there's no real payment processing. Purchase state lives in
// localStorage keyed by email, exposed as an external store so guards/pages react to it
// without hydration mismatches. When real billing lands, swap these reads for /me/billing.
//
// ponytail: PRODUCTION TODO — this is client-side only, so it's trivially bypassable and the
// backend enforces nothing (all content is reachable via the API regardless of payment).
// Before charging money: add real billing + a server-side entitlement check on every
// paid endpoint; treat this store as a UI hint only, never as the gate.

import { useSyncExternalStore } from "react";

const PAID_PREFIX = "grcmentor:paid:";
const listeners = new Set<() => void>();

const keyFor = (email: string) => PAID_PREFIX + email.trim().toLowerCase();

/** ISO timestamp of purchase, or null if not purchased. */
export function paidAt(email: string | undefined | null): string | null {
  if (!email) return null;
  try {
    return localStorage.getItem(keyFor(email));
  } catch {
    return null;
  }
}

export function hasPaid(email: string | undefined | null): boolean {
  return paidAt(email) !== null;
}

export function setPaid(email: string): void {
  try {
    localStorage.setItem(keyFor(email), new Date().toISOString());
  } catch {
    /* ignore storage errors */
  }
  listeners.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith(PAID_PREFIX)) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Reactive paid-state for a user. Returns false during SSR/first paint, then the real value. */
export function usePaid(email: string | undefined | null): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hasPaid(email),
    () => false,
  );
}
