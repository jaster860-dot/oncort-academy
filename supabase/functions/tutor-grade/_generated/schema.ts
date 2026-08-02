// GENERATED from lib/tutor/schema.ts — do not edit. Run: npm run build:tutor-fn
export type AxisId =
  | "finalAnswerAccuracy"
  | "missingDataDetection"
  | "mechanismUnderstanding"
  | "treatmentToolMatching"
  | "confidenceCalibration";

export const AXIS_IDS: readonly AxisId[] = [
  "finalAnswerAccuracy",
  "missingDataDetection",
  "mechanismUnderstanding",
  "treatmentToolMatching",
  "confidenceCalibration",
] as const;

export type PrimaryGap =
  | "risk_gap"
  | "rcp_gap"
  | "imaging_gap"
  | "medical_oncology_gap"
  | "patient_gap";

export type RemediationConcept =
  | "psma_pet_limits"
  | "adt_rt_integration"
  | "multimodal_curative_options"
  | "risk_and_patient_context";

export type AxisResult = {
  id: AxisId;
  label: string;
  score: 0 | 1 | 2;
  rationale: string;
  /** Concept or source ids backing this rationale. Empty on the deterministic path. */
  citations?: string[];
};

export type TutorResult = {
  verdict: "correct" | "partial" | "unsafe";
  score: number;
  maxScore: 10;
  criticalError: boolean;
  primaryGap: PrimaryGap;
  remediationConcept: RemediationConcept;
  axes: AxisResult[];
  /** Which engine produced the scores the learner sees. */
  source?: "llm" | "deterministic_fallback";
  /** Set when the answer raises a point the site content does not cover. */
  outOfScope?: boolean;
  outOfScopeNote?: string;
  /** True when the deterministic net and the model disagreed on safety. */
  disagreement?: boolean;
};

/** Raw shape expected back from the model, before any validation. */
export type LlmTutorPayload = {
  verdict: unknown;
  criticalError: unknown;
  criticalErrorReason?: unknown;
  outOfScope?: unknown;
  outOfScopeNote?: unknown;
  axes: unknown;
};

export const AXIS_LABELS: Record<AxisId, string> = {
  finalAnswerAccuracy: "Conclusion",
  missingDataDetection: "Données manquantes",
  mechanismUnderstanding: "Stratification",
  treatmentToolMatching: "Oncologie médicale",
  confidenceCalibration: "Stratégie locale et RCP",
};

/**
 * Which remediation capsule to route to, keyed by the weakest axis.
 * Shared by both engines so routing never drifts between them.
 */
export const AXIS_ROUTING: Record<
  AxisId,
  { primaryGap: PrimaryGap; remediationConcept: RemediationConcept }
> = {
  finalAnswerAccuracy: {
    primaryGap: "imaging_gap",
    remediationConcept: "psma_pet_limits",
  },
  missingDataDetection: {
    primaryGap: "patient_gap",
    remediationConcept: "risk_and_patient_context",
  },
  mechanismUnderstanding: {
    primaryGap: "risk_gap",
    remediationConcept: "risk_and_patient_context",
  },
  treatmentToolMatching: {
    primaryGap: "medical_oncology_gap",
    remediationConcept: "adt_rt_integration",
  },
  confidenceCalibration: {
    primaryGap: "rcp_gap",
    remediationConcept: "multimodal_curative_options",
  },
};

/**
 * Derives verdict, total and remediation routing from scored axes.
 * Both the deterministic engine and the LLM path go through this, so a given
 * set of axis scores always yields the same verdict and the same capsule.
 */
export function deriveResult(
  axes: AxisResult[],
  criticalError: boolean,
): Pick<
  TutorResult,
  "verdict" | "score" | "maxScore" | "criticalError" | "primaryGap" | "remediationConcept" | "axes"
> {
  const score = axes.reduce((total, axis) => total + axis.score, 0);
  // Ties resolve to the earliest axis in canonical order, keeping routing deterministic.
  const lowest = AXIS_IDS.map((id) => axes.find((axis) => axis.id === id)!).reduce((a, b) =>
    b.score < a.score ? b : a,
  );

  return {
    verdict: criticalError ? "unsafe" : score >= 9 ? "correct" : "partial",
    score,
    maxScore: 10,
    criticalError,
    ...AXIS_ROUTING[lowest.id],
    axes,
  };
}

export type ValidationFailure = {
  ok: false;
  /** Machine-readable reason, logged as fallback_reason. */
  reason:
    | "not_an_object"
    | "bad_axes_shape"
    | "wrong_axis_count"
    | "unknown_axis_id"
    | "duplicate_axis_id"
    | "score_out_of_range"
    | "missing_rationale"
    | "bad_verdict"
    | "bad_critical_error"
    | "invented_citation";
  detail?: string;
};

export type ValidationSuccess = {
  ok: true;
  axes: AxisResult[];
  criticalError: boolean;
  outOfScope: boolean;
  outOfScopeNote?: string;
  citations: string[];
};

const isScore = (value: unknown): value is 0 | 1 | 2 =>
  value === 0 || value === 1 || value === 2;

/**
 * Validates a model payload against the tutor contract.
 *
 * Rejection is never surfaced to the learner as an error: the caller falls back
 * to the deterministic tutor. Any citation absent from `allowedIds` rejects the
 * whole payload, which is what makes a fabricated reference impossible to show.
 */
export function validateLlmPayload(
  raw: unknown,
  allowedIds: ReadonlySet<string>,
): ValidationSuccess | ValidationFailure {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, reason: "not_an_object" };
  }
  const payload = raw as LlmTutorPayload;

  if (payload.verdict !== "correct" && payload.verdict !== "partial" && payload.verdict !== "unsafe") {
    return { ok: false, reason: "bad_verdict", detail: String(payload.verdict) };
  }
  if (typeof payload.criticalError !== "boolean") {
    return { ok: false, reason: "bad_critical_error" };
  }
  if (!Array.isArray(payload.axes)) {
    return { ok: false, reason: "bad_axes_shape" };
  }
  if (payload.axes.length !== AXIS_IDS.length) {
    return { ok: false, reason: "wrong_axis_count", detail: String(payload.axes.length) };
  }

  const seen = new Set<string>();
  const citations: string[] = [];
  const axes: AxisResult[] = [];

  for (const entry of payload.axes) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, reason: "bad_axes_shape" };
    }
    const axis = entry as Record<string, unknown>;
    const id = axis.id;

    if (typeof id !== "string" || !(AXIS_IDS as readonly string[]).includes(id)) {
      return { ok: false, reason: "unknown_axis_id", detail: String(id) };
    }
    if (seen.has(id)) {
      return { ok: false, reason: "duplicate_axis_id", detail: id };
    }
    seen.add(id);

    if (!isScore(axis.score)) {
      return { ok: false, reason: "score_out_of_range", detail: `${id}=${String(axis.score)}` };
    }
    if (typeof axis.rationale !== "string" || axis.rationale.trim() === "") {
      return { ok: false, reason: "missing_rationale", detail: id };
    }

    const rawCitations = Array.isArray(axis.citations) ? axis.citations : [];
    const axisCitations: string[] = [];
    for (const citation of rawCitations) {
      if (typeof citation !== "string") {
        return { ok: false, reason: "invented_citation", detail: String(citation) };
      }
      if (!allowedIds.has(citation)) {
        return { ok: false, reason: "invented_citation", detail: citation };
      }
      axisCitations.push(citation);
      citations.push(citation);
    }

    axes.push({
      id: id as AxisId,
      label: AXIS_LABELS[id as AxisId],
      score: axis.score,
      rationale: axis.rationale.trim(),
      citations: axisCitations,
    });
  }

  return {
    ok: true,
    // Canonical order, so the UI never depends on the model's ordering.
    axes: AXIS_IDS.map((id) => axes.find((axis) => axis.id === id)!),
    criticalError: payload.criticalError,
    outOfScope: payload.outOfScope === true,
    outOfScopeNote:
      typeof payload.outOfScopeNote === "string" ? payload.outOfScopeNote.trim() : undefined,
    citations: [...new Set(citations)],
  };
}
