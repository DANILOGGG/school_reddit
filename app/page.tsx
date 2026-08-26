import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const FILTER_LABELS: Record<string, string> = {
  anonymous: "Анонімні пости",
  news: "Цікаві новини",
  thoughts: "Спонтанні думки",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createClient();
  const filter = searchParams.category;

  let query = supabase
    .from("posts")
    .select("*, profiles!posts_user_id_fkey(*), likes(count), reposts(count), comments(count)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter === "anonymous") {
    query = query.eq("is_anonymous", true);
  } else if (filter === "news") {
    query = query.eq("category", "news");
  } else if (filter === "thoughts") {
    query = query.eq("category", "thoughts");
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Supabase posts fetch error:", error);
    return (
      <div className="rounded-xl border border-flag/30 bg-flag/5 p-4 text-sm text-flag">
        Не вдалося завантажити пости. Перевір змінні середовища Supabase і
        таблиці в базі даних.
      </div>
    );
  }

  const activeLabel = filter ? FILTER_LABELS[filter] : null;

  if (!posts || posts.length === 0) {
    return (
      <div>
        {activeLabel && (
          <p className="mb-3 text-sm text-muted">
            Категорія: <span className="text-paper">{activeLabel}</span>
          </p>
        )}
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          Тут поки що порожньо.
        </div>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let likedIds = new Set<string>();
  let repostedIds = new Set<string>();
  if (user) {
    const postIds = posts.map((p) => p.id);
    const [{ data: likes }, { data: reposts }] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
      supabase.from("reposts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
    ]);
    likedIds = new Set((likes ?? []).map((l) => l.post_id));
    repostedIds = new Set((reposts ?? []).map((r) => r.post_id));
  }

  const typedPosts = posts as Post[];

  // Пости з більшою кількістю репостів просуваються вище в стрічці
  // (лише коли не застосовано фільтр категорії — фільтр завжди
  // сортується за часом, щоб не плутати результат пошуку).
  let ordered = typedPosts;
  if (!filter) {
    const boosted = typedPosts
      .filter((p) => (p.reposts?.[0]?.count ?? 0) >= 3)
      .sort((a, b) => (b.reposts?.[0]?.count ?? 0) - (a.reposts?.[0]?.count ?? 0));
    const boostedIds = new Set(boosted.map((p) => p.id));
    const rest = typedPosts.filter((p) => !boostedIds.has(p.id));
    ordered = [...boosted, ...rest];
  }

  return (
    <div>
      {activeLabel && (
        <p className="mb-3 text-sm text-muted">
          Категорія: <span className="text-paper">{activeLabel}</span>
        </p>
      )}
      <div className="flex flex-col gap-3">
        {ordered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={likedIds.has(post.id)}
            reposted={repostedIds.has(post.id)}
          />
        ))}
      </div>
    </div>
  );
}
