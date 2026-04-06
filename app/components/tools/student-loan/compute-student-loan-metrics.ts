import type { StudentLoanJourneyAnswers } from "./student-loan-journey-types";

/** Approximate contiguous US federal poverty guidelines (annual) — educational model only. */
export function federalPovertyLineAnnual(familySize: number): number {
  const n = Math.round(Math.min(8, Math.max(1, familySize)));
  const table: Record<number, number> = {
    1: 15_060,
    2: 20_440,
    3: 25_820,
    4: 31_200,
    5: 36_580,
    6: 41_960,
    7: 47_340,
    8: 52_720,
  };
  if (n <= 8) return table[n];
  return table[8] + (n - 8) * 5_380;
}

export function discretionaryIncomeAnnual(annualIncome: number, familySize: number) {
  const fpl = federalPovertyLineAnnual(familySize);
  return Math.max(0, annualIncome - 1.5 * fpl);
}

/** Fixed-rate level payment (student loans often use similar amortization for standard plans). */
export function levelMonthlyPayment(principal: number, aprPercent: number, termMonths: number) {
  const n = Math.max(1, Math.round(termMonths));
  const r = aprPercent / 100 / 12;
  if (r <= 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

export function simulateStandardPayoff(principal: number, aprPercent: number, termMonths: number) {
  const pmt = levelMonthlyPayment(principal, aprPercent, termMonths);
  const r = aprPercent / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  const cap = Math.min(600, Math.max(1, Math.round(termMonths)));
  for (let i = 0; i < cap; i++) {
    if (balance <= 0.01) break;
    const interest = balance * r;
    totalInterest += interest;
    const princ = pmt - interest;
    balance -= princ;
  }
  return {
    monthlyPayment: pmt,
    totalInterest,
    months: cap,
  };
}

/**
 * Illustrative IDR-style payment: (idrPercentOfDiscretionary / 100) × discretionary income per year, spread monthly.
 * Real plans (SAVE, PAYE, etc.) differ; this is a teaching shortcut only.
 */
export function idrIllustrativeMonthly(
  annualIncome: number,
  familySize: number,
  idrPercentOfDiscretionary: number
) {
  const disc = discretionaryIncomeAnnual(annualIncome, familySize);
  const pct = Math.max(0, Math.min(25, idrPercentOfDiscretionary)) / 100;
  return (disc * pct) / 12;
}

export function simulateIdrPath(
  principal: number,
  aprPercent: number,
  monthlyPayment: number,
  maxMonths: number
) {
  const r = aprPercent / 100 / 12;
  let balance = principal;
  let totalInterestAccrued = 0;
  let totalPaid = 0;
  let month = 0;
  const cap = Math.min(600, Math.max(1, Math.round(maxMonths)));

  for (; month < cap; month++) {
    if (balance <= 0.02) break;
    const interest = balance * r;
    totalInterestAccrued += interest;
    balance += interest;
    const pay = Math.min(Math.max(0, monthlyPayment), balance);
    balance -= pay;
    totalPaid += pay;
  }

  const paidOff = balance <= 0.02;
  return {
    endingBalance: Math.max(0, balance),
    monthsElapsed: month,
    totalInterestAccrued,
    totalPaid,
    paidOff,
  };
}

export function computeStudentLoanJourneyMetrics(
  a: StudentLoanJourneyAnswers,
  options?: { standardTermYears?: number; idrPercentOfDiscretionary?: number; idrHorizonYears?: number }
) {
  const termYears = options?.standardTermYears ?? 10;
  const termMonths = termYears * 12;
  const idrPct = options?.idrPercentOfDiscretionary ?? 10;
  const horizonYears = options?.idrHorizonYears ?? 20;

  const balance = Math.max(0, a.balance);
  const apr = Math.max(0, a.aprPercent);
  const income = Math.max(0, a.annualIncome);
  const fam = Math.max(1, Math.round(a.familySize));

  const discAnnual = discretionaryIncomeAnnual(income, fam);
  const idrMonthly = idrIllustrativeMonthly(income, fam, idrPct);

  const std = simulateStandardPayoff(balance, apr, termMonths);
  const firstMonthInterest = balance * (apr / 100 / 12);
  const idrBelowInterest = idrMonthly > 0 && idrMonthly < firstMonthInterest - 0.001;

  const idrAfter20y = simulateIdrPath(balance, apr, idrMonthly, 20 * 12);
  const idrAfter25y = simulateIdrPath(balance, apr, idrMonthly, 25 * 12);
  const idrAtHorizon = simulateIdrPath(balance, apr, idrMonthly, Math.min(600, Math.max(12, horizonYears * 12)));

  return {
    discretionaryAnnual: discAnnual,
    discretionaryMonthly: discAnnual / 12,
    standardMonthly: std.monthlyPayment,
    standardTotalInterest: std.totalInterest,
    standardTermMonths: termMonths,
    idrMonthly,
    idrPercentOfDiscretionary: idrPct,
    firstMonthInterest,
    idrBelowInterest,
    idrAfter20y,
    idrAfter25y,
    idrAtHorizon,
  };
}

export function formatSlMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
