"use client";

/**
 * Simple full-screen photo background (no particle / nebula FX).
 */
export default function BgScene() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05030f]"
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/space-bg.jpg"
        alt=""
        decoding="async"
        fetchPriority="high"
        className="h-full w-full object-cover object-center"
        style={{
          imageRendering: "auto",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
      />
      {/* Light vignette so text/UI stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/50" />
    </div>
  );
}
