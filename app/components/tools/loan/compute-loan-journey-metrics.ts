import type { LoanJourneyAnswers } from "./loan-journey-types";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Monthly P&I for fixed-rate amortizing loan. APR as percent e.g. 7.25 */
function monthlyPI(principal: number, aprPercent: number, termMonths: number): number {
  const n = Math.max(1, Math.round(termMonths));
  const r = aprPercent / 100 / 12;
  if (r <= 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

function buildAmortization(
  principal: number,
  aprPercent: number,
  termMonths: number,
  extraMonthly: number
): { totalInterest: number; actualMonths: number; monthlyPayment: number } {
  const r = aprPercent / 100 / 12;
  const scheduled = monthlyPI(principal, aprPercent, termMonths);
  const extra = Math.max(0, extraMonthly);
  let balance = principal;
  let totalInterest = 0;
  let month = 0;
  const cap = 600;

  while (balance > 0.01 && month < cap) {
    month++;
    const interest = balance * r;
    let principalPay = scheduled + extra - interest;
    if (principalPay > balance) principalPay = balance;
    if (principalPay < 0) principalPay = 0;
    balance -= principalPay;
    totalInterest += interest;
  }

  return { totalInterest, actualMonths: month, monthlyPayment: scheduled };
}

export function formatLoanMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function computeLoanJourneyMetrics(a: LoanJourneyAnswers) {
  const termMonths = Math.max(1, Math.round(a.termYears * 12));
  const principal = clamp(a.principal, 0, 10_000_000);
  const apr = clamp(a.apr, 0.1, 40);
  const extra = Math.max(0, a.extraMonthly);
  const feeAmount = principal * clamp(a.feePct / 100, 0, 0.1);

  const base = buildAmortization(principal, apr, termMonths, extra);
  const noExtra = buildAmortization(principal, apr, termMonths, 0);
  const interestSaved = Math.max(0, noExtra.totalInterest - base.totalInterest);

  return {
    monthlyPayment: base.monthlyPayment,
    totalInterest: base.totalInterest,
    payoffMonths: base.actualMonths,
    interestSavedWithExtra: interestSaved,
    feeAmount,
    termMonths,
  };
}
