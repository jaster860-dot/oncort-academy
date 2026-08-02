import Link from "next/link";

export function AcademyHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className={`academyHeader ${compact ? "compact" : ""}`}>
      <Link className="academyBrand" href="/" aria-label="Accueil OncoRT Academy">
        <span className="brandGlyph">O</span>
        <span><strong>OncoRT</strong><small>Academy</small></span>
      </Link>
      <nav aria-label="Navigation principale">
        <Link href="/parcours/prostate">Parcours</Link>
        <Link href="/cas/prostate">Mode RCP</Link>
        <Link href="/bibliotheque/prostate">Sources</Link>
      </nav>
      <div className="headerActions">
        <Link className="accountLink" href="/connexion">Synchroniser</Link>
      </div>
    </header>
  );
}
