-- Виправлення: додає зв'язок (foreign key) між posts/comments і profiles,
-- якщо його з якоїсь причини не додала попередня команда.
-- Запусти в Supabase SQL Editor -> New query -> Run.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'posts_user_id_fkey'
  ) then
    alter table posts
      add constraint posts_user_id_fkey
      foreign key (user_id) references profiles(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'comments_user_id_fkey'
  ) then
    alter table comments
      add constraint comments_user_id_fkey
      foreign key (user_id) references profiles(id) on delete cascade;
  end if;
end $$;
