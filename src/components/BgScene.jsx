"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FAR_STAR_COUNT = 70;
const MID_STAR_COUNT = 45;
const NEAR_STAR_COUNT = 22;
const SHOOTING_COUNT = 6;
const DUST_COUNT = 18;

/** Deterministic PRNG — same on server + client (no hydration mismatch) */
function seeded(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function makeStars(count, salt, opts = {}) {
  const {
    sizeMin = 0.6,
    sizeMax = 2.2,
    topMax = 100,
    opacityMin = 0.25,
    opacityMax = 0.9,
  } = opts;

  return Array.from({ length: count }, (_, i) => {
    const n = salt + i * 17;
    const hueRoll = seeded(n + 3);
    let color = "255,255,255";
    if (hueRoll > 0.82) color = "165,180,252";
    else if (hueRoll > 0.68) color = "196,181,253";
    else if (hueRoll > 0.55) color = "186,230,253";

    return {
      id: `${salt}-${i}`,
      left: seeded(n + 1) * 100,
      top: seeded(n + 2) * topMax,
      size: sizeMin + seeded(n + 4) * (sizeMax - sizeMin),
      delay: seeded(n + 5) * 6,
      duration: 2.2 + seeded(n + 6) * 4.5,
      opacity: opacityMin + seeded(n + 7) * (opacityMax - opacityMin),
      color,
    };
  });
}

function makeShooters(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: 4 + seeded(i + 201) * 48,
    left: 5 + seeded(i + 211) * 75,
    delay: i * 2.4 + seeded(i + 221) * 2.5,
    duration: 1.2 + seeded(i + 231) * 1.4,
    length: 90 + seeded(i + 241) * 140,
  }));
}

function makeDust(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seeded(i + 301) * 100,
    top: seeded(i + 311) * 100,
    size: 40 + seeded(i + 321) * 120,
    delay: seeded(i + 331) * 8,
    duration: 12 + seeded(i + 341) * 18,
    opacity: 0.05 + seeded(i + 351) * 0.1,
    hue: seeded(i + 361) > 0.5 ? "129,140,248" : "167,139,250",
  }));
}

const FAR_STARS = makeStars(FAR_STAR_COUNT, 1000, {
  sizeMin: 0.5,
  sizeMax: 1.4,
  opacityMin: 0.25,
  opacityMax: 0.7,
});
const MID_STARS = makeStars(MID_STAR_COUNT, 2000, {
  sizeMin: 1,
  sizeMax: 2.4,
  opacityMin: 0.4,
  opacityMax: 0.95,
});
const NEAR_STARS = makeStars(NEAR_STAR_COUNT, 3000, {
  sizeMin: 1.6,
  sizeMax: 3.4,
  opacityMin: 0.55,
  opacityMax: 1,
  topMax: 75,
});
const SHOOTERS = makeShooters(SHOOTING_COUNT);
const DUST = makeDust(DUST_COUNT);

export default function BgScene() {
  const rootRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const animate = useCallback(() => {
    current.current.x += (target.current.x - current.current.x) * 0.055;
    current.current.y += (target.current.y - current.current.y) * 0.055;

    const el = rootRef.current;
    if (el) {
      el.style.setProperty("--mx", current.current.x.toFixed(3));
      el.style.setProperty("--my", current.current.y.toFixed(3));
      el.style.setProperty(
        "--spotlight-x",
        `${(50 + current.current.x * 32).toFixed(2)}%`
      );
      el.style.setProperty(
        "--spotlight-y",
        `${(42 + current.current.y * 28).toFixed(2)}%`
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

  const parallax = (fx, fy) =>
    motionOn
      ? {
          transform: `translate3d(calc(var(--mx) * ${fx}px), calc(var(--my) * ${fy}px), 0)`,
        }
      : undefined;

  return (
    <div
      ref={rootRef}
      className="bg-scene-root pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05030f]"
      aria-hidden="true"
      suppressHydrationWarning
      style={{
        ["--mx"]: "0",
        ["--my"]: "0",
        ["--spotlight-x"]: "50%",
        ["--spotlight-y"]: "42%",
      }}
    >
      {/* Base photo + light parallax */}
      <div
        className="absolute inset-0 will-change-transform"
        style={
          motionOn
            ? {
                transform:
                  "translate3d(calc(var(--mx) * -10px), calc(var(--my) * -8px), 0) scale(1.04)",
              }
            : { transform: "scale(1.02)" }
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
            imageRendering: "auto",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        />
      </div>

      {/* Cosmic color grade */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0618]/70 via-[#120a2e]/30 to-[#05030f]/75" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/35 via-transparent to-violet-950/25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_22%,rgba(5,3,15,0.6)_100%)]" />

      {/* Nebula orbs */}
      <div
        className={`space-nebula space-nebula--a absolute -left-[12%] top-[-5%] h-[55vw] max-h-[620px] w-[55vw] max-w-[620px] rounded-full ${
          motionOn ? "animate-orb-a" : ""
        }`}
        style={parallax(28, 20)}
      />
      <div
        className={`space-nebula space-nebula--b absolute -right-[8%] bottom-[5%] h-[48vw] max-h-[540px] w-[48vw] max-w-[540px] rounded-full ${
          motionOn ? "animate-orb-b" : ""
        }`}
        style={parallax(-24, 18)}
      />
      <div
        className={`space-nebula space-nebula--c absolute left-[30%] top-[35%] h-[32vw] max-h-[380px] w-[32vw] max-w-[380px] rounded-full ${
          motionOn ? "animate-orb-c" : ""
        }`}
        style={parallax(16, -14)}
      />
      <div
        className={`space-nebula space-nebula--d absolute right-[20%] top-[12%] h-[28vw] max-h-[320px] w-[28vw] max-w-[320px] rounded-full ${
          motionOn ? "animate-orb-a" : ""
        }`}
        style={parallax(-12, 22)}
      />

      {/* Milky Way band */}
      <div
        className={`space-milkyway absolute left-[-10%] top-[18%] h-[42%] w-[120%] ${
          motionOn ? "space-milkyway--drift" : ""
        }`}
        style={parallax(10, -6)}
      />

      {/* Cosmic dust */}
      <div className="absolute inset-0" style={parallax(8, 6)}>
        {DUST.map((d) => (
          <span
            key={d.id}
            className={`space-dust absolute rounded-full ${
              motionOn ? "space-dust--float" : ""
            }`}
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size,
              opacity: d.opacity,
              background: `radial-gradient(circle, rgba(${d.hue},0.55) 0%, transparent 70%)`,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Cursor spotlight */}
      {motionOn && (
        <div
          className="absolute inset-0 opacity-75"
          style={{
            background: `
              radial-gradient(
                720px circle at var(--spotlight-x) var(--spotlight-y),
                rgba(129, 140, 248, 0.22),
                transparent 55%
              ),
              radial-gradient(
                420px circle at calc(var(--spotlight-x) + 10%) calc(var(--spotlight-y) - 8%),
                rgba(167, 139, 250, 0.14),
                transparent 50%
              ),
              radial-gradient(
                280px circle at calc(var(--spotlight-x) - 12%) calc(var(--spotlight-y) + 10%),
                rgba(56, 189, 248, 0.08),
                transparent 45%
              )
            `,
          }}
        />
      )}

      {/* Far stars */}
      <div className="absolute inset-0" style={parallax(-3, -2)}>
        {FAR_STARS.map((s) => (
          <span
            key={s.id}
            className={`absolute rounded-full ${motionOn ? "star" : ""}`}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              background: `rgb(${s.color})`,
              boxShadow: `0 0 ${s.size * 2.5}px rgba(${s.color},0.7)`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Mid stars */}
      <div className="absolute inset-0" style={parallax(-8, -5)}>
        {MID_STARS.map((s) => (
          <span
            key={s.id}
            className={`absolute rounded-full ${motionOn ? "star" : ""}`}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              background: `rgb(${s.color})`,
              boxShadow: `0 0 ${s.size * 3.5}px rgba(${s.color},0.85)`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Near bright stars */}
      <div className="absolute inset-0" style={parallax(-14, -9)}>
        {NEAR_STARS.map((s) => (
          <span
            key={s.id}
            className={`space-star-near absolute ${motionOn ? "star" : ""}`}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              background: `rgb(${s.color})`,
              boxShadow: `
                0 0 ${s.size * 4}px rgba(${s.color},0.95),
                0 0 ${s.size * 10}px rgba(${s.color},0.35)
              `,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      {motionOn &&
        SHOOTERS.map((s) => (
          <span
            key={s.id}
            className="shooting-star absolute block h-px origin-left rounded-full"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.length,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}

      {/* Horizon glow */}
      <div className="space-horizon absolute inset-x-0 bottom-0 h-[38%]" />

      {/* Vignette for UI readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />
    </div>
  );
}
