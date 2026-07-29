
export default function Footer() {
  return (
    <footer
      className="glass mt-6 border-x-0 border-b-0 py-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 text-center text-xs text-slate-200">
        <div className="flex items-center justify-center gap-2">
          <strong className="text-sm text-white">
            Orbit<span className="text-indigo-300">ra</span>
          </strong>
          <span className="text-slate-300">· Jelajahi alam semesta</span>
        </div>
        <p className="m-0 text-slate-400" suppressHydrationWarning>
          &copy; {new Date().getFullYear()} Orbitra
        </p>
      </div>
    </footer>
  );
}
