set lock_timeout = '2s';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  learning_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id text not null,
  block_id text not null,
  completed_lesson_ids text[] not null default '{}',
  checkpoint_attempts jsonb not null default '{}'::jsonb,
  case_completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, site_id, block_id)
);

create index if not exists learning_progress_user_updated_idx
  on public.learning_progress (user_id, updated_at desc);

create table if not exists public.learning_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id text not null,
  block_id text not null,
  object_type text not null check (object_type in ('lesson', 'checkpoint', 'flashcard', 'case')),
  object_id text not null,
  score numeric(5,2),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists learning_events_user_created_idx
  on public.learning_events (user_id, created_at desc);
create index if not exists learning_events_site_block_idx
  on public.learning_events (site_id, block_id);

alter table public.profiles enable row level security;
alter table public.learning_progress enable row level security;
alter table public.learning_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);

drop policy if exists "progress_select_own" on public.learning_progress;
create policy "progress_select_own" on public.learning_progress
  for select using ((select auth.uid()) = user_id);
drop policy if exists "progress_insert_own" on public.learning_progress;
create policy "progress_insert_own" on public.learning_progress
  for insert with check ((select auth.uid()) = user_id);
drop policy if exists "progress_update_own" on public.learning_progress;
create policy "progress_update_own" on public.learning_progress
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "events_select_own" on public.learning_events;
create policy "events_select_own" on public.learning_events
  for select using ((select auth.uid()) = user_id);
drop policy if exists "events_insert_own" on public.learning_events;
create policy "events_insert_own" on public.learning_events
  for insert with check ((select auth.uid()) = user_id);

comment on table public.learning_progress is
  'Progression pédagogique par utilisateur, localisation et bloc. Le contenu clinique reste versionné dans le dépôt.';
