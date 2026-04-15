import Link from "next/link";

const CATEGORIES = [
  "Santé", "Collectivité", "Résidentiel", "Commerce", "Bureaux",
  "Hôtellerie", "Distribution", "Industrie", "Agriculture",
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  "Santé": "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.332.78-4.5 2-1.168-1.22-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  "Collectivité": "M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16",
  "Résidentiel": "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  "Commerce": "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  "Bureaux": "M20 7h-9M14 17H5M17 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM3 7a2 2 0 1 0 4 0A2 2 0 0 0 3 7zM7 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM14 7h7M3 12h4M11 12h10M5 17h2",
  "Hôtellerie": "M18 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V4a2 2 0 0 0-2-2z",
  "Distribution": "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  "Industrie": "M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
  "Agriculture": "M7 20h10M10 20c5.5-2.5.8-6.4 3-10 .1-1.5 1-2.8 2-3.8M17 4c.7.9 1.2 1.9 1.4 3 .3 1.4 0 2.8-.6 4-.7 1.3-1.7 2.3-2.8 3.2M6.7 7c-.4 1.2-.5 2.5-.2 3.8.3 1.2.9 2.3 1.8 3.2",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Santé": "#E74C3C",
  "Collectivité": "#3498DB",
  "Résidentiel": "#E67E22",
  "Commerce": "#9B59B6",
  "Bureaux": "#1ABC9C",
  "Hôtellerie": "#F39C12",
  "Distribution": "#2ECC71",
  "Industrie": "#95A5A6",
  "Agriculture": "#27AE60",
};

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

export default async function SummaryPage() {
  const landings = await getPublicLandings();
  const landingsByCategory: Record<string, Landing[]> = {};
  for (const l of landings) {
    const cat = l.category || "Autre";
    if (!landingsByCategory[cat]) landingsByCategory[cat] = [];
    landingsByCategory[cat].push(l);
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#0D0D0D", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,700;1,400&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ background: "#111", borderBottom: "1px solid #222", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2D9F46", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10 .1-1.5 1-2.8 2-3.8" />
            </svg>
          </div>
          <span style={{ color: "#fff", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>Eco Environnement</span>
        </div>
        <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/a-propos" style={{ color: "#aaa", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>À propos de nous</Link>
          <Link href="/app-admin" style={{ background: "#2D9F46", color: "#fff", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>Administration</Link>
        </nav>
      </header>

      {/* Hero section */}
      <section style={{ textAlign: "center", padding: "80px 20px 40px" }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, margin: "0 0 8px", lineHeight: 1.2 }}>
          Votre secteur <span style={{ fontFamily: "'Bodoni Moda', serif", fontStyle: "italic", fontWeight: 500, textDecoration: "underline", textDecorationColor: "#2D9F46", textUnderlineOffset: "6px", textDecorationThickness: "2px" }}>d&apos;activité</span>
        </h1>
        <p style={{ color: "#777", fontSize: "15px", fontWeight: 300, maxWidth: "600px", margin: "0 auto" }}>
          Choisissez votre secteur et on optimise énergétiquement votre bâtiment
        </p>
      </section>

      {/* Categories grid */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {CATEGORIES.map((cat) => {
            const catLandings = landingsByCategory[cat] || [];
            const color = CATEGORY_COLORS[cat] || "#2D9F46";
            const iconPath = CATEGORY_ICONS[cat] || "";
            return (
              <div key={cat} style={{
                background: "#161616",
                borderRadius: "16px",
                border: "1px solid #222",
                overflow: "hidden",
                transition: "transform 0.2s, border-color 0.2s",
              }}>
                <div style={{
                  height: "140px",
                  background: `linear-gradient(135deg, ${color}22, ${color}08)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: `2px solid ${color}44`,
                }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                    <path d={iconPath} />
                  </svg>
                </div>
                <div style={{ padding: "20px" }}>
                  <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: "0 0 12px" }}>{cat}</h2>
                  {catLandings.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {catLandings.map((l) => (
                        <Link
                          key={l.id}
                          href={l.slug ? `/${l.slug}` : `/l/${l.id}`}
                          style={{
                            color: color,
                            fontSize: "13px",
                            fontWeight: 500,
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            background: `${color}10`,
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          {l.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#555", fontSize: "12px", fontWeight: 400, margin: 0 }}>Aucune landing disponible</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #222", padding: "40px 20px", textAlign: "center" }}>
        <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>© Eco Environnement — Spécialiste de l&apos;optimisation énergétique</p>
      </footer>
    </div>
  );
}
