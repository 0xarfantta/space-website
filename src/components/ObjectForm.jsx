"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, PLACEHOLDER_IMAGE } from "@/lib/data";
import {
  apiCreateObject,
  apiGetObject,
  apiUpdateObject,
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

export default function ObjectForm({ mode = "create", objectId = null }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [ready, setReady] = useState(mode === "create");
  const [missing, setMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
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
        imageUrl: form.imageUrl.trim(),
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
          <p className="admin-subtitle mb-4">
            Tidak ada objek dengan id: {objectId}
          </p>
          <Link href="/dashboard" className="btn-primary">
            Kembali ke Dasbor
          </Link>
        </div>
      </div>
    );
  }

  const preview = form.imageUrl || PLACEHOLDER_IMAGE;

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

            <div className="md:col-span-2 space-y-3">
              <label className="admin-label">
                <span>URL gambar</span>
                <input
                  className="admin-input"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={onChange}
                  placeholder="https://…"
                  disabled={submitting}
                />
              </label>

              <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/50">
                <p className="border-b border-white/10 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Pratinjau
                </p>
                <div className="aspect-video max-h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Pratinjau"
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
                ? "Menyimpan…"
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
