/**
 * Affiche la structure de haut niveau du scraped-homepage.html :
 * Pour chaque container "section" (data-element_type=container), montre
 * data-id + extrait du premier titre / premier h1-h2-h3 trouvé.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public/scraped-homepage.html");

const $ = cheerio.load(fs.readFileSync(SRC, "utf-8"));

// Top-level Elementor sections : container avec data-e-type=container ET parent direct .elementor
$('.elementor-section, [data-element_type="section"], .elementor > .elementor-element, .elementor-edit-area-active > .elementor-element, [data-e-type="container"][class*="e-parent"]').each((i, el) => {
  const $el = $(el);
  const id = $el.attr("data-id");
  const parent = $el.parent().attr("class") || "(no parent class)";
  if (!id) return;
  // Profondeur dans l'arbre Elementor
  const depth = $el.parents("[data-e-type='container']").length;
  if (depth > 0) return; // on ne veut que les top-level
  // Extraire un texte signifiant
  const heading = $el.find("h1, h2, h3").first().text().trim().slice(0, 80) || $el.find(".elementor-heading-title").first().text().trim().slice(0, 80) || "(no heading)";
  const links = $el.find("a").length;
  console.log(`[${i}] data-id=${id} depth=${depth} h="${heading}" links=${links}`);
});
