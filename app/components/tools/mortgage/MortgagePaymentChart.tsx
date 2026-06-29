"use client";

import { formatMoney } from "./compute-journey-metrics";

type Props = {
  pi: number;
  escrowTaxMonthly: number;
  escrowInsMonthly: number;
  pmiMonthly: number;
  hoaMonthly?: number;
};

const COLORS = [
  "bg-zinc-800 dark:bg-zinc-200",
  "bg-zinc-500 dark:bg-zinc-400",
  "bg-zinc-400 dark:bg-zinc-500",
  "bg-amber-500 dark:bg-amber-400",
  "bg-zinc-300 dark:bg-zinc-600",
];

export default function MortgagePaymentChart({
  pi,
  escrowTaxMonthly,
  escrowInsMonthly,
  pmiMonthly,
  hoaMonthly = 0,
}: Props) {
  const segments = [
    { label: "P&I", value: pi },
    { label: "Tax", value: escrowTaxMonthly },
    { label: "Insurance", value: escrowInsMonthly },
    ...(pmiMonthly > 0 ? [{ label: "PMI", value: pmiMonthly }] : []),
    ...(hoaMonthly > 0 ? [{ label: "HOA", value: hoaMonthly }] : []),
  ].filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;

  return (
    <div>
      <div className="h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className={`h-full ${COLORS[i % COLORS.length]} transition-all duration-500`}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${formatMoney(s.value)}`}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${COLORS[i % COLORS.length]}`} />
            <span className="text-zinc-600 dark:text-zinc-400">{s.label}</span>
            <span className="ml-auto font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatMoney(s.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
