"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Ban } from "@/lib/types";
import { BAN_OPTIONS, formatBanUntil, isBanActive } from "@/lib/admin";

export default function AdminUserPanel({
  userId,
  nickname,
  initialBan,
}: {
  userId: string;
  nickname: string;
  initialBan: Ban | null;
}) {
  const router = useRouter();
  const [ban, setBan] = useState<Ban | null>(initialBan);
  const [optionIndex, setOptionIndex] = useState(1);
  const [reason, setReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const banned = isBanActive(ban);

  async function handleBan() {
    setError(null);
    setBusy(true);
    const option = BAN_OPTIONS[optionIndex];
    const bannedUntil =
      option.hours === null
        ? null
        : new Date(Date.now() + option.hours * 3600 * 1000).toISOString();

    const supabase = createClient();
    const { data, error: upsertError } = await supabase
      .from("bans")
      .upsert({
        user_id: userId,
        banned_until: bannedUntil,
        reason: reason.trim() || null,
      })
      .select()
      .single();
    setBusy(false);

    if (upsertError) {
      setError("Не вдалося забанити: " + upsertError.message);
      return;
    }
    setBan(data as Ban);
    setReason("");
  }

  async function handleUnban() {
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("bans")
      .delete()
      .eq("user_id", userId);
    setBusy(false);

    if (deleteError) {
      setError("Не вдалося зняти бан: " + deleteError.message);
      return;
    }
    setBan(null);
  }

  async function handleDeleteAccount() {
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("admin_delete_user", {
      target: userId,
    });
    setBusy(false);

    if (rpcError) {
      setDeleteOpen(false);
      setError("Не вдалося видалити акаунт: " + rpcError.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mb-6 rounded-2xl border border-gold/40 bg-surface p-4">
      <h2 className="mb-3 flex items-center gap-2 font-display text-base text-gold">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        Адмін-панель
      </h2>

      {banned ? (
        <div className="mb-3 rounded-xl bg-flag/10 p-3 text-sm text-flag">
          <p className="font-medium">
            Забанений {formatBanUntil(ban!.banned_until)}
          </p>
          {ban!.reason && (
            <p className="mt-1 text-xs text-flag/80">Причина: {ban!.reason}</p>
          )}
          <button
            onClick={handleUnban}
            disabled={busy}
            className="mt-2 rounded-full border border-flag/50 px-3 py-1 text-xs text-flag hover:bg-flag/10 disabled:opacity-50"
          >
            Зняти бан
          </button>
        </div>
      ) : (
        <p className="mb-3 text-sm text-muted">Користувач не забанений.</p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <select
            value={optionIndex}
            onChange={(e) => setOptionIndex(Number(e.target.value))}
            className="rounded-xl border border-border bg-surfaceRaised px-3 py-2 text-sm text-paper outline-none focus:border-chalk"
          >
            {BAN_OPTIONS.map((o, i) => (
              <option key={o.label} value={i}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Причина (необов'язково)"
            className="min-w-0 flex-1 rounded-xl border border-border bg-surfaceRaised px-3 py-2 text-sm text-paper placeholder:text-muted outline-none focus:border-chalk"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleBan}
            disabled={busy}
            className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-base disabled:opacity-50"
          >
            {banned ? "Змінити бан" : "Забанити"}
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            disabled={busy}
            className="rounded-full border border-flag/60 px-4 py-2 text-sm text-flag hover:bg-flag/10 disabled:opacity-50"
          >
            Видалити акаунт
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-flag">{error}</p>}

      {deleteOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-flag/40 bg-surface p-5">
            <h3 className="mb-2 font-display text-lg text-flag">
              Видалити акаунт «{nickname}»?
            </h3>
            <p className="mb-4 text-sm text-muted">
              Усі пости, коментарі та повідомлення цього користувача будуть
              видалені назавжди. Це не можна скасувати.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 rounded-full border border-border py-2 text-sm text-paper"
              >
                Скасувати
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={busy}
                className="flex-1 rounded-full bg-flag py-2 text-sm font-medium text-paper disabled:opacity-50"
              >
                {busy ? "Видаляємо…" : "Видалити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
