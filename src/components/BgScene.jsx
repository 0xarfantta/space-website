"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STAR_COUNT = 48;
const SHOOTING_COUNT = 4;

/** Deterministic pseudo-random (identical on server + client) */
function seeded(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function makeStars(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seeded(i + 1) * 100,
    top: seeded(i + 17) * 100,
    size: seeded(i + 33) * 2.2 + 0.8,
    delay: seeded(i + 51) * 5,
    duration: 2 + seeded(i + 71) * 4,
    opacity: 0.35 + seeded(i + 91) * 0.65,
  }));
}

function makeShooters(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 8 + seeded(i + 111) * 55,
    left: 10 + seeded(i + 131) * 70,
    delay: i * 3.2 + seeded(i + 151) * 2,
    duration: 1.4 + seeded(i + 171) * 1.2,
    length: 80 + seeded(i + 191) * 100,
  }));
}

// Module-level constants — same values during SSR and client hydration
const STARS = makeStars(STAR_COUNT);
const SHOOTERS = makeShooters(SHOOTING_COUNT);

export default function BgScene() {
  const rootRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  // Always start false so server HTML === first client render.
  // Motion prefs & parallax only kick in after mount.
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const animate = useCallback(() => {
    current.current.x += (target.current.x - current.current.x) * 0.06;
    current.current.y += (target.current.y - current.current.y) * 0.06;

    const el = rootRef.current;
    if (el) {
      el.style.setProperty("--mx", current.current.x.toFixed(3));
      el.style.setProperty("--my", current.current.y.toFixed(3));
      el.style.setProperty(
        "--spotlight-x",
        `${(50 + current.current.x * 28).toFixed(2)}%`
      );
      el.style.setProperty(
        "--spotlight-y",
        `${(45 + current.current.y * 28).toFixed(2)}%`
      );
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    setMounted(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mounted || reducedMotion) return undefined;

    rafRef.current = requestAnimationFrame(animate);

    const onMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      target.current.x = (e.clientX / w) * 2 - 1;
      target.current.y = (e.clientY / h) * 2 - 1;
    };

    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [animate, mounted, reducedMotion]);

  const motionOn = mounted && !reducedMotion;

  const parallax = (factorX, factorY) =>
    motionOn
      ? {
          transform: `translate3d(calc(var(--mx) * ${factorX}px), calc(var(--my) * ${factorY}px), 0)`,
        }
      : undefined;

  return (
    <div
      ref={rootRef}
      className="bg-scene-root pointer-events-none fixed inset-0 z-0 overflow-hidden bg-orbit-deep"
      aria-hidden="true"
      // Ignore attribute diffs from browser extensions on this subtree
      suppressHydrationWarning
      style={{
        ["--mx"]: "0",
        ["--my"]: "0",
        ["--spotlight-x"]: "50%",
        ["--spotlight-y"]: "45%",
      }}
    >
      {/* Wallpaper — zoomed out (no crop zoom), sharp HD rendering */}
      <div
        className="absolute inset-0 will-change-transform"
        style={
          motionOn
            ? {
                transform:
                  "translate3d(calc(var(--mx) * -8px), calc(var(--my) * -6px), 0)",
              }
            : undefined
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/space-bg.jpg"
          alt=""
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
          style={{
            /* Full-viewport HD photo; no extra scale-up (zoom out vs old 1.12x) */
            objectFit: "cover",
            objectPosition: "center center",
            transform: "scale(1)",
            transformOrigin: "center center",
            imageRendering: "auto",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        />
      </div>

      {/* Soft vignette only — no grid, no heavy color cast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />

      {/* Subtle ambient light (very light — keeps photo readable as HD) */}
      {motionOn && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(
                700px circle at var(--spotlight-x) var(--spotlight-y),
                rgba(255, 255, 255, 0.08),
                transparent 55%
              )
            `,
          }}
        />
      )}

      {/* Soft stars only (no grid pattern) */}
      <div className="absolute inset-0" style={parallax(-4, -3)}>
        {STARS.map((s) => (
          <span
            key={s.id}
            className={`absolute rounded-full bg-white ${
              motionOn ? "star" : ""
            }`}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity * 0.55,
              boxShadow: `0 0 ${s.size * 2}px rgba(255, 255, 255, 0.5)`,
              animationDelay: motionOn ? `${s.delay}s` : undefined,
              animationDuration: motionOn ? `${s.duration}s` : undefined,
            }}
          />
        ))}
      </div>

      {motionOn &&
        SHOOTERS.map((s) => (
          <span
            key={s.id}
            className="shooting-star absolute block h-px origin-left rounded-full"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.length}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
    </div>
  );
}
