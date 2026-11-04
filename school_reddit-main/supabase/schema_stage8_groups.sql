-- ЕТАП 9: групи (канали з підпискою) і лічильник відвідувачів.
-- Запусти в Supabase: SQL Editor -> New query -> встав -> Run.
-- Безпечно запускати повторно.

-- ============================================================
-- 1. ГРУПИ
-- ============================================================
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  description text check (description is null or char_length(description) <= 300),
  avatar_url text,
  member_count int not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists groups_name_lower_idx on groups (lower(name));
create index if not exists groups_member_count_idx on groups (member_count desc);

create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_user_idx on group_members (user_id);

alter table groups enable row level security;
alter table group_members enable row level security;

-- Пости можуть належати групі. group_id = null означає звичайний пост.
alter table posts add column if not exists group_id uuid references groups(id) on delete cascade;
create index if not exists posts_group_created_idx on posts (group_id, created_at desc);

-- ============================================================
-- 2. ДОПОМІЖНІ ФУНКЦІЇ
-- ============================================================
create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_owner(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.groups
    where id = gid and owner_id = auth.uid()
  );
$$;

-- Чи бачить поточний користувач цей пост (звичайний, або з групи, де він підписаний)
create or replace function public.can_see_post(pid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.posts p
    where p.id = pid
      and (p.group_id is null or public.is_group_member(p.group_id) or public.is_admin())
  );
$$;

grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_owner(uuid) to authenticated;
grant execute on function public.can_see_post(uuid) to authenticated;

-- ============================================================
-- 3. ЛІЧИЛЬНИК ПІДПИСНИКІВ (для "популярних груп") + власник автоматично підписаний
-- ============================================================
create or replace function public.update_group_member_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.groups set member_count = member_count + 1 where id = new.group_id;
  elsif tg_op = 'DELETE' then
    update public.groups set member_count = greatest(member_count - 1, 0) where id = old.group_id;
  end if;
  return null;
end;
$$;

drop trigger if exists group_members_count on group_members;
create trigger group_members_count
  after insert or delete on group_members
  for each row execute function public.update_group_member_count();

create or replace function public.add_owner_as_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id)
  values (new.id, new.owner_id)
  on conflict do nothing;
  return null;
end;
$$;

drop trigger if exists groups_add_owner on groups;
create trigger groups_add_owner
  after insert on groups
  for each row execute function public.add_owner_as_member();

-- ============================================================
-- 4. ПРАВА: ГРУПИ
-- ============================================================
drop policy if exists "Групи видно всім" on groups;
create policy "Групи видно всім" on groups for select using (true);

-- Максимум 3 групи на людину, забанені не можуть створювати
drop policy if exists "Створення груп" on groups;
create policy "Створення груп" on groups
  for insert with check (
    auth.uid() = owner_id
    and not public.is_banned(auth.uid())
    and (select count(*) from public.groups g where g.owner_id = auth.uid()) < 3
  );

drop policy if exists "Власник змінює групу" on groups;
create policy "Власник змінює групу" on groups
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Власник або адмін видаляє групу" on groups;
create policy "Власник або адмін видаляє групу" on groups
  for delete using (auth.uid() = owner_id or public.is_admin());

-- Власник не може підробити лічильник підписників чи передати групу:
-- дозволяємо вказувати / змінювати лише ці колонки.
revoke insert, update on public.groups from anon, authenticated;
grant insert (owner_id, name, description, avatar_url) on public.groups to authenticated;
grant update (name, description, avatar_url) on public.groups to authenticated;

-- ============================================================
-- 5. ПРАВА: ПІДПИСКИ
-- ============================================================
drop policy if exists "Свої підписки" on group_members;
create policy "Свої підписки" on group_members
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Підписатися на групу" on group_members;
create policy "Підписатися на групу" on group_members
  for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));

-- Відписатися можна, але власник не може покинути свою групу
drop policy if exists "Відписатися від групи" on group_members;
create policy "Відписатися від групи" on group_members
  for delete using (auth.uid() = user_id and not public.is_group_owner(group_id));

-- ============================================================
-- 6. ПРАВА: ПОСТИ З ГРУП БАЧАТЬ ЛИШЕ ПІДПИСНИКИ
-- Спочатку прибираємо ВСІ старі політики читання постів і коментарів,
-- щоб жодна стара "читати всім" не відкрила пости груп.
-- ============================================================
do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'posts' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.posts', r.policyname);
  end loop;
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'comments' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.comments', r.policyname);
  end loop;
end $$;

create policy "Читання постів" on posts
  for select using (
    group_id is null
    or public.is_group_member(group_id)
    or public.is_admin()
  );

create policy "Читання коментарів" on comments
  for select using (public.can_see_post(post_id));

-- Постити в групу може лише її власник
drop policy if exists "Створення постів залогіненими" on posts;
create policy "Створення постів залогіненими" on posts
  for insert with check (
    auth.uid() = user_id
    and not public.is_banned(auth.uid())
    and (group_id is null or public.is_group_owner(group_id))
  );

-- Коментувати і лайкати можна лише ті пости, які ти бачиш (тобто підписаний)
drop policy if exists "Створення коментарів залогіненими" on comments;
create policy "Створення коментарів залогіненими" on comments
  for insert with check (
    auth.uid() = user_id
    and not public.is_banned(auth.uid())
    and public.can_see_post(post_id)
  );

drop policy if exists "Лайк лише залогіненим і лише один раз" on likes;
create policy "Лайк лише залогіненим і лише один раз" on likes
  for insert with check (
    auth.uid() = user_id
    and not public.is_banned(auth.uid())
    and public.can_see_post(post_id)
  );

drop policy if exists "Лайк коментаря лише залогіненим і один раз" on comment_likes;
create policy "Лайк коментаря лише залогіненим і один раз" on comment_likes
  for insert with check (
    auth.uid() = user_id
    and not public.is_banned(auth.uid())
    and exists (select 1 from comments c where c.id = comment_id)
  );

-- Пости груп не можна репостити і пересилати в чат (вони мають лишатись у групі)
drop policy if exists "Репост лише залогіненим і лише один раз" on reposts;
create policy "Репост лише залогіненим і лише один раз" on reposts
  for insert with check (
    auth.uid() = user_id
    and not public.is_banned(auth.uid())
    and exists (select 1 from posts p where p.id = post_id and p.group_id is null)
  );

drop policy if exists "Надсилати повідомлення лише другу" on messages;
create policy "Надсилати повідомлення лише другу" on messages
  for insert with check (
    auth.uid() = sender_id
    and not public.is_banned(auth.uid())
    and (
      shared_post_id is null
      or exists (select 1 from posts p where p.id = shared_post_id and p.group_id is null)
    )
    and exists (
      select 1 from friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = sender_id and f.addressee_id = receiver_id)
          or (f.requester_id = receiver_id and f.addressee_id = sender_id)
        )
    )
  );

-- Власник групи модерує свою групу: видаляє пости й коментарі в ній
drop policy if exists "Власник групи видаляє пости групи" on posts;
create policy "Власник групи видаляє пости групи" on posts
  for delete using (group_id is not null and public.is_group_owner(group_id));

drop policy if exists "Власник групи видаляє коментарі групи" on comments;
create policy "Власник групи видаляє коментарі групи" on comments
  for delete using (
    exists (
      select 1 from posts p
      where p.id = comments.post_id
        and p.group_id is not null
        and public.is_group_owner(p.group_id)
    )
  );

-- ============================================================
-- 7. ЛІЧИЛЬНИК ВІДВІДУВАЧІВ (для вкладки "Статистика")
-- Рахуємо унікальні браузери, які відкрили сайт, навіть без реєстрації.
-- Таблиця закрита від прямого доступу, працюємо лише через функції.
-- ============================================================
create table if not exists site_visitors (
  visitor_id uuid primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  visit_count int not null default 1
);

alter table site_visitors enable row level security;

create or replace function public.track_visit(p_visitor uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.site_visitors (visitor_id)
  values (p_visitor)
  on conflict (visitor_id) do update
    set last_seen = now(),
        visit_count = public.site_visitors.visit_count + 1;
$$;

create or replace function public.get_visitor_stats()
returns table (total_unique bigint, last_day bigint, last_week bigint, total_visits bigint)
language sql
security definer
stable
set search_path = public
as $$
  select
    count(*),
    count(*) filter (where last_seen >= now() - interval '1 day'),
    count(*) filter (where last_seen >= now() - interval '7 days'),
    coalesce(sum(visit_count), 0)::bigint
  from public.site_visitors;
$$;

grant execute on function public.track_visit(uuid) to anon, authenticated;
grant execute on function public.get_visitor_stats() to anon, authenticated;
