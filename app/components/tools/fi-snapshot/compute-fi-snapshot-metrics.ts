import type { FiSnapshotJourneyAnswers } from "./fi-snapshot-journey-types";

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
