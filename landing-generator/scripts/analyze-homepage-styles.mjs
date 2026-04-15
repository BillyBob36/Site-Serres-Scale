import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const h = fs.readFileSync(path.join(__dirname, "../public/scraped-homepage.html"), "utf-8");

const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let m;
let i = 0;
let total = 0;
const sizes = [];
while ((m = re.exec(h)) !== null) {
  i++;
  const len = m[1].length;
  total += len;
  sizes.push(len);
  if (len > 80_000) console.log(`BIG style #${i}: ${len} chars`);
  if (i <= 15) console.log(`style #${i}: ${len} chars`);
}
console.log("total styles", i, "combined", total);
for (let j = 35; j <= sizes.length; j++) {
  if (sizes[j - 1]) console.log(`#${j}:`, sizes[j - 1]);
}
