"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Автооновлення стрічки.
// - Новий пост з'являється миттєво (Supabase Realtime), якщо ти вгорі сторінки.
// - Якщо ти прокрутив вниз — не смикаємо стрічку, а показуємо кнопку «Є нові пости».
// - Коли повертаєшся на вкладку, а також раз на хвилину (про запас) стрічка оновлюється.
export default function LiveFeed() {
  const router = useRouter();
  const [hasNew, setHasNew] = useState(false);
  const lastRefresh = useRef(Date.now());
  const missed = useRef(false);

  const refreshNow = useCallback(() => {
    lastRefresh.current = Date.now();
    missed.current = false;
    setHasNew(false);
    router.refresh();
  }, [router]);

  useEffect(() => {
    const supabase = createClient();

    function onPostsChanged() {
      if (document.visibilityState !== "visible") {
        missed.current = true;
        return;
      }
      if (window.scrollY < 150) refreshNow();
      else setHasNew(true);
    }

    const channel = supabase
      .channel("feed-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        onPostsChanged
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        onPostsChanged
      )
      .subscribe();

    function onVisible() {
      if (document.visibilityState !== "visible") return;
      if (missed.current || Date.now() - lastRefresh.current > 30_000) {
        refreshNow();
      }
    }
    document.addEventListener("visibilitychange", onVisible);

    // Запасний варіант, якщо realtime раптом не спрацює
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && window.scrollY < 150) {
        refreshNow();
      }
    }, 60_000);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, [refreshNow]);

  if (!hasNew) return null;

  return (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        refreshNow();
      }}
      className="fixed left-1/2 top-20 z-10 -translate-x-1/2 rounded-full bg-chalk px-4 py-2 text-sm font-medium text-base shadow-lg transition hover:bg-mint"
    >
      ↑ Є нові пости
    </button>
  );
}
