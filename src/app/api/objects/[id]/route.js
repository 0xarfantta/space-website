import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import {
  deleteObject,
  getObjectById,
  updateObject,
} from "@/lib/objects-server";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const object = await getObjectById(id);
    if (!object) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ object });
  } catch (err) {
    console.error("[GET /api/objects/:id]", err);
    return NextResponse.json(
      { error: "Gagal memuat objek." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  const name = String(body?.name || "").trim();
  const scientificName = String(body?.scientificName || "").trim();
  const category = String(body?.category || "").trim();
  const description = String(body?.description || "").trim();

  if (!name || !scientificName || !category || !description) {
    return NextResponse.json(
      {
        error: "Nama, nama ilmiah, kategori, dan deskripsi wajib diisi.",
      },
      { status: 400 }
    );
  }

  try {
    const object = await updateObject(id, {
      name,
      scientificName,
      category,
      diameter: String(body.diameter || "").trim(),
      mass: String(body.mass || "").trim(),
      gravity: String(body.gravity || "").trim(),
      temperature: String(body.temperature || "").trim(),
      distance: String(body.distance || "").trim(),
      yearDiscovered: String(body.yearDiscovered || "").trim(),
      imageUrl: String(body.imageUrl || "").trim(),
      description,
    });
    if (!object) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ object });
  } catch (err) {
    console.error("[PUT /api/objects/:id]", err);
    return NextResponse.json(
      { error: "Gagal memperbarui objek." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const ok = await deleteObject(id);
    if (!ok) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/objects/:id]", err);
    return NextResponse.json(
      { error: "Gagal menghapus objek." },
      { status: 500 }
    );
  }
}
