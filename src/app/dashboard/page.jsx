import AdminGuard from "@/components/AdminGuard";
import DashboardPage from "@/components/DashboardPage";

export const metadata = {
  title: "Dasbor Admin — Orbitra",
  description: "Pengelolaan objek luar angkasa khusus admin.",
};

export default function Page() {
  return (
    <AdminGuard>
      <DashboardPage />
    </AdminGuard>
  );
}
