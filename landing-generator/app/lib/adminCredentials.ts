import { timingSafeEqual } from "crypto";
import { getAdminPassword, getAdminUsername, getAuthSecret } from "./adminEnv";

function safeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function adminAuthConfigured(): boolean {
  const u = getAdminUsername();
  const p = getAdminPassword();
  const s = getAuthSecret();
  return !!(u && p && s && s.length >= 32);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const u = getAdminUsername() ?? "";
  const p = getAdminPassword() ?? "";
  if (!u || !p) return false;
  return safeEqual(username.trim(), u) && safeEqual(password, p);
}
