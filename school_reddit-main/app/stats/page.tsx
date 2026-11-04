import { createClient } from "@/lib/supabase/server";
import VisitChart, {
  type ChartPoint,
  type ChartSummary,
} from "@/components/VisitChart";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type VisitorStats = {
  total_unique: number;
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
    { data: chartRows },
    { data: summaryRows },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .is("group_id", null),
    supabase.from("groups").select("id", { count: "exact", head: true }),
    supabase.rpc("get_visitor_stats"),
    supabase.rpc("get_visit_chart", { p_range: "week" }),
    supabase.rpc("get_visit_summary", { p_range: "week" }),
  ]);

  const visitors = ((visitorRows as VisitorStats[] | null) ?? [])[0];

  const points = ((chartRows as ChartPoint[] | null) ?? []).map((p) => ({
    ...p,
    n_visitors: Number(p.n_visitors),
    n_visits: Number(p.n_visits),
  }));
  const s = ((summaryRows as ChartSummary[] | null) ?? [])[0];
  const summary = {
    n_visitors: Number(s?.n_visitors ?? 0),
    n_visits: Number(s?.n_visits ?? 0),
  };

  return (
    <div>
      <h1 className="mb-4 font-display text-xl text-paper">Статистика</h1>

      <div className="grid grid-cols-3 gap-3">
        <StatCard value={userCount ?? 0} label="Користувачів" />
        <StatCard value={postCount ?? 0} label="Постів" />
        <StatCard value={groupCount ?? 0} label="Груп" />
      </div>

      <h2 className="mb-3 mt-6 font-display text-base text-paper">
        Відвідувачі сайту
      </h2>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <StatCard
          value={Number(visitors?.total_unique ?? 0)}
          label="Унікальних відвідувачів"
        />
        <StatCard
          value={Number(visitors?.total_visits ?? 0)}
          label="Усього заходів"
        />
      </div>

      <VisitChart initialRange="week" initialData={{ points, summary }} />
    </div>
  );
}
