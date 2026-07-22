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
    `inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full px-3 text-sm font-medium leading-none transition lg:px-3.5 ${
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
        className={`navbar-glass mx-auto grid h-14 max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border px-3 transition-all duration-300 sm:h-16 sm:gap-3 sm:px-5 ${
          scrolled
            ? "border-white/25 bg-white/15 shadow-glass-dark backdrop-blur-2xl"
            : "border-white/20 bg-white/[0.08] shadow-lg shadow-black/10 backdrop-blur-xl"
        }`}
      >
        {/* Logo — kiri, sejajar vertikal */}
        <Link
          href="/"
          className="inline-flex h-9 shrink-0 items-center text-lg font-bold leading-none tracking-tight text-white sm:text-xl"
        >
          Orbit<span className="text-indigo-300">ra</span>
        </Link>

        {/* Menu desktop — tengah, semua link sejajar */}
        <nav
          className="hidden min-w-0 items-center justify-center gap-0.5 md:flex lg:gap-1"
          aria-label="Navigasi utama"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.active)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Kanan: spacer seimbang di desktop / hamburger di mobile */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-end md:w-auto md:min-w-[4.5rem]">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-base leading-none text-white backdrop-blur-md transition hover:bg-white/15 md:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
          {/* Spacer agar logo & nav tetap seimbang di desktop */}
          <span
            className="pointer-events-none hidden select-none text-lg font-bold leading-none text-transparent sm:text-xl md:inline"
            aria-hidden="true"
          >
            Orbitra
          </span>
        </div>
      </div>

      {open && (
        <nav
          className="navbar-glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl border border-white/20 bg-white/10 p-2 shadow-glass-dark backdrop-blur-2xl md:hidden"
          aria-label="Navigasi seluler"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${linkClass(l.active)} h-11 w-full justify-center`}
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
