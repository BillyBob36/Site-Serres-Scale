const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HTML_PATH = path.join(ROOT, "public", "scraped-about.html");
const OUT_DIR = path.join(ROOT, "public", "images", "about");

const JOBS = [
  { line: 736, out: "david-bismuth.jpg" },
  { line: 753, out: "marie-amelie-simond.jpg" },
  { line: 770, out: "annati-abtan.jpg" },
  { line: 787, out: "amel-mahiouf.png" },
];

function extractDataUrlFromLine(line) {
  const quoted = line.match(/src="(data:image\/[^"]+)"/);
  if (quoted) return quoted[1];
  const unquoted = line.match(/src=(data:image\/[^\s>]+)/);
  if (unquoted) return unquoted[1];
  throw new Error("Aucune data URL trouvee sur la ligne");
}

function parseDataUrl(dataUrl) {
  const m = dataUrl.match(/^data:(image\/(?:jpeg|png));base64,(.+)$/i);
  if (!m) throw new Error("Format data URL inattendu: " + dataUrl.slice(0, 80));
  return { mime: m[1].toLowerCase(), base64: m[2] };
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const raw = fs.readFileSync(HTML_PATH, "utf8");
const lines = raw.split(/\r?\n/);

for (const { line, out } of JOBS) {
  const idx = line - 1;
  if (idx < 0 || idx >= lines.length) {
    throw new Error("Ligne hors limites: " + line);
  }
  const row = lines[idx];
  const dataUrl = extractDataUrlFromLine(row);
  const { base64 } = parseDataUrl(dataUrl);
  const buf = Buffer.from(base64, "base64");
  const dest = path.join(OUT_DIR, out);
  fs.writeFileSync(dest, buf);
  console.log(out, buf.length, "octets");
}

console.log("Termine:", OUT_DIR);
