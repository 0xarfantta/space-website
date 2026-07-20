"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[500] flex flex-col items-center justify-center gap-4 bg-orbit-deep bg-space-photo bg-cover bg-center transition-all duration-500 dark:bg-orbit-deep ${
        hidden ? "pointer-events-none invisible opacity-0" : "opacity-100"
      }`}
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-black/30" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-white/25 border-t-indigo-300" />
        <p className="text-sm text-slate-100">Loading Orbitra…</p>
      </div>
    </div>
  );
}
