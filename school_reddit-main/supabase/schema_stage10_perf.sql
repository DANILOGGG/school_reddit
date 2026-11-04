-- ЕТАП 11: прискорення бази. Запусти в Supabase: SQL Editor -> New query -> встав -> Run.
-- Безпечно запускати повторно. Дані не змінює — лише політики читання та індекси.

-- 1. ГОЛОВНЕ. Політика читання коментарів викликала функцію can_see_post()
--    для КОЖНОГО коментаря (а стрічка рахує коментарі одразу для 20-50 постів).
--    Функція security definer, тому Postgres не може її «вбудувати» в запит і
--    виконує окремо на кожен рядок.
--    Замість неї — звичайна перевірка через таблицю posts: вона й так проходить
--    через політику читання постів, тож пости груп, на які людина не підписана,
--    як і раніше недоступні (а з ними — і їхні коментарі).
drop policy if exists "Читання коментарів" on comments;
create policy "Читання коментарів" on comments
  for select using (
    exists (select 1 from public.posts p where p.id = comments.post_id)
  );

-- 2. Політика читання постів: is_admin() обгорнуто в (select ...), щоб Postgres
--    порахував його один раз на запит, а не на кожен пост.
drop policy if exists "Читання постів" on posts;
create policy "Читання постів" on posts
  for select using (
    group_id is null
    or (select public.is_admin())
    or public.is_group_member(group_id)
  );

-- 3. Індекси під реальні запити сайту
--    головна стрічка (звичайні пости, нові зверху) і фільтр за категорією
create index if not exists posts_feed_idx
  on posts (created_at desc) where group_id is null;
create index if not exists posts_category_feed_idx
  on posts (category, created_at desc) where group_id is null;
--    сторінка профілю / «мої пости»
create index if not exists posts_user_created_idx
  on posts (user_id, created_at desc);
--    лічильник непрочитаних повідомлень у верхньому меню (рахується на кожній сторінці)
create index if not exists messages_unread_idx
  on messages (receiver_id) where read_at is null;
--    чат між двома людьми
create index if not exists messages_pair_idx
  on messages (sender_id, receiver_id, created_at desc);
--    заявки в друзі, що чекають відповіді (теж у верхньому меню)
create index if not exists friendships_addressee_status_idx
  on friendships (addressee_id, status);

analyze posts;
analyze comments;
analyze messages;
