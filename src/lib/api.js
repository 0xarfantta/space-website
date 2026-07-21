/**
 * Browser-side helpers for Orbitra REST API.
 */

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGetObjects() {
  const res = await fetch("/api/objects", { cache: "no-store" });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || "Gagal memuat objek");
  }
  return data;
}

export async function apiGetObject(id) {
  const res = await fetch(`/api/objects/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  const data = await parseJson(res);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(data?.error || "Gagal memuat objek");
  }
  return data.object;
}

export async function apiCreateObject(payload) {
  const res = await fetch("/api/objects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || "Gagal membuat objek");
  }
  return data.object;
}

export async function apiUpdateObject(id, payload) {
  const res = await fetch(`/api/objects/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || "Gagal memperbarui objek");
  }
  return data.object;
}

export async function apiDeleteObject(id) {
  const res = await fetch(`/api/objects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || "Gagal menghapus objek");
  }
  return true;
}

export async function apiResetObjects() {
  const res = await fetch("/api/objects/reset", { method: "POST" });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.error || "Gagal mereset katalog");
  }
  return data;
}

export async function apiLogin(username, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    return { ok: false, error: data?.error || "Login gagal." };
  }
  return { ok: true, session: data.session };
}

export async function apiLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function apiGetSession() {
  const res = await fetch("/api/auth/session", { cache: "no-store" });
  const data = await parseJson(res);
  if (!res.ok) return null;
  return data.session || null;
}
