import Link from "next/link";
import fs from "fs";
import path from "path";
import { injectSummarySectorLinks } from "./lib/summarySectorLinks";

export const dynamic = "force-dynamic";

type Landing = {
  id: string;
  name: string;
  slug?: string | null;
  category?: string | null;
};

async function getPublicLandings(): Promise<Landing[]> {
  try {
    const { getDb } = await import("./lib/db");
    const prisma = await getDb();
    return await prisma.landing.findMany({
      where: { showInSummary: true },
      select: { id: true, name: true, slug: true, category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

function loadSectorHtml(): string {
  const p = path.join(process.cwd(), "public", "summary-sector", "fragment.html");
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf-8");
}

export default async function SummaryPage() {
  const landings = await getPublicLandings();
  const byCategory: Record<string, Landing[]> = {};
  for (const l of landings) {
    const cat = l.category || "Autre";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(l);
  }

  const raw = loadSectorHtml();
  const sectorHtml = raw ? injectSummarySectorLinks(raw, byCategory) : "";

  return (
    <div
      className="summary-page-root"
      style={{
        margin: 0,
        minHeight: "100vh",
        background: "#ffffff",
        color: "#111111",
      }}
    >
      {/* Polices alignées sur ecoenvironnement.net (les @font-face du scrape sont retirés à l’extraction) */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap"
      />
      {/* CSS du site d’origine (Elementor) — images en data URL dans le fragment */}
      <link rel="stylesheet" href="/summary-sector/sector.css" />
      <link rel="stylesheet" href="/summary-sector/layout-fix.css" />

      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e5e5",
          padding: "0 40px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          {/* <img> : Next/Image bloque souvent les SVG locaux en prod */}
          <img src="/images/about/eco-logo.svg" alt="Eco Environnement" width={140} height={44} />
        </Link>
        <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link
            href="/a-propos"
            style={{
              color: "#333",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            À propos de nous
          </Link>
          <Link
            href="/app-admin"
            style={{
              background: "#00A340",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Administration
          </Link>
        </nav>
      </header>

      {sectorHtml ? (
        <div
          className="summary-sector-host"
          style={{ maxWidth: "100%", overflowX: "hidden" }}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: sectorHtml }}
        />
      ) : (
        <div style={{ padding: 48, textAlign: "center", fontFamily: "system-ui" }}>
          <p style={{ color: "#666" }}>
            Bloc secteur manquant. Lancer{" "}
            <code style={{ background: "#f4f4f4", padding: "2px 8px" }}>
              node scripts/extract-summary-sector.mjs
            </code>{" "}
            (fichier <code>public/scraped-homepage.html</code> requis). Pour mettre à jour l’aspiration :{" "}
            <code>node scripts/scrape-homepage.mjs</code>
          </p>
        </div>
      )}

      <footer
        style={{
          borderTop: "1px solid #e5e5e5",
          padding: "32px 20px",
          textAlign: "center",
          background: "#fafafa",
        }}
      >
        <p style={{ color: "#999", fontSize: 12, margin: 0, fontFamily: "'Poppins', sans-serif" }}>
          © Eco Environnement — Spécialiste de l&apos;optimisation énergétique
        </p>
      </footer>
    </div>
  );
}
