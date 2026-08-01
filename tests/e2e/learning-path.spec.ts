import { expect, test } from "@playwright/test";

test("a beginner can enter the prostate pathway and validate a first checkpoint", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Bonjour/i })).toBeVisible();
  await page.locator(".resumeButton").click();
  await expect(page.getByRole("heading", { name: /Fondations : comprendre/i })).toBeVisible();
  await page.getByRole("button", { name: /Commencer la première leçon/i }).click();
  await expect(page.getByRole("heading", { name: /Où est la prostate/i })).toBeVisible();
  await page.getByRole("button", { name: /L'urètre proximal traverse la prostate/i }).click();
  await expect(page.getByText("Concept compris")).toBeVisible();
  await page.getByRole("button", { name: /Valider et continuer/i }).click();
  await expect(page.getByRole("heading", { name: /À quoi ressemble une prostate normale/i })).toBeVisible();
});

test("the course map exposes all fifteen prostate blocks", async ({ page }) => {
  await page.goto("/parcours/prostate");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(15);
  await expect(page.getByText("Bloc 15").or(page.getByText("15", { exact: true }))).toBeVisible();
});

test("the foundations pilot exposes layered content and an accessible visual on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/parcours/prostate/foundations");
  await page.getByRole("button", { name: /Commencer la première leçon/i }).click();

  await expect(page.getByText("Lecture 30 secondes")).toBeVisible();
  await expect(page.getByRole("figure", { name: /Schéma sagittal simplifié/i })).toBeVisible();
  await expect(page.getByText("Application clinique")).toBeVisible();
  await expect(page.getByText("Nuances à ouvrir pendant l’audit")).toBeVisible();
  await expect(page.locator(".lessonVisual-anatomy .visualNode")).toHaveCount(6);
});
