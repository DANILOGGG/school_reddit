-- ЕТАП 6 (додатково): гіфки й лайки в коментарях.
-- Запусти в Supabase: SQL Editor -> New query -> встав -> Run.

alter table comments add column if not exists gif_url text;

create table if not exists comment_likes (
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table comment_likes enable row level security;

drop policy if exists "Публічне читання лайків коментарів" on comment_likes;
create policy "Публічне читання лайків коментарів" on comment_likes
  for select using (true);

drop policy if exists "Лайк коментаря лише залогіненим і один раз" on comment_likes;
create policy "Лайк коментаря лише залогіненим і один раз" on comment_likes
  for insert with check (auth.uid() = user_id);
