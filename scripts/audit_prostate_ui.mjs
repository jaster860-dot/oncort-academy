import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const baseUrl = process.env.ONCORT_AUDIT_URL ?? "http://localhost:3100";
const targetBlock = process.env.PROSTATE_AUDIT_BLOCK ?? "foundations";
const targetDocument = JSON.parse(readFileSync(`content/prostate/learn/${targetBlock}.json`, "utf8"));
const blocks = [
  ["systemic_therapy_foundations", 5],
  ["hormone_sensitive_and_nmcrpc", 5],
  ["mcrpc_precision_palliation", 11],
  ["complex_special_situations", 5],
  ["followup_survivorship", 8],
];

mkdirSync("artifacts/ui-audit", { recursive: true });

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
desktop.setDefaultTimeout(8_000);

try {
  await desktop.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await desktop.getByRole("heading", { name: /Bonjour/i }).waitFor();
  await desktop.locator(".courseCarousel").waitFor();
  await desktop.locator(".dailyGoalCard").waitFor();
  await desktop.screenshot({ path: "artifacts/ui-audit/home-desktop.png", fullPage: true });

  await desktop.goto(`${baseUrl}/parcours/prostate`, { waitUntil: "domcontentloaded" });
  if ((await desktop.locator(".pathwayBlock").count()) !== 15) {
    throw new Error("La carte n'affiche pas exactement 15 blocs.");
  }
  await desktop.screenshot({ path: "artifacts/ui-audit/pathway-desktop.png", fullPage: true });

  await desktop.goto(`${baseUrl}/parcours/prostate/${targetBlock}`, { waitUntil: "domcontentloaded" });
  await desktop.locator(".orientationView").waitFor();
  if ((await desktop.locator(".lessonList button").count()) !== targetDocument.lessons.length) {
    throw new Error(`${targetBlock}: nombre de leçons inattendu dans l’audit ciblé.`);
  }
  await desktop.getByRole("button", { name: /Commencer la première leçon/i }).click();
  await desktop.locator(".lessonExperience").waitFor();
  await desktop.locator(".lessonVisual").waitFor();
  await desktop.locator(".visualTextAlternative").waitFor();
  await desktop.locator(".sourceDrawer").waitFor();
  await desktop.screenshot({ path: `artifacts/ui-audit/${targetBlock}-desktop.png`, fullPage: true });

  for (const [blockId, lessonCount] of blocks) {
    await desktop.goto(`${baseUrl}/parcours/prostate/${blockId}`, { waitUntil: "domcontentloaded" });
    await desktop.locator(".orientationView").waitFor();
    if ((await desktop.locator(".lessonList button").count()) !== lessonCount) {
      throw new Error(`${blockId}: nombre de leçons inattendu.`);
    }
    await desktop.getByRole("button", { name: /Commencer la première leçon/i }).click();
    await desktop.locator(".lessonExperience").waitFor();
    await desktop.locator(".sourceDrawer").waitFor();
  }

  await desktop.goto(`${baseUrl}/cas/prostate`, { waitUntil: "domcontentloaded" });
  await desktop.locator(".rcpWorkspace").waitFor();
  await desktop.waitForLoadState("networkidle");
  const answer = [
    "Haut risque cT3a ISUP 4 PSA 32.",
    "Le PSMA-PET négatif n'exclut pas une maladie microscopique.",
    "Je précise l'espérance de vie, les comorbidités cardiovasculaires, la santé osseuse, les symptômes urinaires, la fonction sexuelle et les préférences.",
    "La discussion multidisciplinaire compare prostatectomie multimodale et radiothérapie avec ADT, sa durée, ses toxicités et une décision partagée.",
  ].join(" ");
  await desktop.getByLabel("Construis ton raisonnement").fill(answer);
  await desktop.getByRole("button", { name: /Analyser mon raisonnement/i }).waitFor({ state: "visible" });
  await desktop.getByRole("button", { name: /Analyser mon raisonnement/i }).click();
  await desktop.getByRole("heading", { name: "Raisonnement solide" }).waitFor();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await mobile.getByRole("heading", { name: /Bonjour/i }).waitFor();
  await mobile.locator(".mobileBottomNav").waitFor();
  await mobile.screenshot({ path: "artifacts/ui-audit/home-mobile.png", fullPage: true });
  await mobile.goto(`${baseUrl}/parcours/prostate/${targetBlock}`, { waitUntil: "domcontentloaded" });
  await mobile.locator(".orientationView").waitFor();
  await mobile.getByRole("button", { name: /Commencer la première leçon/i }).click();
  await mobile.locator(".lessonExperience").waitFor();
  await mobile.locator(".lessonVisual").waitFor();
  await mobile.locator(".visualTextAlternative").waitFor();
  await mobile.screenshot({ path: `artifacts/ui-audit/${targetBlock}-mobile.png`, fullPage: true });
  await mobile.close();

  console.log(`Audit interface réussi : accueil, 15 blocs, 5 blocs avancés, mode RCP et ${targetBlock} sur desktop/mobile.`);
} finally {
  await browser.close();
}
