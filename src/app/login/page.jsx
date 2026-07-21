import { Suspense } from "react";
import LoginPage from "@/components/LoginPage";

export const metadata = {
  title: "Login Admin — Orbitra",
  description: "Masuk untuk mengelola katalog Orbitra.",
};

function LoginFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <p className="text-sm text-slate-400">Memuat login…</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPage />
    </Suspense>
  );
}
