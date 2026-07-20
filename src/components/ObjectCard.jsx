"use client";

import Link from "next/link";
import { PLACEHOLDER_IMAGE } from "@/lib/data";

export default function ObjectCard({ obj }) {
  const img = obj.imageUrl || PLACEHOLDER_IMAGE;

  return (
    <article className="group glass card-glass flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1.5 hover:border-white/40 hover:bg-white/[0.14]">
      <Link
        href={`/detail?id=${encodeURIComponent(obj.id)}`}
        className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-indigo-950/80 to-violet-950/80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={obj.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="badge w-fit">{obj.category}</span>
        <h3 className="text-base font-semibold text-white sm:text-lg">
          <Link
            href={`/detail?id=${encodeURIComponent(obj.id)}`}
            className="transition hover:text-indigo-200"
          >
            {obj.name}
          </Link>
        </h3>
        <p className="flex-1 text-sm text-slate-300">{obj.distance || "—"}</p>
        <Link
          href={`/detail?id=${encodeURIComponent(obj.id)}`}
          className="btn-ghost btn-sm mt-1 w-fit"
        >
          Detail
        </Link>
      </div>
    </article>
  );
}
