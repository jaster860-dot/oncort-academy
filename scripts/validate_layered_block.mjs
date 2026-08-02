#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const blockId = process.argv[2];
if (!blockId) {
  console.error("Usage: node scripts/validate_layered_block.mjs <block_id>");
  process.exit(1);
}

const document = JSON.parse(readFileSync(join(root, "content", "prostate", "learn", `${blockId}.json`), "utf8"));
const sources = JSON.parse(readFileSync(join(root, "content", "prostate", "sources", "index.json"), "utf8"));
const sourceIds = new Set(sources.sources.map((source) => source.id));
const errors = [];

if (document.status !== "needs_review") errors.push("le document ne reste pas needs_review");
if (!document.evidenceScope?.provenanceNote) errors.push("provenanceNote absente");

for (const lesson of document.lessons) {
  const label = lesson.id;
  if (lesson.keyTakeaways?.length !== 3) errors.push(`${label}: synthèse 30 secondes != 3 messages`);
  if ((lesson.sections?.length ?? 0) < 3) errors.push(`${label}: raisonnement détaillé insuffisant`);
  if ((lesson.deepDive?.length ?? 0) < 2) errors.push(`${label}: approfondissements insuffisants`);
  if ((lesson.clinicalLens?.body?.length ?? 0) < 80) errors.push(`${label}: application clinique insuffisante`);
  if (!lesson.commonTrap) errors.push(`${label}: piège absent`);
  if (!lesson.checkpoint?.explanation) errors.push(`${label}: checkpoint absent`);
  if (lesson.flashcards?.length !== 3) errors.push(`${label}: trois flashcards requises`);
  if ((lesson.visual?.altText?.length ?? 0) < 40) errors.push(`${label}: alt text insuffisant`);
  if ((lesson.visual?.caption?.length ?? 0) < 40) errors.push(`${label}: légende insuffisante`);
  if ((lesson.visual?.items?.length ?? 0) < 3) errors.push(`${label}: repli textuel insuffisant`);
  if (!lesson.visual?.imageSrc || !existsSync(join(root, "public", lesson.visual.imageSrc))) errors.push(`${label}: figure absente`);
  for (const sourceId of lesson.sources ?? []) if (!sourceIds.has(sourceId)) errors.push(`${label}: source inconnue ${sourceId}`);

  if (lesson.visual?.imageSrc?.endsWith(".svg")) {
    const svgPath = join(root, "public", lesson.visual.imageSrc);
    const svg = readFileSync(svgPath, "utf8");
    if (!svg.includes('width="1376" height="768" viewBox="0 0 1376 768"')) errors.push(`${label}: dimensions SVG invalides`);
    if (!svg.includes("<title") || !svg.includes("<desc")) errors.push(`${label}: accessibilité SVG incomplète`);
    if (!svg.includes("NEEDS_REVIEW")) errors.push(`${label}: garde needs_review absente de la figure`);
    const reviewLogPath = svgPath.replace(/\.svg$/, "_review_log.json");
    if (!existsSync(reviewLogPath)) {
      errors.push(`${label}: journal de précontrôle absent`);
    } else {
      const reviewLog = JSON.parse(readFileSync(reviewLogPath, "utf8"));
      if (reviewLog.status !== "needs_review") errors.push(`${label}: journal hors needs_review`);
      if (reviewLog.clinicalValidation !== false) errors.push(`${label}: validation clinique automatisée interdite`);
      if (reviewLog.automaticReviewIsClinicalValidation !== false) errors.push(`${label}: portée du précontrôle ambiguë`);
      if (reviewLog.automaticQualityReview?.score < 7.5 || reviewLog.automaticQualityReview?.passed !== true) {
        errors.push(`${label}: score technique automatisé inférieur à 7,5/10`);
      }
      if (reviewLog.automaticQualityReview?.capReason == null) errors.push(`${label}: plafond du score non justifié`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validation Fondations réussie pour ${blockId}: ${document.lessons.length} leçons et figures needs_review.`);
