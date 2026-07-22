"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGetSession, apiLogin, apiLogout } from "@/lib/api";
import {
  clearAdminMode,
  getAdminMode,
  setAdminMode,
} from "@/lib/admin-mode";

const SESSION_TIMEOUT_MS = 4000;

export function useAuth() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  /** Cookie admin valid + flag UI mode aktif di sessionStorage */
  const [adminUi, setAdminUi] = useState(false);

  const syncAdminUi = useCallback((sessionValue) => {
    const loggedIn = sessionValue?.role === "admin";
    setAdminUi(Boolean(loggedIn && getAdminMode()));
  }, []);

  const refresh = useCallback(async () => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      setSession(null);
      setAdminUi(false);
      setReady(true);
    }, SESSION_TIMEOUT_MS);

    try {
      const s = await apiGetSession();
      if (!timedOut) {
        setSession(s);
        syncAdminUi(s);
      }
    } catch {
      if (!timedOut) {
        setSession(null);
        setAdminUi(false);
      }
    } finally {
      clearTimeout(timer);
      if (!timedOut) setReady(true);
    }
  }, [syncAdminUi]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Sinkron saat PublicModeGuard menghapus flag di halaman publik
  useEffect(() => {
    function onCleared() {
      setAdminUi(false);
    }
    function onEntered() {
      setSession((prev) => {
        syncAdminUi(prev);
        return prev;
      });
      // re-read session from state is async; just set from getAdminMode + known session
      setAdminUi((prev) => {
        if (getAdminMode()) return true;
        return false;
      });
    }
    window.addEventListener("orbitra-admin-mode-cleared", onCleared);
    window.addEventListener("orbitra-admin-mode-entered", onEntered);
    return () => {
      window.removeEventListener("orbitra-admin-mode-cleared", onCleared);
      window.removeEventListener("orbitra-admin-mode-entered", onEntered);
    };
  }, [syncAdminUi]);

  const enterAdminMode = useCallback(() => {
    setAdminMode(true);
    setAdminUi(true);
    try {
      window.dispatchEvent(new Event("orbitra-admin-mode-entered"));
    } catch {
      /* ignore */
    }
  }, []);

  const leaveAdminMode = useCallback(() => {
    clearAdminMode();
    setAdminUi(false);
    try {
      window.dispatchEvent(new Event("orbitra-admin-mode-cleared"));
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const result = await apiLogin(username, password);
    if (result.ok) {
      setSession(result.session);
      setAdminMode(true);
      setAdminUi(true);
      setReady(true);
      try {
        window.dispatchEvent(new Event("orbitra-admin-mode-entered"));
      } catch {
        /* ignore */
      }
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearAdminMode();
      setSession(null);
      setAdminUi(false);
      setReady(true);
      try {
        window.dispatchEvent(new Event("orbitra-admin-mode-cleared"));
      } catch {
        /* ignore */
      }
    }
  }, []);

  return {
    session,
    ready,
    /** Session cookie admin masih valid */
    isLoggedInAdmin: session?.role === "admin",
    /**
     * Akses UI/route kelola. False di situs publik meski cookie belum dihapus.
     */
    isAdmin: Boolean(adminUi && session?.role === "admin"),
    login,
    logout,
    refresh,
    enterAdminMode,
    leaveAdminMode,
  };
}
