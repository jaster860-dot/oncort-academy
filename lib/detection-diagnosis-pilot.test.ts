import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import detectionDiagnosisDocument from "../content/prostate/learn/detection_diagnosis.json";

describe("layered prostate detection and diagnosis block", () => {
  it("keeps every lesson behind clinician review while exposing all learning layers", () => {
    expect(detectionDiagnosisDocument.status).toBe("needs_review");
    expect(detectionDiagnosisDocument.lessons).toHaveLength(5);

    for (const lesson of detectionDiagnosisDocument.lessons) {
      expect(lesson.keyTakeaways).toHaveLength(3);
      expect(lesson.sections.length).toBeGreaterThanOrEqual(5);
      expect(lesson.visual.title.length).toBeGreaterThan(12);
      expect(lesson.visual.altText.length).toBeGreaterThan(40);
      expect(lesson.visual.caption.length).toBeGreaterThan(30);
      expect(lesson.visual.items.length).toBeGreaterThanOrEqual(3);
      expect(lesson.clinicalLens.title.length).toBeGreaterThan(12);
      expect(lesson.clinicalLens.body.length).toBeGreaterThan(80);
      expect(lesson.deepDive).toHaveLength(2);
      expect(lesson.checkpoint.options.length).toBeGreaterThanOrEqual(3);
      expect(lesson.flashcards.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("binds every lesson to a generated figure available in the public bundle", () => {
    const imageSources = detectionDiagnosisDocument.lessons.map((lesson) => lesson.visual.imageSrc);

    expect(new Set(imageSources).size).toBe(5);
    for (const imageSrc of imageSources) {
      expect(imageSrc).toMatch(/^\/figures\/prostate\/detection-diagnosis\/.+\.(png|svg)$/);
      expect(existsSync(join(process.cwd(), "public", imageSrc))).toBe(true);
    }
  });

  it("uses a varied visual grammar instead of repeating a single template", () => {
    expect(detectionDiagnosisDocument.lessons.map((lesson) => lesson.visual.kind)).toEqual([
      "decision",
      "matrix",
      "comparison",
      "pathway",
      "matrix",
    ]);
  });
});
