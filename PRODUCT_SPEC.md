# OncoRT Academy - Product Spec

## Vision

OncoRT Academy is a gamified learning application for radio-oncology, covering both radiotherapy and essential medical oncology. It is designed as an adaptive tutor, not a passive course library.

The target user is a radiation oncologist who wants to rebuild missing foundations, master cancer sites from first principles, and become stronger in expert-level multidisciplinary tumor boards.

## Core Principle

The app must teach the "why" behind clinical decisions.

The default learning path starts from first principles. It must never assume that
anatomy, physiology, pathology, imaging, pharmacology, staging, statistics or
radiobiology are already mastered. Advanced cases are unlocked only after the
required foundations have been taught and checked.

The learning loop is:

1. Present a clinical situation.
2. Ask for reasoning, not only the final answer.
3. Detect the knowledge gap.
4. Trigger the missing foundation capsule.
5. Retest the concept in a different context.
6. Update the user's mastery profile.

## Scope

The app covers:

- medical foundations: anatomy, pathology, physiology, tumor biology, imaging, pharmacology, clinical trial literacy;
- diagnosis and staging;
- medical oncology: biomarkers, systemic therapies, treatment lines, toxicities, interaction with radiotherapy;
- radiotherapy: indications, volumes, doses, fractionation, OAR constraints, techniques, toxicities;
- multidisciplinary decision-making;
- surveillance and relapse;
- complex cases: oligometastatic disease, recurrence, frailty, re-irradiation, controversies.

## Product Modules

### 0. Learn From Zero

The primary entry point for a new curriculum is a guided course, not an expert case.

Each chapter follows this sequence:

1. vocabulary and prerequisite map;
2. anatomy, normal physiology and core biology;
3. tumour mechanism and natural history;
4. clinical consequence;
5. diagnostic and staging logic;
6. treatment mechanism and decision logic;
7. worked example;
8. low-stakes retrieval questions;
9. concise summary and flashcards;
10. mastery check before clinical cases.

Three depth levels coexist:

- foundations: understand from first principles;
- clinical competence: decide safely in common practice;
- expert RCP: controversies, pivotal evidence and complex trade-offs.

### 1. Curriculum Map

A stable map of cancer sites and clinical situations.

Each disease site is organized into:

- foundations;
- diagnosis and staging;
- essential medical oncology;
- RCP decision-making;
- radiotherapy;
- complex cases;
- surveillance.

### 2. Foundation Capsules

Short prerequisite lessons that explain mechanisms.

Examples:

- lymphovascular space invasion;
- pelvic and para-aortic lymphatic drainage;
- receptor biology in breast cancer;
- PD-L1, EGFR, ALK, MSI, HER2, BRCA;
- radiosensitivity and fractionation;
- interpretation of hazard ratios and trial endpoints;
- immune checkpoint inhibitor toxicities;
- marrow, bowel, bladder, heart and lung dose constraints.

Each capsule contains:

- fact;
- mechanism;
- clinical consequence;
- RCP consequence;
- common trap;
- micro-question;
- prerequisites.

### 3. Core Courses

Validated, concise courses for each clinical situation.

Each course contains:

- essential knowledge;
- why it matters;
- diagnostic checklist;
- staging logic;
- treatment strategy;
- radiotherapy-specific section;
- medical oncology-specific section;
- surveillance;
- traps;
- source list and review date.

### 4. AI Tutor

The AI tutor follows the user across sessions.

It must:

- analyze answers and explanations;
- distinguish factual error, reasoning error, and prerequisite gap;
- ask Socratic follow-up questions;
- recommend foundation capsules;
- adapt difficulty;
- generate revision items from validated content;
- never modify validated medical content without review.

### 5. Clinical Reasoning Cases

Cases simulate RCP work.

Case tasks include:

- identify missing data;
- define stage and risk group;
- interpret biomarkers;
- propose sequence of treatment;
- define radiotherapy indication;
- select dose/fractionation;
- anticipate systemic therapy issues;
- propose surveillance;
- justify the decision.

### 6. Gamification

Gamification should feel professional and mastery-driven.

Useful mechanics:

- disease-site mastery map;
- skill meters: foundations, staging, medical oncology, radiotherapy, RCP reasoning, expert nuance;
- daily clinical streaks;
- XP weighted by clinical importance;
- boss fights: full RCP cases;
- "garde/urgence" mode;
- spaced repetition;
- weakness dashboard;
- monthly board-style exam.

Avoid childish badges and superficial rewards.

## Knowledge Architecture

The app must not become a massive manually extracted guideline database.

Use a hybrid model:

1. Stable curriculum and validated educational content.
2. Indexed source corpus for guidelines, PDFs, papers and reference documents.
3. AI/RAG layer for source retrieval, comparison, change detection and explanation.
4. Human validation before publishing medical content changes.

The app stores learning objects and key curated concepts. It does not try to copy every recommendation into structured tables.

## Source Strategy

Priority sources:

- French recommendations and national/regional referentials when available;
- ESMO;
- ESTRO and ACROP;
- ASTRO;
- ASCO;
- NCCN where licensing permits;
- pivotal trials;
- contouring resources such as eContour where appropriate.

Each validated content item should include:

- source title;
- URL or document reference;
- version/year;
- access date;
- last review date;
- status: draft, needs review, validated, update suspected, deprecated.

## MVP Recommendation

Start with one disease site.

Preferred options:

- Breast cancer: strong integration of surgery, systemic therapy, biomarkers and radiotherapy.
- Lung cancer: strong integration of biomarkers, immunotherapy, systemic therapy, chemoradiation and radiotherapy.
- Endometrial cancer: excellent for anatomy, pathology, risk groups, molecular classification, adjuvant RT and systemic therapy.

Selected first MVP: prostate cancer, because it forces the product to integrate
urology, pathology, imaging, medical oncology, radiotherapy, supportive care and
shared multidisciplinary decision-making. Endometrial cancer remains a preserved
content module and historical interaction prototype.

## MVP Deliverables

For one disease site:

- curriculum tree;
- 20 foundation capsules;
- 20 core course cards;
- 100 flashcards;
- 50 QCM/QROC;
- 20 clinical cases;
- 5 boss-fight RCP cases;
- progress dashboard;
- AI tutor prompts;
- source corpus index;
- review workflow.

## Non-Negotiables

- The app teaches mechanisms, not only recommendations.
- AI is a tutor and retrieval assistant, not the source of truth.
- Every medical claim in validated content is sourceable.
- The user can see why they were wrong.
- The app tracks prerequisite gaps.
- The first version must be narrow but excellent.
