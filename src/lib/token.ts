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

export function onTokenChange(fn: (t: string | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
