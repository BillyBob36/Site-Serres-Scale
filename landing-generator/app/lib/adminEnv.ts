/**
 * Noms d’app settings Azure : lettres, chiffres, points, underscores.
 * Si le portail refuse certains caractères, utiliser les variantes sans underscore :
 * AUTHSECRET, ADMINUSERNAME, ADMINPASSWORD, ADMINSESSIONDAYS
 */
export function getAuthSecret(): string | undefined {
  const s = process.env.AUTH_SECRET ?? process.env.AUTHSECRET;
  return s?.trim() || undefined;
}

export function getAdminUsername(): string | undefined {
  const u = process.env.ADMIN_USERNAME ?? process.env.ADMINUSERNAME;
  return u?.trim() || undefined;
}

export function getAdminPassword(): string | undefined {
  const p = process.env.ADMIN_PASSWORD ?? process.env.ADMINPASSWORD;
  return p ?? undefined;
}

export function getAdminSessionDays(): number {
  const raw = process.env.ADMIN_SESSION_DAYS ?? process.env.ADMINSESSIONDAYS ?? "7";
  return Number(raw) || 7;
}
