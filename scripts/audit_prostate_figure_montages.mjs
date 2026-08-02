#!/usr/bin/env node

import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  readFileSync(resolve(root, "content/prostate/review/figure_method_manifest.json"), "utf8"),
);
const outputDir = resolve(root, "artifacts/figure-audit");
mkdirSync(outputDir, { recursive: true });

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const groups = Map.groupBy(manifest.figures, (figure) => figure.blockId);

for (const [blockId, figures] of groups) {
  const columns = 3;
  const tileWidth = 520;
  const imageHeight = 290;
  const labelHeight = 58;
  const tileHeight = imageHeight + labelHeight;
  const rows = Math.ceil(figures.length / columns);
  const composites = [];

  for (const [index, figure] of figures.entries()) {
    const assetPath = resolve(root, "public", figure.currentAsset.replace(/^\//, ""));
    const image = await sharp(assetPath)
      .flatten({ background: "#fff8e8" })
      .resize(tileWidth, imageHeight, { fit: "contain", background: "#fff8e8" })
      .png()
      .toBuffer();
    const label = await sharp(Buffer.from(
      `<svg width="${tileWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#20323b"/>
        <text x="16" y="23" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#ffffff">${escapeXml(figure.lessonId)}</text>
        <text x="16" y="44" font-family="Arial, sans-serif" font-size="12" fill="#bde7e4">${escapeXml(figure.method)}</text>
      </svg>`,
    )).png().toBuffer();
    const tile = await sharp({ create: { width: tileWidth, height: tileHeight, channels: 3, background: "#fff8e8" } })
      .composite([{ input: image, top: 0, left: 0 }, { input: label, top: imageHeight, left: 0 }])
      .png()
      .toBuffer();
    composites.push({
      input: tile,
      left: (index % columns) * tileWidth,
      top: Math.floor(index / columns) * tileHeight,
    });
  }

  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * tileHeight,
      channels: 3,
      background: "#d8d5c9",
    },
  }).composite(composites).png().toFile(resolve(outputDir, `${blockId}.png`));
}

console.log(`Generated ${groups.size} block montages in ${outputDir}`);
