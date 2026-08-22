"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Comment, Post } from "@/lib/supabaseClient";
import { assertPostLength } from "@/lib/moderation";

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
}: {
  post: Post;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleReport() {
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
    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({ post_id: post.id, body: commentBody, is_anonymous: true })
      .select()
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
      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <div className="mb-2 flex items-center justify-between text-xs text-ink/60">
          <div className="flex items-center gap-2">
            {post.is_anonymous ? (
              <span className="rounded-full bg-chalkLight px-2 py-0.5 font-medium text-chalk">
                Анонімно
              </span>
            ) : (
              <span className="font-medium text-ink/80">
                {post.author_name}
              </span>
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

        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
          {post.body}
        </p>
      </div>

      <h2 className="mb-3 mt-6 font-display text-lg text-ink">
        Коментарі ({comments.length})
      </h2>

      <div className="mb-4 flex flex-col gap-2">
        {comments.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-ink/10 bg-white p-3 text-sm"
          >
            <div className="mb-1 text-xs text-ink/50">
              {formatDate(c.created_at)}
            </div>
            <p className="whitespace-pre-wrap text-ink">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-ink/50">Поки що без коментарів.</p>
        )}
      </div>

      <form onSubmit={handleComment} className="flex flex-col gap-2">
        <textarea
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder="Додати коментар (анонімно)…"
          rows={3}
          className="w-full rounded-xl border border-ink/15 bg-white p-3 text-sm outline-none focus:border-chalk focus:ring-2 focus:ring-chalk/20"
        />
        {error && <p className="text-sm text-flag">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-full bg-chalk px-4 py-2 text-sm font-medium text-paper transition hover:bg-chalk/90 disabled:opacity-50"
        >
          {submitting ? "Надсилаємо…" : "Коментувати"}
        </button>
      </form>
    </div>
  );
}
