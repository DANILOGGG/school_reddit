"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FriendshipStatus } from "@/lib/types";

export default function FriendButton({
  profileId,
  friendshipId,
  initialStatus,
}: {
  profileId: string;
  friendshipId: string | null;
  initialStatus: FriendshipStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [id, setId] = useState(friendshipId);
  const [busy, setBusy] = useState(false);

  async function sendRequest() {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setBusy(false);

    const { data, error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: profileId })
      .select()
      .single();

    setBusy(false);
    if (!error && data) {
      setId(data.id);
      setStatus("pending_sent");
    }
  }

  async function acceptRequest() {
    if (!id) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", id);
    setBusy(false);
    if (!error) setStatus("friends");
  }

  async function cancelOrUnfriend() {
    if (!id) return;
    if (status === "friends" && !confirm("Видалити з друзів?")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("friendships").delete().eq("id", id);
    setBusy(false);
    if (!error) {
      setId(null);
      setStatus("none");
    }
  }

  const base =
    "rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50";

  if (status === "none") {
    return (
      <button onClick={sendRequest} disabled={busy} className={`${base} bg-chalk text-base hover:bg-mint`}>
        Додати в друзі
      </button>
    );
  }

  if (status === "pending_sent") {
    return (
      <button onClick={cancelOrUnfriend} disabled={busy} className={`${base} border border-border text-muted`}>
        Заявку надіслано
      </button>
    );
  }

  if (status === "pending_received") {
    return (
      <button onClick={acceptRequest} disabled={busy} className={`${base} bg-chalk text-base hover:bg-mint`}>
        Прийняти заявку
      </button>
    );
  }

  return (
    <button onClick={cancelOrUnfriend} disabled={busy} className={`${base} border border-chalk text-mint`}>
      Ви друзі
    </button>
  );
}
