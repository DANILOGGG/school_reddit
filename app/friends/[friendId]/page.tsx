import { createClient } from "@/lib/supabase/server";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Перевіряємо, що це справді прийнятий друг — інакше показувати чат не можна.
  const { data: friendship } = await supabase
    .from("friendships")
    .select("*")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${params.friendId}),and(requester_id.eq.${params.friendId},addressee_id.eq.${user.id})`
    )
    .maybeSingle();

  if (!friendship) return notFound();

  const { data: friend } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.friendId)
    .single();

  if (!friend) return notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select(
      "*, shared_post:shared_post_id(*, profiles!posts_user_id_fkey(*))"
    )
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${params.friendId}),and(sender_id.eq.${params.friendId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })
    .limit(100);

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
      initialMessages={(messages as Message[]) ?? []}
    />
  );
}
