/** Pure mortgage & amortization helpers for Advanced Mortgage Calculator */

export type AmortizationRow = {
  month: number;
  principalPayment: number;
  interestPayment: number;
  balance: number;
  pmi: number;
  monthlyPI: number;
};

export type ScheduleResult = {
  rows: AmortizationRow[];
  totalInterest: number;
  totalPmi: number;
  totalPrincipalPaid: number;
  monthsToPayoff: number;
  /** Sum of scheduled PI payments (excludes escrow) */
  totalPI: number;
};

/** Fixed-rate monthly principal & interest only */
export function monthlyPI(principal: number, annualRatePercent: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r <= 0) return principal / termMonths;
  const f = (1 + r) ** termMonths;
  return (principal * r * f) / (f - 1);
}

/** PMI typically drops when loan balance ≤ 78% of original home value (conventional) */
export function pmiCancellationBalance(homePrice: number): number {
  return 0.78 * homePrice;
}

/** Estimate annual PMI as % of original loan (varies by lender & LTV) */
export function monthlyPmiFromLoan(loanAmount: number, annualPmiPercent: number): number {
  return (loanAmount * (annualPmiPercent / 100)) / 12;
}

export type BuildScheduleInput = {
  principal: number;
  annualRatePercent: number;
  termMonths: number;
  /** Extra toward principal each month */
  extraMonthly?: number;
  /** One-time extra payments by month index (1-based) */
  lumpSums?: Map<number, number>;
  /** Monthly PMI until balance ≤ threshold */
  pmiMonthly: number;
  pmiUntilBalanceLte: number | null;
};

export function buildAmortizationSchedule(input: BuildScheduleInput): ScheduleResult {
  const {
    principal,
    annualRatePercent,
    termMonths,
    extraMonthly = 0,
    lumpSums = new Map(),
    pmiMonthly,
    pmiUntilBalanceLte,
  } = input;

  const r = annualRatePercent / 100 / 12;
  const rows: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPmi = 0;
  let totalPrincipalPaid = 0;
  let totalPI = 0;

  const contractual = monthlyPI(principal, annualRatePercent, termMonths);
  const maxMonths = termMonths + 600;

  for (let m = 1; m <= maxMonths && balance > 0.01; m++) {
    const interestPayment = balance * r;
    const lump = lumpSums.get(m) ?? 0;
    let principalPayment = contractual - interestPayment + extraMonthly + lump;
    if (principalPayment < 0) principalPayment = 0;
    if (principalPayment > balance) principalPayment = balance;

    const actualPI = interestPayment + principalPayment;
    totalPI += actualPI;

    let pmi = 0;
    if (pmiUntilBalanceLte !== null && pmiMonthly > 0 && balance > pmiUntilBalanceLte) {
      pmi = pmiMonthly;
    }

    balance -= principalPayment;
    totalInterest += interestPayment;
    totalPmi += pmi;
    totalPrincipalPaid += principalPayment;

    rows.push({
      month: m,
      principalPayment,
      interestPayment,
      balance: Math.max(0, balance),
      pmi,
      monthlyPI: actualPI,
    });

    if (balance <= 0.01) break;
  }

  return {
    rows,
    totalInterest,
    totalPmi,
    totalPrincipalPaid,
    monthsToPayoff: rows.length,
    totalPI,
  };
}

/** Bi-weekly: 26 half-payments/year ≈ 13 monthly payments → extra per year */
export function biweeklyExtraEquivalentMonthly(
  principal: number,
  annualRatePercent: number,
  termMonths: number
): number {
  const monthly = monthlyPI(principal, annualRatePercent, termMonths);
  const half = monthly / 2;
  const yearly = half * 26;
  const extra = yearly - monthly * 12;
  return extra / 12;
}

/** Max loan from income using DTI for housing (PITI) */
export function maxLoanFromIncome(
  grossMonthlyIncome: number,
  monthlyDebts: number,
  maxTotalDtiPercent: number,
  maxHousingDtiPercent: number,
  estimatedNonPiMonthly: number,
  annualRatePercent: number,
  termMonths: number
): { maxHousingPayment: number; maxLoan: number } {
  const housingCap = (grossMonthlyIncome * maxHousingDtiPercent) / 100;
  const totalCap = (grossMonthlyIncome * maxTotalDtiPercent) / 100 - monthlyDebts;
  const maxHousingPayment = Math.max(0, Math.min(housingCap, totalCap) - estimatedNonPiMonthly);
  if (maxHousingPayment <= 0) return { maxHousingPayment: 0, maxLoan: 0 };

  const r = annualRatePercent / 100 / 12;
  if (r <= 0) return { maxHousingPayment, maxLoan: maxHousingPayment * termMonths };

  const f = (1 + r) ** termMonths;
  const maxLoan = (maxHousingPayment * (f - 1)) / (r * f);
  return { maxHousingPayment, maxLoan: Math.max(0, maxLoan) };
}

/** Break-even months for paying discount points (fee reduces rate) */
export function breakEvenMonthsForPoints(
  loanAmount: number,
  pointsCost: number,
  rateWithoutPoints: number,
  rateWithPoints: number,
  termMonths: number
): number | null {
  const p1 = monthlyPI(loanAmount, rateWithoutPoints, termMonths);
  const p2 = monthlyPI(loanAmount, rateWithPoints, termMonths);
  const save = p1 - p2;
  if (save <= 0) return null;
  return Math.ceil(pointsCost / save);
}

/** Real total interest in today's dollars (rough) */
export function npvOfStream(
  monthlyPayments: number[],
  annualDiscountPercent: number
): number {
  const d = annualDiscountPercent / 100 / 12;
  let npv = 0;
  for (let i = 0; i < monthlyPayments.length; i++) {
    npv += monthlyPayments[i] / (1 + d) ** (i + 1);
  }
  return npv;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatCurrency2(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
