import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Landing = {
  id: string;
  name: string;
  slug?: string | null;
  category?: string | null;
};

const SECTORS = [
  { name: "Santé", slug: "sante", color: "#c6f9da" },
  { name: "Collectivité", slug: "collectivite", color: "#ff99cc" },
  { name: "Résidentiel", slug: "residentiel", color: "#99ccff" },
  { name: "Commerce", slug: "commerce", color: "#ffd1a3" },
  { name: "Bureaux", slug: "bureaux", color: "#cbb698" },
  { name: "Hôtellerie", slug: "hotellerie", color: "#f6a570" },
  { name: "Distribution", slug: "distribution", color: "#ccdc7c" },
  { name: "Industrie", slug: "industrie", color: "#cc99ff" },
  { name: "Agriculture", slug: "agriculture", color: "#fee327" },
] as const;

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
  const byCategory: Record<string, Landing[]> = {};
  for (const l of landings) {
    const cat = l.category || "Autre";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(l);
  }

  return (
    <div
      style={{
        margin: 0,
        minHeight: "100vh",
        background: "#ffffff",
        color: "#000000",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Poppins:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ── Header ── */}
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
          zIndex: 50,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/images/about/eco-logo.svg" alt="Eco Environnement" width={140} height={44} />
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

      {/* ── Titre « Votre secteur d'activité » ── */}
      <section style={{ textAlign: "center", padding: "60px 20px 12px" }}>
        <h2
          style={{
            fontSize: "clamp(32px, 5vw, 58px)",
            fontWeight: 600,
            color: "#000",
            margin: "0 0 12px",
            lineHeight: 1.15,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Votre secteur{" "}
          <span
            style={{
              fontFamily: "'Bodoni Moda', serif",
              fontStyle: "italic",
              fontWeight: 500,
            }}
          >
            d&apos;activité
          </span>
        </h2>
        <p
          style={{
            margin: "0 auto",
            maxWidth: 600,
            fontSize: "clamp(14px, 1.6vw, 18px)",
            fontWeight: 300,
            color: "#555",
            lineHeight: 1.6,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Choisissez votre secteur et on optimise énergétiquement votre bâtiment
        </p>
      </section>

      {/* ── Grille des secteurs ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20,
          }}
        >
          {SECTORS.map((sector) => {
            const catLandings = byCategory[sector.name] || [];
            const firstLanding = catLandings[0];
            const href = firstLanding
              ? firstLanding.slug
                ? `/${firstLanding.slug}`
                : `/l/${firstLanding.id}`
              : undefined;

            const cardContent = (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e8e8e8",
                  overflow: "hidden",
                  cursor: href ? "pointer" : "default",
                  transition: "transform 0.25s, box-shadow 0.25s",
                }}
                className="sector-card"
              >
                {/* Zone icône avec fond coloré pastel */}
                <div
                  style={{
                    background: sector.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 160,
                    padding: 24,
                  }}
                >
                  <Image
                    src={`/images/sectors/${sector.slug}.svg`}
                    alt={sector.name}
                    width={80}
                    height={80}
                    style={{ width: 80, height: 80, objectFit: "contain" }}
                  />
                </div>
                {/* Nom du secteur */}
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#fff",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#000",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {sector.name}
                  </h3>
                  {catLandings.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {catLandings.map((l) => (
                        <div key={l.id} style={{ fontSize: 13, color: "#00A340", fontWeight: 500, marginTop: 4 }}>
                          {l.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );

            if (href) {
              return (
                <Link
                  key={sector.slug}
                  href={href}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {cardContent}
                </Link>
              );
            }
            return <div key={sector.slug}>{cardContent}</div>;
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid #e5e5e5",
          padding: "32px 20px",
          textAlign: "center",
          background: "#fafafa",
        }}
      >
        <p
          style={{
            color: "#999",
            fontSize: 12,
            margin: 0,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          © Eco Environnement — Spécialiste de l&apos;optimisation énergétique
        </p>
      </footer>

      {/* Hover effect via inline style tag */}
      <style
        dangerouslySetInnerHTML={{
          __html: `.sector-card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,0.1)}`,
        }}
      />
    </div>
  );
}
