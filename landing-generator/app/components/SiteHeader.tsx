import Link from "next/link";

/**
 * Header partagé Home / Contact / À propos.
 * Utilisé en remplacement du header Elementor source (qui posait des soucis
 * de largeur, mega-menu JS-only, etc.).
 *
 * "Secteur d'activité" pointe sur l'ancre #eco-summary-sector-root de la home,
 * ce qui déclenche un scroll automatique du navigateur (cross-page ou intra-page).
 */
export default function SiteHeader() {
  return (
    <header
      className="eco-site-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
        padding: "0 clamp(16px, 3vw, 40px)",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        {/* Logo Eco Environnement (SVG ou raster). On utilise l'SVG horizontal si présent. */}
        <img
          src="/images/about/eco-logo.svg"
          alt="Eco Environnement"
          width={156}
          height={48}
          style={{ height: 48, width: "auto", display: "block" }}
        />
      </Link>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(16px, 2.5vw, 36px)",
          fontFamily: "'Poppins', sans-serif",
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        <a href="/#eco-summary-sector-root" style={navLinkStyle}>
          Secteur d&apos;activité
        </a>
        <Link href="/a-propos" style={navLinkStyle}>
          À propos de nous
        </Link>
        <Link href="/contact" style={navLinkStyle}>
          Contact
        </Link>
      </nav>
    </header>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "#222",
  textDecoration: "none",
  padding: "8px 4px",
  transition: "color 0.15s ease",
};
