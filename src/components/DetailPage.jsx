"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PLACEHOLDER_IMAGE } from "@/lib/data";
import { apiGetObject } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DetailImage from "@/components/DetailImage";

export default function DetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { isAdmin, ready: authReady } = useAuth();
  const [obj, setObj] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!id) {
        setObj(null);
        setReady(true);
        return;
      }
      try {
        const item = await apiGetObject(id);
        if (!cancelled) setObj(item);
      } catch {
        if (!cancelled) setObj(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {!ready && (
          <p className="py-16 text-center text-sm text-slate-300">Loading…</p>
        )}

        {ready && !id && (
          <div className="detail-content-panel max-w-lg rounded-2xl p-6">
            <h1 className="mb-2 text-xl font-semibold text-white">
              No object selected
            </h1>
            <p className="mb-4 text-sm text-slate-200">
              Open a detail page with ?id=…
            </p>
            <Link href="/" className="btn-primary">
              Back Home
            </Link>
          </div>
        )}

        {ready && id && !obj && (
          <div className="detail-content-panel max-w-lg rounded-2xl p-6">
            <h1 className="mb-2 text-xl font-semibold text-white">
              Object not found
            </h1>
            <p className="mb-4 text-sm text-slate-200">No object with id: {id}</p>
            <Link href="/" className="btn-primary">
              Back Home
            </Link>
          </div>
        )}

        {ready && obj && (
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="detail-panel-enter detail-panel-enter--image">
              <DetailImage
                src={obj.imageUrl || PLACEHOLDER_IMAGE}
                alt={obj.name}
                category={obj.category}
              />
            </div>

            <div className="detail-panel-enter detail-panel-enter--content detail-content-panel rounded-3xl p-5 sm:p-7">
              <Link
                href="/#catalog"
                className="inline-flex text-sm font-medium text-indigo-200 transition hover:text-white"
              >
                ← Back to catalog
              </Link>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-300">
                {obj.category}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl">
                {obj.name}
              </h1>
              <p className="mt-2 text-base font-medium text-slate-100/95">
                {obj.scientificName}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Diameter", obj.diameter],
                  ["Mass", obj.mass],
                  ["Gravity", obj.gravity],
                  ["Temperature", obj.temperature],
                  ["Distance", obj.distance],
                  ["Year discovered", obj.yearDiscovered],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    className="detail-meta-card rounded-xl border border-white/20 bg-black/35 p-3.5 backdrop-blur-md"
                    style={{ animationDelay: `${0.15 + i * 0.05}s` }}
                  >
                    <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wide text-indigo-200/90">
                      {label}
                    </span>
                    <strong className="text-sm font-semibold leading-snug text-white">
                      {value || "—"}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-white/15 bg-black/30 p-4 backdrop-blur-md">
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-indigo-200/90">
                  Description
                </p>
                <p className="text-[0.95rem] leading-relaxed text-slate-50">
                  {obj.description}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/#catalog" className="btn-ghost">
                  Back to Catalog
                </Link>
                {authReady && isAdmin && (
                  <>
                    <Link
                      href={`/edit-object?id=${encodeURIComponent(obj.id)}`}
                      className="btn-primary"
                    >
                      Edit Object
                    </Link>
                    <Link href="/dashboard" className="btn-ghost">
                      Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
