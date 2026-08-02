import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const courseMap = JSON.parse(readFileSync(resolve(root, "content/prostate/course_map.json"), "utf8"));

const clinicalImaging = new Set([
  "planning_01_simulation",
  "planning_02_targets",
  "planning_03_oar",
  "planning_05_igrt",
  "special_04_hip",
]);

const quantitativePlots = new Set([
  "planning_04_dvh",
  "postrp_01_definitions",
  "postrp_02_psadt",
  "hspc_02_primary_rt",
  "followup_01_psa",
  "followup_02_testosterone",
]);

const medicalIllustrations = new Set([
  "foundation_01_anatomy",
  "foundation_02_histology",
  "diagnosis_04_biopsy_strategy",
  "staging_01_tnm",
  "hspc_04_bone",
  "mcrpc_05_radium",
  "mcrpc_10_palliative_rt",
  "followup_03_urinary",
  "followup_04_bowel",
  "followup_05_sexual",
  "followup_06_bone",
  "special_03_turp",
  "diagnosis_03_mri_pirads",
  "postrp_06_technique",
]);

const structuredTables = new Set([
  "foundation_05_carcinogenesis",
  "foundation_06_gleason_isup",
  "definitive_rt_05_pelvis",
  "definitive_rt_06_boost",
  "diagnosis_02_psa_interpretation",
  "diagnosis_05_pathology_report",
  "staging_02_risk_groups",
  "staging_06_germline_somatic",
  "deferred_05_shared_decision",
  "localized_04_brachytherapy",
  "localized_05_multimodal",
  "highrisk_01_state_definition",
  "systemic_03_arpi",
  "systemic_05_prevention",
  "hspc_01_burden_synchrony",
  "hspc_01_doublet_triplet",
  "mcrpc_09_neuroendocrine",
  "special_05_stage_migration",
  "followup_07_metabolic_cv",
  "special_02_ibd",
  "oligorec_02_nodal",
  "highrisk_04_cn1_m0",
  "oligorec_03_uncertainty",
]);

const checklists = new Set(["planning_06_audit"]);
const reviewedFigures = new Map([
  ["planning_03_oar", { reviewer: "Sami Frikha", reviewedAt: "2026-08-02" }],
]);

const methodProfiles = {
  "clinical-imaging-overlay": {
    production: "Public de-identified CT/MR plus verified RTSTRUCT/SEG when available; deterministic vector overlays and labels.",
    allowedAI: "AI may clean layout or create a clearly separated orientation inset; it may not invent anatomy or contours.",
    provenance: "Record collection, subject/series UIDs, license, contour provenance, view/window, slice position, transformations and guideline localizers.",
    review: ["radiation oncologist", "radiologist when MR/PET is involved", "medical physicist for dose/IGRT content"],
    forbidden: ["image-generation-only anatomy", "unreferenced freehand contours", "copying a published atlas plate without compatible reuse rights"],
  },
  "quantitative-scientific-plot": {
    production: "Deterministic Python/Matplotlib figure from verified protocol values, source data, or an explicitly declared synthetic dataset.",
    allowedAI: "AI may propose layout or caption wording; it may not invent points, curves, thresholds, effect sizes or uncertainty.",
    provenance: "Preserve source values, transformation code, axis definitions, units, missing-data policy and export manifest.",
    review: ["content-domain clinician", "medical physicist for DVH/dose", "methodologist for trial/statistical plots"],
    forbidden: ["hand-drawn plausible curves", "unlabelled synthetic data", "thresholds detached from structure definition and protocol"],
  },
  "annotated-medical-illustration": {
    production: "High-fidelity educational illustration or licensed anatomical source, followed by deterministic labels and callouts.",
    allowedAI: "Image generation is allowed for the unlabeled base only when the concept is illustrative rather than a contouring reference.",
    provenance: "Keep prompt/reference roles, source/license or generation record, and a label-to-source fact map.",
    review: ["relevant clinician", "radiologist/pathologist when applicable"],
    forbidden: ["using generated anatomy as a contouring atlas", "AI-rendered embedded text", "photorealistic patient implication"],
  },
  "structured-comparison": {
    production: "Native SVG/HTML table or matrix with deterministic typography and explicitly sourced cells.",
    allowedAI: "AI may help organize information but every cell must map to a verified statement.",
    provenance: "Attach a claim-to-source map and preserve qualifiers, population boundaries and uncertainty.",
    review: ["content-domain clinician"],
    forbidden: ["false equivalence", "implicit ranking without evidence", "decorative axes or gauges"],
  },
  "deterministic-scientific-schematic": {
    production: "Purpose-built native SVG or scientific-schematic draft, then manual vector cleanup and rule-by-rule validation.",
    allowedAI: "AI may draft composition; final labels, arrows, branches and causal/temporal meaning are deterministic and source-checked.",
    provenance: "Store the brief, exact labels, relationship semantics, source IDs and review log.",
    review: ["content-domain clinician"],
    forbidden: ["generic four-box templates", "arrows without defined semantics", "invented chronology or causality"],
  },
  "safety-checklist": {
    production: "Native interactive checklist with unselected controls, explicit gates, owners and outcomes.",
    allowedAI: "AI may not pre-check items or imply completion.",
    provenance: "Map every gate to the local protocol or guideline and record version/date.",
    review: ["radiation oncologist", "medical physicist", "radiation therapist"],
    forbidden: ["pre-checked controls", "automatic clinical approval", "ambiguous pass/fail state"],
  },
};

function routeFor(lesson) {
  if (clinicalImaging.has(lesson.id)) return "clinical-imaging-overlay";
  if (quantitativePlots.has(lesson.id)) return "quantitative-scientific-plot";
  if (medicalIllustrations.has(lesson.id)) return "annotated-medical-illustration";
  if (structuredTables.has(lesson.id)) return "structured-comparison";
  if (checklists.has(lesson.id)) return "safety-checklist";
  return "deterministic-scientific-schematic";
}

const figures = [];
for (const block of courseMap.blocks) {
  const document = JSON.parse(readFileSync(resolve(root, `content/prostate/learn/${block.id}.json`), "utf8"));
  for (const lesson of document.lessons) {
    const method = routeFor(lesson);
    const clinicalReview = reviewedFigures.get(lesson.id) ?? null;
    figures.push({
      blockId: block.id,
      lessonId: lesson.id,
      title: lesson.title,
      method,
      priority: clinicalImaging.has(lesson.id) || lesson.id === "planning_04_dvh" ? "P0" : quantitativePlots.has(lesson.id) ? "P1" : "P2",
      sourceIds: lesson.sources ?? [],
      currentAsset: lesson.visual?.imageSrc ?? null,
      profile: methodProfiles[method],
      releaseGate: clinicalReview ? "reviewed_by_named_clinician" : "needs_review",
      clinicalReview,
    });
  }
}

if (figures.length !== 91) {
  throw new Error(`Expected 91 prostate figures, found ${figures.length}`);
}

const counts = Object.fromEntries(
  [...new Set(figures.map((figure) => figure.method))]
    .sort()
    .map((method) => [method, figures.filter((figure) => figure.method === method).length]),
);

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: "routing_complete_assets_need_review",
  universalRendererAllowed: false,
  decisionPrinciple: "Choose the representation from the scientific object and evidence, then apply the application visual system.",
  counts,
  figures,
};

const output = resolve(root, "content/prostate/review/figure_method_manifest.json");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ output, count: figures.length, counts }, null, 2));
