import { formatCurrency } from "../../../lib/mortgage-math";
import {
  afterTaxBalance,
  fireNumber,
  monteCarloPercentiles,
  passiveIncomeAtSwr,
  projectConstantReturn,
  yearsToReachTarget,
  type ProjectionInput,
} from "../../../lib/investment-math";
import type { InvestmentJourneyAnswers, InvestmentGoal } from "./investment-journey-types";

/** Fixed for journey snapshot; full calculator lets users tune. */
const JOURNEY_EXPENSE_RATIO = 0.08;
const JOURNEY_TAX_ON_GAINS = 15;
const JOURNEY_VOL = 16;
const JOURNEY_MC_ITERS = 250;

export type InvestmentJourneyMetrics = {
  baseInput: ProjectionInput;
  finalNominal: number;
  totalContributed: number;
  realFinal: number;
  gain: number;
  afterTaxApprox: number;
  fireTarget: number;
  yearsToFire: number | null;
  passiveIncomeAtTargetSwr: number;
  mc: { p10: number; p50: number; p90: number; mean: number };
};

export function computeInvestmentJourneyMetrics(a: InvestmentJourneyAnswers): InvestmentJourneyMetrics {
  const baseInput: ProjectionInput = {
    initial: Math.max(0, a.initial),
    monthlyContribution: Math.max(0, a.monthly),
    years: Math.min(45, Math.max(5, Math.round(a.years))),
    nominalAnnualPercent: Math.max(0, a.nominal),
    expenseRatioPercent: JOURNEY_EXPENSE_RATIO,
    inflationPercent: Math.max(0, a.inflation),
  };

  const projection = projectConstantReturn(baseInput);
  const realFinal = projection.series[projection.series.length - 1]?.realBalance ?? 0;
  const afterTaxApprox = afterTaxBalance(
    projection.finalNominal,
    projection.totalContributed,
    JOURNEY_TAX_ON_GAINS
  );
  const fireTarget = fireNumber(Math.max(0, a.annualSpend), Math.max(0.1, a.swr));
  const yearsToFire = yearsToReachTarget(baseInput, fireTarget);
  const passiveIncomeAtTargetSwr = passiveIncomeAtSwr(projection.finalNominal, Math.max(0.1, a.swr));

  const mc = monteCarloPercentiles(
    baseInput.initial,
    baseInput.monthlyContribution,
    baseInput.years,
    baseInput.nominalAnnualPercent,
    JOURNEY_VOL,
    JOURNEY_EXPENSE_RATIO,
    JOURNEY_MC_ITERS,
    42
  );

  return {
    baseInput,
    finalNominal: projection.finalNominal,
    totalContributed: projection.totalContributed,
    realFinal,
    gain: projection.gain,
    afterTaxApprox,
    fireTarget,
    yearsToFire,
    passiveIncomeAtTargetSwr,
    mc,
  };
}

export function formatInvestMoney(n: number): string {
  return formatCurrency(n);
}

export function computeInvestmentReadinessScore(
  a: InvestmentJourneyAnswers,
  m: InvestmentJourneyMetrics
): number {
  const contribScore =
    a.monthly >= 1000 ? 1 : a.monthly >= 500 ? 0.8 : a.monthly >= 200 ? 0.6 : 0.4;
  const horizonScore = a.years >= 20 ? 1 : a.years >= 10 ? 0.75 : 0.5;
  const fireScore =
    a.goal === "fire" && m.yearsToFire != null && m.yearsToFire <= a.years
      ? 1
      : a.goal === "fire"
        ? 0.4
        : 0.7;
  const gainRatio = m.totalContributed > 0 ? m.gain / m.totalContributed : 0;
  const growthScore = gainRatio >= 1 ? 1 : gainRatio >= 0.5 ? 0.75 : 0.55;
  return Math.round((contribScore * 0.3 + horizonScore * 0.25 + fireScore * 0.25 + growthScore * 0.2) * 100);
}

export function buildInvestmentTextSummary(a: InvestmentJourneyAnswers, m: InvestmentJourneyMetrics): string {
  const goalLabel =
    a.goal === "wealth" ? "Build wealth" : a.goal === "fire" ? "FIRE / retirement" : "Exploring";
  return [
    "Facts Deck Investment Test — summary",
    `Goal: ${goalLabel}`,
    `Starting balance: ${formatInvestMoney(a.initial)}`,
    `Monthly contribution: ${formatInvestMoney(a.monthly)}/mo`,
    `Horizon: ${a.years} years @ ${a.nominal.toFixed(2)}% nominal (0.08% expense drag in snapshot)`,
    `Inflation: ${a.inflation.toFixed(2)}%`,
    `Ending balance (nominal): ${formatInvestMoney(m.finalNominal)}`,
    `Purchasing power (est.): ${formatInvestMoney(m.realFinal)}`,
    `After-tax (simplified 15% on gains): ${formatInvestMoney(m.afterTaxApprox)}`,
    `FIRE target (${a.swr}% SWR, ${formatInvestMoney(a.annualSpend)}/yr spend): ${formatInvestMoney(m.fireTarget)}`,
    `Years to FIRE (simple model): ${m.yearsToFire != null ? `${m.yearsToFire} yr` : "Not reached in horizon"}`,
    `Passive income @ ${a.swr}% on ending balance: ${formatInvestMoney(m.passiveIncomeAtTargetSwr)}/yr`,
    `Monte Carlo (illustrative): p10 ${formatInvestMoney(m.mc.p10)} | p50 ${formatInvestMoney(m.mc.p50)} | p90 ${formatInvestMoney(m.mc.p90)}`,
    `Readiness score: ${computeInvestmentReadinessScore(a, m)}/100`,
  ].join("\n");
}

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function suggestRelatedTools(goal: InvestmentGoal, a: InvestmentJourneyAnswers): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (!out.some((t) => t.slug === slug)) out.push({ slug, name, reason });
  };

  if (goal === "fire" || a.annualSpend >= 50_000) {
    push("retirement-calculator", "Retirement Calculator", "Layer pension, Social Security, and drawdown on your FIRE target.");
    push("net-worth-fi-snapshot", "Net Worth & FI Snapshot", "See total assets vs your independence number.");
  }
  if (a.monthly < 500) {
    push("budget-planner", "Budget Planner", "Find room to increase monthly investing.");
    push("subscription-spend-audit", "Subscription Audit", "Redirect recurring spend into contributions.");
  }
  push("emergency-fund-calculator", "Emergency Fund & Runway", "Build a cash cushion before maxing market risk.");
  if (goal === "exploring") {
    push("loan-calculator", "Loan Calculator", "Compare paying debt down vs investing the same cash flow.");
  }

  return out.slice(0, 4);
}
