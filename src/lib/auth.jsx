/**
 * Orbitra admin auth (client-side demo).
 * Session disimpan di sessionStorage — hilang saat tab ditutup.
 *
 * Catatan: ini proteksi UI untuk demo frontend.
 * Untuk production, gunakan backend + autentikasi server.
 */

export const AUTH_SESSION_KEY = "orbitra_admin_session";

/** Kredensial default admin (ganti sesuai kebutuhan demo) */
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "orbitra123",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

/**
 * @returns {{ username: string, role: 'admin', loggedInAt: string } | null}
 */
export function getSession() {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.role === "admin" && parsed?.username) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getSession()?.role === "admin";
}

/**
 * @param {string} username
 * @param {string} password
 * @returns {{ ok: true, session: object } | { ok: false, error: string }}
 */
export function login(username, password) {
  const u = String(username || "").trim();
  const p = String(password || "");

  if (!u || !p) {
    return { ok: false, error: "Username dan password wajib diisi." };
  }

  if (
    u === ADMIN_CREDENTIALS.username &&
    p === ADMIN_CREDENTIALS.password
  ) {
    const session = {
      username: u,
      role: "admin",
      loggedInAt: new Date().toISOString(),
    };
    if (canUseStorage()) {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    }
    return { ok: true, session };
  }

  return { ok: false, error: "Username atau password salah." };
}

export function logout() {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}
