import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import FriendButton from "@/components/FriendButton";
import type { FriendshipStatus, Post, Profile } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: { nickname: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("nickname", params.nickname)
    .single();

  if (!profile) return notFound();

  // Чужі анонімні пости не показуємо нікому, крім самого автора (той бачить
  // їх на /profile, не тут).
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles!posts_user_id_fkey(*), likes(count), reposts(count), comments(count)")
    .eq("user_id", profile.id)
    .eq("is_anonymous", false)
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let friendshipId: string | null = null;
  let friendStatus: FriendshipStatus = "none";
  const isOwnProfile = user?.id === profile.id;

  if (user && !isOwnProfile) {
    const { data: friendship } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`
      )
      .maybeSingle();

    if (friendship) {
      friendshipId = friendship.id;
      if (friendship.status === "accepted") {
        friendStatus = "friends";
      } else if (friendship.requester_id === user.id) {
        friendStatus = "pending_sent";
      } else {
        friendStatus = "pending_received";
      }
    }
  }

  let likedIds = new Set<string>();
  let repostedIds = new Set<string>();
  if (user && posts && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const [{ data: likes }, { data: reposts }] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
      supabase.from("reposts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
    ]);
    likedIds = new Set((likes ?? []).map((l) => l.post_id));
    repostedIds = new Set((reposts ?? []).map((r) => r.post_id));
  }

  const typedProfile = profile as Profile;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-chalk bg-surfaceRaised">
          {typedProfile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typedProfile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-mint">
              {typedProfile.nickname[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h1 className="font-display text-xl text-paper">{typedProfile.nickname}</h1>
          <p className="text-sm text-muted">{posts?.length ?? 0} постів</p>
        </div>
      </div>

      {user && !isOwnProfile && (
        <div className="mb-6">
          <FriendButton
            profileId={typedProfile.id}
            friendshipId={friendshipId}
            initialStatus={friendStatus}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {(posts as Post[] | null)?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={likedIds.has(post.id)}
            reposted={repostedIds.has(post.id)}
          />
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-sm text-muted">Тут ще немає постів.</p>
        )}
      </div>
    </div>
  );
}
