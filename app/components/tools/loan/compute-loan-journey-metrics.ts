import type { LoanGoal, LoanJourneyAnswers } from "./loan-journey-types";

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

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function computeLoanReadinessFromBands(apr: number, extraMonthly: number, feePct: number): number {
  const aprScore = apr <= 5 ? 1 : apr <= 8 ? 0.75 : apr <= 12 ? 0.5 : 0.25;
  const extraScore = extraMonthly >= 100 ? 1 : extraMonthly >= 25 ? 0.75 : extraMonthly > 0 ? 0.55 : 0.35;
  const feeScore = feePct <= 0.5 ? 1 : feePct <= 2 ? 0.7 : feePct <= 5 ? 0.45 : 0.25;
  return Math.round((aprScore * 0.45 + extraScore * 0.3 + feeScore * 0.25) * 100);
}

export function computeLoanReadinessScore(a: LoanJourneyAnswers): number {
  return computeLoanReadinessFromBands(a.apr, a.extraMonthly, a.feePct);
}

export function buildLoanTextSummary(answers: LoanJourneyAnswers, m: ReturnType<typeof computeLoanJourneyMetrics>): string {
  const goalLabel =
    answers.goal === "auto"
      ? "Auto loan"
      : answers.goal === "personal"
        ? "Personal loan"
        : answers.goal === "refinance"
          ? "Refinance"
          : "Exploring";
  return [
    "Facts Deck Loan Test — summary",
    `Goal: ${goalLabel}`,
    `Principal: ${formatLoanMoney(answers.principal)}`,
    `APR: ${answers.apr.toFixed(2)}% · Term: ${answers.termYears} yr`,
    `Extra: ${formatLoanMoney(answers.extraMonthly)}/mo · Fee: ${answers.feePct.toFixed(1)}%`,
    `Monthly payment (P&I): ${formatLoanMoney(m.monthlyPayment)}`,
    `Total interest: ${formatLoanMoney(m.totalInterest)}`,
    `Payoff: ~${m.payoffMonths} mo · Interest saved vs no-extra: ${formatLoanMoney(m.interestSavedWithExtra)}`,
    `Readiness score: ${computeLoanReadinessScore(answers)}/100`,
  ].join("\n");
}

export function suggestRelatedTools(goal: LoanGoal, a: LoanJourneyAnswers): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (!out.some((t) => t.slug === slug)) out.push({ slug, name, reason });
  };

  if (goal === "refinance" || a.apr >= 10) {
    push("mortgage-calculator", "Mortgage Calculator", "Compare a refi against a full PITI picture.");
  }
  if (a.apr >= 8 || a.principal >= 15_000) {
    push("debt-payoff-planner", "Debt Payoff Planner", "Stack this loan against cards and other debts.");
  }
  if (goal === "auto" || goal === "personal") {
    push("budget-planner", "Budget Planner", "See how the payment fits your monthly cash flow.");
  }
  if (a.extraMonthly <= 0) {
    push("subscription-spend-audit", "Subscription Audit", "Find recurring costs to fund extra principal.");
  }
  if (goal === "exploring") {
    push("emergency-fund-calculator", "Emergency Fund & Runway", "Keep borrowing decisions aligned with your cushion.");
  }
  push("credit-score-simulator", "Credit Score Simulator", "See how rate bands might shift with score changes.");

  return out.slice(0, 4);
}
