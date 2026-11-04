-- ЕТАП 6 (додатково): категорії постів.
-- Запусти в Supabase: SQL Editor -> New query -> встав -> Run.

alter table posts add column if not exists category text
  check (category in ('news', 'thoughts'));
