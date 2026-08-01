# OncoRT Academy architecture

## Design goal

The platform separates the reusable learning engine from disease-site content.
Adding breast, lung, rectum or another localization must not require copying a
page or rewriting progress logic.

## Runtime layers

1. **Content** — reviewed JSON learning documents and source metadata under
   `content/<site>/`.
2. **Registry** — `lib/academy/catalog.ts` registers a localization and maps its
   blocks to learning documents.
3. **Learning engine** — shared React components render orientation, lessons,
   checkpoints, flashcards, integrative cases and source drawers.
4. **Progress** — the browser is the immediate source of continuity; authenticated
   users additionally sync to Supabase.
5. **Backend** — Supabase Auth plus RLS-protected learner tables. Medical content
   is not edited or released from learner-facing APIs.

## Add a disease site

1. Create `content/<site>/course_map.json`, `learn/*.json` and
   `sources/index.json` using the contracts in `lib/academy/types.ts`.
2. Add the imports and a `SiteModule` record to `lib/academy/catalog.ts`.
3. Add content-structure tests and review-queue coverage.
4. Run content validation, Vitest, production build and Playwright.

Routes such as `/parcours/<site>`, `/parcours/<site>/<block>` and
`/bibliotheque/<site>` then work through the shared engine.

## Progress model

`learning_progress` stores one aggregate row per user, site and block.
`learning_events` is an append-only foundation for spaced repetition, mastery
analytics and future adaptive recommendations. Both tables enforce owner-only
access through Supabase row-level security.

Guest progress uses the versioned local-storage key
`oncort.academy.progress.v1`. A future migration can merge guest progress into
the authenticated account after explicit confirmation.

## Clinical governance boundary

- Clinical JSON remains `needs_review` until named clinician validation.
- Authentication, progress and assessment events cannot change clinical status.
- The interface surfaces review status and source traceability.
- No route is a clinical decision-support endpoint.
