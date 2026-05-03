-- Run this in the Supabase SQL editor after creating your project

-- Beans table
create table public.beans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  origin        text,
  variety       text,
  processing    text,
  supplier      text,
  quantity_g    numeric,
  purchase_date date,
  cost_per_kg   numeric,
  notes         text,
  created_at    timestamptz not null default now()
);

-- Roasts table
create table public.roasts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  bean_id      uuid references public.beans(id) on delete set null,
  roasted_at   timestamptz not null,
  weight_in_g  numeric,
  weight_out_g numeric,
  roast_level  text check (roast_level in ('light', 'medium', 'medium-dark', 'dark')),
  duration_min numeric,
  notes        text,
  created_at   timestamptz not null default now()
);

-- Indexes
create index beans_user_id_idx on public.beans(user_id);
create index roasts_user_id_idx on public.roasts(user_id);
create index roasts_roasted_at_idx on public.roasts(roasted_at desc);

-- Row Level Security
alter table public.beans enable row level security;
alter table public.roasts enable row level security;

create policy "Users manage their own beans"
  on public.beans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own roasts"
  on public.roasts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
