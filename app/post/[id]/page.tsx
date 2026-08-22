import { supabase } from "@/lib/supabaseClient";
import PostDetail from "@/components/PostDetail";
import type { Comment, Post } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!post) return notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <PostDetail
      post={post as Post}
      initialComments={(comments as Comment[]) ?? []}
    />
  );
}
