-- ЕТАП 7: адмін-доступ, тимчасові/постійні бани, видалення чужих акаунтів.
-- Запусти в Supabase: SQL Editor -> New query -> встав -> Run.
-- Безпечно запускати повторно.

-- ============================================================
-- 1. АДМІНИ
-- Окрема таблиця. З боку сайту її НЕМОЖЛИВО змінити (немає політик на
-- insert/update/delete) — адміном можна стати лише через SQL Editor.
-- ============================================================
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;

drop policy if exists "Адмін бачить свій рядок" on admins;
create policy "Адмін бачить свій рядок" on admins
  for select using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- 2. БАНИ
-- banned_until = null  -> бан назавжди
-- banned_until = дата  -> бан до цієї дати
-- ============================================================
create table if not exists bans (
  user_id uuid primary key references profiles(id) on delete cascade,
  banned_until timestamptz,
  reason text,
  created_at timestamptz not null default now()
);

alter table bans enable row level security;

drop policy if exists "Свій бан або всі для адміна" on bans;
create policy "Свій бан або всі для адміна" on bans
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Адмін створює бани" on bans;
create policy "Адмін створює бани" on bans
  for insert with check (public.is_admin());

drop policy if exists "Адмін змінює бани" on bans;
create policy "Адмін змінює бани" on bans
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Адмін знімає бани" on bans;
create policy "Адмін знімає бани" on bans
  for delete using (public.is_admin());

create or replace function public.is_banned(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.bans b
    where b.user_id = uid
      and (b.banned_until is null or b.banned_until > now())
  );
$$;

grant execute on function public.is_banned(uuid) to authenticated;

-- ============================================================
-- 3. АДМІН МОЖЕ ВИДАЛЯТИ БУДЬ-ЯКІ ПОСТИ І КОМЕНТАРІ
-- (додається до існуючих політик "автор видаляє своє")
-- ============================================================
drop policy if exists "Адмін видаляє будь-який пост" on posts;
create policy "Адмін видаляє будь-який пост" on posts
  for delete using (public.is_admin());

drop policy if exists "Адмін видаляє будь-який коментар" on comments;
create policy "Адмін видаляє будь-який коментар" on comments
  for delete using (public.is_admin());

-- ============================================================
-- 4. ЗАБАНЕНІ НЕ МОЖУТЬ НІЧОГО СТВОРЮВАТИ
-- Перестворюємо політики вставки з додатковою умовою "не забанений".
-- ============================================================
drop policy if exists "Створення постів залогіненими" on posts;
create policy "Створення постів залогіненими" on posts
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "Створення коментарів залогіненими" on comments;
create policy "Створення коментарів залогіненими" on comments
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "Лайк лише залогіненим і лише один раз" on likes;
create policy "Лайк лише залогіненим і лише один раз" on likes
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "Репост лише залогіненим і лише один раз" on reposts;
create policy "Репост лише залогіненим і лише один раз" on reposts
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "Лайк коментаря лише залогіненим і один раз" on comment_likes;
create policy "Лайк коментаря лише залогіненим і один раз" on comment_likes
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

drop policy if exists "Надіслати заявку в друзі" on friendships;
create policy "Надіслати заявку в друзі" on friendships
  for insert with check (auth.uid() = requester_id and not public.is_banned(auth.uid()));

drop policy if exists "Надсилати повідомлення лише другу" on messages;
create policy "Надсилати повідомлення лише другу" on messages
  for insert with check (
    auth.uid() = sender_id
    and not public.is_banned(auth.uid())
    and exists (
      select 1 from friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = sender_id and f.addressee_id = receiver_id)
          or (f.requester_id = receiver_id and f.addressee_id = sender_id)
        )
    )
  );

drop policy if exists "Завантаження фото залогіненими" on storage.objects;
create policy "Завантаження фото залогіненими" on storage.objects
  for insert with check (
    bucket_id = 'post-images'
    and auth.uid() is not null
    and not public.is_banned(auth.uid())
  );

-- ============================================================
-- 5. ВИДАЛЕННЯ ЧУЖОГО АКАУНТА (лише адмін)
-- Каскадно прибирає профіль, пости, коментарі, лайки, повідомлення.
-- Не дозволяє видалити себе або іншого адміна.
-- Service-role ключ НЕ потрібен — той самий підхід, що й delete_own_account.
-- ============================================================
create or replace function public.admin_delete_user(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  if target = auth.uid() then
    raise exception 'cannot delete yourself';
  end if;
  if exists (select 1 from public.admins where user_id = target) then
    raise exception 'cannot delete an admin';
  end if;
  delete from auth.users where id = target;
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;

-- ============================================================
-- 6. ВИПРАВЛЕННЯ ДІРКИ: раніше БУДЬ-ХТО міг редагувати БУДЬ-ЯКИЙ пост
-- (політика мала "or true"). Тепер редагувати може лише автор, а скарги
-- рахуються через окрему функцію.
-- ============================================================
drop policy if exists "Автор редагує свій пост" on posts;
create policy "Автор редагує свій пост" on posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.report_post(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts set report_count = report_count + 1 where id = p_post_id;
$$;

grant execute on function public.report_post(uuid) to authenticated;

-- ============================================================
-- 7. ЗРОБИТИ СВІЙ АКАУНТ АДМІНОМ
-- Зареєструй на сайті окремий акаунт (інший нік і пароль), потім
-- розкоментуй рядок нижче, впиши його нік і запусти:
-- ============================================================
-- insert into admins (user_id)
-- select id from profiles where nickname = 'ТВІЙ_АДМІН_НІК'
-- on conflict do nothing;
