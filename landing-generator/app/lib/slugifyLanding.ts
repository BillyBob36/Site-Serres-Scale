import { RESERVED_LANDING_SLUGS } from "./reservedLandingSlugs";

/** Transforme un nom ou saisie utilisateur en segment d’URL (a-z, 0-9, tirets). */
export function slugifyLandingName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isReservedLandingSlug(s: string): boolean {
  return RESERVED_LANDING_SLUGS.has(s);
}
