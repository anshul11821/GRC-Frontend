/**
 * Access-token store. The backend issues a short-lived access_token in the JSON body and
 * keeps the refresh token in an httpOnly cookie (POST /auth/refresh takes no body), so we
 * only persist the access token here.
 *
 * Storage location follows the "remember me" choice made at sign-in:
 *   - remembered  → localStorage   (survives browser restart)
 *   - not remembered → sessionStorage (cleared when the tab/browser closes)
 * It is also held in memory so it survives reloads within a session. The refresh path keeps
 * the token in whichever store it already lives in.
 */
const KEY = "grc_access_token";

let memo: string | null = null;
const listeners = new Set<(t: string | null) => void>();

export function getAccessToken(): string | null {
  if (memo !== null) return memo;
  if (typeof window === "undefined") return null;
  memo = window.sessionStorage.getItem(KEY) ?? window.localStorage.getItem(KEY);
  return memo;
}

/**
 * Store (or clear) the access token.
 * @param persist  true → localStorage, false → sessionStorage. When omitted, keep the token in
 *                 whichever store it already lives in (defaults to localStorage if neither).
 */
export function setAccessToken(token: string | null, persist?: boolean): void {
  memo = token;
  if (typeof window !== "undefined") {
    if (token) {
      const toLocal =
        persist ?? (window.sessionStorage.getItem(KEY) === null);
      if (toLocal) {
        window.localStorage.setItem(KEY, token);
        window.sessionStorage.removeItem(KEY);
      } else {
        window.sessionStorage.setItem(KEY, token);
        window.localStorage.removeItem(KEY);
      }
    } else {
      window.localStorage.removeItem(KEY);
      window.sessionStorage.removeItem(KEY);
    }
  }
  listeners.forEach((fn) => fn(token));
}

/**
 * Stable per-account suffix for browser-storage keys. localStorage is per browser, so any key
 * holding one account's state has to be scoped or the next account signing in on the same machine
 * inherits it. Read from the token's `sub` claim (the email — see backend api/deps.py) rather than
 * the auth context, so module-level stores can scope themselves without threading a user through
 * React. Display/partitioning only — never a trust decision, so no signature check.
 */
export function userKey(): string {
  const t = getAccessToken();
  if (!t) return "anon";
  try {
    const b64 = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64)).sub || "anon";
  } catch {
    return "anon";
  }
}

export function onTokenChange(fn: (t: string | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
