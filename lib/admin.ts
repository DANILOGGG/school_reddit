import type { SupabaseClient } from "@supabase/supabase-js";

// Перевіряє, чи є користувач адміном. Це лише для показу кнопок у інтерфейсі —
// справжній захист працює в базі (RLS і функції в schema_stage6_admin.sql).
export async function checkIsAdmin(
  supabase: SupabaseClient<any, any, any>,
  userId: string | null | undefined
): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export type BanOption = { label: string; hours: number | null };

// hours = null означає бан назавжди
export const BAN_OPTIONS: BanOption[] = [
  { label: "1 година", hours: 1 },
  { label: "1 день", hours: 24 },
  { label: "7 днів", hours: 24 * 7 },
  { label: "30 днів", hours: 24 * 30 },
  { label: "Назавжди", hours: null },
];

export function formatBanUntil(bannedUntil: string | null): string {
  if (bannedUntil === null) return "назавжди";
  return (
    "до " +
    new Date(bannedUntil).toLocaleString("uk-UA", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export function isBanActive(ban: { banned_until: string | null } | null): boolean {
  if (!ban) return false;
  return ban.banned_until === null || new Date(ban.banned_until) > new Date();
}
