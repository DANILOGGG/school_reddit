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
    .select("*, profiles(*)")
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
