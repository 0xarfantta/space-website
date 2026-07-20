import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "orbitra_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET || "orbitra-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "orbitra123",
  };
}

/**
 * @param {{ username: string, role: string }} payload
 */
export async function createSessionToken(payload) {
  return new SignJWT({
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/**
 * @param {string} token
 * @returns {Promise<{ username: string, role: string } | null>}
 */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin" || !payload.username) return null;
    return {
      username: String(payload.username),
      role: "admin",
    };
  } catch {
    return null;
  }
}

/** Read session from request cookies (Route Handlers / Server Components). */
export async function getSessionFromCookies() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token || "");
}

export async function requireAdmin() {
  const session = await getSessionFromCookies();
  if (!session) {
    return { ok: false, session: null, error: "Unauthorized" };
  }
  return { ok: true, session, error: null };
}

export function sessionCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
