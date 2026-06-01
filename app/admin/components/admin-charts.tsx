"use client";

type BarPoint = { label: string; count: number };

export function MiniSparkline({
  values,
  className = "h-12",
  color = "stroke-purple-500 dark:stroke-violet-400",
}: {
  values: number[];
  className?: string;
  color?: string;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const w = 120;
  const h = 40;
  const step = w / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${i * step},${h - (v / max) * (h - 4) - 2}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full ${className}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        className={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polyline
        fill="currentColor"
        className="fill-purple-500/10 dark:fill-violet-500/15"
        stroke="none"
        points={`0,${h} ${points} ${w},${h}`}
      />
    </svg>
  );
}

export function HorizontalBarChart({
  items,
  maxBars = 8,
}: {
  items: BarPoint[];
  maxBars?: number;
}) {
  const slice = items.slice(0, maxBars);
  const max = Math.max(...slice.map((i) => i.count), 1);

  return (
    <ul className="space-y-3">
      {slice.map((item) => (
        <li key={item.label}>
          <div className="flex justify-between text-sm mb-1 gap-2">
            <span className="font-medium text-slate-700 dark:text-zinc-300 truncate">{item.label}</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 tabular-nums shrink-0">{item.count}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 dark:from-violet-500 dark:to-fuchsia-500 transition-all"
              style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
      {slice.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-zinc-500 text-center py-4">No data yet</p>
      ) : null}
    </ul>
  );
}

export function GroupedBarChart({
  series,
  labels,
}: {
  series: Array<{ name: string; values: number[]; color: string }>;
  labels: string[];
}) {
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const barW = Math.min(24, 280 / Math.max(labels.length, 1));

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-2 min-h-[140px] pt-4 pb-8">
        {labels.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1 flex-1 min-w-[40px]">
            <div className="flex items-end gap-0.5 h-24">
              {series.map((s) => (
                <div
                  key={s.name}
                  title={`${s.name}: ${s.values[i]}`}
                  className={`rounded-t-md ${s.color} opacity-90 hover:opacity-100 transition-opacity`}
                  style={{
                    width: barW / series.length,
                    height: `${Math.max(4, (s.values[i] / max) * 96)}px`,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-500 text-center leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-2">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
            <span className={`w-2.5 h-2.5 rounded-sm ${s.color}`} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DonutStat({
  segments,
}: {
  segments: Array<{ label: string; count: number; color: string }>;
}) {
  const total = segments.reduce((a, s) => a + s.count, 0) || 1;
  let offset = 0;
  const r = 36;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 96 96" className="w-28 h-28 shrink-0 -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="12" />
        {segments.map((seg) => {
          const len = (seg.count / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={seg.label}
              cx="48"
              cy="48"
              r={r}
              fill="none"
              className={seg.color.replace("bg-", "stroke-")}
              strokeWidth="12"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="flex-1 w-full space-y-2">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${seg.color}`} />
              <span className="text-slate-700 dark:text-zinc-300 truncate">{seg.label}</span>
            </span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
              {seg.count}{" "}
              <span className="text-slate-400 dark:text-zinc-500 font-normal text-xs">
                ({Math.round((seg.count / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
