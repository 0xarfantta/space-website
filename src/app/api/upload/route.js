import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { saveUploadedImage } from "@/lib/upload-server";

export const runtime = "nodejs";

/**
 * POST /api/upload
 * multipart/form-data field: "file"
 * Admin only. Saves under public/uploads and returns { url: "/uploads/..." }
 */
export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Data form tidak valid." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const result = await saveUploadedImage(file);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      url: result.url,
      filename: result.filename,
    },
    { status: 201 }
  );
}
