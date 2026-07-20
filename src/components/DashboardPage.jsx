"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, PLACEHOLDER_IMAGE, SIDEBAR_KEY } from "@/lib/data";
import { useObjects } from "@/hooks/useObjects";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const { objects, stats, ready, remove, reset } = useObjects();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    if (mobile) {
      setCollapsed(true);
    } else {
      try {
        setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
      } catch {
        setCollapsed(false);
      }
    }
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      if (!window.matchMedia("(max-width: 768px)").matches) {
        try {
          localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...objects]
      .filter((obj) => {
        if (!q) return true;
        return `${obj.name} ${obj.scientificName} ${obj.category}`
          .toLowerCase()
          .includes(q);
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
  }, [objects, query]);

  function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    remove(id);
  }

  function handleReset() {
    if (
      !confirm(
        "Reset all objects to default seed data? Custom objects will be lost."
      )
    ) {
      return;
    }
    reset();
  }

  const navItems = [
    { href: "#statistics", label: "Dashboard", icon: "▦" },
    { href: "#objects", label: "Objects", icon: "◎" },
    { href: "#categories", label: "Categories", icon: "◈" },
    { href: "#settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <div className="admin-shell relative flex">
      {/* Mobile scrim */}
      {!collapsed && (
        <button
          type="button"
          className="fixed inset-0 z-[205] bg-black/60 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-[210] flex w-[min(280px,85vw)] flex-col p-4 transition-transform md:static md:z-auto md:w-64 md:translate-x-0 ${
          collapsed ? "-translate-x-full md:w-[72px]" : "translate-x-0"
        }`}
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div
          className={`mb-8 flex items-center gap-2 ${
            collapsed ? "md:flex-col" : "justify-between"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <span aria-hidden="true">🪐</span>
            {!collapsed && (
              <span className="md:inline">
                Orbit<span className="text-indigo-300">ra</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            className="admin-icon-btn hidden md:inline-flex"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              title={item.label}
              className="admin-nav-link"
              onClick={() => {
                if (window.matchMedia("(max-width: 768px)").matches) {
                  setCollapsed(true);
                }
              }}
            >
              <span className="w-6 text-center text-indigo-200">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
          <Link href="/" title="Back to Home" className="admin-nav-link">
            <span className="w-6 text-center text-indigo-200">←</span>
            {!collapsed && <span>Back to Home</span>}
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1 p-3 sm:p-4 md:p-6">
        <header className="admin-panel mb-6 flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="admin-icon-btn md:hidden"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div className="min-w-0">
              <h1 className="admin-title truncate text-lg sm:text-xl">
                Dashboard
              </h1>
              <p className="admin-faint mt-0.5 hidden sm:block">
                Overview of your catalog
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-indigo-300/40 bg-indigo-500/25 px-3 py-1 text-xs font-semibold text-indigo-100">
              {session?.username || "admin"}
            </span>
            <Link href="/add-object" className="btn-primary btn-sm">
              + Add
            </Link>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats */}
        <section id="statistics" className="mb-6 scroll-mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Objects", value: ready ? stats.totalObjects : "—" },
              {
                label: "Categories",
                value: ready ? stats.totalCategories : "—",
              },
              {
                label: "Latest Object",
                value: stats.latestObject?.name || "—",
                small: true,
              },
              {
                label: "Top Category",
                value: stats.topCategory
                  ? `${stats.topCategory.name} (${stats.topCategory.count})`
                  : "—",
                small: true,
              },
            ].map((s) => (
              <article
                key={s.label}
                className="admin-panel p-4 transition hover:bg-slate-900/95 sm:p-5"
              >
                <p className="admin-faint mb-2 font-semibold uppercase tracking-wide">
                  {s.label}
                </p>
                <p
                  className={`font-bold tracking-tight text-white ${
                    s.small ? "text-base sm:text-lg" : "text-2xl sm:text-3xl"
                  }`}
                >
                  {s.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Objects table */}
        <section id="objects" className="mb-6 scroll-mt-6">
          <div className="admin-panel p-3 sm:p-4 md:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="admin-title text-lg">All Objects</h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="admin-search">
                  <span className="text-slate-300" aria-hidden="true">
                    ⌕
                  </span>
                  <input
                    type="search"
                    className="w-full min-w-0 bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-400 sm:w-44"
                    placeholder="Search…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Link href="/add-object" className="btn-ghost btn-sm">
                  Add
                </Link>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="admin-table-head">
                    <th className="px-3 py-3">Object</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Distance</th>
                    <th className="px-3 py-3">Year</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((obj) => (
                    <tr
                      key={obj.id}
                      className="border-b border-white/10 transition hover:bg-white/5"
                    >
                      <td className="admin-table-cell">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={obj.imageUrl || PLACEHOLDER_IMAGE}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/20"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div>
                            <Link
                              href={`/detail?id=${encodeURIComponent(obj.id)}`}
                              className="font-semibold text-white hover:text-indigo-200"
                            >
                              {obj.name}
                            </Link>
                            <p className="admin-faint mt-0.5">
                              {obj.scientificName || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="admin-table-cell">
                        <span className="badge">{obj.category}</span>
                      </td>
                      <td className="admin-table-cell text-slate-200">
                        {obj.distance || "—"}
                      </td>
                      <td className="admin-table-cell text-slate-200">
                        {obj.yearDiscovered || "—"}
                      </td>
                      <td className="admin-table-cell text-right">
                        <Link
                          href={`/edit-object?id=${encodeURIComponent(obj.id)}`}
                          className="btn-ghost btn-sm mr-1"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete(obj.id, obj.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((obj) => (
                <div key={obj.id} className="admin-panel-soft p-4">
                  <div className="mb-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={obj.imageUrl || PLACEHOLDER_IMAGE}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/20"
                    />
                    <div>
                      <Link
                        href={`/detail?id=${encodeURIComponent(obj.id)}`}
                        className="font-semibold text-white"
                      >
                        {obj.name}
                      </Link>
                      <p className="admin-faint mt-0.5">{obj.category}</p>
                    </div>
                  </div>
                  <div className="mb-3 space-y-1 text-sm text-slate-200">
                    <p>Distance: {obj.distance || "—"}</p>
                    <p>Year: {obj.yearDiscovered || "—"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/edit-object?id=${encodeURIComponent(obj.id)}`}
                      className="btn-ghost btn-sm flex-1"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn-danger btn-sm flex-1"
                      onClick={() => handleDelete(obj.id, obj.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm font-medium text-slate-300">
                No objects found.
              </p>
            )}
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="mb-6 scroll-mt-6">
          <div className="admin-panel p-4 sm:p-5">
            <h2 className="admin-title mb-4 text-lg">Categories</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="admin-chip">
                  <span className="text-slate-100">{cat}</span>
                  <strong className="text-indigo-300">
                    {stats.categoryCount?.[cat] || 0}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Settings */}
        <section id="settings" className="scroll-mt-6 pb-8">
          <div className="admin-panel max-w-md p-4 sm:p-5">
            <h2 className="admin-title mb-2 text-lg">Settings</h2>
            <p className="admin-subtitle mb-4">
              Reset catalog data to the default seed objects.
            </p>
            <button type="button" className="btn-ghost" onClick={handleReset}>
              Reset to seed data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
