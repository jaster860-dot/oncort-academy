# OncoRT Academy - MVP Plan

## Update — 1 August 2026

- The endometrium content structure has passed deterministic validation.
- The first LVSI loop now includes a case, five-axis rubric, targeted capsule,
  transfer question and provisional mastery update.
- A responsive Next.js prototype implements the complete loop.
- Unit tests, dependency audit and production build pass.
- Medical content remains `needs_review` until explicit clinician approval.
- Strategy change: build the complete oncology/radiotherapy curriculum map
  before expanding any single disease site.
- Prostate is now the reference pilot, with an explicitly multidisciplinary scope
  spanning urology, imaging, pathology, medical oncology and radiotherapy.
- All 15 prostate blocks now have detailed playable lessons. Blocks 6–10 add a
  France-first definitive-radiotherapy pathway from prescription through
  simulation, plan audit and IGRT, with controlled synthetic cases.
- Blocks 11–15 add systemic therapy, mHSPC/nmCRPC, mCRPC precision treatment,
  complex situations and survivorship. The complete layer contains 87 lessons,
  87 checkpoints, 261 flashcards and 14 synthetic cases, all `needs_review`.
- Endometrium is preserved inside the gynaecology track as the historical interaction
  prototype; no prior content is discarded.
- The next product task is a curriculum dashboard driven by
  `content/master_curriculum.json`, followed by baseline assessment and
  prioritised learning paths.

## Goal

Build a first usable version that proves the core loop:

Clinical case -> answer -> AI tutor analysis -> missing prerequisite -> micro-course -> retest -> mastery update.

## Phase 0 - Product Definition

Duration: 1-2 days.

Outputs:

- product spec;
- disease-site choice;
- core user flow;
- content schema;
- first curriculum tree;
- technical stack decision.

Decision:

- first reference disease site: prostate.

## Phase 1 - Content Skeleton

Duration: 3-5 days.

Outputs:

- disease-site curriculum;
- prerequisite graph;
- first 10-20 foundation capsules;
- first 10 course cards;
- first 20 questions;
- first 5 RCP cases.

The goal is not exhaustiveness. The goal is a coherent learning loop.

## Phase 2 - Prototype App

Duration: 1-2 weeks.

Suggested stack:

- Next.js;
- TypeScript;
- Tailwind or a restrained component system;
- Supabase/Postgres later, local JSON/MDX first;
- OpenAI API for tutor logic;
- source retrieval from a small validated corpus.

Screens:

- dashboard;
- disease-site map;
- lesson view;
- clinical case view;
- tutor feedback panel;
- weakness dashboard;
- review queue.

## Phase 3 - AI Tutor

Duration: 1 week.

Tutor functions:

- grade final answer;
- grade reasoning;
- identify missing concept;
- trigger foundation capsule;
- generate one follow-up question;
- update mastery state;
- produce a short revision prescription.

The tutor must use a strict prompt and validated content context.

## Phase 4 - Source Corpus

Duration: parallel with phases 1-3.

Start small:

- 5-10 high-quality documents for the chosen disease site;
- source metadata;
- chunking and retrieval;
- source citations in tutor output;
- "update suspected" workflow.

Do not manually extract every recommendation at MVP stage.

## Phase 5 - Validation

Duration: ongoing.

Each content item has a status:

- draft;
- AI-assisted;
- needs medical review;
- validated;
- update suspected;
- deprecated.

Only validated content appears as authoritative learning material.

## First 7 Days

Day 1:

- choose first disease site;
- define curriculum tree;
- define data schema.

Day 2:

- write 10 foundation capsules;
- write 5 core course cards.

Day 3:

- write 20 questions;
- write 5 RCP cases;
- define tutor grading rubric.

Day 4:

- scaffold web app;
- implement dashboard and lesson view.

Day 5:

- implement case view and feedback panel.

Day 6:

- connect AI tutor to local content.

Day 7:

- test one complete learning loop;
- refine content and UX.

## Recommended Next Action

Choose the first disease site and create:

- `curriculum.json`;
- `concepts/*.md`;
- `courses/*.md`;
- `cases/*.json`;
- `questions/*.json`;
- `sources/index.json`.

Current status:

- first reference disease site chosen: prostate;
- multidisciplinary prostate curriculum and prerequisite graph created;
- first high-risk M0 loop, targeted capsules and re-test created;
- France-first and European source index created;
- tutor rubric adapted to prostate and medical-oncology reasoning.

Next implementation step:

- complete named clinician review of the 15 detailed blocks, then release only
  the individually approved objects as `validated` with reviewer and date.
