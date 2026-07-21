import { Suspense } from "react";
import EditObjectClient from "./EditObjectClient";

export const metadata = {
  title: "Ubah Objek — Orbitra",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-slate-400">Memuat…</p>
      }
    >
      <EditObjectClient />
    </Suspense>
  );
}
