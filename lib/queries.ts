// Лише потрібні колонки замість select("*"): менше даних по мережі і швидший парсинг.
export const POST_SELECT =
  "id, created_at, body, is_anonymous, author_name, image_url, report_count, user_id, category, group_id, view_count, " +
  "profiles!posts_user_id_fkey(id, nickname, avatar_url), likes(count), reposts(count), comments(count)";

export const POSTS_PAGE_SIZE = 20;
