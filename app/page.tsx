import { supabase } from "@/lib/supabaseClient";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function HomePage() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Supabase posts fetch error:", error)
    return (
      <div className="rounded-xl border border-flag/30 bg-flag/5 p-4 text-sm text-flag">
        Не вдалося завантажити пости. Перевір, чи налаштовані змінні
        середовища Supabase (.env.local) і чи створена таблиця{" "}
        <code>posts</code>.
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink/60">
        Тут поки що порожньо. Будь першим, хто щось напише.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {(posts as Post[]).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
