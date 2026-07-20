import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import {
  createObject,
  getStats,
  listObjects,
} from "@/lib/objects-server";

export async function GET() {
  try {
    const objects = await listObjects();
    return NextResponse.json({
      objects,
      stats: getStats(objects),
    });
  } catch (err) {
    console.error("[GET /api/objects]", err);
    return NextResponse.json(
      { error: "Failed to load objects." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = String(body?.name || "").trim();
  const scientificName = String(body?.scientificName || "").trim();
  const category = String(body?.category || "").trim();
  const description = String(body?.description || "").trim();

  if (!name || !scientificName || !category || !description) {
    return NextResponse.json(
      {
        error:
          "name, scientificName, category, and description are required.",
      },
      { status: 400 }
    );
  }

  try {
    const object = await createObject({
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
    return NextResponse.json({ object }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/objects]", err);
    return NextResponse.json(
      { error: "Failed to create object." },
      { status: 500 }
    );
  }
}
