"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function GroupDeleteButton({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Видалити групу «${groupName}» разом з усіма її постами? Це не можна скасувати.`
      )
    ) {
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) {
      setBusy(false);
      alert("Не вдалося видалити групу: " + error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="rounded-full border border-flag/50 px-4 py-2 text-sm text-flag hover:bg-flag/10 disabled:opacity-50"
    >
      {busy ? "Видаляємо…" : "Видалити групу"}
    </button>
  );
}
