import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, signSessionToken, sessionMaxAgeSeconds } from "@/app/lib/adminSession";
import { adminAuthConfigured, verifyAdminCredentials } from "@/app/lib/adminCredentials";

export async function POST(req: NextRequest) {
  if (!adminAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Authentification non configurée : définir AUTH_SECRET (ou AUTHSECRET, ≥32 car.), ADMIN_USERNAME (ou ADMINUSERNAME), ADMIN_PASSWORD (ou ADMINPASSWORD)",
      },
      { status: 503 },
    );
  }
  const body = await req.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect" }, { status: 401 });
  }
  const token = await signSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Impossible de créer la session" }, { status: 500 });
  }
  const maxAge = sessionMaxAgeSeconds();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
