# Grounded LLM tutor — design

## Why replace the deterministic tutor

`lib/tutor.ts` scores a free-text clinical answer with normalized keyword and
regex matching. It works, and it is fast and free, but it has two structural
limits:

1. **It does not generalize.** The term groups are calibrated on a single
   prostate case (`psa 32`, `t3a`, `isup 4`). Breast, lung or rectum would each
   need new hand-written rules.
2. **It matches strings, not reasoning.** A correct answer phrased in unexpected
   words scores zero; a wrong answer that happens to contain the right terms
   scores well.

An LLM removes both limits — at the cost of two new risks: it can grade a
clinical answer wrongly, and it can grade from its own priors instead of from
this platform's teaching content. The design below is mostly about containing
those two risks.

## Constraint that shapes everything

`next.config.ts` sets `output: "export"`. The app ships as static files on
GitHub Pages, so **there is no server runtime in the app itself**, and a static
site cannot hold a secret: an API key called from the browser is readable by
every visitor of a public site.

The DeepSeek call therefore runs in a **Supabase Edge Function**, reusing the
Supabase project already integrated for auth and progress sync. The app stays a
static export, and no new hosting provider enters the stack.

## Architecture

```
Browser (static, GitHub Pages)
   │  POST { site, caseId, phase, answer }  +  Supabase JWT
   ▼
Edge Function "tutor-grade"          ← holds DEEPSEEK_API_KEY
   1. verify JWT (existing auth)
   2. per-user rate limit
   3. build grounding pack for the site
   4. call deepseek-v4-pro (json_object)
   5. validate schema          → else deterministic fallback
   6. validate citations       → else deterministic fallback
   7. apply deterministic critical-error net → may force "unsafe"
   8. log to tutor_evaluations
   ▼
TutorResult (type unchanged)
```

`TutorResult` keeps its current shape, so `components/rcp-workspace.tsx` only
becomes asynchronous and existing tests keep their structure.

## Grounding

The tutor must evaluate against **this platform's content**, never against the
model's general knowledge. A student graded against outside guidelines is being
graded on something they were never taught.

The grounding pack is assembled per disease site from files already in the repo:

| Part | Source | Size |
| --- | --- | --- |
| Rubric and critical errors | `content/<site>/tutor/TUTOR_RUBRIC.md` | ~0.8 KB |
| Teaching concepts | `content/<site>/concepts/*.md` | ~7.6 KB |
| Allowed sources | `content/<site>/sources/index.json` (id + title) | ~3.7 KB |

Roughly 12 KB, about 3,500 tokens. Everything fits inline — **no vector store,
no embeddings, no retrieval layer**. DeepSeek prompt caching covers the pack
across calls.

Two rules are enforced in the prompt and then verified in code:

- Every `rationale` must cite at least one `conceptId` or `sourceId` **taken
  from the supplied lists**.
- If the student raises something the content does not cover, the tutor sets
  `outOfScope` and declines to grade it rather than inventing an assessment.

## Guardrails

Three layers, all verifiable in code rather than trusted from the model.

**1. Deterministic critical-error net.** The existing regex logic keeps running
on every answer. Its verdict is authoritative in one direction only:

| Deterministic | LLM | Final |
| --- | --- | --- |
| `unsafe` | anything | **`unsafe`** |
| not unsafe | `unsafe` | **`unsafe`**, flagged for review |
| not unsafe | not unsafe | LLM scores and rationales |

The LLM can never upgrade a clinically dangerous answer. Disagreement always
resolves toward the more cautious verdict, and gets flagged.

**2. Schema and citation validation.** Malformed JSON, a score outside 0–2, a
missing or duplicated axis, or **any citation id absent from the whitelist**
rejects the response. Rejection is not an error state for the student — it falls
back to the deterministic tutor. No free-form model output ever reaches a
learner.

**3. Review queue.** Every grading is logged to `tutor_evaluations` with the
student answer, both results, and a disagreement flag. Disagreements and
out-of-scope gradings are marked `needs_review`, reusing the vocabulary defined
in `CONTENT_GOVERNANCE.md`.

## Failure handling

Function unreachable, timeout, invalid JSON, rate limit exceeded, or DeepSeek
unavailable → **automatic fallback to the deterministic tutor**. The student
always receives a grade. No path ends in a dead end, and the UI states discreetly
when the fallback was used.

## Data

New table `tutor_evaluations`: `user_id`, `site`, `case_id`, `phase`,
`answer_text`, `llm_result`, `deterministic_result`, `final_result`,
`disagreement`, `status`, `created_at`. RLS: a student reads and writes only
their own rows; the reviewer reads all.

## Empirical validation

Measured against `deepseek-v4-pro` on the real prostate rubric and content
(2026-08-03), 35 whitelisted identifiers:

| Answer | Verdict | Out of scope | Invented citations |
| --- | --- | --- | --- |
| PSMA trap | `unsafe` | no | none |
| Solid, complete | `correct` 10/10 | no | none |
| Proton therapy / LuPSMA-617 | `unsafe` | **yes** | none |

The model uses the full 0–2 scale, cites `psma_pet_limits` — this repo's own
concept file — rather than its memory, and on the out-of-scope answer states
that proton therapy and LuPSMA-617 "ne figurent pas dans le contenu" instead of
improvising. Latency 300–500 ms; about 8,000 tokens per grading with grounding.

Two findings worth recording:

- `deepseek-v4-pro` **does not support** `response_format: json_schema`; only
  `json_object` is available. Provider-side schema enforcement is therefore not
  an option, which makes local validation mandatory rather than optional.
- The rubric's fourth critical error ("prescrire une stratégie définitive sans
  considérer le terrain ni les préférences") is broad enough that a brief but
  clinically correct answer is graded `unsafe`. The model applies the rubric
  faithfully; the rubric equates that omission with the PSMA error. **This is an
  editorial decision for the medical reviewer, not a model defect.**

## Scope of this design

This makes grading more reliable and traceable. It does **not** clinically
validate any content: gradings remain `needs_review` until a named reviewer
approves them, and nothing here lets the platform publish a medical
recommendation as validated by itself.
