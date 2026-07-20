/**
 * Client-facing auth notes.
 * Real auth is handled by the API:
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/session
 * Session = httpOnly cookie (JWT). See src/lib/auth-server.js
 */

export const AUTH_SESSION_COOKIE = "orbitra_session";
