"use client";

import { useEffect } from "react";

// Рахує унікальних відвідувачів сайту (навіть тих, хто ще не зареєструвався).
// Кожному браузеру дається випадковий id; за одну сесію вкладки рахуємо один раз.
//
// Для швидкості: Supabase-клієнт підвантажується окремим шматком коду і лише
// коли браузер вільний (після відмальовки сторінки), щоб лічильник
// не гальмував перше відкриття сайту.
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("visit_tracked")) return;

      let id = localStorage.getItem("visitor_id");
      if (!id) {
        id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
              });
        localStorage.setItem("visitor_id", id);
      }
      sessionStorage.setItem("visit_tracked", "1");
      const visitorId = id;

      const send = () => {
        import("@/lib/supabase/client")
          .then(({ createClient }) =>
            createClient().rpc("track_visit", { p_visitor: visitorId })
          )
          .then(() => {})
          .catch(() => {});
      };

      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (w.requestIdleCallback) w.requestIdleCallback(send, { timeout: 4000 });
      else setTimeout(send, 2000);
    } catch {
      // сховище може бути недоступне — тоді просто не рахуємо
    }
  }, []);

  return null;
}
