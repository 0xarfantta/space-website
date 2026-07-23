"use client";

import Link from "next/link";
import { PLACEHOLDER_IMAGE } from "@/lib/data";

export default function ObjectCard({ obj }) {
  const img = obj.imageUrl || PLACEHOLDER_IMAGE;

  return (
    <article className="group card-glass flex flex-col">
      <Link
        href={`/detail?id=${encodeURIComponent(obj.id)}`}
        className="relative m-2.5 mb-0 block overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/20"
      >
        <div className="aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={obj.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>
        {/* Frosted glass reflection over image */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />
        <span className="badge absolute left-3 top-3 z-10 shadow-lg">
          {obj.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <h3 className="text-base font-semibold tracking-tight text-white drop-shadow-sm sm:text-lg">
          <Link
            href={`/detail?id=${encodeURIComponent(obj.id)}`}
            className="transition hover:text-white/90"
          >
            {obj.name}
          </Link>
        </h3>
        <p className="line-clamp-1 flex-1 text-sm text-white/70">
          {obj.distance || "—"}
        </p>
        <Link
          href={`/detail?id=${encodeURIComponent(obj.id)}`}
          className="mt-1 inline-flex min-h-[40px] w-fit items-center justify-center rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium text-white shadow-inner backdrop-blur-md transition hover:border-white/50 hover:bg-white/25"
        >
          Lihat Detail
        </Link>
      </div>
    </article>
  );
}
