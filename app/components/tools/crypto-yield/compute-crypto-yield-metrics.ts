import type { CompoundingMode, CryptoYieldJourneyAnswers } from "./crypto-yield-journey-types";

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

export function formatCyMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}
