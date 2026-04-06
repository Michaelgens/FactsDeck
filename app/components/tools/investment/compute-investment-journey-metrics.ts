import { formatCurrency } from "../../../lib/mortgage-math";
import {
  afterTaxBalance,
  fireNumber,
  monteCarloPercentiles,
  passiveIncomeAtSwr,
  projectConstantReturn,
  yearsToReachTarget,
  type ProjectionInput,
} from "../../../lib/investment-math";
import type { InvestmentJourneyAnswers } from "./investment-journey-types";

/** Fixed for journey snapshot; full calculator lets users tune. */
const JOURNEY_EXPENSE_RATIO = 0.08;
const JOURNEY_TAX_ON_GAINS = 15;
const JOURNEY_VOL = 16;
const JOURNEY_MC_ITERS = 250;

export type InvestmentJourneyMetrics = {
  baseInput: ProjectionInput;
  finalNominal: number;
  totalContributed: number;
  realFinal: number;
  gain: number;
  afterTaxApprox: number;
  fireTarget: number;
  yearsToFire: number | null;
  passiveIncomeAtTargetSwr: number;
  mc: { p10: number; p50: number; p90: number; mean: number };
};

export function computeInvestmentJourneyMetrics(a: InvestmentJourneyAnswers): InvestmentJourneyMetrics {
  const baseInput: ProjectionInput = {
    initial: Math.max(0, a.initial),
    monthlyContribution: Math.max(0, a.monthly),
    years: Math.min(45, Math.max(5, Math.round(a.years))),
    nominalAnnualPercent: Math.max(0, a.nominal),
    expenseRatioPercent: JOURNEY_EXPENSE_RATIO,
    inflationPercent: Math.max(0, a.inflation),
  };

  const projection = projectConstantReturn(baseInput);
  const realFinal = projection.series[projection.series.length - 1]?.realBalance ?? 0;
  const afterTaxApprox = afterTaxBalance(
    projection.finalNominal,
    projection.totalContributed,
    JOURNEY_TAX_ON_GAINS
  );
  const fireTarget = fireNumber(Math.max(0, a.annualSpend), Math.max(0.1, a.swr));
  const yearsToFire = yearsToReachTarget(baseInput, fireTarget);
  const passiveIncomeAtTargetSwr = passiveIncomeAtSwr(projection.finalNominal, Math.max(0.1, a.swr));

  const mc = monteCarloPercentiles(
    baseInput.initial,
    baseInput.monthlyContribution,
    baseInput.years,
    baseInput.nominalAnnualPercent,
    JOURNEY_VOL,
    JOURNEY_EXPENSE_RATIO,
    JOURNEY_MC_ITERS,
    42
  );

  return {
    baseInput,
    finalNominal: projection.finalNominal,
    totalContributed: projection.totalContributed,
    realFinal,
    gain: projection.gain,
    afterTaxApprox,
    fireTarget,
    yearsToFire,
    passiveIncomeAtTargetSwr,
    mc,
  };
}

export function formatInvestMoney(n: number): string {
  return formatCurrency(n);
}
