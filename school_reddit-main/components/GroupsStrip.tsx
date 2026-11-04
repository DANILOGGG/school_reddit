import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GroupCard from "@/components/GroupCard";
import type { Group } from "@/lib/types";

// Блок "Групи" над стрічкою: кнопка створення, мої групи і популярні групи.
export default async function GroupsStrip({ userId }: { userId: string | null }) {
  const supabase = createClient();

  const [{ data: popular }, mineRes] = await Promise.all([
    supabase
      .from("groups")
      .select("*")
      .order("member_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12),
    userId
      ? supabase.from("group_members").select("groups(*)").eq("user_id", userId)
      : Promise.resolve({ data: [] }),
  ]);

  const mine = ((mineRes.data ?? []) as unknown as { groups: Group | null }[])
    .map((r) => r.groups)
    .filter((g): g is Group => !!g);
  const mineIds = new Set(mine.map((g) => g.id));
  const others = ((popular ?? []) as Group[]).filter((g) => !mineIds.has(g.id));

  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-display text-base text-paper">Групи</h2>
        <div className="flex items-center gap-3">
          <Link href="/groups" className="text-xs text-muted hover:text-paper">
            Усі групи
          </Link>
          <Link
            href="/groups/new"
            className="rounded-full bg-chalk px-3 py-1.5 text-xs font-medium text-base transition hover:bg-mint"
          >
            + Створити групу
          </Link>
        </div>
      </div>

      {mine.length > 0 && (
        <div className="mb-2">
          <p className="mb-1 text-xs text-muted">Мої групи</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {mine.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted">Популярні групи</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {others.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
