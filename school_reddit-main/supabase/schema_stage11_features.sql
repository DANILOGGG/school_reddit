-- ЕТАП 12: перегляди постів, персональна статистика. Запусти в Supabase:
-- SQL Editor -> New query -> встав -> Run. Безпечно запускати повторно, наявні дані не змінює.
--
-- Бан-екран і видалення акаунта нових таблиць не потребують: таблиця bans вже є,
-- а функція delete_own_account() (етап 1) видаляє користувача, і всі його дані
-- прибираються каскадом (профіль, пости, коментарі, лайки, репости, друзі,
-- повідомлення, групи, бан). Посилання shared_post_id у чужих повідомленнях
-- обнуляється (on delete set null), тож «битих» посилань не лишається.

-- 1. Лічильник переглядів у самому пості (щоб стрічка читала його без підрахунків)
alter table posts add column if not exists view_count integer not null default 0;

-- 2. Журнал унікальних переглядів: одна людина — один запис на пост.
--    Саме первинний ключ (post_id, viewer_id) не дає накручувати перегляди
--    оновленням сторінки чи повторним відкриттям поста.
create table if not exists post_views (
  post_id uuid not null references posts(id) on delete cascade,
  viewer_id uuid not null references profiles(id) on delete cascade,
  first_viewed_at timestamptz not null default now(),
  primary key (post_id, viewer_id)
);
create index if not exists post_views_viewer_idx on post_views (viewer_id);
create index if not exists post_views_post_time_idx on post_views (post_id, first_viewed_at);

-- Прямий доступ до журналу закритий (RLS увімкнено, політик немає):
-- писати й читати можна лише через функції нижче.
alter table post_views enable row level security;

-- 3. Автор поста не може сам змінити view_count через API
--    (політика «автор редагує свій пост» дозволяє оновлювати будь-які колонки).
--    Функції нижче працюють від імені власника бази, тож їм це дозволено.
create or replace function public.protect_post_counters()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.view_count := old.view_count;
  end if;
  return new;
end;
$$;

drop trigger if exists posts_protect_counters on posts;
create trigger posts_protect_counters
  before update on posts
  for each row execute function public.protect_post_counters();

-- 4. Облік переглядів (викликається з браузера пачкою, коли пост з'явився на екрані).
--    Усі перевірки тут, на сервері:
--      - потрібен вхід; заблоковані перегляди не накручують;
--      - свої перегляди автора не рахуються;
--      - пости груп рахуються лише тим, хто має до них доступ;
--      - повторний перегляд тією ж людиною ігнорується (primary key);
--      - за один виклик — не більше 50 постів.
create or replace function public.record_post_views(p_post_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null or p_post_ids is null then
    return;
  end if;
  if public.is_banned(uid) then
    return;
  end if;

  with candidates as (
    select p.id
    from public.posts p
    where p.id = any (p_post_ids[1:50])
      and p.user_id is distinct from uid
      and (
        p.group_id is null
        or public.is_group_member(p.group_id)
        or public.is_admin()
      )
  ),
  inserted as (
    insert into public.post_views (post_id, viewer_id)
    select id, uid from candidates
    on conflict (post_id, viewer_id) do nothing
    returning post_id
  )
  update public.posts
     set view_count = view_count + 1
   where id in (select post_id from inserted);
end;
$$;

grant execute on function public.record_post_views(uuid[]) to authenticated;

-- 5. Статистика власних постів (лише автор бачить свої цифри)
create or replace function public.get_my_post_stats()
returns table (
  id uuid,
  created_at timestamptz,
  body text,
  is_anonymous boolean,
  group_id uuid,
  group_name text,
  image_url text,
  view_count integer,
  like_count bigint,
  comment_count bigint,
  repost_count bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    p.id,
    p.created_at,
    left(p.body, 160),
    p.is_anonymous,
    p.group_id,
    g.name,
    p.image_url,
    p.view_count,
    (select count(*) from public.likes l where l.post_id = p.id),
    (select count(*) from public.comments c where c.post_id = p.id),
    (select count(*) from public.reposts r where r.post_id = p.id)
  from public.posts p
  left join public.groups g on g.id = p.group_id
  where p.user_id = auth.uid()
  order by p.created_at desc
  limit 500;
$$;

grant execute on function public.get_my_post_stats() to authenticated;

-- 6. Нові перегляди по днях (за київським часом) — по одному посту або по всіх своїх
create or replace function public.get_views_timeline(
  p_post_id uuid default null,
  p_days integer default 14
)
returns table (bucket_day date, views bigint)
language sql
security definer
stable
set search_path = public
as $$
  with params as (
    select greatest(least(coalesce(p_days, 14), 90), 1) as n,
           (now() at time zone 'Europe/Kyiv')::date as today
  ),
  days as (
    select (params.today - gs.i)::date as d
    from params, generate_series(0, (select n - 1 from params)) as gs(i)
  ),
  v as (
    select (pv.first_viewed_at at time zone 'Europe/Kyiv')::date as d,
           count(*) as n
    from public.post_views pv
    join public.posts p on p.id = pv.post_id
    where p.user_id = auth.uid()
      and (p_post_id is null or pv.post_id = p_post_id)
      and pv.first_viewed_at >= now() - make_interval(days => (select n + 1 from params))
    group by 1
  )
  select days.d, coalesce(v.n, 0)::bigint
  from days
  left join v on v.d = days.d
  order by days.d;
$$;

grant execute on function public.get_views_timeline(uuid, integer) to authenticated;
