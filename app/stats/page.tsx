import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type VisitorStats = {
  total_unique: number;
  last_day: number;
  last_week: number;
  total_visits: number;
};

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 text-center">
      <p className="font-display text-3xl text-mint">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

export default async function StatsPage() {
  const supabase = createClient();

  const [
    { count: userCount },
    { count: postCount },
    { count: groupCount },
    { data: visitorRows },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .is("group_id", null),
    supabase.from("groups").select("id", { count: "exact", head: true }),
    supabase.rpc("get_visitor_stats"),
  ]);

  const visitors = ((visitorRows as VisitorStats[] | null) ?? [])[0];

  return (
    <div>
      <h1 className="mb-4 font-display text-xl text-paper">Статистика</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard value={userCount ?? 0} label="Користувачів" />
        <StatCard value={postCount ?? 0} label="Постів" />
        <StatCard value={groupCount ?? 0} label="Груп" />
      </div>

      <h2 className="mb-3 mt-6 font-display text-base text-paper">
        Відвідувачі сайту
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          value={Number(visitors?.total_unique ?? 0)}
          label="Унікальних відвідувачів"
        />
        <StatCard
          value={Number(visitors?.total_visits ?? 0)}
          label="Усього заходів"
        />
        <StatCard
          value={Number(visitors?.last_day ?? 0)}
          label="За останню добу"
        />
        <StatCard
          value={Number(visitors?.last_week ?? 0)}
          label="За 7 днів"
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        Рахуються браузери, які відкрили сайт, навіть без реєстрації. Якщо
        людина зайде з іншого пристрою чи очистить дані браузера, її буде
        пораховано знову.
      </p>
    </div>
  );
}
