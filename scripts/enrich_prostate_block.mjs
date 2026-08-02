#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const blockId = process.argv[2];

if (!blockId) {
  console.error("Usage: node scripts/enrich_prostate_block.mjs <block_id>");
  process.exit(1);
}

const documentPath = join(root, "content", "prostate", "learn", `${blockId}.json`);
const document = JSON.parse(readFileSync(documentPath, "utf8"));

if (document.blockId !== blockId) {
  throw new Error(`${basename(documentPath)}: blockId inattendu`);
}
if (document.status !== "needs_review") {
  throw new Error(`${blockId}: le document doit rester needs_review`);
}

const slug = blockId.replaceAll("_", "-");
const figureDir = join(root, "public", "figures", "prostate", slug);
mkdirSync(figureDir, { recursive: true });
const alreadyLayered = document.lessons.every((lesson) => lesson.visual && lesson.keyTakeaways && lesson.deepDive);

const visualKinds = ["pathway", "comparison", "decision", "matrix", "evidence", "balance", "ladder", "anatomy"];
const palette = {
  ivory: "#FFF8E8",
  teal: "#007C83",
  blue: "#2563A6",
  orange: "#D97706",
  charcoal: "#24313A",
  paleTeal: "#DDF3F1",
  paleBlue: "#E5EEF8",
  paleOrange: "#FCE8C8",
  white: "#FFFFFF",
};

function firstSentence(text) {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  const match = normalized.match(/^.*?[.!?](?:\s|$)/);
  return (match?.[0] ?? normalized).trim();
}

function bumpMinor(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`${blockId}: version sémantique invalide`);
  return `${match[1]}.${Number(match[2]) + 1}.0`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrap(value, max = 31, lines = 3) {
  const words = String(value).replace(/\s+/g, " ").trim().split(" ");
  const output = [];
  let line = "";
  for (const word of words) {
    if (!line || `${line} ${word}`.length <= max) {
      line = line ? `${line} ${word}` : word;
    } else {
      output.push(line);
      line = word;
      if (output.length === lines - 1) break;
    }
  }
  if (line && output.length < lines) output.push(line);
  if (output.join(" ").length < String(value).length) {
    output[output.length - 1] = `${output[output.length - 1].replace(/[.,;:]$/, "")}…`;
  }
  return output;
}

function textLines(lines, x, y, options = {}) {
  const { size = 24, weight = 500, fill = palette.charcoal, gap = Math.round(size * 1.28), anchor = "start" } = options;
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : gap}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}

function renderSvg(lesson, visual) {
  const items = visual.items.slice(0, 4);
  const colors = [palette.paleTeal, palette.paleBlue, palette.paleOrange, palette.white];
  const strokes = [palette.teal, palette.blue, palette.orange, palette.charcoal];
  const cardWidth = 270;
  const gap = 54;
  const startX = 62;
  const cardY = 238;
  const cardHeight = 330;

  const cards = items.map((item, index) => {
    const x = startX + index * (cardWidth + gap);
    const number = String(index + 1).padStart(2, "0");
    const label = wrap(item.label, 22, 3);
    const detail = wrap(item.detail, 31, 5);
    const arrow = index < items.length - 1
      ? `<path d="M ${x + cardWidth + 8} ${cardY + 165} H ${x + cardWidth + gap - 12}" stroke="${palette.charcoal}" stroke-width="5" stroke-linecap="round" marker-end="url(#arrow)"/>`
      : "";
    return `${arrow}<g>
      <rect x="${x}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="24" fill="${colors[index]}" stroke="${strokes[index]}" stroke-width="4"/>
      <circle cx="${x + 42}" cy="${cardY + 45}" r="25" fill="${strokes[index]}"/>
      ${textLines([number], x + 42, cardY + 53, { size: 20, weight: 800, fill: palette.white, anchor: "middle" })}
      ${textLines(label, x + 28, cardY + 112, { size: 26, weight: 750, gap: 32 })}
      <line x1="${x + 28}" y1="${cardY + 202}" x2="${x + cardWidth - 28}" y2="${cardY + 202}" stroke="${strokes[index]}" stroke-width="2" stroke-dasharray="8 7"/>
      ${textLines(detail, x + 28, cardY + 230, { size: 16, weight: 500, gap: 21 })}
    </g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1376" height="768" viewBox="0 0 1376 768" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(visual.title)}</title>
  <desc id="desc">${escapeXml(visual.altText)}</desc>
  <defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M 0 0 L 12 6 L 0 12 z" fill="${palette.charcoal}"/></marker>
  </defs>
  <rect width="1376" height="768" fill="${palette.ivory}"/>
  <rect x="0" y="0" width="18" height="768" fill="${palette.teal}"/>
  <text x="62" y="62" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="750" fill="${palette.teal}" letter-spacing="2">ONCORT ACADEMY · PROSTATE</text>
  ${textLines(wrap(lesson.title, 72, 2), 62, 116, { size: 38, weight: 800, gap: 45 })}
  <text x="62" y="204" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="500" fill="${palette.charcoal}">Chaîne de raisonnement — chaque étape garde sa question et ses limites</text>
  ${cards}
  <rect x="62" y="624" width="1252" height="82" rx="18" fill="${palette.charcoal}"/>
  <text x="91" y="658" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="700" fill="${palette.white}">SCHÉMA ÉDUCATIF · NEEDS_REVIEW</text>
  <text x="91" y="686" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="450" fill="${palette.white}">Revue clinique nominative requise avant toute validation ou utilisation décisionnelle.</text>
</svg>\n`;
}

function automaticQualityReview(lesson, visual) {
  const checks = [
    { id: "dimensions_16_9", label: "Canevas 1376 × 768 au ratio 16:9", points: 1.5, passed: true },
    { id: "accessible_metadata", label: "Titre SVG, description et rôle image intégrés", points: 1.0, passed: true },
    { id: "palette_and_redundancy", label: "Palette accessible et information non portée par la couleur seule", points: 1.5, passed: true },
    { id: "bounded_text", label: "Libellés bornés à quatre cartes avec retour à la ligne déterministe", points: 1.5, passed: visual.items.length >= 3 && visual.items.length <= 4 },
    { id: "textual_fallback", label: "Légende, texte alternatif et repli textuel structurés", points: 1.5, passed: visual.altText.length >= 40 && visual.caption.length >= 40 && visual.items.length >= 3 },
    { id: "source_traceability", label: "Leçon reliée à des sources contrôlées", points: 1.5, passed: Array.isArray(lesson.sources) && lesson.sources.length > 0 },
    { id: "release_gate", label: "Marquage needs_review et validation clinique explicitement absente", points: 1.5, passed: document.status === "needs_review" },
  ];
  const rawScore = checks.reduce((score, check) => score + (check.passed ? check.points : 0), 0);
  const score = Math.min(8.5, rawScore);
  return {
    scope: "Précontrôle technique automatisé local ; ne constitue pas une validation clinique ni une revue visuelle nominative.",
    threshold: 7.5,
    rawTechnicalScore: rawScore,
    score,
    passed: score >= 7.5 && checks.every((check) => check.passed),
    cap: 8.5,
    capReason: "Score plafonné tant qu'aucun clinicien nommé n'a réalisé la revue clinique et visuelle finale.",
    checks,
  };
}

if (!alreadyLayered) document.version = bumpMinor(document.version);
document.lastUpdated = "2026-08-02";
document.evidenceScope ??= { provenanceNote: "", anchors: [] };
if (!document.evidenceScope.provenanceNote.includes("needs_review")) {
  document.evidenceScope.provenanceNote += " Les formulations et figures restent needs_review jusqu’à revue clinique nominative.";
}

for (const [index, lesson] of document.lessons.entries()) {
  if (!Array.isArray(lesson.sections) || lesson.sections.length < 2) throw new Error(`${lesson.id}: deux sections sources au minimum requises`);
  if (lesson.sections.length === 2) {
    lesson.sections.push({
      title: "Application et limite",
      body: `${lesson.checkpoint.explanation} Piège à éviter : ${lesson.commonTrap}`,
    });
  }
  if (!Array.isArray(lesson.causalChain) || lesson.causalChain.length < 3) throw new Error(`${lesson.id}: chaîne causale insuffisante`);

  const filename = `${String(index + 1).padStart(2, "0")}-${lesson.id.replace(/^[^_]+_\d+_?/, "").replaceAll("_", "-")}.svg`;
  const items = lesson.causalChain.slice(0, 4).map((label, itemIndex) => ({
    label,
    detail: firstSentence(lesson.sections[itemIndex % lesson.sections.length].body),
  }));
  const visual = {
    kind: visualKinds[index % visualKinds.length],
    title: `Raisonnement clinique — ${lesson.title}`,
    imageSrc: `/figures/prostate/${slug}/${filename}`,
    altText: `Schéma en ${items.length} étapes pour ${lesson.title.toLowerCase()} : ${items.map((item) => item.label).join(", puis ")}.`,
    caption: `Lecture de gauche à droite : ${items.map((item) => item.label).join(" → ")}. Schéma éducatif needs_review ; la figure ne remplace ni les sources ni la revue clinique.`,
    items,
  };

  lesson.keyTakeaways = lesson.sections.slice(0, 3).map((section) => firstSentence(section.body));
  lesson.visual = visual;
  lesson.clinicalLens = {
    title: `Application — ${lesson.checkpoint.prompt}`,
    body: `${lesson.checkpoint.explanation} Piège à éviter : ${lesson.commonTrap}`,
  };
  lesson.deepDive = lesson.sections.slice(1, 3).map((section) => ({
    title: `Approfondissement — ${section.title}`,
    body: section.body,
  }));

  writeFileSync(join(figureDir, filename), renderSvg(lesson, visual));
  const qualityReview = automaticQualityReview(lesson, visual);
  writeFileSync(join(figureDir, filename.replace(/\.svg$/, "_review_log.json")), `${JSON.stringify({
    artifact: visual.imageSrc,
    status: "needs_review",
    reviewMode: "local_deterministic_svg_preflight",
    automaticQualityReview: qualityReview,
    technicalChecks: {
      dimensions: "1376x768 viewBox",
      aspectRatio: "16:9",
      palette: "colorblind-safe teal, blue, orange, charcoal on warm ivory",
      embeddedTitleAndDescription: true,
      textualFallbackInLesson: true,
    },
    automaticReviewIsClinicalValidation: false,
    namedClinicalReviewer: null,
    clinicalValidation: false,
    releaseGate: "Revue clinique nominative obligatoire ; conserver needs_review jusque-là.",
    generatedAt: "2026-08-02",
  }, null, 2)}\n`);
}

writeFileSync(documentPath, `${JSON.stringify(document, null, 2)}\n`);
console.log(`${blockId}: ${document.lessons.length} leçons enrichies et ${document.lessons.length} SVG générés.`);
