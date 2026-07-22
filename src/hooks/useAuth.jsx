"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGetSession, apiLogin, apiLogout } from "@/lib/api";

const SESSION_TIMEOUT_MS = 4000;

export function useAuth() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      setSession(null);
      setReady(true);
    }, SESSION_TIMEOUT_MS);

    try {
      const s = await apiGetSession();
      if (!timedOut) {
        setSession(s);
      }
    } catch {
      if (!timedOut) {
        setSession(null);
      }
    } finally {
      clearTimeout(timer);
      if (!timedOut) {
        setReady(true);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username, password) => {
    const result = await apiLogin(username, password);
    if (result.ok) {
      setSession(result.session);
      setReady(true);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setSession(null);
      setReady(true);
    }
  }, []);

  return {
    session,
    ready,
    isAdmin: session?.role === "admin",
    login,
    logout,
    refresh,
  };
}
