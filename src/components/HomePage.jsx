"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/data";
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
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return counts;
  }, [objects]);

  const catalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...objects]
      .filter((obj) => {
        const matchCat = !category || obj.category === category;
        const hay =
          `${obj.name} ${obj.scientificName} ${obj.category} ${obj.description}`.toLowerCase();
        return matchCat && (!q || hay.includes(q));
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [objects, query, category]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="flex min-h-[min(100dvh,900px)] items-center px-4 py-12 sm:py-16 md:min-h-[calc(100vh-72px)] md:py-20">
          <div className="mx-auto max-w-3xl animate-fade-up text-center">
            <h1 className="mb-4 bg-title-gradient bg-clip-text text-3xl font-bold tracking-tight text-transparent xs:text-4xl md:text-6xl">
              Explore The Universe
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-sm text-slate-200/95 sm:text-base md:text-lg">
              Discover planets, galaxies, nebulae, stars, black holes, and many other
              fascinating celestial objects.
            </p>
            <div className="mb-8 flex w-full max-w-md flex-col justify-center gap-3 xs:mx-auto xs:max-w-none xs:flex-row xs:flex-wrap sm:mb-10">
              <a href="#catalog" className="btn-primary btn-lg w-full xs:w-auto">
                Explore Now
              </a>
              <a href="#about" className="btn-ghost btn-lg w-full xs:w-auto">
                About Orbitra
              </a>
            </div>
            <div className="glass inline-flex gap-6 rounded-2xl px-6 py-4 sm:gap-8 sm:px-8">
              <div className="flex min-w-[3.5rem] flex-col sm:min-w-[4rem]">
                <strong className="text-xl font-bold text-white sm:text-2xl">
                  {ready ? stats.totalObjects : "—"}
                </strong>
                <span className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  Objects
                </span>
              </div>
              <div className="flex min-w-[3.5rem] flex-col sm:min-w-[4rem]">
                <strong className="text-xl font-bold text-white sm:text-2xl">
                  {ready ? stats.totalCategories : "—"}
                </strong>
                <span className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">
                  Categories
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="scroll-mt-20 px-4 py-12 sm:py-16" id="featured">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <p className="section-eyebrow">Highlights</p>
                <h2 className="section-title">Featured Objects</h2>
              </div>
              <a href="#catalog" className="text-sm text-slate-300 hover:text-indigo-200">
                View all →
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {featured.map((obj) => (
                <ObjectCard key={obj.id} obj={obj} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="scroll-mt-20 px-4 py-10" id="categories">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 sm:mb-8">
              <p className="section-eyebrow">Browse by type</p>
              <h2 className="section-title">Categories</h2>
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

        {/* Catalog */}
        <section className="scroll-mt-20 px-4 py-12 sm:py-16" id="catalog">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 sm:mb-8">
              <p className="section-eyebrow">Full catalog</p>
              <h2 className="section-title">Latest Objects</h2>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="glass flex min-h-[44px] w-full max-w-md flex-1 items-center gap-2 rounded-full px-4 py-2 focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-400/20">
                <span className="text-slate-400" aria-hidden="true">
                  ⌕
                </span>
                <input
                  type="search"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  placeholder="Search objects…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <select
                className="glass min-h-[44px] w-full rounded-full px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-400/50 sm:w-auto"
                aria-label="Filter by category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" className="bg-slate-900 text-white">
                  All categories
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
                No objects found.
              </p>
            )}
          </div>
        </section>

        {/* About */}
        <section className="scroll-mt-20 px-4 py-12 sm:py-16" id="about">
          <div className="surface mx-auto max-w-4xl rounded-3xl p-6 text-center sm:p-8 md:p-12">
            <p className="section-eyebrow">About Orbitra</p>
            <h2 className="section-title mb-4 text-white drop-shadow-sm">A Modern Space Catalog</h2>
            <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-slate-100 md:text-lg">
              Orbitra is an interactive database designed for space enthusiasts, educators, and curious minds. 
              Our mission is to make the mysteries of the cosmos accessible to everyone. Browse through our extensive 
              collection of celestial bodies and discover detailed scientific measurements without any registration.
            </p>
            
            <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
              <div className="surface-soft rounded-2xl p-5 transition hover:border-white/30 hover:bg-white/[0.12]">
                <h3 className="text-base font-semibold text-white drop-shadow-sm">Explore & Search</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  Find specific planets, stars, galaxies, or nebulae instantly with our live search and responsive category filters.
                </p>
              </div>
              <div className="surface-soft rounded-2xl p-5 transition hover:border-white/30 hover:bg-white/[0.12]">
                <h3 className="text-base font-semibold text-white drop-shadow-sm">Detailed Metadata</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  Access rich physical data including mass, diameter, gravity, average temperatures, and distances from Earth.
                </p>
              </div>
              <div className="surface-soft rounded-2xl p-5 transition hover:border-white/30 hover:bg-white/[0.12]">
                <h3 className="text-base font-semibold text-white drop-shadow-sm">Manage Catalog</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  Admin users can easily add, edit, or delete objects directly from the secure control panel to keep the catalog fresh.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                "Celestial Catalog",
                "Real-time Search",
                "Physical Properties",
                "Mobile Friendly",
                "Admin Control Panel",
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
