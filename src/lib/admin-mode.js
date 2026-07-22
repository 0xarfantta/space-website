/**
 * Admin UI mode (sessionStorage) — terpisah dari cookie login JWT.
 *
 * Cookie JWT = otentikasi server (API / requireAdmin).
 * Admin mode  = admin sedang di area kelola; dihapus saat buka situs publik
 * agar tombol/route edit tidak “nempel” di halaman pengunjung.
 */

export const ADMIN_MODE_KEY = "orbitra_admin_mode";

/** Path yang termasuk area admin (boleh tetap dalam mode admin). */
export const ADMIN_PATH_PREFIXES = [
  "/dashboard",
  "/add-object",
  "/edit-object",
  "/login",
];

export function isAdminPath(pathname) {
  if (!pathname) return false;
  return ADMIN_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function getAdminMode() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ADMIN_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAdminMode(on = true) {
  if (typeof window === "undefined") return;
  try {
    if (on) sessionStorage.setItem(ADMIN_MODE_KEY, "1");
    else sessionStorage.removeItem(ADMIN_MODE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAdminMode() {
  setAdminMode(false);
}
