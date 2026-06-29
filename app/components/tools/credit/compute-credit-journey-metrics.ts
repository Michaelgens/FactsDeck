import type { CreditJourneyAnswers, CreditJourneyGoal } from "./credit-journey-types";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function roundScore(n: number) {
  return Math.round(clamp(n, 300, 850));
}

type FactorKey = "utilization" | "payment" | "age" | "inquiries" | "mix";

function factorPoints(input: {
  utilizationPct: number;
  onTimePct: number;
  avgAgeYears: number;
  hardInquiries12m: number;
  accountTypes: number;
}): Record<FactorKey, number> {
  const u = clamp(input.utilizationPct, 0, 100);
  const utilization = Math.round(165 * (1 - u / 100));

  const ot = clamp(input.onTimePct, 0, 100);
  const payment = Math.round(192 * (ot / 100));

  const y = clamp(input.avgAgeYears, 0, 30);
  const age = Math.round(Math.min(82, (y / 25) * 82));

  const hi = clamp(input.hardInquiries12m, 0, 20);
  const inquiries = Math.max(0, Math.round(55 - hi * 4.5));

  const t = clamp(input.accountTypes, 1, 6);
  const mix = Math.min(55, Math.round((t / 5) * 55));

  return { utilization, payment, age, inquiries, mix };
}

function band(score: number): { name: string } {
  if (score < 580) return { name: "Poor" };
  if (score < 670) return { name: "Fair" };
  if (score < 740) return { name: "Good" };
  if (score < 800) return { name: "Very good" };
  return { name: "Excellent" };
}

export function computeCreditJourneyMetrics(a: CreditJourneyAnswers) {
  const pts = factorPoints({
    utilizationPct: a.utilizationPct,
    onTimePct: a.onTimePct,
    avgAgeYears: a.avgAgeYears,
    hardInquiries12m: a.hardInquiries12m,
    accountTypes: a.accountTypes,
  });
  const raw = 300 + pts.utilization + pts.payment + pts.age + pts.inquiries + pts.mix;
  const score = roundScore(raw);
  const b = band(score);
  return { score, bandName: b.name, pts };
}

export function computeCreditReadinessScore(m: ReturnType<typeof computeCreditJourneyMetrics>): number {
  return Math.round(((m.score - 300) / 550) * 100);
}

export function buildCreditTextSummary(
  a: CreditJourneyAnswers,
  m: ReturnType<typeof computeCreditJourneyMetrics>
): string {
  const goalLabel =
    a.goal === "improve" ? "Improve score" : a.goal === "learn" ? "Learn factors" : "Exploring";
  return [
    "Facts Deck Credit Test — summary",
    `Goal: ${goalLabel}`,
    `Simulated score: ${m.score} (${m.bandName})`,
    `Utilization ${a.utilizationPct}% | On-time ${a.onTimePct}%`,
    `Avg age ${a.avgAgeYears} yr | Inquiries ${a.hardInquiries12m} | Types ${a.accountTypes}`,
    `Factor points (illustrative): util ${m.pts.utilization} | pay ${m.pts.payment} | age ${m.pts.age} | inq ${m.pts.inquiries} | mix ${m.pts.mix}`,
    `Readiness score: ${computeCreditReadinessScore(m)}/100`,
  ].join("\n");
}

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function suggestRelatedTools(goal: CreditJourneyGoal, a: CreditJourneyAnswers): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (!out.some((t) => t.slug === slug)) out.push({ slug, name, reason });
  };

  const m = computeCreditJourneyMetrics(a);

  if (a.utilizationPct >= 25 || goal === "improve") {
    push("debt-payoff-planner", "Debt Payoff Planner", "Pay down revolving balances to lower utilization faster.");
  }
  if (a.utilizationPct >= 20 || goal === "improve") {
    push("budget-planner", "Budget Planner", "Find room in your monthly plan to pay cards before statement close.");
  }
  if (m.score < 700) {
    push("loan-calculator", "Loan Calculator", "See how rate bands might shift as your score band improves.");
  }
  if (a.hardInquiries12m >= 2) {
    push("subscription-spend-audit", "Subscription Audit", "Trim recurring costs before opening new credit lines.");
  }
  push("emergency-fund-calculator", "Emergency Fund & Runway", "Avoid leaning on cards when cash flow gets tight.");

  return out.slice(0, 4);
}
