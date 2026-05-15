-- Run this in Supabase SQL Editor to add Behmore-specific columns to your roasts table

alter table public.roasts
  add column if not exists preset text,
  add column if not exists batch_size_lb text,
  add column if not exists drum_speed text,
  add column if not exists first_crack_min numeric,
  add column if not exists second_crack_min numeric,
  add column if not exists bean_temp_f numeric,
  add column if not exists exhaust_temp_f numeric;
