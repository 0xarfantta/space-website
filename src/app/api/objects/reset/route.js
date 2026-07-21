import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { getStats, resetToSeed } from "@/lib/objects-server";

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  try {
    const objects = await resetToSeed();
    return NextResponse.json({
      ok: true,
      objects,
      stats: getStats(objects),
    });
  } catch (err) {
    console.error("[POST /api/objects/reset]", err);
    return NextResponse.json(
      { error: "Gagal mereset katalog." },
      { status: 500 }
    );
  }
}
