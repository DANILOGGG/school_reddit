import { createClient } from "@/lib/supabase/server";
import PostDetail from "@/components/PostDetail";
import type { Comment, Post } from "@/lib/types";
import { notFound } from "next/navigation";

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
    .select("*, profiles!comments_user_id_fkey(*)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let liked = false;
  let reposted = false;
  if (user) {
    const [{ data: like }, { data: repost }] = await Promise.all([
      supabase.from("likes").select("post_id").eq("user_id", user.id).eq("post_id", params.id).maybeSingle(),
      supabase.from("reposts").select("post_id").eq("user_id", user.id).eq("post_id", params.id).maybeSingle(),
    ]);
    liked = !!like;
    reposted = !!repost;
  }

  return (
    <PostDetail
      post={post as Post}
      initialComments={(comments as Comment[]) ?? []}
      liked={liked}
      reposted={reposted}
    />
  );
}
