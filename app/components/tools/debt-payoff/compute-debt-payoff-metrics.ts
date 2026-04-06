import type { DebtJourneyAnswers } from "./debt-payoff-journey-types";

export type DebtLineInput = {
  id: string;
  name: string;
  balance: number;
  aprPercent: number;
  minPayment: number;
};

export type PayoffStrategy = "snowball" | "avalanche";

const EPS = 0.02;
const MAX_MONTHS = 600;

function cloneDebts(debts: DebtLineInput[]): DebtLineInput[] {
  return debts.map((d) => ({
    ...d,
    balance: Math.max(0, d.balance),
    aprPercent: Math.max(0, d.aprPercent),
    minPayment: Math.max(0, d.minPayment),
  }));
}

/** Monthly interest from APR percent (e.g. 18.99). */
function monthlyInterest(balance: number, aprPercent: number) {
  return balance * (aprPercent / 100 / 12);
}

/**
 * Simulate paying minimums on all debts, then applying extra to the priority debt.
 * When a debt clears, its minimum rolls into the pool implicitly (still in active sum).
 */
export function simulateDebtPayoff(debtsInput: DebtLineInput[], strategy: PayoffStrategy, extraMonthly: number) {
  const debts = cloneDebts(debtsInput).filter((d) => d.balance > EPS || d.minPayment > 0);
  let totalInterest = 0;
  let months = 0;

  while (months < MAX_MONTHS) {
    const active = debts.filter((d) => d.balance > EPS);
    if (active.length === 0) break;
    months++;

    for (const d of debts) {
      if (d.balance <= EPS) continue;
      const intr = monthlyInterest(d.balance, d.aprPercent);
      totalInterest += intr;
      d.balance += intr;
    }

    const act = debts.filter((d) => d.balance > EPS);
    if (act.length === 0) break;

    const sumMins = act.reduce((s, d) => s + d.minPayment, 0);
    const pool = sumMins + Math.max(0, extraMonthly);
    if (pool <= EPS) {
      return { months: MAX_MONTHS, totalInterest: Infinity, paidOff: false };
    }

    const sorted = [...act].sort((a, b) => {
      if (strategy === "snowball") {
        if (a.balance !== b.balance) return a.balance - b.balance;
        return a.aprPercent - b.aprPercent;
      }
      if (a.aprPercent !== b.aprPercent) return b.aprPercent - a.aprPercent;
      return a.balance - b.balance;
    });
    const target = sorted[0];

    let remaining = pool;
    for (const d of act) {
      const pay = Math.min(d.minPayment, d.balance, remaining);
      d.balance -= pay;
      remaining -= pay;
    }
    if (remaining > EPS && target.balance > EPS) {
      const payExtra = Math.min(remaining, target.balance);
      target.balance -= payExtra;
    }
  }

  const paidOff = debts.every((d) => d.balance <= EPS);
  return {
    months,
    totalInterest: Number.isFinite(totalInterest) ? totalInterest : 0,
    paidOff: paidOff && months < MAX_MONTHS,
  };
}

export function journeyAnswersToDebts(a: DebtJourneyAnswers): DebtLineInput[] {
  return [
    {
      id: "1",
      name: "Debt 1",
      balance: a.debt1Balance,
      aprPercent: a.debt1Apr,
      minPayment: a.debt1Min,
    },
    {
      id: "2",
      name: "Debt 2",
      balance: a.debt2Balance,
      aprPercent: a.debt2Apr,
      minPayment: a.debt2Min,
    },
  ];
}

export function computeDebtPayoffJourneyMetrics(a: DebtJourneyAnswers) {
  const debts = journeyAnswersToDebts(a);
  const extra = Math.max(0, a.extraMonthly);

  const snow = simulateDebtPayoff(debts, "snowball", extra);
  const av = simulateDebtPayoff(debts, "avalanche", extra);

  return {
    snowballMonths: snow.months,
    snowballInterest: snow.totalInterest,
    snowballPaidOff: snow.paidOff,
    avalancheMonths: av.months,
    avalancheInterest: av.totalInterest,
    avalanchePaidOff: av.paidOff,
    interestDelta: av.totalInterest - snow.totalInterest,
    monthsDelta: snow.months - av.months,
  };
}

export function formatDebtMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
