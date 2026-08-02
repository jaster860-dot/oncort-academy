# OncoRT Academy — Claude Code Onboarding

> Read this first. It explains what we built, why we built it that way, and how to continue without breaking anything.

---

## 1. What Is This App?

OncoRT Academy is a gamified adaptive learning platform for radiation oncology and essential medical oncology. Target user: radiation oncologist who wants to rebuild foundations from first principles.

**It is NOT a passive course library.** It's a clinical reasoning tutor.

Core learning loop: **Context → Reasoning → Gap detection → Foundation capsule → Retest → Mastery update.**

First MVP disease site: **Prostate cancer**, chosen because it forces integration of urology, pathology, imaging, medical oncology, radiotherapy, supportive care, and multidisciplinary decision-making.

---

## 2. Architecture: Why It Looks Like This

### Separation: Engine vs Content

The platform separates the reusable learning engine from disease-site content. Adding breast, lung, or rectum must NOT require copying a page or rewriting progress logic.

```
lib/academy/          — shared learning engine (types, catalog, progress)
components/           — React components (course player, dashboard, etc.)
content/<site>/       — reviewed JSON learning documents per disease site
corpus/               — source manifests, rollout state
```

### Route: Parcours (Pathway)

Routes: `/parcours/<site>`, `/parcours/<site>/<block>`, `/bibliotheque/<site>`.

Each disease site registers a `SiteModule` in `lib/academy/catalog.ts`. The engine handles routing, progress, checkpoints, flashcards, integrative cases, and source drawers.

### Progress: Local-First + Optional Sync

- Browser is the immediate source of truth (localStorage key: `oncort.academy.progress.v1`).
- Authenticated users sync to Supabase (`learning_progress` + `learning_events` tables, RLS-protected).
- Guest → authenticated merge requires explicit confirmation.

### Content: JSON, Not Database

Medical content lives as versioned JSON under `content/<site>/learn/`. This was a deliberate choice:
- Git-diffable, reviewable in PRs.
- No migration headaches during rapid prototyping.
- Easy for AI agents to read, validate, and modify.
- The database is for progress/analytics, not for authoring.

### Build: Static Export

`output: "export"` in `next.config.ts`. The site is deployed as static HTML/JS/CSS to GitHub Pages. No server-side rendering. No API routes. This means:
- Supabase calls happen client-side only.
- Content is bundled at build time.
- Fast, cheap, simple.

---

## 3. The 15 Prostate Blocks

| # | ID | Lessons | What It Teaches |
|---|-----|---------|-----------------|
| 1 | `foundations` | 8 | Anatomy, histology, androgen axis, PSA, carcinogenesis, Gleason/ISUP, trial literacy, competing risk |
| 2 | `detection_diagnosis` | 5 | PSA interpretation, MRI/PI-RADS, biopsy strategy, pathology report reading |
| 3 | `staging_risk_biomarkers` | 6 | TNM, risk groups, imaging indications, PSMA-PET limits, nodal risk, germline/somatic testing |
| 4 | `deferred_management` | 5 | Active surveillance, monitoring/reclassification, watchful waiting, focal therapy, shared decision |
| 5 | `localized_curative_options` | 5 | Surgery, EBRT, brachytherapy, multimodal comparison |
| 6 | `definitive_radiotherapy` | 7 | Indications, moderate hypofractionation, SBRT, brachytherapy, pelvic volumes, boost, ADT+RT |
| 7 | `radiotherapy_planning` | 6 | Simulation, targets, OAR, DVH, IGRT, pre-treatment audit |
| 8 | `postprostatectomy_recurrence` | 6 | PSA definitions, PSADT, PSMA, early salvage, ADT timing, post-op RT technique |
| 9 | `postradiotherapy_and_oligorecurrence` | 4 | Local salvage after RT, nodal recurrence, MDT uncertainty, directed RT |
| 10 | `high_risk_and_cn1` | 5 | Disease state, local pathways, systemic intensification, cN1 M0, guideline divergence |
| 11 | `systemic_therapy_foundations` | 5 | ADT, ADT+RT, ARPI choice, taxanes, bone/metabolic/CV prevention |
| 12 | `hormone_sensitive_and_nmcrpc` | 5 | Burden/synchrony, doublet/triplet, primary RT in M1, nmCRPC, bone metastases |
| 13 | `mcrpc_precision_palliation` | 11 | mCRPC state, precision testing, PARP, rare biomarkers, radium-223, lutetium-PSMA, RLT workflow, sequencing, neuroendocrine, palliative RT, supportive care |
| 14 | `complex_special_situations` | 5 | Frailty, IBD, post-TURP, hip prosthesis, oligometastatic/stage migration |
| 15 | `followup_survivorship` | 8 | PSA after treatment, testosterone recovery, urinary/digestive/sexual toxicity, bone health, metabolic/CV, psychosocial |

**Total: 91 lessons, 91 checkpoints, 273 flashcards, 91 figures.**

---

## 4. The Figure Pipeline: Full Story

This is the most important section. It documents every decision, every mistake, and every correction.

### Phase 1 — Universal Template (FAILED)

Initially, 78 of 91 figures were produced by a single "4-card chain" generator. Every lesson got the same visual format regardless of topic. A clinician audit found:
- **34 blocking** (e.g., the RT volumes figure showed meaningless ellipses; the DVH had no axes or protocol)
- **33 major** (wrong format for the concept)
- **10 important** (correctable with edits)
- **1 recoverable** as-is

### Phase 2 — 22-Format Taxonomy (PARTIALLY FAILED)

We created 22 visual formats (algorithm, anatomy map, timeline, comparison matrix, etc.) and reassigned each figure. This improved variety but the problem was deeper: the generators were fed only 4 labels per figure and couldn't render the actual clinical content. The "quality gates" validated format compliance (16:9, palette, metadata) but NOT scientific accuracy. Figures with completely wrong content passed with 8.5/10.

### Phase 3 — Scientific QA Rebuild (CURRENT)

Complete rebuild with principle: **choose the representation from the scientific object, then render it.**

Current taxonomy (`content/prostate/review/figure_method_manifest.json`):

| Method | Count | When to Use |
|--------|-------|-------------|
| `deterministic-scientific-schematic` | 42 | Algorithms, decision trees, molecular pathways, monitoring loops, parallel paths, balance diagrams |
| `structured-comparison` | 23 | Tables, matrices, comparisons, guideline divergences |
| `annotated-medical-illustration` | 14 | Anatomical illustrations, histology concepts, toxicity body maps |
| `quantitative-scientific-plot` | 6 | DVH curves, PSA kinetics, testosterone recovery, trial data schematics |
| `clinical-imaging-overlay` | 5 | Real CT/MRI with contours from public datasets (NCI IDC CC BY 4.0) |
| `safety-checklist` | 1 | Pre-treatment audit |

**CRITICAL RULES:**

1. **GPT Image (image_generate)**: Use ONLY for unlabeled anatomical illustration base or concept illustration. NEVER for contouring anatomy, DVH, algorithms, or any figure with embedded medical text. The AI cannot reliably render French medical terminology or anatomy accurately.

2. **SVG/Canvas (diagram-maker/deterministic)**: DEFAULT choice. Use for algorithms, decision trees, timelines, matrices, flowcharts, parallel paths. Controllable, versionable, scientifically auditable.

3. **DICOM/RTSTRUCT overlays**: Use for real anatomy figures (target volumes, OAR, IGRT examples). Source from NCI Imaging Data Commons (CC BY 4.0). Always credit the dataset.

4. **Matplotlib/Plotly**: Use for DVH, PSA curves, testosterone kinetics. Declare "données synthétiques" explicitly. Never present a curve as patient data.

5. **No figure at all**: Acceptable when a visual adds nothing. Better no figure than a misleading one.

### Phase 4 — Figure Placement Pedagogy

We moved from "figure always just below the title" to **just-in-time visualisation**:

| Position | Count | When |
|----------|-------|------|
| `overview` | 3 | Anatomical orientation, model mental needed BEFORE any explanation |
| `after_section_1` | 15 | Figure decodable after first explanatory paragraph |
| `after_section_2` | 57 | DEFAULT — most figures need 2 sections of context |
| `after_section_3` | 10 | Complex figures needing full reasoning first |
| `synthesis` | 5 | Summary/comparison after all reasoning |
| `before_checkpoint` | 1 | Safety checklist immediately before assessment |

The placement manifest is at `content/prostate/review/figure_placement_manifest.json`. Each entry has a `rationale` explaining why that position.

**Design principle**: A figure must be decodable when the learner encounters it. If prerequisites aren't yet taught, the figure is either confusing or decorative.

---

## 5. Scientific Standards

### Source Hierarchy (France/Europe first)

1. INCa, HAS, SFRO, CCAFU (French)
2. ESMO, ESTRO, EAU (European)
3. ASTRO, ASCO (US, comparison)
4. NCCN (US, licensing permitting)
5. Pivotal trials
6. Reviews (background only, never sole source)

### Content Governance

Every item has a status: `draft` | `ai_assisted` | `needs_review` | `validated` | `update_suspected` | `deprecated`.

**Only `validated` content can appear as authoritative teaching material.**

As of 2026-08-02, ALL 91 lessons and 91 figures remain `needs_review` pending named clinician validation by Sami Frikha.

### Non-Negotiables

- Every medical claim in validated content must be sourceable.
- Never invent references, DOI, PMID, trial results, guideline text, dose, fractionation, risk group, or biomarker implication.
- AI is a tutor and drafting assistant, NOT the source of truth.
- Distinguish European/French practice from US/NCCN always.
- When uncertain, say so. Uncertainty is a feature, not a failure.

---

## 6. Technical Stack

```
Next.js 15+ (App Router)
TypeScript (strict)
Tailwind CSS
Static export (GitHub Pages)
Supabase (auth + progress sync)
Vitest (unit/content tests)
Playwright (E2E)
```

Key files:
- `lib/academy/types.ts` — TypeScript types for all content objects
- `lib/academy/catalog.ts` — Disease site registry
- `lib/academy/progress.ts` — Progress tracking (local + Supabase)
- `components/course-player.tsx` — Main lesson rendering engine
- `content/prostate/course_map.json` — Block structure and lesson references

---

## 7. Current State (2026-08-02)

### Completed
- 15/15 prostate blocks with 91 lessons, checkpoints, and flashcards
- 91/91 figures with scientific content, alt text, legends, and textual fallbacks
- Figure placement taxonomy applied to all 91 figures
- Mobile UI fixes (no truncated text, safe overflow)
- 59 unit/content tests passing
- TypeScript compiles clean
- Production build succeeds
- 4 Playwright E2E journeys passing
- Desktop + mobile audit passing for all 91 figures
- Content validation passing (with 4 non-blocking curriculum node warnings)

### Needs Work

1. **Clinical validation**: ALL content is `needs_review`. Sami must review and mark as `validated` before publication.
2. **4 curriculum nodes lack capsules**: `biopsy_strategy`, `early_detection_and_psa`, `mri_pirads`, `pathology_report` — non-blocking warnings.
3. **Figure scientific accuracy**: While the pipeline is now correct, individual figure content needs per-leçon clinician review. The automated "quality score" has been removed because it falsely implied validation.
4. **Non-prostate sites**: Only curriculum skeleton exists. Endometrium pilot is preserved as historical prototype under `content/endometrium/`.

### Deployment
- Deployed to GitHub Pages via Actions
- Repository: `jaster860-dot/oncort-academy`
- Branch: `main`
- Last commit: `256460e` — "Place lesson figures at pedagogical anchors"

---

## 8. How to Continue Working

### Adding a Figure

1. Read the lesson in `content/prostate/learn/<block>.json`.
2. Identify the ONE pedagogical question the figure must answer.
3. Choose the method from the taxonomy above.
4. Generate the figure in `public/figures/prostate/<block>/<id>.png`.
5. Add review log in `content/prostate/learn/figure_reviews/<block>/<id>_review_log.json`.
6. Add placement to `content/prostate/review/figure_placement_manifest.json`.
7. Update `content/prostate/review/figure_method_manifest.json`.
8. Run `npm test`, `npm run build`, and `npx playwright test`.
9. Audit desktop + mobile rendering.

### Modifying Lesson Content

1. Edit the JSON in `content/prostate/learn/<block>.json`.
2. Keep all 3 sections per lesson: `synthèse 30s`, `raisonnement détaillé`, `approfondissement/application/piège`.
3. Run content validation + unit tests + build.
4. Commit with message: `feat: <what changed> in <block name>`.

### Adding a New Disease Site

1. Create `content/<site>/course_map.json`, `learn/*.json`, `sources/index.json`.
2. Add to `lib/academy/catalog.ts`.
3. Add content-structure tests.
4. Run full validation pipeline.

### Before Every Push

```bash
npm test                    # 59 tests must pass
npx tsc --noEmit           # must be clean
npm run build              # production build must succeed
npx playwright test        # 4 E2E journeys
# Manual: audit desktop + mobile for modified figures
```

---

## 9. Design Decisions That Aren't Obvious

1. **Why JSON and not MDX?** JSON is easier for agents to parse, validate, and diff. We can migrate to MDX later if needed.

2. **Why static export and not SSR?** Target user is a clinician studying offline-capable content. No dynamic data in the learning content itself. Supabase handles the dynamic part (auth + progress). Lower hosting cost, simpler deployment.

3. **Why not a CMS?** The content is scientific, source-linked, and needs review workflow. Git + PR review is more appropriate than a CMS for this use case. A clinician reviewing a diff with source links is more rigorous than clicking "publish" in a CMS.

4. **Why both `needs_review` internal status AND removed the visible badge?** The badge was confusing to learners (they're not the reviewer). Internal traceability remains for the review workflow. The `validated` status is the publication gate, not the badge.

5. **Why the "no figure" option exists.** Some concepts don't benefit from visualization. Forcing a figure adds noise, not signal. The decision tree for every figure is: what does the learner gain visually that the text can't convey? If the answer is "nothing specific," skip the figure.

6. **Why the curriculum has 3 depth levels (foundations, clinical_competence, expert_rcp).** A radiation oncologist may need foundations in systemic therapy but be expert in radiotherapy. The levels are per-topic, not per-user. The app should detect gaps and navigate depth accordingly.

---

## 10. Key Reference Files

```
PRODUCT_SPEC.md              — Vision, scope, gamification principles
ARCHITECTURE.md              — Engine/content separation, routing
CONTENT_GOVERNANCE.md        — Medical review workflow, source hierarchy
MVP_PLAN.md                  — Staged build plan, prostate as reference pilot
CONTENT_SCHEMA.md            — Data contracts for all content types
SCIENTIFIC_SKILLS_INSTALL.md — Skill pack installation

content/MASTER_CURRICULUM.md              — Full oncology curriculum map
content/prostate/course_map.json          — 15-block prostate structure
content/prostate/learn/<block>.json       — Per-block lesson content
content/prostate/review/figure_method_manifest.json       — Visual method per figure
content/prostate/review/figure_placement_manifest.json    — Placement per figure
content/prostate/review/review_queue.json                  — Items awaiting review
content/prostate/sources/index.json                        — Source bibliography
corpus/prostate_enrichment_rollout.json                    — Enrichment status (completed)

lib/academy/types.ts        — TypeScript content types
lib/academy/catalog.ts      — Disease site registry
components/course-player.tsx — Lesson rendering engine
```

---

## 11. Working with Sami

- Sami is a radiation oncologist in France.
- He prefers structured tumor-board reasoning, literature synthesis with verifiable references, and practical outputs.
- He values honesty about uncertainty over false precision.
- He reads medical content critically — if a figure or lesson contains scientific errors, he WILL catch them and it erodes trust in the entire system.
- He prefers to be shown work in progress and give feedback, rather than receiving a "final" product that needs rework.
- Language: French for learner-facing content. English for internal/technical files is acceptable.
- Timezone: Europe/Paris.
