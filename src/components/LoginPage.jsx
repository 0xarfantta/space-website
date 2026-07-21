"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Only allow same-origin relative paths (blocks open redirects like //evil.com).
 */
function safeNextPath(raw) {
  if (!raw || typeof raw !== "string") return "/dashboard";
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  if (path.includes("://") || path.includes("\\")) return "/dashboard";
  return path;
}

export default function LoginPage() {
  const { isAdmin, ready, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const formId = useId();
  const usernameId = `${formId}-username`;
  const passwordId = `${formId}-password`;
  const errorId = `${formId}-error`;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && isAdmin) {
      router.replace(nextPath);
    }
  }, [ready, isAdmin, router, nextPath]);

  function validate() {
    const next = {};
    if (!username.trim()) next.username = "Username wajib diisi.";
    if (!password) next.password = "Password wajib diisi.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await login(username, password);
      if (!result.ok) {
        setError(result.error || "Login gagal. Coba lagi.");
        setSubmitting(false);
        return;
      }
      router.replace(nextPath);
    } catch {
      setError("Login gagal. Coba lagi.");
      setSubmitting(false);
    }
  }

  if (ready && isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <p className="glass rounded-xl px-4 py-3 text-sm font-medium text-white">
            Redirecting to dashboard…
          </p>
        </main>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <p className="glass rounded-xl px-4 py-3 text-sm font-medium text-white">
            Loading…
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md animate-fade-up">
          <div className="admin-panel relative overflow-hidden rounded-3xl p-5 sm:p-6 md:p-8">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/25 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-black/40 text-xl shadow-inner"
                  aria-hidden="true"
                >
                  🪐
                </span>
                <div>
                  <p className="section-eyebrow mb-0">Admin only</p>
                  <h1 className="admin-title text-xl sm:text-2xl">Admin Login</h1>
                </div>
              </div>

              <p className="admin-subtitle">
                Kelola katalog objek luar angkasa — tambah, edit, dan hapus.
                Pengunjung bisa menjelajah tanpa login.
              </p>

              <form
                className="mt-6 space-y-4"
                onSubmit={onSubmit}
                noValidate
                aria-describedby={error ? errorId : undefined}
              >
                <label className="admin-label" htmlFor={usernameId}>
                  <span>Username</span>
                  <input
                    id={usernameId}
                    className={`admin-input ${
                      fieldErrors.username
                        ? "border-red-400/60 focus:border-red-400/70 focus:ring-red-400/20"
                        : ""
                    }`}
                    name="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (fieldErrors.username) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          username: undefined,
                        }));
                      }
                      if (error) setError("");
                    }}
                    placeholder="admin"
                    disabled={submitting}
                    aria-invalid={Boolean(fieldErrors.username)}
                    aria-describedby={
                      fieldErrors.username ? `${usernameId}-err` : undefined
                    }
                  />
                  {fieldErrors.username && (
                    <span id={`${usernameId}-err`} className="text-xs text-red-300">
                      {fieldErrors.username}
                    </span>
                  )}
                </label>

                <label className="admin-label" htmlFor={passwordId}>
                  <span>Password</span>
                  <div className="relative">
                    <input
                      id={passwordId}
                      className={`admin-input pr-12 ${
                        fieldErrors.password
                          ? "border-red-400/60 focus:border-red-400/70 focus:ring-red-400/20"
                          : ""
                      }`}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            password: undefined,
                          }));
                        }
                        if (error) setError("");
                      }}
                      placeholder="••••••••"
                      disabled={submitting}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={
                        fieldErrors.password ? `${passwordId}-err` : undefined
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Sembunyikan password" : "Tampilkan password"
                      }
                    >
                      <span className="text-sm" aria-hidden="true">
                        {showPassword ? "🙈" : "👁"}
                      </span>
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span id={`${passwordId}-err`} className="text-xs text-red-300">
                      {fieldErrors.password}
                    </span>
                  )}
                </label>

                {error && (
                  <div
                    id={errorId}
                    role="alert"
                    className="rounded-xl border border-red-400/40 bg-red-500/20 px-3.5 py-2.5 text-sm font-medium text-red-100"
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 xs:flex-row xs:justify-end">
                  <Link
                    href="/"
                    className="btn-ghost w-full xs:w-auto"
                    tabIndex={submitting ? -1 : 0}
                  >
                    Back to Home
                  </Link>
                  <button
                    type="submit"
                    className="btn-primary min-w-[7.5rem] w-full xs:w-auto"
                    disabled={submitting}
                  >
                    {submitting ? "Signing in…" : "Sign in"}
                  </button>
                </div>
              </form>

              <p className="mt-6 border-t border-white/15 pt-4 text-center text-xs font-medium text-slate-300">
                Demo:{" "}
                <code className="rounded bg-black/40 px-1.5 py-0.5 text-indigo-200">
                  admin
                </code>{" "}
                /{" "}
                <code className="rounded bg-black/40 px-1.5 py-0.5 text-indigo-200">
                  orbitra123
                </code>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
