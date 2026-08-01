import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import foundationsDocument from "../content/prostate/learn/foundations.json";

describe("generated figures for the prostate foundations pilot", () => {
  it("binds each of the six pilot lessons to a local accessible image", () => {
    const pilotLessons = foundationsDocument.lessons.slice(0, 6);

    expect(pilotLessons).toHaveLength(6);
    for (const lesson of pilotLessons) {
      expect(lesson.visual.imageSrc).toMatch(/^\/figures\/prostate\/foundations\/[0-9]{2}-.+\.png$/);
      expect(lesson.visual.altText.length).toBeGreaterThan(40);
      expect(existsSync(join(process.cwd(), "public", lesson.visual.imageSrc.replace(/^\//, "")))).toBe(true);
    }
  });

  it("keeps the text representation as the accessible fallback", () => {
    for (const lesson of foundationsDocument.lessons.slice(0, 6)) {
      expect(lesson.visual.items.length).toBeGreaterThanOrEqual(2);
      expect(lesson.visual.caption.length).toBeGreaterThan(30);
    }
  });
});
