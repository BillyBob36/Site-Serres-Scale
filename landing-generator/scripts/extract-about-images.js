/**
 * Extrait les images data URL des variables CSS --sf-img-N depuis scraped-about.html,
 * telecharge le logo ECO si reference, et extrait les fonds data URL de la zone hero.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const HTML_PATH = path.join(ROOT, "public", "scraped-about.html");
const OUT_DIR = path.join(ROOT, "public", "images", "about");
const ECO_URL =
  "https://ecoenvironnement.net/wp-content/uploads/2025/11/ECO_VERT_RVB.svg";
const ECO_OUT = path.join(OUT_DIR, "eco-logo.svg");

const MIME_TO_EXT = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

function extFromMime(mime) {
  const m = (mime || "").split(";")[0].trim().toLowerCase();
  if (MIME_TO_EXT[m]) return MIME_TO_EXT[m];
  const slash = m.indexOf("/");
  if (slash >= 0) {
    const sub = m.slice(slash + 1);
    if (sub === "svg+xml") return "svg";
    return sub.replace(/[^a-z0-9+.-]/gi, "_") || "bin";
  }
  return "bin";
}

function parseDataUrl(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return null;
  const header = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  const isBase64 = /;base64\s*$/i.test(header);
  const mimeMatch = header.match(/^([^;]+)/);
  const mime = mimeMatch ? mimeMatch[1].trim() : "application/octet-stream";
  let buf;
  if (isBase64) {
    buf = Buffer.from(payload.replace(/\s/g, ""), "base64");
  } else {
    try {
      buf = Buffer.from(decodeURIComponent(payload), "utf8");
    } catch {
      buf = Buffer.from(payload, "utf8");
    }
  }
  return { mime, buf };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function reportSaved(relPath, buf) {
  const bytes = buf.length;
  const kb = (bytes / 1024).toFixed(2);
  console.log("  OK " + relPath + " - " + bytes + " octets (" + kb + " KiB)");
}

function extractRootSfImages(html) {
  const re = /--sf-img-(\d+)\s*:\s*url\(\s*(["'])(data:[^"']+)\2\s*\)/gi;
  const seen = new Map();
  let m;
  while ((m = re.exec(html))) {
    seen.set(m[1], m[3]);
  }
  const re2 = /--sf-img-(\d+)\s*:\s*url\(\s*(data:image[^)]*)\)/gi;
  while ((m = re2.exec(html))) {
    if (!seen.has(m[1])) seen.set(m[1], m[2]);
  }
  return seen;
}

function extractHeroBackgroundDataUrls(html) {
  const lines = html.split(/\r?\n/);
  const start = Math.max(0, 295 - 1);
  const end = Math.min(lines.length, 405);
  const slice = lines.slice(start, end).join("\n");
  const urls = [];
  const patterns = [
    /background-image\s*:\s*url\(\s*(["']?)(data:image\/[^)"']+)\1\s*\)/gi,
    /\bbackground\s*:\s*[^;{]*url\(\s*(["']?)(data:image\/[^)"']+)\1/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(slice))) {
      urls.push(m[2]);
    }
  }
  return urls;
}

async function main() {
  console.log("Lecture:", HTML_PATH);
  if (!fs.existsSync(HTML_PATH)) {
    console.error("Fichier HTML introuvable.");
    process.exit(1);
  }
  ensureDir(OUT_DIR);

  const html = fs.readFileSync(HTML_PATH, "utf8");

  console.log("\nVariables CSS --sf-img-N\n");
  const sfMap = extractRootSfImages(html);
  const sortedIds = [...sfMap.keys()].sort((a, b) => Number(a) - Number(b));
  if (sortedIds.length === 0) {
    console.log("  (aucune --sf-img-N trouvee)");
  }
  for (const id of sortedIds) {
    const dataUrl = sfMap.get(id);
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) {
      console.warn("  Ignore sf-img-" + id + ": data URL invalide");
      continue;
    }
    const ext = extFromMime(parsed.mime);
    const name = "sf-img-" + id + "." + ext;
    const outPath = path.join(OUT_DIR, name);
    fs.writeFileSync(outPath, parsed.buf);
    reportSaved(path.relative(ROOT, outPath), parsed.buf);
  }

  console.log("\nZone hero (lignes ~295-405, autour de 308-400), url(data:image...) dans background:\n");
  const heroUrls = extractHeroBackgroundDataUrls(html);
  const byHash = new Map();
  for (const dataUrl of heroUrls) {
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) continue;
    const digest = crypto.createHash("sha256").update(parsed.buf).digest("hex");
    if (!byHash.has(digest)) {
      byHash.set(digest, { buf: parsed.buf, mime: parsed.mime });
    }
  }
  const candidates = [...byHash.values()].sort(
    (a, b) => b.buf.length - a.buf.length
  );
  const MIN_LARGE = 25 * 1024;
  let toWrite = candidates.filter((c) => c.buf.length >= MIN_LARGE);
  if (toWrite.length === 0 && candidates.length > 0) {
    toWrite = [candidates[0]];
    console.log("  (aucun >= 25 Ko - ecriture du plus gros candidat unique)");
  }
  let hi = 0;
  for (const c of toWrite) {
    hi += 1;
    const ext = extFromMime(c.mime);
    const name = "hero-bg-" + hi + "." + ext;
    const outPath = path.join(OUT_DIR, name);
    fs.writeFileSync(outPath, c.buf);
    reportSaved(path.relative(ROOT, outPath), c.buf);
  }
  if (heroUrls.length === 0) {
    console.log(
      "  (aucune data URL en background dans cette plage - souvent var(--sf-img-N) dans :root)"
    );
  } else if (toWrite.length === 0) {
    console.log("  (aucun candidat decode)");
  }

  console.log("\nLogo ECO (ECO_VERT_RVB)\n");
  if (html.includes("ECO_VERT_RVB")) {
    console.log("  Reference trouvee - telechargement:", ECO_URL);
    const res = await fetch(ECO_URL);
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(ECO_OUT, buf);
    reportSaved(path.relative(ROOT, ECO_OUT), buf);
  } else {
    console.log("  Aucune occurrence ECO_VERT_RVB - pas de telechargement.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
