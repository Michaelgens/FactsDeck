import type { RetirementGoal, RetirementJourneyAnswers } from "./retirement-journey-types";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export type RetirementJourneyMetrics = {
  years: number;
  spendAtRetire: number;
  fiNumber: number;
  balanceAtRetire: number;
  onTrack: boolean;
  gap: number;
};

export function formatRetireMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function computeRetirementJourneyMetrics(a: RetirementJourneyAnswers): RetirementJourneyMetrics {
  const years = Math.max(0, Math.round(a.retireAge - a.currentAge));
  const inf = clamp(a.inflation / 100, 0, 0.2);
  const r = clamp(a.returnNominal / 100, -0.1, 0.2);
  const wr = clamp(a.withdrawalRate / 100, 0.01, 0.15);
  const spendAtRetire = a.annualSpendingToday * Math.pow(1 + inf, years);
  const fiNumber = spendAtRetire / wr;

  let bal = Math.max(0, a.totalBalance);
  const contribAnnual = Math.max(0, a.contributionMonthly) * 12;
  for (let i = 0; i < years; i++) {
    bal = bal * (1 + r) + contribAnnual;
  }
  const balanceAtRetire = bal;
  const onTrack = balanceAtRetire >= fiNumber;
  const gap = fiNumber - balanceAtRetire;

  return {
    years,
    spendAtRetire,
    fiNumber,
    balanceAtRetire,
    onTrack,
    gap,
  };
}

export function computeRetirementReadinessScore(
  a: RetirementJourneyAnswers,
  m: RetirementJourneyMetrics
): number {
  const contribScore =
    a.contributionMonthly >= 1000 ? 1 : a.contributionMonthly >= 500 ? 0.8 : a.contributionMonthly >= 200 ? 0.6 : 0.4;
  const timelineScore = m.years >= 15 && m.years <= 35 ? 1 : m.years >= 10 ? 0.75 : 0.5;
  const gapRatio = m.fiNumber > 0 ? m.gap / m.fiNumber : 1;
  const trackScore = m.onTrack ? 1 : gapRatio < 0.25 ? 0.7 : gapRatio < 0.5 ? 0.5 : 0.35;
  const fireScore = a.goal === "fire" && m.onTrack ? 1 : a.goal === "fire" ? 0.45 : 0.75;
  return Math.round((contribScore * 0.25 + timelineScore * 0.2 + trackScore * 0.35 + fireScore * 0.2) * 100);
}

const GOAL_LABEL: Record<RetirementGoal, string> = {
  retire: "Traditional retirement",
  fire: "FIRE / work optional",
  exploring: "Exploring",
};

export function buildRetirementTextSummary(a: RetirementJourneyAnswers, m: RetirementJourneyMetrics): string {
  return [
    "Facts Deck Retirement Test — summary",
    `Goal: ${GOAL_LABEL[a.goal]}`,
    `Ages: ${a.currentAge} → retire ${a.retireAge} (${m.years} yr)`,
    `Spending today: ${formatRetireMoney(a.annualSpendingToday)}/yr`,
    `Portfolio: ${formatRetireMoney(a.totalBalance)} + ${formatRetireMoney(a.contributionMonthly)}/mo`,
    `Inflation ${a.inflation.toFixed(1)}% | Return ${a.returnNominal.toFixed(1)}% | WR ${a.withdrawalRate.toFixed(1)}%`,
    `Spending at retire (nominal est.): ${formatRetireMoney(m.spendAtRetire)}/yr`,
    `FI number (simple): ${formatRetireMoney(m.fiNumber)}`,
    `Projected balance at retire (simple): ${formatRetireMoney(m.balanceAtRetire)}`,
    m.onTrack ? "Status: On track (simple model)" : `Gap: ${formatRetireMoney(m.gap)}`,
    `Readiness score: ${computeRetirementReadinessScore(a, m)}/100`,
  ].join("\n");
}

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function suggestRelatedTools(goal: RetirementGoal, a: RetirementJourneyAnswers): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (!out.some((t) => t.slug === slug)) out.push({ slug, name, reason });
  };

  if (goal === "fire" || a.retireAge <= 55) {
    push("investment-calculator", "Investment Calculator", "Stress-test growth rates and Monte Carlo on your path.");
    push("net-worth-fi-snapshot", "Net Worth & FI Snapshot", "Compare total assets to your independence number.");
  }
  if (a.contributionMonthly < 500) {
    push("budget-planner", "Budget Planner", "Find room to increase retirement contributions.");
    push("subscription-spend-audit", "Subscription Audit", "Redirect recurring spend into your 401(k) or IRA.");
  }
  push("emergency-fund-calculator", "Emergency Fund & Runway", "Secure cash reserves before maxing retirement risk.");
  if (goal === "exploring") {
    push("loan-calculator", "Loan Calculator", "Compare paying debt down vs boosting retirement savings.");
  }

  return out.slice(0, 4);
}
