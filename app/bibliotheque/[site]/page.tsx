import { notFound } from "next/navigation";
import { AcademyHeader } from "../../../components/academy-header";
import { getSiteModule } from "../../../lib/academy/catalog";

export function generateStaticParams() {
  return [{ site: "prostate" }];
}

export default async function SourcesPage({ params }: { params: Promise<{ site: string }> }) {
  const { site: siteId } = await params;
  const site = getSiteModule(siteId);
  if (!site) notFound();
  const sources = Object.values(site.sources).sort((a, b) => b.year - a.year);
  return <main className="academyPage libraryPage"><AcademyHeader compact /><section className="libraryHero"><p className="eyebrow">Bibliothèque sourcée</p><h1>Références · {site.shortTitle}</h1><p>Les sources expliquent le niveau de preuve et la traçabilité. Elles ne libèrent pas automatiquement un contenu clinique.</p></section><section className="sourceLibrary">{sources.map((source) => <a key={source.id} href={source.fullTextUrl ?? source.url} target="_blank" rel="noreferrer"><div><span>{source.publisher}</span><b>{source.year}</b></div><h2>{source.title}</h2><p>{source.jurisdiction ?? "International"} · {source.verification?.replaceAll("_", " ") ?? "Vérification en attente"}</p><small>Consulter la source ↗</small></a>)}</section></main>;
}
