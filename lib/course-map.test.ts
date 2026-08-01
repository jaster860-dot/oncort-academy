import { describe, expect, it } from "vitest";
import courseMap from "../content/prostate/course_map.json";
import curriculum from "../content/prostate/curriculum.json";
import blockOverviews from "../content/prostate/learn/block_overviews.json";
import nodeLabels from "../content/prostate/node_labels.json";
import sources from "../content/prostate/sources/index.json";

describe("complete prostate course map", () => {
  it("maps all 81 curriculum nodes exactly once across 15 blocks", () => {
    const expected = curriculum.modules.flatMap((module) => module.nodes).sort();
    const mapped = courseMap.blocks.flatMap((block) => block.nodeIds).sort();

    expect(courseMap.blocks).toHaveLength(15);
    expect(mapped).toHaveLength(81);
    expect(new Set(mapped).size).toBe(81);
    expect(mapped).toEqual(expected);
    expect(Object.keys(nodeLabels).sort()).toEqual(expected);
  });

  it("provides one playable overview and valid sources for every block", () => {
    const sourceIds = new Set(sources.sources.map((source) => source.id));
    const overviewIds = blockOverviews.overviews.map((overview) => overview.blockId);

    expect(overviewIds).toEqual(courseMap.blocks.map((block) => block.id));

    for (const overview of blockOverviews.overviews) {
      expect(overview.pillars).toHaveLength(3);
      expect(overview.outcomes.length).toBeGreaterThanOrEqual(3);
      expect(overview.checkpoint.answerIndex).toBeGreaterThanOrEqual(0);
      expect(overview.checkpoint.answerIndex).toBeLessThan(overview.checkpoint.options.length);
      for (const sourceId of overview.sourceIds) expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});
