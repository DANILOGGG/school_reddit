import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { isBanActive } from "@/lib/admin";
import { formatDateShort, formatDateTime } from "@/lib/format";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// Екран для заблокованого користувача. Middleware пускає заблокованого лише сюди.
export default async function BannedPage() {
  const supabase = createClient();
  const user = await getUser();
  if (!user) redirect("/login");

  const { data: ban } = await supabase
    .from("bans")
    .select("banned_until, reason")
    .eq("user_id", user.id)
    .maybeSingle();

  // Бану немає або він уже закінчився — повертаємо на сайт
  if (!isBanActive(ban)) redirect("/");

  const until = ban!.banned_until;
  let term = "назавжди";
  let hint: string | null = null;
  if (until) {
    term = `до ${formatDateShort(until)}`;
    // Короткий бан (менше доби) — додаємо точний час, щоб було зрозуміло, коли він мине
    if (new Date(until).getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      hint = `Точний час закінчення: ${formatDateTime(until)} (за Києвом)`;
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-2 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-flag/60 bg-flag/10 text-flag">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M5.7 5.7l12.6 12.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="font-display text-5xl font-bold leading-tight text-flag sm:text-6xl">
        Тебе забанено
      </h1>
      <p className="mt-3 text-2xl text-paper">{term}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}

      {ban!.reason && (
        <div className="mt-6 w-full rounded-xl border border-flag/30 bg-flag/5 px-4 py-3 text-left">
          <p className="text-xs uppercase tracking-wide text-muted">Причина</p>
          <p className="mt-1 whitespace-pre-wrap text-paper">{ban!.reason}</p>
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        Поки діє блокування, користуватись сайтом не можна. Бан зніметься
        автоматично, коли мине його термін. Або можеш видалити акаунт і
        створити новий.
      </p>

      <DeleteAccountButton />
    </div>
  );
}
