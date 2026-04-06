import type { RetirementJourneyAnswers } from "./retirement-journey-types";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function formatRetireMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function computeRetirementJourneyMetrics(a: RetirementJourneyAnswers) {
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
