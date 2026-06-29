import {
  buildAmortizationSchedule,
  formatCurrency,
  maxLoanFromIncome,
  monthlyPI,
  monthlyPmiFromLoan,
  pmiCancellationBalance,
} from "../../../lib/mortgage-math";
import type { MortgageJourneyAnswers, BuyerGoal } from "./mortgage-journey-types";

/** Escrow assumptions for the quick journey (full calculator lets users edit). */
const DEFAULT_TAX_PCT = 1.15;
const INSURANCE_RATIO_OF_HOME = 0.0035;

export type JourneyMetrics = {
  pi: number;
  pitiFirstMonth: number;
  loanAmount: number;
  ltv: number;
  needsPmi: boolean;
  escrowTaxMonthly: number;
  escrowInsMonthly: number;
  pmiMonthly: number;
  totalInterest: number;
  totalPmi: number;
  payoffMonths: number;
  year1Interest: number;
  year1Principal: number;
  maxAffordLoan: number;
  maxAffordHome: number;
  housingDtiPct: number;
  dtiMessage: string;
};

export function computeJourneyMetrics(a: MortgageJourneyAnswers): JourneyMetrics {
  const homePrice = Math.max(0, a.homePrice);
  const downPercent = Math.min(100, Math.max(0, a.downPercent));
  const loanAmount = Math.max(0, homePrice * (1 - downPercent / 100));
  const ltv = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;
  const needsPmi = downPercent < 20;
  const termMonths = Math.round(Math.max(1, a.termYears)) * 12;
  const rate = Math.max(0, a.rate);

  const escrowTaxMonthly = (homePrice * (DEFAULT_TAX_PCT / 100)) / 12;
  const escrowInsMonthly = (homePrice * INSURANCE_RATIO_OF_HOME) / 12;
  const pmiAnnualPercent = 0.65;
  const pmiM = needsPmi && loanAmount > 0 ? monthlyPmiFromLoan(loanAmount, pmiAnnualPercent) : 0;
  const pmiDrop = needsPmi && homePrice > 0 ? pmiCancellationBalance(homePrice) : null;

  const pi = monthlyPI(loanAmount, rate, termMonths);

  const scheduleInput = {
    principal: loanAmount,
    annualRatePercent: rate,
    termMonths,
    extraMonthly: Math.max(0, a.extraMonthly),
    lumpSums: new Map<number, number>(),
    pmiMonthly: pmiM,
    pmiUntilBalanceLte: pmiDrop,
  };

  const schedule = buildAmortizationSchedule(scheduleInput);
  const pitiFirstMonth =
    pi + escrowTaxMonthly + escrowInsMonthly + (schedule.rows[0]?.pmi ?? 0);

  let year1Interest = 0;
  let year1Principal = 0;
  for (const row of schedule.rows) {
    if (row.month > 12) break;
    year1Interest += row.interestPayment;
    year1Principal += row.principalPayment;
  }

  const incomeMonthly = Math.max(0, a.incomeMonthly);
  const debtsMonthly = 0;
  const dtiHousing = 28;
  const dtiTotal = 43;
  const maxAfford = maxLoanFromIncome(
    incomeMonthly,
    debtsMonthly,
    dtiTotal,
    dtiHousing,
    escrowTaxMonthly + escrowInsMonthly + (needsPmi ? pmiM : 0),
    rate,
    termMonths
  );
  const maxAffordHome = maxAfford.maxLoan / (1 - downPercent / 100);

  const housingDtiPct = incomeMonthly > 0 ? (pitiFirstMonth / incomeMonthly) * 100 : 0;
  let dtiMessage = "";
  if (incomeMonthly <= 0) {
    dtiMessage = "Add income in the full calculator for a detailed DTI view.";
  } else if (housingDtiPct <= 28) {
    dtiMessage = "Your estimated housing payment is within a common 28% front-end DTI guideline.";
  } else if (housingDtiPct <= 36) {
    dtiMessage = "Housing ratio is elevated versus 28% — still workable for many lenders depending on other debts.";
  } else {
    dtiMessage = "Housing ratio is high vs typical guidelines — review with the full affordability tab.";
  }

  return {
    pi,
    pitiFirstMonth,
    loanAmount,
    ltv,
    needsPmi,
    escrowTaxMonthly,
    escrowInsMonthly,
    pmiMonthly: pmiM,
    totalInterest: schedule.totalInterest,
    totalPmi: schedule.totalPmi,
    payoffMonths: schedule.monthsToPayoff,
    year1Interest,
    year1Principal,
    maxAffordLoan: maxAfford.maxLoan,
    maxAffordHome,
    housingDtiPct,
    dtiMessage,
  };
}

export function formatMoney(n: number): string {
  return formatCurrency(n);
}

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function computeMortgageReadinessFromBands(
  housingDtiPct: number,
  downPercent: number,
  ltv: number
): number {
  const dtiScore =
    housingDtiPct <= 28 ? 1 : housingDtiPct <= 36 ? 0.75 : housingDtiPct <= 43 ? 0.45 : 0.2;
  const downScore = downPercent >= 20 ? 1 : downPercent >= 10 ? 0.7 : downPercent >= 5 ? 0.45 : 0.25;
  const ltvScore = ltv <= 80 ? 1 : ltv <= 90 ? 0.65 : ltv <= 95 ? 0.4 : 0.2;
  return Math.round((dtiScore * 0.45 + downScore * 0.3 + ltvScore * 0.25) * 100);
}

export function computeMortgageReadinessScore(m: JourneyMetrics, answers: MortgageJourneyAnswers): number {
  return computeMortgageReadinessFromBands(m.housingDtiPct, answers.downPercent, m.ltv);
}

export function buildMortgageTextSummary(answers: MortgageJourneyAnswers, m: JourneyMetrics): string {
  const goalLabel =
    answers.goal === "buying" ? "Buying" : answers.goal === "refinancing" ? "Refinancing" : "Exploring";
  return [
    "Facts Deck Mortgage Test — summary",
    `Goal: ${goalLabel}`,
    `Home price: ${formatMoney(answers.homePrice)}`,
    `Down payment: ${answers.downPercent}%`,
    `Rate: ${answers.rate}% · ${answers.termYears} yr`,
    `Est. PITI (mo 1): ${formatMoney(m.pitiFirstMonth)}`,
    `Loan: ${formatMoney(m.loanAmount)} · LTV ${m.ltv.toFixed(1)}%`,
    `Housing / income: ${m.housingDtiPct.toFixed(1)}%`,
    `Readiness score: ${computeMortgageReadinessScore(m, answers)}/100`,
    m.dtiMessage,
  ].join("\n");
}

export function suggestRelatedTools(goal: BuyerGoal, m: JourneyMetrics): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (!out.some((t) => t.slug === slug)) out.push({ slug, name, reason });
  };

  if (goal === "refinancing" || m.housingDtiPct > 36) {
    push("debt-payoff-planner", "Debt Payoff Planner", "Free up cash flow before or after a refi.");
  }
  if (goal === "buying" || m.needsPmi) {
    push("emergency-fund-calculator", "Emergency Fund & Runway", "Build a cushion for closing costs and new-home surprises.");
  }
  if (m.housingDtiPct > 28) {
    push("budget-planner", "Budget Planner", "Stress-test housing against the rest of your monthly plan.");
  }
  if (goal === "buying") {
    push("loan-calculator", "Loan Calculator", "Compare other borrowing scenarios side by side.");
  }
  if (goal === "exploring") {
    push("net-worth-fi-snapshot", "Net Worth & FI Snapshot", "See how a mortgage fits your bigger financial picture.");
  }
  push("subscription-spend-audit", "Subscription Audit", "Trim recurring costs to widen your housing budget.");

  return out.slice(0, 4);
}
