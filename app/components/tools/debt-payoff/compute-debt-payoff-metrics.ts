import type { DebtJourneyAnswers, DebtPayoffGoal } from "./debt-payoff-journey-types";

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

export function totalDebtFromAnswers(a: DebtJourneyAnswers): number {
  return Math.max(0, a.debt1Balance) + Math.max(0, a.debt2Balance);
}

export function totalMinsFromAnswers(a: DebtJourneyAnswers): number {
  return Math.max(0, a.debt1Min) + Math.max(0, a.debt2Min);
}

export function maxAprFromAnswers(a: DebtJourneyAnswers): number {
  return Math.max(a.debt1Apr, a.debt2Apr);
}

export function totalDebtFromLines(debts: DebtLineInput[]): number {
  return debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
}

export function totalMinsFromLines(debts: DebtLineInput[]): number {
  return debts.reduce((s, d) => s + Math.max(0, d.minPayment), 0);
}

export function maxAprFromLines(debts: DebtLineInput[]): number {
  return debts.reduce((m, d) => Math.max(m, d.aprPercent), 0);
}

export function computeDebtReadinessFromBands(
  totalDebt: number,
  totalMins: number,
  extraMonthly: number,
  maxApr: number
): number {
  const extraRatio = totalMins > 0 ? extraMonthly / totalMins : extraMonthly > 0 ? 0.5 : 0.2;
  const extraScore = extraRatio >= 0.5 ? 1 : extraRatio >= 0.25 ? 0.75 : extraRatio > 0 ? 0.55 : 0.35;
  const aprScore = maxApr <= 10 ? 1 : maxApr <= 18 ? 0.7 : maxApr <= 24 ? 0.45 : 0.25;
  const debtScore = totalDebt <= 10_000 ? 1 : totalDebt <= 25_000 ? 0.7 : totalDebt <= 50_000 ? 0.5 : 0.35;
  return Math.round((extraScore * 0.4 + aprScore * 0.35 + debtScore * 0.25) * 100);
}

export function computeDebtReadinessScore(a: DebtJourneyAnswers): number {
  return computeDebtReadinessFromBands(
    totalDebtFromAnswers(a),
    totalMinsFromAnswers(a),
    a.extraMonthly,
    maxAprFromAnswers(a)
  );
}

export function buildDebtTextSummary(a: DebtJourneyAnswers, m: ReturnType<typeof computeDebtPayoffJourneyMetrics>): string {
  const goalLabel =
    a.goal === "snowball"
      ? "Snowball"
      : a.goal === "avalanche"
        ? "Avalanche"
        : a.goal === "compare"
          ? "Compare both"
          : "Exploring";
  return [
    "Facts Deck Debt Payoff Test — summary",
    `Goal: ${goalLabel}`,
    `Debt 1: ${formatDebtMoney(a.debt1Balance)} @ ${a.debt1Apr.toFixed(2)}% | Min ${formatDebtMoney(a.debt1Min)}/mo`,
    `Debt 2: ${formatDebtMoney(a.debt2Balance)} @ ${a.debt2Apr.toFixed(2)}% | Min ${formatDebtMoney(a.debt2Min)}/mo`,
    `Extra toward debt: ${formatDebtMoney(a.extraMonthly)}/mo`,
    `Snowball: ${m.snowballMonths} mo | Interest ${formatDebtMoney(m.snowballInterest)}`,
    `Avalanche: ${m.avalancheMonths} mo | Interest ${formatDebtMoney(m.avalancheInterest)}`,
    `Readiness score: ${computeDebtReadinessScore(a)}/100`,
  ].join("\n");
}

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function suggestRelatedTools(goal: DebtPayoffGoal, a: DebtJourneyAnswers): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (!out.some((t) => t.slug === slug)) out.push({ slug, name, reason });
  };

  const totalDebt = totalDebtFromAnswers(a);
  const maxApr = maxAprFromAnswers(a);

  if (maxApr >= 15 || goal === "avalanche" || goal === "compare") {
    push("loan-calculator", "Loan Calculator", "Model a consolidation or refi loan against your cards.");
  }
  if (totalDebt >= 5_000) {
    push("budget-planner", "Budget Planner", "Find room in your monthly plan for extra debt payments.");
  }
  if (a.extraMonthly <= 50) {
    push("subscription-spend-audit", "Subscription Audit", "Trim recurring costs to boost your debt snowball.");
  }
  push("emergency-fund-calculator", "Emergency Fund & Runway", "Avoid new debt while you pay balances down.");
  if (goal === "exploring") {
    push("credit-score-simulator", "Credit Score Simulator", "See how payoff progress might affect your score band.");
  }

  return out.slice(0, 4);
}
