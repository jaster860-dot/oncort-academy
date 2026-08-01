# OncoRT Academy - Agent Handoff

## Objective

You are taking over the OncoRT Academy project for Sami Frikha, a radiation oncologist in France.

The goal is to build a gamified, adaptive learning app for radio-oncology and essential medical oncology. This is not a passive course library. It should behave like a clinical reasoning tutor that helps the user rebuild foundations, understand why decisions are made, and become stronger in multidisciplinary tumor boards.

Primary language: French for learner-facing content. English is acceptable for internal technical files.

## Current State

The project already exists locally at:

`/root/.openclaw/workspace/onco-rt-academy`

Existing project files:

- `PRODUCT_SPEC.md`: product vision and main principles.
- `MVP_PLAN.md`: staged MVP plan.
- `CONTENT_SCHEMA.md`: draft data schemas for disease sites, capsules, courses, cases, questions, and mastery events.
- `CONTENT_GOVERNANCE.md`: medical governance and validation workflow.
- `SCIENTIFIC_SKILLS_INSTALL.md`: instructions for installing the focused scientific skill packs.
- `content/endometrium/`: first disease-site pilot.

Current pilot disease site:

- Endometrial cancer.

Existing endometrium content:

- `content/endometrium/README.md`
- `content/endometrium/curriculum.json`
- `content/endometrium/prerequisite_graph.json`
- `content/endometrium/concepts/*.md`
- `content/endometrium/questions/seed_questions.json`
- `content/endometrium/cases/seed_cases.json`
- `content/endometrium/sources/index.json`
- `content/endometrium/tutor/TUTOR_RUBRIC.md`

Current MVP next implementation target:

- Build the first playable learning loop for `endo_case_001_lvsi_reasoning`.

## Product Concept

OncoRT Academy teaches oncology through clinical reasoning.

Core loop:

1. Present a clinical case.
2. Ask the learner for an answer and reasoning.
3. Grade the final answer and the reasoning separately.
4. Detect the missing prerequisite concept.
5. Trigger a short foundation capsule.
6. Retest the same concept in a different clinical context.
7. Update mastery metrics.

The app must teach mechanisms, not rote guideline memorization.

Example:

If the learner misses the importance of substantial LVSI in endometrial cancer, the tutor should not only say "wrong". It should explain that LVSI reflects tumor access to lymphovascular dissemination routes, changing the relapse-risk pattern and therefore the logic of adjuvant treatment selection.

## Target Scope

The final application should cover:

- anatomy;
- pathology;
- physiology;
- tumor biology;
- imaging;
- biomarkers;
- clinical trial literacy;
- diagnosis and staging;
- medical oncology basics needed by radiation oncologists;
- radiotherapy indications;
- target volumes;
- dose and fractionation;
- OAR principles;
- toxicities;
- surveillance;
- relapse;
- complex multidisciplinary cases;
- controversies and guideline divergences.

The first version must stay narrow and excellent. Start with endometrial cancer.

## Non-Negotiables

- Medical content must not rely on trust in the AI.
- AI is a tutor, retrieval assistant, and drafting assistant, not the source of truth.
- Every validated medical claim must be sourceable.
- Distinguish draft content from validated content.
- Never silently update a clinical recommendation.
- Never invent references, DOI, PMID, trial results, guideline text, dose, fractionation, risk group, or biomarker implication.
- Always distinguish European/French practice from US/NCCN practice when relevant.
- When sources are insufficient or outdated, say that verification is required.
- The learner must understand why an answer is wrong.
- The app must track prerequisite gaps, not only question scores.
- Avoid childish gamification. Use professional, mastery-driven progression.

## Medical Governance

Every content object must have a status:

- `draft`: educational draft, not reviewed.
- `ai_assisted`: generated or substantially modified by AI.
- `needs_review`: ready for medical checking.
- `validated`: reviewed and approved for learning use.
- `update_suspected`: source change may affect this content.
- `deprecated`: no longer valid for current practice.

Only `validated` content can appear as authoritative teaching material.

For the MVP, Sami is the human medical reviewer.

Before marking content validated, check:

- Are all clinical claims linked to sources?
- Is the source current?
- Is the jurisdiction clear?
- Are guideline divergences labeled?
- Are dose/fractionation statements verified?
- Are systemic therapy statements verified?
- Are biomarker implications verified?
- Are uncertainty and controversy explicit?
- Is the explanation mechanistic?

## Source Strategy

For endometrial cancer, prioritize:

1. ESGO-ESTRO-ESP current guidance as European anchor.
2. French national or regional referentials when available and current.
3. ESMO clinical practice guidelines.
4. ASTRO/ESTRO guidance for radiotherapy-specific questions.
5. ASCO or other society guidance when relevant.
6. NCCN only as US comparison when access/licensing permits.
7. Pivotal trials for evidence history and mechanisms.
8. Reviews only for background, never as sole support for recommendations.

Each source entry should include:

- source id;
- title;
- organization/journal;
- year/version;
- URL or local document reference;
- access date;
- affected concepts;
- update-monitoring status.

## Knowledge Architecture

Do not try to manually copy every guideline recommendation into structured tables.

Use a hybrid architecture:

1. Stable curriculum and validated educational content.
2. Source corpus with guideline PDFs, papers, and reference documents.
3. Retrieval layer for source lookup, comparison, and update detection.
4. Human validation before medical content changes are published.

The app stores curated learning objects and key concepts. It should not become a massive, brittle guideline database.

## Content Objects

Use the schemas in `CONTENT_SCHEMA.md` as the working baseline.

Main object types:

- Disease site.
- Foundation capsule.
- Course card.
- Clinical case.
- Question.
- User mastery event.

Foundation capsule structure:

- fact;
- mechanism;
- clinical consequence;
- RCP consequence;
- common trap;
- micro-question;
- prerequisites;
- linked sources;
- status.

Course card structure:

- essential knowledge;
- why it matters;
- diagnostic checklist;
- staging logic;
- medical oncology section;
- radiotherapy section;
- surveillance;
- traps;
- questions;
- cases;
- sources;
- status and review date.

Clinical case structure:

- vignette;
- clinical data;
- pathology;
- imaging;
- surgery;
- biomarkers;
- tasks;
- expected reasoning;
- accepted answers;
- common errors;
- linked concepts;
- sources;
- status.

Question structure:

- type: QCM, QROC, free reasoning, sequencing, case decision;
- prompt;
- expected answer;
- grading rubric;
- explanation;
- linked concepts;
- source links;
- status.

## AI Tutor Behavior

The tutor is a clinical reasoning coach.

For every answer, score separately:

- final answer accuracy;
- reasoning quality;
- missing data detection;
- mechanism understanding;
- relapse-risk pattern recognition;
- treatment-tool matching;
- source/guideline awareness;
- confidence calibration.

Gap labels:

- `foundation_gap`
- `staging_gap`
- `risk_gap`
- `systemic_gap`
- `rt_gap`
- `rcp_gap`
- `overconfidence`
- `source_gap`

Tutor feedback format:

1. Verdict.
2. What is correct.
3. What is missing.
4. Mechanism explanation.
5. One targeted capsule.
6. One follow-up question.

The tutor must be concise, clinically useful, and explicit about uncertainty.

## Gamification Principles

Gamification should feel like professional mastery, not a childish reward system.

Recommended mechanics:

- disease-site mastery map;
- competency meters: foundations, staging, pathology/molecular, medical oncology, radiotherapy, RCP reasoning, expert nuance;
- XP weighted by clinical importance and difficulty;
- daily clinical streaks;
- spaced repetition;
- weakness dashboard;
- "boss fight" full RCP cases;
- monthly board-style exam;
- progressive unlocking of complex cases;
- mastery decay if a concept is not reviewed;
- remediation path when repeated errors occur.

Avoid:

- superficial badges disconnected from clinical skill;
- generic trivia;
- learning paths that reward speed over reasoning;
- AI-generated medical recommendations shown as validated without review.

## Suggested Technical Architecture

MVP stack:

- Next.js;
- TypeScript;
- Tailwind or a restrained component system;
- local JSON/Markdown/MDX content first;
- Supabase/Postgres later;
- OpenAI API for tutor logic;
- small validated source corpus for retrieval;
- content status and review workflow from day one.

Initial screens:

- dashboard;
- disease-site map;
- lesson/capsule view;
- clinical case view;
- answer input;
- tutor feedback panel;
- weakness dashboard;
- review queue.

Initial data model can stay file-based:

- `/content/<disease>/curriculum.json`
- `/content/<disease>/prerequisite_graph.json`
- `/content/<disease>/concepts/*.md`
- `/content/<disease>/courses/*.md`
- `/content/<disease>/questions/*.json`
- `/content/<disease>/cases/*.json`
- `/content/<disease>/sources/index.json`

Later database tables:

- users;
- disease_sites;
- concepts;
- courses;
- cases;
- questions;
- sources;
- content_versions;
- mastery_events;
- concept_mastery;
- review_tasks;
- source_update_events.

## Skills From K-Dense Scientific Agent Skills

Do not install all 158 skills from `K-Dense-AI/scientific-agent-skills`. Use a focused subset.

Recommended Academy v1 pack:

- `scientific-writing`: draft and revise educational scientific content with evidence provenance.
- `paper-lookup`: reproducible PubMed/PMC/Europe PMC/Crossref/OpenAlex/Semantic Scholar lookups.
- `research-lookup`: compile source packets for modules and claims.
- `scientific-critical-thinking`: audit claims, evidence quality, bias, causal overreach, and guideline interpretation.
- `citation-management`: maintain clean references.
- `scientific-slides`: generate teaching slide structures.
- `scientific-schematics`: create algorithms, flowcharts, pathway diagrams, and clinical reasoning diagrams.
- `infographics`: one-page visual summaries and educational cards.
- `scientific-visualization`: publication-quality graphs and trial-result figures.
- `markdown-mermaid-writing`: Markdown and Mermaid diagrams for versionable documentation.
- `xlsx`: banks of questions, curriculum maps, review trackers, and exports.
- `statistical-analysis`: learner analytics and statistical teaching modules.
- `exploratory-data-analysis`: analyze app usage, retention, weak concepts, item difficulty.
- `networkx`: represent curriculum as prerequisite graphs.

Keep existing local skills:

- `word-docx`: robust Word/DOCX generation and editing.
- `markdown-converter`: convert PDFs, Word, PPTX, Excel, etc. to Markdown.
- `data-analysis`: analysis, visualization, reports, spreadsheets.
- `qmd`: local search/indexing over project sources.
- `humanizer`: make learner-facing prose less AI-like.

Optional later:

- `clinical-decision-support`: research/governance artifacts only, not patient-specific decisions.
- `clinical-reports`: structured draft reports and case-report scaffolds, with strict safety boundaries.
- `pydicom`: if the Academy includes DICOM/RT planning or contouring exercises.
- `imaging-data-commons`: if using public cancer imaging datasets.
- `scikit-learn`: adaptive recommendations once there are real learner data.
- `scikit-survival`, `statsmodels`, `shap`: advanced statistics and model-interpretability modules.

Avoid at v1:

- full genomics/single-cell pack unless a specific module requires it;
- drug-discovery/chemistry skills;
- reinforcement-learning skills for gamification;
- cloud lab integrations;
- broad install of all K-Dense skills.

## Custom Skill To Create

The most important missing piece is a project-specific skill:

`academy-content-engine`

Purpose:

- create source-grounded oncology/radiotherapy educational content;
- maintain curriculum structure;
- generate QCM/QROC/cases with feedback;
- manage update monitoring;
- support gamification and mastery logic;
- enforce medical governance.

This custom skill should define:

- standard module template;
- source hierarchy by disease site;
- claim-to-source requirements;
- validation status workflow;
- QCM generation rules;
- distractor quality rules;
- tutor feedback format;
- spaced repetition rules;
- mastery scoring model;
- update workflow;
- medical safety boundaries.

## MVP Deliverables

For the endometrium pilot:

- one clean curriculum tree;
- 10 validated foundation capsules;
- 5 validated clinical cases;
- 20 validated questions;
- 1 complete playable learning loop;
- tutor grading rubric;
- source index;
- review queue;
- learner mastery dashboard.

First playable loop:

`endo_case_001_lvsi_reasoning`

Expected behavior:

1. User receives a short RCP-style endometrial cancer case.
2. User answers freely.
3. Tutor grades reasoning and final answer.
4. Tutor detects whether LVSI/risk/RT indication reasoning is weak.
5. App recommends the LVSI capsule or pelvic lymphatic drainage capsule.
6. User gets a short retest question.
7. App updates mastery metrics.

## Recommended Immediate Next Steps

1. Audit current endometrium pilot files for completeness and internal consistency.
2. Confirm the exact first case id and linked concept ids.
3. Scaffold a simple Next.js prototype.
4. Load local JSON/Markdown content.
5. Implement case view, answer input, tutor feedback panel, and mastery event logging.
6. Keep all medical content in draft/needs-review until Sami validates it.
7. Add the `academy-content-engine` skill before scaling content production.

## Operating Instruction For The Agent

Work like a senior medical-software copilot.

Do not optimize for volume of generated content. Optimize for correctness, traceability, and a working learning loop.

When creating medical content:

- retrieve or use explicit sources;
- label jurisdiction and year/version;
- cite sources at claim level when possible;
- mark content `needs_review`;
- never mark content `validated` unless Sami explicitly approves it;
- state uncertainty instead of filling gaps.

When building the app:

- implement the usable experience first;
- avoid a marketing landing page;
- make the interface dense, clean, and professional;
- prioritize clinical workflow: case, reasoning, feedback, remediation, retest, mastery;
- keep local content files readable and versionable.

The app is successful when Sami can open one endometrium case, answer in free text, receive useful tutor feedback, review a targeted micro-capsule, retest the weak point, and see mastery update.
