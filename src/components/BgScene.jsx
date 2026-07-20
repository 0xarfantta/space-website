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
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b061c] via-[#120a2e] to-[#06040f]" />

      {/* Wallpaper — animation class only after mount */}
      <div
        className={`absolute -inset-[12%] bg-space-photo bg-cover bg-center will-change-transform ${
          motionOn ? "bg-layer-kenburns" : ""
        }`}
        style={
          motionOn
            ? {
                transform:
                  "translate3d(calc(var(--mx) * -18px), calc(var(--my) * -14px), 0) scale(1.12)",
              }
            : { transform: "scale(1.08)" }
        }
      />

      <div className="bg-scene-veil absolute inset-0 bg-gradient-to-b from-white/75 via-slate-100/65 to-indigo-50/70 opacity-0 transition-opacity duration-300" />

      {motionOn && (
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `
              radial-gradient(
                600px circle at var(--spotlight-x) var(--spotlight-y),
                rgba(129, 140, 248, 0.28),
                transparent 55%
              ),
              radial-gradient(
                420px circle at calc(var(--spotlight-x) + 8%) calc(var(--spotlight-y) - 6%),
                rgba(167, 139, 250, 0.18),
                transparent 50%
              )
            `,
          }}
        />
      )}

      {/* Nebula orbs */}
      <div
        className={`absolute -left-16 top-[8%] h-[48vw] max-h-[560px] w-[48vw] max-w-[560px] rounded-full bg-indigo-500/25 blur-[100px] ${
          motionOn ? "animate-orb-a" : ""
        }`}
        style={parallax(24, 18)}
      />
      <div
        className={`absolute -right-10 bottom-[10%] h-[42vw] max-h-[500px] w-[42vw] max-w-[500px] rounded-full bg-violet-500/20 blur-[100px] ${
          motionOn ? "animate-orb-b" : ""
        }`}
        style={parallax(-20, 22)}
      />
      <div
        className={`absolute left-[35%] top-[42%] h-[30vw] max-h-[360px] w-[30vw] max-w-[360px] rounded-full bg-fuchsia-400/15 blur-[90px] ${
          motionOn ? "animate-orb-c" : ""
        }`}
        style={parallax(14, -16)}
      />

      {/* Stars — static on SSR / first paint; animate only after mount */}
      <div className="absolute inset-0" style={parallax(-8, -6)}>
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
              opacity: s.opacity,
              boxShadow: `0 0 ${s.size * 3}px rgba(199, 210, 254, 0.85)`,
              animationDelay: motionOn ? `${s.delay}s` : undefined,
              animationDuration: motionOn ? `${s.duration}s` : undefined,
            }}
          />
        ))}
      </div>

      {/* Shooting stars only after mount (avoid SSR/client tree mismatch) */}
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

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,3,16,0.55)_100%)]" />

      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(165,180,252,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(165,180,252,0.35) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          ...parallax(6, 6),
        }}
      />
    </div>
  );
}
