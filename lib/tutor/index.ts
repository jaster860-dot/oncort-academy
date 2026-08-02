/**
 * Public surface of the tutor.
 *
 * `TutorResult` keeps the shape consumers already depend on, so switching the
 * grading engine stays an internal concern of this module.
 */
export type {
  AxisId,
  AxisResult,
  PrimaryGap,
  RemediationConcept,
  TutorResult,
} from "./schema";

export { AXIS_IDS, AXIS_LABELS, deriveResult, validateLlmPayload } from "./schema";
export { detectCriticalError, evaluateCaseAnswer, evaluateRetest } from "./deterministic";
export { mergeTutorResults } from "./merge";
export { gradeCaseAnswer } from "./client";
