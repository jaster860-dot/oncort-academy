import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const courseMap = JSON.parse(
  readFileSync(join(root, "content/prostate/course_map.json"), "utf8"),
);
const manifest = JSON.parse(
  readFileSync(join(root, "content/prostate/review/figure_placement_manifest.json"), "utf8"),
);

const lessons = courseMap.blocks.flatMap((block: { id: string }) => {
  const document = JSON.parse(
    readFileSync(join(root, `content/prostate/learn/${block.id}.json`), "utf8"),
  );
  return document.lessons;
});

describe("just-in-time placement of prostate figures", () => {
  it("assigns one explicit valid placement to every lesson", () => {
    expect(lessons).toHaveLength(91);
    for (const lesson of lessons) {
      expect(["after_takeaways", "after_section", "after_sections", "before_checkpoint"])
        .toContain(lesson.visual.placement);
      if (lesson.visual.placement === "after_section") {
        expect(lesson.visual.afterSection).toBeGreaterThanOrEqual(1);
        expect(lesson.visual.afterSection).toBeLessThanOrEqual(lesson.sections.length);
      } else {
        expect(lesson.visual.afterSection).toBeUndefined();
      }
    }
  });

  it("uses several pedagogical moments rather than a universal position", () => {
    const signatures = lessons.map((lesson: { visual: { placement: string; afterSection?: number } }) =>
      `${lesson.visual.placement}:${lesson.visual.afterSection ?? "-"}`,
    );
    expect(new Set(signatures).size).toBe(6);
    expect(signatures.filter((value: string) => value === "after_takeaways:-")).toHaveLength(3);
    expect(signatures.filter((value: string) => value === "after_sections:-")).toHaveLength(5);
    expect(signatures.filter((value: string) => value === "before_checkpoint:-")).toHaveLength(1);
  });

  it("keeps the placement manifest synchronized with lesson content", () => {
    expect(manifest.placements).toHaveLength(91);
    const byId = new Map(manifest.placements.map((entry: { lessonId: string }) => [entry.lessonId, entry]));
    for (const lesson of lessons) {
      const entry = byId.get(lesson.id) as { placement: string; afterSection?: number; rationale: string } | undefined;
      expect(entry, `${lesson.id}: entrée de manifeste absente`).toBeTruthy();
      expect(entry?.placement).toBe(lesson.visual.placement);
      expect(entry?.afterSection).toBe(lesson.visual.afterSection);
      expect(entry?.rationale.length).toBeGreaterThan(40);
    }
  });
});
