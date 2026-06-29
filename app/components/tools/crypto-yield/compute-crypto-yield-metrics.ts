import type { CompoundingMode, CryptoYieldGoal, CryptoYieldJourneyAnswers } from "./crypto-yield-journey-types";

export function periodsPerYear(c: CompoundingMode): number {
  switch (c) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "daily":
      return 365;
    default:
      return 12;
  }
}

/**
 * Future value treating `apyPercent` as a nominal annual rate compounded `n` times per year
 * (common simplification for headline staking APY—educational only).
 */
export function futureValueNominalApy(
  principal: number,
  apyPercent: number,
  compounding: CompoundingMode,
  years: number
) {
  const p = Math.max(0, principal);
  const n = periodsPerYear(compounding);
  const y = Math.max(0, years);
  const r = apyPercent / 100 / n;
  const totalPeriods = Math.round(n * y);
  if (totalPeriods <= 0) return p;
  return p * Math.pow(1 + r, totalPeriods);
}

/** Effective annual yield implied by the end balance (for the same horizon). */
export function effectiveAnnualYield(principal: number, endingBalance: number, years: number) {
  if (principal <= 0 || years <= 0) return 0;
  return (Math.pow(endingBalance / principal, 1 / years) - 1) * 100;
}

/** Convert nominal APR to APY at n compounding periods per year. */
export function apyFromApr(aprPercent: number, nPerYear: number) {
  const n = Math.max(1, nPerYear);
  const r = aprPercent / 100 / n;
  return (Math.pow(1 + r, n) - 1) * 100;
}

export function computeCryptoYieldJourneyMetrics(a: CryptoYieldJourneyAnswers) {
  const years = Math.max(0, a.months) / 12;
  const fv = futureValueNominalApy(a.principal, a.apyPercent, a.compounding, years);
  const interest = Math.max(0, fv - a.principal);
  const effApy = years > 0 ? effectiveAnnualYield(a.principal, fv, years) : 0;

  const fvDaily = futureValueNominalApy(a.principal, a.apyPercent, "daily", years);
  const fvMonthly = futureValueNominalApy(a.principal, a.apyPercent, "monthly", years);
  const fvAnnual = futureValueNominalApy(a.principal, a.apyPercent, "annual", years);

  return {
    futureValue: fv,
    interestEarned: interest,
    effectiveApyPercent: years > 0 ? effApy : 0,
    compareAtHorizon: {
      daily: { fv: fvDaily, interest: fvDaily - a.principal },
      monthly: { fv: fvMonthly, interest: fvMonthly - a.principal },
      annual: { fv: fvAnnual, interest: fvAnnual - a.principal },
    },
    years,
  };
}

export type CryptoYieldMetrics = ReturnType<typeof computeCryptoYieldJourneyMetrics>;

export function computeCryptoYieldReadinessScore(a: CryptoYieldJourneyAnswers, m: CryptoYieldMetrics): number {
  const apyScore = a.apyPercent >= 3 && a.apyPercent <= 15 ? 1 : a.apyPercent > 0 ? 0.6 : 0.3;
  const horizonScore = a.months >= 12 ? 1 : a.months >= 6 ? 0.75 : 0.5;
  const spread =
    m.compareAtHorizon.daily.fv > 0
      ? (m.compareAtHorizon.daily.fv - m.compareAtHorizon.annual.fv) / m.compareAtHorizon.daily.fv
      : 0;
  const compoundScore = a.goal === "compare" && spread > 0.001 ? 1 : a.compounding === "daily" ? 0.85 : 0.7;
  const principalScore = a.principal >= 1000 ? 1 : a.principal >= 500 ? 0.75 : 0.55;
  return Math.round((apyScore * 0.25 + horizonScore * 0.25 + compoundScore * 0.25 + principalScore * 0.25) * 100);
}

const GOAL_LABEL: Record<CryptoYieldGoal, string> = {
  compounding: "Compounding",
  compare: "Compare frequencies",
  exploring: "Exploring",
};

const COMP_LABEL: Record<CompoundingMode, string> = {
  daily: "Daily",
  monthly: "Monthly",
  annual: "Annual",
};

export function buildCryptoYieldTextSummary(a: CryptoYieldJourneyAnswers, m: CryptoYieldMetrics): string {
  return [
    "Facts Deck Crypto Yield Lab Test — summary",
    `Goal: ${GOAL_LABEL[a.goal]}`,
    `Principal: ${formatCyMoney(a.principal)} | Nominal APY: ${a.apyPercent.toFixed(2)}%`,
    `Horizon: ${a.months} mo | Compounding: ${COMP_LABEL[a.compounding]}`,
    `Ending balance: ${formatCyMoney(m.futureValue)}`,
    `Interest (illustrative): ${formatCyMoney(m.interestEarned)}`,
    `Effective APY (from path): ${m.effectiveApyPercent.toFixed(2)}%`,
    `Same APY — daily FV: ${formatCyMoney(m.compareAtHorizon.daily.fv)} | monthly: ${formatCyMoney(m.compareAtHorizon.monthly.fv)} | annual: ${formatCyMoney(m.compareAtHorizon.annual.fv)}`,
    `Readiness score: ${computeCryptoYieldReadinessScore(a, m)}/100`,
    "Educational model only — not investment advice.",
  ].join("\n");
}

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function suggestRelatedTools(goal: CryptoYieldGoal, a: CryptoYieldJourneyAnswers): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (!out.some((t) => t.slug === slug)) out.push({ slug, name, reason });
  };

  if (goal === "compounding" || goal === "compare") {
    push("investment-calculator", "Investment Calculator", "Compare traditional compounding with fees and taxes.");
    push("net-worth-fi-snapshot", "Net Worth & FI Snapshot", "See how yield fits your broader independence picture.");
  }
  if (a.apyPercent >= 8) {
    push("emergency-fund-calculator", "Emergency Fund & Runway", "High headline yields don't replace liquid cash reserves.");
  }
  if (a.principal < 1000) {
    push("budget-planner", "Budget Planner", "Find cash flow to grow principal before chasing yield.");
  }
  if (goal === "exploring") {
    push("loan-calculator", "Loan Calculator", "Contrast opportunity cost of debt vs staking returns.");
  }

  return out.slice(0, 4);
}

export function formatCyMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}
