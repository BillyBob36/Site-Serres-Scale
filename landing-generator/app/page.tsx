import Link from "next/link";
import fs from "fs";
import path from "path";
import { injectSummarySectorLinks } from "./lib/summarySectorLinks";

/** Liens secteur → landings : toujours à jour selon la BDD */
export const dynamic = "force-dynamic";

type Landing = { id: string; name: string; slug?: string | null; category?: string | null };

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

function loadSectorFragment(): string {
  const p = path.join(process.cwd(), "public", "summary-sector", "fragment.html");
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf-8");
}

export default async function SummaryPage() {
  const landings = await getPublicLandings();
  const landingsByCategory: Record<string, Landing[]> = {};
  for (const l of landings) {
    const cat = l.category || "Autre";
    if (!landingsByCategory[cat]) landingsByCategory[cat] = [];
    landingsByCategory[cat].push(l);
  }

  const rawFragment = loadSectorFragment();
  const sectorHtml = rawFragment
    ? injectSummarySectorLinks(rawFragment, landingsByCategory)
    : "";

  return (
    <div
      className="summary-root"
      style={{ margin: 0, minHeight: "100vh", background: "#fff", color: "#111" }}
    >
      <link rel="stylesheet" href="/summary-sector/sector.css" />

      <header
        style={{
          background: "#111",
          borderBottom: "1px solid #222",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#2D9F46",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10 .1-1.5 1-2.8 2-3.8" />
            </svg>
          </div>
          <span style={{ color: "#fff", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Eco Environnement
          </span>
        </div>
        <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link
            href="/a-propos"
            style={{ color: "#aaa", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}
          >
            À propos de nous
          </Link>
          <Link
            href="/app-admin"
            style={{
              background: "#2D9F46",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
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
          dangerouslySetInnerHTML={{
            __html: sectorHtml,
          }}
        />
      ) : (
        <div style={{ padding: "48px 24px", textAlign: "center", fontFamily: "Poppins, sans-serif" }}>
          <p style={{ color: "#666" }}>
            Bloc secteur indisponible. Exécutez{" "}
            <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: 4 }}>
              node scripts/extract-summary-sector.mjs
            </code>{" "}
            dans <code>landing-generator</code> (fichier <code>public/scraped-homepage.html</code> requis).
          </p>
        </div>
      )}

      <footer style={{ borderTop: "1px solid #e5e5e5", padding: "32px 20px", textAlign: "center", background: "#fafafa" }}>
        <p style={{ color: "#555", fontSize: "12px", margin: 0, fontFamily: "Poppins, sans-serif" }}>
          © Eco Environnement — Spécialiste de l&apos;optimisation énergétique
        </p>
      </footer>
    </div>
  );
}
