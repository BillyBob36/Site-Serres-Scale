import fs from "fs";
import path from "path";
import { injectSummarySectorLinks } from "../lib/summarySectorLinks";

export const dynamic = "force-dynamic";

type Landing = {
  id: string;
  name: string;
  slug?: string | null;
  category?: string | null;
};

async function getPublicLandings(): Promise<Landing[]> {
  try {
    const { getDb } = await import("../lib/db");
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

function loadFragment(rel: string): string {
  const p = path.join(process.cwd(), "public", rel);
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf-8");
}

export default async function AboutPage() {
  const landings = await getPublicLandings();
  const byCategory: Record<string, Landing[]> = {};
  for (const l of landings) {
    const cat = l.category || "Autre";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(l);
  }

  const raw = loadFragment("about/fragment.html");
  const html = raw ? injectSummarySectorLinks(raw, byCategory) : "";

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
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap"
      />
      <link rel="stylesheet" href="/about/about.css" />
      <link rel="stylesheet" href="/summary-sector/layout-fix.css" />
      <script src="/js/eco-runtime.js" defer></script>

      {html ? (
        <div
          className="summary-sector-host"
          style={{ maxWidth: "100%", overflowX: "hidden" }}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div style={{ padding: 48, textAlign: "center", fontFamily: "system-ui" }}>
          <p style={{ color: "#666" }}>
            Page À propos absente. Lancer{" "}
            <code style={{ background: "#f4f4f4", padding: "2px 8px" }}>
              node scripts/scrape-about.mjs && node scripts/extract-pages.mjs
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
