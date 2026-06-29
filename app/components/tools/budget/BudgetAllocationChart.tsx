"use client";

import type { BudgetTargets, BudgetTotals, ExpenseGroup } from "./compute-budget-journey-metrics";
import { GROUP_META, formatBudgetMoney } from "./compute-budget-journey-metrics";

type Props = {
  totals: BudgetTotals;
  targets: BudgetTargets | null;
  mode: "50-30-20" | "zero-based";
};

const SEGMENTS: ExpenseGroup[] = ["Needs", "Wants", "Savings", "Debt"];

export default function BudgetAllocationChart({ totals, targets, mode }: Props) {
  const max = Math.max(totals.available, totals.planned, 1);

  // Build an accessible summary for screen readers
  const segments = SEGMENTS.map((g) => ({ group: g, value: totals.byGroup[g] }));
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;
  const ariaSummary = segments
    .map((s) => `${s.group} ${formatBudgetMoney(s.value)} (${Math.round((s.value / Math.max(1, totals.available)) * 100)}%)`)
    .join(", ");

  const targetLine = (key: keyof BudgetTargets, label: string) => {
    if (!targets || mode !== "50-30-20") return null;
    const value = targets[key];
    const pct = clampPct(value / max);
    return (
      <div key={key} className="relative h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-90"
          style={{ width: `${pct}%`, backgroundColor: "#a1a1aa" }}
          aria-hidden
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-zinc-900 dark:bg-zinc-100"
          style={{ left: `${pct}%` }}
          title={`${label} target ${formatBudgetMoney(value)}`}
          aria-hidden
        />
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Allocation overview</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {mode === "50-30-20"
          ? "Bars show planned spend; tick marks show 50/30/20 targets on combined buckets."
          : "Planned spend vs available cash — aim to fill the bar without exceeding available."}
      </p>

      <div className="mt-5 space-y-4" role="img" aria-label={`Budget allocation by bucket: ${ariaSummary}`}>
        {SEGMENTS.map((group) => {
          const value = totals.byGroup[group];
          const pct = clampPct(value / max);
          const meta = GROUP_META[group];
          return (
            <div key={group}>
              <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold ${meta.chip}`}>{group}</span>
                <span className="font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatBudgetMoney(value)}
                  {totals.available > 0 ? (
                    <span className="text-zinc-500 dark:text-zinc-500 ml-1">
                      ({Math.round((value / totals.available) * 100)}%)
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {mode === "50-30-20" && targets ? (
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Target markers</p>
          {targetLine("needs", "Needs 50%")}
          {targetLine("wants", "Wants 30%")}
          {targetLine("savingsDebt", "Savings + Debt 20%")}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
            Savings and Debt share one 20% target — compare their combined total to the marker.
          </p>
        </div>
      ) : (
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Available cash</span>
            <span className="font-mono font-bold">{formatBudgetMoney(totals.available)}</span>
          </div>
          <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
              style={{ width: `${clampPct(totals.planned / max)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Remaining: {formatBudgetMoney(totals.remaining)} — zero-based goal is near $0.
          </p>
        </div>
      )}

      {/* Donut summary */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
        <BudgetDonut totals={totals} ariaSummary={ariaSummary} />
        <ul className="flex-1 grid grid-cols-2 gap-2 text-xs">
          {SEGMENTS.map((g) => (
            <li key={g} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: GROUP_META[g].chart }} />
              <span className="text-zinc-600 dark:text-zinc-400">{g}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function clampPct(n: number) {
  return Math.round(Math.min(100, Math.max(0, n * 100)));
}

function BudgetDonut({ totals, ariaSummary }: { totals: BudgetTotals; ariaSummary?: string }) {
  const segments = SEGMENTS.map((g) => ({ group: g, value: totals.byGroup[g] }));
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -90;
  const r = 40;
  const cx = 48;
  const cy = 48;
  const paths = segments.map(({ group, value }) => {
    const sweep = (value / sum) * 360;
    const start = polar(cx, cy, r, angle);
    angle += sweep;
    const end = polar(cx, cy, r, angle);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
    return { group, d, color: GROUP_META[group].chart };
  });

  return (
    <svg viewBox="0 0 96 96" className="h-24 w-24 shrink-0" role="img" aria-label={ariaSummary ?? "Budget allocation donut chart"}>
      <title>Budget allocation</title>
      <desc>{ariaSummary ?? "Breakdown by Needs, Wants, Savings, Debt"}</desc>
      {paths.map((p) => (
        <path key={p.group} d={p.d} fill={p.color} opacity={0.92} />
      ))}
      <circle cx={cx} cy={cy} r={22} className="fill-white dark:fill-zinc-900" />
    </svg>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
