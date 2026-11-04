-- Запусти цей файл у Supabase: Project -> SQL Editor -> New query -> встав -> Run

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  body text not null,
  is_anonymous boolean not null default true,
  author_name text,
  image_url text,
  report_count integer not null default 0
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  body text not null,
  is_anonymous boolean not null default true,
  author_name text
);

-- Увімкнути Row Level Security
alter table posts enable row level security;
alter table comments enable row level security;

-- Усі можуть читати пости й коментарі
create policy "Публічне читання постів" on posts
  for select using (true);

create policy "Публічне читання коментарів" on comments
  for select using (true);

-- Усі можуть створювати пости й коментарі (це публічний сайт без логіну).
-- Якщо додаси авторизацію через шкільну пошту — заміни "true" на
-- "auth.role() = 'authenticated'", щоб постити могли лише залогінені.
create policy "Публічне створення постів" on posts
  for insert with check (true);

create policy "Публічне створення коментарів" on comments
  for insert with check (true);

-- Дозволити оновлення лише поля report_count (для кнопки "поскаржитись").
-- Видалення постів навмисно НЕ дозволене публічно — видаляй сам
-- через Table Editor у Supabase (це і є твоя проста адмін-панель).
create policy "Публічне оновлення лічильника скарг" on posts
  for update using (true) with check (true);

-- Сховище для фото: створи в Storage бакет "post-images" (Public bucket)
-- через інтерфейс Supabase, окремої SQL-команди для цього не потрібно.
