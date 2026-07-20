"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminGuard({ children }) {
  const { isAdmin, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [ready, isAdmin, router, pathname]);

  if (!ready || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 text-sm font-medium text-white shadow-glass-dark backdrop-blur-md">
          {!ready ? "Checking access…" : "Redirecting to admin login…"}
        </p>
      </div>
    );
  }

  return children;
}
