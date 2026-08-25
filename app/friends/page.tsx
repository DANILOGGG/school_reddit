import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Profile } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: friendships } = await supabase
    .from("friendships")
    .select(
      "*, requester:profiles!friendships_requester_id_fkey(*), addressee:profiles!friendships_addressee_id_fkey(*)"
    )
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  const friends: Profile[] = (friendships ?? []).map((f: any) =>
    f.requester_id === user.id ? f.addressee : f.requester
  );

  return (
    <div>
      <h1 className="mb-4 font-display text-xl text-paper">Друзі</h1>
      {friends.length === 0 && (
        <p className="text-sm text-muted">
          У тебе поки немає друзів. Зайди на чийсь профіль і натисни
          &laquo;Додати в друзі&raquo;.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {friends.map((friend) => (
          <Link
            key={friend.id}
            href={`/friends/${friend.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-chalk/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-chalk bg-surfaceRaised">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
