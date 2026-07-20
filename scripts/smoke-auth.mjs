const base = process.env.BASE || "http://localhost:3011";

const loginRes = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "admin", password: "orbitra123" }),
});

const loginBody = await loginRes.json();
const cookie = loginRes.headers.getSetCookie?.()?.join("; ") || "";

console.log("login", loginRes.status, loginBody);

const sessionRes = await fetch(`${base}/api/auth/session`, {
  headers: cookie ? { Cookie: cookie.split(";")[0] } : {},
});
// Node fetch may not expose set-cookie easily; parse manually
const setCookie = loginRes.headers.get("set-cookie") || "";
const tokenMatch = setCookie.match(/orbitra_session=([^;]+)/);
const sessionRes2 = await fetch(`${base}/api/auth/session`, {
  headers: tokenMatch
    ? { Cookie: `orbitra_session=${tokenMatch[1]}` }
    : {},
});
console.log("session", sessionRes2.status, await sessionRes2.json());
