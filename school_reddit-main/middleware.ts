import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isBanActive } from "@/lib/admin";

// id користувача з токена (поле sub). Токен тут лише читаємо, не довіряємо:
// справжню перевірку підпису робить сама база, коли ми робимо запит з цим токеном.
function userIdFromToken(token: string | undefined): string | null {
  try {
    if (!token) return null;
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(payload));
    return typeof json.sub === "string" ? json.sub : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // getSession() читає токен з cookie БЕЗ запиту до Supabase (оновлює токен лише
  // коли він прострочений). Тут нам потрібно знати «залогінений чи ні».
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const loggedIn = !!session; // лише факт наявності сесії (без читання session.user)

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/login");
  const isBannedPage = path.startsWith("/banned");

  if (!loggedIn && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ПЕРЕВІРКА БАНУ НА СЕРВЕРІ. Middleware виконується перед КОЖНОЮ сторінкою,
  // тож заблокований користувач не потрапить на жодну з них — ні оновленням
  // сторінки, ні виходом і повторним входом: бан прив'язаний до акаунта в базі.
  if (loggedIn) {
    const uid = userIdFromToken(session?.access_token);
    let banned = false;

    if (uid) {
      const { data: ban } = await supabase
        .from("bans")
        .select("banned_until, reason")
        .eq("user_id", uid)
        .maybeSingle();
      // Якщо запит не вдався — не блокуємо всіх: без бази сайт все одно не працює
      banned = isBanActive(ban as { banned_until: string | null } | null);
    }

    if (banned && !isBannedPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/banned";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (!banned && isBannedPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (loggedIn && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {

  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
