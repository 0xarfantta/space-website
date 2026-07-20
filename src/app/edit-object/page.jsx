import { Suspense } from "react";
import EditObjectClient from "./EditObjectClient";

export const metadata = {
  title: "Edit Object — Orbitra",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-slate-400">Loading…</p>
      }
    >
      <EditObjectClient />
    </Suspense>
  );
}
