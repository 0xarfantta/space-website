"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAdminMode } from "@/lib/admin-mode";

function buildNextPath(pathname) {
  if (typeof window === "undefined") {
    return pathname || "/dashboard";
  }
  const qs = window.location.search || "";
  return `${pathname || "/dashboard"}${qs}`;
}

/**
 * Hanya izinkan akses jika:
 * - session admin valid (cookie), DAN
 * - admin UI mode aktif (belum pindah ke situs publik)
 *
 * Jika cookie ada tapi mode sudah dibersihkan → arahkan ke /login
 * agar user harus masuk area admin secara eksplisit lagi.
 */
export default function AdminGuard({ children }) {
  const { isAdmin, isLoggedInAdmin, ready } = useAuth();
  const pathname = usePathname();
  const [gateReady, setGateReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!ready) return;

    const modeOn = getAdminMode();
    const ok = Boolean(isLoggedInAdmin && modeOn && isAdmin);

    // isAdmin may lag one tick after enterAdminMode; also trust cookie+mode
    const okLoose = Boolean(isLoggedInAdmin && modeOn);

    if (ok || okLoose) {
      setAllowed(true);
      setGateReady(true);
      return;
    }

    setAllowed(false);
    setGateReady(true);
    const next = encodeURIComponent(buildNextPath(pathname));
    window.location.replace(`/login?next=${next}`);
  }, [ready, isAdmin, isLoggedInAdmin, pathname]);

  const loginHref = useMemo(() => {
    return `/login?next=${encodeURIComponent(buildNextPath(pathname))}`;
  }, [pathname]);

  if (!gateReady || !allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="glass rounded-xl px-4 py-3 text-sm font-medium text-white">
          {!ready || !gateReady
            ? "Memeriksa akses…"
            : "Mengalihkan ke login admin…"}
        </p>
        {gateReady && !allowed && (
          <Link href={loginHref} className="btn-primary">
            Buka form login
          </Link>
        )}
      </div>
    );
  }

  return children;
}
