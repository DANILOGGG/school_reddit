"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, getClientUserId } from "@/lib/supabase/client";

export default function GroupJoinButton({
  groupId,
  initialMember,
}: {
  groupId: string;
  initialMember: boolean;
}) {
  const router = useRouter();
  const [member, setMember] = useState(initialMember);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const supabase = createClient();
    const userId = await getClientUserId(supabase);
    const user = userId ? { id: userId } : null;
    if (!user) {
      setBusy(false);
      return;
    }

    const { error } = member
      ? await supabase
          .from("group_members")
          .delete()
          .eq("group_id", groupId)
          .eq("user_id", user.id)
      : await supabase
          .from("group_members")
          .insert({ group_id: groupId, user_id: user.id });

    setBusy(false);
    if (error) {
      alert("Не вдалося виконати дію: " + error.message);
      return;
    }
    setMember(!member);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
        member
          ? "border border-border bg-surface text-muted hover:border-flag hover:text-flag"
          : "bg-chalk text-base hover:bg-mint"
      }`}
    >
      {member ? "Відписатися" : "Підписатися"}
    </button>
  );
}
