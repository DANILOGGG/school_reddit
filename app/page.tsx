import Link from "next/link";
import { Suspense } from "react";
import { createClient, getIsAdmin, getUser } from "@/lib/supabase/server";
import { POST_SELECT, POSTS_PAGE_SIZE } from "@/lib/queries";
import PostCard from "@/components/PostCard";
import GroupsStrip from "@/components/GroupsStrip";
import LiveFeed from "@/components/LiveFeed";
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
  searchParams: { category?: string; before?: string };
}) {
  const supabase = createClient();
  const filter = searchParams.category;
  // «before» — позначка часу останнього поста попередньої сторінки.
  // Перевіряємо, що це справді дата, щоб не відправляти сміття в запит.
  const before =
    searchParams.before && !Number.isNaN(Date.parse(searchParams.before))
      ? searchParams.before
      : null;

  // Беремо на 1 пост більше за розмір сторінки — так знаємо, чи є «старіші».
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(POSTS_PAGE_SIZE + 1);

  if (before) query = query.lt("created_at", before);

  if (filter === "anonymous") {
    query = query.eq("is_anonymous", true);
  } else if (filter === "news") {
    query = query.eq("category", "news");
  } else if (filter === "thoughts") {
    query = query.eq("category", "thoughts");
  }

  // Пости й користувач — одночасно
  const [{ data: rows, error }, user] = await Promise.all([query, getUser()]);

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

  const fetched = (rows ?? []) as unknown as Post[];
  const hasMore = fetched.length > POSTS_PAGE_SIZE;
  const posts = hasMore ? fetched.slice(0, POSTS_PAGE_SIZE) : fetched;
  const nextCursor = hasMore ? posts[posts.length - 1].created_at : null;

  const header = (
    <>
      {!before && <LiveFeed />}
      <Suspense fallback={null}>
        <GroupsStrip userId={user?.id ?? null} />
      </Suspense>
      {activeLabel && (
        <p className="mb-3 text-sm text-muted">
          Категорія: <span className="text-paper">{activeLabel}</span>
        </p>
      )}
    </>
  );

  if (posts.length === 0) {
    return (
      <div>
        {header}
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          {before ? "Старіших постів немає." : "Тут поки що порожньо."}
        </div>
        {before && (
          <Link
            href={filter ? `/?category=${filter}` : "/"}
            className="mt-3 inline-block text-sm text-mint hover:underline"
          >
            ← На початок стрічки
          </Link>
        )}
      </div>
    );
  }

  let isAdmin = false;
  let likedIds = new Set<string>();
  let repostedIds = new Set<string>();
  if (user) {
    const postIds = posts.map((p) => p.id);
    const [admin, { data: likes }, { data: reposts }] = await Promise.all([
      getIsAdmin(user.id), // уже порахований у TopNav — другий запит не робиться
      supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
      supabase.from("reposts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
    ]);
    isAdmin = admin;
    likedIds = new Set((likes ?? []).map((l) => l.post_id));
    repostedIds = new Set((reposts ?? []).map((r) => r.post_id));
  }

  // Пости з більшою кількістю репостів просуваються вище в стрічці
  // (лише на першій сторінці без фільтра категорії — фільтр і наступні
  // сторінки завжди сортуються за часом, щоб не плутати результат).
  let ordered = posts;
  if (!filter && !before) {
    const boosted = posts
      .filter((p) => (p.reposts?.[0]?.count ?? 0) >= 3)
      .sort((a, b) => (b.reposts?.[0]?.count ?? 0) - (a.reposts?.[0]?.count ?? 0));
    const boostedIds = new Set(boosted.map((p) => p.id));
    const rest = posts.filter((p) => !boostedIds.has(p.id));
    ordered = [...boosted, ...rest];
  }

  return (
    <div>
      {header}
      <div className="flex flex-col gap-3">
        {ordered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={likedIds.has(post.id)}
            reposted={repostedIds.has(post.id)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {before ? (
          <Link
            href={filter ? `/?category=${filter}` : "/"}
            className="text-sm text-muted hover:text-paper"
          >
            ← На початок
          </Link>
        ) : (
          <span />
        )}
        {nextCursor && (
          <Link
            prefetch={false}
            href={{
              pathname: "/",
              query: { ...(filter ? { category: filter } : {}), before: nextCursor },
            }}
            className="rounded-full border border-border px-4 py-2 text-sm text-paper transition hover:border-chalk"
          >
            Старіші пости →
          </Link>
        )}
      </div>
    </div>
  );
}
