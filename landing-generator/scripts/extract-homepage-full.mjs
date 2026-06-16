/**
 * Extrait du scraped-homepage.html la totalité de la page (header + main + footer)
 * pour reproduire fidèlement ecoenvironnement.net.
 *
 * Transformations :
 * - Injection de badges SVG en haut-droite des cartes du bloc secteur (logique reprise
 *   de extract-summary-sector.mjs).
 * - Remap des URLs source → URLs internes (sous-domaines, /contact, /a-propos, etc.).
 * - Suppression des scripts et iframes (sécurité, perf).
 *
 * Sortie : public/summary-sector/full-page.html (utilisé par app/page.tsx)
 *
 * Usage : node scripts/extract-homepage-full.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public/scraped-homepage.html");
const OUTDIR = path.join(ROOT, "public/summary-sector");

// ─── Mapping titre secteur → SVG (badge top-right) ───
const SECTOR_SVG = {
  "Santé": "/svg-library/sante.svg",
  "Collectivité": "/svg-library/collectivites.svg",
  "Commerce": "/svg-library/commerce.svg",
  "Bureaux": "/svg-library/bureaux.svg",
  "Hôtellerie": "/svg-library/hotel.svg",
  "Distribution": "/svg-library/distribution.svg",
  "Industrie": "/svg-library/industrie.svg",
  "Agriculture": "/svg-library/agriculture.svg",
  "Data center": "/svg-library/datacenter.svg",
};

// ─── Remap des URLs source → URLs internes ───
// On remappe les URLs absolues d'ecoenvironnement.net vers nos routes Next.
// Les sous-domaines (sante.X, agriculture.X, etc.) pointent vers la home avec
// ancre #eco-summary-sector-root, mais les cartes sectorielles sont en plus
// remappées dynamiquement à l'exécution via injectSummarySectorLinks.
function remapHref(href) {
  if (!href || href.startsWith("#")) return href;
  try {
    const u = new URL(href);
    const host = u.hostname.toLowerCase();

    // Page interne ecoenvironnement.net principale
    if (host === "ecoenvironnement.net" || host === "www.ecoenvironnement.net") {
      const p = u.pathname.toLowerCase();
      if (p.startsWith("/contact")) return "/contact";
      if (p.startsWith("/a-propos") || p.startsWith("/qui-sommes-nous")) return "/a-propos";
      // Lien vers le sommaire des secteurs (ancre)
      if (p === "/" || p === "") return "/" + (u.hash || "");
      return "/";
    }

    // Sous-domaines secteur → vers la home (sera réinjecté dynamiquement)
    if (host.endsWith(".ecoenvironnement.net")) {
      return "/#eco-summary-sector-root";
    }

    // Liens externes (LinkedIn, YouTube, totalenergies, etc.) inchangés
    return href;
  } catch {
    return href; // pas une URL absolue valable
  }
}

// ─── Lecture source ───
const raw = fs.readFileSync(SRC, "utf-8");
const $ = cheerio.load(raw);

// ─── Récupère les 3 zones principales ───
const $header = $("header.elementor-location-header").first();
const $mainPage = $('div.elementor[data-elementor-type="wp-page"]').first();
const $footer = $("footer.elementor-location-footer").first();

if (!$header.length || !$mainPage.length || !$footer.length) {
  console.error("Sections introuvables :", {
    header: $header.length,
    main: $mainPage.length,
    footer: $footer.length,
  });
  process.exit(1);
}

// ─── Suppression des scripts inline et noscript dans tout l'arbre exporté ───
function sanitize($zone) {
  $zone.find("script, noscript, iframe[data-lazyloaded='1']:not([src])").remove();
}
sanitize($header);
sanitize($mainPage);
sanitize($footer);

// ─── Injection badges secteur ───
const $sectorGrid = $mainPage.find(".elementor-element[data-id=5659e95]");
$sectorGrid.removeClass("elementor-hidden-tablet elementor-hidden-mobile");
// Cartes hors périmètre (Transport / Data center si vide)
$sectorGrid.find('[data-id="ce481fe"],[data-id="3e84006"]').remove();

$sectorGrid.find("a.e-child").each((_, el) => {
  const $a = $(el);
  const titleText = $a.find(".elementor-heading-title").text().trim().replace(/\s+/g, " ");
  const cleanTitle = titleText.replace(/\s*&\s*/g, " & ");
  const svgPath = SECTOR_SVG[cleanTitle] || SECTOR_SVG[titleText];
  if (!svgPath) return;
  const existingStyle = $a.attr("style") || "";
  $a.attr("style", (existingStyle ? existingStyle + ";" : "") + "position:relative");
  $a.append(
    `<img src="${svgPath}" alt="" aria-hidden="true" class="eco-sector-badge" style="position:absolute;top:12px;right:12px;width:28px;height:28px;object-fit:contain;pointer-events:none;z-index:2"/>`,
  );
});

// ─── Remap global des liens (sauf cartes du bloc secteur, traitées dynamiquement
//     par injectSummarySectorLinks à l'exécution) ───
function remapZone($zone, $sectorGrid) {
  const sectorEl = $sectorGrid && $sectorGrid.length ? $sectorGrid[0] : null;
  $zone.find("a[href]").each((_, el) => {
    if (sectorEl && $.contains(sectorEl, el)) return; // skip cartes secteur
    const $a = $(el);
    $a.attr("href", remapHref($a.attr("href")));
  });
}
remapZone($header, null);
remapZone($mainPage, $sectorGrid);
remapZone($footer, null);

// ─── Mojibake fixes (UTF-8 → CP437) sur le scrape single-file ───
function fixMojibake(html) {
  return html
    .replace(/├®/g, "é")
    .replace(/├¿/g, "è")
    .replace(/├ª/g, "ê")
    .replace(/├ó/g, "â")
    .replace(/├«/g, "î")
    .replace(/├┤/g, "ô")
    .replace(/├╗/g, "û")
    .replace(/├ç/g, "Ç")
    .replace(/├ï/g, "Ë")
    .replace(/┬á/g, " ")
    .replace(/┬░/g, "°")
    .replace(/┬«/g, "®")
    .replace(/Ô/g, "œ");
}

// ─── Assemblage ───
const wrap = cheerio.load("<div></div>", null, false);
const $w = wrap("*").first();
$w.attr("id", "eco-full-page-root");
// On préserve les classes Elementor ancêtres requises pour que le CSS scoped s'applique
$w.append($header.clone());
$w.append($mainPage.clone());
$w.append($footer.clone());

let fragment = wrap.html();
fragment = fixMojibake(fragment);
// Wrappe avec elementor-56 + elementor-kit-6 (variables CSS du thème)
fragment = `<div class="elementor elementor-56 elementor-kit-6" data-elementor-summary-emulated="true" style="width:100%;max-width:100%;box-sizing:border-box">${fragment}</div>`;

fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, "full-page.html"), fragment, "utf-8");

console.log(`OK public/summary-sector/full-page.html ${fragment.length} chars`);
console.log(`   header: ${$header.find("a").length} liens, main: ${$mainPage.find("a").length} liens, footer: ${$footer.find("a").length} liens`);
