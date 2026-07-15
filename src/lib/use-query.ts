"use client";

import { useEffect, useState } from "react";

/**
 * Tiny stale-while-revalidate cache for GET data, shared across the whole app via a
 * module-level cache. Repeat navigations render cached data instantly and revalidate in
 * the background — so moving between Dashboard / Learnings / Desk / Career feels instant
 * after the first load. Keyed by a stable string (e.g. "learnings:grc101").
 */
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

/** Drop a cache entry (or all) — call after a mutation so the next read refetches. */
export function invalidateQuery(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
}

/** Carry a cached value to another key so a key bump shows stale data (loader) not a cold skeleton. */
export function carryQuery(from: string, to: string) {
  if (cache.has(from)) cache.set(to, cache.get(from));
}

export function useCachedQuery<T>(key: string | null, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(() => (key ? (cache.get(key) as T | undefined) : undefined));
  const [loading, setLoading] = useState<boolean>(() => (key ? !cache.has(key) : false));
  const [error, setError] = useState<unknown>(null);

  // When the key changes (e.g. switching program tabs) reset synchronously during render to the
  // new key's cached value, so we never flash the previous key's data before the effect runs.
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setData(key ? (cache.get(key) as T | undefined) : undefined);
    setLoading(key ? !cache.has(key) : false);
    setError(null);
  }

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    const cached = cache.get(key) as T | undefined;
    if (cache.has(key)) {
      setData(cached);
      setLoading(false); // show stale data immediately
    } else {
      setLoading(true);
    }

    // Dedupe concurrent requests for the same key across components.
    let p = inflight.get(key) as Promise<T> | undefined;
    if (!p) {
      p = fetcher();
      inflight.set(key, p);
      p.finally(() => inflight.delete(key));
    }
    p.then((fresh) => {
      if (cancelled) return;
      cache.set(key, fresh);
      setData(fresh);
      setError(null);
    })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Update the cache + local value optimistically (e.g. after a submit). */
  const mutate = (next: T) => {
    if (key) cache.set(key, next);
    setData(next);
  };

  return { data, loading: loading && data === undefined, revalidating: loading, error, mutate };
}
