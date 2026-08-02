set lock_timeout = '2s';

-- Reviewer flag reuses the existing profiles table rather than adding a role system.
alter table public.profiles
  add column if not exists is_reviewer boolean not null default false;

create table if not exists public.tutor_evaluations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id text not null,
  case_id text not null,
  phase text not null check (phase in ('case', 'retest')),
  answer_text text not null,
  llm_result jsonb,
  deterministic_result jsonb not null,
  final_result jsonb not null,
  source text not null check (source in ('llm', 'deterministic_fallback')),
  fallback_reason text,
  disagreement boolean not null default false,
  out_of_scope boolean not null default false,
  citations text[] not null default '{}',
  status text not null default 'needs_review'
    check (status in ('needs_review', 'validated', 'rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.tutor_evaluations is
  'Journal des notations du tuteur. Aucune notation n''est autoritative : le statut reste needs_review tant qu''un relecteur nommé ne l''a pas validée (voir CONTENT_GOVERNANCE.md).';

create index if not exists tutor_evaluations_user_created_idx
  on public.tutor_evaluations (user_id, created_at desc);
create index if not exists tutor_evaluations_site_case_idx
  on public.tutor_evaluations (site_id, case_id);
-- File de relecture : cible les désaccords et hors-programme en attente.
create index if not exists tutor_evaluations_review_queue_idx
  on public.tutor_evaluations (created_at desc)
  where status = 'needs_review' and (disagreement or out_of_scope);

alter table public.tutor_evaluations enable row level security;

-- Lecture seule pour l'étudiant. Pas de politique d'insertion ni de mise à jour :
-- seule l'Edge Function (clé de service) écrit, ce qui empêche toute notation forgée.
drop policy if exists "tutor_evaluations_select_own" on public.tutor_evaluations;
create policy "tutor_evaluations_select_own" on public.tutor_evaluations
  for select using ((select auth.uid()) = user_id);

drop policy if exists "tutor_evaluations_select_reviewer" on public.tutor_evaluations;
create policy "tutor_evaluations_select_reviewer" on public.tutor_evaluations
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.is_reviewer
    )
  );

drop policy if exists "tutor_evaluations_update_reviewer" on public.tutor_evaluations;
create policy "tutor_evaluations_update_reviewer" on public.tutor_evaluations
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.is_reviewer
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.is_reviewer
    )
  );
