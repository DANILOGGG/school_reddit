"use client";

import { useEffect, useState } from "react";
import { createClient, getClientUserId } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

// Вікно «Поділитись постом». Завантажується лише коли людина натисне кнопку,
// тож не обтяжує кожну картку у стрічці.
export default function ShareSheet({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [friends, setFriends] = useState<Profile[] | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const userId = await getClientUserId(supabase);
      if (!userId) return !cancelled && setFriends([]);

      const { data: friendships } = await supabase
        .from("friendships")
        .select(
          "requester_id, requester:profiles!friendships_requester_id_fkey(id, nickname, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, nickname, avatar_url)"
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      const list: Profile[] = (friendships ?? []).map((f: any) =>
        f.requester_id === userId ? f.addressee : f.requester
      );
      if (!cancelled) setFriends(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendToFriend(friendId: string) {
    const supabase = createClient();
    const userId = await getClientUserId(supabase);
    if (!userId) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
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

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
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
          <p className="mb-2 text-xs font-medium text-muted">Надіслати другу</p>
          {friends === null && (
            <p className="text-sm text-muted">Завантаження…</p>
          )}
          {friends !== null && friends.length === 0 && (
            <p className="text-sm text-muted">У тебе поки немає друзів.</p>
          )}
          <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
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
          onClick={onClose}
          className="mt-4 w-full rounded-full border border-border py-2 text-sm text-paper"
        >
          Закрити
        </button>
      </div>
    </div>
  );
}
