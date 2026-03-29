import { NextRequest, NextResponse } from "next/server";

/** Normalize any hex to lowercase 6-digit form */
function normHex(raw: string): string | null {
  const h = raw.replace("#", "");
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  if (h.length === 6) return `#${h}`.toLowerCase();
  return null;
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q2;
    r = hue2rgb(p, q2, h + 1 / 3);
    g = hue2rgb(p, q2, h);
    b = hue2rgb(p, q2, h - 1 / 3);
  }
  const toH = (c: number) => Math.round(c * 255).toString(16).padStart(2, "0");
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

/**
 * Extract colors from CSS/HTML text with scoring.
 * Colors found in visual properties (background-color, color, border-color, background)
 * score higher than colors found only in CSS variable declarations or presets.
 */
function extractColorsScored(text: string, scores: Map<string, number>) {
  // 1) Colors in actual visual CSS properties — HIGH weight
  const visualProps = text.matchAll(
    /(?:background-color|(?<!-)color|border-color|background|fill|stroke)\s*:\s*([^;}{]+)/gi
  );
  for (const m of visualProps) {
    const val = m[1];
    // hex
    for (const hm of val.matchAll(/#([0-9a-fA-F]{3,6})\b/g)) {
      const c = normHex(hm[0]);
      if (c) scores.set(c, (scores.get(c) || 0) + 5);
    }
    // rgb/rgba
    for (const rm of val.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
      const c = `#${[rm[1], rm[2], rm[3]].map((n) => parseInt(n).toString(16).padStart(2, "0")).join("")}`;
      scores.set(c, (scores.get(c) || 0) + 5);
    }
    // hsl
    for (const hm of val.matchAll(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/g)) {
      const c = hslToHex(parseFloat(hm[1]) / 360, parseFloat(hm[2]) / 100, parseFloat(hm[3]) / 100);
      scores.set(c, (scores.get(c) || 0) + 5);
    }
  }

  // 2) Colors in inline style="" attributes — HIGH weight
  const inlineStyles = text.matchAll(/style\s*=\s*["']([^"']+)["']/gi);
  for (const m of inlineStyles) {
    const val = m[1];
    for (const hm of val.matchAll(/#([0-9a-fA-F]{3,6})\b/g)) {
      const c = normHex(hm[0]);
      if (c) scores.set(c, (scores.get(c) || 0) + 8);
    }
    for (const rm of val.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
      const c = `#${[rm[1], rm[2], rm[3]].map((n) => parseInt(n).toString(16).padStart(2, "0")).join("")}`;
      scores.set(c, (scores.get(c) || 0) + 8);
    }
  }

  // 3) Colors in CSS variable declarations (--wp--preset, --e-global, etc.) — LOW weight
  const varDecls = text.matchAll(/--[\w-]+\s*:\s*(#[0-9a-fA-F]{3,6})\b/g);
  for (const m of varDecls) {
    const c = normHex(m[1]);
    if (c) scores.set(c, (scores.get(c) || 0) + 1);
  }

  // 4) Any remaining hex colors in the text — MINIMAL weight (catches class names, etc.)
  for (const m of text.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
    if (m[1].length === 3 || m[1].length === 6) {
      const c = normHex(m[0]);
      if (c && !scores.has(c)) scores.set(c, 1);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
    });
    if (!res.ok) return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: 500 });

    const html = await res.text();
    const scores = new Map<string, number>();

    // Extract from inline styles and HTML attributes
    extractColorsScored(html, scores);

    // Extract from <style> blocks
    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
      extractColorsScored(m[1], scores);
    }

    // Find and fetch external CSS stylesheets
    const baseUrl = new URL(url);
    const cssUrls = new Set<string>();
    for (const m of html.matchAll(/<link[^>]+rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["']([^"']+)["']/gi)) cssUrls.add(m[1]);
    for (const m of html.matchAll(/<link[^>]+href\s*=\s*["']([^"']+\.css[^"']*)["'][^>]*rel\s*=\s*["']stylesheet["']/gi)) cssUrls.add(m[1]);
    for (const m of html.matchAll(/<link[^>]+href\s*=\s*["']([^"']+\.css(?:\?[^"']*)?)["']/gi)) cssUrls.add(m[1]);

    const cssPromises = [...cssUrls].slice(0, 8).map(async (cssHref) => {
      try {
        const cssUrl = cssHref.startsWith("http")
          ? cssHref
          : cssHref.startsWith("//")
            ? `${baseUrl.protocol}${cssHref}`
            : new URL(cssHref, baseUrl.origin).href;

        const cssRes = await fetch(cssUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          signal: AbortSignal.timeout(5000),
        });
        if (cssRes.ok) {
          const cssText = await cssRes.text();
          extractColorsScored(cssText, scores);

          // Follow @import rules (1 level deep)
          for (const imp of cssText.matchAll(/@import\s+(?:url\()?["']?([^"');\s]+)["']?\)?/g)) {
            try {
              const importUrl = imp[1].startsWith("http") ? imp[1] : new URL(imp[1], cssUrl).href;
              const impRes = await fetch(importUrl, {
                headers: { "User-Agent": "Mozilla/5.0" },
                signal: AbortSignal.timeout(3000),
              });
              if (impRes.ok) extractColorsScored(await impRes.text(), scores);
            } catch { /* skip */ }
          }
        }
      } catch { /* skip */ }
    });
    await Promise.all(cssPromises);

    // Filter and rank
    const entries = [...scores.entries()]
      .filter(([c]) => {
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        // Skip near-white and near-black (they'll be added back)
        if (r > 245 && g > 245 && b > 245) return false;
        if (r < 10 && g < 10 && b < 10) return false;
        return true;
      })
      .map(([color, score]) => {
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        const lum = (max + min) / 2;
        return { color, score, sat, lum };
      })
      // Sort by score (how many times used in visual props), then by saturation
      .sort((a, b) => b.score - a.score || b.sat - a.sat);

    // Deduplicate similar colors (keep higher-scored one)
    const deduped: typeof entries = [];
    for (const c of entries) {
      const r1 = parseInt(c.color.slice(1, 3), 16);
      const g1 = parseInt(c.color.slice(3, 5), 16);
      const b1 = parseInt(c.color.slice(5, 7), 16);
      const tooClose = deduped.some((d) => {
        const r2 = parseInt(d.color.slice(1, 3), 16);
        const g2 = parseInt(d.color.slice(3, 5), 16);
        const b2 = parseInt(d.color.slice(5, 7), 16);
        return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) < 30;
      });
      if (!tooClose) deduped.push(c);
    }

    // Take top-scored saturated colors first, then neutrals
    const saturated = deduped.filter((c) => c.sat > 0.08).slice(0, 8);
    const neutrals = deduped.filter((c) => c.sat <= 0.08 && c.score >= 3).sort((a, b) => b.lum - a.lum).slice(0, 4);
    const palette = [...saturated, ...neutrals].map((c) => c.color);

    // Always include white and a dark color
    if (!palette.includes("#ffffff")) palette.push("#ffffff");
    if (!palette.some((c) => {
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      return r < 40 && g < 40 && b < 40;
    })) {
      palette.push("#1a1a1a");
    }

    return NextResponse.json({ colors: palette.slice(0, 14) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
