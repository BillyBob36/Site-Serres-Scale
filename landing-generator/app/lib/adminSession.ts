import { SignJWT, jwtVerify } from "jose";
import { getAuthSecret, getAdminSessionDays } from "./adminEnv";

export const ADMIN_SESSION_COOKIE = "lg_admin_session";

function secretKey(): Uint8Array | null {
  const s = getAuthSecret();
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const key = secretKey();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.sub === "admin";
  } catch {
    return false;
  }
}

export async function signSessionToken(): Promise<string | null> {
  const key = secretKey();
  if (!key) return null;
  const days = getAdminSessionDays();
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(key);
}

export function sessionMaxAgeSeconds(): number {
  const days = getAdminSessionDays();
  return 60 * 60 * 24 * days;
}
