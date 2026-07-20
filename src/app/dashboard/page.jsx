import AdminGuard from "@/components/AdminGuard";
import DashboardPage from "@/components/DashboardPage";

export const metadata = {
  title: "Admin Dashboard — Orbitra",
  description: "Admin-only management of celestial objects.",
};

export default function Page() {
  return (
    <AdminGuard>
      <DashboardPage />
    </AdminGuard>
  );
}
