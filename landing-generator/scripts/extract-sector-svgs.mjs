import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public/scraped-homepage.html");
const OUTDIR = path.join(ROOT, "public/images/sectors");

const html = fs.readFileSync(SRC, "utf-8");

const gridStart = html.indexOf('data-id=5659e95');
if (gridStart < 0) { console.error("Grid not found"); process.exit(1); }
const gridChunk = html.slice(gridStart, gridStart + 120000);

const results = [];
const seen = new Set();

// Split by each card anchor
const cardParts = gridChunk.split(/<a\s+class="elementor-element/g);

for (let i = 1; i < cardParts.length; i++) {
  const part = cardParts[i].slice(0, 6000);

  const svgMatch = part.match(/src=["']?(data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+)["']?\s/);
  const nameMatch = part.match(/elementor-heading-title[^>]*>([^<]+)</);
  // Background color from the inner child container
  const bgMatch = part.match(/background-color:\s*(#[0-9A-Fa-f]{3,8})/);

  if (svgMatch && nameMatch) {
    const dataUrl = svgMatch[1];
    let name = nameMatch[1].trim()
      .replace(/├®/g, "é")
      .replace(/├⌐/g, "é")
      .replace(/├¿/g, "ï")
      .replace(/├┤/g, "ô");

    const b64 = dataUrl.replace("data:image/svg+xml;base64,", "");
    const svgContent = Buffer.from(b64, "base64").toString("utf-8");
    const bg = bgMatch ? bgMatch[1] : "#ffffff";

    const slug = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/-$/, "");

    if (!seen.has(slug)) {
      seen.add(slug);
      results.push({ name, slug, svgContent, bg });
    }
  }
}

fs.mkdirSync(OUTDIR, { recursive: true });
for (const r of results) {
  const fpath = path.join(OUTDIR, `${r.slug}.svg`);
  fs.writeFileSync(fpath, r.svgContent, "utf-8");
  console.log(`${r.name} -> ${r.slug}.svg (${r.svgContent.length} B) bg=${r.bg}`);
}
console.log(`\nTotal: ${results.length} SVGs extracted to ${path.relative(ROOT, OUTDIR)}`);
