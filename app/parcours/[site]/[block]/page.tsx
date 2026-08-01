import { notFound } from "next/navigation";
import { CoursePlayer } from "../../../../components/course-player";
import { getBlock, getStaticCourseParams } from "../../../../lib/academy/catalog";

export function generateStaticParams() {
  return getStaticCourseParams();
}

export default async function CourseBlockPage({
  params,
}: {
  params: Promise<{ site: string; block: string }>;
}) {
  const { site, block } = await params;
  const result = getBlock(site, block);
  if (!result) notFound();

  return (
    <CoursePlayer
      site={{
        id: result.site.id,
        title: result.site.title,
        shortTitle: result.site.shortTitle,
        status: result.site.status,
        blocks: result.site.blocks,
      }}
      block={result.block}
      overview={result.overview}
      document={result.document}
      sources={result.site.sources}
    />
  );
}
