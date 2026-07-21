"use client";

import { useCallback, useRef, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/data";

/**
 * Modern animated object image for the detail page.
 */
export default function DetailImage({ src, alt, category }) {
  const frameRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    // tilt range ~±8deg
    setTilt({
      x: (py - 0.5) * -14,
      y: (px - 0.5) * 14,
    });
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={frameRef}
      className="detail-image-wrap group relative mx-auto w-full max-w-xl perspective-1000 lg:max-w-none"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Soft ambient glow behind frame */}
      <div className="detail-image-glow pointer-events-none absolute -inset-6 rounded-[2rem] opacity-70 blur-2xl" />

      {/* Tilt card */}
      <div
        className="detail-image-card relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/25 bg-white/5 shadow-glass backdrop-blur-sm will-change-transform"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
            tilt.x || tilt.y ? 1.02 : 1
          })`,
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* Skeleton shimmer while loading */}
        {!loaded && (
          <div className="detail-image-skeleton absolute inset-0 z-10" />
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src || PLACEHOLDER_IMAGE}
          alt={alt}
          className={`detail-image-photo h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMAGE;
            setLoaded(true);
          }}
        />

        {/* Slow ken-burns layer on top of static base for depth */}
        <div
          className="detail-image-kenburns pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${src || PLACEHOLDER_IMAGE})`,
          }}
        />

        {/* Shine sweep */}
        <div className="detail-image-shine pointer-events-none absolute inset-0" />

        {/* Vignette + bottom gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/5" />

        {/* Floating category chip */}
        {category && (
          <div className="detail-image-chip absolute left-4 top-4 z-20">
            <span className="badge backdrop-blur-md">{category}</span>
          </div>
        )}

        {/* Corner accents */}
        <span className="detail-corner detail-corner--tl" />
        <span className="detail-corner detail-corner--tr" />
        <span className="detail-corner detail-corner--bl" />
        <span className="detail-corner detail-corner--br" />

        {/* Orbiting dots */}
        <span className="detail-orbit-dot detail-orbit-dot--1" />
        <span className="detail-orbit-dot detail-orbit-dot--2" />
      </div>

      {/* Caption pulse under image */}
      <p className="detail-image-caption mt-3 text-center text-xs text-slate-400">
        Arahkan kursor untuk menjelajah · {alt}
      </p>
    </div>
  );
}
