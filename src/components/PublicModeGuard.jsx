"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { clearAdminMode, isAdminPath } from "@/lib/admin-mode";

/**
 * Saat user membuka halaman publik, matikan admin UI mode.
 * Cookie login tidak dihapus di sini — hanya flag UI.
 * Dipasang di layout agar selalu jalan di client.
 */
export default function PublicModeGuard({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (!isAdminPath(pathname)) {
      clearAdminMode();
      // Beritahu hook yang sudah mount agar isAdmin UI jadi false
      try {
        window.dispatchEvent(new Event("orbitra-admin-mode-cleared"));
      } catch {
        /* ignore */
      }
    }
  }, [pathname]);

  return children;
}
