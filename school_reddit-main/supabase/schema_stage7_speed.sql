-- ЕТАП 8: автооновлення стрічки і прискорення запитів.
-- Запусти в Supabase: SQL Editor -> New query -> встав -> Run.
-- Безпечно запускати повторно.

-- 1. Дозволяємо стрічці отримувати нові пости в реальному часі
do $$
begin
  alter publication supabase_realtime add table posts;
exception when duplicate_object then null;
end $$;

-- 2. Індекси: пришвидшують стрічку та підрахунок лайків/коментарів/репостів
create index if not exists posts_created_at_idx on posts (created_at desc);
create index if not exists comments_post_id_idx on comments (post_id);
create index if not exists likes_post_id_idx on likes (post_id);
create index if not exists reposts_post_id_idx on reposts (post_id);
create index if not exists comment_likes_comment_id_idx on comment_likes (comment_id);
