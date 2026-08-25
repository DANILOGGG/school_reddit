"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AcceptFriendButton({
  friendshipId,
}: {
  friendshipId: string;
}) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleAccept() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    setBusy(false);
    if (!error) setDone(true);
  }

  if (done) {
    return <span className="text-sm text-mint">Прийнято</span>;
  }

  return (
    <button
      onClick={handleAccept}
      disabled={busy}
      className="rounded-full bg-chalk px-3 py-1.5 text-xs font-medium text-base transition hover:bg-mint disabled:opacity-50"
    >
      Прийняти
    </button>
  );
}
