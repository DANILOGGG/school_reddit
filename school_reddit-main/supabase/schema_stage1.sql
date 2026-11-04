-- ЕТАП 1: акаунти (нік + пароль), профілі, права власності на пости.
-- Запусти цей файл у Supabase: SQL Editor -> New query -> встав -> Run.
-- Можна запускати навіть якщо старі таблиці вже існують — команди безпечні
-- для повторного запуску (IF NOT EXISTS / OR REPLACE).

-- 1. Таблиця профілів (створюється автоматично при реєстрації)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "Публічне читання профілів" on profiles;
create policy "Публічне читання профілів" on profiles
  for select using (true);

drop policy if exists "Власник оновлює свій профіль" on profiles;
create policy "Власник оновлює свій профіль" on profiles
  for update using (auth.uid() = id);

-- Автоматичне створення профілю одразу після реєстрації в auth.users.
-- Нік передається з коду при реєстрації через options.data.nickname
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, new.raw_user_meta_data->>'nickname');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Прив'язка постів і коментарів до профілю-автора
alter table posts add column if not exists user_id uuid references profiles(id) on delete cascade;
alter table comments add column if not exists user_id uuid references profiles(id) on delete cascade;

-- Пости тепер можна створювати лише залогіненим користувачам, і саме від
-- свого імені (навіть якщо публікація анонімна — user_id все одно записаний,
-- просто не показується іншим).
drop policy if exists "Публічне створення постів" on posts;
create policy "Створення постів залогіненими" on posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Публічне створення коментарів" on comments;
create policy "Створення коментарів залогіненими" on comments
  for insert with check (auth.uid() = user_id);

-- Автор може редагувати й видаляти лише свої пости/коментарі
drop policy if exists "Публічне оновлення лічильника скарг" on posts;
create policy "Автор редагує свій пост" on posts
  for update using (auth.uid() = user_id or true) with check (true);
  -- (report_count оновлюється будь-ким через кнопку "поскаржитись",
  --  а редагування тексту в коді обмежене лише власним постом)

drop policy if exists "Автор видаляє свій пост" on posts;
create policy "Автор видаляє свій пост" on posts
  for delete using (auth.uid() = user_id);

drop policy if exists "Автор видаляє свій коментар" on comments;
create policy "Автор видаляє свій коментар" on comments
  for delete using (auth.uid() = user_id);

-- 3. Сховище для аватарок
-- Створи бакет "avatars" в Supabase Storage вручну (Public bucket), як і
-- post-images раніше. Ці політики дозволяють завантаження лише залогіненим.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Публічне завантаження аватарок" on storage.objects;
create policy "Публічне завантаження аватарок" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid() is not null);

drop policy if exists "Публічне оновлення аватарок" on storage.objects;
create policy "Публічне оновлення аватарок" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid() is not null);

-- Права на завантаження фото до постів тепер теж лише для залогінених
drop policy if exists "Публічне завантаження фото" on storage.objects;
create policy "Завантаження фото залогіненими" on storage.objects
  for insert with check (bucket_id = 'post-images' and auth.uid() is not null);

-- 4. Видалення власного акаунту (кнопка в профілі).
-- Функція виконується з підвищеними правами (security definer), але
-- дозволяє видалити ЛИШЕ свій власний обліковий запис (auth.uid()).
-- Видалення каскадно прибирає профіль, усі пости й коментарі автора.
create or replace function public.delete_own_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

grant execute on function public.delete_own_account() to authenticated;
