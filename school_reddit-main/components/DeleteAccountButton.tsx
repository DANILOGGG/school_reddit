"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Кнопка «Видалити акаунт» на екрані бану.
// Видалення робить функція бази delete_own_account() (security definer): вона
// видаляє ЛИШЕ акаунт того, хто її викликає, а всі пов'язані дані (пости,
// коментарі, лайки, друзі, повідомлення, групи, сам бан) прибираються каскадом.
export default function DeleteAccountButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    const supabase = createClient();

    const { error: rpcError } = await supabase.rpc("delete_own_account");
    if (rpcError) {
      setBusy(false);
      setError("Не вдалося видалити акаунт. Спробуй ще раз.");
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // акаунта вже немає — сесія й так недійсна
    }
    try {
      localStorage.removeItem("sf_has_account");
    } catch {}
    // Повне перезавантаження, щоб нічого зі старої сесії не лишилось у пам'яті
    window.location.assign("/login?mode=register");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="mt-8 w-full rounded-full bg-flag px-6 py-3 font-medium text-white transition hover:opacity-90 sm:w-auto"
      >
        Видалити акаунт
      </button>
      <button
        onClick={handleLogout}
        className="mt-4 text-sm text-muted underline-offset-2 hover:text-paper hover:underline"
      >
        Вийти з акаунту
      </button>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => !busy && setConfirmOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 text-left"
          >
            <h3 className="mb-2 font-display text-lg text-paper">
              Видалити акаунт назавжди?
            </h3>
            <p className="mb-4 text-sm text-muted">
              Усі твої пости, коментарі, лайки, друзі та повідомлення буде
              видалено. Це не можна скасувати. Після цього ти зможеш створити
              новий акаунт.
            </p>
            {error && (
              <p className="mb-3 rounded-lg bg-flag/10 p-2 text-sm text-flag">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                className="flex-1 rounded-full border border-border py-2 text-sm text-paper disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="flex-1 rounded-full bg-flag py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? "Видаляємо…" : "Так, видалити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
