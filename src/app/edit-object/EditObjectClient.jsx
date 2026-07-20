"use client";

import { useSearchParams } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import ObjectForm from "@/components/ObjectForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EditObjectClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <ObjectForm mode="edit" objectId={id} />
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
}
