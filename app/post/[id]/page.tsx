import { createClient } from "@/lib/supabase/server";
import PostDetail from "@/components/PostDetail";
import type { Comment, Post } from "@/lib/types";
import { notFound } from "next/navigation";
import { checkIsAdmin } from "@/lib/admin";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles!posts_user_id_fkey(*), likes(count), reposts(count), comments(count)")
    .eq("id", params.id)
    .single();

  if (!post) return notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles!comments_user_id_fkey(*), comment_likes(count)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const siteAdmin = await checkIsAdmin(supabase, user?.id);

  // Пост з групи: показуємо посилання назад і даємо власнику групи модерувати
  let group: { id: string; name: string } | null = null;
  let isGroupOwner = false;
  if (post.group_id) {
    const { data: g } = await supabase
      .from("groups")
      .select("id, name, owner_id")
      .eq("id", post.group_id)
      .single();
    if (g) {
      group = { id: g.id, name: g.name };
      isGroupOwner = !!user && g.owner_id === user.id;
    }
  }
  const isAdmin = siteAdmin || isGroupOwner;

  let liked = false;
  let reposted = false;
  let likedCommentIds: string[] = [];
  if (user) {
    const [{ data: like }, { data: repost }, { data: commentLikes }] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", user.id).eq("post_id", params.id).maybeSingle(),
      supabase.from("reposts").select("post_id").eq("user_id", user.id).eq("post_id", params.id).maybeSingle(),
      supabase.from("comment_likes").select("comment_id").eq("user_id", user.id),
    ]);
    liked = !!like;
    reposted = !!repost;
    likedCommentIds = (commentLikes ?? []).map((c) => c.comment_id);
  }

  return (
    <PostDetail
      post={post as Post}
      initialComments={(comments as Comment[]) ?? []}
      liked={liked}
      reposted={reposted}
      likedCommentIds={likedCommentIds}
      isAdmin={isAdmin}
      group={group}
    />
  );
}
