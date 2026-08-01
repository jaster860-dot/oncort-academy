# OncoRT Academy - Content Governance

## Principle

Medical content must not rely on trust in the AI.

The system must rely on:

- primary sources;
- explicit citations;
- versioning;
- structured review;
- human validation;
- update monitoring;
- clear separation between draft, teaching content, and validated content.

## Roles

### AI

The AI can:

- create a curriculum skeleton;
- draft foundation capsules;
- draft course cards;
- generate questions and cases;
- compare guideline documents;
- extract candidate updates;
- identify contradictions;
- propose prerequisite gaps;
- help produce source-linked summaries.

The AI cannot:

- publish a medical recommendation as validated by itself;
- silently update a recommendation;
- replace clinical judgment;
- merge French, European and US guidance without labeling the source context;
- answer as authoritative when the source corpus is insufficient.

### Human Medical Reviewer

The reviewer must validate:

- treatment indications;
- dose and fractionation;
- systemic therapy recommendations;
- staging/risk-group logic;
- biomarker implications;
- source selection;
- final wording of clinical recommendations.

For the first version, the reviewer is Sami. Later, other domain experts could review specific disease sites.

## Content Status

Every content object must have one status:

- `draft`: educational draft, not reviewed.
- `ai_assisted`: generated or substantially modified by AI.
- `needs_review`: ready for medical checking.
- `validated`: reviewed and approved for learning use.
- `update_suspected`: source change may affect this content.
- `deprecated`: no longer valid for current practice.

Only `validated` content can appear as authoritative teaching material.

## Source Hierarchy

For endometrial cancer, use this priority order:

1. Current European multidisciplinary guidance, especially ESGO-ESTRO-ESP.
2. French national or regional referentials when available and current.
3. ESMO clinical practice guidelines.
4. ASTRO/ESTRO guidance for radiotherapy-specific questions.
5. ASCO or other society guidance when relevant.
6. NCCN for US comparison, respecting access and licensing.
7. Pivotal trials for mechanism and evidence history.
8. Reviews only for background, never as the sole source of a recommendation.

## Required Metadata

Each course, concept, question and case should link to:

- source id;
- source title;
- publication year/version;
- access date;
- last review date;
- reviewer;
- status;
- affected concepts;
- confidence level.

## Validation Checklist

Before content becomes `validated`, check:

- Are all clinical claims source-linked?
- Is the source current enough?
- Is the jurisdiction clear: French/European/US?
- Are guideline divergences labeled?
- Are dose/fractionation statements verified?
- Are systemic therapy statements verified?
- Are biomarker implications verified?
- Are uncertainty and controversy explicit?
- Is the teaching explanation mechanistic, not just memorization?

## Update Workflow

1. Monitor source pages and PubMed records for new versions.
2. When a source changes, identify affected concepts/courses/questions/cases.
3. Mark affected objects as `update_suspected`.
4. Generate a diff: old statement, new source text, likely impact.
5. Human reviewer accepts, edits or rejects.
6. Publish a new content version.

## Safety Rule

When unsure, the app should say:

> This item requires source verification before being treated as current practice.

That is a feature, not a failure.

## Practical MVP Rule

For the MVP, build fewer items but validate them well.

Target:

- 10 validated foundation capsules;
- 5 validated clinical cases;
- 20 validated questions;
- 1 validated learning loop.

Avoid creating hundreds of unreviewed items.
