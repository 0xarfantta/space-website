import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/** @type {Record<string, string>} */
export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/**
 * @param {File} file
 * @returns {Promise<{ ok: true, url: string, filename: string } | { ok: false, error: string, status: number }>}
 */
export async function saveUploadedImage(file) {
  if (
    !file ||
    typeof file === "string" ||
    typeof file.arrayBuffer !== "function"
  ) {
    return { ok: false, error: "File gambar tidak ditemukan.", status: 400 };
  }

  const mime = String(file.type || "").toLowerCase();
  const ext = ALLOWED_IMAGE_TYPES[mime];
  if (!ext) {
    return {
      ok: false,
      error: "Hanya JPEG, PNG, WebP, atau GIF yang diizinkan.",
      status: 400,
    };
  }

  const size = typeof file.size === "number" ? file.size : 0;
  if (size <= 0) {
    return { ok: false, error: "File kosong.", status: 400 };
  }
  if (size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Gambar terlalu besar (maks ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB).`,
      status: 400,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Gambar terlalu besar (maks ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB).`,
      status: 400,
    };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const dest = path.join(UPLOAD_DIR, filename);
  await writeFile(dest, buffer);

  return {
    ok: true,
    url: `/uploads/${filename}`,
    filename,
  };
}
