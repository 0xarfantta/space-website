"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGetSession, apiLogin, apiLogout } from "@/lib/api";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const s = await apiGetSession();
      setSession(s);
    } catch {
      setSession(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username, password) => {
    const result = await apiLogin(username, password);
    if (result.ok) {
      setSession(result.session);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setSession(null);
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
