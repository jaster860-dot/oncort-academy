import { LearnerDashboard } from "../components/learner-dashboard";
import { plannedSites, siteModules } from "../lib/academy/catalog";

export default function HomePage() {
  const prostate = siteModules.prostate;
  return (
    <LearnerDashboard
      primarySite={{
        id: prostate.id,
        title: prostate.title,
        shortTitle: prostate.shortTitle,
        description: prostate.description,
        blocks: prostate.blocks.map((block) => ({
          id: block.id,
          number: block.number,
          title: block.title,
          level: block.level,
          lessonCount: prostate.documents[block.id].lessons.length,
          estimatedMinutes: prostate.documents[block.id].estimatedMinutes,
        })),
      }}
      upcomingSites={plannedSites}
    />
  );
}
