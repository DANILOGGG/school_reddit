-- ЕТАП 2: лайки, репости (кожен користувач — лише один раз на пост).
-- Запусти в Supabase: SQL Editor -> New query -> встав -> Run.

create table if not exists likes (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists reposts (
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table likes enable row level security;
alter table reposts enable row level security;

drop policy if exists "Публічне читання лайків" on likes;
create policy "Публічне читання лайків" on likes for select using (true);

drop policy if exists "Лайк лише залогіненим і лише один раз" on likes;
create policy "Лайк лише залогіненим і лише один раз" on likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Публічне читання репостів" on reposts;
create policy "Публічне читання репостів" on reposts for select using (true);

drop policy if exists "Репост лише залогіненим і лише один раз" on reposts;
create policy "Репост лише залогіненим і лише один раз" on reposts
  for insert with check (auth.uid() = user_id);
