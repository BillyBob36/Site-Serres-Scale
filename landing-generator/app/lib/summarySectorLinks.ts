/** Sous-domaines du site modèle → libellés catégories (alignés admin / page d’accueil). */
const SUBDOMAIN_TO_CATEGORY: Record<string, string> = {
  sante: "Santé",
  collectivite: "Collectivité",
  residentiel: "Résidentiel",
  commerce: "Commerce",
  bureau: "Bureaux",
  bureaux: "Bureaux",
  hotellerie: "Hôtellerie",
  distribution: "Distribution",
  industrie: "Industrie",
  agri: "Agriculture",
};

type LandingLite = { id: string; name: string; slug?: string | null };

function firstUrlForCategory(
  category: string,
  byCat: Record<string, LandingLite[]>,
): string {
  const list = byCat[category] || [];
  const first = list[0];
  if (!first) return "#";
  if (first.slug) return `/${first.slug}`;
  return `/l/${first.id}`;
}

/**
 * Remplace les href des cartes secteur (ecoenvironnement.net) par nos URLs de landing.
 */
export function injectSummarySectorLinks(
  html: string,
  landingsByCategory: Record<string, LandingLite[]>,
): string {
  return html.replace(
    /href="https?:\/\/([a-z0-9-]+)\.ecoenvironnement\.net\/?"/gi,
    (_m, sub: string) => {
      const cat = SUBDOMAIN_TO_CATEGORY[sub.toLowerCase()];
      if (!cat) return `href="#"`;
      const url = firstUrlForCategory(cat, landingsByCategory);
      return `href="${url}"`;
    },
  );
}
