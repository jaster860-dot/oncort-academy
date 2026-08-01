set lock_timeout = '2s';

create table if not exists public.pedagogical_modules (
  site_id text primary key,
  title text not null,
  version text not null,
  review_status text not null check (review_status in ('needs_review', 'reviewed', 'published')),
  manifest jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.pedagogical_blocks (
  site_id text not null references public.pedagogical_modules(site_id) on delete cascade,
  block_id text not null,
  position integer not null check (position > 0),
  version text not null,
  review_status text not null check (review_status in ('needs_review', 'reviewed', 'published')),
  content jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (site_id, block_id),
  unique (site_id, position)
);

create index if not exists pedagogical_blocks_site_position_idx
  on public.pedagogical_blocks (site_id, position);

alter table public.pedagogical_modules enable row level security;
alter table public.pedagogical_blocks enable row level security;

drop policy if exists "pedagogical_modules_read" on public.pedagogical_modules;
create policy "pedagogical_modules_read" on public.pedagogical_modules
  for select using (true);

drop policy if exists "pedagogical_blocks_read" on public.pedagogical_blocks;
create policy "pedagogical_blocks_read" on public.pedagogical_blocks
  for select using (true);

comment on table public.pedagogical_modules is
  'Snapshots applicatifs du corpus. Les fichiers versionnés et validés du dépôt restent la source éditoriale.';
comment on table public.pedagogical_blocks is
  'Blocs pédagogiques servis à l application, avec statut de revue clinique explicite.';
