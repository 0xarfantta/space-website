import { Suspense } from "react";
import LoginPage from "@/components/LoginPage";

export const metadata = {
  title: "Admin Login — Orbitra",
  description: "Sign in to manage the Orbitra catalog.",
};

function LoginFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <p className="text-sm text-slate-400">Loading login…</p>
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
