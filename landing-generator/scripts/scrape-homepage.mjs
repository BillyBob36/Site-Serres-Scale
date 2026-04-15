/**
 * Re-aspire https://ecoenvironnement.net/ puis régénère fragment + CSS du bloc sommaire.
 * Nécessite Chrome/Chromium installé (single-file lance le navigateur).
 * Usage : node scripts/scrape-homepage.mjs
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "scraped-homepage.html");
const URL = "https://ecoenvironnement.net/";

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const r = spawnSync(npx, ["--yes", "single-file", URL, OUT], {
  cwd: ROOT,
  encoding: "utf-8",
  shell: true,
  stdio: "inherit",
});

if (r.status !== 0) {
  console.error("Échec single-file. Vérifiez que Chrome est installé.");
  process.exit(1);
}

if (!fs.existsSync(OUT) || fs.statSync(OUT).size < 10_000) {
  console.error("Fichier de sortie invalide:", OUT);
  process.exit(1);
}

console.log("OK scraped ->", path.relative(ROOT, OUT), fs.statSync(OUT).size, "bytes");

const ex = spawnSync(process.execPath, ["scripts/extract-summary-sector.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});
if (ex.status !== 0) process.exit(1);
