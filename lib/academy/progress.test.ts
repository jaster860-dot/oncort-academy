import { describe, expect, it } from "vitest";
import { calculateBlockPercent, emptyProgress, nextRecommendedBlock } from "./progress";

describe("academy progress model", () => {
  it("reserves ten percent for the integrative case", () => {
    const progress = emptyProgress("prostate", "foundations");
    progress.completedLessonIds = ["l1", "l2", "l3"];
    expect(calculateBlockPercent(progress, 6)).toBe(45);
    progress.completedLessonIds = ["l1", "l2", "l3", "l4", "l5", "l6"];
    expect(calculateBlockPercent(progress, 6)).toBe(90);
    progress.caseCompleted = true;
    expect(calculateBlockPercent(progress, 6)).toBe(100);
  });

  it("recommends the first unfinished block", () => {
    const blocks = [{ id: "foundations" }, { id: "diagnosis" }];
    const documents = {
      foundations: { lessons: [{ id: "l1" }] },
      diagnosis: { lessons: [{ id: "l2" }] },
    };
    const done = emptyProgress("prostate", "foundations");
    done.completedLessonIds = ["l1"];
    done.caseCompleted = true;
    expect(nextRecommendedBlock("prostate", blocks, documents, { "prostate:foundations": done })?.id).toBe("diagnosis");
  });
});
