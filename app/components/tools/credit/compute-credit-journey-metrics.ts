import type { CreditJourneyAnswers } from "./credit-journey-types";

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
