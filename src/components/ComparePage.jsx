"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PLACEHOLDER_IMAGE } from "@/lib/data";
import { useObjects } from "@/hooks/useObjects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FIELDS = [
  { key: "category", label: "Kategori" },
  { key: "scientificName", label: "Nama ilmiah" },
  { key: "diameter", label: "Diameter" },
  { key: "mass", label: "Massa" },
  { key: "gravity", label: "Gravitasi" },
  { key: "temperature", label: "Suhu" },
  { key: "distance", label: "Jarak" },
  { key: "yearDiscovered", label: "Tahun ditemukan" },
];

function ObjectPicker({
  label,
  value,
  onChange,
  objects,
  excludeId,
  disabled,
}) {
  const sorted = useMemo(
    () =>
      [...objects].sort((a, b) =>
        String(a.name).localeCompare(String(b.name), "id")
      ),
    [objects]
  );

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
      <span>{label}</span>
      <select
        className="admin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="" className="bg-slate-900">
          — Pilih objek —
        </option>
        {sorted.map((o) => (
          <option
            key={o.id}
            value={o.id}
            disabled={o.id === excludeId}
            className="bg-slate-900"
          >
            {o.name}
            {o.category ? ` · ${o.category}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function SideCard({ obj, side }) {
  if (!obj) {
    return (
      <div className="surface flex min-h-[220px] flex-col items-center justify-center rounded-2xl p-6 text-center">
        <p className="text-4xl opacity-40" aria-hidden="true">
          {side === "a" ? "①" : "②"}
        </p>
        <p className="mt-2 text-sm text-slate-400">Belum dipilih</p>
      </div>
    );
  }

  const img = obj.imageUrl || PLACEHOLDER_IMAGE;

  return (
    <div className="surface overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-indigo-950/80 to-violet-950/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={obj.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <span className="badge mb-1">{obj.category || "—"}</span>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            {obj.name}
          </h2>
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-300">
          {obj.description || "Tidak ada deskripsi."}
        </p>
        <Link
          href={`/detail?id=${encodeURIComponent(obj.id)}`}
          className="btn-ghost btn-sm mt-3 inline-flex"
        >
          Lihat detail
        </Link>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { objects, ready } = useObjects();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  // Hydrate from URL once objects ready
  useEffect(() => {
    if (!ready) return;
    const a = searchParams.get("a") || "";
    const b = searchParams.get("b") || "";
    if (a && objects.some((o) => o.id === a)) setIdA(a);
    if (b && objects.some((o) => o.id === b)) setIdB(b);
  }, [ready, objects, searchParams]);

  const syncUrl = useCallback(
    (a, b) => {
      const params = new URLSearchParams();
      if (a) params.set("a", a);
      if (b) params.set("b", b);
      const qs = params.toString();
      router.replace(qs ? `/compare?${qs}` : "/compare", { scroll: false });
    },
    [router]
  );

  function handleA(v) {
    setIdA(v);
    syncUrl(v, idB);
  }

  function handleB(v) {
    setIdB(v);
    syncUrl(idA, v);
  }

  function swap() {
    const nextA = idB;
    const nextB = idA;
    setIdA(nextA);
    setIdB(nextB);
    syncUrl(nextA, nextB);
  }

  function clearAll() {
    setIdA("");
    setIdB("");
    syncUrl("", "");
  }

  const objA = useMemo(
    () => objects.find((o) => o.id === idA) || null,
    [objects, idA]
  );
  const objB = useMemo(
    () => objects.find((o) => o.id === idB) || null,
    [objects, idB]
  );

  const both = Boolean(objA && objB);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center sm:text-left">
            <p className="section-eyebrow">Alat edukasi</p>
            <h1 className="section-title">Bandingkan 2 Objek</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Pilih dua benda langit dari katalog untuk melihat perbedaan
              diameter, massa, gravitasi, suhu, dan properti lainnya berdampingan.
            </p>
          </div>

          <div className="surface mb-6 grid gap-4 rounded-2xl p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:p-5">
            <ObjectPicker
              label="Objek A"
              value={idA}
              onChange={handleA}
              objects={objects}
              excludeId={idB}
              disabled={!ready}
            />
            <div className="flex flex-wrap justify-center gap-2 pb-0.5">
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={swap}
                disabled={!idA && !idB}
                title="Tukar posisi"
              >
                ⇄ Tukar
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={clearAll}
                disabled={!idA && !idB}
              >
                Reset
              </button>
            </div>
            <ObjectPicker
              label="Objek B"
              value={idB}
              onChange={handleB}
              objects={objects}
              excludeId={idA}
              disabled={!ready}
            />
          </div>

          {!ready && (
            <p className="py-12 text-center text-sm text-slate-400">
              Memuat katalog…
            </p>
          )}

          {ready && (
            <>
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                <SideCard obj={objA} side="a" />
                <SideCard obj={objB} side="b" />
              </div>

              {both ? (
                <div className="surface overflow-hidden rounded-2xl">
                  <div className="border-b border-white/15 px-4 py-3 sm:px-5">
                    <h2 className="text-lg font-semibold text-white">
                      Tabel perbandingan
                    </h2>
                    <p className="text-xs text-slate-400">
                      Baris disorot jika nilainya berbeda
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-4 py-3 font-semibold sm:px-5">
                            Properti
                          </th>
                          <th className="px-4 py-3 font-semibold text-indigo-200 sm:px-5">
                            {objA.name}
                          </th>
                          <th className="px-4 py-3 font-semibold text-violet-200 sm:px-5">
                            {objB.name}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {FIELDS.map(({ key, label }) => {
                          const va = String(objA[key] || "—").trim() || "—";
                          const vb = String(objB[key] || "—").trim() || "—";
                          const diff =
                            va.toLowerCase() !== vb.toLowerCase();
                          return (
                            <tr
                              key={key}
                              className={`border-b border-white/5 ${
                                diff ? "bg-indigo-500/10" : ""
                              }`}
                            >
                              <td className="px-4 py-3 font-medium text-slate-300 sm:px-5">
                                {label}
                                {diff && (
                                  <span className="ml-2 text-[10px] font-semibold uppercase text-indigo-300">
                                    beda
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-100 sm:px-5">
                                {va}
                              </td>
                              <td className="px-4 py-3 text-slate-100 sm:px-5">
                                {vb}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="surface rounded-2xl p-8 text-center">
                  <p className="text-sm text-slate-300">
                    Pilih <strong className="text-white">dua objek</strong> di
                    atas untuk menampilkan tabel perbandingan.
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Tips: mulai dari Earth vs Mars atau Jupiter vs Saturn.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
