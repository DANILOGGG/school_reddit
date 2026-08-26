import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import CategoryMenu from "@/components/CategoryMenu";

const DONATE_URL =
  process.env.NEXT_PUBLIC_DONATE_URL || "https://send.monobank.ua/";
const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/";

export default async function TopNav() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let hasActivity = false;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data as Profile | null;

    const [{ count: pendingCount }, { count: unreadCount }] = await Promise.all([
      supabase
        .from("friendships")
        .select("id", { count: "exact", head: true })
        .eq("addressee_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .is("read_at", null),
    ]);
    hasActivity = (pendingCount ?? 0) > 0 || (unreadCount ?? 0) > 0;
  }

  const iconBtn =
    "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surfaceRaised text-paper transition hover:border-chalk hover:text-mint";

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-base/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-3 py-3">
        <Link href="/" className="shrink-0 font-display text-lg text-paper sm:text-xl">
          Шкільна дошка
        </Link>

        <div className="flex items-center gap-1.5 overflow-x-auto sm:gap-2">
          <Link href="/new" className={iconBtn} title="Новий пост" aria-label="Новий пост">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>

          <CategoryMenu iconBtn={iconBtn} />

          <Link href="/about" className={iconBtn} title="Про сайт" aria-label="Про сайт">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 11v6M12 7.5v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>

          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={iconBtn}
            title="Донат"
            aria-label="Донат"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="M6 6v.01M18 18v-.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </a>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={iconBtn}
            title="Telegram-канал"
            aria-label="Telegram-канал"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 3L2 10.5l6 2.3M21 3l-3.5 17L11 15.5M21 3L11 15.5m0 0l-2.5 5.5v-5L11 15.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <Link href="/stats" className={iconBtn} title="Статистика" aria-label="Статистика">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 20V10M12 20V4M20 20v-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <Link href="/activity" className={iconBtn} title="Активність" aria-label="Активність">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M13.7 21a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {hasActivity && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-flag" />
            )}
          </Link>

          <Link href="/friends" className={iconBtn} title="Друзі" aria-label="Друзі">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <Link
            href="/profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-chalk bg-surfaceRaised"
            title="Профіль"
            aria-label="Профіль"
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-mint">
                {profile?.nickname?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
