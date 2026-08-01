# OncoRT Academy

OncoRT Academy is a mastery-driven learning application for oncology and
radiotherapy. It combines short lessons, knowledge checkpoints, flashcards and
multidisciplinary clinical reasoning cases.

## Current status

- Prostate curriculum: 15/15 detailed blocks
- 87 lessons and 87 checkpoints
- 261 flashcards and 14 synthetic cases
- Modular Next.js routes for the dashboard, pathway, lessons, RCP mode and sources
- Local-first progress with optional Supabase account synchronization
- Supabase schema applied with row-level security on every learner table
- Clinical status: `needs_review`

All clinical content remains educational draft material until it has received
named clinician review. The application is not a clinical decision-support
system.

## Run locally

Requirements: a current Node.js LTS release and npm.

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

The app works without an account and stores progress in the browser. To enable
cross-device synchronization, copy `.env.example` to `.env.local` and provide
the Supabase project URL and publishable key. This workspace already has a local,
gitignored configuration for the connected development project.

## Quality checks

```bash
npm run validate:content
npm test
npm run build
npm run test:e2e
```

The wider UI audit can be run against a locally started server:

```bash
ONCORT_AUDIT_URL=http://localhost:3100 npm run audit:ui
```

## Modular architecture

- `lib/academy/catalog.ts` is the disease-site registry. A new localization is
  registered once and automatically uses the shared pathway and lesson engine.
- `lib/academy/types.ts` is the stable contract for blocks, lessons,
  checkpoints, flashcards, cases and sources.
- `components/course-player.tsx` is disease-site agnostic. It renders any
  learning document matching that contract.
- `lib/academy/progress.ts` owns local progress and optional server sync.
- `app/api/progress/route.ts` is the authenticated persistence boundary.
- `supabase/migrations/` is the versioned backend schema; clinical content stays
  versioned in the repository and is never promoted by learner activity.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the extension procedure.

## Repository boundaries

Downloaded source documents, private/licensed material, full-text extractions,
build outputs and local environment files are intentionally excluded from Git.
The repository retains curated educational content, source metadata, citation
records and review-governance artifacts.

See [PRODUCT_SPEC.md](PRODUCT_SPEC.md) for the product model and
[CONTENT_GOVERNANCE.md](CONTENT_GOVERNANCE.md) for clinical review rules.
