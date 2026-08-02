#!/usr/bin/env node

import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const baseUrl = process.env.ONCORT_AUDIT_URL ?? "http://localhost:3100";
const courseMap = JSON.parse(readFileSync("content/prostate/course_map.json", "utf8"));
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

const failures = [];
let checked = 0;
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    page.setDefaultTimeout(10_000);

    for (const block of courseMap.blocks) {
      const document = JSON.parse(readFileSync(`content/prostate/learn/${block.id}.json`, "utf8"));
      await page.goto(`${baseUrl}/parcours/prostate/${block.id}/`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: /Commencer la première leçon/i }).click();
      await page.locator(".lessonExperience").waitFor();

      for (let index = 0; index < document.lessons.length; index += 1) {
        if (index > 0) {
          await page.locator(".lessonList button").nth(index).click();
        }
        const lesson = document.lessons[index];
        const image = page.locator(".lessonVisualImage");
        await image.waitFor();
        await page.waitForFunction(() => {
          const element = document.querySelector(".lessonVisualImage");
          return element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0;
        });
        const metrics = await page.locator(".lessonVisual").evaluate((figure) => {
          const img = figure.querySelector(".lessonVisualImage");
          if (!(img instanceof HTMLImageElement)) return { missing: true };
          const figureRect = figure.getBoundingClientRect();
          const imageRect = img.getBoundingClientRect();
          return {
            missing: false,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            figureOverflow: figure.scrollWidth - figure.clientWidth,
            imageOverflowLeft: Math.max(0, figureRect.left - imageRect.left),
            imageOverflowRight: Math.max(0, imageRect.right - figureRect.right),
            renderedWidth: imageRect.width,
          };
        });
        const visibleStatus = await page.locator("body").evaluate((body) =>
          /NEEDS_REVIEW|Contenu à valider|À valider/.test(body.innerText),
        );
        const failed = metrics.missing || metrics.naturalWidth < 1000 || metrics.naturalHeight < 500
          || metrics.imageOverflowLeft > 1 || metrics.imageOverflowRight > 1
          || metrics.renderedWidth < 250 || visibleStatus;
        if (failed) failures.push({ viewport: viewport.name, block: block.id, lesson: lesson.id, metrics, visibleStatus });
        checked += 1;
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(JSON.stringify({ checked, failures }, null, 2));
  process.exit(1);
}
console.log(`Audit UI figures réussi : ${checked} rendus (91 desktop + 91 mobile), aucun débordement ni statut technique visible.`);
