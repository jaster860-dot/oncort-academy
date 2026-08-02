import { describe, expect, it } from "vitest";
import { mergeTutorResults } from "./merge";
import { AXIS_IDS } from "./schema";
import type { ValidationSuccess } from "./schema";

const llmResult = (score: 0 | 1 | 2, criticalError = false): ValidationSuccess => ({
  ok: true,
  criticalError,
  outOfScope: false,
  citations: ["psma_pet_limits"],
  axes: AXIS_IDS.map((id) => ({
    id,
    label: id,
    score,
    rationale: "Justification du modèle.",
    citations: ["psma_pet_limits"],
  })),
});

describe("mergeTutorResults — the model can only ever be overridden toward caution", () => {
  it("forces unsafe when the net fires, even on a perfect model grade", () => {
    const merged = mergeTutorResults(llmResult(2, false), true);

    expect(merged.verdict).toBe("unsafe");
    expect(merged.criticalError).toBe(true);
    expect(merged.disagreement).toBe(true);
  });

  it("routes an overridden answer to the imaging capsule", () => {
    const merged = mergeTutorResults(llmResult(2, false), true);

    expect(merged.remediationConcept).toBe("psma_pet_limits");
    expect(merged.axes.find((a) => a.id === "finalAnswerAccuracy")?.score).toBe(0);
  });

  it("keeps unsafe when only the model flags it, and marks the disagreement", () => {
    const merged = mergeTutorResults(llmResult(2, true), false);

    expect(merged.verdict).toBe("unsafe");
    expect(merged.disagreement).toBe(true);
  });

  it("keeps the model's grade when both engines agree the answer is safe", () => {
    const merged = mergeTutorResults(llmResult(2, false), false);

    expect(merged.verdict).toBe("correct");
    expect(merged.score).toBe(10);
    expect(merged.disagreement).toBe(false);
    expect(merged.source).toBe("llm");
  });

  it("does not silently zero an axis when the net did not fire", () => {
    const merged = mergeTutorResults(llmResult(1, false), false);

    expect(merged.axes.every((a) => a.score === 1)).toBe(true);
    expect(merged.score).toBe(5);
    expect(merged.verdict).toBe("partial");
  });

  it("preserves the model's citations through the merge", () => {
    const merged = mergeTutorResults(llmResult(2, false), true);

    expect(merged.axes.every((a) => a.citations?.includes("psma_pet_limits"))).toBe(true);
  });
});
