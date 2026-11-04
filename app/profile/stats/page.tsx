import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import PostStatsClient from "@/components/PostStatsClient";
import type { DayPoint, MyPostStat } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const num = (v: unknown) => Number(v) || 0;

export default async function MyStatsPage() {
  const supabase = createClient();
  const user = await getUser();
  if (!user) redirect("/login");

  // Статистику рахує база (функції get_my_post_stats / get_views_timeline) і віддає
  // лише пости поточного користувача, тож чужі цифри отримати неможливо.
  const [statsRes, timelineRes] = await Promise.all([
    supabase.rpc("get_my_post_stats"),
    supabase.rpc("get_views_timeline", { p_days: 14 }),
  ]);

  const failed = !!statsRes.error;
  if (failed) console.error("get_my_post_stats error:", statsRes.error);

  const posts: MyPostStat[] = ((statsRes.data as any[]) ?? []).map((r) => ({
    ...r,
    view_count: num(r.view_count),
    like_count: num(r.like_count),
    comment_count: num(r.comment_count),
    repost_count: num(r.repost_count),
  }));
  const timeline: DayPoint[] = ((timelineRes.data as any[]) ?? []).map((r) => ({
    bucket_day: String(r.bucket_day),
    views: num(r.views),
  }));

  return (
    <div>
      <Link
        href="/profile"
        className="mb-3 inline-block text-sm text-muted hover:text-paper"
      >
        ← Мій профіль
      </Link>
      <h1 className="mb-1 font-display text-2xl text-paper">Моя статистика</h1>
      <p className="mb-4 text-sm text-muted">
        Перегляди, лайки, коментарі та репости твоїх публікацій.
      </p>

      {failed ? (
        <div className="rounded-xl border border-flag/30 bg-flag/5 p-4 text-sm text-flag">
          Не вдалося завантажити статистику. Перевір, що в Supabase виконано SQL
          з файлу supabase/schema_stage11_features.sql.
        </div>
      ) : (
        <PostStatsClient initialPosts={posts} initialTimeline={timeline} />
      )}
    </div>
  );
}
