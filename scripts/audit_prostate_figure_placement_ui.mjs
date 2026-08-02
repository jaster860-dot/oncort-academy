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
        if (index > 0) await page.locator(".lessonList button").nth(index).click();
        const lesson = document.lessons[index];
        const metrics = await page.locator(".lessonExperience").evaluate((experience) => {
          const figures = [...experience.querySelectorAll(":scope > .lessonVisual, :scope > .lessonBody > .lessonVisual")];
          const figure = figures[0];
          const sections = [...experience.querySelectorAll(".lessonSection")];
          const checkpoint = experience.querySelector(".checkpointCard");
          const trap = experience.querySelector(".trapCard");
          if (!figure) return { figureCount: 0 };
          return {
            figureCount: figures.length,
            sectionsBefore: sections.filter((section) =>
              Boolean(section.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING),
            ).length,
            beforeFirstSection: Boolean(
              sections[0] && (figure.compareDocumentPosition(sections[0]) & Node.DOCUMENT_POSITION_FOLLOWING),
            ),
            beforeCheckpoint: Boolean(
              checkpoint && (figure.compareDocumentPosition(checkpoint) & Node.DOCUMENT_POSITION_FOLLOWING),
            ),
            afterTrap: Boolean(
              trap && (trap.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING),
            ),
          };
        });

        const placement = lesson.visual.placement;
        const correct = metrics.figureCount === 1
          && metrics.beforeCheckpoint
          && (placement === "after_takeaways" ? metrics.beforeFirstSection
            : placement === "after_section" ? metrics.sectionsBefore === lesson.visual.afterSection
              : placement === "after_sections" ? metrics.sectionsBefore === lesson.sections.length
                : placement === "before_checkpoint" ? metrics.sectionsBefore === lesson.sections.length && metrics.afterTrap
                  : false);
        if (!correct) failures.push({ viewport: viewport.name, block: block.id, lesson: lesson.id, placement, metrics });
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

console.log(`Audit placement réussi : ${checked} rendus, position pédagogique conforme sur desktop et mobile.`);
