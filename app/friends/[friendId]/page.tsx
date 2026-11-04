import { createClient, getUser } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ChatClient from "@/components/ChatClient";
import type { Message, Profile } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: { friendId: string };
}) {
  const supabase = createClient();
  const user = await getUser();
  if (!user) redirect("/login");

  // Перевіряємо, що це справді прийнятий друг — інакше показувати чат не можна.
  // Профіль друга й повідомлення вантажимо паралельно з перевіркою дружби;
  // віддаємо їх лише якщо дружба підтверджена.
  const [{ data: friendship }, { data: friend }, { data: messages }] =
    await Promise.all([
      supabase
        .from("friendships")
        .select("id")
        .eq("status", "accepted")
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${params.friendId}),and(requester_id.eq.${params.friendId},addressee_id.eq.${user.id})`
        )
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, nickname, avatar_url, created_at")
        .eq("id", params.friendId)
        .single(),
      supabase
        .from("messages")
        .select(
          "*, shared_post:shared_post_id(*, profiles!posts_user_id_fkey(id, nickname, avatar_url))"
        )
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${params.friendId}),and(sender_id.eq.${params.friendId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  if (!friendship || !friend) return notFound();

  // Позначаємо вхідні повідомлення прочитаними.
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", user.id)
    .eq("sender_id", params.friendId)
    .is("read_at", null);

  return (
    <ChatClient
      currentUserId={user.id}
      friend={friend as Profile}
      initialMessages={((messages as unknown as Message[]) ?? []).reverse()}
    />
  );
}
