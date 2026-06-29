"use client";

import type { SubWorkspaceMetrics, SubscriptionCategory } from "./compute-subscription-audit-metrics";
import {
  CATEGORY_META,
  SUBSCRIPTION_CATEGORIES,
  categoryOrderForGoal,
  formatSubMoney,
} from "./compute-subscription-audit-metrics";
import type { SubscriptionAuditGoal } from "./subscription-audit-journey-types";

type Props = {
  goal: SubscriptionAuditGoal;
  metrics: SubWorkspaceMetrics;
  trimPercent: number;
};

export default function SubscriptionSpendChart({ goal, metrics, trimPercent }: Props) {
  const order = categoryOrderForGoal(goal);
  const max = Math.max(metrics.monthly, 1);
  const trimPct = Math.min(100, trimPercent);

  const segments = order
    .map((cat) => ({ cat, value: metrics.byCategory[cat] ?? 0 }))
    .filter((s) => s.value > 0);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Recurring spend breakdown</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Monthly by category — annualized total {formatSubMoney(metrics.annual)}.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {segments.length === 0 ? (
            <p className="text-sm text-zinc-500">Add line items to see category bars.</p>
          ) : (
            segments.map(({ cat, value }) => {
              const meta = CATEGORY_META[cat];
              const pct = Math.round((value / max) * 100);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-md font-bold ${meta.chip}`}>{cat}</span>
                    <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatSubMoney(value)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Trim scenario ({trimPercent}%)</span>
              <span className="font-mono font-bold tabular-nums">{formatSubMoney(metrics.trimMonthly)}/mo saved</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 to-orange-500 dark:from-rose-500 dark:to-orange-400"
                style={{ width: `${trimPct}%` }}
              />
            </div>
          </div>
        </div>

        <SubscriptionDonut metrics={metrics} segments={segments.map((s) => s.cat)} />
      </div>
    </div>
  );
}

function SubscriptionDonut({
  metrics,
  segments,
}: {
  metrics: SubWorkspaceMetrics;
  segments: SubscriptionCategory[];
}) {
  const data = segments.map((cat) => ({
    cat,
    value: metrics.byCategory[cat] ?? 0,
    color: CATEGORY_META[cat].chart,
  }));
  const sum = data.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -90;
  const r = 44;
  const cx = 52;
  const cy = 52;

  const paths = data.map(({ cat, value, color }) => {
    const sweep = (value / sum) * 360;
    const start = polar(cx, cy, r, angle);
    angle += sweep;
    const end = polar(cx, cy, r, angle);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
    return { cat, d, color };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 104 104" className="h-28 w-28 shrink-0" aria-hidden>
        {paths.map((p) => (
          <path key={p.cat} d={p.d} fill={p.color} opacity={0.92} />
        ))}
        <circle cx={cx} cy={cy} r={26} className="fill-white dark:fill-zinc-900" />
        <text x={cx} y={cy - 2} textAnchor="middle" fill="currentColor" className="text-[10px] font-bold fill-zinc-900 dark:fill-zinc-100">
          {formatSubMoney(metrics.monthly).replace("$", "")}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-zinc-500 text-[7px]">
          /mo
        </text>
      </svg>
      <ul className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400 flex-1">
        {data.slice(0, 4).map(({ cat, value }) => (
          <li key={cat} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_META[cat].chart }} />
            {cat} · {formatSubMoney(value)}
          </li>
        ))}
        {data.length > 4 ? <li className="text-zinc-500">+{data.length - 4} more</li> : null}
        <li className="pt-1 font-semibold text-zinc-800 dark:text-zinc-200">{formatSubMoney(metrics.annual)}/yr</li>
      </ul>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
