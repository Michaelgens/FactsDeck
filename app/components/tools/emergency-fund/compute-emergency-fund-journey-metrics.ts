import type { EmergencyFundJourneyAnswers } from "./emergency-fund-journey-types";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function formatEfMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function computeEmergencyFundJourneyMetrics(a: EmergencyFundJourneyAnswers) {
  const ess = Math.max(0, a.monthlyEssentials);
  const fund = Math.max(0, a.currentFund);
  const contrib = Math.max(0, a.monthlyContribution);
  const targetMonths = clamp(Math.round(a.targetMonths), 1, 120);

  const runwayMonths = ess > 0 ? fund / ess : 0;
  const targetBalance = ess * targetMonths;
  const gap = Math.max(0, targetBalance - fund);
  const pctOfTarget = targetBalance > 0 ? Math.min(100, (fund / targetBalance) * 100) : 0;

  let monthsToTarget: number | null = null;
  if (gap <= 0) monthsToTarget = 0;
  else if (contrib > 0) monthsToTarget = Math.ceil(gap / contrib);
  else monthsToTarget = null;

  return {
    runwayMonths,
    targetBalance,
    gap,
    pctOfTarget,
    monthsToTarget,
    targetMonths,
  };
}
