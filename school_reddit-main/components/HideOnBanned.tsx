"use client";

import { usePathname } from "next/navigation";

// На екрані бану верхнє меню не потрібне (всі його посилання все одно ведуть назад на бан).
export default function HideOnBanned({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/banned")) return null;
  return <>{children}</>;
}
