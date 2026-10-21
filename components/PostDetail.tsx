"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/image";
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

function CommentItem({
  comment,
  initiallyLiked,
  isAdmin,
  onDeleted,
}: {
  comment: Comment;
  initiallyLiked: boolean;
  isAdmin: boolean;
  onDeleted: (id: string) => void;
}) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [count, setCount] = useState(comment.comment_likes?.[0]?.count ?? 0);

  async function handleLike() {
    if (liked) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("comment_likes")
      .insert({ comment_id: comment.id, user_id: user.id });

    if (!error) {
      setLiked(true);
      setCount((n) => n + 1);
    }
  }

  async function handleAdminDelete() {
    if (!confirm("Видалити цей коментар (як адмін)?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id);
    if (error) {
      alert("Не вдалося видалити коментар: " + error.message);
      return;
    }
    onDeleted(comment.id);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-sm">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted">
        {comment.profiles?.nickname ? (
          <Link
            href={`/u/${comment.profiles.nickname}`}
            className="font-medium text-paper hover:underline"
          >
            {comment.profiles.nickname}
          </Link>
        ) : (
          <span className="font-medium text-paper">Користувач</span>
        )}
        <span>·</span>
        <span>{formatDate(comment.created_at)}</span>
        {isAdmin && (
          <button
            onClick={handleAdminDelete}
            className="ml-auto text-flag hover:underline"
          >
            Видалити (адмін)
          </button>
        )}
      </div>
      {comment.body && (
        <p className="whitespace-pre-wrap text-paper">{comment.body}</p>
      )}
      {comment.gif_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={comment.gif_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="mt-2 max-h-48 rounded-lg object-cover"
        />
      )}
      <button
        onClick={handleLike}
        className={`mt-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs transition ${
          liked ? "text-mint" : "text-muted hover:text-paper"
        }`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"}>
          <path
            d="M12 21s-7-4.5-9.5-9C.7 8.2 2 4.8 5.3 4.1 7.6 3.6 9.8 4.6 12 7c2.2-2.4 4.4-3.4 6.7-2.9 3.3.7 4.6 4.1 2.8 7.9C19 16.5 12 21 12 21z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        {count}
      </button>
    </div>
  );
}

export default function PostDetail({
  post,
  initialComments,
  liked,
  reposted,
  likedCommentIds,
  isAdmin = false,
}: {
  post: Post;
  initialComments: Comment[];
  liked: boolean;
  reposted: boolean;
  likedCommentIds: string[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [gifFile, setGifFile] = useState<File | null>(null);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const likedSet = new Set(likedCommentIds);

  const likeCount = post.likes?.[0]?.count ?? 0;
  const repostCount = post.reposts?.[0]?.count ?? 0;

  async function handleReport() {
    const supabase = createClient();
    const { error } = await supabase.rpc("report_post", {
      p_post_id: post.id,
    });
    if (!error) setReported(true);
  }

  async function handleAdminDeletePost() {
    if (!confirm("Видалити цей пост назавжди (як адмін)?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      alert("Не вдалося видалити пост: " + error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!commentBody.trim() && !gifFile) {
      setError("Напиши текст або додай гіфку.");
      return;
    }
    if (commentBody.trim()) {
      const lengthError = assertPostLength(commentBody, 500);
      if (lengthError) {
        setError(lengthError);
        return;
      }
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

    let gifUrl: string | null = null;
    if (gifFile) {
      const prepared = await compressImage(gifFile, 800, 0.8);
      const fileExt = prepared.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, prepared, { cacheControl: "31536000" });
      if (uploadError) {
        setSubmitting(false);
        setError("Не вдалося завантажити гіфку.");
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);
      gifUrl = publicUrlData.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        body: commentBody,
        is_anonymous: false,
        user_id: user.id,
        gif_url: gifUrl,
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
    setGifFile(null);
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
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                {post.report_count > 0 && (
                  <span className="text-gold">⚠ скарг: {post.report_count}</span>
                )}
                <button
                  onClick={handleAdminDeletePost}
                  className="text-flag hover:underline"
                >
                  Видалити (адмін)
                </button>
              </>
            )}
            <button
              onClick={handleReport}
              disabled={reported}
              className="text-flag/70 hover:text-flag disabled:opacity-40"
            >
              {reported ? "Скаргу надіслано" : "Поскаржитись"}
            </button>
          </div>
        </div>

        {isAdmin && post.is_anonymous && post.profiles?.nickname && (
          <p className="mb-2 text-xs text-gold">
            Автор анонімного поста:{" "}
            <Link href={`/u/${post.profiles.nickname}`} className="underline">
              {post.profiles.nickname}
            </Link>
          </p>
        )}

        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            decoding="async"
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
          <CommentItem
            key={c.id}
            comment={c}
            initiallyLiked={likedSet.has(c.id)}
            isAdmin={isAdmin}
            onDeleted={(id) => setComments((prev) => prev.filter((x) => x.id !== id))}
          />
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
        <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-paper">
            {gifFile ? gifFile.name : "Додати гіфку"}
          </span>
          <input
            type="file"
            accept="image/gif,image/*"
            className="hidden"
            onChange={(e) => setGifFile(e.target.files?.[0] ?? null)}
          />
        </label>
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
