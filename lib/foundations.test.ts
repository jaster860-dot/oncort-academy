import { describe, expect, it } from "vitest";
import complexSpecialSituationsDocument from "../content/prostate/learn/complex_special_situations.json";
import deferredDocument from "../content/prostate/learn/deferred_management.json";
import definitiveRadiotherapyDocument from "../content/prostate/learn/definitive_radiotherapy.json";
import diagnosisDocument from "../content/prostate/learn/detection_diagnosis.json";
import followupSurvivorshipDocument from "../content/prostate/learn/followup_survivorship.json";
import foundationsDocument from "../content/prostate/learn/foundations.json";
import highRiskDocument from "../content/prostate/learn/high_risk_and_cn1.json";
import hormoneSensitiveDocument from "../content/prostate/learn/hormone_sensitive_and_nmcrpc.json";
import localizedDocument from "../content/prostate/learn/localized_curative_options.json";
import mcrpcDocument from "../content/prostate/learn/mcrpc_precision_palliation.json";
import postradiotherapyDocument from "../content/prostate/learn/postradiotherapy_and_oligorecurrence.json";
import postprostatectomyDocument from "../content/prostate/learn/postprostatectomy_recurrence.json";
import radiotherapyPlanningDocument from "../content/prostate/learn/radiotherapy_planning.json";
import stagingDocument from "../content/prostate/learn/staging_risk_biomarkers.json";
import systemicTherapyDocument from "../content/prostate/learn/systemic_therapy_foundations.json";
import sourcesDocument from "../content/prostate/sources/index.json";

function expectValidLessonSet(lessons: typeof foundationsDocument.lessons) {
  for (const lesson of lessons) {
    expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
    expect(lesson.sections.length).toBeGreaterThanOrEqual(2);
    expect(lesson.checkpoint.options.length).toBeGreaterThanOrEqual(3);
    expect(lesson.checkpoint.answerIndex).toBeGreaterThanOrEqual(0);
    expect(lesson.checkpoint.answerIndex).toBeLessThan(lesson.checkpoint.options.length);
    expect(lesson.flashcards).toHaveLength(3);
    expect(lesson.sources.length).toBeGreaterThanOrEqual(1);
  }
}

describe("prostate foundation learning path", () => {
  it("contains a complete six-lesson progression from anatomy to grading", () => {
    expect(foundationsDocument.lessons).toHaveLength(6);
    expect(foundationsDocument.lessons.map((lesson) => lesson.number)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(new Set(foundationsDocument.lessons.map((lesson) => lesson.id)).size).toBe(6);
  });

  it("keeps every checkpoint answer and evidence link structurally valid", () => {
    expectValidLessonSet(foundationsDocument.lessons);
  });
});

describe("prostate detection and diagnosis learning path", () => {
  it("contains five lessons from risk assessment to pathology", () => {
    expect(diagnosisDocument.lessons).toHaveLength(5);
    expect(diagnosisDocument.lessons.map((lesson) => lesson.number)).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps lessons, evidence anchors and the discordance case structurally valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(diagnosisDocument.lessons);
    expect(diagnosisDocument.evidenceScope.anchors).toHaveLength(3);
    for (const anchor of diagnosisDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(diagnosisDocument.caseStudy.status).toBe("needs_review");
    expect(diagnosisDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(diagnosisDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(4);
    expect(diagnosisDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(4);
    expect(diagnosisDocument.caseStudy.criticalErrors.length).toBeGreaterThanOrEqual(4);
    expect(diagnosisDocument.caseStudy.checkpoint.answerIndex).toBeGreaterThanOrEqual(0);
    expect(diagnosisDocument.caseStudy.checkpoint.answerIndex).toBeLessThan(
      diagnosisDocument.caseStudy.checkpoint.options.length,
    );
    for (const sourceId of diagnosisDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

describe("prostate staging, risk and biomarkers learning path", () => {
  it("contains five lessons from TNM to germline and somatic testing", () => {
    expect(stagingDocument.lessons).toHaveLength(5);
    expect(stagingDocument.lessons.map((lesson) => lesson.number)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(stagingDocument.lessons.map((lesson) => lesson.id)).size).toBe(5);
    expect(stagingDocument.lessons.map((lesson) => lesson.nodeId)).toEqual([
      "tnm_staging",
      "eau_risk_groups",
      "psma_pet_indications",
      "psma_pet_limits",
      "germline_and_somatic_testing",
    ]);
  });

  it("keeps every lesson, evidence anchor and case structurally valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(stagingDocument.lessons);
    expect(stagingDocument.evidenceScope.anchors).toHaveLength(4);
    for (const anchor of stagingDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(stagingDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(stagingDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(4);
    expect(stagingDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(4);
    expect(stagingDocument.caseStudy.checkpoint.answerIndex).toBeGreaterThanOrEqual(0);
    expect(stagingDocument.caseStudy.checkpoint.answerIndex).toBeLessThan(
      stagingDocument.caseStudy.checkpoint.options.length,
    );
    for (const sourceId of stagingDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

describe("prostate deferred management learning path", () => {
  it("contains five lessons from active surveillance to shared decision making", () => {
    expect(deferredDocument.lessons).toHaveLength(5);
    expect(deferredDocument.lessons.map((lesson) => lesson.number)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(deferredDocument.lessons.map((lesson) => lesson.id)).size).toBe(5);
    expect(deferredDocument.lessons.flatMap((lesson) => lesson.nodeId ?? [])).toEqual([
      "active_surveillance",
      "watchful_waiting",
      "focal_therapy_evidence",
      "shared_decision_quality_of_life",
    ]);
  });

  it("keeps every lesson, evidence anchor and synthetic comparison case valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(deferredDocument.lessons);
    expect(deferredDocument.evidenceScope.anchors).toHaveLength(3);
    for (const anchor of deferredDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(deferredDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(deferredDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(4);
    expect(deferredDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(4);
    expect(deferredDocument.caseStudy.checkpoint.answerIndex).toBeGreaterThanOrEqual(0);
    expect(deferredDocument.caseStudy.checkpoint.answerIndex).toBeLessThan(
      deferredDocument.caseStudy.checkpoint.options.length,
    );
    for (const sourceId of deferredDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

describe("prostate localized curative options learning path", () => {
  it("contains five lessons covering context, surgery, external beam RT, brachytherapy and multimodal pathways", () => {
    expect(localizedDocument.lessons).toHaveLength(5);
    expect(localizedDocument.lessons.map((lesson) => lesson.number)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(localizedDocument.lessons.map((lesson) => lesson.id)).size).toBe(5);
    expect(localizedDocument.lessons.map((lesson) => lesson.nodeId)).toEqual([
      "risk_and_patient_context",
      "radical_prostatectomy",
      "definitive_radiotherapy",
      "brachytherapy",
      "multimodal_curative_options",
    ]);
  });

  it("keeps every lesson, evidence anchor and curative-choice case valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(localizedDocument.lessons);
    expect(localizedDocument.evidenceScope.anchors).toHaveLength(4);
    for (const anchor of localizedDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(localizedDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(localizedDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(4);
    expect(localizedDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(4);
    for (const sourceId of localizedDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

describe("prostate definitive radiotherapy learning path", () => {
  it("contains seven lessons from indications to ADT duration", () => {
    expect(definitiveRadiotherapyDocument.lessons).toHaveLength(7);
    expect(definitiveRadiotherapyDocument.lessons.map((lesson) => lesson.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(new Set(definitiveRadiotherapyDocument.lessons.map((lesson) => lesson.id)).size).toBe(7);
    expect(definitiveRadiotherapyDocument.lessons.map((lesson) => lesson.nodeId)).toEqual([
      "definitive_ebrt_indications",
      "moderate_hypofractionation",
      "ultrahypofractionation_sbrt",
      "prostate_brachytherapy",
      "pelvic_nodal_irradiation",
      "dose_escalation_and_focal_boost",
      "adt_duration_with_rt",
    ]);
  });

  it("keeps every lesson, evidence anchor, divergence and prescription case valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(definitiveRadiotherapyDocument.lessons);
    expect(definitiveRadiotherapyDocument.evidenceScope.anchors).toHaveLength(4);
    expect(definitiveRadiotherapyDocument.evidenceScope.divergences).toHaveLength(2);
    for (const anchor of definitiveRadiotherapyDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(definitiveRadiotherapyDocument.caseStudy.status).toBe("needs_review");
    expect(definitiveRadiotherapyDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(definitiveRadiotherapyDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(5);
    expect(definitiveRadiotherapyDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(5);
    expect(definitiveRadiotherapyDocument.caseStudy.criticalErrors.length).toBeGreaterThanOrEqual(5);
    expect(definitiveRadiotherapyDocument.caseStudy.checkpoint.answerIndex).toBeGreaterThanOrEqual(0);
    expect(definitiveRadiotherapyDocument.caseStudy.checkpoint.answerIndex).toBeLessThan(
      definitiveRadiotherapyDocument.caseStudy.checkpoint.options.length,
    );
    for (const sourceId of definitiveRadiotherapyDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

describe("prostate radiotherapy planning learning path", () => {
  it("contains six lessons from simulation to pre-treatment audit", () => {
    expect(radiotherapyPlanningDocument.lessons).toHaveLength(6);
    expect(radiotherapyPlanningDocument.lessons.map((lesson) => lesson.number)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(new Set(radiotherapyPlanningDocument.lessons.map((lesson) => lesson.id)).size).toBe(6);
    expect(radiotherapyPlanningDocument.lessons.flatMap((lesson) => lesson.nodeId ?? [])).toEqual([
      "target_volume_delineation",
      "oar_and_plan_evaluation",
      "igrt_and_motion_management",
    ]);
  });

  it("keeps lessons, evidence anchors and synthetic plan audit valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(radiotherapyPlanningDocument.lessons);
    expect(radiotherapyPlanningDocument.evidenceScope.anchors).toHaveLength(4);
    for (const anchor of radiotherapyPlanningDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(radiotherapyPlanningDocument.caseStudy.status).toBe("needs_review");
    expect(radiotherapyPlanningDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(radiotherapyPlanningDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(6);
    expect(radiotherapyPlanningDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(6);
    expect(radiotherapyPlanningDocument.caseStudy.criticalErrors.length).toBeGreaterThanOrEqual(6);
    for (const sourceId of radiotherapyPlanningDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

describe("prostate post-prostatectomy recurrence learning path", () => {
  it("contains six lessons from PSA definition to postoperative radiotherapy", () => {
    expect(postprostatectomyDocument.lessons).toHaveLength(6);
    expect(postprostatectomyDocument.lessons.map((lesson) => lesson.number)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(new Set(postprostatectomyDocument.lessons.map((lesson) => lesson.id)).size).toBe(6);
    expect(postprostatectomyDocument.lessons.map((lesson) => lesson.nodeId)).toEqual([
      "biochemical_recurrence_definitions",
      "psa_doubling_time",
      "psma_pet_in_recurrence",
      "early_salvage_radiotherapy",
      "adt_with_salvage_rt",
      "postprostatectomy_radiotherapy",
    ]);
  });

  it("keeps lessons, evidence anchors and the synthetic early-salvage case valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(postprostatectomyDocument.lessons);
    expect(postprostatectomyDocument.evidenceScope.anchors).toHaveLength(5);
    for (const anchor of postprostatectomyDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(postprostatectomyDocument.caseStudy.status).toBe("needs_review");
    expect(postprostatectomyDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(postprostatectomyDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(7);
    expect(postprostatectomyDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(7);
    expect(postprostatectomyDocument.caseStudy.criticalErrors.length).toBeGreaterThanOrEqual(7);
    for (const sourceId of postprostatectomyDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

describe("prostate post-radiotherapy and oligorecurrence learning path", () => {
  it("contains four lessons from local salvage to metastasis-directed radiotherapy", () => {
    expect(postradiotherapyDocument.lessons).toHaveLength(4);
    expect(postradiotherapyDocument.lessons.map((lesson) => lesson.number)).toEqual([1, 2, 3, 4]);
    expect(new Set(postradiotherapyDocument.lessons.map((lesson) => lesson.id)).size).toBe(4);
    expect(postradiotherapyDocument.lessons.map((lesson) => lesson.nodeId)).toEqual([
      "salvage_after_radiotherapy",
      "nodal_oligorecurrence",
      "metastasis_directed_therapy_uncertainty",
      "metastasis_directed_rt",
    ]);
  });

  it("keeps lessons, evidence anchors, divergences and the synthetic comparison case valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(postradiotherapyDocument.lessons);
    expect(postradiotherapyDocument.evidenceScope.anchors).toHaveLength(6);
    expect(postradiotherapyDocument.evidenceScope.divergences).toHaveLength(2);
    for (const anchor of postradiotherapyDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(postradiotherapyDocument.caseStudy.status).toBe("needs_review");
    expect(postradiotherapyDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(postradiotherapyDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(8);
    expect(postradiotherapyDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(8);
    expect(postradiotherapyDocument.caseStudy.criticalErrors.length).toBeGreaterThanOrEqual(8);
    for (const sourceId of postradiotherapyDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

describe("prostate high-risk and cN1 M0 learning path", () => {
  it("contains five lessons from state definition to guideline divergence handling", () => {
    expect(highRiskDocument.lessons).toHaveLength(5);
    expect(highRiskDocument.lessons.map((lesson) => lesson.number)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(highRiskDocument.lessons.map((lesson) => lesson.id)).size).toBe(5);
    expect(highRiskDocument.lessons.flatMap((lesson) => lesson.nodeId ?? [])).toEqual([
      "high_risk_m0_rcp",
      "cnode_positive_m0",
      "guideline_divergence_handling",
    ]);
  });

  it("keeps lessons, evidence anchors, divergences and the PSMA-only-node case valid", () => {
    const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

    expectValidLessonSet(highRiskDocument.lessons);
    expect(highRiskDocument.evidenceScope.anchors).toHaveLength(5);
    expect(highRiskDocument.evidenceScope.divergences).toHaveLength(3);
    for (const anchor of highRiskDocument.evidenceScope.anchors) {
      expect(sourceIds.has(anchor.sourceId)).toBe(true);
      expect(anchor.locator.length).toBeGreaterThan(10);
    }

    expect(highRiskDocument.caseStudy.status).toBe("needs_review");
    expect(highRiskDocument.caseStudy.dataClassification).toBe("synthetic");
    expect(highRiskDocument.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(9);
    expect(highRiskDocument.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(9);
    expect(highRiskDocument.caseStudy.criticalErrors.length).toBeGreaterThanOrEqual(9);
    for (const sourceId of highRiskDocument.caseStudy.sources) {
      expect(sourceIds.has(sourceId)).toBe(true);
    }
  });
});

const finalDetailedBlocks = [
  {
    title: "systemic therapy foundations",
    document: systemicTherapyDocument,
    nodeIds: [
      "adt_mechanisms_and_agents",
      "adt_rt_integration",
      "androgen_receptor_pathway_inhibitors",
      "docetaxel_and_cabazitaxel",
      "bone_metabolic_cardiovascular_health",
    ],
  },
  {
    title: "hormone-sensitive metastatic and nmCRPC",
    document: hormoneSensitiveDocument,
    nodeIds: [
      "mhspc_doublet_triplet",
      "primary_prostate_rt_in_m1",
      "nmcrpc",
      "bone_metastases_and_sre_prevention",
    ],
  },
  {
    title: "mCRPC precision and palliation",
    document: mcrpcDocument,
    nodeIds: [
      "mcrpc_sequences",
      "precision_oncology_hrr_brca",
      "hrr_brca_parp_inhibitors",
      "msi_mmr_and_rare_biomarkers",
      "radium_223",
      "lutetium_psma",
      "psma_radioligand_therapy",
      "systemic_treatment_sequencing",
      "neuroendocrine_transformation",
      "palliative_rt",
      "palliative_and_supportive_integration",
    ],
  },
  {
    title: "complex special situations",
    document: complexSpecialSituationsDocument,
    nodeIds: [
      "frailty_and_competing_mortality",
      "inflammatory_bowel_disease",
      "prior_turp_and_urinary_risk",
      "hip_prosthesis_planning",
      "oligometastatic_stage_migration",
    ],
  },
  {
    title: "follow-up and survivorship",
    document: followupSurvivorshipDocument,
    nodeIds: [
      "psa_followup_after_local_therapy",
      "testosterone_recovery",
      "urinary_toxicity",
      "bowel_toxicity",
      "sexual_health",
      "bone_health",
      "metabolic_and_cardiovascular_risk",
      "psychosocial_survivorship",
    ],
  },
] as const;

for (const block of finalDetailedBlocks) {
  describe(`prostate ${block.title} learning path`, () => {
    it("covers every mapped competency once with sequential lessons", () => {
      expect(block.document.lessons.map((lesson) => lesson.number)).toEqual(
        block.document.lessons.map((_, index) => index + 1),
      );
      expect(new Set(block.document.lessons.map((lesson) => lesson.id)).size).toBe(
        block.document.lessons.length,
      );
      expect(block.document.lessons.map((lesson) => lesson.nodeId)).toEqual(block.nodeIds);
    });

    it("keeps lessons, evidence and the synthetic case structurally valid", () => {
      const sourceIds = new Set(sourcesDocument.sources.map((source) => source.id));

      expectValidLessonSet(block.document.lessons);
      for (const anchor of block.document.evidenceScope.anchors) {
        expect(sourceIds.has(anchor.sourceId)).toBe(true);
        expect(anchor.locator.length).toBeGreaterThan(10);
      }
      expect(block.document.caseStudy.status).toBe("needs_review");
      expect(block.document.caseStudy.dataClassification).toBe("synthetic");
      expect(block.document.caseStudy.decisionPoints.length).toBeGreaterThanOrEqual(5);
      expect(block.document.caseStudy.expectedReasoning.length).toBeGreaterThanOrEqual(5);
      expect(block.document.caseStudy.criticalErrors.length).toBeGreaterThanOrEqual(5);
      for (const sourceId of block.document.caseStudy.sources) {
        expect(sourceIds.has(sourceId)).toBe(true);
      }
    });
  });
}

describe("prostate follow-up and survivorship evidence boundary", () => {
  it("uses public French and European anchors without restricted or abstract-only clinical support", () => {
    const anchorIds = followupSurvivorshipDocument.evidenceScope.anchors.map(
      (anchor) => anchor.sourceId,
    );
    const lessonSourceIds = followupSurvivorshipDocument.lessons.flatMap(
      (lesson) => lesson.sources,
    );
    const caseSourceIds = followupSurvivorshipDocument.caseStudy.sources;
    const usedSourceIds = new Set([...anchorIds, ...lessonSourceIds, ...caseSourceIds]);

    expect(anchorIds).toContain("inca_organisation_soins_ppac_2017");
    expect(usedSourceIds.has("sfro_recorad_prostate_2025")).toBe(false);
    expect(usedSourceIds.has("ccafu_advanced_2024_2026")).toBe(false);
    expect(followupSurvivorshipDocument.status).toBe("needs_review");
    expect(followupSurvivorshipDocument.caseStudy.status).toBe("needs_review");
  });
});
