import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="glass mt-6 border-x-0 border-b-0 py-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-slate-200 xs:flex-row xs:flex-wrap xs:items-center xs:justify-between sm:gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm text-white">
            Orbit<span className="text-indigo-300">ra</span>
          </strong>
          <span className="text-slate-300">· Jelajahi alam semesta</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/#catalog"
            className="text-slate-200 transition hover:text-white"
          >
            Katalog
          </Link>
          <Link
            href="/solar-system"
            className="text-slate-200 transition hover:text-white"
          >
            Tata Surya
          </Link>
          <Link
            href="/compare"
            className="text-slate-200 transition hover:text-white"
          >
            Bandingkan
          </Link>
          <Link
            href="/#about"
            className="text-slate-200 transition hover:text-white"
          >
            Tentang
          </Link>
          <Link
            href="/login"
            className="text-slate-200 transition hover:text-white"
          >
            Admin
          </Link>
        </div>
        <p className="m-0 text-slate-400" suppressHydrationWarning>
          &copy; {new Date().getFullYear()} Orbitra
        </p>
      </div>
    </footer>
  );
}
