"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Message, Profile } from "@/lib/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatClient({
  currentUserId,
  friend,
  initialMessages,
}: {
  currentUserId: string;
  friend: Profile;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${[currentUserId, friend.id].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          const isThisChat =
            (msg.sender_id === currentUserId && msg.receiver_id === friend.id) ||
            (msg.sender_id === friend.id && msg.receiver_id === currentUserId);
          if (isThisChat) {
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, friend.id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setSending(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({ sender_id: currentUserId, receiver_id: friend.id, body })
      .select()
      .single();
    setSending(false);

    if (!error && data) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]
      );
      setBody("");
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-3 flex items-center gap-3 border-b border-border pb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-chalk bg-surfaceRaised">
          {friend.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={friend.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-mint">
              {friend.nickname[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <span className="font-medium text-paper">{friend.nickname}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 pb-2">
          {messages.map((m) => {
            const isMine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  isMine
                    ? "ml-auto bg-chalk text-base"
                    : "bg-surface text-paper"
                }`}
              >
                {m.shared_post && (
                  <Link
                    href={`/post/${m.shared_post.id}`}
                    className={`mb-1 block rounded-lg border p-2 text-xs ${
                      isMine
                        ? "border-base/30 bg-base/10"
                        : "border-border bg-surfaceRaised"
                    }`}
                  >
                    <span className="line-clamp-2">
                      {m.shared_post.body.slice(0, 80)}
                    </span>
                  </Link>
                )}
                {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                <span
                  className={`mt-1 block text-[10px] ${
                    isMine ? "text-base/70" : "text-muted"
                  }`}
                >
                  {formatTime(m.created_at)}
                </span>
              </div>
            );
          })}
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted">
              Напишіть перше повідомлення
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Повідомлення…"
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm text-paper placeholder:text-muted outline-none focus:border-chalk"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-chalk px-4 py-2 text-sm font-medium text-base disabled:opacity-50"
        >
          Надіслати
        </button>
      </form>
    </div>
  );
}
