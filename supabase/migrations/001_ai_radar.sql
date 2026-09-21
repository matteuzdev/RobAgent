create extension if not exists pgcrypto;

create table if not exists public.radar_items (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  source_app text not null,
  source_title text,
  message_text text not null,
  message_subtext text,
  posted_at timestamptz,
  received_at timestamptz not null default now(),
  category text not null,
  score smallint not null check (score between 0 and 10),
  summary text not null default '',
  reason text not null default '',
  tags text[] not null default '{}',
  related_projects text[] not null default '{}',
  links text[] not null default '{}',
  github_data jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists radar_items_score_idx
  on public.radar_items (score desc, received_at desc);

create index if not exists radar_items_category_idx
  on public.radar_items (category, received_at desc);

create index if not exists radar_items_tags_idx
  on public.radar_items using gin (tags);

alter table public.radar_items enable row level security;

-- Backend writes with the service-role key.
-- Never expose that key to the Android app or browser.
