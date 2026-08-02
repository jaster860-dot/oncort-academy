# Product

## Register

product

## Users

Radiation oncologists and residents, in France, working in French. They open this
between clinical duties: a gap between consultations, an evening before a
multidisciplinary tumour board, a quiet moment on call. Sessions are short and
interrupted, often on a phone.

They are not beginners in medicine, and they are not students to be entertained.
They are specialists rebuilding foundations they were never formally taught, so
they can hold their ground in a tumour board. The job to be done: *walk into
Thursday's board able to justify a decision, not just recite a recommendation.*

## Product Purpose

An adaptive tutor for radiation oncology, not a passive course library. It
teaches the mechanism behind a clinical decision, detects the reasoning gap
behind a wrong answer, repairs it with one targeted capsule, then retests the
concept in a different context.

Success is not time spent in the app. Success is a user who can defend a
decision in a real tumour board, and who knows which of their own foundations
are still fragile.

## Brand Personality

Rigorous, direct, collegial. The tone of a senior colleague who explains the
mechanism rather than quoting a guideline, and who says plainly when something
is uncertain or contested.

Address the user consistently as **tu** across the whole interface. Mixing
*vous* and *tu* reads as unfinished, and *vous* would put a wall between the
tutor and a peer.

Confidence is expressed through precision, never through enthusiasm. No
exclamation marks, no congratulation for trivial actions, no artificial urgency.

## Anti-references

- **Childish badges and superficial rewards.** Trophies, confetti, mascots,
  levels named after animals. Stated in `PRODUCT_SPEC.md` and non-negotiable.
- **Casino-style engagement mechanics.** Variable rewards, punishing streaks,
  guilt-inducing notifications, leaderboards between users. These work on a
  captive entertainment audience and actively destroy credibility with
  physicians, which is the thing that actually brings them back.
- **The empty scoreboard.** Opening a new user on a wall of zeros. Counting what
  someone has not done yet is the opposite of an invitation.
- **The blank box.** Asking for expert clinical reasoning with an empty textarea
  and no scaffolding. The highest-effort moment in the product deserves the most
  support, not the least.
- **Guideline-recitation apps.** Products that hand over a recommendation with no
  mechanism behind it.

## Design Principles

1. **Competence over score.** Show what the user can now decide alone, what is
   still fragile, and which case moves them forward. Never a bare percentage
   with nothing behind it.
2. **Scaffold the hard moment.** Effort belongs on the clinical reasoning, never
   on working out what the interface expects.
3. **One next action per screen.** Competing calls to action are a decision the
   product is refusing to make on the user's behalf.
4. **Earn trust with accuracy.** Every claim the interface makes about data,
   progress or evidence must be true. A wrong day in a streak, an English label
   in a French interface, or an inaccurate statement about where an answer is
   stored each cost more credibility than the feature was worth.
5. **Tension teaches.** A case that opens on a colleague asserting something
   wrong engages more than any reward mechanic, and it is the right kind of
   engagement for this audience.

## Accessibility & Inclusion

WCAG 2.1 AA as the working target. Body text at ≥4.5:1 contrast, large text at
≥3:1. `prefers-reduced-motion` is already respected and must stay that way.

Interface language is French throughout, including data labels sourced from
content JSON keys. Internal documentation stays in English.

Layouts must hold from 390px upward: the phone between consultations is a
primary context, not an afterthought.
