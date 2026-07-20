import AdminGuard from "@/components/AdminGuard";
import ObjectForm from "@/components/ObjectForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Add Object — Orbitra",
};

export default function Page() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <ObjectForm mode="create" />
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
}
