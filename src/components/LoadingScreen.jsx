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
      className={`fixed inset-0 z-[500] flex flex-col items-center justify-center gap-4 bg-orbit-deep transition-all duration-500 ${
        hidden ? "pointer-events-none invisible opacity-0" : "opacity-100"
      }`}
      aria-live="polite"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/space-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-white/25 border-t-indigo-300" />
        <p className="text-sm text-slate-100">Memuat Orbitra…</p>
      </div>
    </div>
  );
}
