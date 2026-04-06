import type { BudgetJourneyAnswers } from "./budget-journey-types";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function formatBudgetMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function computeBudgetJourneyMetrics(a: BudgetJourneyAnswers) {
  const bufferPct = clamp(a.bufferPct, 0, 0.25);
  const income = Math.max(0, a.incomeMonthly);
  const bufferMonthly = income * bufferPct;
  const available = income - bufferMonthly;
  const targets =
    a.mode === "50-30-20"
      ? {
          needs: available * 0.5,
          wants: available * 0.3,
          savingsDebt: available * 0.2,
        }
      : null;

  return {
    bufferMonthly,
    available,
    targets,
    bufferPct,
  };
}
