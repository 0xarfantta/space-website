"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, PLACEHOLDER_IMAGE } from "@/lib/data";
import {
  apiCreateObject,
  apiGetObject,
  apiUpdateObject,
  apiUploadImage,
} from "@/lib/api";

const EMPTY = {
  name: "",
  scientificName: "",
  category: "Planet",
  diameter: "",
  mass: "",
  gravity: "",
  temperature: "",
  distance: "",
  yearDiscovered: "",
  imageUrl: "",
  description: "",
};

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_MB = 5;

export default function ObjectForm({ mode = "create", objectId = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const localPreviewRef = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [ready, setReady] = useState(mode === "create");
  const [missing, setMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /** Pending file from drive; uploaded on save */
  const [pendingFile, setPendingFile] = useState(null);
  const [localPreview, setLocalPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !objectId) {
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const obj = await apiGetObject(objectId);
        if (cancelled) return;
        if (!obj) {
          setMissing(true);
          setReady(true);
          return;
        }
        setForm({
          name: obj.name || "",
          scientificName: obj.scientificName || "",
          category: obj.category || "Planet",
          diameter: obj.diameter || "",
          mass: obj.mass || "",
          gravity: obj.gravity || "",
          temperature: obj.temperature || "",
          distance: obj.distance || "",
          yearDiscovered: obj.yearDiscovered || "",
          imageUrl: obj.imageUrl || "",
          description: obj.description || "",
        });
        setReady(true);
      } catch {
        if (!cancelled) {
          setMissing(true);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, objectId]);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
    };
  }, []);

  function clearPendingFile({ keepError = false } = {}) {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    setPendingFile(null);
    setLocalPreview("");
    setFileName("");
    if (!keepError) setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) {
      clearPendingFile();
      return;
    }

    const allowed = ACCEPT_IMAGES.split(",");
    if (!allowed.includes(file.type)) {
      clearPendingFile({ keepError: true });
      setFileError("Gunakan file JPEG, PNG, WebP, atau GIF.");
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      clearPendingFile({ keepError: true });
      setFileError(`Ukuran maksimal ${MAX_MB} MB.`);
      return;
    }

    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }
    const url = URL.createObjectURL(file);
    localPreviewRef.current = url;
    setPendingFile(file);
    setLocalPreview(url);
    setFileName(file.name);
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Nama wajib diisi";
    if (!form.scientificName.trim())
      next.scientificName = "Nama ilmiah wajib diisi";
    if (!form.category) next.category = "Kategori wajib diisi";
    if (!form.description.trim()) next.description = "Deskripsi wajib diisi";

    // Image only via drive upload — no URL field
    if (mode === "create" && !pendingFile) {
      next.image = "Silakan upload gambar dari drive.";
    }
    if (mode === "edit" && !pendingFile && !form.imageUrl) {
      next.image = "Silakan upload gambar dari drive.";
    }

    setErrors(next);
    if (next.image) setFileError(next.image);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");
    setFileError("");

    try {
      // Keep existing path on edit unless a new file is uploaded
      let imageUrl = form.imageUrl || "";

      if (pendingFile) {
        imageUrl = await apiUploadImage(pendingFile);
      }

      const payload = {
        name: form.name.trim(),
        scientificName: form.scientificName.trim(),
        category: form.category,
        diameter: form.diameter.trim(),
        mass: form.mass.trim(),
        gravity: form.gravity.trim(),
        temperature: form.temperature.trim(),
        distance: form.distance.trim(),
        yearDiscovered: form.yearDiscovered.trim(),
        imageUrl,
        description: form.description.trim(),
      };

      if (mode === "edit" && objectId) {
        await apiUpdateObject(objectId, payload);
        router.push(`/detail?id=${encodeURIComponent(objectId)}`);
      } else {
        await apiCreateObject(payload);
        router.push("/dashboard");
      }
    } catch (err) {
      setSubmitError(err.message || "Gagal menyimpan");
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <p className="py-16 text-center text-sm font-medium text-slate-200">
        Memuat formulir…
      </p>
    );
  }

  if (missing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="admin-panel rounded-2xl p-6">
          <h1 className="admin-title mb-2 text-xl">Objek tidak ditemukan</h1>
          <p className="admin-subtitle mb-4">Tidak ada objek dengan id: {objectId}</p>
          <Link href="/dashboard" className="btn-primary">
            Kembali ke Dasbor
          </Link>
        </div>
      </div>
    );
  }

  const preview = localPreview || form.imageUrl || PLACEHOLDER_IMAGE;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="admin-panel rounded-3xl p-4 sm:p-5 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="admin-title text-xl sm:text-2xl">
            {mode === "edit" ? "Ubah Objek" : "Tambah Objek"}
          </h1>
          <Link href="/dashboard" className="btn-ghost btn-sm">
            Batal
          </Link>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="admin-label">
              <span>Nama *</span>
              <input
                className="admin-input"
                name="name"
                value={form.name}
                onChange={onChange}
                disabled={submitting}
              />
              {errors.name && (
                <em className="text-xs not-italic text-red-300">{errors.name}</em>
              )}
            </label>
            <label className="admin-label">
              <span>Nama Ilmiah *</span>
              <input
                className="admin-input"
                name="scientificName"
                value={form.scientificName}
                onChange={onChange}
                disabled={submitting}
              />
              {errors.scientificName && (
                <em className="text-xs not-italic text-red-300">
                  {errors.scientificName}
                </em>
              )}
            </label>
            <label className="admin-label">
              <span>Kategori *</span>
              <select
                className="admin-input"
                name="category"
                value={form.category}
                onChange={onChange}
                disabled={submitting}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-label">
              <span>Tahun Ditemukan</span>
              <input
                className="admin-input"
                name="yearDiscovered"
                value={form.yearDiscovered}
                onChange={onChange}
                disabled={submitting}
              />
            </label>
            <label className="admin-label">
              <span>Diameter</span>
              <input
                className="admin-input"
                name="diameter"
                value={form.diameter}
                onChange={onChange}
                disabled={submitting}
              />
            </label>
            <label className="admin-label">
              <span>Massa</span>
              <input
                className="admin-input"
                name="mass"
                value={form.mass}
                onChange={onChange}
                disabled={submitting}
              />
            </label>
            <label className="admin-label">
              <span>Gravitasi</span>
              <input
                className="admin-input"
                name="gravity"
                value={form.gravity}
                onChange={onChange}
                disabled={submitting}
              />
            </label>
            <label className="admin-label">
              <span>Suhu</span>
              <input
                className="admin-input"
                name="temperature"
                value={form.temperature}
                onChange={onChange}
                disabled={submitting}
              />
            </label>
            <label className="admin-label md:col-span-2">
              <span>Jarak</span>
              <input
                className="admin-input"
                name="distance"
                value={form.distance}
                onChange={onChange}
                disabled={submitting}
              />
            </label>

            {/* Image: upload from local drive only (no URL) */}
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm font-medium text-slate-100">
                Gambar objek *{" "}
                <span className="font-normal text-slate-400">
                  (upload dari drive — bukan URL)
                </span>
              </p>

              {/* Hidden native picker — opened by the drop zone / button */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_IMAGES}
                className="hidden"
                onChange={onFileChange}
                disabled={submitting}
                aria-hidden="true"
                tabIndex={-1}
              />

              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!submitting) fileInputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!submitting) fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (submitting) return;
                  const file = e.dataTransfer?.files?.[0];
                  if (!file || !fileInputRef.current) return;
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  fileInputRef.current.files = dt.files;
                  onFileChange({ target: fileInputRef.current });
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                  pendingFile
                    ? "border-indigo-400/60 bg-indigo-500/15"
                    : "border-white/30 bg-black/40 hover:border-indigo-400/50 hover:bg-white/5"
                } ${submitting ? "pointer-events-none opacity-60" : ""}`}
              >
                <span className="text-3xl" aria-hidden="true">
                  📁
                </span>
                <div>
                  <p className="text-base font-semibold text-white">
                    {pendingFile
                      ? "Ganti foto dari drive"
                      : "Pilih foto dari drive"}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Klik area ini atau seret & lepas gambar · JPEG, PNG, WebP,
                    GIF · max {MAX_MB} MB
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-primary btn-sm pointer-events-none"
                  tabIndex={-1}
                >
                  {pendingFile ? "Ganti foto" : "Unggah dari drive"}
                </button>

                {fileName && (
                  <p className="max-w-full truncate text-xs text-indigo-200">
                    File: {fileName}
                  </p>
                )}
                {!fileName && form.imageUrl && mode === "edit" && (
                  <p className="text-xs text-slate-400">
                    Gambar saat ini akan tetap dipakai kecuali Anda pilih file
                    baru.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={submitting}
                  onClick={() => fileInputRef.current?.click()}
                >
                  📷 Upload foto dari drive
                </button>
                {pendingFile && (
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPendingFile();
                    }}
                    disabled={submitting}
                  >
                    Hapus file terpilih
                  </button>
                )}
              </div>

              {(fileError || errors.image) && (
                <p className="rounded-xl border border-red-400/40 bg-red-500/20 px-3 py-2 text-sm text-red-100">
                  {fileError || errors.image}
                </p>
              )}

              <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/50">
                <p className="border-b border-white/10 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Pratinjau
                </p>
                <div className="aspect-video max-h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>
              </div>
            </div>
            <label className="admin-label md:col-span-2">
              <span>Deskripsi *</span>
              <textarea
                className="admin-input min-h-[120px] resize-y"
                name="description"
                rows={5}
                value={form.description}
                onChange={onChange}
                disabled={submitting}
              />
              {errors.description && (
                <em className="text-xs not-italic text-red-300">
                  {errors.description}
                </em>
              )}
            </label>
          </div>

          {submitError && (
            <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/20 px-3 py-2 text-sm text-red-100">
              {submitError}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Link href="/dashboard" className="btn-ghost">
              Batal
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting
                ? pendingFile
                  ? "Mengunggah & menyimpan…"
                  : "Menyimpan…"
                : mode === "edit"
                  ? "Simpan Perubahan"
                  : "Simpan Objek"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
