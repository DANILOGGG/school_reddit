import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const supabase = createClient();

  const [{ count: userCount }, { count: postCount }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="mb-4 font-display text-xl text-paper">Статистика</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-5 text-center">
          <p className="font-display text-3xl text-mint">{userCount ?? 0}</p>
          <p className="mt-1 text-sm text-muted">Користувачів</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 text-center">
          <p className="font-display text-3xl text-mint">{postCount ?? 0}</p>
          <p className="mt-1 text-sm text-muted">Постів</p>
        </div>
      </div>
    </div>
  );
}
