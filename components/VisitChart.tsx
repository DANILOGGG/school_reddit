"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Range = "day" | "week" | "month" | "year" | "all";
type Unit = "hour" | "day" | "month";
type Metric = "visitors" | "visits";

export type ChartPoint = {
  bucket_at: string; // "2026-10-21T14:00:00" (київський час)
  bucket_unit: Unit;
  n_visitors: number;
  n_visits: number;
};
export type ChartSummary = { n_visitors: number; n_visits: number };
type RangeData = { points: ChartPoint[]; summary: ChartSummary };

const RANGES: { key: Range; label: string; title: string }[] = [
  { key: "day", label: "Сьогодні", title: "Сьогодні, по годинах" },
  { key: "week", label: "Тиждень", title: "Останні 7 днів" },
  { key: "month", label: "Місяць", title: "Останні 30 днів" },
  { key: "year", label: "Рік", title: "Останні 12 місяців" },
  { key: "all", label: "Весь час", title: "За весь час" },
];

const MONTHS_SHORT = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
const MONTHS_GEN = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
const MONTHS_NOM = ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"];

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
const peopleWord = (n: number) => plural(n, "людина", "людини", "людей");
const visitsWord = (n: number) => plural(n, "захід", "заходи", "заходів");

// Розбираємо рядок вручну, щоб часовий пояс браузера нічого не зсунув
function parts(bucket: string) {
  const [date, time = "00:00:00"] = bucket.split("T");
  const [y, mo, d] = date.split("-").map(Number);
  const [h] = time.split(":").map(Number);
  return { y, mo, d, h };
}

function axisLabel(bucket: string, unit: Unit): string {
  const { y, mo, d, h } = parts(bucket);
  if (unit === "hour") return `${String(h).padStart(2, "0")}:00`;
  if (unit === "day") return `${String(d).padStart(2, "0")}.${String(mo).padStart(2, "0")}`;
  return `${MONTHS_SHORT[mo - 1]} ${String(y).slice(2)}`;
}

function fullLabel(bucket: string, unit: Unit): string {
  const { y, mo, d, h } = parts(bucket);
  if (unit === "hour") {
    return `${d} ${MONTHS_GEN[mo - 1]}, ${String(h).padStart(2, "0")}:00–${String((h + 1) % 24).padStart(2, "0")}:00`;
  }
  if (unit === "day") return `${d} ${MONTHS_GEN[mo - 1]} ${y}`;
  return `${MONTHS_NOM[mo - 1]} ${y}`;
}

// Гладка лінія без "провалів" нижче нуля (монотонна кубічна інтерполяція)
function smoothPath(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0].x},${pts[0].y}`;

  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    m.push((pts[i + 1].y - pts[i].y) / dx[i]);
  }
  const t: number[] = new Array(n).fill(0);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
    } else {
      const a = t[i] / m[i];
      const b = t[i + 1] / m[i];
      const s = a * a + b * b;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        t[i] = tau * a * m[i];
        t[i + 1] = tau * b * m[i];
      }
    }
  }

  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = pts[i].x + dx[i] / 3;
    const c1y = pts[i].y + (t[i] * dx[i]) / 3;
    const c2x = pts[i + 1].x - dx[i] / 3;
    const c2y = pts[i + 1].y - (t[i + 1] * dx[i]) / 3;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

// "Гарні" значення осі Y: 0, 1, 2… або 0, 5, 10… (завжди цілі числа)
function niceScale(maxValue: number): { step: number; top: number } {
  const target = Math.max(1, maxValue);
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  const step = steps.find((s) => Math.ceil(target / s) <= 4) ?? 20000;
  return { step, top: step * Math.ceil(target / step) };
}

const W = 640;
const H = 260;
const PAD = { left: 34, right: 14, top: 14, bottom: 30 };

function Chart({
  points,
  metric,
  activeIdx,
  onActive,
}: {
  points: ChartPoint[];
  metric: Metric;
  activeIdx: number | null;
  onActive: (i: number | null) => void;
}) {
  const n = points.length;
  const values = points.map((p) => (metric === "visitors" ? p.n_visitors : p.n_visits));
  const maxValue = Math.max(0, ...values);
  const { step, top } = niceScale(maxValue);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const baseY = PAD.top + innerH;
  const xAt = (i: number) =>
    n === 1 ? PAD.left + innerW / 2 : PAD.left + (i * innerW) / (n - 1);
  const yAt = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const coords = values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const line = smoothPath(coords);
  const area =
    n > 1
      ? `${line} L${coords[n - 1].x},${baseY} L${coords[0].x},${baseY} Z`
      : "";

  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);

  const labelEvery = Math.max(1, Math.ceil(n / 7));
  const showDots = n <= 31;

  function handle(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xView = ((e.clientX - rect.left) * W) / rect.width;
    if (n === 1) return onActive(0);
    const idx = Math.round(((xView - PAD.left) / innerW) * (n - 1));
    onActive(Math.min(n - 1, Math.max(0, idx)));
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full select-none text-mint"
      style={{ touchAction: "pan-y" }}
      role="img"
      aria-label="Графік відвідувачів"
      onPointerMove={handle}
      onPointerDown={handle}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") onActive(null);
      }}
    >
      <defs>
        <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* сітка й підписи осі Y */}
      {ticks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yAt(v)}
            y2={yAt(v)}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray={v === 0 ? undefined : "3 4"}
          />
          <text
            x={PAD.left - 8}
            y={yAt(v) + 4}
            textAnchor="end"
            className="fill-muted"
            fontSize={11}
          >
            {v}
          </text>
        </g>
      ))}

      {/* підписи осі X */}
      {points.map((p, i) =>
        i % labelEvery === 0 ? (
          <text
            key={p.bucket_at}
            x={xAt(i)}
            y={H - 8}
            textAnchor="middle"
            className="fill-muted"
            fontSize={11}
          >
            {axisLabel(p.bucket_at, p.bucket_unit)}
          </text>
        ) : null
      )}

      {/* заливка й лінія */}
      {area && <path d={area} fill="url(#visitFill)" />}
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* точки */}
      {showDots &&
        coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={3}
            fill="currentColor"
            className="opacity-70"
          />
        ))}

      {/* вибрана точка */}
      {activeIdx !== null && coords[activeIdx] && (
        <g>
          <line
            x1={coords[activeIdx].x}
            x2={coords[activeIdx].x}
            y1={PAD.top}
            y2={baseY}
            className="stroke-chalk"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <circle
            cx={coords[activeIdx].x}
            cy={coords[activeIdx].y}
            r={6}
            fill="currentColor"
            className="stroke-base"
            strokeWidth={2.5}
          />
        </g>
      )}
    </svg>
  );
}

export default function VisitChart({
  initialRange,
  initialData,
}: {
  initialRange: Range;
  initialData: RangeData;
}) {
  const [range, setRange] = useState<Range>(initialRange);
  const [metric, setMetric] = useState<Metric>("visitors");
  const [cache, setCache] = useState<Partial<Record<Range, RangeData>>>({
    [initialRange]: initialData,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    setActiveIdx(null);
    if (cache[range]) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    Promise.all([
      supabase.rpc("get_visit_chart", { p_range: range }),
      supabase.rpc("get_visit_summary", { p_range: range }),
    ]).then(([chartRes, summaryRes]) => {
      if (cancelled) return;
      setLoading(false);
      if (chartRes.error || summaryRes.error) {
        setError("Не вдалося завантажити дані графіка.");
        return;
      }
      const points = ((chartRes.data ?? []) as ChartPoint[]).map((p) => ({
        ...p,
        n_visitors: Number(p.n_visitors),
        n_visits: Number(p.n_visits),
      }));
      const s = ((summaryRes.data ?? []) as ChartSummary[])[0];
      setCache((c) => ({
        ...c,
        [range]: {
          points,
          summary: {
            n_visitors: Number(s?.n_visitors ?? 0),
            n_visits: Number(s?.n_visits ?? 0),
          },
        },
      }));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const data = cache[range];
  const meta = RANGES.find((r) => r.key === range)!;
  const active = data && activeIdx !== null ? data.points[activeIdx] : null;

  const shownVisitors = active ? active.n_visitors : data?.summary.n_visitors ?? 0;
  const shownVisits = active ? active.n_visits : data?.summary.n_visits ?? 0;
  const mainValue = metric === "visitors" ? shownVisitors : shownVisits;
  const otherValue = metric === "visitors" ? shownVisits : shownVisitors;
  const mainWord = metric === "visitors" ? peopleWord(mainValue) : visitsWord(mainValue);
  const otherWord = metric === "visitors" ? visitsWord(otherValue) : peopleWord(otherValue);
  const hasData = !!data && data.points.some((p) => p.n_visits > 0);

  const pill = (isOn: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition ${
      isOn
        ? "bg-chalk text-base"
        : "border border-border bg-surface text-muted hover:text-paper"
    }`;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button key={r.key} onClick={() => setRange(r.key)} className={pill(range === r.key)}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
        <div className="min-h-[4.25rem]">
          <p className="text-xs text-muted">
            {active ? fullLabel(active.bucket_at, active.bucket_unit) : meta.title}
          </p>
          <p className="font-display text-3xl text-mint">
            {mainValue}{" "}
            <span className="font-body text-sm text-muted">{mainWord}</span>
          </p>
          <p className="text-xs text-muted">
            {otherValue} {otherWord}
          </p>
        </div>

        <div className="flex gap-1">
          <button onClick={() => setMetric("visitors")} className={pill(metric === "visitors")}>
            Люди
          </button>
          <button onClick={() => setMetric("visits")} className={pill(metric === "visits")}>
            Заходи
          </button>
        </div>
      </div>

      <div className={`relative transition-opacity ${loading ? "opacity-40" : ""}`}>
        {data ? (
          <Chart
            points={data.points}
            metric={metric}
            activeIdx={activeIdx}
            onActive={setActiveIdx}
          />
        ) : (
          <div className="h-[260px]" />
        )}
        {data && !hasData && !loading && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">
            За цей період ще немає даних
          </p>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-flag">{error}</p>}
      <p className="mt-2 text-xs text-muted">
        «Люди» — унікальні браузери, «Заходи» — усі відкриття сайту. Час за
        Києвом. Торкнись або наведи на графік, щоб побачити точні числа.
      </p>
    </div>
  );
}
