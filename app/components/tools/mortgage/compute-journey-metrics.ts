import {
  buildAmortizationSchedule,
  formatCurrency,
  maxLoanFromIncome,
  monthlyPI,
  monthlyPmiFromLoan,
  pmiCancellationBalance,
} from "../../../lib/mortgage-math";
import type { MortgageSummaryPayload } from "../../../lib/mortgage-summary-email";
import type { MortgageJourneyAnswers } from "./mortgage-journey-types";

/** Escrow assumptions for the quick journey (full calculator lets users edit). */
const DEFAULT_TAX_PCT = 1.15;
const INSURANCE_RATIO_OF_HOME = 0.0035;

export type JourneyMetrics = {
  summary: MortgageSummaryPayload;
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

  const summary: MortgageSummaryPayload = {
    homePrice,
    downPercent,
    loanAmount,
    rate,
    termYears: Math.round(a.termYears),
    monthlyPI: pi,
    pitiFirstMonth,
    totalInterest: schedule.totalInterest,
    totalPmi: schedule.totalPmi,
    payoffMonths: schedule.monthsToPayoff,
    ltv,
    extraMonthly: Math.max(0, a.extraMonthly),
    propertyTaxPercent: DEFAULT_TAX_PCT,
    insuranceYearly: escrowInsMonthly * 12,
    hoaMonthly: 0,
    generatedAt: new Date().toISOString(),
  };

  return {
    summary,
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
