/** Sous-domaines du site modèle → libellés catégories (alignés admin). */
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
): string | null {
  const list = byCat[category] || [];
  const first = list[0];
  if (!first) return null;
  if (first.slug) return `/${first.slug}`;
  return `/l/${first.id}`;
}

/**
 * Remplace dans le HTML :
 *  - href="https?://X.ecoenvironnement.net" → URL de la 1re landing de la catégorie
 *  - data-sector-link="<libellé>" sur les <a> du mega-menu : href réel ou désactivation
 */
export function injectSummarySectorLinks(
  html: string,
  landingsByCategory: Record<string, LandingLite[]>,
): string {
  // 1) Cartes du bloc secteur (liens absolus)
  let out = html.replace(
    /href="https?:\/\/([a-z0-9-]+)\.ecoenvironnement\.net\/?"/gi,
    (_m, sub: string) => {
      const cat = SUBDOMAIN_TO_CATEGORY[sub.toLowerCase()];
      if (!cat) return `href="#"`;
      const url = firstUrlForCategory(cat, landingsByCategory);
      return `href="${url || "#"}"`;
    },
  );

  // 2) Items du mega-menu : <a class="eco-mm-item" data-sector-link="<Cat>" href="#">…</a>
  // Si pas de landing → href reste "#" + ajoute aria-disabled="true" + classe désactivée
  out = out.replace(
    /<a([^>]*?)data-sector-link="([^"]+)"([^>]*?)>/gi,
    (_full, before: string, cat: string, after: string) => {
      const url = firstUrlForCategory(cat, landingsByCategory);
      // Reconstruit l'attribut href
      const attrs = (before + after).replace(/\shref="[^"]*"/i, "");
      if (url) {
        return `<a${attrs} href="${url}" data-sector-link="${cat}">`;
      }
      return `<a${attrs} href="#" aria-disabled="true" tabindex="-1" data-sector-link="${cat}" data-empty="true">`;
    },
  );

  return out;
}
