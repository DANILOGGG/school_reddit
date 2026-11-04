"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Облік переглядів постів. Один спостерігач на весь сайт (а не по компоненту на
// кожну картку): шукає на сторінці елементи з data-view-post і бачить нові, коли
// стрічка підвантажується чи оновлюється.
//
// Пост вважається переглянутим, коли він був на екрані (видно хоча б половину)
// щонайменше пів секунди, тобто просто з'явився в стрічці, відкривати його не
// обов'язково. Id збираються й відправляються пачкою; ЗАХИСТ ВІД НАКРУТКИ —
// на сервері: функція record_post_views() рахує кожну людину по кожному посту
// один раз (оновлення сторінки нічого не додає), не рахує перегляди автора
// і заблокованих. Тут лише зменшуємо кількість зайвих запитів.
const SELECTOR = "[data-view-post]";
const DWELL_MS = 500;
const FLUSH_MS = 2000;
const STORAGE_KEY = "viewed_posts";

export default function ViewTracker() {
  useEffect(() => {
    const sent = new Set<string>();
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) saved.forEach((id) => sent.add(String(id)));
    } catch {}

    const pending = new Set<string>();
    const dwellTimers = new Map<Element, ReturnType<typeof setTimeout>>();
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    function persist() {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(sent).slice(-500)));
      } catch {}
    }

    async function flush() {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      if (pending.size === 0) return;

      const ids = Array.from(pending).slice(0, 50);
      ids.forEach((id) => pending.delete(id));
      try {
        const { error } = await createClient().rpc("record_post_views", {
          p_post_ids: ids,
        });
        if (error) ids.forEach((id) => sent.delete(id)); // спробуємо наступного разу
      } catch {
        ids.forEach((id) => sent.delete(id));
      }
      persist();
      if (pending.size > 0) schedule();
    }

    function schedule() {
      if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_MS);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const id = el.dataset.viewPost;
          if (!id) continue;

          // Високий пост (довший за пів екрана) теж зараховуємо, коли пів екрана видно
          const seen =
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.5 ||
              entry.intersectionRect.height >= window.innerHeight * 0.5);

          if (seen) {
            if (sent.has(id)) {
              io.unobserve(el);
              continue;
            }
            if (dwellTimers.has(el)) continue;
            dwellTimers.set(
              el,
              setTimeout(() => {
                dwellTimers.delete(el);
                if (document.visibilityState !== "visible") return;
                io.unobserve(el);
                if (!sent.has(id)) {
                  sent.add(id);
                  pending.add(id);
                  schedule();
                }
              }, DWELL_MS)
            );
          } else {
            const t = dwellTimers.get(el);
            if (t) {
              clearTimeout(t);
              dwellTimers.delete(el);
            }
          }
        }
      },
      { threshold: [0, 0.5] }
    );

    function observe(el: Element) {
      const id = (el as HTMLElement).dataset.viewPost;
      if (id && !sent.has(id)) io.observe(el);
    }

    document.querySelectorAll(SELECTOR).forEach(observe);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(SELECTOR)) observe(node);
          node.querySelectorAll(SELECTOR).forEach(observe);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    function onVisibility() {
      if (document.visibilityState === "hidden") flush();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      io.disconnect();
      mo.disconnect();
      dwellTimers.forEach((t) => clearTimeout(t));
      if (flushTimer) clearTimeout(flushTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
