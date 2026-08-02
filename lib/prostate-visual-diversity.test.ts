import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const plan = JSON.parse(
  readFileSync(join(root, "content/prostate/visual_plan.json"), "utf8"),
) as {
  status: string;
  taxonomy: Record<string, string>;
  assignments: Record<string, { type: string; label: string }>;
};

const advancedDocuments = [
  "complex_special_situations",
  "deferred_management",
  "definitive_radiotherapy",
  "followup_survivorship",
  "high_risk_and_cn1",
  "hormone_sensitive_and_nmcrpc",
  "localized_curative_options",
  "mcrpc_precision_palliation",
  "postprostatectomy_recurrence",
  "postradiotherapy_and_oligorecurrence",
  "radiotherapy_planning",
  "staging_risk_biomarkers",
  "systemic_therapy_foundations",
].map((id) =>
  JSON.parse(readFileSync(join(root, `content/prostate/learn/${id}.json`), "utf8")),
);

describe("lesson-specific visual direction for the advanced prostate curriculum", () => {
  it("assigns every advanced lesson to one of 22 semantic figure formats", () => {
    const lessons = advancedDocuments.flatMap((document) => document.lessons);
    const usedTypes = new Set(Object.values(plan.assignments).map((entry) => entry.type));

    expect(plan.status).toBe("needs_review");
    expect(lessons).toHaveLength(78);
    expect(Object.keys(plan.assignments)).toHaveLength(78);
    expect(usedTypes.size).toBe(22);
    expect([...usedTypes].sort()).toEqual(Object.keys(plan.taxonomy).sort());

    for (const lesson of lessons) {
      const assignment = plan.assignments[lesson.id];
      expect(assignment, `${lesson.id}: affectation manquante`).toBeTruthy();
      expect(lesson.visual.diagramType).toBe(assignment.type);
      expect(lesson.visual.formatLabel).toBe(assignment.label);
      expect(lesson.visual.altText).not.toMatch(/schéma en 4 étapes/i);
      expect(lesson.visual.caption).not.toMatch(/lecture de gauche à droite/i);
    }
  });

  it("renders distinct accessible SVG artifacts instead of one universal card template", () => {
    const hashes = new Set<string>();
    for (const document of advancedDocuments) {
      for (const lesson of document.lessons) {
        const svgPath = join(root, "public", lesson.visual.imageSrc);
        expect(existsSync(svgPath), `${lesson.id}: SVG absent`).toBe(true);
        const svg = readFileSync(svgPath, "utf8");
        expect(svg).toContain('width="1376" height="768" viewBox="0 0 1376 768"');
        expect(svg).toContain("<title");
        expect(svg).toContain("<desc");
        expect(svg).toContain("NEEDS_REVIEW");
        expect(svg).not.toContain("Chaîne de raisonnement — chaque étape garde sa question et ses limites");
        hashes.add(createHash("sha256").update(svg).digest("hex"));
      }
    }
    expect(hashes.size).toBe(78);
  });
});

