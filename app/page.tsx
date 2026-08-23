import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Supabase posts fetch error:", error);
    return (
      <div className="rounded-xl border border-flag/30 bg-flag/5 p-4 text-sm text-flag">
        Не вдалося завантажити пости. Перевір змінні середовища Supabase і
        таблиці в базі даних.
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
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
