-- ЕТАП 10: історія заходів для графіків у "Статистиці".
-- Запусти в Supabase: SQL Editor -> New query -> встав -> Run.
-- Безпечно запускати повторно. Потребує, щоб етап 9 (групи і лічильник) уже був запущений.

-- 1. Журнал заходів: кожен захід = один рядок з часом
create table if not exists site_visit_log (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  visited_at timestamptz not null default now()
);

create index if not exists site_visit_log_visited_at_idx on site_visit_log (visited_at);

alter table site_visit_log enable row level security; -- без політик: прямого доступу немає

-- 2. Те, що вже було пораховано раніше: додаємо перший і останній заходи
--    кожного відвідувача (це справжні збережені моменти). Робиться один раз.
do $$
begin
  if not exists (select 1 from site_visit_log) then
    insert into site_visit_log (visitor_id, visited_at)
    select visitor_id, first_seen from site_visitors;

    insert into site_visit_log (visitor_id, visited_at)
    select visitor_id, last_seen from site_visitors
    where last_seen - first_seen > interval '1 minute';
  end if;
end $$;

-- 3. Тепер кожен захід ще й записується в журнал
create or replace function public.track_visit(p_visitor uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.site_visitors (visitor_id)
  values (p_visitor)
  on conflict (visitor_id) do update
    set last_seen = now(),
        visit_count = public.site_visitors.visit_count + 1;

  insert into public.site_visit_log (visitor_id) values (p_visitor);
end;
$$;

grant execute on function public.track_visit(uuid) to anon, authenticated;

-- 4. Вікно часу для кожного періоду (за київським часом)
create or replace function public.visit_window(p_range text, p_tz text)
returns table (w_from timestamp, w_to timestamp, w_unit text)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_now timestamp := (now() at time zone p_tz);
  v_first timestamp;
begin
  if p_range = 'day' then
    return query select date_trunc('day', v_now), date_trunc('day', v_now) + interval '23 hours', 'hour'::text;
  elsif p_range = 'week' then
    return query select date_trunc('day', v_now) - interval '6 days', date_trunc('day', v_now), 'day'::text;
  elsif p_range = 'month' then
    return query select date_trunc('day', v_now) - interval '29 days', date_trunc('day', v_now), 'day'::text;
  elsif p_range = 'year' then
    return query select date_trunc('month', v_now) - interval '11 months', date_trunc('month', v_now), 'month'::text;
  else
    select min(l.visited_at at time zone p_tz) into v_first from public.site_visit_log l;
    if v_first is null then v_first := v_now; end if;
    if v_now - v_first <= interval '90 days' then
      return query select date_trunc('day', v_first), date_trunc('day', v_now), 'day'::text;
    else
      return query select date_trunc('month', v_first), date_trunc('month', v_now), 'month'::text;
    end if;
  end if;
end;
$$;

revoke execute on function public.visit_window(text, text) from public, anon, authenticated;

-- 5. Дані для графіка: по одному рядку на кожну годину / день / місяць (з нулями)
create or replace function public.get_visit_chart(p_range text, p_tz text default 'Europe/Kyiv')
returns table (bucket_at timestamp, bucket_unit text, n_visitors bigint, n_visits bigint)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  w record;
begin
  select * into w from public.visit_window(p_range, p_tz);

  return query
  with series as (
    select generate_series(w.w_from, w.w_to, ('1 ' || w.w_unit)::interval) as b
  ),
  agg as (
    select date_trunc(w.w_unit, l.visited_at at time zone p_tz) as b,
           count(distinct l.visitor_id) as uv,
           count(*) as tv
    from public.site_visit_log l
    where l.visited_at >= (w.w_from at time zone p_tz)
      and l.visited_at <  ((w.w_to + ('1 ' || w.w_unit)::interval) at time zone p_tz)
    group by 1
  )
  select s.b, w.w_unit, coalesce(a.uv, 0), coalesce(a.tv, 0)
  from series s
  left join agg a on a.b = s.b
  order by s.b;
end;
$$;

-- 6. Підсумок за період: скільки унікальних людей і заходів
create or replace function public.get_visit_summary(p_range text, p_tz text default 'Europe/Kyiv')
returns table (n_visitors bigint, n_visits bigint)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  w record;
begin
  select * into w from public.visit_window(p_range, p_tz);

  return query
  select count(distinct l.visitor_id), count(*)
  from public.site_visit_log l
  where l.visited_at >= (w.w_from at time zone p_tz)
    and l.visited_at <  ((w.w_to + ('1 ' || w.w_unit)::interval) at time zone p_tz);
end;
$$;

grant execute on function public.get_visit_chart(text, text) to anon, authenticated;
grant execute on function public.get_visit_summary(text, text) to anon, authenticated;
