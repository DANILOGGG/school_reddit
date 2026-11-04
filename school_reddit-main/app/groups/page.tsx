import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GroupCard from "@/components/GroupCard";
import type { Group } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const supabase = createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("member_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  const list = (groups as Group[]) ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-display text-xl text-paper">Групи</h1>
        <Link
          href="/groups/new"
          className="rounded-full bg-chalk px-4 py-2 text-sm font-medium text-base transition hover:bg-mint"
        >
          + Створити групу
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          Груп поки що немає. Створи першу!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((g) => (
            <GroupCard key={g.id} group={g} wide />
          ))}
        </div>
      )}
    </div>
  );
}
