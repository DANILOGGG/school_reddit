import Link from "next/link";
import type { Group } from "@/lib/types";
import { subscribersLabel } from "@/lib/groups";

export function GroupAvatar({
  group,
  size = 40,
}: {
  group: Pick<Group, "name" | "avatar_url">;
  size?: number;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-moss font-display text-mint"
    >
      {group.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={group.avatar_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span style={{ fontSize: size * 0.42 }}>
          {group.name.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

// compact — маленька картка для горизонтальної стрічки, wide — рядок для списку
export default function GroupCard({
  group,
  wide = false,
}: {
  group: Group;
  wide?: boolean;
}) {
  if (wide) {
    return (
      <Link
        href={`/g/${group.id}`}
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition hover:border-chalk"
      >
        <GroupAvatar group={group} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-paper">{group.name}</p>
          {group.description && (
            <p className="truncate text-sm text-muted">{group.description}</p>
          )}
          <p className="mt-0.5 text-xs text-muted">
            {subscribersLabel(group.member_count)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/g/${group.id}`}
      className="flex w-36 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface p-3 text-center transition hover:border-chalk"
    >
      <GroupAvatar group={group} size={44} />
      <p className="w-full truncate text-sm font-medium text-paper">
        {group.name}
      </p>
      <p className="text-xs text-muted">{subscribersLabel(group.member_count)}</p>
    </Link>
  );
}
