export type AxisId =
  | "finalAnswerAccuracy"
  | "missingDataDetection"
  | "mechanismUnderstanding"
  | "treatmentToolMatching"
  | "confidenceCalibration";

export type AxisResult = {
  id: AxisId;
  label: string;
  score: 0 | 1 | 2;
  rationale: string;
};

export type TutorResult = {
  verdict: "correct" | "partial" | "unsafe";
  score: number;
  maxScore: 10;
  criticalError: boolean;
  primaryGap:
    | "risk_gap"
    | "rcp_gap"
    | "imaging_gap"
    | "medical_oncology_gap"
    | "patient_gap";
  remediationConcept:
    | "psma_pet_limits"
    | "adt_rt_integration"
    | "multimodal_curative_options"
    | "risk_and_patient_context";
  axes: AxisResult[];
};

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

export function evaluateCaseAnswer(answer: string): TutorResult {
  const text = normalize(answer);
  const psmaCriticalError =
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
      containsAny(text, ["pet negatif", "psma negatif"]));

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
      label: "Conclusion",
      score: psmaCriticalError ? 0 : calibrated ? 2 : 1,
      rationale: psmaCriticalError
        ? "La réponse utilise à tort le PSMA-PET négatif pour exclure le risque microscopique ou l'ADT."
        : calibrated
          ? "La conclusion distingue le staging d'une décision multidisciplinaire complète."
          : "La conclusion est plausible mais la calibration et la décision partagée doivent être explicites.",
    },
    {
      id: "missingDataDetection",
      label: "Données manquantes",
      score: scoreFromCount(missingDataCount, 4, 2),
      rationale: missingDataCount >= 4
        ? "Le terrain, les fonctions et les préférences sont intégrés à la décision."
        : missingDataCount >= 2
          ? "Le contexte du patient est partiellement exploré."
          : "La réponse traite la tumeur sans assez caractériser le patient.",
    },
    {
      id: "mechanismUnderstanding",
      label: "Stratification",
      score: scoreFromCount(riskCount, 3, 1),
      rationale: riskCount >= 3
        ? "Le haut risque est reconstruit à partir du PSA, du stade T et du groupe ISUP."
        : riskCount >= 1
          ? "Le risque est reconnu mais insuffisamment justifié."
          : "La réponse ne reconstruit pas le groupe de risque.",
    },
    {
      id: "treatmentToolMatching",
      label: "Oncologie médicale",
      score: scoreFromCount(systemicCount, 3, 1),
      rationale: systemicCount >= 3
        ? "L'ADT est intégrée comme traitement oncologique avec sa balance bénéfice-toxicité."
        : systemicCount >= 1
          ? "L'ADT est citée sans mécanisme, durée ou toxicités suffisamment discutés."
          : "La composante d'oncologie médicale est absente.",
    },
    {
      id: "confidenceCalibration",
      label: "Stratégie locale et RCP",
      score: scoreFromCount(localCount, 3, 1),
      rationale: localCount >= 3
        ? "Les parcours chirurgie et radiothérapie sont comparés comme stratégies potentiellement multimodales."
        : localCount >= 1
          ? "Une option locale est citée mais la comparaison multidisciplinaire reste partielle."
          : "La réponse ne construit pas les options curatives locales.",
    },
  ];

  const score = axes.reduce((total, axis) => total + axis.score, 0);
  const lowest = [...axes].sort((a, b) => a.score - b.score)[0];
  const routing: Record<
    AxisId,
    Pick<TutorResult, "primaryGap" | "remediationConcept">
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

  return {
    verdict: psmaCriticalError ? "unsafe" : score >= 9 ? "correct" : "partial",
    score,
    maxScore: 10,
    criticalError: psmaCriticalError,
    ...routing[lowest.id],
    axes,
  };
}

export function evaluateRetest(answer: string) {
  const text = normalize(answer);
  const checks = [
    containsAny(text, ["haut risque", "t3a", "isup 4", "psa 32"]),
    containsAny(text, ["microscop", "n'exclut pas", "n exclut pas", "limite de detection"]),
    containsAny(text, ["adt", "hormonotherapie", "suppression androgenique"]),
    containsAny(text, ["prostatectomie", "chirurgie", "multimodal", "decision partagee", "comorbid", "preference"]),
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
