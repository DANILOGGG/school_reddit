"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import EyeIcon from "@/components/EyeIcon";
import { formatCount, formatDateTime } from "@/lib/format";
import type { DayPoint, MyPostStat } from "@/lib/types";

const REFRESH_MS = 15_000;

const num = (v: unknown) => Number(v) || 0;

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

type SortKey = "new" | "views" | "likes" | "comments" | "reposts";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "Нові" },
  { key: "views", label: "Перегляди" },
  { key: "likes", label: "Лайки" },
  { key: "comments", label: "Коментарі" },
  { key: "reposts", label: "Репости" },
];

// ---------- іконки метрик (ті самі, що в стрічці) ----------
const HeartIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <path
      d="M12 21s-7-4.5-9.5-9C.7 8.2 2 4.8 5.3 4.1 7.6 3.6 9.8 4.6 12 7c2.2-2.4 4.4-3.4 6.7-2.9 3.3.7 4.6 4.1 2.8 7.9C19 16.5 12 21 12 21z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);
const CommentIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <path
      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const RepostIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <path
      d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ---------- графік нових переглядів по днях ----------
function dayLabel(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

function ViewsBars({ points, height = 140 }: { points: DayPoint[]; height?: number }) {
  const [active, setActive] = useState<number | null>(null);
  const W = 560;
  const padT = 10;
  const padB = 22;
  const innerH = height - padT - padB;
  const max = Math.max(1, ...points.map((p) => p.views));
  const slot = W / Math.max(1, points.length);
  const barW = Math.max(6, slot * 0.62);
  const total = points.reduce((s, p) => s + p.views, 0);
  const shown = active !== null ? points[active] : null;

  return (
    <div>
      <div className="mb-1 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-muted">
            {shown ? dayLabel(shown.bucket_day) : `За ${points.length} днів`}
          </p>
          <p className="font-display text-3xl text-mint">
            {shown ? shown.views : total}{" "}
            <span className="font-body text-sm text-muted">
              {plural(shown ? shown.views : total, "новий перегляд", "нові перегляди", "нових переглядів")}
            </span>
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="h-auto w-full touch-pan-y select-none"
        role="img"
        aria-label="Нові перегляди по днях"
        onMouseLeave={() => setActive(null)}
      >
        {[0.5, 1].map((f) => (
          <line
            key={f}
            x1="0"
            x2={W}
            y1={padT + innerH * (1 - f)}
            y2={padT + innerH * (1 - f)}
            stroke="currentColor"
            className="text-border"
            strokeDasharray="3 4"
          />
        ))}
        {points.map((p, i) => {
          const h = p.views === 0 ? 2 : Math.max(4, (p.views / max) * innerH);
          const x = i * slot + (slot - barW) / 2;
          const y = padT + innerH - h;
          const isActive = active === i;
          const showLabel = points.length <= 8 || i % 2 === points.length % 2 || i === points.length - 1;
          return (
            <g
              key={p.bucket_day}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(isActive ? null : i)}
              className="cursor-pointer"
            >
              <rect x={i * slot} y={0} width={slot} height={height} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="4"
                className={isActive ? "fill-mint" : p.views === 0 ? "fill-border" : "fill-chalk"}
              />
              {showLabel && (
                <text
                  x={i * slot + slot / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-muted"
                  fontSize="11"
                >
                  {dayLabel(p.bucket_day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------- картки ----------
function MetricCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </div>
      <p className="font-display text-3xl text-mint">{formatCount(value)}</p>
    </div>
  );
}

function MiniMetrics({ p }: { p: MyPostStat }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
      <span className="flex items-center gap-1.5" title="Перегляди">
        <EyeIcon /> {formatCount(p.view_count)}
      </span>
      <span className="flex items-center gap-1.5" title="Лайки">
        <HeartIcon /> {formatCount(p.like_count)}
      </span>
      <span className="flex items-center gap-1.5" title="Коментарі">
        <CommentIcon /> {formatCount(p.comment_count)}
      </span>
      <span className="flex items-center gap-1.5" title="Репости">
        <RepostIcon /> {formatCount(p.repost_count)}
      </span>
    </div>
  );
}

// ---------- головний компонент ----------
export default function PostStatsClient({
  initialPosts,
  initialTimeline,
}: {
  initialPosts: MyPostStat[];
  initialTimeline: DayPoint[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [sort, setSort] = useState<SortKey>("new");
  const [openId, setOpenId] = useState<string | null>(null);
  const [postTimeline, setPostTimeline] = useState<DayPoint[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [refreshError, setRefreshError] = useState(false);
  const openIdRef = useRef<string | null>(null);
  openIdRef.current = openId;

  const fetchTimeline = useCallback(async (postId: string | null) => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_views_timeline", {
      p_post_id: postId,
      p_days: 14,
    });
    if (error) return null;
    return ((data as any[]) ?? []).map((r) => ({
      bucket_day: String(r.bucket_day),
      views: num(r.views),
    })) as DayPoint[];
  }, []);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const [statsRes, all, single] = await Promise.all([
      supabase.rpc("get_my_post_stats"),
      fetchTimeline(null),
      openIdRef.current ? fetchTimeline(openIdRef.current) : Promise.resolve(null),
    ]);

    if (statsRes.error) {
      setRefreshError(true);
      return;
    }
    setRefreshError(false);
    setPosts(
      ((statsRes.data as any[]) ?? []).map((r) => ({
        ...r,
        view_count: num(r.view_count),
        like_count: num(r.like_count),
        comment_count: num(r.comment_count),
        repost_count: num(r.repost_count),
      }))
    );
    if (all) setTimeline(all);
    if (single) setPostTimeline(single);
    setUpdatedAt(new Date());
  }, [fetchTimeline]);

  // Автооновлення: кожні 15 секунд, поки вкладка відкрита, і одразу при поверненні на неї.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const id = setInterval(tick, REFRESH_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  // Графік окремого поста
  useEffect(() => {
    setPostTimeline(null);
    if (!openId) return;
    let cancelled = false;
    fetchTimeline(openId).then((t) => {
      if (!cancelled && t) setPostTimeline(t);
    });
    return () => {
      cancelled = true;
    };
  }, [openId, fetchTimeline]);

  const totals = posts.reduce(
    (acc, p) => ({
      views: acc.views + p.view_count,
      likes: acc.likes + p.like_count,
      comments: acc.comments + p.comment_count,
      reposts: acc.reposts + p.repost_count,
    }),
    { views: 0, likes: 0, comments: 0, reposts: 0 }
  );

  const sorted = [...posts].sort((a, b) => {
    switch (sort) {
      case "views":
        return b.view_count - a.view_count;
      case "likes":
        return b.like_count - a.like_count;
      case "comments":
        return b.comment_count - a.comment_count;
      case "reposts":
        return b.repost_count - a.repost_count;
      default:
        return +new Date(b.created_at) - +new Date(a.created_at);
    }
  });

  const pill = (isOn: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition ${
      isOn
        ? "bg-chalk text-base"
        : "border border-border bg-surface text-muted hover:text-paper"
    }`;

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
        У тебе ще немає публікацій, тож і статистики поки немає.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Загальна статистика всіх публікацій */}
      <div>
        <p className="mb-2 text-xs text-muted">
          Усього публікацій: {posts.length}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard icon={<EyeIcon />} value={totals.views} label="Перегляди" />
          <MetricCard icon={<HeartIcon />} value={totals.likes} label="Лайки" />
          <MetricCard icon={<CommentIcon />} value={totals.comments} label="Коментарі" />
          <MetricCard icon={<RepostIcon />} value={totals.reposts} label="Репости" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <ViewsBars points={timeline} />
        <p className="mt-2 text-xs text-muted">
          Кожна людина рахується один раз на пост. Свої перегляди не враховуються.
          Час за Києвом. Торкнись стовпчика, щоб побачити число.
        </p>
      </div>

      {/* Список постів */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {SORTS.map((s) => (
            <button key={s.key} onClick={() => setSort(s.key)} className={pill(sort === s.key)}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {sorted.map((p) => {
            const isOpen = openId === p.id;
            const reactions = p.like_count + p.comment_count + p.repost_count;
            const engagement =
              p.view_count > 0
                ? Math.min(100, Math.round((reactions / p.view_count) * 100))
                : null;

            return (
              <div
                key={p.id}
                className={`rounded-2xl border bg-surface transition ${
                  isOpen ? "border-chalk" : "border-border hover:border-chalk/60"
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : p.id)}
                  className="block w-full p-4 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>{formatDateTime(p.created_at)}</span>
                    {p.is_anonymous && (
                      <span className="rounded-full bg-moss px-2 py-0.5 font-medium text-mint">
                        Анонімно
                      </span>
                    )}
                    {p.group_name && (
                      <span className="rounded-full border border-border px-2 py-0.5">
                        Група «{p.group_name}»
                      </span>
                    )}
                    <span className="ml-auto text-mint">
                      {isOpen ? "Сховати ▲" : "Детальніше ▼"}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 whitespace-pre-wrap text-[15px] leading-relaxed text-paper">
                    {p.body || (p.image_url ? "Фото без тексту" : "—")}
                  </p>
                  <MiniMetrics p={p} />
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4">
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <MetricCard icon={<EyeIcon />} value={p.view_count} label="Перегляди" />
                      <MetricCard icon={<HeartIcon />} value={p.like_count} label="Лайки" />
                      <MetricCard icon={<CommentIcon />} value={p.comment_count} label="Коментарі" />
                      <MetricCard icon={<RepostIcon />} value={p.repost_count} label="Репости" />
                    </div>

                    <p className="mb-3 text-sm text-muted">
                      Залученість:{" "}
                      <span className="font-medium text-paper">
                        {engagement === null ? "ще немає переглядів" : `${engagement}%`}
                      </span>{" "}
                      {engagement !== null && "(лайки + коментарі + репости від кількості переглядів)"}
                    </p>

                    {postTimeline ? (
                      <ViewsBars points={postTimeline} height={120} />
                    ) : (
                      <div className="h-[120px] animate-pulse rounded-xl bg-surfaceRaised" />
                    )}

                    <Link
                      href={`/post/${p.id}`}
                      className="mt-3 inline-block text-sm text-mint hover:underline"
                    >
                      Відкрити пост →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            refreshError ? "bg-flag" : "animate-pulse bg-mint"
          }`}
        />
        {refreshError
          ? "Не вдалося оновити статистику. Спробуємо ще раз."
          : `Оновлюється автоматично кожні ${REFRESH_MS / 1000} с · востаннє о ${updatedAt.toLocaleTimeString(
              "uk-UA",
              { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Kyiv" }
            )}`}
      </p>
    </div>
  );
}
