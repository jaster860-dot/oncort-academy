import { describe, expect, it } from "vitest";
import foundationsDocument from "../content/prostate/learn/foundations.json";
import sourcesDocument from "../content/prostate/sources/index.json";

describe("layered prostate foundations pilot", () => {
  it("gives every lesson a 30-second layer, an accessible visual and expandable depth", () => {
    expect(foundationsDocument.status).toBe("needs_review");
    expect(foundationsDocument.lessons).toHaveLength(8);

    for (const lesson of foundationsDocument.lessons) {
      expect(lesson.keyTakeaways).toHaveLength(3);
      expect(lesson.visual.title.length).toBeGreaterThan(12);
      expect(lesson.visual.altText.length).toBeGreaterThan(40);
      expect(lesson.visual.caption.length).toBeGreaterThan(30);
      expect(lesson.visual.items.length).toBeGreaterThanOrEqual(2);
      expect(lesson.clinicalLens.title.length).toBeGreaterThan(12);
      expect(lesson.clinicalLens.body.length).toBeGreaterThan(80);
      expect(lesson.deepDive.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses a deliberately varied visual grammar across the eight lessons", () => {
    expect(foundationsDocument.lessons.map((lesson) => lesson.visual.kind)).toEqual([
      "anatomy",
      "comparison",
      "pathway",
      "decision",
      "matrix",
      "ladder",
      "evidence",
      "balance",
    ]);
  });

  it("binds every evidence anchor and lesson citation to the source library", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expect(foundationsDocument.evidenceScope.anchors).toHaveLength(6);
    for (const anchor of foundationsDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(20);
    }
    for (const lesson of foundationsDocument.lessons) {
      for (const sourceId of lesson.sources) expect(sourceIds.has(sourceId)).toBe(true);
    }
  });

  it("ends with a synthetic integrative case while preserving the clinician release gate", () => {
    expect(foundationsDocument.caseStudy.status).toBe("needs_review");
    expect(foundationsDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(foundationsDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(5);
    expect(foundationsDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(5);
    expect(foundationsDocument.caseStudy.criticalErrors.length).toBeGreaterThanOrEqual(5);
    expect(foundationsDocument.caseStudy.checkpoint.answerIndex).toBe(2);
  });
});
