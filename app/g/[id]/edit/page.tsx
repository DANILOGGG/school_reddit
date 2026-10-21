import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GroupForm from "@/components/GroupForm";
import type { Group } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditGroupPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data: group }, userRes] = await Promise.all([
    supabase.from("groups").select("*").eq("id", params.id).single(),
    supabase.auth.getUser(),
  ]);

  if (!group) return notFound();
  if (!userRes.data.user || userRes.data.user.id !== group.owner_id) {
    redirect(`/g/${params.id}`);
  }

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl text-paper">Редагувати групу</h1>
      <GroupForm group={group as Group} />
    </div>
  );
}
