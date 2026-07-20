import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="glass mt-6 border-x-0 border-b-0 py-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-black xs:flex-row xs:flex-wrap xs:items-center xs:justify-between sm:gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm text-black">
            Orbit<span className="text-black">ra</span>
          </strong>
          <span className="text-black/80">· Explore the universe</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/#catalog" className="hover:text-black/70">
            Catalog
          </Link>
          <Link href="/#about" className="hover:text-black/70">
            About
          </Link>
        </div>
        <p className="m-0 opacity-75">&copy; {new Date().getFullYear()} Orbitra</p>
      </div>
    </footer>
  );
}
