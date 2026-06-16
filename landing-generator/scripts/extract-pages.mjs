/**
 * Extracteur unifié : produit fragments + CSS pour les 3 pages aspirées.
 *  - public/scraped-homepage.html → public/summary-sector/full-page.html + sector.css
 *  - public/scraped-contact.html  → public/contact/fragment.html + contact.css
 *  - public/scraped-about.html    → public/about/fragment.html + about.css
 *
 * Transformations communes :
 *  - Sanitize : retire <script>/<noscript>, désactive forms ecoenvironnement.net
 *  - Remap des liens (ecoenvironnement.net → routes internes ; sous-domaines → home#secteur)
 *  - Strip header items "Partenariat Total Energie" et "Valorisation"
 *  - Injection d'un mega-menu CSS-only "Secteur d'activité" listant nos catégories
 *  - Mojibake fix UTF-8 ↔ CP437
 *  - Pour la home : badges SVG + grossissement
 *
 * Usage : node scripts/extract-pages.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// Adresse pour Google Maps embed (page contact)
const GMAPS_QUERY = "188-190 avenue Jean Lolive 93500 Pantin";
const GMAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(GMAPS_QUERY)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

const SECTOR_SVG = {
  "Santé": "/svg-library/sante.svg",
  "Collectivité": "/svg-library/collectivites.svg",
  "Résidentiel": "/svg-library/residentiel.svg",
  "Commerce": "/svg-library/commerce.svg",
  "Bureaux": "/svg-library/bureaux.svg",
  "Hôtellerie": "/svg-library/hotel.svg",
  "Distribution": "/svg-library/distribution.svg",
  "Industrie": "/svg-library/industrie.svg",
  "Agriculture": "/svg-library/agriculture.svg",
  "Data center": "/svg-library/datacenter.svg",
};

// Catégories à proposer dans le mega-menu (clé : libellé visible, valeur : data attribute pour
// que le rendu serveur puisse remplacer par les liens dynamiques de la DB).
const SECTOR_MENU_ITEMS = [
  "Santé", "Collectivité", "Résidentiel", "Commerce", "Bureaux",
  "Hôtellerie", "Distribution", "Industrie", "Agriculture", "Data center",
];

function remapHref(href) {
  if (!href || href.startsWith("#")) return href;
  try {
    const u = new URL(href);
    const host = u.hostname.toLowerCase();
    if (host === "ecoenvironnement.net" || host === "www.ecoenvironnement.net") {
      const p = u.pathname.toLowerCase();
      if (p.startsWith("/contact")) return "/contact";
      if (p.startsWith("/a-propos") || p.startsWith("/qui-sommes-nous")) return "/a-propos";
      if (p === "/" || p === "") return "/" + (u.hash || "");
      return "/";
    }
    if (host.endsWith(".ecoenvironnement.net")) return "/#eco-summary-sector-root";
    return href;
  } catch {
    return href;
  }
}

function stripFontFaces(css) {
  let out = "";
  let i = 0;
  const lower = css.toLowerCase();
  while (i < css.length) {
    const idx = lower.indexOf("@font-face", i);
    if (idx === -1) { out += css.slice(i); break; }
    out += css.slice(i, idx);
    const open = css.indexOf("{", idx);
    if (open === -1) { out += css.slice(idx); break; }
    let depth = 1; let j = open + 1;
    while (j < css.length && depth > 0) {
      const c = css[j];
      if (c === "{") depth++; else if (c === "}") depth--;
      j++;
    }
    i = j;
  }
  return out;
}

function fixMojibake(html) {
  return html
    .replace(/├®/g, "é").replace(/├¿/g, "è").replace(/├ª/g, "ê")
    .replace(/├ó/g, "â").replace(/├«/g, "î").replace(/├┤/g, "ô")
    .replace(/├╗/g, "û").replace(/├ç/g, "Ç").replace(/├ï/g, "Ë")
    .replace(/┬á/g, " ").replace(/┬░/g, "°").replace(/┬«/g, "®")
    .replace(/Ô/g, "œ");
}

/** Retire un <li.e-n-menu-item> si son texte commence par l'un des labels. */
function stripHeaderMenuItems($, $header, labelsLower) {
  // 1. Liens directs
  $header.find("a[href]").each((_, el) => {
    const $a = $(el);
    const txt = $a.text().trim().toLowerCase().replace(/\s+/g, " ");
    if (labelsLower.some((l) => txt.startsWith(l))) {
      // On supprime l'élément <li> ou container parent si possible
      const $container = $a.closest("li, .e-n-menu-item").first();
      if ($container.length) $container.remove();
      else $a.remove();
    }
  });
  // 2. Items mega-menu sans <a> direct (boutons "Ouvrir X")
  $header.find(".e-n-menu-title, .menu-item-title, .elementor-button").each((_, el) => {
    const $b = $(el);
    const txt = $b.text().trim().toLowerCase().replace(/\s+/g, " ");
    if (labelsLower.some((l) => txt.startsWith(l) || l.startsWith(txt))) {
      const $container = $b.closest("li, .e-n-menu-item, .elementor-element").first();
      if ($container.length) $container.remove();
    }
  });
}

/** Remplace l'item "Secteur d'activité" du header par un dropdown HTML/CSS-only.
 *  Le dropdown contient des liens marqués data-sector-link="<libellé>" qui seront
 *  remappés dynamiquement vers nos landings côté serveur (injectSectorMenuLinks).
 */
function injectSectorMegaMenu($, $header) {
  // Recherche les items mega-menu "Secteur d'activité" et les remplace par notre dropdown
  $header.find(".e-n-menu-item").each((_, el) => {
    const $li = $(el);
    const titleEl = $li.find(".e-n-menu-title-text, .e-n-menu-title").first();
    const txt = titleEl.text().trim().toLowerCase().replace(/\s+/g, " ");
    if (!txt.startsWith("secteur d'activité") && !txt.startsWith("secteur d'activite")) return;
    // Remplace tout le contenu du li par notre dropdown
    const items = SECTOR_MENU_ITEMS.map(
      (label) => `<a class="eco-mm-item" data-sector-link="${label}" href="#">${label}</a>`,
    ).join("");
    $li.replaceWith(`
<li class="e-n-menu-item eco-mega-menu-secteur" style="position:relative">
  <button type="button" class="eco-mm-trigger" aria-haspopup="true" aria-expanded="false" style="background:transparent;border:0;padding:8px 12px;font:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
    Secteur d'activité
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" style="flex-shrink:0"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>
  <div class="eco-mm-panel" role="menu">${items}</div>
</li>`);
  });
}

function sanitize($, $zone) {
  $zone.find("script, noscript").remove();
  // Ne supprime PAS les iframes : on remplace les vides (Maps lazy-load) plus loin
  $zone.find("form").each((_, el) => {
    $(el).attr("action", "#");
    $(el).attr("data-disabled-original", "true");
  });
}

function processPage({ srcPath, outDir, outFragmentName, outCssName, isHome = false, isAbout = false, addMaps = false, sharedHeader = null }) {
  const raw = fs.readFileSync(srcPath, "utf-8");
  const $ = cheerio.load(raw);

  // Si un header partagé (depuis la home) est fourni, on l'utilise pour
  // garantir un header strictement identique sur toutes les pages.
  let $header;
  if (sharedHeader) {
    // Recharge dans le contexte de cette page pour pouvoir manipuler avec $
    const tmp = cheerio.load(`<div id="__h">${sharedHeader}</div>`, null, false);
    $header = tmp("#__h").children().first();
  } else {
    $header = $("header.elementor-location-header").first();
  }
  const $mainPage = $('div.elementor[data-elementor-type="wp-page"]').first();
  const $footer = $("footer.elementor-location-footer").first();

  if (!$header.length || !$mainPage.length || !$footer.length) {
    throw new Error(`Sections manquantes pour ${srcPath} : header=${$header.length} main=${$mainPage.length} footer=${$footer.length}`);
  }

  // Sanitize : on retire les scripts mais on PRÉSERVE les iframes/structures swiper
  sanitize($, $header);
  sanitize($, $mainPage);
  sanitize($, $footer);

  // Si on utilise un header partagé (déjà transformé sur la home), on saute
  // les transformations header pour ne pas re-stripper le CTA Contact relabelé.
  if (!sharedHeader) {
    // Header : strip "Partenariat Total Energie", "CEE", et le lien "Contact" central.
    stripHeaderMenuItems($, $header, ["partenariat total energie", "cee", "contact"]);

    // Relabel le bouton vert source "Valorisation" → "Contact" + lien /contact
    $header.find('[data-id="0e39901"] a, [data-id="9665476"] a, .elementor-widget-button a:contains("Valorisation")').each((_, el) => {
      const $a = $(el);
      $a.attr("href", "/contact");
      $a.find(".elementor-button-text").text("Contact");
      if (!$a.find(".elementor-button-text").length) {
        $a.text("Contact");
      }
      // Marqueur pour identifier ce CTA
      $a.attr("data-eco-cta-contact", "1");
    });

    // Header : transforme "Secteur d'activité" en simple lien qui scroll
    $header.find(".e-n-menu-item").each((_, el) => {
      const $li = $(el);
      const titleEl = $li.find(".e-n-menu-title-text, .e-n-menu-title").first();
      const txt = titleEl.text().trim().toLowerCase().replace(/\s+/g, " ");
      if (!txt.startsWith("secteur d'activit")) return;
      const $title = $li.find(".e-n-menu-title").first();
      if ($title.length) {
        $title.replaceWith(
          `<a class="e-n-menu-title eco-secteur-anchor" href="/#eco-summary-sector-root" style="display:inline-flex;align-items:center;text-decoration:none;color:inherit"><span class="e-n-menu-title-text">Secteur d'activité</span></a>`,
        );
      }
      $li.find(".e-n-menu-content, .e-n-menu-dropdown").remove();
    });
  }

  // Strip LinkedIn personnels (profils membres équipe) — on garde la page entreprise
  $mainPage.find('a[href*="linkedin.com/in/"]').each((_, el) => {
    const $a = $(el);
    const $widget = $a.closest('.elementor-widget, .elementor-element').first();
    if ($widget.length) $widget.remove();
    else $a.remove();
  });

  // Bloc "Nos collaborateurs s'expriment" (about) : retire le top container
  if (isAbout) {
    $mainPage.find('[data-id="8b1f355"]').remove();
  }

  // ─── Anchor de scroll : "Votre secteur d'activité" (titre data-id a90ef4e) ───
  $mainPage.find('[data-id="a90ef4e"]').first().attr("id", "eco-summary-sector-root");

  // ─── Carousel "Nos clients" : on remplace ENTIÈREMENT le widget Elementor swiper
  //     par un carousel custom propre, avec TOUS les logos extraits du source. ───
  if (isHome) {
    const $nc = $mainPage.find('[data-id="337df42"]');
    if ($nc.length) {
      // Récupère tous les logos uniques (slides originaux non-clones)
      const seen = new Set();
      const logos = [];
      $nc.find('.swiper-slide:not(.swiper-slide-duplicate) img').each((_, el) => {
        const $i = $(el);
        const src = ($i.attr("src") || "").trim();
        const alt = ($i.attr("alt") || "").trim();
        if (!src || src.length < 200) return;     // skip placeholders cassés
        if (seen.has(src)) return;                // déduplique
        seen.add(src);
        logos.push({ src, alt });
      });

      // Construit le markup du carousel custom
      const trackInner = logos.map(l =>
        `<div class="eco-clients-slide"><img src="${l.src}" alt="${l.alt}"/></div>`
      ).join("");

      // Le track contient 2× les logos pour un loop seamless (translateX -50%)
      const carouselHtml = `
<div class="eco-clients-carousel" data-eco-clients="1">
  <div class="eco-clients-track">
    ${trackInner}
    ${trackInner}
  </div>
</div>`;

      // Remplace le contenu intérieur du widget par notre carousel,
      // en conservant les classes/wrapper Elementor pour ne pas casser le layout source.
      $nc.html(carouselHtml);
    }
  }

  // ─── Contact : retire les blocs "Nous appeler" + "Nous écrire" (parent commun 70f5531) ───
  $mainPage.find('[data-id="70f5531"]').remove();

  // ─── Contact : nettoie le formulaire (garder seulement les champs des landings) ───
  // Champs à retirer : "Secteur activité" select, "Créneaux horaires" select, consent checkbox.
  $mainPage.find('form .elementor-field-group').each((_, el) => {
    const $g = $(el);
    const labelText = $g.find("label").text().trim().toLowerCase();
    if (
      labelText.startsWith("secteur activité") ||
      labelText.startsWith("créneaux") ||
      labelText.startsWith("en remplissant") ||
      labelText.includes("politique de confidentialité")
    ) {
      $g.remove();
    }
  });

  // ─── Footer : nettoyage social + désactivation de TOUS les liens ───
  $footer.find('[data-id="b61d7c0"]').remove();           // social icons widget
  $footer.find('[data-id="9d8d3d9"]').remove();           // "Suivez nous" heading
  $footer.find('[data-id="4361f0f"]').remove();           // bloc Partenaires + Valorisation de dossiers
  // Aucun lien dans le footer ne doit pouvoir nous sortir des pages : on remplace
  // chaque <a> par un <span> non-cliquable, sauf le bouton "Contactez nous" qui doit
  // continuer à pointer vers /contact.
  $footer.find("a").each((_, el) => {
    const $a = $(el);
    const txt = $a.text().trim();
    if (/^contactez\s*nous/i.test(txt)) {
      $a.attr("href", "/contact");
      return;
    }
    // Tout le reste devient un span statique (texte préservé)
    $a.replaceWith(`<span class="eco-footer-static">${$a.html() || txt}</span>`);
  });

  // Home : badges SVG + grossissement
  if (isHome) {
    const $sectorGrid = $mainPage.find(".elementor-element[data-id=5659e95]");
    $sectorGrid.removeClass("elementor-hidden-tablet elementor-hidden-mobile");
    $sectorGrid.find('[data-id="ce481fe"],[data-id="3e84006"]').remove();
    $sectorGrid.find("a.e-child").each((_, el) => {
      const $a = $(el);
      const titleText = $a.find(".elementor-heading-title").text().trim().replace(/\s+/g, " ");
      const cleanTitle = titleText.replace(/\s*&\s*/g, " & ");
      const svgPath = SECTOR_SVG[cleanTitle] || SECTOR_SVG[titleText];
      if (!svgPath) return;
      const existingStyle = $a.attr("style") || "";
      $a.attr("style", (existingStyle ? existingStyle + ";" : "") + "position:relative");
      // Badge plus grand : 56px (vs 28px), pour matcher la prominence du site source
      $a.append(
        `<img src="${svgPath}" alt="" aria-hidden="true" class="eco-sector-badge" style="position:absolute;top:14px;right:14px;width:56px;height:56px;object-fit:contain;pointer-events:none;z-index:2"/>`,
      );
    });
  }

  // Contact : iframe Maps avec src réel
  if (addMaps) {
    $mainPage.find("iframe").each((_, el) => {
      const $f = $(el);
      const src = $f.attr("src");
      const dataSrc = $f.attr("data-src");
      if (!src && !dataSrc) {
        $f.attr("src", GMAPS_EMBED);
        $f.attr("loading", "lazy");
        $f.attr("referrerpolicy", "no-referrer-when-downgrade");
        if (!$f.attr("style")) {
          $f.attr("style", "width:100%;min-height:380px;border:0;display:block");
        }
      }
    });
  }

  // Remap liens (sauf grille secteur sur home — handled at runtime)
  const $sectorGridForSkip = isHome ? $mainPage.find(".elementor-element[data-id=5659e95]") : null;
  function remapZone($zone) {
    const sectorEl = $sectorGridForSkip && $sectorGridForSkip.length ? $sectorGridForSkip[0] : null;
    $zone.find("a[href]").each((_, el) => {
      if (sectorEl && $.contains(sectorEl, el)) return;
      const $a = $(el);
      if ($a.attr("data-sector-link") !== undefined) return;
      $a.attr("href", remapHref($a.attr("href")));
    });
  }
  remapZone($header);
  remapZone($mainPage);
  remapZone($footer);

  // Assemblage : header source + main + footer
  const wrap = cheerio.load("<div></div>", null, false);
  const $w = wrap("*").first();
  $w.attr("id", "eco-page-root");
  $w.append($header.clone());
  $w.append($mainPage.clone());
  $w.append($footer.clone());

  let fragment = wrap.html();
  fragment = fixMojibake(fragment);
  fragment = `<div class="elementor elementor-56 elementor-kit-6" data-elementor-summary-emulated="true" style="width:100%;max-width:100%;box-sizing:border-box">${fragment}</div>`;

  // CSS
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const parts = [];
  let m;
  while ((m = styleRe.exec(raw)) !== null) parts.push(stripFontFaces(m[1]));
  const css = parts.join("\n\n/* --- */\n\n");

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, outFragmentName), fragment, "utf-8");
  fs.writeFileSync(path.join(outDir, outCssName), css, "utf-8");

  console.log(`OK ${path.relative(ROOT, path.join(outDir, outFragmentName))} ${fragment.length} chars`);
  console.log(`OK ${path.relative(ROOT, path.join(outDir, outCssName))} ${css.length} chars`);

  // Retourne le HTML du header transformé (pour partage entre pages)
  return $.html($header);
}

// Run all 3 pages — la home est traitée en premier, son header est ensuite
// partagé tel quel avec contact et about (look strictement identique).
let homeHeader = null;
try {
  homeHeader = processPage({
    srcPath: path.join(ROOT, "public/scraped-homepage.html"),
    outDir: path.join(ROOT, "public/summary-sector"),
    outFragmentName: "full-page.html",
    outCssName: "sector.css",
    isHome: true,
  });
} catch (e) {
  console.error("Home extraction failed:", e.message);
}

try {
  processPage({
    srcPath: path.join(ROOT, "public/scraped-contact.html"),
    outDir: path.join(ROOT, "public/contact"),
    outFragmentName: "fragment.html",
    outCssName: "contact.css",
    addMaps: true,
    sharedHeader: homeHeader,
  });
} catch (e) {
  console.error("Contact extraction failed:", e.message);
}

try {
  processPage({
    srcPath: path.join(ROOT, "public/scraped-about.html"),
    outDir: path.join(ROOT, "public/about"),
    outFragmentName: "fragment.html",
    outCssName: "about.css",
    isAbout: true,
    sharedHeader: homeHeader,
  });
} catch (e) {
  console.error("About extraction failed:", e.message);
}
