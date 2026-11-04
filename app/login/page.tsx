"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  nicknameToEmail,
  validateNickname,
  validatePassword,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  // Нова людина бачить РЕЄСТРАЦІЮ (раніше першим відкривався вхід, і всі плутались).
  // Вхід відкривається першим лише на пристрої, де вже був акаунт (див. useEffect),
  // або за явним посиланням /login?mode=login.
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [ready, setReady] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("mode");
      if (param === "login") setMode("login");
      else if (param === "register" || param === "signup") setMode("signup");
      else if (localStorage.getItem("sf_has_account")) setMode("login");
    } catch {
      // сховище недоступне — лишаємо реєстрацію
    }
    setReady(true);
  }, []);

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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname: nickname.trim() } },
      });
      if (signUpError) {
        setLoading(false);
        const msg = signUpError.message;
        // Нік зайнятий: або e-mail уже є, або профіль із таким ніком уже створено
        if (msg.includes("already registered") || msg.includes("Database error")) {
          return setError("Цей нік вже зайнятий. Спробуй інший або увійди.");
        }
        return setError("Не вдалося зареєструватись: " + msg);
      }
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setLoading(false);
        return setError("Цей нік вже зайнятий. Спробуй інший або увійди.");
      }

      // Якщо Supabase одразу видав сесію — користувач уже залогінений.
      // Якщо ні — входимо тими ж даними, щоб після реєстрації він потрапив на сайт.
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setLoading(false);
          setMode("login");
          return setError("Акаунт створено, але автоматичний вхід не вдався. Натисни «Увійти».");
        }
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

    try {
      localStorage.setItem("sf_has_account", "1");
    } catch {}

    router.push("/");
    router.refresh();
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-base px-4 transition-opacity ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
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

        <p className="mt-4 text-center text-sm text-muted">
          {mode === "signup" ? "Вже є акаунт?" : "Ще немає акаунта?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "signup" ? "login" : "signup");
            }}
            className="font-medium text-mint hover:underline"
          >
            {mode === "signup" ? "Увійти" : "Зареєструватись"}
          </button>
        </p>
      </div>
    </div>
  );
}
