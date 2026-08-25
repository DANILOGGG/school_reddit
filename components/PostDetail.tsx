"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Comment, Post } from "@/lib/types";
import { assertPostLength } from "@/lib/moderation";
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

export default function PostDetail({
  post,
  initialComments,
  liked,
  reposted,
}: {
  post: Post;
  initialComments: Comment[];
  liked: boolean;
  reposted: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const likeCount = post.likes?.[0]?.count ?? 0;
  const repostCount = post.reposts?.[0]?.count ?? 0;

  async function handleReport() {
    const supabase = createClient();
    await supabase
      .from("posts")
      .update({ report_count: post.report_count + 1 })
      .eq("id", post.id);
    setReported(true);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const lengthError = assertPostLength(commentBody, 500);
    if (lengthError) {
      setError(lengthError);
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      setError("Треба увійти, щоб коментувати.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        body: commentBody,
        is_anonymous: false,
        user_id: user.id,
      })
      .select("*, profiles!comments_user_id_fkey(*)")
      .single();
    setSubmitting(false);

    if (insertError) {
      setError("Не вдалося додати коментар.");
      return;
    }
    setComments([...comments, data as Comment]);
    setCommentBody("");
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
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
          </div>
          <button
            onClick={handleReport}
            disabled={reported}
            className="text-flag/70 hover:text-flag disabled:opacity-40"
          >
            {reported ? "Скаргу надіслано" : "Поскаржитись"}
          </button>
        </div>

        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            className="mb-3 max-h-[32rem] w-full rounded-xl object-cover"
          />
        )}

        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-paper">
          {post.body}
        </p>

        <PostActions
          postId={post.id}
          likeCount={likeCount}
          repostCount={repostCount}
          commentCount={comments.length}
          liked={liked}
          reposted={reposted}
        />
      </div>

      <h2 className="mb-3 mt-6 font-display text-lg text-paper">
        Коментарі ({comments.length})
      </h2>

      <div className="mb-4 flex flex-col gap-2">
        {comments.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-border bg-surface p-3 text-sm"
          >
            <div className="mb-1 flex items-center gap-2 text-xs text-muted">
              {c.profiles?.nickname ? (
                <Link
                  href={`/u/${c.profiles.nickname}`}
                  className="font-medium text-paper hover:underline"
                >
                  {c.profiles.nickname}
                </Link>
              ) : (
                <span className="font-medium text-paper">Користувач</span>
              )}
              <span>·</span>
              <span>{formatDate(c.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap text-paper">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted">Поки що без коментарів.</p>
        )}
      </div>

      <form onSubmit={handleComment} className="flex flex-col gap-2">
        <textarea
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder="Додати коментар…"
          rows={3}
          className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-paper placeholder:text-muted outline-none focus:border-chalk focus:ring-2 focus:ring-chalk/20"
        />
        {error && <p className="text-sm text-flag">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-full bg-chalk px-4 py-2 text-sm font-medium text-base transition hover:bg-mint disabled:opacity-50"
        >
          {submitting ? "Надсилаємо…" : "Коментувати"}
        </button>
      </form>
    </div>
  );
}
