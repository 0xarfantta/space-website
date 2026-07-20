import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAdminCredentials,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth-server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username dan password wajib diisi." },
      { status: 400 }
    );
  }

  const admin = getAdminCredentials();
  if (username !== admin.username || password !== admin.password) {
    return NextResponse.json(
      { error: "Username atau password salah." },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    username: admin.username,
    role: "admin",
  });

  const session = {
    username: admin.username,
    role: "admin",
    loggedInAt: new Date().toISOString(),
  };

  const res = NextResponse.json({ ok: true, session });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
