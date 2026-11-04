"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import EyeIcon from "@/components/EyeIcon";
import { formatCount } from "@/lib/format";
import { createClient, getClientUserId } from "@/lib/supabase/client";

// Вікно «Поділитись» вантажиться лише по кліку
const ShareSheet = dynamic(() => import("@/components/ShareSheet"));

export default function PostActions({
  postId,
  likeCount,
  repostCount,
  commentCount,
  liked,
  reposted,
  inGroup = false,
  viewCount = 0,
}: {
  postId: string;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  liked: boolean;
  reposted: boolean;
  inGroup?: boolean;
  viewCount?: number;
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likes, setLikes] = useState(likeCount);
  const [isReposted, setIsReposted] = useState(reposted);
  const [reposts, setReposts] = useState(repostCount);
  const [shareOpen, setShareOpen] = useState(false);

  // Лайк/репост змінюються ОДРАЗУ (оптимістично), а запит іде у фоні.
  // Якщо база відмовила (наприклад, бан) — повертаємо як було.
  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) return;

    setIsLiked(true);
    setLikes((n) => n + 1);

    const supabase = createClient();
    const userId = await getClientUserId(supabase);
    const { error } = userId
      ? await supabase.from("likes").insert({ post_id: postId, user_id: userId })
      : { error: { code: "no-user" } };

    if (error) {
      setLikes((n) => n - 1);
      // 23505 = лайк уже існує (наприклад, з іншої вкладки) — лишаємо «лайкнуто»
      if (error.code !== "23505") setIsLiked(false);
    }
  }

  async function handleRepost(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isReposted) return;

    setIsReposted(true);
    setReposts((n) => n + 1);

    const supabase = createClient();
    const userId = await getClientUserId(supabase);
    const { error } = userId
      ? await supabase.from("reposts").insert({ post_id: postId, user_id: userId })
      : { error: { code: "no-user" } };

    if (error) {
      setReposts((n) => n - 1);
      if (error.code !== "23505") setIsReposted(false);
    }
  }

  function handleShareClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShareOpen(true);
  }

  const btn =
    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition";

  return (
    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
      <button
        onClick={handleLike}
        className={`${btn} ${
          isLiked
            ? "bg-moss text-mint"
            : "text-muted hover:bg-surfaceRaised hover:text-paper"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"}>
          <path
            d="M12 21s-7-4.5-9.5-9C.7 8.2 2 4.8 5.3 4.1 7.6 3.6 9.8 4.6 12 7c2.2-2.4 4.4-3.4 6.7-2.9 3.3.7 4.6 4.1 2.8 7.9C19 16.5 12 21 12 21z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        {likes}
      </button>

      <Link
        href={`/post/${postId}`}
        onClick={(e) => e.stopPropagation()}
        className={`${btn} text-muted hover:bg-surfaceRaised hover:text-paper`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {commentCount}
      </Link>

      {!inGroup && (
      <button
        onClick={handleShareClick}
        className={`${btn} text-muted hover:bg-surfaceRaised hover:text-paper`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">Поділитись</span>
        <span className="sr-only sm:hidden">Поділитись</span>
      </button>
      )}

      {!inGroup && (
      <button
        onClick={handleRepost}
        className={`${btn} ml-auto ${
          isReposted
            ? "bg-moss text-mint"
            : "text-muted hover:bg-surfaceRaised hover:text-paper"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {reposts}
      </button>
      )}

      <span
        className={`flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted ${
          inGroup ? "ml-auto" : ""
        }`}
        title="Перегляди"
        aria-label={`Перегляди: ${viewCount}`}
      >
        <EyeIcon />
        {formatCount(viewCount)}
      </span>

      {shareOpen && (
        <ShareSheet postId={postId} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}
