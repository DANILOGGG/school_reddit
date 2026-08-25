import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AcceptFriendButton from "@/components/AcceptFriendButton";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ActivityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Заявки в друзі, які чекають на відповідь
  const { data: requests } = await supabase
    .from("friendships")
    .select("*, requester:profiles!friendships_requester_id_fkey(*)")
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  // 2. Мої пости, щоб знайти коментарі до них
  const { data: myPosts } = await supabase
    .from("posts")
    .select("id")
    .eq("user_id", user.id);
  const myPostIds = (myPosts ?? []).map((p) => p.id);

  const { data: comments } =
    myPostIds.length > 0
      ? await supabase
          .from("comments")
          .select("*, profiles!comments_user_id_fkey(*)")
          .in("post_id", myPostIds)
          .neq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)
      : { data: [] };

  // 3. Непрочитані повідомлення, згруповані по відправнику
  const { data: unread } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(*)")
    .eq("receiver_id", user.id)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  const unreadBySender = new Map<string, { nickname: string; count: number }>();
  for (const m of unread ?? []) {
    const sender = (m as any).sender;
    if (!sender) continue;
    const existing = unreadBySender.get(sender.id);
    if (existing) existing.count += 1;
    else unreadBySender.set(sender.id, { nickname: sender.nickname, count: 1 });
  }

  const hasNothing =
    (!requests || requests.length === 0) &&
    (!comments || comments.length === 0) &&
    unreadBySender.size === 0;

  return (
    <div>
      <h1 className="mb-4 font-display text-xl text-paper">Активність</h1>

      {hasNothing && (
        <p className="text-sm text-muted">Поки що нічого нового.</p>
      )}

      {unreadBySender.size > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-muted">
            Нові повідомлення
          </h2>
          <div className="flex flex-col gap-2">
            {[...unreadBySender.entries()].map(([senderId, info]) => (
              <Link
                key={senderId}
                href={`/friends/${senderId}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 transition hover:border-chalk/60"
              >
                <span className="text-paper">
                  <span className="font-medium">{info.nickname}</span>{" "}
                  надіслав(-ла) тобі повідомлення
                </span>
                <span className="rounded-full bg-chalk px-2 py-0.5 text-xs font-medium text-base">
                  {info.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {requests && requests.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-muted">Заявки в друзі</h2>
          <div className="flex flex-col gap-2">
            {requests.map((r: any) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
              >
                <Link
                  href={`/u/${r.requester.nickname}`}
                  className="text-paper hover:underline"
                >
                  <span className="font-medium">{r.requester.nickname}</span>{" "}
                  додав(-ла) тебе в друзі
                </Link>
                <AcceptFriendButton friendshipId={r.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {comments && comments.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted">Коментарі</h2>
          <div className="flex flex-col gap-2">
            {comments.map((c: any) => (
              <Link
                key={c.id}
                href={`/post/${c.post_id}`}
                className="block rounded-xl border border-border bg-surface p-3 transition hover:border-chalk/60"
              >
                <p className="text-paper">
                  <span className="font-medium">
                    {c.profiles?.nickname ?? "Користувач"}
                  </span>{" "}
                  прокоментував(-ла) твій пост
                </p>
                <p className="mt-1 truncate text-sm text-muted">{c.body}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(c.created_at)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
