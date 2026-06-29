import type { FiSnapshotGoal, FiSnapshotJourneyAnswers } from "./fi-snapshot-journey-types";

export function formatFiMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export type FiSnapshotInputs = {
  liquidCash: number;
  invested: number;
  otherAssets: number;
  liabilities: number;
  monthlyExpenses: number;
  monthlyInvesting: number;
  /** Annual withdrawal rate for FI number, e.g. 4 = 4% rule */
  withdrawalRatePct: number;
  /** Nominal annual return for years-to-FI estimate (e.g. 0.07) */
  investmentReturnAnnual: number;
};

const MAX_MONTHS = 600;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Months until balance reaches target with monthly contributions and compound growth. */
export function monthsToReachFi(
  startBalance: number,
  monthlyContribution: number,
  target: number,
  annualReturn: number
): number | null {
  if (target <= 0) return 0;
  if (startBalance >= target) return 0;
  if (monthlyContribution <= 0) return null;

  const r = annualReturn / 12;
  let bal = Math.max(0, startBalance);
  const pmt = monthlyContribution;

  for (let m = 1; m <= MAX_MONTHS; m++) {
    bal = bal * (1 + r) + pmt;
    if (bal >= target - 0.01) return m;
  }
  return null;
}

export type FreedomBand =
  | "launchpad"
  | "foundation"
  | "trajectory"
  | "approach"
  | "orbit"
  | "independence";

export function freedomBand(fiProgressPct: number, monthsOfExpenses: number): FreedomBand {
  if (fiProgressPct >= 100) return "independence";
  if (fiProgressPct >= 75) return "orbit";
  if (fiProgressPct >= 40) return "approach";
  if (monthsOfExpenses >= 12 || fiProgressPct >= 15) return "trajectory";
  if (monthsOfExpenses >= 3 || fiProgressPct >= 5) return "foundation";
  return "launchpad";
}

export const FREEDOM_BAND_COPY: Record<
  FreedomBand,
  { title: string; blurb: string }
> = {
  launchpad: {
    title: "Launchpad",
    blurb: "Net worth is still finding its footing—small wins compound.",
  },
  foundation: {
    title: "Foundation",
    blurb: "Liquidity and habits are forming—keep stacking evidence you can save.",
  },
  trajectory: {
    title: "Trajectory",
    blurb: "Your runway is stretching; the FI math is starting to feel real.",
  },
  approach: {
    title: "Approach",
    blurb: "You are closing the gap—tune expenses and savings with intention.",
  },
  orbit: {
    title: "Orbit",
    blurb: "You are circling independence—sequence of risk and tax matters more than ever.",
  },
  independence: {
    title: "Independence (illustrative)",
    blurb: "On paper you clear a classic FI checkpoint—lifestyle, taxes, and sequence still deserve a plan.",
  },
};

export function computeFiSnapshotMetrics(
  a: FiSnapshotJourneyAnswers,
  options?: { withdrawalRatePct?: number; investmentReturnAnnual?: number }
) {
  const withdrawalRatePct = clamp(options?.withdrawalRatePct ?? 4, 1, 10);
  const investmentReturnAnnual = clamp(options?.investmentReturnAnnual ?? 0.07, 0, 0.15);

  const liquidCash = Math.max(0, a.liquidCash);
  const invested = Math.max(0, a.invested);
  const otherAssets = Math.max(0, a.otherAssets);
  const liabilities = Math.max(0, a.liabilities);

  const totalAssets = liquidCash + invested + otherAssets;
  const netWorth = totalAssets - liabilities;

  const monthlyExpenses = Math.max(0, a.monthlyExpenses);
  const annualExpenses = monthlyExpenses * 12;
  const monthlyInvesting = Math.max(0, a.monthlyInvesting);

  const wr = withdrawalRatePct / 100;
  const fiNumber = wr > 0 && annualExpenses > 0 ? annualExpenses / wr : 0;

  let fiProgressPct = 0;
  if (fiNumber > 0 && netWorth > 0) fiProgressPct = clamp((netWorth / fiNumber) * 100, 0, 999);
  else if (netWorth <= 0) fiProgressPct = 0;

  const monthsOfExpenses = monthlyExpenses > 0 && netWorth > 0 ? netWorth / monthlyExpenses : netWorth > 0 ? Infinity : 0;

  const band = freedomBand(fiProgressPct, Number.isFinite(monthsOfExpenses) ? monthsOfExpenses : 0);

  const gapToFi = Math.max(0, fiNumber - netWorth);
  const monthsToFi = monthsToReachFi(netWorth, monthlyInvesting, fiNumber, investmentReturnAnnual);
  const yearsToFi = monthsToFi == null ? null : Math.round((monthsToFi / 12) * 10) / 10;

  // Lifestyle tiers (creative): lean / standard / fat annual spend multiples
  const leanFiNumber = annualExpenses > 0 && wr > 0 ? (annualExpenses * 0.75) / wr : 0;
  const fatFiNumber = annualExpenses > 0 && wr > 0 ? (annualExpenses * 1.5) / wr : 0;

  return {
    totalAssets,
    netWorth,
    fiNumber,
    fiProgressPct,
    annualExpenses,
    monthlyExpenses,
    monthlyInvesting,
    withdrawalRatePct,
    investmentReturnAnnual,
    monthsOfExpenses: Number.isFinite(monthsOfExpenses) ? monthsOfExpenses : 0,
    gapToFi,
    monthsToFi,
    yearsToFi,
    band,
    leanFiNumber,
    fatFiNumber,
  };
}

export type FiSnapshotMetrics = ReturnType<typeof computeFiSnapshotMetrics>;

export function computeFiSnapshotReadinessScore(
  a: FiSnapshotJourneyAnswers,
  m: FiSnapshotMetrics
): number {
  const investingScore =
    a.monthlyInvesting >= 2000 ? 1 : a.monthlyInvesting >= 1000 ? 0.85 : a.monthlyInvesting >= 500 ? 0.65 : 0.45;
  const progressScore =
    m.fiProgressPct >= 100 ? 1 : m.fiProgressPct >= 75 ? 0.85 : m.fiProgressPct >= 40 ? 0.65 : m.fiProgressPct >= 15 ? 0.5 : 0.35;
  const runwayScore =
    m.monthsOfExpenses >= 12 ? 1 : m.monthsOfExpenses >= 6 ? 0.75 : m.monthsOfExpenses >= 3 ? 0.55 : 0.35;
  const netWorthScore = m.netWorth > 0 ? 1 : m.netWorth === 0 ? 0.4 : 0.2;
  const goalScore = a.goal === "freedom" && m.fiProgressPct >= 50 ? 1 : a.goal === "freedom" ? 0.5 : 0.75;
  return Math.round(
    (investingScore * 0.25 + progressScore * 0.3 + runwayScore * 0.2 + netWorthScore * 0.15 + goalScore * 0.1) * 100
  );
}

const GOAL_LABEL: Record<FiSnapshotGoal, string> = {
  freedom: "Freedom runway",
  clarity: "Clarity",
  milestone: "Milestone check",
  exploring: "Exploring",
};

export function buildFiSnapshotTextSummary(a: FiSnapshotJourneyAnswers, m: FiSnapshotMetrics): string {
  const band = FREEDOM_BAND_COPY[m.band];
  return [
    "Facts Deck Freedom Snapshot — summary",
    `Mindset: ${GOAL_LABEL[a.goal]}`,
    `Assets — Cash ${formatFiMoney(a.liquidCash)}, Invested ${formatFiMoney(a.invested)}, Other ${formatFiMoney(a.otherAssets)}`,
    `Liabilities: ${formatFiMoney(a.liabilities)}`,
    `Monthly expenses: ${formatFiMoney(a.monthlyExpenses)} | Investing: ${formatFiMoney(a.monthlyInvesting)}/mo`,
    `Net worth: ${formatFiMoney(m.netWorth)}`,
    `FI number (~${m.withdrawalRatePct}% rule): ${formatFiMoney(m.fiNumber)}`,
    `FI progress: ${m.fiProgressPct.toFixed(1)}%`,
    `Freedom band: ${band.title}`,
    m.yearsToFi != null
      ? `Illustrative years to FI (${Math.round(m.investmentReturnAnnual * 1000) / 10}% nominal): ~${m.yearsToFi} yr`
      : "Years to FI: add monthly investing to estimate",
    `Readiness score: ${computeFiSnapshotReadinessScore(a, m)}/100`,
  ].join("\n");
}

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function suggestRelatedTools(goal: FiSnapshotGoal, a: FiSnapshotJourneyAnswers): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (!out.some((t) => t.slug === slug)) out.push({ slug, name, reason });
  };

  if (goal === "freedom" || a.monthlyInvesting >= 1000) {
    push("investment-calculator", "Investment Calculator", "Model growth, fees, and Monte Carlo on your investing rate.");
    push("retirement-calculator", "Retirement Calculator", "Layer accounts, Social Security, and drawdown timing.");
  }
  if (a.liabilities > a.liquidCash + a.invested * 0.1) {
    push("debt-payoff-planner", "Debt Payoff Planner", "Compare avalanche vs snowball to lift net worth faster.");
  }
  if (a.monthlyExpenses >= 4000) {
    push("budget-planner", "Budget Planner", "Find spend you can redirect into investing.");
    push("subscription-spend-audit", "Subscription Audit", "Trim recurring burn to widen your FI gap.");
  }
  push("emergency-fund-calculator", "Emergency Fund & Runway", "Strengthen cash before chasing higher FI progress.");

  return out.slice(0, 4);
}
