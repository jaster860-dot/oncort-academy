import "server-only";

import courseMapDocument from "../../content/prostate/course_map.json";
import blockOverviewsDocument from "../../content/prostate/learn/block_overviews.json";
import complexSpecialSituationsDocument from "../../content/prostate/learn/complex_special_situations.json";
import deferredDocument from "../../content/prostate/learn/deferred_management.json";
import definitiveRadiotherapyDocument from "../../content/prostate/learn/definitive_radiotherapy.json";
import diagnosisDocument from "../../content/prostate/learn/detection_diagnosis.json";
import followupSurvivorshipDocument from "../../content/prostate/learn/followup_survivorship.json";
import foundationsDocument from "../../content/prostate/learn/foundations.json";
import highRiskDocument from "../../content/prostate/learn/high_risk_and_cn1.json";
import hormoneSensitiveDocument from "../../content/prostate/learn/hormone_sensitive_and_nmcrpc.json";
import localizedDocument from "../../content/prostate/learn/localized_curative_options.json";
import mcrpcDocument from "../../content/prostate/learn/mcrpc_precision_palliation.json";
import postradiotherapyDocument from "../../content/prostate/learn/postradiotherapy_and_oligorecurrence.json";
import postprostatectomyDocument from "../../content/prostate/learn/postprostatectomy_recurrence.json";
import radiotherapyPlanningDocument from "../../content/prostate/learn/radiotherapy_planning.json";
import stagingDocument from "../../content/prostate/learn/staging_risk_biomarkers.json";
import systemicTherapyDocument from "../../content/prostate/learn/systemic_therapy_foundations.json";
import sourcesDocument from "../../content/prostate/sources/index.json";
import type {
  BlockOverview,
  CourseBlock,
  LearningDocument,
  SiteModule,
  Source,
} from "./types";

const asLearningDocument = (value: unknown) => value as LearningDocument;

const prostateDocuments = [
  foundationsDocument,
  diagnosisDocument,
  stagingDocument,
  deferredDocument,
  localizedDocument,
  definitiveRadiotherapyDocument,
  radiotherapyPlanningDocument,
  postprostatectomyDocument,
  postradiotherapyDocument,
  highRiskDocument,
  systemicTherapyDocument,
  hormoneSensitiveDocument,
  mcrpcDocument,
  complexSpecialSituationsDocument,
  followupSurvivorshipDocument,
].map(asLearningDocument);

const toRecord = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>;

const overviewRecord = Object.fromEntries(
  (blockOverviewsDocument.overviews as BlockOverview[]).map((overview) => [
    overview.blockId,
    overview,
  ]),
);

export const siteModules: Record<string, SiteModule> = {
  prostate: {
    id: "prostate",
    title: "Cancer de la prostate",
    shortTitle: "Prostate",
    description:
      "Un parcours complet depuis l’anatomie et le PSA jusqu’aux stratégies multimodales, à la planification et aux situations métastatiques.",
    audience: courseMapDocument.audience,
    status: courseMapDocument.status,
    accent: "#65d6b0",
    blocks: courseMapDocument.blocks as CourseBlock[],
    overviews: overviewRecord,
    documents: Object.fromEntries(
      prostateDocuments.map((document) => [document.blockId, document]),
    ),
    sources: toRecord(sourcesDocument.sources as Source[]),
  },
};

export const plannedSites = [
  { id: "breast", title: "Sein", phase: "Prochaine localisation indispensable" },
  { id: "lung", title: "Poumon", phase: "Architecture prête" },
  { id: "rectum", title: "Rectum", phase: "Architecture prête" },
  { id: "endometrium", title: "Endomètre", phase: "Corpus initial préservé" },
];

export function getSiteModule(siteId: string) {
  return siteModules[siteId] ?? null;
}

export function getBlock(siteId: string, blockId: string) {
  const site = getSiteModule(siteId);
  if (!site) return null;
  const block = site.blocks.find((item) => item.id === blockId);
  const document = site.documents[blockId];
  const overview = site.overviews[blockId];
  return block && document && overview ? { site, block, document, overview } : null;
}

export function getStaticCourseParams() {
  return Object.values(siteModules).flatMap((site) =>
    site.blocks.map((block) => ({ site: site.id, block: block.id })),
  );
}
