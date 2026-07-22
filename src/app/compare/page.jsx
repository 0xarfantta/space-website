import { Suspense } from "react";
import ComparePage from "@/components/ComparePage";

export const metadata = {
  title: "Bandingkan Objek — Orbitra",
  description:
    "Bandingkan dua objek luar angkasa berdampingan: diameter, massa, gravitasi, dan lainnya.",
};

function Fallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <p className="text-sm text-slate-400">Memuat perbandingan…</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      <ComparePage />
    </Suspense>
  );
}
