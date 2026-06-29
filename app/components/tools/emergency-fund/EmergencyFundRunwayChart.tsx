"use client";

import type { EfMetrics } from "./compute-emergency-fund-journey-metrics";
import {
  CATEGORY_META,
  categoryOrderForGoal,
  essentialsByCategory,
  formatEfMoney,
} from "./compute-emergency-fund-journey-metrics";
import type { EmergencyFundGoal, EssentialLineItem } from "./emergency-fund-journey-types";

type Props = {
  goal: EmergencyFundGoal;
  metrics: EfMetrics;
  currentFund: number;
  essentialItems: EssentialLineItem[];
  showEssentialsBreakdown: boolean;
};

export default function EmergencyFundRunwayChart({
  goal,
  metrics,
  currentFund,
  essentialItems,
  showEssentialsBreakdown,
}: Props) {
  const pctFunded = Math.min(100, metrics.pctOfTarget);
  const runwayPct = Math.min(
    100,
    metrics.targetMonths > 0 ? (metrics.runwayMonths / metrics.targetMonths) * 100 : 0
  );

  const byCat = essentialsByCategory(essentialItems);
  const catTotal = Object.values(byCat).reduce((s, v) => s + v, 0) || metrics.monthlyEssentials || 1;
  const order = categoryOrderForGoal(goal);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Runway & funding picture</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Balance vs. target and how many months of essentials you&apos;ve banked.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Funding progress</span>
            <span className="font-mono tabular-nums font-bold text-zinc-800 dark:text-zinc-200">
              {pctFunded.toFixed(0)}%
            </span>
          </div>
          <div className="h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 dark:from-sky-500 dark:to-cyan-400 transition-[width] duration-500"
              style={{ width: `${pctFunded}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {formatEfMoney(currentFund)} of {formatEfMoney(metrics.targetBalance)} target
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Runway vs. target months</span>
              <span className="font-mono tabular-nums font-bold text-zinc-800 dark:text-zinc-200">
                {metrics.runwayMonths.toFixed(1)} / {metrics.targetMonths} mo
              </span>
            </div>
            <div className="relative h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-700 dark:bg-zinc-300 transition-[width] duration-500"
                style={{ width: `${runwayPct}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-sky-500 dark:bg-sky-400"
                style={{ left: "100%", transform: "translateX(-1px)" }}
                title="Target months marker"
                aria-hidden
              />
            </div>
          </div>
        </div>

        <RunwayDonut metrics={metrics} currentFund={currentFund} />
      </div>

      {showEssentialsBreakdown && essentialItems.length > 0 ? (
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
            Essentials breakdown
          </p>
          <div className="space-y-3">
            {order.map((cat) => {
              const value = byCat[cat];
              if (value <= 0) return null;
              const meta = CATEGORY_META[cat];
              const pct = Math.round((value / catTotal) * 100);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-md font-bold ${meta.chip}`}>{meta.label}</span>
                    <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatEfMoney(value)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RunwayDonut({ metrics, currentFund }: { metrics: EfMetrics; currentFund: number }) {
  const gap = Math.max(0, metrics.gap);
  const funded = Math.min(currentFund, metrics.targetBalance);
  const segments = [
    { label: "Funded", value: funded, color: "#0284c7" },
    { label: "Gap", value: gap, color: "#e4e4e7" },
  ].filter((s) => s.value > 0);
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -90;
  const r = 44;
  const cx = 52;
  const cy = 52;

  const paths = segments.map(({ label, value, color }) => {
    const sweep = (value / sum) * 360;
    const start = polar(cx, cy, r, angle);
    angle += sweep;
    const end = polar(cx, cy, r, angle);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
    return { label, d, color };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 104 104" className="h-28 w-28 shrink-0" aria-hidden>
        {paths.map((p) => (
          <path key={p.label} d={p.d} fill={p.color} className={p.label === "Gap" ? "dark:fill-zinc-700" : ""} />
        ))}
        <circle cx={cx} cy={cy} r={26} className="fill-white dark:fill-zinc-900" />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-zinc-900 dark:fill-zinc-100 text-[11px] font-bold"
          style={{ fontSize: 11 }}
        >
          {metrics.pctOfTarget.toFixed(0)}%
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          className="fill-zinc-500 text-[8px]"
          style={{ fontSize: 8 }}
        >
          funded
        </text>
      </svg>
      <ul className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-600 shrink-0" />
          Funded {formatEfMoney(funded)}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
          Gap {formatEfMoney(gap)}
        </li>
        <li className="pt-1 font-semibold text-zinc-800 dark:text-zinc-200">
          {metrics.runwayMonths.toFixed(1)} mo runway
        </li>
      </ul>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
