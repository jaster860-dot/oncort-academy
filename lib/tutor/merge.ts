import type { AxisResult, TutorResult } from "./schema";
import type { ValidationSuccess } from "./schema";
import { deriveResult } from "./schema";

/**
 * Reconciles the model's grade with the deterministic critical-error net.
 *
 * The rule is deliberately asymmetric: the net can only ever make a verdict
 * *more* severe. A model can never clear an answer the net flagged as
 * clinically dangerous, and any disagreement resolves toward caution and gets
 * flagged for human review.
 *
 * | net      | model     | final                        |
 * | -------- | --------- | ---------------------------- |
 * | unsafe   | anything  | unsafe (+ disagreement)      |
 * | safe     | unsafe    | unsafe (+ disagreement)      |
 * | safe     | safe      | model scores and rationales  |
 */
export function mergeTutorResults(
  llm: ValidationSuccess,
  netDetectedCriticalError: boolean,
): TutorResult {
  const modelFlagged = llm.criticalError;
  const criticalError = netDetectedCriticalError || modelFlagged;
  const disagreement = netDetectedCriticalError !== modelFlagged;

  // When the net fires, zero the axis the critical error belongs to. This both
  // reflects the severity and routes remediation to the imaging capsule, since
  // deriveResult breaks score ties toward the earliest axis.
  const axes: AxisResult[] = netDetectedCriticalError
    ? llm.axes.map((axis) =>
        axis.id === "finalAnswerAccuracy" ? { ...axis, score: 0 as const } : axis,
      )
    : llm.axes;

  return {
    ...deriveResult(axes, criticalError),
    source: "llm",
    outOfScope: llm.outOfScope,
    outOfScopeNote: llm.outOfScopeNote,
    disagreement,
  };
}
