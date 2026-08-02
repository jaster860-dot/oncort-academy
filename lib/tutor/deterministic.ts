import type { AxisResult, TutorResult } from "./schema";
import { AXIS_LABELS, deriveResult } from "./schema";

/**
 * Deterministic tutor.
 *
 * Two jobs, both safety-critical:
 *  1. **Critical-error net** — runs on every answer, including when the LLM
 *     path succeeds. Its `unsafe` verdict overrides the model (see merge.ts).
 *  2. **Fallback** — produces a complete grade whenever the LLM path is
 *     unavailable or its output fails validation, so a learner is never left
 *     without feedback.
 *
 * Deliberately dependency-free: the Supabase Edge Function imports this module
 * directly, so there is a single source of truth rather than a Deno copy.
 */

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const containsAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(normalize(term)));

const countGroups = (text: string, groups: string[][]) =>
  groups.filter((group) => containsAny(text, group)).length;

const scoreFromCount = (count: number, full: number, partial: number): 0 | 1 | 2 =>
  count >= full ? 2 : count >= partial ? 1 : 0;

/**
 * Detects the critical errors listed in `content/<site>/tutor/TUTOR_RUBRIC.md`.
 * Exported so the merge step can consult it without recomputing a full grade.
 */
export function detectCriticalError(answer: string): boolean {
  const text = normalize(answer);
  return (
    containsAny(text, [
      "pet negatif exclut",
      "psma negatif exclut",
      "aucun risque microscopique",
      "pas de maladie microscopique",
      "pet negatif donc pas d'adt",
      "psma negatif donc pas d'adt",
      "pet negatif rend l'adt inutile",
      "psma negatif rend l'adt inutile",
    ]) ||
    (containsAny(text, ["radiotherapie seule", "rt seule"]) &&
      containsAny(text, ["pet negatif", "psma negatif"]))
  );
}

export function evaluateCaseAnswer(answer: string): TutorResult {
  const text = normalize(answer);
  const psmaCriticalError = detectCriticalError(answer);

  const calibrated = containsAny(text, [
    "discussion multidisciplinaire",
    "decision partagee",
    "balance benefice",
    "selon le patient",
    "a discuter",
    "ne suffit pas",
    "n'exclut pas",
    "n exclut pas",
  ]);

  const missingDataCount = countGroups(text, [
    ["esperance de vie", "comorbid", "fragil", "etat general"],
    ["cardiovascul", "metaboli", "osseux", "osteopor"],
    ["urinaire", "ipss", "sexuel", "erectile"],
    ["preference", "decision partagee"],
    ["carotte", "cribriform", "intraductal", "proportion de grade 4"],
  ]);
  const riskCount = countGroups(text, [
    ["haut risque", "high risk"],
    ["ct3", "t3a", "extension extracapsulaire"],
    ["isup 4", "gleason 8", "grade 4"],
    ["psa 32", "psa eleve"],
  ]);
  const systemicCount = countGroups(text, [
    ["adt", "hormonotherapie", "suppression androgenique"],
    ["microscop", "systemique", "androgen"],
    ["toxicite", "cardiovascul", "metaboli", "osseux", "sexuel"],
    ["duree", "intensification", "arpi", "abiraterone"],
  ]);
  const localCount = countGroups(text, [
    ["radiotherapie", "rt", "ebrt"],
    ["prostatectomie", "chirurgie"],
    ["multimodal", "traitement complementaire", "rattrapage"],
    ["preference", "qualite de vie", "urinaire", "sexuel"],
  ]);

  const axes: AxisResult[] = [
    {
      id: "finalAnswerAccuracy",
      label: AXIS_LABELS.finalAnswerAccuracy,
      score: psmaCriticalError ? 0 : calibrated ? 2 : 1,
      rationale: psmaCriticalError
        ? "La réponse utilise à tort le PSMA-PET négatif pour exclure le risque microscopique ou l'ADT."
        : calibrated
          ? "La conclusion distingue le staging d'une décision multidisciplinaire complète."
          : "La conclusion est plausible mais la calibration et la décision partagée doivent être explicites.",
    },
    {
      id: "missingDataDetection",
      label: AXIS_LABELS.missingDataDetection,
      score: scoreFromCount(missingDataCount, 4, 2),
      rationale:
        missingDataCount >= 4
          ? "Le terrain, les fonctions et les préférences sont intégrés à la décision."
          : missingDataCount >= 2
            ? "Le contexte du patient est partiellement exploré."
            : "La réponse traite la tumeur sans assez caractériser le patient.",
    },
    {
      id: "mechanismUnderstanding",
      label: AXIS_LABELS.mechanismUnderstanding,
      score: scoreFromCount(riskCount, 3, 1),
      rationale:
        riskCount >= 3
          ? "Le haut risque est reconstruit à partir du PSA, du stade T et du groupe ISUP."
          : riskCount >= 1
            ? "Le risque est reconnu mais insuffisamment justifié."
            : "La réponse ne reconstruit pas le groupe de risque.",
    },
    {
      id: "treatmentToolMatching",
      label: AXIS_LABELS.treatmentToolMatching,
      score: scoreFromCount(systemicCount, 3, 1),
      rationale:
        systemicCount >= 3
          ? "L'ADT est intégrée comme traitement oncologique avec sa balance bénéfice-toxicité."
          : systemicCount >= 1
            ? "L'ADT est citée sans mécanisme, durée ou toxicités suffisamment discutés."
            : "La composante d'oncologie médicale est absente.",
    },
    {
      id: "confidenceCalibration",
      label: AXIS_LABELS.confidenceCalibration,
      score: scoreFromCount(localCount, 3, 1),
      rationale:
        localCount >= 3
          ? "Les parcours chirurgie et radiothérapie sont comparés comme stratégies potentiellement multimodales."
          : localCount >= 1
            ? "Une option locale est citée mais la comparaison multidisciplinaire reste partielle."
            : "La réponse ne construit pas les options curatives locales.",
    },
  ];

  return deriveResult(axes, psmaCriticalError);
}

export function evaluateRetest(answer: string) {
  const text = normalize(answer);
  const checks = [
    containsAny(text, ["haut risque", "t3a", "isup 4", "psa 32"]),
    containsAny(text, ["microscop", "n'exclut pas", "n exclut pas", "limite de detection"]),
    containsAny(text, ["adt", "hormonotherapie", "suppression androgenique"]),
    containsAny(text, [
      "prostatectomie",
      "chirurgie",
      "multimodal",
      "decision partagee",
      "comorbid",
      "preference",
    ]),
  ];
  const criticalError = containsAny(text, [
    "pet negatif exclut",
    "psma negatif exclut",
    "pet negatif donc pas d'adt",
    "psma negatif donc pas d'adt",
    "radiotherapie seule suffit",
  ]);
  const score = checks.filter(Boolean).length;

  return {
    score,
    maxScore: 4,
    criticalError,
    mastered: score >= 3 && !criticalError,
  };
}
