import { describe, expect, it } from "vitest";
import { evaluateCaseAnswer, evaluateRetest } from "./deterministic";

describe("evaluateCaseAnswer", () => {
  it("rewards a complete and calibrated answer", () => {
    const result = evaluateCaseAnswer(
      "Il s'agit d'un haut risque avec cT3a, ISUP 4 et PSA 32. Un PSMA-PET négatif " +
        "n'exclut pas une maladie microscopique. Il faut préciser l'espérance de vie, " +
        "les comorbidités cardiovasculaires, la santé osseuse, les symptômes urinaires, " +
        "la fonction sexuelle et les préférences. La discussion multidisciplinaire compare " +
        "une prostatectomie dans un parcours potentiellement multimodal à une radiothérapie " +
        "associée à une ADT, dont la durée, l'intensification et les toxicités sont à discuter.",
    );

    expect(result.verdict).toBe("correct");
    expect(result.score).toBeGreaterThanOrEqual(9);
    expect(result.criticalError).toBe(false);
  });

  it("flags false reassurance from a negative PSMA PET", () => {
    const result = evaluateCaseAnswer(
      "Le PSMA-PET négatif exclut tout risque microscopique, donc une radiothérapie seule suffit.",
    );

    expect(result.verdict).toBe("unsafe");
    expect(result.criticalError).toBe(true);
  });
});

describe("evaluateRetest", () => {
  it("requires transfer across risk, imaging, systemic and local treatment", () => {
    const result = evaluateRetest(
      "La maladie reste à haut risque. Le PSMA-PET négatif n'exclut pas une maladie " +
        "microscopique. Une ADT doit être intégrée à la discussion de radiothérapie, " +
        "et la décision partagée compare aussi la chirurgie dans un parcours multimodal.",
    );

    expect(result.mastered).toBe(true);
    expect(result.score).toBe(4);
  });
});
