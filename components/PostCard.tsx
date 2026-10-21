"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";
import PostActions from "@/components/PostActions";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostCard({
  post,
  liked,
  reposted,
  isAdmin = false,
}: {
  post: Post;
  liked: boolean;
  reposted: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleAdminDelete() {
    if (!confirm("Видалити цей пост назавжди (як адмін)?")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      setDeleting(false);
      alert("Не вдалося видалити пост: " + error.message);
      return;
    }
    router.refresh();
  }

  const likeCount = post.likes?.[0]?.count ?? 0;
  const repostCount = post.reposts?.[0]?.count ?? 0;
  const commentCount = post.comments?.[0]?.count ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 transition hover:border-chalk/60">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted">
        {post.is_anonymous ? (
          <span className="rounded-full bg-moss px-2 py-0.5 font-medium text-mint">
            Анонімно
          </span>
        ) : post.profiles?.nickname ? (
          <Link
            href={`/u/${post.profiles.nickname}`}
            className="font-medium text-paper hover:underline"
          >
            {post.profiles.nickname}
          </Link>
        ) : (
          <span className="font-medium text-paper">Користувач</span>
        )}
        <span>·</span>
        <span>{formatDate(post.created_at)}</span>

        {isAdmin && (
          <div className="ml-auto flex items-center gap-3">
            {post.report_count > 0 && (
              <span className="text-gold">⚠ скарг: {post.report_count}</span>
            )}
            <button
              onClick={handleAdminDelete}
              disabled={deleting}
              className="text-flag hover:underline disabled:opacity-50"
            >
              {deleting ? "Видаляємо…" : "Видалити (адмін)"}
            </button>
          </div>
        )}
      </div>

      {isAdmin && post.is_anonymous && post.profiles?.nickname && (
        <p className="-mt-1 mb-2 text-xs text-gold">
          Автор анонімного поста:{" "}
          <Link href={`/u/${post.profiles.nickname}`} className="underline">
            {post.profiles.nickname}
          </Link>
        </p>
      )}

      <Link href={`/post/${post.id}`} className="block">
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="mb-3 max-h-80 w-full rounded-xl object-cover"
          />
        )}

        <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-paper">
          {post.body.length > 300 ? post.body.slice(0, 300) + "…" : post.body}
        </p>
      </Link>

      <PostActions
        postId={post.id}
        likeCount={likeCount}
        repostCount={repostCount}
        commentCount={commentCount}
        liked={liked}
        reposted={reposted}
      />
    </div>
  );
}
