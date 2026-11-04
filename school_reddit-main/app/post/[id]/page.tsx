import { createClient, getIsAdmin, getUser } from "@/lib/supabase/server";
import { POST_SELECT } from "@/lib/queries";
import PostDetail from "@/components/PostDetail";
import type { Comment, Post } from "@/lib/types";
import { notFound } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const COMMENT_SELECT =
  "id, post_id, created_at, body, is_anonymous, author_name, user_id, gif_url, " +
  "profiles!comments_user_id_fkey(id, nickname, avatar_url), comment_likes(count)";

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Пост, коментарі та користувач — одночасно (раніше йшли по черзі).
  const [{ data: post }, { data: comments }, user] = await Promise.all([
    supabase.from("posts").select(POST_SELECT).eq("id", params.id).single(),
    supabase
      .from("comments")
      .select(COMMENT_SELECT)
      .eq("post_id", params.id)
      .order("created_at", { ascending: true }),
    getUser(),
  ]);

  if (!post) return notFound();
  const typedPost = post as unknown as Post;

  // Адмін-перевірка і група — теж одночасно
  const [siteAdmin, groupRes] = await Promise.all([
    getIsAdmin(user?.id),
    typedPost.group_id
      ? supabase
          .from("groups")
          .select("id, name, owner_id")
          .eq("id", typedPost.group_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  // Пост з групи: показуємо посилання назад і даємо власнику групи модерувати
  let group: { id: string; name: string } | null = null;
  let isGroupOwner = false;
  const g = groupRes.data;
  if (g) {
    group = { id: g.id, name: g.name };
    isGroupOwner = !!user && g.owner_id === user.id;
  }
  const isAdmin = siteAdmin || isGroupOwner;

  const typedComments = (comments as unknown as Comment[]) ?? [];

  let liked = false;
  let reposted = false;
  let likedCommentIds: string[] = [];
  if (user) {
    const commentIds = typedComments.map((c) => c.id);
    const [{ data: like }, { data: repost }, commentLikes] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", user.id).eq("post_id", params.id).maybeSingle(),
      supabase.from("reposts").select("post_id").eq("user_id", user.id).eq("post_id", params.id).maybeSingle(),
      // Лише лайки під ЦИМ постом (раніше тягнулися всі лайки коментарів користувача за весь час)
      commentIds.length > 0
        ? supabase
            .from("comment_likes")
            .select("comment_id")
            .eq("user_id", user.id)
            .in("comment_id", commentIds)
        : Promise.resolve({ data: [] as { comment_id: string }[] }),
    ]);
    liked = !!like;
    reposted = !!repost;
    likedCommentIds = (commentLikes.data ?? []).map((c) => c.comment_id);
  }

  return (
    <PostDetail
      post={typedPost}
      initialComments={typedComments}
      liked={liked}
      reposted={reposted}
      likedCommentIds={likedCommentIds}
      isAdmin={isAdmin}
      group={group}
    />
  );
}
