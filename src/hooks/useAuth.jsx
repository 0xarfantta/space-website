"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession, login as authLogin, logout as authLogout } from "@/lib/auth";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setSession(getSession());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    (username, password) => {
      const result = authLogin(username, password);
      if (result.ok) {
        setSession(result.session);
      }
      return result;
    },
    []
  );

  const logout = useCallback(() => {
    authLogout();
    setSession(null);
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
