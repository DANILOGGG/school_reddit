"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Рахує унікальних відвідувачів сайту (навіть тих, хто ще не зареєструвався).
// Кожному браузеру дається випадковий id; за одну сесію вкладки рахуємо один раз.
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

      createClient()
        .rpc("track_visit", { p_visitor: id })
        .then(() => {});
    } catch {
      // сховище може бути недоступне — тоді просто не рахуємо
    }
  }, []);

  return null;
}
