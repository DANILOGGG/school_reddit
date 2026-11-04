import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

// cache() з React: в межах ОДНОГО запиту до сайту функція виконується один раз,
// а всі наступні виклики (TopNav, сторінка, вкладені компоненти) отримують
// той самий результат. Раніше кожен компонент створював свого клієнта і
// окремо питав Supabase Auth «хто це?» — це були зайві мережеві запити.
export const createClient = cache(() => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — middleware handles refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Called from a Server Component — middleware handles refresh.
          }
        },
      },
    }
  );
});

// Поточний користувач — рівно один запит до Supabase Auth на весь рендер сторінки.
export const getUser = cache(async () => {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return user;
});

// Чи адмін — теж один запит на рендер, навіть якщо питають і TopNav, і сторінка.
export const getIsAdmin = cache(async (userId: string | null | undefined) => {
  if (!userId) return false;
  const { data } = await createClient()
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
});
