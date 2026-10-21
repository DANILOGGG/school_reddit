import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import LiveFeed from "@/components/LiveFeed";
import { GroupAvatar } from "@/components/GroupCard";
import GroupJoinButton from "@/components/GroupJoinButton";
import GroupDeleteButton from "@/components/GroupDeleteButton";
import { checkIsAdmin } from "@/lib/admin";
import { subscribersLabel } from "@/lib/groups";
import type { Group, Post } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: groupRow }, userRes] = await Promise.all([
    supabase.from("groups").select("*").eq("id", params.id).single(),
    supabase.auth.getUser(),
  ]);
  if (!groupRow) return notFound();

  const group = groupRow as Group;
  const user = userRes.data.user;

  const [isAdmin, membership] = await Promise.all([
    checkIsAdmin(supabase, user?.id),
    user
      ? supabase
          .from("group_members")
          .select("user_id")
          .eq("group_id", group.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const isMember = !!membership.data;
  const isOwner = !!user && user.id === group.owner_id;
  const canRead = isMember || isAdmin;

  let posts: Post[] = [];
  const likedIds = new Set<string>();
  const repostedIds = new Set<string>();

  if (canRead) {
    const { data } = await supabase
      .from("posts")
      .select(
        "*, profiles!posts_user_id_fkey(*), likes(count), reposts(count), comments(count)"
      )
      .eq("group_id", group.id)
      .order("created_at", { ascending: false })
      .limit(50);
    posts = (data as Post[]) ?? [];

    if (user && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const [{ data: likes }, { data: reposts }] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
        supabase.from("reposts").select("post_id").eq("user_id", user.id).in("post_id", postIds),
      ]);
      (likes ?? []).forEach((l) => likedIds.add(l.post_id));
      (reposts ?? []).forEach((r) => repostedIds.add(r.post_id));
    }
  }

  return (
    <div>
      {canRead && <LiveFeed />}

      <div className="mb-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start gap-4">
          <GroupAvatar group={group} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl text-paper">{group.name}</h1>
            <p className="mt-0.5 text-sm text-muted">
              {subscribersLabel(group.member_count)}
              {isOwner && " · ти адмін групи"}
            </p>
          </div>
        </div>

        {group.description && (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-paper">
            {group.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!isOwner && (
            <GroupJoinButton groupId={group.id} initialMember={isMember} />
          )}
          {isOwner && (
            <>
              <Link
                href={`/g/${group.id}/new`}
                className="rounded-full bg-chalk px-4 py-2 text-sm font-medium text-base transition hover:bg-mint"
              >
                + Новий пост
              </Link>
              <Link
                href={`/g/${group.id}/edit`}
                className="rounded-full border border-border px-4 py-2 text-sm text-paper hover:border-chalk"
              >
                Редагувати
              </Link>
            </>
          )}
          {(isOwner || isAdmin) && (
            <GroupDeleteButton groupId={group.id} groupName={group.name} />
          )}
        </div>
      </div>

      {!canRead ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          Пости цієї групи бачать лише підписники. Підпишись, щоб читати,
          лайкати й коментувати.
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          У групі поки що немає постів.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={likedIds.has(post.id)}
              reposted={repostedIds.has(post.id)}
              isAdmin={isAdmin || isOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
