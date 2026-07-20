import { Suspense } from "react";
import DetailPage from "@/components/DetailPage";

export const metadata = {
  title: "Object Detail — Orbitra",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-slate-400">Loading…</p>
      }
    >
      <DetailPage />
    </Suspense>
  );
}
