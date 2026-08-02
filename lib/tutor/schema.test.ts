import { describe, expect, it } from "vitest";
import { AXIS_IDS, deriveResult, validateLlmPayload } from "./schema";
import type { AxisResult } from "./schema";

const ALLOWED = new Set(["psma_pet_limits", "adt_rt_integration", "eau_prostate_2026"]);

const axis = (id: string, score: number, citations: string[] = ["psma_pet_limits"]) => ({
  id,
  score,
  rationale: "Justification suffisante.",
  citations,
});

const validPayload = (overrides: Record<string, unknown> = {}) => ({
  verdict: "partial",
  criticalError: false,
  axes: AXIS_IDS.map((id) => axis(id, 1)),
  ...overrides,
});

describe("validateLlmPayload", () => {
  it("accepts a well-formed payload and returns axes in canonical order", () => {
    const shuffled = [...AXIS_IDS].reverse().map((id) => axis(id, 2));
    const result = validateLlmPayload(validPayload({ axes: shuffled }), ALLOWED);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.axes.map((a) => a.id)).toEqual([...AXIS_IDS]);
    expect(result.citations).toEqual(["psma_pet_limits"]);
  });

  it("rejects a citation that is not on the whitelist", () => {
    const payload = validPayload({
      axes: AXIS_IDS.map((id) =>
        id === "mechanismUnderstanding" ? axis(id, 2, ["lancet_2027_inventee"]) : axis(id, 1),
      ),
    });
    const result = validateLlmPayload(payload, ALLOWED);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invented_citation");
    expect(result.detail).toBe("lancet_2027_inventee");
  });

  it.each([
    ["a score outside 0-2", { axes: AXIS_IDS.map((id) => axis(id, 3)) }, "score_out_of_range"],
    ["a missing axis", { axes: AXIS_IDS.slice(1).map((id) => axis(id, 1)) }, "wrong_axis_count"],
    ["an unknown verdict", { verdict: "brilliant" }, "bad_verdict"],
    ["a non-boolean criticalError", { criticalError: "oui" }, "bad_critical_error"],
    ["axes that are not an array", { axes: "cinq" }, "bad_axes_shape"],
  ])("rejects %s", (_label, overrides, reason) => {
    const result = validateLlmPayload(validPayload(overrides), ALLOWED);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe(reason);
  });

  it("rejects a duplicated axis even when the count is right", () => {
    const payload = validPayload({
      axes: [axis("finalAnswerAccuracy", 1), ...AXIS_IDS.slice(0, 4).map((id) => axis(id, 1))],
    });
    const result = validateLlmPayload(payload, ALLOWED);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("duplicate_axis_id");
  });

  it("rejects a non-object payload", () => {
    expect(validateLlmPayload(null, ALLOWED).ok).toBe(false);
    expect(validateLlmPayload("{}", ALLOWED).ok).toBe(false);
  });

  it("treats an empty rationale as missing", () => {
    const payload = validPayload({
      axes: AXIS_IDS.map((id) => ({ ...axis(id, 1), rationale: "   " })),
    });
    const result = validateLlmPayload(payload, ALLOWED);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("missing_rationale");
  });
});

describe("deriveResult", () => {
  const axes = (scores: number[]): AxisResult[] =>
    AXIS_IDS.map((id, index) => ({
      id,
      label: id,
      score: scores[index] as 0 | 1 | 2,
      rationale: "x",
    }));

  it("routes remediation to the weakest axis", () => {
    const result = deriveResult(axes([2, 2, 2, 0, 2]), false);
    expect(result.primaryGap).toBe("medical_oncology_gap");
    expect(result.remediationConcept).toBe("adt_rt_integration");
  });

  it("breaks ties toward the earliest axis so routing stays deterministic", () => {
    const result = deriveResult(axes([0, 0, 2, 2, 2]), false);
    expect(result.remediationConcept).toBe("psma_pet_limits");
  });

  it("forces an unsafe verdict when a critical error is present, whatever the total", () => {
    const result = deriveResult(axes([2, 2, 2, 2, 2]), true);
    expect(result.score).toBe(10);
    expect(result.verdict).toBe("unsafe");
  });
});
