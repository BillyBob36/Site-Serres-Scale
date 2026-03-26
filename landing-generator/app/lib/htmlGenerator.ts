/**
 * Generates a complete standalone HTML+CSS landing page from block data.
 * Uses the REAL HTML structure from the original site-serres React components
 * with Tailwind CSS CDN and original images/SVGs.
 */

import { Block } from "./blockSchema";
import { originalContent } from "./originalContent";

// Base URL for images - configurable via environment or defaults to GitHub Pages
const IMG_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "https://billybob36.github.io/site-serres";
// Alias for backward compatibility
const IMG = IMG_BASE;

function gv(block: Block, fieldId: string): string {
  const field = block.fields.find((f) => f.id === fieldId);
  if (!field) return originalContent[fieldId] || "";
  // mode 'generated' or 'manual' uses field.value, 'original' uses originalContent
  if ((field.mode === 'generated' || field.mode === 'manual') && field.value) {
    return field.value;
  }
  return originalContent[fieldId] || field.value || "";
}

function esc(s: unknown): string {
  const str = String(s ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tryJSON(s: string): unknown[] | null {
  try {
    const cleaned = s.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function generateLandingHTML(blocks: Block[]): string {
  const enabled = blocks.filter((b) => b.enabled);
  let html = "";
  for (const b of enabled) {
    switch (b.id) {
      case "header": html += genHeader(b); break;
      case "bloc1": html += genHero(b); break;
      case "bloc4": html += genDefi(b); break;
      case "bloc5": html += genSolution(b); break;
      case "bloc3": html += genConfiance(b); break;
      case "bloc2": html += genPartenaire(b); break;
      case "bloc9": html += genCEE(b); break;
      case "bloc10": html += genConditions(b); break;
      case "bloc12": html += genMethode(b); break;
      case "bloc13": html += genFAQ(b); break;
      case "bloc15": html += genContact(b); break;
      case "bloc16": html += genFooter(b); break;
    }
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Landing Page — Aperçu</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap" rel="stylesheet"/>
<style>
body{font-family:'Poppins',sans-serif;margin:0;padding:0;overflow-x:hidden}
.font-heading{font-family:'Bodoni Moda',serif}
.font-body{font-family:'Poppins',sans-serif}
</style>
</head>
<body class="bg-white text-[#1A1A1A]">
${html}
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════
   HEADER — fidèle à Header.tsx
   ═══════════════════════════════════════════════════════════ */
function genHeader(b: Block): string {
  const badge = esc(gv(b, "header_badge"));
  const i1t = esc(gv(b, "header_item1_text"));
  const i1b = esc(gv(b, "header_item1_bold"));
  const i2t = esc(gv(b, "header_item2_text"));
  const i2b = esc(gv(b, "header_item2_bold"));
  const cta = esc(gv(b, "header_cta"));
  const links = gv(b, "header_nav_links").split("|").map((l: string) => l.trim()).filter(Boolean);

  return `
<header class="w-full sticky top-0 z-50 shadow-md">
  <div class="w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 h-[64px] text-[13px]" style="background-color:#FFE500;color:#1A1A1A">
    <span class="font-bold text-[11px] px-4 py-1 rounded uppercase tracking-wider shrink-0" style="background-color:#1B7A2B;color:#fff;font-family:'Poppins',sans-serif">${badge}</span>
    <div class="hidden sm:flex items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="text-[14px] font-bold" style="font-family:'Poppins',sans-serif;color:#111">${i1t}</span>
        <div class="bg-white rounded-[6px] px-2.5 py-0.5 flex items-center justify-center" style="min-height:28px;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
          <span class="text-[18px] font-extrabold leading-none tracking-tight" style="font-family:'Poppins',sans-serif;color:#111">${i1b}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[14px] font-bold" style="font-family:'Poppins',sans-serif;color:#111">${i2t}</span>
        <div class="bg-white rounded-[6px] px-2.5 py-0.5 flex items-center justify-center" style="min-height:28px;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
          <span class="text-[14px]" style="font-family:'Bodoni Moda',serif;font-style:italic;font-weight:500;color:#111">${i2b}</span>
        </div>
      </div>
    </div>
  </div>
  <nav class="w-full flex items-center justify-between px-5 sm:px-10 h-[64px] border-b border-gray-100" style="background-color:#fff">
    <img src="${IMG}/images/logo-serres.svg" alt="Logo" class="object-contain max-h-[32px] w-auto"/>
    <div class="hidden md:flex items-center gap-8">
      ${links.map((l: string) => `<a href="#" class="text-[14px] font-medium hover:opacity-70 transition-opacity" style="color:#333;font-family:'Poppins',sans-serif">${esc(l)}</a>`).join("")}
    </div>
    <a href="#contact" class="hidden sm:inline-block px-7 py-2.5 rounded-lg text-[14px] font-bold transition-transform hover:scale-105" style="background-color:#1B7A2B;color:#fff;font-family:'Poppins',sans-serif">${cta}</a>
  </nav>
</header>`;
}

/* ═══════════════════════════════════════════════════════════
   HERO — fidèle à Bloc1Hero.tsx
   ═══════════════════════════════════════════════════════════ */
function genHero(b: Block): string {
  const badge = esc(gv(b, "hero_badge"));
  const l1 = esc(gv(b, "hero_title_line1"));
  const l2 = esc(gv(b, "hero_title_line2"));
  const l3 = esc(gv(b, "hero_title_line3"));
  const sub = esc(gv(b, "hero_subtitle"));
  const amt = esc(gv(b, "hero_pricebox_amount"));
  const ptx = esc(gv(b, "hero_pricebox_text"));
  const c1 = esc(gv(b, "hero_cta1"));
  const c2 = esc(gv(b, "hero_cta2"));
  const sup = esc(gv(b, "hero_support_text"));
  const stats = tryJSON(gv(b, "hero_stats")) as {value:string;label:string}[] | null;

  return `
<section id="bloc-hero" class="w-full overflow-hidden">
  <div class="flex flex-col lg:flex-row" style="min-height:calc(100vh - 128px)">
    <div class="lg:w-[52%] px-5 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 flex flex-col justify-center" style="background-color:#FFE500">
      <span class="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-semibold px-3.5 py-1.5 rounded-md w-fit mb-3 sm:mb-4" style="background-color:#1A1A1A;color:#fff;font-family:'Poppins',sans-serif">
        <img src="${IMG}/images/agriculture.svg" alt="" class="w-[14px] h-[14px] object-contain"/>
        ${badge}
      </span>
      <h1 class="text-[1.5rem] sm:text-[2rem] md:text-[2.4rem] lg:text-[2.9rem] font-bold leading-[1.15] sm:leading-[1.2] mb-3 sm:mb-4" style="color:#000;font-family:'Poppins',sans-serif">
        ${l1}<br/>
        <em style="font-family:'Bodoni Moda',serif;font-style:italic;font-weight:500;text-decoration:underline;text-decoration-color:#fff;text-decoration-thickness:0.08em;text-underline-offset:0.15em">${l2}</em><br/>
        ${l3}
      </h1>
      <p class="text-[12px] sm:text-[13px] lg:text-[14.5px] leading-[1.6] mb-4 sm:mb-5 max-w-[550px] font-medium" style="color:#333;font-family:'Poppins',sans-serif">${sub}</p>
      <div class="rounded-xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-5 w-full max-w-[550px] flex gap-3 sm:gap-4 items-stretch" style="background-color:#FFF9E6">
        <span class="text-[2.2rem] sm:text-[3.6rem] font-bold flex items-center shrink-0 leading-none" style="color:#2D9F46;font-family:'Bodoni Moda',serif">${amt}</span>
        <div class="flex flex-col justify-center gap-1">
          <strong class="text-[13px] sm:text-[14px] font-semibold leading-tight" style="font-family:'Poppins',sans-serif">${ptx}</strong>
          <p class="text-[10px] sm:text-[11px] leading-[1.5] font-light" style="color:#555;font-family:'Poppins',sans-serif">Première estimation rapide avant étude détaillée.</p>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row flex-wrap gap-3">
        <a href="#bloc-conditions" class="px-6 py-3 rounded-md text-[13px] font-semibold transition-transform hover:scale-105 text-center shadow-sm" style="background-color:#1A1A1A;color:#fff;font-family:'Poppins',sans-serif">${c1}</a>
        <a href="#bloc-contact" class="px-6 py-3 rounded-md text-[13px] font-semibold transition-transform hover:scale-105 text-center shadow-sm" style="background-color:#fff;color:#1A1A1A;font-family:'Poppins',sans-serif">${c2}</a>
      </div>
      <p class="text-[11px] mt-3 font-light" style="color:#555;font-family:'Poppins',sans-serif">${sup}</p>
    </div>
    <div class="w-full lg:w-[48%] relative flex flex-col items-center justify-between bg-white p-0 overflow-hidden">
      <div class="flex-1 w-full flex items-center justify-center relative">
        <img src="${IMG}/images/pdf-extracts/page1_img1_1306x816.jpeg" alt="Déshumidificateur" class="w-full h-auto object-cover"/>
        <div class="absolute bottom-0 left-0 right-0 h-16" style="background:linear-gradient(to top,rgba(255,255,255,0.9),transparent)"></div>
      </div>
      ${stats ? `<div class="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-3 w-full justify-center lg:justify-end relative z-10 px-3 sm:px-4 pb-3 sm:pb-4">
        ${stats.map((s: {value:string;label:string}) => `<div class="flex flex-col items-center justify-center rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 flex-1 min-w-[90px] sm:min-w-[140px]" style="background-color:#2D9F46">
          <span class="text-xl sm:text-2xl lg:text-[1.6rem] font-bold leading-none" style="color:#fff;font-family:'Bodoni Moda',serif">${esc(s.value)}</span>
          <span class="text-[8px] sm:text-[10px] font-bold tracking-[0.08em] mt-1.5 text-center uppercase" style="color:#000;font-family:'Poppins',sans-serif;opacity:0.9">${esc(s.label)}</span>
        </div>`).join("")}
      </div>` : ""}
    </div>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   DÉFI — fidèle à Bloc4Defi.tsx
   ═══════════════════════════════════════════════════════════ */
function genDefi(b: Block): string {
  const bdg = esc(gv(b, "defi_badge"));
  const tp = gv(b, "defi_title").split("|").map((p: string) => p.trim());
  const sub = esc(gv(b, "defi_subtitle"));
  const cards = tryJSON(gv(b, "defi_cards")) as {title:string;text:string;badge:string}[] | null;

  return `
<section id="bloc-defi" class="w-full py-6 sm:py-8 lg:py-12 px-4 sm:px-8 lg:px-16 overflow-hidden relative" style="background-color:#fff">
  <div class="absolute inset-0 flex items-center justify-center pointer-events-none" style="opacity:0.04">
    <img src="${IMG}/images/eco-fond.svg" alt="" class="w-full max-w-[900px] h-auto object-contain"/>
  </div>
  <div class="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
    <div class="rounded-lg px-5 py-1.5 border mb-4" style="border-color:#FFE500;background-color:#fff">
      <span class="text-[13px] sm:text-[14px] font-medium" style="color:#000;font-family:'Poppins',sans-serif">${bdg}</span>
    </div>
    <h2 class="leading-[1.3] flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 mb-3 w-full">
      <span class="text-lg sm:text-xl lg:text-[1.5rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[0]||"")}</span>
      <span class="text-xl sm:text-2xl lg:text-[2rem] font-medium" style="color:#000;font-family:'Bodoni Moda',serif;text-decoration:underline;text-decoration-color:#FFE500;text-decoration-thickness:0.08em;text-underline-offset:6px">${esc(tp[1]||"")}</span>
    </h2>
    <p class="text-[13px] sm:text-[14px] lg:text-[15px] leading-[1.6] mb-6 sm:mb-8 font-light max-w-2xl" style="color:#444;font-family:'Poppins',sans-serif">${sub}</p>
    ${cards ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">${cards.map((c: {title:string;text:string;badge:string}) => `
      <div class="bg-white rounded-2xl border border-gray-200 px-5 sm:px-6 py-5 sm:py-6 text-left flex flex-col justify-between">
        <div>
          <h3 class="text-[14px] sm:text-[15px] lg:text-[16px] font-bold mb-2 leading-tight" style="color:#000;font-family:'Poppins',sans-serif">${esc(c.title)}</h3>
          <p class="text-[12px] sm:text-[13px] leading-[1.6] font-light mb-4" style="color:#444;font-family:'Poppins',sans-serif">${esc(c.text)}</p>
        </div>
        <div><span class="inline-block rounded-full px-4 py-1.5 text-[11px] sm:text-[12px] font-bold" style="background-color:#FFE500;color:#000;font-family:'Poppins',sans-serif">${esc(c.badge)}</span></div>
      </div>`).join("")}</div>` : ""}
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   SOLUTION — fidèle à Bloc5Solution.tsx
   ═══════════════════════════════════════════════════════════ */
function genSolution(b: Block): string {
  const bdg = esc(gv(b, "solution_badge"));
  const tp = gv(b, "solution_title").split("|").map((p: string) => p.trim());
  const par = gv(b, "solution_paragraph");
  const items = gv(b, "solution_checklist").split("\n").filter(Boolean);
  const steps = tryJSON(gv(b, "solution_steps")) as {title:string;text:string}[] | null;

  return `
<section id="bloc-solution" class="w-full py-6 sm:py-8 lg:py-12 px-4 sm:px-8 lg:px-16 overflow-hidden" style="background-color:#FFE500">
  <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 items-stretch">
    <div class="lg:w-[52%] flex flex-col justify-center">
      <span class="inline-block rounded-md px-4 py-1.5 text-[12px] sm:text-[13px] font-semibold w-fit mb-4" style="background-color:#2D9F46;color:#fff;font-family:'Poppins',sans-serif">${bdg}</span>
      <h2 class="mb-4 leading-[1.15]">
        <span class="text-[1.6rem] sm:text-[2rem] lg:text-[2.3rem] font-bold block" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[0]||"")}</span>
        <em class="text-[1.8rem] sm:text-[2.3rem] lg:text-[2.7rem] block italic" style="font-family:'Bodoni Moda',serif;font-weight:500;text-decoration:underline;text-decoration-color:#FFF;text-decoration-thickness:2px;text-underline-offset:4px;color:#000">${esc(tp[1]||"")}</em>
        <span class="text-[1.2rem] sm:text-[1.5rem] lg:text-[1.7rem] font-bold block mt-1" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[2]||"")}</span>
      </h2>
      <div class="flex flex-col gap-3 mb-4">
        <p class="text-[12px] sm:text-[13px] leading-[1.7] font-light" style="color:#222;font-family:'Poppins',sans-serif">${par}</p>
      </div>
      <ul class="flex flex-col gap-1.5">
        ${items.map((it: string) => `<li class="flex items-start gap-2"><span class="text-[16px] leading-none mt-0.5 shrink-0" style="color:#2D9F46">✔️</span><span class="text-[12px] sm:text-[13px] font-bold leading-[1.5]" style="color:#222;font-family:'Poppins',sans-serif">${esc(it)}</span></li>`).join("")}
      </ul>
    </div>
    <div class="lg:w-[48%] rounded-2xl px-5 sm:px-7 py-5 sm:py-6 flex flex-col justify-center" style="background-color:#fff">
      <h3 class="text-[1.1rem] sm:text-[1.3rem] lg:text-[1.5rem] font-bold mb-4 text-left" style="color:#000;font-family:'Poppins',sans-serif">Comment ça fonctionne</h3>
      <div class="flex flex-col gap-3.5">
        ${steps ? steps.map((s: {title:string;text:string}) => `<div class="rounded-[22px] px-5 sm:px-6 py-3.5 border-2" style="border-color:#2D9F46;background-color:#FFF">
          <p class="text-[13px] sm:text-[14px] font-bold mb-1 leading-tight" style="color:#000;font-family:'Poppins',sans-serif">${esc(s.title)}</p>
          <p class="text-[11px] sm:text-[12px] leading-[1.6] font-light" style="color:#555;font-family:'Poppins',sans-serif">${esc(s.text)}</p>
        </div>`).join("") : ""}
        <div class="rounded-[22px] px-5 sm:px-6 py-3.5 flex items-center gap-4 border-2" style="border-color:#FFE500;background-color:#FFE500">
          <span class="text-[2.5rem] sm:text-[3rem] font-medium leading-none shrink-0" style="color:#2D9F46;font-family:'Bodoni Moda',serif">0€</span>
          <div>
            <p class="text-[13px] sm:text-[14px] font-bold leading-tight mb-1" style="color:#000;font-family:'Poppins',sans-serif">de reste à charge</p>
            <p class="text-[11px] sm:text-[12px] font-normal leading-[1.5]" style="color:#555;font-family:'Poppins',sans-serif">Prime CEE = intégralité du coût d'installation</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   CONFIANCE — fidèle à Bloc3Confiance.tsx
   ═══════════════════════════════════════════════════════════ */
function genConfiance(b: Block): string {
  const bdg = esc(gv(b, "confiance_badge"));
  const title = esc(gv(b, "confiance_title"));
  const sub = esc(gv(b, "confiance_subtitle"));
  const partners = gv(b, "confiance_partners").split("\n").filter(Boolean);
  const stats = tryJSON(gv(b, "confiance_stats")) as {value:string;label:string}[] | null;
  const ttext = esc(gv(b, "confiance_testimonial_text"));
  const tauth = esc(gv(b, "confiance_testimonial_author"));

  return `
<section id="bloc-confiance" class="w-full py-5 sm:py-6 lg:py-8 px-4 sm:px-6 overflow-hidden" style="background-color:#F5F5F5">
  <div class="max-w-[1300px] mx-auto flex flex-col items-center text-center">
    <div class="rounded-md px-3 py-1.5 border mb-3" style="border-color:#2D9F46;background-color:transparent">
      <span class="text-[12px] sm:text-[13px] font-medium" style="color:#000;font-family:'Poppins',sans-serif">${bdg}</span>
    </div>
    <h2 class="leading-[1.3] flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 mb-3 w-full">
      <span class="text-lg sm:text-xl lg:text-[1.5rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${title}</span>
    </h2>
    <p class="text-[13px] sm:text-[14px] lg:text-[15px] leading-[1.5] mb-5 font-light max-w-3xl" style="color:#333;font-family:'Poppins',sans-serif">${sub}</p>
    <div class="flex flex-wrap justify-center gap-2 sm:gap-3 lg:flex-nowrap mb-6 w-full">
      ${partners.map((p: string) => `<div class="px-2.5 py-1 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-md shadow-sm"><span class="text-[8px] sm:text-[10px] lg:text-[12px] font-bold tracking-wide uppercase whitespace-nowrap" style="color:#111;font-family:'Poppins',sans-serif">${esc(p)}</span></div>`).join("")}
    </div>
    ${stats ? `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 w-full max-w-5xl mb-5">
      ${stats.map((s: {value:string;label:string}) => `<div class="flex flex-col items-center justify-center rounded-xl py-4 sm:py-5 px-4" style="background-color:#FFE500">
        <span class="text-2xl sm:text-4xl lg:text-[3rem] font-medium leading-none" style="color:#000;font-family:'Poppins',sans-serif">${esc(s.value)}</span>
        <p class="text-[12px] sm:text-[13px] lg:text-[14px] font-medium text-center leading-[1.3]" style="color:#000;font-family:'Poppins',sans-serif">${esc(s.label)}</p>
      </div>`).join("")}
    </div>` : ""}
    <div class="relative rounded-xl py-4 px-4 sm:py-6 sm:px-10 w-full max-w-4xl text-left shadow-sm bg-white">
      <div class="absolute top-1 left-2 sm:top-2 sm:left-4 leading-none" style="font-size:80px;font-family:serif;color:#F0F0F0;user-select:none">&ldquo;</div>
      <div class="relative z-10 pl-5 sm:pl-10">
        <p class="text-[13px] sm:text-[14px] lg:text-[15px] leading-[1.5] font-normal mb-2" style="color:#333;font-family:'Poppins',sans-serif">${ttext}</p>
        <p class="text-[11px] sm:text-[12px] lg:text-[13px] italic font-medium" style="color:#2D9F46;font-family:'Poppins',sans-serif">${tauth}</p>
      </div>
    </div>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   PARTENAIRE — fidèle à Bloc2Partenaire.tsx
   ═══════════════════════════════════════════════════════════ */
function genPartenaire(b: Block): string {
  const tp = gv(b, "partenaire_title").split("|").map((p: string) => p.trim());
  const par = gv(b, "partenaire_paragraph");
  const s2tp = gv(b, "partenaire_section2_title").split("|").map((p: string) => p.trim());
  const s2tx = esc(gv(b, "partenaire_section2_text"));
  const feats = gv(b, "partenaire_features").split("\n").filter(Boolean);

  return `
<section id="bloc-partenaire" class="w-full py-6 sm:py-8 lg:py-12 px-4 sm:px-8 lg:px-16 overflow-hidden" style="background-color:#fff">
  <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 sm:gap-10 lg:gap-14 items-center">
    <div class="lg:w-[48%] flex flex-col items-center justify-center gap-4 w-full">
      <img src="${IMG}/images/pdf-extracts/page1_img2_878x470.jpeg" alt="Partenariat" class="w-full object-contain rounded-lg"/>
      <div class="rounded-xl px-5 sm:px-10 py-4 sm:py-6 text-center w-fit border" style="background-color:#fff;border-color:#2D9F46">
        <p class="text-[13px] font-medium" style="color:#2D9F46;font-family:'Poppins',sans-serif">Partenariat officiel depuis</p>
        <p class="text-[2.8rem] sm:text-[4rem] font-extrabold italic mt-1 leading-none" style="color:#2D9F46;font-family:'Bodoni Moda',serif">2022</p>
        <p class="text-[9px] mt-1.5 font-medium" style="color:#2D9F46;font-family:'Poppins',sans-serif">Mandataire officiel Total Energies</p>
      </div>
    </div>
    <div class="lg:w-[52%] pt-2">
      <h2 class="mb-4 sm:mb-5 leading-[1.2]">
        <span class="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold block" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[0]||"")}</span>
        <span class="text-2xl sm:text-3xl lg:text-[2.5rem] font-medium italic block" style="color:#000;font-family:'Bodoni Moda',serif;text-decoration:underline;text-decoration-color:#FFE500;text-decoration-thickness:0.08em;text-underline-offset:0.15em">${esc(tp[1]||"")}</span>
        <span class="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold block mt-1" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[2]||"")}</span>
      </h2>
      <div class="flex flex-col gap-3 mb-6">
        <p class="text-[13px] sm:text-[14px] leading-[1.7] font-light" style="color:#333;font-family:'Poppins',sans-serif">${par}</p>
      </div>
      <h3 class="mb-3 sm:mb-4 leading-[1.3] flex flex-wrap items-baseline gap-2">
        <span class="text-xl sm:text-2xl lg:text-[2rem] font-medium italic" style="color:#000;font-family:'Bodoni Moda',serif;text-decoration:underline;text-decoration-color:#FFE500;text-decoration-thickness:0.08em;text-underline-offset:6px">${esc(s2tp[0]||"")}</span>
        <span class="text-lg sm:text-xl lg:text-[1.5rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${esc(s2tp[1]||"")}</span>
      </h3>
      <p class="text-[13px] sm:text-[14px] leading-[1.6] mb-5 sm:mb-6 font-light" style="color:#333;font-family:'Poppins',sans-serif">${s2tx}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${feats.map((f: string) => `<div class="rounded-xl border px-5 py-6 flex items-center justify-center text-center bg-white" style="border-color:#E0E0E0"><p class="text-[12.5px] font-bold leading-relaxed" style="color:#000;font-family:'Poppins',sans-serif">${esc(f)}</p></div>`).join("")}
      </div>
    </div>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   CEE — fidèle à Bloc9CEE.tsx
   ═══════════════════════════════════════════════════════════ */
function genCEE(b: Block): string {
  const bdg = esc(gv(b, "cee_badge"));
  const tp = gv(b, "cee_title").split("|").map((p: string) => p.trim());
  const sub = esc(gv(b, "cee_subtitle"));
  const ft = esc(gv(b, "cee_formula_title"));
  const fm = esc(gv(b, "cee_formula"));
  const rows = tryJSON(gv(b, "cee_example_rows")) as {label:string;value:string}[] | null;
  const regl = gv(b, "cee_reglementary").split("\n").filter(Boolean);

  return `
<section id="bloc-cee" class="w-full py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 overflow-hidden" style="background-color:#FFE500">
  <div class="max-w-[1100px] mx-auto flex flex-col items-center text-center">
    <div class="rounded-lg px-4 sm:px-6 py-1.5 border mb-4 sm:mb-5" style="border-color:#1A1A1A;background-color:#1A1A1A">
      <span class="text-[12px] sm:text-[13px] font-medium" style="color:#fff;font-family:'Poppins',sans-serif">${bdg}</span>
    </div>
    <h2 class="leading-[1.2] flex flex-wrap justify-center items-baseline gap-x-2 gap-y-0 mb-2 sm:mb-3 w-full">
      <span class="text-xl sm:text-2xl lg:text-[2rem] font-medium" style="color:#000;font-family:'Bodoni Moda',serif">${esc(tp[0]||"")}</span>
      <span class="text-lg sm:text-xl lg:text-[1.5rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[1]||"")}</span>
    </h2>
    <p class="text-[12px] sm:text-[13px] lg:text-[14px] leading-[1.6] mb-5 sm:mb-6 font-light max-w-3xl whitespace-pre-line" style="color:#333;font-family:'Poppins',sans-serif">${sub}</p>
    <div class="flex flex-col lg:flex-row gap-5 sm:gap-6 w-full items-start text-left">
      <div class="flex flex-col gap-4 lg:w-[48%]">
        <div class="rounded-[18px] px-5 py-4 flex flex-col" style="background-color:#C9E4D6">
          <h3 class="text-[13px] sm:text-[14px] font-bold mb-2" style="color:#000;font-family:'Poppins',sans-serif">${ft}</h3>
          <p class="text-[1.3rem] sm:text-[1.6rem] lg:text-[1.9rem] font-bold leading-tight mb-1" style="color:#fff;font-family:'Poppins',sans-serif">${fm}</p>
          <p class="text-[10px] sm:text-[11px] font-medium" style="color:#000;font-family:'Poppins',sans-serif">Premier repère avant étude détaillée.</p>
        </div>
        ${rows ? `<div class="rounded-[18px] px-5 py-4 flex flex-col" style="background-color:#009B3A">
          <h3 class="text-[13px] sm:text-[14px] font-bold mb-3 text-white" style="font-family:'Poppins',sans-serif">Exemple indicatif — 4 000 m² de serre</h3>
          <div class="flex flex-col gap-1 mb-3">
            ${rows.map((r: {label:string;value:string}) => `<div class="flex justify-between items-center text-white border-b border-white/20 pb-1">
              <span class="text-[11px] sm:text-[12px] font-light">${esc(r.label)}</span>
              <span class="text-[11px] sm:text-[12px] font-bold text-right">${esc(r.value)}</span>
            </div>`).join("")}
          </div>
          <div class="flex justify-between items-center text-white mt-1 mb-1">
            <span class="text-[13px] sm:text-[14px] font-bold">Reste à charge exploitant</span>
            <span class="text-[16px] sm:text-[18px] font-black">0 €</span>
          </div>
        </div>` : ""}
      </div>
      <div class="flex flex-col lg:w-[52%] gap-4">
        <div class="rounded-[20px] px-5 sm:px-7 py-5 sm:py-6 flex flex-col items-center text-center" style="background-color:#fff">
          <img src="${IMG}/images/agriculture.svg" alt="" class="w-10 h-10 mb-3 object-contain"/>
          <h3 class="text-[1rem] sm:text-[1.15rem] font-bold mb-3" style="color:#009B3A;font-family:'Poppins',sans-serif">Repères réglementaires</h3>
          <div class="flex flex-col gap-2 mb-5 w-full">
            ${regl.map((r: string) => `<p class="text-[11px] sm:text-[12px] leading-[1.6] font-light" style="color:#333;font-family:'Poppins',sans-serif">${esc(r)}</p>`).join("")}
          </div>
          <a href="#" class="rounded-lg px-6 py-2.5 text-[12px] sm:text-[13px] font-bold border-2 transition-colors hover:bg-black hover:text-white mx-auto" style="border-color:#000;background-color:transparent;color:#000;font-family:'Poppins',sans-serif">Vérifier l'éligibilité de ma serre</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   CONDITIONS — fidèle à Bloc10Conditions.tsx
   ═══════════════════════════════════════════════════════════ */
function genConditions(b: Block): string {
  const bdg = esc(gv(b, "conditions_badge"));
  const tp = gv(b, "conditions_title").split("|").map((p: string) => p.trim());
  const sub = esc(gv(b, "conditions_subtitle"));
  const cards = tryJSON(gv(b, "conditions_cards")) as {title:string;text:string}[] | null;
  const cta = esc(gv(b, "conditions_cta"));
  const left = cards ? cards.filter((_: unknown, i: number) => i % 2 === 0) : [];
  const right = cards ? cards.filter((_: unknown, i: number) => i % 2 === 1) : [];

  return `
<section id="bloc-conditions" class="w-full py-4 sm:py-5 lg:py-6 px-4 sm:px-6 lg:px-8 overflow-hidden" style="background-color:#fff">
  <div class="max-w-[1100px] mx-auto flex flex-col items-center text-center">
    <div class="rounded-lg px-4 sm:px-6 py-1.5 border mb-3" style="border-color:#FFE500;background-color:#fff">
      <span class="text-[12px] sm:text-[13px] font-medium" style="color:#000;font-family:'Poppins',sans-serif">${bdg}</span>
    </div>
    <h2 class="leading-[1.2] flex flex-wrap justify-center items-baseline gap-x-2 gap-y-0 mb-2 w-full">
      <span class="text-lg sm:text-xl lg:text-[1.6rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[0]||"")}</span>
      <span class="text-xl sm:text-2xl lg:text-[2rem] font-medium" style="color:#000;font-family:'Bodoni Moda',serif;text-decoration:underline;text-decoration-color:#FFE500;text-decoration-thickness:0.1em;text-underline-offset:4px">${esc(tp[1]||"")}</span>
      <span class="text-lg sm:text-xl lg:text-[1.6rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[2]||"")}</span>
    </h2>
    <p class="text-[12px] sm:text-[13px] lg:text-[14px] leading-[1.6] mb-5 sm:mb-6 font-light max-w-xl whitespace-pre-line" style="color:#555;font-family:'Poppins',sans-serif">${sub}</p>
    <div class="flex flex-col md:flex-row gap-4 sm:gap-5 w-full max-w-[950px] items-start">
      <div class="flex flex-col gap-4 sm:gap-5 w-full md:w-1/2">
        ${left.map((c: {title:string;text:string}) => `<div class="w-full border-2 px-5 py-4 text-left" style="border-color:#FFE500;background-color:#fff">
          <h3 class="text-[13px] sm:text-[14px] lg:text-[15px] font-bold mb-2" style="color:#000;font-family:'Poppins',sans-serif">${esc(c.title)}</h3>
          <p class="text-[11px] sm:text-[12px] lg:text-[13px] leading-[1.5] font-light" style="color:#333;font-family:'Poppins',sans-serif">${esc(c.text)}</p>
        </div>`).join("")}
      </div>
      <div class="flex flex-col gap-4 sm:gap-5 w-full md:w-1/2 md:mt-10 lg:mt-12">
        ${right.map((c: {title:string;text:string}) => `<div class="w-full border-2 px-5 py-4 text-left" style="border-color:#FFE500;background-color:#fff">
          <h3 class="text-[13px] sm:text-[14px] lg:text-[15px] font-bold mb-2" style="color:#000;font-family:'Poppins',sans-serif">${esc(c.title)}</h3>
          <p class="text-[11px] sm:text-[12px] lg:text-[13px] leading-[1.5] font-light" style="color:#333;font-family:'Poppins',sans-serif">${esc(c.text)}</p>
        </div>`).join("")}
      </div>
    </div>
    <a href="#" class="mt-6 sm:mt-8 rounded-lg px-6 py-2.5 text-[12px] sm:text-[13px] font-bold transition-transform hover:scale-105" style="background-color:#FFE500;color:#000;font-family:'Poppins',sans-serif">${cta}</a>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   MÉTHODE — fidèle à Bloc12Methode.tsx
   ═══════════════════════════════════════════════════════════ */
function genMethode(b: Block): string {
  const bdg = esc(gv(b, "methode_badge"));
  const tp = gv(b, "methode_title").split("|").map((p: string) => p.trim());
  const sub = esc(gv(b, "methode_subtitle"));
  const steps = tryJSON(gv(b, "methode_steps")) as {number:string;title:string;text:string}[] | null;
  const bh = esc(gv(b, "methode_banner_heading"));
  const bt = esc(gv(b, "methode_banner_text"));

  return `
<section id="bloc-methode" class="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 overflow-hidden" style="background:linear-gradient(to bottom,#FFE500 0%,#FFE500 82%,#ECECEC 82%,#ECECEC 100%)">
  <div class="max-w-[1240px] mx-auto flex flex-col items-center text-center">
    <div class="rounded-lg px-5 sm:px-7 py-1.5 mb-5" style="background-color:#1A1A1A">
      <span class="text-[12px] sm:text-[13px] font-medium" style="color:#fff;font-family:'Poppins',sans-serif">${bdg}</span>
    </div>
    <h2 class="leading-[1.2] flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 mb-3 w-full max-w-5xl">
      <span class="text-[1.12rem] sm:text-[1.3rem] lg:text-[1.72rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[0]||"")}</span>
      <span class="text-[1.12rem] sm:text-[1.3rem] lg:text-[1.72rem] font-medium" style="color:#000;font-family:'Bodoni Moda',serif;text-decoration:underline;text-decoration-color:#fff;text-decoration-thickness:0.08em;text-underline-offset:5px">${esc(tp[1]||"")}</span>
      <span class="text-[1.12rem] sm:text-[1.3rem] lg:text-[1.72rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${esc(tp[2]||"")}</span>
    </h2>
    <p class="text-[12px] sm:text-[13px] lg:text-[14px] leading-[1.45] font-light mb-7 sm:mb-9 max-w-3xl whitespace-pre-line" style="color:#222;font-family:'Poppins',sans-serif">${sub}</p>
    <div class="w-full relative mb-8 sm:mb-10">
      <div class="hidden lg:block absolute left-[10%] right-[10%] top-[22px] border-t-4 border-dotted" style="border-color:#FFFFFF"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-4 relative z-10">
        ${steps ? steps.map((s: {number:string;title:string;text:string}) => `<article class="flex flex-col items-center text-center px-1">
          <div class="w-11 h-11 rounded-full flex items-center justify-center mb-3" style="background-color:#FFF">
            <span class="text-[2.1rem] leading-none" style="color:#FFE500;font-family:'Poppins',sans-serif">${esc(s.number)}</span>
          </div>
          <h3 class="text-[1.05rem] sm:text-[1.15rem] font-bold leading-[1.25] mb-2" style="color:#111;font-family:'Poppins',sans-serif">${esc(s.title)}</h3>
          <p class="text-[11px] sm:text-[12px] leading-[1.35] font-light max-w-[220px]" style="color:#111;font-family:'Poppins',sans-serif">${esc(s.text)}</p>
        </article>`).join("") : ""}
      </div>
    </div>
    <div class="w-full rounded-[16px] px-5 sm:px-7 lg:px-10 py-5 sm:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden" style="background-color:#00A84A">
      <img src="${IMG}/images/agriculture.svg" alt="" class="absolute right-4 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 w-[180px] h-[120px] opacity-20 pointer-events-none object-contain"/>
      <div class="relative z-10 md:w-[72%] text-left">
        <h3 class="text-[0.95rem] sm:text-[1.05rem] lg:text-[1.15rem] font-bold leading-[1.2] mb-2 md:whitespace-nowrap" style="color:#FFFFFF;font-family:'Poppins',sans-serif">${bh}</h3>
        <p class="text-[12px] sm:text-[13px] leading-[1.45] font-light mb-4" style="color:#FFFFFF;font-family:'Poppins',sans-serif">${bt}</p>
        <a href="#" class="inline-flex rounded-md px-4 sm:px-5 py-2 text-[11px] sm:text-[12px] font-bold" style="background-color:#FFE500;color:#000;font-family:'Poppins',sans-serif">Démarrer mon projet — étude gratuite</a>
      </div>
      <div class="relative z-10 md:w-[25%] w-full flex justify-start md:justify-end">
        <span class="text-[4.4rem] sm:text-[5.1rem] lg:text-[5.8rem] leading-none" style="color:#fff;font-family:'Bodoni Moda',serif">-38%</span>
      </div>
    </div>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   FAQ — fidèle à Bloc13FAQ.tsx
   ═══════════════════════════════════════════════════════════ */
function genFAQ(b: Block): string {
  const bdg = esc(gv(b, "faq_badge"));
  const title = esc(gv(b, "faq_title"));
  const sub = esc(gv(b, "faq_subtitle"));
  const items = tryJSON(gv(b, "faq_items")) as {question:string;answers:string[]}[] | null;

  return `
<section id="bloc-faq" class="w-full py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 overflow-hidden" style="background-color:#EFEFEF">
  <div class="max-w-[1180px] mx-auto flex flex-col items-center text-center">
    <div class="rounded-lg px-5 sm:px-7 py-1.5 border mb-5" style="border-color:#FFE500;background-color:#fff">
      <span class="text-[12px] sm:text-[13px] font-medium" style="color:#000;font-family:'Poppins',sans-serif">${bdg}</span>
    </div>
    <h2 class="leading-[1.2] flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1 mb-3 w-full max-w-5xl">
      <span class="text-[1.25rem] sm:text-[1.45rem] lg:text-[1.95rem] font-medium" style="color:#000;font-family:'Bodoni Moda',serif;text-decoration:underline;text-decoration-color:#FFE500;text-decoration-thickness:0.08em;text-underline-offset:6px">${title}</span>
    </h2>
    <p class="text-[12px] sm:text-[13px] lg:text-[14px] leading-[1.45] font-light mb-7 sm:mb-8 max-w-3xl whitespace-pre-line" style="color:#3A3A3A;font-family:'Poppins',sans-serif">${sub}</p>
    <div class="w-full max-w-[980px] flex flex-col gap-2.5 sm:gap-3 text-left">
      ${items ? items.map((it: {question:string;answers:string[]}) => `
      <details class="rounded-[14px] border overflow-hidden" style="border-color:#CFCFCF;background-color:#F7F7F7">
        <summary class="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left cursor-pointer" style="list-style:none">
          <span class="text-[0.92rem] sm:text-[1rem] font-bold leading-[1.25]" style="color:#000;font-family:'Poppins',sans-serif">${esc(it.question)}</span>
          <span class="shrink-0" style="color:#FFE500">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </summary>
        <div class="px-5 sm:px-6 pb-5">
          <div class="h-px w-full mb-4" style="background-color:#CFCFCF"></div>
          <div class="flex flex-col gap-3">
            ${(it.answers||[]).map((a: string) => `<p class="text-[12px] sm:text-[13px] lg:text-[14px] leading-[1.6] font-light" style="color:#353535;font-family:'Poppins',sans-serif">${esc(a)}</p>`).join("")}
          </div>
        </div>
      </details>`).join("") : ""}
    </div>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   CONTACT — fidèle à Bloc15Contact.tsx
   ═══════════════════════════════════════════════════════════ */
function genContact(b: Block): string {
  const title = esc(gv(b, "contact_title"));
  const sub = esc(gv(b, "contact_subtitle"));
  const sub2 = esc(gv(b, "contact_subtitle2"));
  const submit = esc(gv(b, "contact_submit"));

  return `
<section id="bloc-contact" class="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 overflow-hidden" style="background-color:#fff">
  <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 lg:gap-8 items-center">
    <div class="flex justify-center lg:justify-start">
      <img src="${IMG}/images/agriculture.svg" alt="Illustration" class="w-[220px] sm:w-[260px] lg:w-[300px] h-auto object-contain"/>
    </div>
    <div class="w-full">
      <h2 class="leading-[1.12] flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-5 sm:mb-6">
        <span class="text-[1.45rem] sm:text-[1.75rem] lg:text-[2rem] font-bold" style="color:#000;font-family:'Poppins',sans-serif">${title}</span>
      </h2>
      <p class="text-[12px] sm:text-[13px] leading-[1.6] mb-3 font-light" style="color:#333;font-family:'Poppins',sans-serif">${sub}</p>
      <p class="text-[11px] sm:text-[12px] leading-[1.5] mb-5 font-light" style="color:#555;font-family:'Poppins',sans-serif">${sub2}</p>
      <form class="flex flex-col gap-2.5 sm:gap-3" action="#" method="post">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <input type="text" placeholder="Société" class="h-[38px] sm:h-[40px] rounded-[7px] border px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-light outline-none" style="border-color:#BCBCBC;color:#1F1F1F;font-family:'Poppins',sans-serif;background-color:#EFEFEF"/>
          <input type="text" placeholder="Fonction" class="h-[38px] sm:h-[40px] rounded-[7px] border px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-light outline-none" style="border-color:#BCBCBC;color:#1F1F1F;font-family:'Poppins',sans-serif;background-color:#EFEFEF"/>
          <input type="text" placeholder="Nom" class="h-[38px] sm:h-[40px] rounded-[7px] border px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-light outline-none" style="border-color:#BCBCBC;color:#1F1F1F;font-family:'Poppins',sans-serif;background-color:#EFEFEF"/>
          <input type="text" placeholder="Prénom" class="h-[38px] sm:h-[40px] rounded-[7px] border px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-light outline-none" style="border-color:#BCBCBC;color:#1F1F1F;font-family:'Poppins',sans-serif;background-color:#EFEFEF"/>
          <input type="email" placeholder="E-mail" class="h-[38px] sm:h-[40px] rounded-[7px] border px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-light outline-none" style="border-color:#BCBCBC;color:#1F1F1F;font-family:'Poppins',sans-serif;background-color:#EFEFEF"/>
          <input type="tel" placeholder="Téléphone" class="h-[38px] sm:h-[40px] rounded-[7px] border px-3 sm:px-3.5 text-[12px] sm:text-[13px] font-light outline-none" style="border-color:#BCBCBC;color:#1F1F1F;font-family:'Poppins',sans-serif;background-color:#EFEFEF"/>
        </div>
        <div class="pt-1">
          <button type="submit" class="inline-flex items-center justify-center rounded-[8px] px-5 sm:px-6 h-[34px] text-[12px] sm:text-[12.5px] font-semibold w-fit" style="background-color:#FFE500;color:#111111;font-family:'Poppins',sans-serif">${submit}</button>
        </div>
      </form>
    </div>
  </div>
</section>`;
}

/* ═══════════════════════════════════════════════════════════
   FOOTER — fidèle à Bloc16Footer.tsx
   ═══════════════════════════════════════════════════════════ */
function genFooter(b: Block): string {
  const desc = esc(gv(b, "footer_description"));
  const copy = esc(gv(b, "footer_copyright"));

  return `
<footer id="bloc-footer" class="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12" style="background-color:#FFE500">
  <div class="max-w-[1240px] mx-auto flex flex-col gap-10 lg:gap-14">
    <div class="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
      <div class="lg:w-[40%] flex flex-col gap-5">
        <img src="${IMG}/images/logo-eco-Horizontblanc.svg" alt="Eco Environnement" class="w-[260px] sm:w-[320px] h-auto object-contain"/>
        <p class="text-[12px] sm:text-[13px] leading-[1.6] font-medium" style="color:#000;font-family:'Poppins',sans-serif">${desc}</p>
      </div>
      <div class="lg:w-[55%] grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
        <div class="flex flex-col gap-4">
          <h3 class="text-[14px] sm:text-[15px] font-bold" style="color:#000;font-family:'Poppins',sans-serif">Contact &amp; informations</h3>
          <ul class="flex flex-col gap-2.5">
            <li><a href="#bloc-contact" class="text-[12px] sm:text-[13px] font-medium hover:opacity-70 transition-opacity" style="color:#000;font-family:'Poppins',sans-serif">Demander mon estimation gratuite</a></li>
            <li><a href="#" class="text-[12px] sm:text-[13px] font-medium hover:opacity-70 transition-opacity" style="color:#000;font-family:'Poppins',sans-serif">Mentions légales</a></li>
            <li><a href="#" class="text-[12px] sm:text-[13px] font-medium hover:opacity-70 transition-opacity" style="color:#000;font-family:'Poppins',sans-serif">Politique de confidentialité</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
      <p class="text-[11px] sm:text-[12px] font-medium" style="color:#000;font-family:'Poppins',sans-serif">${copy}</p>
    </div>
  </div>
</footer>`;
}
