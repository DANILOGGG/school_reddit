import { formatDateTimeLong } from "@/lib/format";

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
  return "до " + formatDateTimeLong(bannedUntil);
}

export function isBanActive(ban: { banned_until: string | null } | null): boolean {
  if (!ban) return false;
  return ban.banned_until === null || new Date(ban.banned_until) > new Date();
}
