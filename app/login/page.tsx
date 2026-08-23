"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  nicknameToEmail,
  validateNickname,
  validatePassword,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const nickError = validateNickname(nickname);
    if (nickError) return setError(nickError);
    const passError = validatePassword(password);
    if (passError) return setError(passError);

    setLoading(true);
    const supabase = createClient();
    const email = nicknameToEmail(nickname);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname: nickname.trim() } },
      });
      if (signUpError) {
        setLoading(false);
        if (signUpError.message.includes("already registered")) {
          return setError("Цей нік вже зайнятий. Спробуй інший або увійди.");
        }
        return setError("Не вдалося зареєструватись: " + signUpError.message);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setLoading(false);
        return setError("Невірний нік або пароль.");
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <h1 className="mb-1 text-center font-display text-2xl text-paper">
          Шкільна дошка
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          {mode === "login" ? "Увійди у свій акаунт" : "Створи новий акаунт"}
        </p>

        <div className="mb-5 flex rounded-full bg-surfaceRaised p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition ${
              mode === "login" ? "bg-chalk text-base" : "text-muted"
            }`}
          >
            Вхід
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition ${
              mode === "signup" ? "bg-chalk text-base" : "text-muted"
            }`}
          >
            Реєстрація
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Нік"
            className="w-full rounded-xl border border-border bg-surfaceRaised p-3 text-paper placeholder:text-muted outline-none focus:border-chalk"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full rounded-xl border border-border bg-surfaceRaised p-3 text-paper placeholder:text-muted outline-none focus:border-chalk"
          />

          {error && (
            <p className="rounded-lg bg-flag/10 p-2 text-sm text-flag">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-chalk py-2.5 font-medium text-base transition hover:bg-mint disabled:opacity-50"
          >
            {loading
              ? "Зачекай…"
              : mode === "login"
              ? "Увійти"
              : "Зареєструватись"}
          </button>
        </form>
      </div>
    </div>
  );
}
