import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { cleanScrapedAboutHtml } from "@/app/lib/aboutScrapeClean";

/**
 * Sert la page « À propos » clone du site (HTML + CSS inlinés),
 * sans layout Next (évite le thème sombre global qui cassait la page React).
 */
export async function GET() {
  const filePath = path.join(process.cwd(), "public", "scraped-about.html");
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Page à propos non disponible" },
      { status: 404 },
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const cleaned = cleanScrapedAboutHtml(raw);

  return new NextResponse(cleaned, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
