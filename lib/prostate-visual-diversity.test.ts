import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const plan = JSON.parse(
  readFileSync(join(root, "content/prostate/visual_plan.json"), "utf8"),
) as {
  status: string;
  taxonomy: Record<string, string>;
  assignments: Record<string, { type: string; label: string }>;
};

const advancedDocuments = [
  "complex_special_situations",
  "deferred_management",
  "definitive_radiotherapy",
  "followup_survivorship",
  "high_risk_and_cn1",
  "hormone_sensitive_and_nmcrpc",
  "localized_curative_options",
  "mcrpc_precision_palliation",
  "postprostatectomy_recurrence",
  "postradiotherapy_and_oligorecurrence",
  "radiotherapy_planning",
  "staging_risk_biomarkers",
  "systemic_therapy_foundations",
].map((id) =>
  JSON.parse(readFileSync(join(root, `content/prostate/learn/${id}.json`), "utf8")),
);

function visualPath(lesson: { visual: { imageSrc: string } }) {
  return join(root, "public", lesson.visual.imageSrc);
}

function provenancePath(lesson: { visual: { imageSrc: string } }) {
  return join(root, "public", lesson.visual.imageSrc.replace(/\.(?:svg|png)$/, ".provenance.json"));
}

function readVisualEvidence(lesson: {
  visual: { imageSrc: string; altText: string; caption: string };
}) {
  if (lesson.visual.imageSrc.endsWith(".svg")) {
    return readFileSync(visualPath(lesson), "utf8");
  }
  const provenance = JSON.parse(readFileSync(provenancePath(lesson), "utf8"));
  return `${lesson.visual.altText}\n${lesson.visual.caption}\n${JSON.stringify(provenance)}`;
}

describe("lesson-specific visual direction for the advanced prostate curriculum", () => {
  it("assigns every advanced lesson to one of 22 semantic figure formats", () => {
    const lessons = advancedDocuments.flatMap((document) => document.lessons);
    const usedTypes = new Set(Object.values(plan.assignments).map((entry) => entry.type));

    expect(plan.status).toBe("needs_review");
    expect(lessons).toHaveLength(78);
    expect(Object.keys(plan.assignments)).toHaveLength(78);
    expect(usedTypes.size).toBe(22);
    expect([...usedTypes].sort()).toEqual(Object.keys(plan.taxonomy).sort());

    for (const lesson of lessons) {
      const assignment = plan.assignments[lesson.id];
      expect(assignment, `${lesson.id}: affectation manquante`).toBeTruthy();
      expect(lesson.visual.diagramType).toBe(assignment.type);
      expect(lesson.visual.formatLabel).toBe(assignment.label);
      expect(lesson.visual.altText).not.toMatch(/schéma en 4 étapes/i);
      expect(lesson.visual.caption).not.toMatch(/lecture de gauche à droite/i);
    }
  });

  it("renders distinct accessible artifacts instead of one universal card template", () => {
    const hashes = new Set<string>();
    for (const document of advancedDocuments) {
      for (const lesson of document.lessons) {
        const artifactPath = visualPath(lesson);
        expect(existsSync(artifactPath), `${lesson.id}: figure absente`).toBe(true);
        const artifact = readFileSync(artifactPath);
        if (lesson.visual.imageSrc.endsWith(".svg")) {
          const svg = artifact.toString("utf8");
          expect(svg).toContain('width="1376" height="768" viewBox="0 0 1376 768"');
          expect(svg).toContain("<title");
          expect(svg).toContain("<desc");
          expect(svg).not.toContain("NEEDS_REVIEW");
          expect(svg).not.toContain("Chaîne de raisonnement — chaque étape garde sa question et ses limites");
        } else {
          expect(lesson.visual.imageSrc).toMatch(/\.png$/);
          expect(artifact.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
          expect(artifact.readUInt32BE(16), `${lesson.id}: largeur PNG`).toBeGreaterThanOrEqual(1376);
          expect(artifact.readUInt32BE(20), `${lesson.id}: hauteur PNG`).toBeGreaterThanOrEqual(768);
          const provenance = JSON.parse(readFileSync(provenancePath(lesson), "utf8"));
          expect(["needs_review", "reviewed_by_named_clinician"]).toContain(provenance.releaseGate);
          expect(provenance.source.license).toBeTruthy();
          expect(lesson.visual.altText.length).toBeGreaterThan(80);
        }
        hashes.add(createHash("sha256").update(artifact).digest("hex"));
      }
    }
    expect(hashes.size).toBe(78);
  });

  it("uses non-duplicated scientific fallbacks and honest review gates", () => {
    for (const document of advancedDocuments) {
      for (const lesson of document.lessons) {
        expect(lesson.visual.items, `${lesson.id}: quatre repères attendus`).toHaveLength(4);
        expect(
          new Set(lesson.visual.items.map((item: { detail: string }) => item.detail)).size,
          `${lesson.id}: détail dupliqué`,
        ).toBe(4);
        expect(lesson.visual.caption.length, `${lesson.id}: légende trop pauvre`).toBeGreaterThan(120);
        expect(lesson.visual.caption).not.toMatch(/needs_review|revue clinique nominative|à valider/i);

        if (lesson.visual.imageSrc.endsWith(".svg")) {
          const reviewPath = join(
            root,
            "public",
            lesson.visual.imageSrc.replace(/\.svg$/, "_review_log.json"),
          );
          const review = JSON.parse(readFileSync(reviewPath, "utf8"));
          expect(review.automaticQualityReview.numericQualityScore).toBeNull();
          expect(review.automaticQualityReview.clinicalMeaningReviewedByAutomation).toBe(false);
          expect(review.clinicalValidation).toBe(false);
          expect(review.namedClinicalReviewer).toBeNull();
        } else {
          const provenance = JSON.parse(readFileSync(provenancePath(lesson), "utf8"));
          expect(["needs_review", "reviewed_by_named_clinician"]).toContain(provenance.releaseGate);
          expect(provenance.limitations.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("contains lesson-specific scientific anchors for every previously blocking figure", () => {
    const anchors: Record<string, string[]> = {
      special_02_ibd: ["ACTIVITÉ", "TOPOGRAPHIE DIGESTIVE", "peu représentées", "réduction d’exposition"],
      special_03_turp: ["Cavité TURP", "Urètre", "Sphincter", "toxicité urinaire tardive"],
      special_04_hip: ["FENÊTRE TISSUS MOUS", "DENSITÉ / ALGORITHME", "validés", "FAISCEAUX / PLANS", "QA / ROBUSTESSE"],
      definitive_rt_05_pelvis: ["Décision pelvienne séparée", "TEP-PSMA négatif"],
      definitive_rt_06_boost: ["Boost focal externe", "Boost curiethérapique"],
      followup_01_psa: ["Après prostatectomie", "Après RT", "AUCUNE DONNÉE PATIENT"],
      followup_02_testosterone: ["Récupération lente", "Récupération incomplète"],
      followup_03_urinary: ["Mécanisme possible", "ECBU"],
      followup_04_bowel: ["Rectum → canal anal", "Signal d’alarme"],
      followup_05_sexual: ["Santé sexuelle", "Options progressives"],
      followup_06_bone: ["Fragilité osseuse", "DXA initiale"],
      followup_07_metabolic_cv: ["glycémie/HbA1c", "Dyspnée"],
      followup_08_psychosocial: ["PPAC", "Idées suicidaires"],
      highrisk_04_cn1_m0: ["Boost ganglionnaire", "ADT longue", "abiratérone"],
      hspc_04_bone: ["Rachis douloureux", "mHSPC ≠ mCRPC"],
      localized_03_ebrt: ["FAIBLE RISQUE", "INTERMÉDIAIRE", "HAUT RISQUE"],
      mcrpc_02_testing: ["transmissible → test", "germinal + conseil", "non informatif"],
      mcrpc_03_parp: ["BRCA1/2", "Autres gènes HRR"],
      mcrpc_05_radium: ["Radium-223", "absence", "de métastase viscérale dominante"],
      mcrpc_06_lutetium: ["hétérogénéité", "interlésionnelle", "radioprotection"],
      mcrpc_10_palliative_rt: ["Compression médullaire", "Coordination"],
      postrp_01_definitions: ["Persistance", "Récidive", "0,2", "ng/mL dans RecoRad"],
      postrp_02_psadt: ["PSADT = ln(2)", "Plusieurs valeurs positives"],
      postrp_06_technique: ["Glande absente", "Anastomose", "prostate fantôme"],
      oligorec_02_nodal: ["MDT focale", "Irradiation élective + boost", "PEACE V–STORM"],
      oligorec_04_mdt_rt: ["dose cumulée", "Planifier chaque site"],
      planning_01_simulation: ["PRÉPARATION", "Fusion vérifiée", "IGRT ne corrige pas"],
      planning_02_targets: ["GTV / DIL", "CTV anatomique", "PTV", "prostate", "vessie", "rectum", "non prescriptive"],
      planning_03_oar: ["scanner de simulation", "prostate", "vessie", "rectum", "têtes fémorales"],
      planning_04_dvh: ["Dose (Gy)", "Volume relatif (%)", "AUCUNE DONNÉE PATIENT", "PTV V57 ≥ 99 %"],
      planning_05_igrt: ["REPÈRE PELVIEN", "APRÈS RECALAGE PROSTATIQUE", "Si les corrections divergent", "intrafraction"],
      staging_01_tnm: ["Tumeur primitive", "Ganglions régionaux", "Métastases à distance"],
      staging_05_nodal_prediction: ["Probabilité prétest", "≠ cN / pN"],
      systemic_05_prevention: ["glycémie/HbA1c", "OS FRAGILE", "Douleur rachidienne"],
    };
    const lessons = advancedDocuments.flatMap((document) => document.lessons);
    expect(Object.keys(anchors)).toHaveLength(34);
    for (const [lessonId, expectedAnchors] of Object.entries(anchors)) {
      const lesson = lessons.find((entry) => entry.id === lessonId);
      expect(lesson, `${lessonId}: leçon absente`).toBeTruthy();
      const evidence = readVisualEvidence(lesson);
      for (const anchor of expectedAnchors) {
        expect(evidence, `${lessonId}: repère absent « ${anchor} »`).toContain(anchor);
      }
    }
  });

  it("routes every prostate figure through an evidence-appropriate production method", () => {
    const manifest = JSON.parse(
      readFileSync(join(root, "content/prostate/review/figure_method_manifest.json"), "utf8"),
    );
    expect(manifest.universalRendererAllowed).toBe(false);
    expect(manifest.figures).toHaveLength(91);
    expect(new Set(manifest.figures.map((figure: { lessonId: string }) => figure.lessonId)).size).toBe(91);
    expect(manifest.figures.filter((figure: { method: string }) => figure.method === "clinical-imaging-overlay")).toHaveLength(5);
    expect(manifest.figures.filter((figure: { method: string }) => figure.method === "quantitative-scientific-plot")).toHaveLength(6);
    expect(manifest.figures.filter((figure: { method: string }) => figure.method === "structured-comparison")).toHaveLength(23);
    expect(manifest.figures.filter((figure: { method: string }) => figure.method === "deterministic-scientific-schematic")).toHaveLength(41);
    expect(manifest.figures.filter((figure: { method: string }) => figure.method === "annotated-medical-illustration")).toHaveLength(15);
    for (const figure of manifest.figures) {
      expect(figure.profile.forbidden.length).toBeGreaterThan(0);
      expect(["needs_review", "reviewed_by_named_clinician"]).toContain(figure.releaseGate);
    }
  });
});
