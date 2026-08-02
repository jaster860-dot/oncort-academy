#!/usr/bin/env node

import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const baseUrl = process.env.ONCORT_AUDIT_URL ?? "http://localhost:3100";
const courseMap = JSON.parse(readFileSync("content/prostate/course_map.json", "utf8"));
const failures = [];
let checked = 0;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(10_000);

  for (const block of courseMap.blocks) {
    const document = JSON.parse(readFileSync(`content/prostate/learn/${block.id}.json`, "utf8"));
    await page.goto(`${baseUrl}/parcours/prostate/${block.id}/`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Commencer la première leçon/i }).click();
    await page.locator(".lessonExperience").waitFor();

    for (let index = 0; index < document.lessons.length; index += 1) {
      if (index > 0) await page.locator(".lessonList button").nth(index).click();

      const metrics = await page.evaluate(() => {
        const activeTitle = document.querySelector(".lessonList button.active b");
        const workspace = document.querySelector(".playerWorkspace");
        const rootOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const clippedText = [...document.querySelectorAll(".playerWorkspace h1, .playerWorkspace h2, .playerWorkspace h3, .playerWorkspace p, .playerWorkspace li, .playerWorkspace strong, .playerWorkspace small, .playerWorkspace summary, .playerWorkspace button")]
          .filter((element) => {
            const style = getComputedStyle(element);
            const clips = ["hidden", "clip"].includes(style.overflow)
              || ["hidden", "clip"].includes(style.overflowX)
              || ["hidden", "clip"].includes(style.overflowY);
            return clips && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1);
          })
          .map((element) => ({
            tag: element.tagName,
            text: (element.textContent ?? "").trim().slice(0, 100),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
          }));

        return {
          rootOverflow,
          workspaceOverflow: workspace ? workspace.scrollWidth - workspace.clientWidth : null,
          activeTitle: activeTitle ? {
            text: activeTitle.textContent?.trim(),
            width: activeTitle.clientWidth,
            scrollWidth: activeTitle.scrollWidth,
            height: activeTitle.clientHeight,
            scrollHeight: activeTitle.scrollHeight,
            overflow: getComputedStyle(activeTitle).overflow,
            whiteSpace: getComputedStyle(activeTitle).whiteSpace,
          } : null,
          clippedText,
        };
      });

      if (!metrics.activeTitle || metrics.rootOverflow > 1 || metrics.workspaceOverflow > 1 || metrics.clippedText.length > 0) {
        failures.push({ block: block.id, lesson: document.lessons[index].id, metrics });
      }
      checked += 1;
    }
  }
  await page.close();
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(JSON.stringify({ checked, failures }, null, 2));
  process.exit(1);
}

console.log(`Audit texte mobile réussi : ${checked} leçons, aucun texte tronqué ni débordement horizontal.`);
