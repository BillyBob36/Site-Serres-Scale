/**
 * Extrait du scraped-homepage.html :
 * - le titre + grille « Votre secteur d'activité » (Elementor data-id a90ef4e + 5659e95)
 * - les <style> du document sauf le bloc #26 (~2,3 Mo de @font-face / fonts)
 *
 * Sortie : public/summary-sector/fragment.html + sector.css
 * Relancer après re-scrape : node scripts/extract-summary-sector.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public/scraped-homepage.html");
const OUTDIR = path.join(ROOT, "public/summary-sector");

const raw = fs.readFileSync(SRC, "utf-8");
const $ = cheerio.load(raw);

const titleBlock = $(".elementor-element[data-id=a90ef4e]");
const grid = $(".elementor-element[data-id=5659e95]");

if (!titleBlock.length || !grid.length) {
  console.error("Bloc secteur introuvable (data-id a90ef4e ou 5659e95).");
  process.exit(1);
}

grid.removeClass("elementor-hidden-tablet elementor-hidden-mobile");
// Cartes hors périmètre (sous-domaines du site d’origine, non dans notre liste admin)
grid.find('[data-id="ce481fe"],[data-id="3e84006"]').remove();

const wrap = cheerio.load("<div></div>", null, false);
const $w = wrap("*").first();
$w.attr("id", "eco-summary-sector-root");
$w.append(titleBlock.clone());
$w.append(
  `<div class="eco-summary-subtitle-wrap" style="text-align:center;padding:8px 20px 20px;font-family:Poppins,sans-serif">
  <p style="margin:0 auto;max-width:720px;font-size:clamp(15px,1.8vw,18px);font-weight:300;color:#333;line-height:1.5">
    Choisissez votre secteur et on optimise énergétiquement votre bâtiment
  </p>
</div>`,
);
$w.append(grid.clone());

let fragment = wrap.html();
fragment = fragment
  .replace(/activit├®/g, "activité")
  .replace(/Sant├®/g, "Santé")
  .replace(/Collectivit├®/g, "Collectivité")
  .replace(/R├®sidentiel/g, "Résidentiel")
  .replace(/Industrie\s*&amp;\s*<br\s*\/?>\s*Data\s*center/gi, "Industrie &amp;<br>Data center");

// Les règles CSS aspirées sont préfixées `.elementor-56` + variables sur `.elementor-kit-6` :
// sans ces classes ancêtres, la grille et les tailles d’images ne s’appliquent pas (SVG en pleine page).
fragment = `<div class="elementor elementor-56 elementor-kit-6" data-elementor-summary-emulated="true" style="width:100%;max-width:100%;box-sizing:border-box">${fragment}</div>`;

fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, "fragment.html"), fragment, "utf-8");

const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
const parts = [];
let m;
let idx = 0;
while ((m = styleRe.exec(raw)) !== null) {
  idx++;
  if (idx === 26) continue;
  parts.push(m[1]);
}
const css = parts.join("\n\n/* --- */\n\n");
fs.writeFileSync(path.join(OUTDIR, "sector.css"), css, "utf-8");

console.log("OK", path.relative(ROOT, path.join(OUTDIR, "fragment.html")), fragment.length, "chars");
console.log("OK", path.relative(ROOT, path.join(OUTDIR, "sector.css")), css.length, "chars");
