"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, PLACEHOLDER_IMAGE } from "@/lib/data";
import {
  createObject,
  getById,
  initStorage,
  updateObject,
} from "@/lib/storage";

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

  useEffect(() => {
    // Ensure seed catalog exists before lookup (direct deep-link to edit)
    initStorage();

    if (mode !== "edit" || !objectId) {
      setReady(true);
      return;
    }

    const obj = getById(objectId);
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
  }, [mode, objectId]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.scientificName.trim()) next.scientificName = "Scientific name is required";
    if (!form.category) next.category = "Category is required";
    if (!form.description.trim()) next.description = "Description is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

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
      updateObject(objectId, payload);
      router.push(`/detail?id=${encodeURIComponent(objectId)}`);
    } else {
      createObject(payload);
      router.push("/dashboard");
    }
  }

  if (!ready) {
    return (
      <p className="py-16 text-center text-sm font-medium text-slate-200">
        Loading form…
      </p>
    );
  }

  if (missing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="admin-panel rounded-2xl p-6">
          <h1 className="admin-title mb-2 text-xl">Object not found</h1>
          <p className="admin-subtitle mb-4">No object with id: {objectId}</p>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
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
            {mode === "edit" ? "Edit Object" : "Add Object"}
          </h1>
          <Link href="/dashboard" className="btn-ghost btn-sm">
            Cancel
          </Link>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="admin-label">
              <span>Name *</span>
              <input
                className="admin-input"
                name="name"
                value={form.name}
                onChange={onChange}
              />
              {errors.name && (
                <em className="text-xs not-italic text-red-300">{errors.name}</em>
              )}
            </label>
            <label className="admin-label">
              <span>Scientific Name *</span>
              <input
                className="admin-input"
                name="scientificName"
                value={form.scientificName}
                onChange={onChange}
              />
              {errors.scientificName && (
                <em className="text-xs not-italic text-red-300">
                  {errors.scientificName}
                </em>
              )}
            </label>
            <label className="admin-label">
              <span>Category *</span>
              <select
                className="admin-input"
                name="category"
                value={form.category}
                onChange={onChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-label">
              <span>Year Discovered</span>
              <input
                className="admin-input"
                name="yearDiscovered"
                value={form.yearDiscovered}
                onChange={onChange}
              />
            </label>
            <label className="admin-label">
              <span>Diameter</span>
              <input
                className="admin-input"
                name="diameter"
                value={form.diameter}
                onChange={onChange}
              />
            </label>
            <label className="admin-label">
              <span>Mass</span>
              <input
                className="admin-input"
                name="mass"
                value={form.mass}
                onChange={onChange}
              />
            </label>
            <label className="admin-label">
              <span>Gravity</span>
              <input
                className="admin-input"
                name="gravity"
                value={form.gravity}
                onChange={onChange}
              />
            </label>
            <label className="admin-label">
              <span>Temperature</span>
              <input
                className="admin-input"
                name="temperature"
                value={form.temperature}
                onChange={onChange}
              />
            </label>
            <label className="admin-label md:col-span-2">
              <span>Distance</span>
              <input
                className="admin-input"
                name="distance"
                value={form.distance}
                onChange={onChange}
              />
            </label>
            <label className="admin-label md:col-span-2">
              <span>Image URL</span>
              <input
                className="admin-input"
                name="imageUrl"
                value={form.imageUrl}
                onChange={onChange}
              />
            </label>
            <div className="admin-label md:col-span-2">
              <span>Image Preview</span>
              <div className="aspect-video max-h-56 overflow-hidden rounded-2xl border border-white/20 bg-black/50">
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
            <label className="admin-label md:col-span-2">
              <span>Description *</span>
              <textarea
                className="admin-input min-h-[120px] resize-y"
                name="description"
                rows={5}
                value={form.description}
                onChange={onChange}
              />
              {errors.description && (
                <em className="text-xs not-italic text-red-300">
                  {errors.description}
                </em>
              )}
            </label>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Link href="/dashboard" className="btn-ghost">
              Cancel
            </Link>
            <button type="submit" className="btn-primary">
              {mode === "edit" ? "Save Changes" : "Save Object"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
