"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function buildNextPath(pathname) {
  if (typeof window === "undefined") {
    return pathname || "/dashboard";
  }
  const qs = window.location.search || "";
  return `${pathname || "/dashboard"}${qs}`;
}

export default function AdminGuard({ children }) {
  const { isAdmin, ready } = useAuth();
  const pathname = usePathname();

  const loginHref = useMemo(() => {
    // On server, path only; client effect uses full path with query
    const base = pathname || "/dashboard";
    return `/login?next=${encodeURIComponent(base)}`;
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    if (isAdmin) return;

    const next = encodeURIComponent(buildNextPath(pathname));
    window.location.replace(`/login?next=${next}`);
  }, [ready, isAdmin, pathname]);

  if (ready && isAdmin) {
    return children;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p className="glass rounded-xl px-4 py-3 text-sm font-medium text-white">
        {!ready ? "Memeriksa akses…" : "Mengalihkan ke login admin…"}
      </p>
      {ready && !isAdmin && (
        <Link
          href={`/login?next=${encodeURIComponent(buildNextPath(pathname))}`}
          className="btn-primary"
        >
          Buka form login
        </Link>
      )}
      {!ready && (
        <Link href={loginHref} className="text-sm text-indigo-200 underline">
          Ke halaman login
        </Link>
      )}
    </div>
  );
}
