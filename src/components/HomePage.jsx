"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, normalizeCategory } from "@/lib/data";
import { useObjects } from "@/hooks/useObjects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ObjectCard from "@/components/ObjectCard";

export default function HomePage() {
  const { objects, stats, ready } = useObjects();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const featured = useMemo(
    () =>
      [...objects]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4),
    [objects]
  );

  const categoryCounts = useMemo(() => {
    const counts = {};
    objects.forEach((o) => {
      const cat = normalizeCategory(o.category);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [objects]);

  const catalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...objects]
      .filter((obj) => {
        const objCat = normalizeCategory(obj.category);
        const matchCat = !category || objCat === category;
        const hay =
          `${obj.name} ${obj.scientificName} ${objCat} ${obj.description}`.toLowerCase();
        return matchCat && (!q || hay.includes(q));
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [objects, query, category]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="flex min-h-[min(100dvh,900px)] items-center px-4 py-12 sm:py-16 md:min-h-[calc(100vh-72px)] md:py-20">
          <div className="mx-auto max-w-3xl animate-fade-up text-center">
            <h1 className="mb-4 bg-title-gradient bg-clip-text text-3xl font-bold tracking-tight text-transparent xs:text-4xl md:text-6xl">
              Jelajahi Alam Semesta
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-sm text-slate-200/95 sm:text-base md:text-lg">
              Temukan planet, galaksi, nebula, bintang, lubang hitam, dan berbagai
              objek luar angkasa menarik lainnya.
            </p>
            <div className="mb-8 flex w-full max-w-md flex-col justify-center gap-3 xs:mx-auto xs:max-w-none xs:flex-row xs:flex-wrap sm:mb-10">
              <a href="#catalog" className="btn-primary btn-lg w-full xs:w-auto">
                Mulai Jelajah
              </a>
              <a href="#about" className="btn-ghost btn-lg w-full xs:w-auto">
                Tentang Orbitra
              </a>
            </div>
            <div className="glass inline-flex gap-6 rounded-2xl px-6 py-4 sm:gap-8 sm:px-8">
              <div className="flex min-w-[3.5rem] flex-col sm:min-w-[4rem]">
                <strong className="text-xl font-bold text-white sm:text-2xl">
                  {ready ? stats.totalObjects : "—"}
                </strong>
                <span className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  Objek
                </span>
              </div>
              <div className="flex min-w-[3.5rem] flex-col sm:min-w-[4rem]">
                <strong className="text-xl font-bold text-white sm:text-2xl">
                  {ready ? stats.totalCategories : "—"}
                </strong>
                <span className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  Kategori
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 px-4 py-12 sm:py-16" id="featured">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <p className="section-eyebrow">Sorotan</p>
                <h2 className="section-title">Objek Unggulan</h2>
              </div>
              <a href="#catalog" className="text-sm text-slate-300 hover:text-indigo-200">
                Lihat semua →
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {featured.map((obj) => (
                <ObjectCard key={obj.id} obj={obj} />
              ))}
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 px-4 py-10" id="categories">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 sm:mb-8">
              <p className="section-eyebrow">Jelajahi menurut jenis</p>
              <h2 className="section-title">Kategori</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="glass flex min-h-[88px] flex-col items-start gap-2 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.14] sm:p-5"
                  onClick={() => {
                    setCategory(cat);
                    document.getElementById("catalog")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  <span className="text-sm font-medium text-white">{cat}</span>
                  <span className="text-xl font-bold text-indigo-300 sm:text-2xl">
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 px-4 py-12 sm:py-16" id="catalog">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 sm:mb-8">
              <p className="section-eyebrow">Katalog lengkap</p>
              <h2 className="section-title">Objek Terbaru</h2>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="glass flex min-h-[44px] w-full max-w-md flex-1 items-center gap-2 rounded-full px-4 py-2 focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-400/20">
                <span className="text-slate-400" aria-hidden="true">
                  ⌕
                </span>
                <input
                  type="search"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  placeholder="Cari objek…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <select
                className="glass min-h-[44px] w-full rounded-full px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50 sm:w-auto"
                aria-label="Filter berdasarkan kategori"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" className="bg-slate-900 text-white">
                  Semua kategori
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {catalog.map((obj) => (
                <ObjectCard key={obj.id} obj={obj} />
              ))}
            </div>
            {catalog.length === 0 && (
              <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
                Objek tidak ditemukan.
              </p>
            )}
          </div>
        </section>

        <section className="scroll-mt-20 px-4 py-12 sm:py-16" id="about">
          <div className="surface mx-auto max-w-4xl rounded-3xl p-6 text-center sm:p-8 md:p-12">
            <p className="section-eyebrow">Tentang Orbitra</p>
            <h2 className="section-title mb-4 text-white drop-shadow-sm">
              Katalog Luar Angkasa Modern
            </h2>
            <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-slate-100 md:text-lg">
              Orbitra adalah database interaktif untuk pecinta ruang angkasa, pendidik,
              dan siapa saja yang penasaran. Misi kami membuat misteri kosmos mudah
              diakses. Telusuri koleksi benda langit dan temukan data ilmiah detail
              tanpa perlu mendaftar.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
              <div className="surface-soft rounded-2xl p-5 transition hover:border-white/30 hover:bg-white/[0.12]">
                <h3 className="text-base font-semibold text-white drop-shadow-sm">
                  Jelajah & Cari
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  Temukan planet, bintang, galaksi, atau nebula dengan pencarian
                  langsung dan filter kategori yang responsif.
                </p>
              </div>
              <div className="surface-soft rounded-2xl p-5 transition hover:border-white/30 hover:bg-white/[0.12]">
                <h3 className="text-base font-semibold text-white drop-shadow-sm">
                  Data Detail
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  Akses data fisik seperti massa, diameter, gravitasi, suhu rata-rata,
                  dan jarak dari Bumi.
                </p>
              </div>
              <div className="surface-soft rounded-2xl p-5 transition hover:border-white/30 hover:bg-white/[0.12]">
                <h3 className="text-base font-semibold text-white drop-shadow-sm">
                  Kelola Katalog
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  Admin dapat menambah, mengedit, atau menghapus objek dari panel
                  kontrol agar katalog tetap mutakhir.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                "Katalog Benda Langit",
                "Pencarian Langsung",
                "Properti Fisik",
                "Ramah Seluler",
                "Panel Admin",
              ].map((t) => (
                <span
                  key={t}
                  className="glass rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-100 sm:px-4"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
