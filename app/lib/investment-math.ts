/** Pure investment projection helpers — educational estimates only */

export type YearPoint = { year: number; balance: number; contributed: number; realBalance: number };

export type ProjectionInput = {
  initial: number;
  monthlyContribution: number;
  years: number;
  /** Nominal expected annual return before expense ratio (e.g. 7 for 7%) */
  nominalAnnualPercent: number;
  /** Annual expense ratio drag (e.g. 0.05 for 0.05%) */
  expenseRatioPercent: number;
  /** Annual inflation for real-dollar view */
  inflationPercent: number;
};

function monthlyRateFromAnnual(annualDecimal: number): number {
  return (1 + annualDecimal) ** (1 / 12) - 1;
}

/** Net annual return after multiplicative expense drag: (1+g)(1-f) - 1 */
export function netAnnualAfterFees(grossAnnualPercent: number, expenseRatioPercent: number): number {
  const g = grossAnnualPercent / 100;
  const f = expenseRatioPercent / 100;
  return ((1 + g) * (1 - f) - 1) * 100;
}

/**
 * Month-end contributions, compounded monthly at constant net rate.
 */
export function projectConstantReturn(input: ProjectionInput): {
  finalNominal: number;
  totalContributed: number;
  gain: number;
  series: YearPoint[];
} {
  const {
    initial,
    monthlyContribution,
    years,
    nominalAnnualPercent,
    expenseRatioPercent,
    inflationPercent,
  } = input;

  const netAnnual = netAnnualAfterFees(nominalAnnualPercent, expenseRatioPercent) / 100;
  const rM = monthlyRateFromAnnual(netAnnual);
  const inflM = monthlyRateFromAnnual(inflationPercent / 100);

  let balance = Math.max(0, initial);
  let contributed = Math.max(0, initial);
  const series: YearPoint[] = [];

  const pushYear = (y: number) => {
    const deflator = (1 + inflM) ** (y * 12);
    series.push({
      year: y,
      balance,
      contributed,
      realBalance: balance / deflator,
    });
  };

  pushYear(0);

  const maxMonths = Math.max(0, Math.round(years * 12));
  for (let m = 1; m <= maxMonths; m++) {
    balance = (balance + monthlyContribution) * (1 + rM);
    contributed += monthlyContribution;
    if (m % 12 === 0) {
      pushYear(m / 12);
    }
  }

  const gain = balance - contributed;
  return { finalNominal: balance, totalContributed: contributed, gain, series };
}

/**
 * Same as projectConstantReturn but each calendar year uses its own annual return (before fees).
 * `annualReturns.length` should equal `years`.
 */
export function projectVariableAnnualReturns(
  initial: number,
  monthlyContribution: number,
  annualReturnsPercent: number[],
  expenseRatioPercent: number,
  inflationPercent: number
): { finalNominal: number; totalContributed: number; series: YearPoint[] } {
  const f = expenseRatioPercent / 100;
  let balance = Math.max(0, initial);
  let contributed = Math.max(0, initial);
  const series: YearPoint[] = [];
  const inflM = monthlyRateFromAnnual(inflationPercent / 100);

  const pushYear = (y: number) => {
    const deflator = (1 + inflM) ** (y * 12);
    series.push({
      year: y,
      balance,
      contributed,
      realBalance: balance / deflator,
    });
  };

  pushYear(0);

  for (let y = 0; y < annualReturnsPercent.length; y++) {
    const gross = annualReturnsPercent[y] ?? 0;
    const netAnnual = ((1 + gross / 100) * (1 - f) - 1) / 100;
    const rM = monthlyRateFromAnnual(netAnnual);
    for (let m = 0; m < 12; m++) {
      balance = (balance + monthlyContribution) * (1 + rM);
      contributed += monthlyContribution;
    }
    pushYear(y + 1);
  }

  return { finalNominal: balance, totalContributed: contributed, series };
}

/** FIRE target: annual spend / SWR (e.g. 4% → 0.04) */
export function fireNumber(annualExpenses: number, withdrawalRatePercent: number): number {
  const w = withdrawalRatePercent / 100;
  if (w <= 0) return Infinity;
  return annualExpenses / w;
}

/**
 * Years until balance reaches target (constant return), stepping one year at a time.
 */
export function yearsToReachTarget(
  input: ProjectionInput,
  targetBalance: number,
  maxYearsCap = 80
): number | null {
  if (targetBalance <= 0) return 0;
  for (let y = 1; y <= maxYearsCap; y++) {
    const { finalNominal } = projectConstantReturn({ ...input, years: y });
    if (finalNominal >= targetBalance) return y;
  }
  return null;
}

/** Classic: full lump at t=0 vs spreading same total over `dcaMonths` months. Remaining months grow with no new money. */
export function lumpSumVsDca(
  totalBudget: number,
  dcaMonths: number,
  annualReturnPercent: number,
  expenseRatioPercent: number,
  horizonMonths: number
): { lumpFinal: number; dcaFinal: number } {
  const net = netAnnualAfterFees(annualReturnPercent, expenseRatioPercent) / 100;
  const rM = monthlyRateFromAnnual(net);
  const lump = Math.max(0, totalBudget);
  let balLump = lump;
  for (let m = 1; m <= horizonMonths; m++) {
    balLump *= 1 + rM;
  }

  let balDca = 0;
  const per = dcaMonths > 0 ? totalBudget / dcaMonths : 0;
  for (let m = 1; m <= horizonMonths; m++) {
    const add = m <= dcaMonths ? per : 0;
    balDca = (balDca + add) * (1 + rM);
  }

  return { lumpFinal: balLump, dcaFinal: balDca };
}

/**
 * Two deterministic paths with the same arithmetic mean annual return but different ordering
 * (early bull vs late bull). Illustrates sequence-of-returns risk with ongoing contributions.
 */
export function piecewiseAverageReturn(
  years: number,
  meanAnnualPercent: number,
  spreadPercent: number
): { earlyHigh: number[]; lateHigh: number[]; mean: number } {
  const half = Math.floor(years / 2);
  const rest = years - half;
  if (rest <= 0) {
    const flat = Array(years).fill(meanAnnualPercent);
    return { earlyHigh: flat, lateHigh: [...flat], mean: meanAnnualPercent };
  }
  const hi = meanAnnualPercent + spreadPercent / 2;
  const lo = (meanAnnualPercent * years - hi * half) / rest;
  const earlyHigh = [...Array(half).fill(hi), ...Array(rest).fill(lo)];
  const lateHigh = [...Array(half).fill(lo), ...Array(rest).fill(hi)];
  const mean = (hi * half + lo * rest) / years;
  return { earlyHigh, lateHigh, mean };
}

/** After-tax liquidation: contributions tax-free return of basis; gains taxed at rate */
export function afterTaxBalance(
  finalBalance: number,
  totalContributed: number,
  longTermCapitalGainsPercent: number
): number {
  const gain = Math.max(0, finalBalance - totalContributed);
  const tax = gain * (longTermCapitalGainsPercent / 100);
  return finalBalance - tax;
}

/** Passive annual income at withdrawal rate */
export function passiveIncomeAtSwr(balance: number, withdrawalRatePercent: number): number {
  return balance * (withdrawalRatePercent / 100);
}

/** Simple Monte Carlo: lognormal annual returns, monthly steps inside each year */
export function monteCarloPercentiles(
  initial: number,
  monthlyContribution: number,
  years: number,
  annualMeanPercent: number,
  annualVolPercent: number,
  expenseRatioPercent: number,
  iterations: number,
  seed = 42
): { p10: number; p50: number; p90: number; mean: number } {
  // Mulberry32 PRNG
  let s = seed >>> 0;
  const rnd = () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const randn = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const f = expenseRatioPercent / 100;
  const mu = annualMeanPercent / 100;
  const sig = annualVolPercent / 100;
  const finals: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let balance = Math.max(0, initial);
    let contributed = Math.max(0, initial);
    for (let y = 0; y < years; y++) {
      const shock = mu + sig * randn();
      const netAnnual = ((1 + shock) * (1 - f) - 1) / 100;
      const rM = monthlyRateFromAnnual(netAnnual);
      for (let m = 0; m < 12; m++) {
        balance = (balance + monthlyContribution) * (1 + rM);
        contributed += monthlyContribution;
      }
    }
    finals.push(balance);
  }

  finals.sort((a, b) => a - b);
  const pick = (p: number) => finals[Math.min(finals.length - 1, Math.floor((p / 100) * finals.length))];
  const mean = finals.reduce((a, b) => a + b, 0) / finals.length;
  return { p10: pick(10), p50: pick(50), p90: pick(90), mean };
}
