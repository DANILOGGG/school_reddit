"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function PostActions({
  postId,
  likeCount,
  repostCount,
  commentCount,
  liked,
  reposted,
}: {
  postId: string;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  liked: boolean;
  reposted: boolean;
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likes, setLikes] = useState(likeCount);
  const [isReposted, setIsReposted] = useState(reposted);
  const [reposts, setReposts] = useState(repostCount);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [friends, setFriends] = useState<Profile[] | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("likes")
      .insert({ post_id: postId, user_id: user.id });

    if (!error) {
      setIsLiked(true);
      setLikes((n) => n + 1);
    }
  }

  async function handleRepost(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isReposted) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("reposts")
      .insert({ post_id: postId, user_id: user.id });

    if (!error) {
      setIsReposted(true);
      setReposts((n) => n + 1);
    }
  }

  function handleShareClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShareOpen(true);
    if (friends === null) loadFriends();
  }

  async function loadFriends() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setFriends([]);

    const { data: friendships } = await supabase
      .from("friendships")
      .select(
        "*, requester:profiles!friendships_requester_id_fkey(*), addressee:profiles!friendships_addressee_id_fkey(*)"
      )
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    const list: Profile[] = (friendships ?? []).map((f: any) =>
      f.requester_id === user.id ? f.addressee : f.requester
    );
    setFriends(list);
  }

  async function sendToFriend(friendId: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: friendId,
      shared_post_id: postId,
    });

    if (!error) {
      setSentTo((prev) => new Set(prev).add(friendId));
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
        Поділитись
      </button>

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

      {shareOpen && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShareOpen(false);
          }}
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-2xl border border-border bg-surface p-5 sm:rounded-2xl"
          >
            <h3 className="mb-4 font-display text-lg text-paper">
              Поділитись постом
            </h3>
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surfaceRaised p-3 text-left text-paper hover:border-chalk"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              {copied ? "Скопійовано!" : "Скопіювати посилання"}
            </button>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted">
                Надіслати другу
              </p>
              {friends === null && (
                <p className="text-sm text-muted">Завантаження…</p>
              )}
              {friends !== null && friends.length === 0 && (
                <p className="text-sm text-muted">
                  У тебе поки немає друзів.
                </p>
              )}
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {friends?.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => sendToFriend(friend.id)}
                    disabled={sentTo.has(friend.id)}
                    className="flex items-center justify-between rounded-xl border border-border bg-surfaceRaised px-3 py-2 text-left text-sm text-paper transition hover:border-chalk disabled:opacity-50"
                  >
                    <span>{friend.nickname}</span>
                    <span className="text-xs text-mint">
                      {sentTo.has(friend.id) ? "Надіслано" : "Надіслати"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShareOpen(false)}
              className="mt-4 w-full rounded-full border border-border py-2 text-sm text-paper"
            >
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
