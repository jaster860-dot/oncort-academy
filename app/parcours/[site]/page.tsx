import { notFound } from "next/navigation";
import { AcademyHeader } from "../../../components/academy-header";
import { PathwayMap } from "../../../components/pathway-map";
import { getSiteModule } from "../../../lib/academy/catalog";

export function generateStaticParams() {
  return [{ site: "prostate" }];
}

export default async function SitePathwayPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site: siteId } = await params;
  const site = getSiteModule(siteId);
  if (!site) notFound();

  return (
    <main className="academyPage pathwayPage">
      <AcademyHeader compact />
      <PathwayMap site={site} />
    </main>
  );
}
