import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/PostForm";

export const dynamic = "force-dynamic";

export default async function NewGroupPostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data: group }, userRes] = await Promise.all([
    supabase.from("groups").select("id, name, owner_id").eq("id", params.id).single(),
    supabase.auth.getUser(),
  ]);

  if (!group) return notFound();
  if (!userRes.data.user || userRes.data.user.id !== group.owner_id) {
    redirect(`/g/${params.id}`);
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl text-paper">Новий пост</h1>
      <p className="mb-4 text-sm text-muted">Група «{group.name}»</p>
      <PostForm groupId={group.id} />
    </div>
  );
}
