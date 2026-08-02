# OncoRT Academy — Vision & Pedagogical Design

> For Claude Code or any new collaborator. Read this first to understand what we're building and why every decision was made. This is the conceptual blueprint — not a technical manual.

---

## The Core Idea

OncoRT Academy is a learning platform for radiation oncologists who want to truly understand oncology, not just memorize guidelines.

Most oncology education falls into two traps:
- **Textbooks and reviews** — passive, undifferentiated, no feedback loop on whether you actually understood.
- **Guideline flashcards** — you remember what the recommendation says, but you can't explain why it exists, when it breaks, or how to adapt it.

Neither builds the clinical reasoning skills you need in a tumor board.

**This app does something different**: it teaches the *mechanism* behind every decision. It treats the learner like a clinician who needs to understand cause, evidence, trade-offs, and uncertainty — not a student cramming for an exam.

### The Learning Loop

```
Clinical situation
    ↓
Reasoning question (why, not just what)
    ↓
Answer evaluated on reasoning quality, not only correctness
    ↓
Knowledge gap identified
    ↓
Foundation capsule triggered (micro-lesson on the missing concept)
    ↓
Retest in a different clinical context
    ↓
Mastery updated
```

This is the opposite of a video course. The learner is active throughout.

---

## The Pedagogy: Building Clinical Intuition From First Principles

### Why "From First Principles" Matters

A radiation oncologist treating prostate cancer needs to understand:

- **Anatomy and histology** — what the gland looks like, how cancer grows within it, where it spreads.
- **Biology** — the androgen receptor, PSA kinetics, carcinogenesis, tumor heterogeneity.
- **Pathology** — Gleason grading, ISUP groups, what the architecture actually means.
- **Imaging** — what MRI and PSMA-PET can and cannot see.
- **Staging and risk** — how TNM, PSA, and grade combine into risk groups, and where those groups break.
- **Treatment mechanisms** — why ADT works, how radiation kills, when surgery is better, what ARPI resistance looks like.
- **Evidence interpretation** — trial design, hazard ratios, competing risks, what "positive trial" actually means.
- **Multidisciplinary reasoning** — when urology, medical oncology, and radiotherapy choices intersect and conflict.

If you skip any of these, the learner ends up with fragmented knowledge: they know *what* to do but not *why*, and they can't handle cases that fall between guideline categories.

### Three Depth Levels

Every topic exists at three depths, and the app navigates between them:

| Level | Purpose | Example |
|-------|---------|---------|
| **Foundations** | Understand the mechanism from first principles | "How does the androgen receptor drive prostate cell growth, and what happens when we block it?" |
| **Clinical Competence** | Decide safely in common practice | "For high-risk localized prostate cancer, what is the evidence for adding ADT to radiotherapy, and how long?" |
| **Expert RCP** | Navigate controversies, pivotal evidence, and complex trade-offs | "In a patient with cN1 disease, how do you weigh EBRT + ADT + ARPI vs ADT + ARPI alone, when the evidence is indirect?" |

The levels are per-topic, not per-user. A radiation oncologist may need foundations in systemic therapy but be expert in radiotherapy planning.

---

## Lesson Structure: The Reusable Pedagogy

Every single lesson in the app follows the same pedagogical architecture. This is deliberate — structure creates predictability, and predictability reduces cognitive load so the learner focuses on the content.

### The Lesson Anatomy

```
┌─────────────────────────────────────────────┐
│ TITLE — framed as a clinical question        │
├─────────────────────────────────────────────┤
│ ⏱  SYNTHÈSE 30 SECONDES                      │
│ One paragraph — the essential takeaway for    │
│ someone who only has 30 seconds.             │
├─────────────────────────────────────────────┤
│ 📖 RAISONNEMENT DÉTAILLÉ                      │
│ Section 1: Context & Concepts                │
│   What do you need to understand first?      │
│   Define terms, establish the baseline.      │
│                                              │
│ Section 2: Mechanism & Evidence              │
│   How does it work? What does the data say?  │
│   Explain cause-effect, trials, thresholds.  │
│                                              │
│ Section 3: Application & Limits              │
│   How do you use this in practice?           │
│   Where does it break? What are the traps?   │
├─────────────────────────────────────────────┤
│ 📊 FIGURE — placed where context allows       │
│   decoding, not always at the top.           │
├─────────────────────────────────────────────┤
│ 🔍 APPROFONDISSEMENT                          │
│   Deeper nuance, controversies, grey zones.  │
├─────────────────────────────────────────────┤
│ ⚠️ PIÈGE                                      │
│   The most common clinical reasoning error   │
│   for this topic.                            │
├─────────────────────────────────────────────┤
│ ✅ CHECKPOINT                                  │
│   Active retrieval question — tests           │
│   understanding, not memorization.           │
├─────────────────────────────────────────────┤
│ 📇 FLASHCARDS (×3)                            │
│   Core facts for spaced repetition.          │
├─────────────────────────────────────────────┤
│ 📚 SOURCES                                    │
│   Explicit references with dates.            │
└─────────────────────────────────────────────┘
```

### Why Three Sections?

The three-section reasoning format (`Section 1: Context → Section 2: Mechanism → Section 3: Application`) follows a deliberate cognitive sequence:

1. **Context first** — you can't reason about something you haven't defined. The learner needs the vocabulary, the anatomy, the baseline before anything else.
2. **Mechanism second** — once the context is set, you explain *why*. This is where trials, biology, and evidence live.
3. **Application third** — only after understanding the why can you apply it to clinical decisions. This section also covers limits, edge cases, and when the rule breaks.

A lesson that skips straight to "here's what to do" teaches protocol, not reasoning.

### The Figure's Role

A figure is NOT decoration and NOT a summary of the text. It answers ONE visual question that text alone cannot. Different types of content need different types of figures:

- **Anatomy** → annotated illustration or clinical imaging
- **Algorithm/decision** → deterministic schematic (flowchart, decision tree)
- **Comparison** → structured table or matrix
- **Kinetics/data** → quantitative plot (PSA curves, DVH, testosterone)
- **Mechanism** → molecular pathway diagram
- **Timeline/sequence** → chronological schema
- **Checklist** → safety/pre-treatment audit

**Key principle: just-in-time visualisation.** A figure must be placed where the learner has enough context to decode it. A DVH makes no sense before you understand what a DVH measures. A decision tree is useless before you know the criteria that feed into it.

The figure should be understandable in 5-10 seconds and complement the text, not duplicate it. Explanatory detail belongs in the legend and the lesson body, not embedded in the figure as a wall of text.

---

## Curriculum Architecture: Blocks, Not Chapters

### The Block Concept

The curriculum is organized into **blocks**, not traditional chapters. Each block answers one clinical question that spans multiple disciplines.

**Wrong way to organize**: Anatomy chapter → Pathology chapter → Imaging chapter → Surgery chapter → RT chapter → Systemic therapy chapter.

**Right way to organize**: "Localized prostate cancer — curative options" is one block. It covers surgery AND radiotherapy AND brachytherapy AND multimodal comparison, because that's how a clinician thinks about it. The learner compares trajectories, not isolated modalities.

### The 15 Prostate Blocks

The prostate curriculum is the reference pilot. It was chosen deliberately because prostate cancer forces integration across urology, pathology, imaging, medical oncology, radiotherapy, and supportive care.

The blocks follow the natural patient journey:

1. **Foundations** (8 lessons) — Anatomy, histology, androgen axis, PSA biology, carcinogenesis, Gleason grading, evidence literacy, competing risks. *Everything before the first clinical decision.*

2. **Detection & Diagnosis** (5 lessons) — From PSA interpretation to biopsy strategy to reading a pathology report as a decision map.

3. **Staging, Risk & Biomarkers** (6 lessons) — TNM, risk groups, imaging indications (including PSMA-PET limits), germline/somatic testing.

4. **Deferred Management** (5 lessons) — Active surveillance vs watchful waiting vs focal therapy, monitoring, shared decision-making.

5. **Localized Curative Options** (5 lessons) — Surgery, EBRT, brachytherapy, and multimodal comparison in one block.

6. **Definitive Radiotherapy** (7 lessons) — Indications, fractionation (moderate hypo, SBRT), pelvic volumes, boost, ADT+RT.

7. **Radiotherapy Planning** (6 lessons) — Simulation, target volumes, OAR, DVH, IGRT, pre-treatment audit.

8. **Post-Prostatectomy Recurrence** (6 lessons) — PSA definitions, PSADT, PSMA, early salvage, ADT, post-op RT technique.

9. **Post-RT & Oligorecurrence** (4 lessons) — Local salvage, nodal recurrence, metastasis-directed therapy uncertainty.

10. **High Risk & cN1** (5 lessons) — State definition, multimodal local treatment, systemic intensification, guideline divergence.

11. **Systemic Therapy Foundations** (5 lessons) — ADT mechanisms, ADT+RT, ARPI selection, taxanes, bone/metabolic/CV prevention.

12. **Hormone-Sensitive & nmCRPC** (5 lessons) — Burden/synchrony, doublet/triplet, primary RT in M1, nmCRPC criteria, bone metastases.

13. **mCRPC Precision & Palliation** (11 lessons) — Confirming mCRPC, precision testing, PARP, rare biomarkers, radium, lutetium, sequencing, neuroendocrine transformation, palliative RT, supportive care.

14. **Complex & Special Situations** (5 lessons) — Frailty, IBD, post-TURP, hip prosthesis, stage migration.

15. **Follow-up & Survivorship** (8 lessons) — PSA monitoring, testosterone recovery, urinary/digestive/sexual toxicity, bone health, metabolic/CV risk, psychosocial care.

**Each block is self-contained** — a learner can jump to the block they need, but the prerequisite system ensures they don't skip necessary foundations. A clinician who treats prostate cancer every day might go straight to block 9; a resident might need to start at block 1.

### Each Block Contains

- **Block overview** — what this block covers and why it matters
- **Lessons** (4-11 per block) — the structured pedagogical units
- **Checkpoints** — active retrieval after each lesson
- **Flashcards** — 3 per lesson for spaced repetition
- **Figures** — one per lesson, placed at the optimal pedagogical position
- **Sources** — explicit references with publication dates

---

## Visual Design Principles

### Scientific Schematics Over Decorative Art

The visual system prioritizes **clarity and accuracy over aesthetic appeal**. A figure that looks beautiful but is scientifically misleading is worse than no figure at all.

**Rules for every figure:**

1. **One pedagogical question per figure.** If the figure tries to answer three questions, it answers none well.
2. **Minimal text in the figure itself.** Use labels, not sentences. Explanations go in the legend and the lesson body.
3. **No fake precision.** If data is synthetic, say so. If anatomy is schematic, say so. Never imply a contour or a curve is from a real patient unless it is.
4. **Accessible without the figure.** Every concept has a textual fallback. The figure enhances understanding, it doesn't carry it alone.
5. **Sourceable.** Clinical claims in figures link to the same source index as text content.

### Figure Generation Decision Tree

```
What is the scientific object?
│
├─ Anatomy, histology, or body map?
│  └─ Use annotated medical illustration or clinical imaging overlay.
│     GPT Image is acceptable for the base illustration only.
│     NEVER for contouring anatomy or anatomical precision.
│
├─ Algorithm, decision tree, pathway, or mechanism?
│  └─ Use deterministic SVG/Canvas schematic.
│     DEFAULT choice. Controllable, versionable, auditable.
│
├─ Quantitative data, kinetics, thresholds?
│  └─ Use Matplotlib/Plotly/Canvas plot.
│     Declare synthetic data explicitly.
│     Always label axes and units.
│
├─ Comparison, criteria, or options?
│  └─ Use structured table or matrix.
│     Sometimes no "figure" is needed — a well-designed table IS the visual.
│
├─ Safety or verification?
│  └─ Use checklist format.
│     One per block maximum.
│
└─ None of the above applies?
   └─ Consider: does this concept benefit from ANY visual?
      If not, skip the figure. Better absent than misleading.
```

### Placement Pedagogy

Figures don't belong in a fixed slot. Placement depends on when the learner has enough context:

- **Opening (overview)**: Only for anatomical orientation or mental models that must be established before any text.
- **After Section 1**: The most common position — figure is decodable once basic concepts are introduced.
- **After Section 2**: For complex figures that need full mechanism explanation first.
- **After Section 3**: For figures that synthesize or compare after all reasoning is complete.
- **Before checkpoint**: Only for safety checklists or final summaries.

---

## Scientific Integrity

### What This App Is NOT

- **Not a clinical decision-support tool** — it teaches reasoning, it doesn't prescribe for individual patients.
- **Not a guideline database** — it references guidelines but teaches the principles behind them.
- **Not AI-generated medical advice** — every validated claim must trace to a named human source.

### Source Standards

**Priority hierarchy (France/Europe first):**

1. INCa, HAS, SFRO, CCAFU — French national references
2. ESMO, ESTRO, EAU — European society guidelines
3. ASTRO, ASCO — US society guidelines (for comparison)
4. NCCN — US, licensing permitting
5. Pivotal trials — for evidence history and mechanisms
6. Reviews — background only, never sole support for a recommendation

**Every content item must carry:**
- Source title and organization
- Publication year/version
- Access date
- Last review date
- Named reviewer (once validated)
- Status: `draft` → `needs_review` → `validated` → `update_suspected` → `deprecated`

**Only `validated` content teaches.** Everything else is a draft.

### Non-Negotiables

- Never invent a reference, DOI, PMID, trial result, dose, fractionation, risk group, or biomarker implication.
- Never present uncertain content as authoritative.
- Always distinguish European/French practice from US practice.
- AI is a drafting and tutoring assistant — never the source of truth.
- When sources are insufficient, the app says "verification required."

---

## Gamification Philosophy: Mastery, Not Points

The gamification is professional. No badges, no cartoons, no leaderboards.

**What works for clinicians:**
- A mastery map showing what you've truly understood vs what you've only seen
- Skill meters across dimensions: foundations, staging, pathology, medical oncology, radiotherapy, RCP reasoning
- Weakness dashboard — what you consistently get wrong
- Spaced repetition that brings back concepts before you forget them
- "Boss fight" full RCP cases that integrate everything
- XP weighted by clinical importance (understanding PARP mechanisms > memorizing a table)

**What doesn't work:**
- Streaks and points that reward logging in over learning
- Generic trivia
- Speed-based rewards
- Anything that feels like a mobile game

The app should feel like a serious professional tool that respects the learner's time and intelligence.

---

## The Bigger Vision

Prostate cancer is the first disease site, not the only one. The architecture is designed so that:

1. The learning engine is completely independent of any specific cancer.
2. Adding a new disease site means writing content, not rewriting code.
3. The same pedagogical structure works for breast, lung, rectum, endometrium, head & neck — any cancer where multidisciplinary reasoning matters.

**The app grows with the learner.** Today it teaches prostate cancer from first principles to expert RCP. Tomorrow it teaches rectal cancer the same way. A year from now, a radiation oncologist opens the app and finds their personal curriculum map, with mastery levels across every site they treat, and gaps highlighted before they become clinical problems.

---

## Working Principles for AI Collaborators

1. **Teach mechanisms, not recommendations.** Every lesson should answer "why," not just "what."
2. **Structure before content.** The lesson template exists for a reason. Follow it.
3. **One figure, one question.** If you can't state what the figure adds in one sentence, it adds nothing.
4. **Source everything.** If you can't source a clinical claim, mark it as inference or remove it.
5. **French for learners, English internally.** All learner-facing content is in French.
6. **Respect the review workflow.** Never mark content as `validated` — only Sami does that.
7. **Uncertainty is honest.** "We don't know" is better than a confident wrong answer.
8. **Test before claiming done.** Content validation, TypeScript, build, Playwright, visual audit.

---

*This document describes a philosophy, not a status report. The implementation details live in the code and the content files. This is here so any collaborator can understand what we're building and why.*
