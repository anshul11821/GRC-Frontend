"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authApi, type User } from "@/lib/auth";
import { ApiError, setRefreshHandler } from "@/lib/api";
import { getAccessToken, setAccessToken } from "@/lib/token";
import { invalidateQuery } from "@/lib/use-query";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Store a fresh access token and load the current user. `remember` picks the storage location. */
  signIn: (accessToken: string, remember?: boolean) => Promise<User>;
  /** Clears the session and hard-navigates to `to`. */
  signOut: (to?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Register the silent refresh used by lib/api on 401.
  const registered = useRef(false);
  if (!registered.current) {
    registered.current = true;
    setRefreshHandler(async () => {
      try {
        const r = await authApi.refresh();
        setAccessToken(r.accessToken);
        return true;
      } catch (e) {
        // Only a definitive rejection means the session is really gone — drop it and let
        // RouteGuard bounce them to sign in. A network blip / backend hiccup must NOT log a
        // learner out mid-activity; that path just fails the request and keeps the session.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setAccessToken(null);
          setUserState(null);
        }
        return false;
      }
    });
  }

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUserState(me);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setUserState(null);
      else setUserState(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // No access token yet? Try the refresh cookie before giving up.
      if (!getAccessToken()) {
        try {
          const r = await authApi.refresh();
          setAccessToken(r.accessToken);
        } catch {
          /* not signed in */
        }
      }
      if (getAccessToken()) await loadUser();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  const signIn = useCallback(
    async (accessToken: string, remember = true) => {
      // The query cache is module-level and keyed by data, not by user — anything left from a
      // previous session would render under this one's name. Same on sign-out below.
      invalidateQuery();
      setAccessToken(accessToken, remember);
      const me = await authApi.me();
      setUserState(me);
      return me;
    },
    [],
  );

  const signOut = useCallback(async (to = "/") => {
    try {
      await authApi.logout();
    } catch {
      /* ignore — clear locally regardless */
    }
    invalidateQuery();
    setAccessToken(null);
    setUserState(null);
    // Hard navigation, not router.replace. A client-side route change keeps the JS module graph
    // alive, so every module-level cache, in-flight refresh promise and memo from this account
    // survives into the next one signing in on the same tab. Reloading drops the lot — including
    // any cache added here later, which a hand-maintained list of invalidations would miss.
    window.location.replace(to);
  }, []);

  const refreshUser = useCallback(() => loadUser(), [loadUser]);

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, refreshUser, setUser: setUserState }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
