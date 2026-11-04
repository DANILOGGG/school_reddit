"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Автооновлення стрічки.
// - Новий пост з'являється (Supabase Realtime), якщо ти вгорі сторінки.
// - Якщо ти прокрутив вниз — не смикаємо стрічку, а показуємо кнопку «Є нові пости».
// - Коли повертаєшся на вкладку після довгої перерви, стрічка оновлюється.
//
// Що змінено для швидкості: router.refresh() перезапускає ВЕСЬ рендер сторінки
// на сервері (авторизація, меню, 4+ запити до бази). Раніше він викликався
// щохвилини у кожного відкритого вікна та на кожен новий пост без паузи.
// Тепер: без хвилинного опитування (realtime і так працює), події групуються
// в один refresh, а на вкладці у фоні refresh не виконується взагалі.
const REFRESH_DEBOUNCE_MS = 1500;
const STALE_AFTER_MS = 2 * 60_000;

export default function LiveFeed() {
  const router = useRouter();
  const [hasNew, setHasNew] = useState(false);
  const lastRefresh = useRef(Date.now());
  const missed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshNow = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
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
      if (window.scrollY >= 150) {
        setHasNew(true);
        return;
      }
      // Кілька подій поспіль (хтось видалив пачку постів) — один refresh
      if (timer.current) return;
      timer.current = setTimeout(refreshNow, REFRESH_DEBOUNCE_MS);
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
      if (missed.current || Date.now() - lastRefresh.current > STALE_AFTER_MS) {
        refreshNow();
      }
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      if (timer.current) clearTimeout(timer.current);
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
