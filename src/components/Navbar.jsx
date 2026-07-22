"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  const linkClass = (active) =>
    `inline-flex min-h-[40px] items-center rounded-full px-3.5 py-2 text-sm font-medium transition lg:px-4 ${
      active
        ? "bg-white/15 text-white shadow-sm"
        : "text-slate-200/90 hover:bg-white/10 hover:text-white"
    }`;

  const links = [
    { href: "/", label: "Beranda", active: pathname === "/" },
    { href: "/#catalog", label: "Katalog", active: false },
    {
      href: "/solar-system",
      label: "Tata Surya",
      active: pathname === "/solar-system",
    },
    {
      href: "/compare",
      label: "Bandingkan",
      active: pathname === "/compare",
    },
    { href: "/#about", label: "Tentang", active: false },
  ];

  return (
    <header className="sticky top-0 z-[200] px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={`navbar-glass mx-auto flex h-14 max-w-5xl items-center rounded-2xl border px-3 transition-all duration-300 sm:h-16 sm:px-5 ${
          scrolled
            ? "border-white/25 bg-white/15 shadow-glass-dark backdrop-blur-2xl"
            : "border-white/20 bg-white/[0.08] shadow-lg shadow-black/10 backdrop-blur-xl"
        }`}
      >
        <Link
          href="/"
          className="relative z-10 shrink-0 text-lg font-bold tracking-tight text-white sm:text-xl"
        >
          Orbit<span className="text-indigo-300">ra</span>
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex lg:gap-1"
          aria-label="Navigasi utama"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.active)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center">
          <span className="pointer-events-none invisible hidden select-none text-lg font-bold sm:text-xl md:inline">
            Orbitra
          </span>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg text-white backdrop-blur-md transition hover:bg-white/15 md:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="navbar-glass mx-auto mt-2 flex max-w-5xl flex-col gap-1 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-glass-dark backdrop-blur-2xl md:hidden"
          aria-label="Navigasi seluler"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${linkClass(l.active)} w-full justify-center`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
