import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}

// id поточного користувача БЕЗ запиту в мережу (береться з локальної сесії).
// auth.getUser() кожен раз ходить на сервер Supabase — через це лайк «думав»
// пів секунди. Безпека не страждає: права все одно перевіряє база (RLS) за токеном.
export async function getClientUserId(
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}
