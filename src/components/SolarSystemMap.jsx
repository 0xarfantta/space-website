"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SOLAR_SYSTEM_BODIES,
  matchCatalogObject,
  orbitDurationSeconds,
} from "@/lib/solar-system";
import { PLACEHOLDER_IMAGE } from "@/lib/data";
import { useObjects } from "@/hooks/useObjects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VIEW = 760;
const CX = VIEW / 2;
const CY = VIEW / 2;

export default function SolarSystemMap() {
  const { objects, ready } = useObjects();
  const [selectedKey, setSelectedKey] = useState("earth");
  const [paused, setPaused] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [includePluto, setIncludePluto] = useState(true);

  const bodies = useMemo(
    () => SOLAR_SYSTEM_BODIES.filter((b) => includePluto || b.key !== "pluto"),
    [includePluto]
  );

  const selected = useMemo(
    () => bodies.find((b) => b.key === selectedKey) || bodies[0],
    [bodies, selectedKey]
  );

  const catalogMatch = useMemo(
    () => (selected ? matchCatalogObject(selected, objects) : null),
    [selected, objects]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-eyebrow">Visual interaktif</p>
              <h1 className="section-title">Peta Tata Surya</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
                Klik planet untuk melihat info. Orbit disederhanakan (bukan skala
                jarak sebenarnya) agar mudah dijelajahi di layar.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? "▶ Putar orbit" : "⏸ Jeda"}
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setShowLabels((v) => !v)}
              >
                {showLabels ? "Sembunyikan label" : "Tampilkan label"}
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setIncludePluto((v) => !v)}
              >
                {includePluto ? "Sembunyikan Pluto" : "Tampilkan Pluto"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="surface relative overflow-hidden rounded-3xl p-2 sm:p-4">
              <div
                className="relative mx-auto w-full max-w-[720px]"
                style={{ aspectRatio: "1 / 1" }}
              >
                <svg
                  viewBox={`0 0 ${VIEW} ${VIEW}`}
                  className="h-full w-full"
                  role="img"
                  aria-label="Peta tata surya interaktif"
                >
                  <defs>
                    <radialGradient id="ss-space" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="1" />
                    </radialGradient>
                  </defs>

                  <rect
                    width={VIEW}
                    height={VIEW}
                    fill="url(#ss-space)"
                    rx="24"
                  />

                  {Array.from({ length: 40 }, (_, i) => {
                    const x = ((i * 97) % (VIEW - 40)) + 20;
                    const y = ((i * 53) % (VIEW - 40)) + 20;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={i % 5 === 0 ? 1.4 : 0.8}
                        fill="white"
                        opacity={0.15 + (i % 4) * 0.08}
                      />
                    );
                  })}

                  {bodies
                    .filter((b) => b.orbitRadius > 0)
                    .map((b) => (
                      <circle
                        key={`orbit-${b.key}`}
                        cx={CX}
                        cy={CY}
                        r={b.orbitRadius}
                        fill="none"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="1"
                        strokeDasharray={
                          b.type === "dwarf" ? "4 6" : undefined
                        }
                      />
                    ))}

                  {bodies
                    .filter((b) => b.key === "sun")
                    .map((sun) => (
                      <g
                        key="sun"
                        onClick={() => setSelectedKey("sun")}
                        style={{ cursor: "pointer" }}
                      >
                        <circle
                          cx={CX}
                          cy={CY}
                          r={sun.size + 14}
                          fill={sun.glow}
                          opacity="0.35"
                        />
                        <circle
                          cx={CX}
                          cy={CY}
                          r={sun.size}
                          fill={sun.color}
                          style={{
                            filter: `drop-shadow(0 0 18px ${sun.glow})`,
                          }}
                        />
                        <circle
                          cx={CX}
                          cy={CY}
                          r={sun.size + 6}
                          fill="none"
                          stroke={
                            selectedKey === "sun"
                              ? "rgba(251,191,36,0.75)"
                              : "transparent"
                          }
                          strokeWidth="2.5"
                        />
                        {showLabels && (
                          <text
                            x={CX}
                            y={CY + sun.size + 18}
                            textAnchor="middle"
                            fill="#fde68a"
                            fontSize="11"
                            fontWeight="600"
                          >
                            {sun.name}
                          </text>
                        )}
                      </g>
                    ))}

                  {bodies
                    .filter((b) => b.orbitRadius > 0)
                    .map((b) => {
                      const dur = orbitDurationSeconds(b.periodDays);
                      const active = selectedKey === b.key;
                      const pauseClass = paused ? " is-paused" : "";
                      const startAngle = b.order * 32;

                      return (
                        <g
                          key={b.key}
                          className={`ss-orbit-spin${pauseClass}`}
                          style={{
                            transformOrigin: `${CX}px ${CY}px`,
                            animationDuration: `${dur}s`,
                            animationDelay: `-${(startAngle / 360) * dur}s`,
                          }}
                        >
                          <g
                            transform={`translate(${CX + b.orbitRadius} ${CY})`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedKey(b.key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedKey(b.key);
                              }
                            }}
                          >
                            <g
                              className={`ss-counter-spin${pauseClass}`}
                              style={{
                                transformOrigin: "0px 0px",
                                animationDuration: `${dur}s`,
                                animationDelay: `-${(startAngle / 360) * dur}s`,
                              }}
                            >
                              {b.hasRings && (
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx={b.size + 8}
                                  ry={Math.max(3, b.size * 0.35)}
                                  fill="none"
                                  stroke="rgba(253,230,138,0.55)"
                                  strokeWidth="2"
                                />
                              )}
                              <circle
                                cx="0"
                                cy="0"
                                r={b.size / 2}
                                fill={b.color}
                                style={{
                                  filter: `drop-shadow(0 0 8px ${b.glow})`,
                                }}
                                stroke={
                                  active
                                    ? "rgba(255,255,255,0.95)"
                                    : "rgba(255,255,255,0.25)"
                                }
                                strokeWidth={active ? 2.5 : 1}
                              />
                              {showLabels && (
                                <text
                                  x="0"
                                  y={b.size / 2 + 14}
                                  textAnchor="middle"
                                  fill={active ? "#fff" : "#cbd5e1"}
                                  fontSize="10"
                                  fontWeight={active ? "700" : "500"}
                                >
                                  {b.name}
                                </text>
                              )}
                            </g>
                          </g>
                        </g>
                      );
                    })}
                </svg>
              </div>
              <p className="px-2 pb-2 text-center text-[11px] text-slate-500">
                Skala jarak & ukuran disederhanakan ·{" "}
                {ready
                  ? `${objects.length} objek di katalog`
                  : "Memuat katalog…"}
              </p>
            </div>

            <aside className="surface flex flex-col rounded-3xl p-5 sm:p-6">
              {selected ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className="inline-block h-10 w-10 shrink-0 rounded-full border border-white/30"
                      style={{
                        background: selected.color,
                        boxShadow: `0 0 20px ${selected.glow}`,
                      }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                        {selected.type === "star"
                          ? "Bintang"
                          : selected.type === "dwarf"
                            ? "Planet kerdil"
                            : "Planet"}
                      </p>
                      <h2 className="text-xl font-semibold text-white">
                        {selected.name}
                      </h2>
                      <p className="text-xs text-slate-400">{selected.nameEn}</p>
                    </div>
                  </div>

                  <dl className="mb-4 space-y-2 text-sm">
                    {selected.au > 0 && (
                      <div className="flex justify-between gap-3 border-b border-white/10 py-2">
                        <dt className="text-slate-400">Jarak (AU)</dt>
                        <dd className="font-medium text-white">{selected.au}</dd>
                      </div>
                    )}
                    {selected.periodDays > 0 && (
                      <div className="flex justify-between gap-3 border-b border-white/10 py-2">
                        <dt className="text-slate-400">Periode orbit</dt>
                        <dd className="font-medium text-white">
                          ~{selected.periodDays.toLocaleString("id-ID")} hari
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 border-b border-white/10 py-2">
                      <dt className="text-slate-400">Urutan</dt>
                      <dd className="font-medium text-white">
                        {selected.order === 0
                          ? "Pusat"
                          : `Ke-${selected.order} dari Matahari`}
                      </dd>
                    </div>
                  </dl>

                  <p className="mb-4 text-sm leading-relaxed text-slate-200">
                    {selected.fact}
                  </p>

                  {catalogMatch ? (
                    <div className="mt-auto rounded-2xl border border-white/15 bg-black/30 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Di katalog Orbitra
                      </p>
                      <div className="mb-3 flex gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={catalogMatch.imageUrl || PLACEHOLDER_IMAGE}
                          alt=""
                          className="h-14 w-14 rounded-xl object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {catalogMatch.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {catalogMatch.diameter || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/detail?id=${encodeURIComponent(catalogMatch.id)}`}
                          className="btn-primary btn-sm"
                        >
                          Detail
                        </Link>
                        <Link
                          href={`/compare?a=${encodeURIComponent(catalogMatch.id)}`}
                          className="btn-ghost btn-sm"
                        >
                          Bandingkan
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-auto text-xs text-slate-500">
                      {ready
                        ? "Objek ini belum terhubung ke entri katalog."
                        : "Memuat data katalog…"}
                    </p>
                  )}
                </>
              ) : null}

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Lompat ke
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bodies.map((b) => (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setSelectedKey(b.key)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                        selectedKey === b.key
                          ? "border-indigo-400/60 bg-indigo-500/25 text-white"
                          : "border-white/15 bg-black/25 text-slate-300 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
