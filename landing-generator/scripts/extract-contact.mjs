/**
 * Extrait le fragment exploitable de scraped-contact.html :
 * header + main (formulaire contact + infos) + footer, avec :
 *   - remap des liens vers /contact, /a-propos, /
 *   - suppression des scripts (sécurité côté Next)
 *   - retrait des actions de formulaire externes (pas de POST vers ecoenvironnement.net)
 *
 * Sortie : public/contact/fragment.html (+ contact.css fusionné avec sector.css côté page)
 *
 * Usage : node scripts/extract-contact.mjs (auto-invoqué par scrape-contact.mjs)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public/scraped-contact.html");
const OUTDIR = path.join(ROOT, "public/contact");

if (!fs.existsSync(SRC)) {
  console.error("Source manquante : lancer d'abord scripts/scrape-contact.mjs");
  process.exit(1);
}

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
    if (idx === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, idx);
    const open = css.indexOf("{", idx);
    if (open === -1) {
      out += css.slice(idx);
      break;
    }
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      const c = css[j];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      j++;
    }
    i = j;
  }
  return out;
}

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
    .replace(/┬á/g, " ")
    .replace(/┬░/g, "°")
    .replace(/┬«/g, "®")
    .replace(/Ô/g, "œ");
}

const raw = fs.readFileSync(SRC, "utf-8");
const $ = cheerio.load(raw);

const $header = $("header.elementor-location-header").first();
const $mainPage = $('div.elementor[data-elementor-type="wp-page"]').first();
const $footer = $("footer.elementor-location-footer").first();

if (!$header.length || !$mainPage.length || !$footer.length) {
  console.error("Sections introuvables (contact) :", {
    header: $header.length,
    main: $mainPage.length,
    footer: $footer.length,
  });
  process.exit(1);
}

// ─── Sanitize ───
function sanitize($zone) {
  $zone.find("script, noscript, iframe[data-lazyloaded='1']:not([src])").remove();
  // Désactive les forms qui posteraient vers ecoenvironnement.net
  $zone.find("form").each((_, el) => {
    $(el).attr("action", "#");
    $(el).attr("method", "post");
    $(el).attr("data-disabled", "true");
  });
}
sanitize($header);
sanitize($mainPage);
sanitize($footer);

// ─── Remap liens ───
function remapZone($zone) {
  $zone.find("a[href]").each((_, el) => {
    const $a = $(el);
    $a.attr("href", remapHref($a.attr("href")));
  });
}
remapZone($header);
remapZone($mainPage);
remapZone($footer);

// ─── Assemblage ───
const wrap = cheerio.load("<div></div>", null, false);
const $w = wrap("*").first();
$w.attr("id", "eco-contact-page-root");
$w.append($header.clone());
$w.append($mainPage.clone());
$w.append($footer.clone());

let fragment = wrap.html();
fragment = fixMojibake(fragment);
fragment = `<div class="elementor elementor-56 elementor-kit-6" data-elementor-summary-emulated="true" style="width:100%;max-width:100%;box-sizing:border-box">${fragment}</div>`;

// ─── CSS du document (sans @font-face) ───
const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
const parts = [];
let m;
while ((m = styleRe.exec(raw)) !== null) parts.push(stripFontFaces(m[1]));
const css = parts.join("\n\n/* --- */\n\n");

fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, "fragment.html"), fragment, "utf-8");
fs.writeFileSync(path.join(OUTDIR, "contact.css"), css, "utf-8");

console.log(`OK public/contact/fragment.html ${fragment.length} chars`);
console.log(`OK public/contact/contact.css ${css.length} chars`);
