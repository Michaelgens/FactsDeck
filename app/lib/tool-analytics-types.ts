/** Server-persisted tool funnel + behavior metrics (one row per tool slug). */

export type ToolEventType =
  | "page_view"
  | "journey_start"
  | "journey_skip"
  | "journey_complete"
  | "results_view"
  | "dashboard_open"
  | "retake_click"
  | "export_json"
  | "export_text"
  | "walkthrough_open"
  | "walkthrough_complete"
  | "starter_plan_load"
  | "target_fill"
  | "auto_assign_savings"
  | "session_telemetry";

export type RunningAverage = { sum: number; count: number };

export type ToolFunnelMetrics = {
  pageViews: number;
  journeyStarts: number;
  journeySkips: number;
  journeyCompletes: number;
  resultsViews: number;
  dashboardOpens: number;
  retakeClicks: number;
};

export type ToolActionMetrics = {
  exportJson: number;
  exportText: number;
  walkthroughOpens: number;
  walkthroughCompletes: number;
  starterPlansLoaded: number;
  targetFillClicks: number;
  autoAssignClicks: number;
  sessionTelemetryReports: number;
};

export type BudgetBehaviorMetrics = {
  goals: Record<string, number>;
  modes: Record<string, number>;
  incomeBuckets: Record<string, number>;
  bufferBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgLineItems: RunningAverage;
  avgIncome: RunningAverage;
  overBudgetSessions: number;
  balancedZeroBasedSessions: number;
};

export type EmergencyFundBehaviorMetrics = {
  goals: Record<string, number>;
  planModes: Record<string, number>;
  essentialsBuckets: Record<string, number>;
  targetMonthBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgRunwayMonths: RunningAverage;
  avgPctFunded: RunningAverage;
  avgLineItems: RunningAverage;
  fullyFundedSessions: number;
  underThreeMonthRunwaySessions: number;
};

export type SubscriptionAuditBehaviorMetrics = {
  goals: Record<string, number>;
  modes: Record<string, number>;
  recurringBuckets: Record<string, number>;
  countBuckets: Record<string, number>;
  trimBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgMonthlyRecurring: RunningAverage;
  avgLineItems: RunningAverage;
  avgTrimPercent: RunningAverage;
  highBurnSessions: number;
  trimGoalSessions: number;
  lineItemAuditSessions: number;
};

export type MortgageBehaviorMetrics = {
  goals: Record<string, number>;
  homePriceBuckets: Record<string, number>;
  downPaymentBuckets: Record<string, number>;
  rateBuckets: Record<string, number>;
  ltvBuckets: Record<string, number>;
  dtiBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgPiti: RunningAverage;
  avgHousingDtiPct: RunningAverage;
  highDtiSessions: number;
  pmiRequiredSessions: number;
  refiGoalSessions: number;
};

export type LoanBehaviorMetrics = {
  goals: Record<string, number>;
  principalBuckets: Record<string, number>;
  aprBuckets: Record<string, number>;
  termBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgMonthlyPayment: RunningAverage;
  avgTotalInterest: RunningAverage;
  highAprSessions: number;
  refiGoalSessions: number;
  extraPaySessions: number;
  compareBSessions: number;
};

export type DebtPayoffBehaviorMetrics = {
  goals: Record<string, number>;
  balanceBuckets: Record<string, number>;
  extraPayBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgTotalDebt: RunningAverage;
  avgExtraMonthly: RunningAverage;
  avgAvalancheMonths: RunningAverage;
  highAprDebtSessions: number;
  compareGoalSessions: number;
  multiDebtSessions: number;
  extraPaySessions: number;
};

export type StudentLoanBehaviorMetrics = {
  goals: Record<string, number>;
  balanceBuckets: Record<string, number>;
  incomeBuckets: Record<string, number>;
  aprBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgStandardMonthly: RunningAverage;
  avgIdrMonthly: RunningAverage;
  avgIdrEndingBalance: RunningAverage;
  idrBelowInterestSessions: number;
  compareGoalSessions: number;
  idrGoalSessions: number;
  highBalanceSessions: number;
};

export type CreditScoreBehaviorMetrics = {
  goals: Record<string, number>;
  utilizationBuckets: Record<string, number>;
  scoreBandBuckets: Record<string, number>;
  avgSimulatedScore: RunningAverage;
  avgUtilization: RunningAverage;
  highUtilSessions: number;
  lowScoreSessions: number;
  improveGoalSessions: number;
};

export type InvestmentBehaviorMetrics = {
  goals: Record<string, number>;
  initialBuckets: Record<string, number>;
  monthlyBuckets: Record<string, number>;
  horizonBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgFinalNominal: RunningAverage;
  avgMonthlyContribution: RunningAverage;
  avgYearsToFire: RunningAverage;
  fireGoalSessions: number;
  highContributionSessions: number;
  longHorizonSessions: number;
};

export type RetirementBehaviorMetrics = {
  goals: Record<string, number>;
  balanceBuckets: Record<string, number>;
  monthlyBuckets: Record<string, number>;
  yearsToRetireBuckets: Record<string, number>;
  spendingBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgFiNumber: RunningAverage;
  avgBalanceAtRetire: RunningAverage;
  avgMonthlyContribution: RunningAverage;
  avgYearsToRetire: RunningAverage;
  fireGoalSessions: number;
  onTrackSessions: number;
  offTrackSessions: number;
  highContributionSessions: number;
  longTimelineSessions: number;
  socialSecuritySessions: number;
};

export type FiSnapshotBehaviorMetrics = {
  goals: Record<string, number>;
  netWorthBuckets: Record<string, number>;
  assetBuckets: Record<string, number>;
  liabilityBuckets: Record<string, number>;
  expenseBuckets: Record<string, number>;
  investingBuckets: Record<string, number>;
  freedomBandBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgNetWorth: RunningAverage;
  avgFiNumber: RunningAverage;
  avgFiProgressPct: RunningAverage;
  avgMonthlyInvesting: RunningAverage;
  avgYearsToFi: RunningAverage;
  freedomGoalSessions: number;
  independenceBandSessions: number;
  highProgressSessions: number;
  negativeNetWorthSessions: number;
  highInvestingSessions: number;
};

export type CryptoYieldBehaviorMetrics = {
  goals: Record<string, number>;
  principalBuckets: Record<string, number>;
  apyBuckets: Record<string, number>;
  horizonBuckets: Record<string, number>;
  compoundingBuckets: Record<string, number>;
  avgScore: RunningAverage;
  avgFutureValue: RunningAverage;
  avgApyPercent: RunningAverage;
  avgInterestEarned: RunningAverage;
  avgEffectiveApy: RunningAverage;
  compareGoalSessions: number;
  highApySessions: number;
  dailyCompoundSessions: number;
  longHorizonSessions: number;
};

export type ToolAnalyticsDoc = {
  funnel: ToolFunnelMetrics;
  actions: ToolActionMetrics;
  budget?: BudgetBehaviorMetrics;
  emergencyFund?: EmergencyFundBehaviorMetrics;
  subscriptionAudit?: SubscriptionAuditBehaviorMetrics;
  mortgage?: MortgageBehaviorMetrics;
  loan?: LoanBehaviorMetrics;
  debtPayoff?: DebtPayoffBehaviorMetrics;
  studentLoan?: StudentLoanBehaviorMetrics;
  creditScore?: CreditScoreBehaviorMetrics;
  investment?: InvestmentBehaviorMetrics;
  retirement?: RetirementBehaviorMetrics;
  fiSnapshot?: FiSnapshotBehaviorMetrics;
  cryptoYield?: CryptoYieldBehaviorMetrics;
  lastEventAt: string | null;
};

export const INSTRUMENTED_TOOL_SLUGS = new Set<string>([
  "budget-planner",
  "emergency-fund-calculator",
  "subscription-spend-audit",
  "mortgage-calculator",
  "loan-calculator",
  "debt-payoff-planner",
  "student-loan-snapshot",
  "credit-score-simulator",
  "investment-calculator",
  "retirement-calculator",
  "net-worth-fi-snapshot",
  "crypto-yield-lab",
]);

export function emptyToolFunnel(): ToolFunnelMetrics {
  return {
    pageViews: 0,
    journeyStarts: 0,
    journeySkips: 0,
    journeyCompletes: 0,
    resultsViews: 0,
    dashboardOpens: 0,
    retakeClicks: 0,
  };
}

export function emptyToolActions(): ToolActionMetrics {
  return {
    exportJson: 0,
    exportText: 0,
    walkthroughOpens: 0,
    walkthroughCompletes: 0,
    starterPlansLoaded: 0,
    targetFillClicks: 0,
    autoAssignClicks: 0,
    sessionTelemetryReports: 0,
  };
}

export function emptyBudgetBehavior(): BudgetBehaviorMetrics {
  return {
    goals: {},
    modes: {},
    incomeBuckets: {},
    bufferBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgLineItems: { sum: 0, count: 0 },
    avgIncome: { sum: 0, count: 0 },
    overBudgetSessions: 0,
    balancedZeroBasedSessions: 0,
  };
}

export function emptyEmergencyFundBehavior(): EmergencyFundBehaviorMetrics {
  return {
    goals: {},
    planModes: {},
    essentialsBuckets: {},
    targetMonthBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgRunwayMonths: { sum: 0, count: 0 },
    avgPctFunded: { sum: 0, count: 0 },
    avgLineItems: { sum: 0, count: 0 },
    fullyFundedSessions: 0,
    underThreeMonthRunwaySessions: 0,
  };
}

export function emptySubscriptionAuditBehavior(): SubscriptionAuditBehaviorMetrics {
  return {
    goals: {},
    modes: {},
    recurringBuckets: {},
    countBuckets: {},
    trimBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgMonthlyRecurring: { sum: 0, count: 0 },
    avgLineItems: { sum: 0, count: 0 },
    avgTrimPercent: { sum: 0, count: 0 },
    highBurnSessions: 0,
    trimGoalSessions: 0,
    lineItemAuditSessions: 0,
  };
}

export function emptyMortgageBehavior(): MortgageBehaviorMetrics {
  return {
    goals: {},
    homePriceBuckets: {},
    downPaymentBuckets: {},
    rateBuckets: {},
    ltvBuckets: {},
    dtiBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgPiti: { sum: 0, count: 0 },
    avgHousingDtiPct: { sum: 0, count: 0 },
    highDtiSessions: 0,
    pmiRequiredSessions: 0,
    refiGoalSessions: 0,
  };
}

export function emptyLoanBehavior(): LoanBehaviorMetrics {
  return {
    goals: {},
    principalBuckets: {},
    aprBuckets: {},
    termBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgMonthlyPayment: { sum: 0, count: 0 },
    avgTotalInterest: { sum: 0, count: 0 },
    highAprSessions: 0,
    refiGoalSessions: 0,
    extraPaySessions: 0,
    compareBSessions: 0,
  };
}

export function emptyDebtPayoffBehavior(): DebtPayoffBehaviorMetrics {
  return {
    goals: {},
    balanceBuckets: {},
    extraPayBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgTotalDebt: { sum: 0, count: 0 },
    avgExtraMonthly: { sum: 0, count: 0 },
    avgAvalancheMonths: { sum: 0, count: 0 },
    highAprDebtSessions: 0,
    compareGoalSessions: 0,
    multiDebtSessions: 0,
    extraPaySessions: 0,
  };
}

export function emptyStudentLoanBehavior(): StudentLoanBehaviorMetrics {
  return {
    goals: {},
    balanceBuckets: {},
    incomeBuckets: {},
    aprBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgStandardMonthly: { sum: 0, count: 0 },
    avgIdrMonthly: { sum: 0, count: 0 },
    avgIdrEndingBalance: { sum: 0, count: 0 },
    idrBelowInterestSessions: 0,
    compareGoalSessions: 0,
    idrGoalSessions: 0,
    highBalanceSessions: 0,
  };
}

export function emptyCreditScoreBehavior(): CreditScoreBehaviorMetrics {
  return {
    goals: {},
    utilizationBuckets: {},
    scoreBandBuckets: {},
    avgSimulatedScore: { sum: 0, count: 0 },
    avgUtilization: { sum: 0, count: 0 },
    highUtilSessions: 0,
    lowScoreSessions: 0,
    improveGoalSessions: 0,
  };
}

export function emptyInvestmentBehavior(): InvestmentBehaviorMetrics {
  return {
    goals: {},
    initialBuckets: {},
    monthlyBuckets: {},
    horizonBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgFinalNominal: { sum: 0, count: 0 },
    avgMonthlyContribution: { sum: 0, count: 0 },
    avgYearsToFire: { sum: 0, count: 0 },
    fireGoalSessions: 0,
    highContributionSessions: 0,
    longHorizonSessions: 0,
  };
}

export function emptyRetirementBehavior(): RetirementBehaviorMetrics {
  return {
    goals: {},
    balanceBuckets: {},
    monthlyBuckets: {},
    yearsToRetireBuckets: {},
    spendingBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgFiNumber: { sum: 0, count: 0 },
    avgBalanceAtRetire: { sum: 0, count: 0 },
    avgMonthlyContribution: { sum: 0, count: 0 },
    avgYearsToRetire: { sum: 0, count: 0 },
    fireGoalSessions: 0,
    onTrackSessions: 0,
    offTrackSessions: 0,
    highContributionSessions: 0,
    longTimelineSessions: 0,
    socialSecuritySessions: 0,
  };
}

export function emptyFiSnapshotBehavior(): FiSnapshotBehaviorMetrics {
  return {
    goals: {},
    netWorthBuckets: {},
    assetBuckets: {},
    liabilityBuckets: {},
    expenseBuckets: {},
    investingBuckets: {},
    freedomBandBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgNetWorth: { sum: 0, count: 0 },
    avgFiNumber: { sum: 0, count: 0 },
    avgFiProgressPct: { sum: 0, count: 0 },
    avgMonthlyInvesting: { sum: 0, count: 0 },
    avgYearsToFi: { sum: 0, count: 0 },
    freedomGoalSessions: 0,
    independenceBandSessions: 0,
    highProgressSessions: 0,
    negativeNetWorthSessions: 0,
    highInvestingSessions: 0,
  };
}

export function emptyCryptoYieldBehavior(): CryptoYieldBehaviorMetrics {
  return {
    goals: {},
    principalBuckets: {},
    apyBuckets: {},
    horizonBuckets: {},
    compoundingBuckets: {},
    avgScore: { sum: 0, count: 0 },
    avgFutureValue: { sum: 0, count: 0 },
    avgApyPercent: { sum: 0, count: 0 },
    avgInterestEarned: { sum: 0, count: 0 },
    avgEffectiveApy: { sum: 0, count: 0 },
    compareGoalSessions: 0,
    highApySessions: 0,
    dailyCompoundSessions: 0,
    longHorizonSessions: 0,
  };
}

export function emptyToolAnalytics(toolSlug?: string): ToolAnalyticsDoc {
  return {
    funnel: emptyToolFunnel(),
    actions: emptyToolActions(),
    ...(toolSlug === "budget-planner" ? { budget: emptyBudgetBehavior() } : {}),
    ...(toolSlug === "emergency-fund-calculator" ? { emergencyFund: emptyEmergencyFundBehavior() } : {}),
    ...(toolSlug === "subscription-spend-audit" ? { subscriptionAudit: emptySubscriptionAuditBehavior() } : {}),
    ...(toolSlug === "mortgage-calculator" ? { mortgage: emptyMortgageBehavior() } : {}),
    ...(toolSlug === "loan-calculator" ? { loan: emptyLoanBehavior() } : {}),
    ...(toolSlug === "debt-payoff-planner" ? { debtPayoff: emptyDebtPayoffBehavior() } : {}),
    ...(toolSlug === "student-loan-snapshot" ? { studentLoan: emptyStudentLoanBehavior() } : {}),
    ...(toolSlug === "credit-score-simulator" ? { creditScore: emptyCreditScoreBehavior() } : {}),
    ...(toolSlug === "investment-calculator" ? { investment: emptyInvestmentBehavior() } : {}),
    ...(toolSlug === "retirement-calculator" ? { retirement: emptyRetirementBehavior() } : {}),
    ...(toolSlug === "net-worth-fi-snapshot" ? { fiSnapshot: emptyFiSnapshotBehavior() } : {}),
    ...(toolSlug === "crypto-yield-lab" ? { cryptoYield: emptyCryptoYieldBehavior() } : {}),
    lastEventAt: null,
  };
}

function inc(map: Record<string, number>, key: string, by = 1) {
  map[key] = (map[key] ?? 0) + by;
}

function incAvg(avg: RunningAverage, value: number) {
  if (!Number.isFinite(value)) return;
  avg.sum += value;
  avg.count += 1;
}

export function avgValue(avg: RunningAverage): number | null {
  if (avg.count <= 0) return null;
  return avg.sum / avg.count;
}

export function incomeBucket(income: number): string {
  if (income < 2000) return "under_2k";
  if (income < 5000) return "2k_5k";
  if (income < 10_000) return "5k_10k";
  return "10k_plus";
}

export function bufferBucket(bufferPct: number): string {
  if (bufferPct <= 0.001) return "0pct";
  if (bufferPct <= 0.03) return "1_3pct";
  if (bufferPct <= 0.06) return "3_6pct";
  return "6pct_plus";
}

export const INCOME_BUCKET_LABEL: Record<string, string> = {
  under_2k: "Under $2k / mo",
  "2k_5k": "$2k – $5k",
  "5k_10k": "$5k – $10k",
  "10k_plus": "$10k+",
};

export const BUFFER_BUCKET_LABEL: Record<string, string> = {
  "0pct": "0%",
  "1_3pct": "1 – 3%",
  "3_6pct": "3 – 6%",
  "6pct_plus": "6%+",
};

export const GOAL_METRIC_LABEL: Record<string, string> = {
  organize: "Get organized",
  debt: "Pay down debt",
  save: "Save more",
  exploring: "Exploring",
};

export const MODE_METRIC_LABEL: Record<string, string> = {
  "50-30-20": "50 / 30 / 20",
  "zero-based": "Zero-based",
};

export const EF_GOAL_METRIC_LABEL: Record<string, string> = {
  essentials: "Cover essentials",
  job_buffer: "Job-loss buffer",
  peace: "Peace of mind",
  exploring: "Exploring",
};

export const EF_PLAN_MODE_LABEL: Record<string, string> = {
  runway_math: "Runway math",
  essentials_builder: "Essentials builder",
};

export const ESSENTIALS_BUCKET_LABEL: Record<string, string> = {
  under_2k: "Under $2k / mo",
  "2k_5k": "$2k – $5k",
  "5k_8k": "$5k – $8k",
  "8k_plus": "$8k+",
};

export const TARGET_MONTH_BUCKET_LABEL: Record<string, string> = {
  "3_or_less": "3 mo or less",
  "4_6": "4 – 6 mo",
  "7_9": "7 – 9 mo",
  "10_plus": "10+ mo",
};

export function essentialsBucket(monthly: number): string {
  if (monthly < 2000) return "under_2k";
  if (monthly < 5000) return "2k_5k";
  if (monthly < 8000) return "5k_8k";
  return "8k_plus";
}

export function targetMonthBucket(months: number): string {
  if (months <= 3) return "3_or_less";
  if (months <= 6) return "4_6";
  if (months <= 9) return "7_9";
  return "10_plus";
}

export const SUB_GOAL_METRIC_LABEL: Record<string, string> = {
  leaks: "Find leaks",
  cut: "Cut costs",
  exploring: "Exploring",
};

export const SUB_MODE_METRIC_LABEL: Record<string, string> = {
  quick_estimate: "Quick estimate",
  line_item_audit: "Line-item audit",
};

export const RECURRING_BUCKET_LABEL: Record<string, string> = {
  under_50: "Under $50 / mo",
  "50_150": "$50 – $150",
  "150_300": "$150 – $300",
  "300_plus": "$300+",
};

export const SUB_COUNT_BUCKET_LABEL: Record<string, string> = {
  "1_5": "1 – 5 subs",
  "6_10": "6 – 10 subs",
  "11_15": "11 – 15 subs",
  "16_plus": "16+ subs",
};

export const TRIM_BUCKET_LABEL: Record<string, string> = {
  "0pct": "0% trim",
  "1_10pct": "1 – 10%",
  "11_20pct": "11 – 20%",
  "21_35pct": "21 – 35%",
  "36_plus": "36%+",
};

export function recurringSpendBucket(monthly: number): string {
  if (monthly < 50) return "under_50";
  if (monthly < 150) return "50_150";
  if (monthly < 300) return "150_300";
  return "300_plus";
}

export function subscriptionCountBucket(count: number): string {
  if (count <= 5) return "1_5";
  if (count <= 10) return "6_10";
  if (count <= 15) return "11_15";
  return "16_plus";
}

export function trimPercentBucket(pct: number): string {
  if (pct <= 0) return "0pct";
  if (pct <= 10) return "1_10pct";
  if (pct <= 20) return "11_20pct";
  if (pct <= 35) return "21_35pct";
  return "36_plus";
}

export const MORTGAGE_GOAL_METRIC_LABEL: Record<string, string> = {
  buying: "Buying a home",
  refinancing: "Refinancing",
  exploring: "Exploring",
};

export const HOME_PRICE_BUCKET_LABEL: Record<string, string> = {
  under_300k: "Under $300k",
  "300k_500k": "$300k – $500k",
  "500k_750k": "$500k – $750k",
  "750k_plus": "$750k+",
};

export const DOWN_PAYMENT_BUCKET_LABEL: Record<string, string> = {
  "0_5": "0 – 5%",
  "5_10": "5 – 10%",
  "10_20": "10 – 20%",
  "20_plus": "20%+",
};

export const MORTGAGE_RATE_BUCKET_LABEL: Record<string, string> = {
  under_5: "Under 5%",
  "5_6": "5 – 6%",
  "6_7": "6 – 7%",
  "7_plus": "7%+",
};

export const LTV_BUCKET_LABEL: Record<string, string> = {
  under_80: "Under 80%",
  "80_90": "80 – 90%",
  "90_95": "90 – 95%",
  "95_plus": "95%+",
};

export const DTI_BUCKET_LABEL: Record<string, string> = {
  under_28: "Under 28%",
  "28_36": "28 – 36%",
  "36_43": "36 – 43%",
  "43_plus": "43%+",
};

export function homePriceBucket(price: number): string {
  if (price < 300_000) return "under_300k";
  if (price < 500_000) return "300k_500k";
  if (price < 750_000) return "500k_750k";
  return "750k_plus";
}

export function downPaymentBucket(pct: number): string {
  if (pct < 5) return "0_5";
  if (pct < 10) return "5_10";
  if (pct < 20) return "10_20";
  return "20_plus";
}

export function mortgageRateBucket(rate: number): string {
  if (rate < 5) return "under_5";
  if (rate < 6) return "5_6";
  if (rate < 7) return "6_7";
  return "7_plus";
}

export function ltvBucket(ltv: number): string {
  if (ltv < 80) return "under_80";
  if (ltv < 90) return "80_90";
  if (ltv < 95) return "90_95";
  return "95_plus";
}

export function housingDtiBucket(pct: number): string {
  if (pct < 28) return "under_28";
  if (pct < 36) return "28_36";
  if (pct < 43) return "36_43";
  return "43_plus";
}

export const LOAN_GOAL_METRIC_LABEL: Record<string, string> = {
  auto: "Auto loan",
  personal: "Personal loan",
  refinance: "Refinance",
  exploring: "Exploring",
};

export const PRINCIPAL_BUCKET_LABEL: Record<string, string> = {
  under_10k: "Under $10k",
  "10k_25k": "$10k – $25k",
  "25k_50k": "$25k – $50k",
  "50k_plus": "$50k+",
};

export const LOAN_APR_BUCKET_LABEL: Record<string, string> = {
  under_5: "Under 5%",
  "5_8": "5 – 8%",
  "8_12": "8 – 12%",
  "12_plus": "12%+",
};

export const LOAN_TERM_BUCKET_LABEL: Record<string, string> = {
  under_3yr: "Under 3 yr",
  "3_5yr": "3 – 5 yr",
  "5_7yr": "5 – 7 yr",
  "7_plus": "7+ yr",
};

export function loanPrincipalBucket(principal: number): string {
  if (principal < 10_000) return "under_10k";
  if (principal < 25_000) return "10k_25k";
  if (principal < 50_000) return "25k_50k";
  return "50k_plus";
}

export function loanAprBucket(apr: number): string {
  if (apr < 5) return "under_5";
  if (apr < 8) return "5_8";
  if (apr < 12) return "8_12";
  return "12_plus";
}

export function loanTermBucket(years: number): string {
  if (years < 3) return "under_3yr";
  if (years < 5) return "3_5yr";
  if (years < 7) return "5_7yr";
  return "7_plus";
}

export const DEBT_GOAL_METRIC_LABEL: Record<string, string> = {
  snowball: "Snowball",
  avalanche: "Avalanche",
  compare: "Compare both",
  exploring: "Exploring",
};

export const DEBT_BALANCE_BUCKET_LABEL: Record<string, string> = {
  under_5k: "Under $5k",
  "5k_15k": "$5k – $15k",
  "15k_30k": "$15k – $30k",
  "30k_plus": "$30k+",
};

export const DEBT_EXTRA_BUCKET_LABEL: Record<string, string> = {
  "0": "$0 extra",
  "1_100": "$1 – $100",
  "101_300": "$101 – $300",
  "300_plus": "$300+",
};

export function totalDebtBucket(total: number): string {
  if (total < 5_000) return "under_5k";
  if (total < 15_000) return "5k_15k";
  if (total < 30_000) return "15k_30k";
  return "30k_plus";
}

export function debtExtraPayBucket(extra: number): string {
  if (extra <= 0) return "0";
  if (extra <= 100) return "1_100";
  if (extra <= 300) return "101_300";
  return "300_plus";
}

export const SL_GOAL_METRIC_LABEL: Record<string, string> = {
  standard: "Standard repayment",
  idr: "IDR (illustrative)",
  compare: "Compare both",
  exploring: "Exploring",
};

export const SL_INCOME_BUCKET_LABEL: Record<string, string> = {
  under_30k: "Under $30k / yr",
  "30k_60k": "$30k – $60k",
  "60k_100k": "$60k – $100k",
  "100k_plus": "$100k+",
};

export function studentLoanIncomeBucket(annualIncome: number): string {
  if (annualIncome < 30_000) return "under_30k";
  if (annualIncome < 60_000) return "30k_60k";
  if (annualIncome < 100_000) return "60k_100k";
  return "100k_plus";
}

export const CREDIT_GOAL_METRIC_LABEL: Record<string, string> = {
  improve: "Improve score",
  learn: "Learn factors",
  exploring: "Exploring",
};

export const CREDIT_UTIL_BUCKET_LABEL: Record<string, string> = {
  "0_10": "0 – 10%",
  "10_30": "10 – 30%",
  "30_50": "30 – 50%",
  "50_plus": "50%+",
};

export const CREDIT_SCORE_BAND_LABEL: Record<string, string> = {
  poor: "Poor (<580)",
  fair: "Fair (580–669)",
  good: "Good (670–739)",
  very_good: "Very good (740–799)",
  excellent: "Excellent (800+)",
};

export function creditUtilizationBucket(utilizationPct: number): string {
  if (utilizationPct < 10) return "0_10";
  if (utilizationPct < 30) return "10_30";
  if (utilizationPct < 50) return "30_50";
  return "50_plus";
}

export function creditScoreBandBucket(score: number): string {
  if (score < 580) return "poor";
  if (score < 670) return "fair";
  if (score < 740) return "good";
  if (score < 800) return "very_good";
  return "excellent";
}

export const INVEST_GOAL_METRIC_LABEL: Record<string, string> = {
  wealth: "Build wealth",
  fire: "FIRE / retirement",
  exploring: "Exploring",
};

export const INVEST_MONTHLY_BUCKET_LABEL: Record<string, string> = {
  under_500: "Under $500 / mo",
  "500_1500": "$500 – $1.5k",
  "1500_3000": "$1.5k – $3k",
  "3000_plus": "$3k+",
};

export const INVEST_HORIZON_BUCKET_LABEL: Record<string, string> = {
  "5_15": "5 – 15 yr",
  "15_25": "15 – 25 yr",
  "25_35": "25 – 35 yr",
  "35_plus": "35+ yr",
};

export function investmentMonthlyBucket(monthly: number): string {
  if (monthly < 500) return "under_500";
  if (monthly < 1500) return "500_1500";
  if (monthly < 3000) return "1500_3000";
  return "3000_plus";
}

export function investmentHorizonBucket(years: number): string {
  if (years < 15) return "5_15";
  if (years < 25) return "15_25";
  if (years < 35) return "25_35";
  return "35_plus";
}

export const RETIRE_GOAL_METRIC_LABEL: Record<string, string> = {
  retire: "Traditional retirement",
  fire: "FIRE / work optional",
  exploring: "Exploring",
};

export const RETIRE_YEARS_BUCKET_LABEL: Record<string, string> = {
  under_10: "Under 10 yr",
  "10_20": "10 – 20 yr",
  "20_30": "20 – 30 yr",
  "30_plus": "30+ yr",
};

export const RETIRE_SPENDING_BUCKET_LABEL: Record<string, string> = {
  under_50k: "Under $50k / yr",
  "50_100k": "$50k – $100k",
  "100_150k": "$100k – $150k",
  "150k_plus": "$150k+",
};

export function retirementYearsToRetireBucket(years: number): string {
  if (years < 10) return "under_10";
  if (years < 20) return "10_20";
  if (years < 30) return "20_30";
  return "30_plus";
}

export function retirementSpendingBucket(annual: number): string {
  if (annual < 50_000) return "under_50k";
  if (annual < 100_000) return "50_100k";
  if (annual < 150_000) return "100_150k";
  return "150k_plus";
}

export const FI_SNAPSHOT_GOAL_METRIC_LABEL: Record<string, string> = {
  freedom: "Freedom runway",
  clarity: "Clarity",
  milestone: "Milestone check",
  exploring: "Exploring",
};

export const FI_SNAPSHOT_BAND_METRIC_LABEL: Record<string, string> = {
  launchpad: "Launchpad",
  foundation: "Foundation",
  trajectory: "Trajectory",
  approach: "Approach",
  orbit: "Orbit",
  independence: "Independence",
};

export const FI_SNAPSHOT_BALANCE_BUCKET_LABEL: Record<string, string> = {
  negative: "Negative net worth",
  under_50k: "Under $50k",
  "50k_150k": "$50k – $150k",
  "150k_500k": "$150k – $500k",
  "500k_1m": "$500k – $1M",
  "1m_plus": "$1M+",
};

export function fiSnapshotBalanceBucket(amount: number): string {
  if (amount < 0) return "negative";
  if (amount < 50_000) return "under_50k";
  if (amount < 150_000) return "50k_150k";
  if (amount < 500_000) return "150k_500k";
  if (amount < 1_000_000) return "500k_1m";
  return "1m_plus";
}

export const CRYPTO_YIELD_GOAL_METRIC_LABEL: Record<string, string> = {
  compounding: "Compounding",
  compare: "Compare frequencies",
  exploring: "Exploring",
};

export const CRYPTO_APY_BUCKET_LABEL: Record<string, string> = {
  under_3: "Under 3%",
  "3_6": "3 – 6%",
  "6_10": "6 – 10%",
  "10_plus": "10%+",
};

export const CRYPTO_HORIZON_BUCKET_LABEL: Record<string, string> = {
  under_6: "Under 6 mo",
  "6_12": "6 – 12 mo",
  "12_24": "12 – 24 mo",
  "24_plus": "24+ mo",
};

export const COMPOUNDING_METRIC_LABEL: Record<string, string> = {
  daily: "Daily",
  monthly: "Monthly",
  annual: "Annual",
};

export function cryptoApyBucket(apyPercent: number): string {
  if (apyPercent < 3) return "under_3";
  if (apyPercent < 6) return "3_6";
  if (apyPercent < 10) return "6_10";
  return "10_plus";
}

export function cryptoHorizonBucket(months: number): string {
  if (months < 6) return "under_6";
  if (months < 12) return "6_12";
  if (months < 24) return "12_24";
  return "24_plus";
}

export function parseToolAnalytics(raw: unknown, toolSlug: string): ToolAnalyticsDoc {
  const base = emptyToolAnalytics(toolSlug);
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  const funnelRaw = o.funnel as Partial<ToolFunnelMetrics> | undefined;
  const actionsRaw = o.actions as Partial<ToolActionMetrics> | undefined;
  const budgetRaw = o.budget as Partial<BudgetBehaviorMetrics> | undefined;
  const efRaw = o.emergencyFund as Partial<EmergencyFundBehaviorMetrics> | undefined;
  const subRaw = o.subscriptionAudit as Partial<SubscriptionAuditBehaviorMetrics> | undefined;
  const mortgageRaw = o.mortgage as Partial<MortgageBehaviorMetrics> | undefined;
  const loanRaw = o.loan as Partial<LoanBehaviorMetrics> | undefined;
  const debtRaw = o.debtPayoff as Partial<DebtPayoffBehaviorMetrics> | undefined;
  const slRaw = o.studentLoan as Partial<StudentLoanBehaviorMetrics> | undefined;
  const creditRaw = o.creditScore as Partial<CreditScoreBehaviorMetrics> | undefined;
  const investRaw = o.investment as Partial<InvestmentBehaviorMetrics> | undefined;
  const retireRaw = o.retirement as Partial<RetirementBehaviorMetrics> | undefined;
  const fiRaw = o.fiSnapshot as Partial<FiSnapshotBehaviorMetrics> | undefined;
  const cryptoRaw = o.cryptoYield as Partial<CryptoYieldBehaviorMetrics> | undefined;

  return {
    funnel: { ...base.funnel, ...funnelRaw },
    actions: { ...base.actions, ...actionsRaw },
    budget: base.budget
      ? {
          ...base.budget,
          ...budgetRaw,
          goals: { ...base.budget.goals, ...(budgetRaw?.goals ?? {}) },
          modes: { ...base.budget.modes, ...(budgetRaw?.modes ?? {}) },
          incomeBuckets: { ...base.budget.incomeBuckets, ...(budgetRaw?.incomeBuckets ?? {}) },
          bufferBuckets: { ...base.budget.bufferBuckets, ...(budgetRaw?.bufferBuckets ?? {}) },
          avgScore: { ...base.budget.avgScore, ...(budgetRaw?.avgScore ?? {}) },
          avgLineItems: { ...base.budget.avgLineItems, ...(budgetRaw?.avgLineItems ?? {}) },
          avgIncome: { ...base.budget.avgIncome, ...(budgetRaw?.avgIncome ?? {}) },
          overBudgetSessions: budgetRaw?.overBudgetSessions ?? base.budget.overBudgetSessions,
          balancedZeroBasedSessions:
            budgetRaw?.balancedZeroBasedSessions ?? base.budget.balancedZeroBasedSessions,
        }
      : undefined,
    emergencyFund: base.emergencyFund
      ? {
          ...base.emergencyFund,
          ...efRaw,
          goals: { ...base.emergencyFund.goals, ...(efRaw?.goals ?? {}) },
          planModes: { ...base.emergencyFund.planModes, ...(efRaw?.planModes ?? {}) },
          essentialsBuckets: { ...base.emergencyFund.essentialsBuckets, ...(efRaw?.essentialsBuckets ?? {}) },
          targetMonthBuckets: { ...base.emergencyFund.targetMonthBuckets, ...(efRaw?.targetMonthBuckets ?? {}) },
          avgScore: { ...base.emergencyFund.avgScore, ...(efRaw?.avgScore ?? {}) },
          avgRunwayMonths: { ...base.emergencyFund.avgRunwayMonths, ...(efRaw?.avgRunwayMonths ?? {}) },
          avgPctFunded: { ...base.emergencyFund.avgPctFunded, ...(efRaw?.avgPctFunded ?? {}) },
          avgLineItems: { ...base.emergencyFund.avgLineItems, ...(efRaw?.avgLineItems ?? {}) },
          fullyFundedSessions: efRaw?.fullyFundedSessions ?? base.emergencyFund.fullyFundedSessions,
          underThreeMonthRunwaySessions:
            efRaw?.underThreeMonthRunwaySessions ?? base.emergencyFund.underThreeMonthRunwaySessions,
        }
      : undefined,
    subscriptionAudit: base.subscriptionAudit
      ? {
          ...base.subscriptionAudit,
          ...subRaw,
          goals: { ...base.subscriptionAudit.goals, ...(subRaw?.goals ?? {}) },
          modes: { ...base.subscriptionAudit.modes, ...(subRaw?.modes ?? {}) },
          recurringBuckets: { ...base.subscriptionAudit.recurringBuckets, ...(subRaw?.recurringBuckets ?? {}) },
          countBuckets: { ...base.subscriptionAudit.countBuckets, ...(subRaw?.countBuckets ?? {}) },
          trimBuckets: { ...base.subscriptionAudit.trimBuckets, ...(subRaw?.trimBuckets ?? {}) },
          avgScore: { ...base.subscriptionAudit.avgScore, ...(subRaw?.avgScore ?? {}) },
          avgMonthlyRecurring: { ...base.subscriptionAudit.avgMonthlyRecurring, ...(subRaw?.avgMonthlyRecurring ?? {}) },
          avgLineItems: { ...base.subscriptionAudit.avgLineItems, ...(subRaw?.avgLineItems ?? {}) },
          avgTrimPercent: { ...base.subscriptionAudit.avgTrimPercent, ...(subRaw?.avgTrimPercent ?? {}) },
          highBurnSessions: subRaw?.highBurnSessions ?? base.subscriptionAudit.highBurnSessions,
          trimGoalSessions: subRaw?.trimGoalSessions ?? base.subscriptionAudit.trimGoalSessions,
          lineItemAuditSessions:
            subRaw?.lineItemAuditSessions ?? base.subscriptionAudit.lineItemAuditSessions,
        }
      : undefined,
    mortgage: base.mortgage
      ? {
          ...base.mortgage,
          ...mortgageRaw,
          goals: { ...base.mortgage.goals, ...(mortgageRaw?.goals ?? {}) },
          homePriceBuckets: { ...base.mortgage.homePriceBuckets, ...(mortgageRaw?.homePriceBuckets ?? {}) },
          downPaymentBuckets: { ...base.mortgage.downPaymentBuckets, ...(mortgageRaw?.downPaymentBuckets ?? {}) },
          rateBuckets: { ...base.mortgage.rateBuckets, ...(mortgageRaw?.rateBuckets ?? {}) },
          ltvBuckets: { ...base.mortgage.ltvBuckets, ...(mortgageRaw?.ltvBuckets ?? {}) },
          dtiBuckets: { ...base.mortgage.dtiBuckets, ...(mortgageRaw?.dtiBuckets ?? {}) },
          avgScore: { ...base.mortgage.avgScore, ...(mortgageRaw?.avgScore ?? {}) },
          avgPiti: { ...base.mortgage.avgPiti, ...(mortgageRaw?.avgPiti ?? {}) },
          avgHousingDtiPct: { ...base.mortgage.avgHousingDtiPct, ...(mortgageRaw?.avgHousingDtiPct ?? {}) },
          highDtiSessions: mortgageRaw?.highDtiSessions ?? base.mortgage.highDtiSessions,
          pmiRequiredSessions: mortgageRaw?.pmiRequiredSessions ?? base.mortgage.pmiRequiredSessions,
          refiGoalSessions: mortgageRaw?.refiGoalSessions ?? base.mortgage.refiGoalSessions,
        }
      : undefined,
    loan: base.loan
      ? {
          ...base.loan,
          ...loanRaw,
          goals: { ...base.loan.goals, ...(loanRaw?.goals ?? {}) },
          principalBuckets: { ...base.loan.principalBuckets, ...(loanRaw?.principalBuckets ?? {}) },
          aprBuckets: { ...base.loan.aprBuckets, ...(loanRaw?.aprBuckets ?? {}) },
          termBuckets: { ...base.loan.termBuckets, ...(loanRaw?.termBuckets ?? {}) },
          avgScore: { ...base.loan.avgScore, ...(loanRaw?.avgScore ?? {}) },
          avgMonthlyPayment: { ...base.loan.avgMonthlyPayment, ...(loanRaw?.avgMonthlyPayment ?? {}) },
          avgTotalInterest: { ...base.loan.avgTotalInterest, ...(loanRaw?.avgTotalInterest ?? {}) },
          highAprSessions: loanRaw?.highAprSessions ?? base.loan.highAprSessions,
          refiGoalSessions: loanRaw?.refiGoalSessions ?? base.loan.refiGoalSessions,
          extraPaySessions: loanRaw?.extraPaySessions ?? base.loan.extraPaySessions,
          compareBSessions: loanRaw?.compareBSessions ?? base.loan.compareBSessions,
        }
      : undefined,
    debtPayoff: base.debtPayoff
      ? {
          ...base.debtPayoff,
          ...debtRaw,
          goals: { ...base.debtPayoff.goals, ...(debtRaw?.goals ?? {}) },
          balanceBuckets: { ...base.debtPayoff.balanceBuckets, ...(debtRaw?.balanceBuckets ?? {}) },
          extraPayBuckets: { ...base.debtPayoff.extraPayBuckets, ...(debtRaw?.extraPayBuckets ?? {}) },
          avgScore: { ...base.debtPayoff.avgScore, ...(debtRaw?.avgScore ?? {}) },
          avgTotalDebt: { ...base.debtPayoff.avgTotalDebt, ...(debtRaw?.avgTotalDebt ?? {}) },
          avgExtraMonthly: { ...base.debtPayoff.avgExtraMonthly, ...(debtRaw?.avgExtraMonthly ?? {}) },
          avgAvalancheMonths: { ...base.debtPayoff.avgAvalancheMonths, ...(debtRaw?.avgAvalancheMonths ?? {}) },
          highAprDebtSessions: debtRaw?.highAprDebtSessions ?? base.debtPayoff.highAprDebtSessions,
          compareGoalSessions: debtRaw?.compareGoalSessions ?? base.debtPayoff.compareGoalSessions,
          multiDebtSessions: debtRaw?.multiDebtSessions ?? base.debtPayoff.multiDebtSessions,
          extraPaySessions: debtRaw?.extraPaySessions ?? base.debtPayoff.extraPaySessions,
        }
      : undefined,
    studentLoan: base.studentLoan
      ? {
          ...base.studentLoan,
          ...slRaw,
          goals: { ...base.studentLoan.goals, ...(slRaw?.goals ?? {}) },
          balanceBuckets: { ...base.studentLoan.balanceBuckets, ...(slRaw?.balanceBuckets ?? {}) },
          incomeBuckets: { ...base.studentLoan.incomeBuckets, ...(slRaw?.incomeBuckets ?? {}) },
          aprBuckets: { ...base.studentLoan.aprBuckets, ...(slRaw?.aprBuckets ?? {}) },
          avgScore: { ...base.studentLoan.avgScore, ...(slRaw?.avgScore ?? {}) },
          avgStandardMonthly: { ...base.studentLoan.avgStandardMonthly, ...(slRaw?.avgStandardMonthly ?? {}) },
          avgIdrMonthly: { ...base.studentLoan.avgIdrMonthly, ...(slRaw?.avgIdrMonthly ?? {}) },
          avgIdrEndingBalance: { ...base.studentLoan.avgIdrEndingBalance, ...(slRaw?.avgIdrEndingBalance ?? {}) },
          idrBelowInterestSessions: slRaw?.idrBelowInterestSessions ?? base.studentLoan.idrBelowInterestSessions,
          compareGoalSessions: slRaw?.compareGoalSessions ?? base.studentLoan.compareGoalSessions,
          idrGoalSessions: slRaw?.idrGoalSessions ?? base.studentLoan.idrGoalSessions,
          highBalanceSessions: slRaw?.highBalanceSessions ?? base.studentLoan.highBalanceSessions,
        }
      : undefined,
    creditScore: base.creditScore
      ? {
          ...base.creditScore,
          ...creditRaw,
          goals: { ...base.creditScore.goals, ...(creditRaw?.goals ?? {}) },
          utilizationBuckets: { ...base.creditScore.utilizationBuckets, ...(creditRaw?.utilizationBuckets ?? {}) },
          scoreBandBuckets: { ...base.creditScore.scoreBandBuckets, ...(creditRaw?.scoreBandBuckets ?? {}) },
          avgSimulatedScore: { ...base.creditScore.avgSimulatedScore, ...(creditRaw?.avgSimulatedScore ?? {}) },
          avgUtilization: { ...base.creditScore.avgUtilization, ...(creditRaw?.avgUtilization ?? {}) },
          highUtilSessions: creditRaw?.highUtilSessions ?? base.creditScore.highUtilSessions,
          lowScoreSessions: creditRaw?.lowScoreSessions ?? base.creditScore.lowScoreSessions,
          improveGoalSessions: creditRaw?.improveGoalSessions ?? base.creditScore.improveGoalSessions,
        }
      : undefined,
    investment: base.investment
      ? {
          ...base.investment,
          ...investRaw,
          goals: { ...base.investment.goals, ...(investRaw?.goals ?? {}) },
          initialBuckets: { ...base.investment.initialBuckets, ...(investRaw?.initialBuckets ?? {}) },
          monthlyBuckets: { ...base.investment.monthlyBuckets, ...(investRaw?.monthlyBuckets ?? {}) },
          horizonBuckets: { ...base.investment.horizonBuckets, ...(investRaw?.horizonBuckets ?? {}) },
          avgScore: { ...base.investment.avgScore, ...(investRaw?.avgScore ?? {}) },
          avgFinalNominal: { ...base.investment.avgFinalNominal, ...(investRaw?.avgFinalNominal ?? {}) },
          avgMonthlyContribution: { ...base.investment.avgMonthlyContribution, ...(investRaw?.avgMonthlyContribution ?? {}) },
          avgYearsToFire: { ...base.investment.avgYearsToFire, ...(investRaw?.avgYearsToFire ?? {}) },
          fireGoalSessions: investRaw?.fireGoalSessions ?? base.investment.fireGoalSessions,
          highContributionSessions: investRaw?.highContributionSessions ?? base.investment.highContributionSessions,
          longHorizonSessions: investRaw?.longHorizonSessions ?? base.investment.longHorizonSessions,
        }
      : undefined,
    retirement: base.retirement
      ? {
          ...base.retirement,
          ...retireRaw,
          goals: { ...base.retirement.goals, ...(retireRaw?.goals ?? {}) },
          balanceBuckets: { ...base.retirement.balanceBuckets, ...(retireRaw?.balanceBuckets ?? {}) },
          monthlyBuckets: { ...base.retirement.monthlyBuckets, ...(retireRaw?.monthlyBuckets ?? {}) },
          yearsToRetireBuckets: { ...base.retirement.yearsToRetireBuckets, ...(retireRaw?.yearsToRetireBuckets ?? {}) },
          spendingBuckets: { ...base.retirement.spendingBuckets, ...(retireRaw?.spendingBuckets ?? {}) },
          avgScore: { ...base.retirement.avgScore, ...(retireRaw?.avgScore ?? {}) },
          avgFiNumber: { ...base.retirement.avgFiNumber, ...(retireRaw?.avgFiNumber ?? {}) },
          avgBalanceAtRetire: { ...base.retirement.avgBalanceAtRetire, ...(retireRaw?.avgBalanceAtRetire ?? {}) },
          avgMonthlyContribution: { ...base.retirement.avgMonthlyContribution, ...(retireRaw?.avgMonthlyContribution ?? {}) },
          avgYearsToRetire: { ...base.retirement.avgYearsToRetire, ...(retireRaw?.avgYearsToRetire ?? {}) },
          fireGoalSessions: retireRaw?.fireGoalSessions ?? base.retirement.fireGoalSessions,
          onTrackSessions: retireRaw?.onTrackSessions ?? base.retirement.onTrackSessions,
          offTrackSessions: retireRaw?.offTrackSessions ?? base.retirement.offTrackSessions,
          highContributionSessions: retireRaw?.highContributionSessions ?? base.retirement.highContributionSessions,
          longTimelineSessions: retireRaw?.longTimelineSessions ?? base.retirement.longTimelineSessions,
          socialSecuritySessions: retireRaw?.socialSecuritySessions ?? base.retirement.socialSecuritySessions,
        }
      : undefined,
    fiSnapshot: base.fiSnapshot
      ? {
          ...base.fiSnapshot,
          ...fiRaw,
          goals: { ...base.fiSnapshot.goals, ...(fiRaw?.goals ?? {}) },
          netWorthBuckets: { ...base.fiSnapshot.netWorthBuckets, ...(fiRaw?.netWorthBuckets ?? {}) },
          assetBuckets: { ...base.fiSnapshot.assetBuckets, ...(fiRaw?.assetBuckets ?? {}) },
          liabilityBuckets: { ...base.fiSnapshot.liabilityBuckets, ...(fiRaw?.liabilityBuckets ?? {}) },
          expenseBuckets: { ...base.fiSnapshot.expenseBuckets, ...(fiRaw?.expenseBuckets ?? {}) },
          investingBuckets: { ...base.fiSnapshot.investingBuckets, ...(fiRaw?.investingBuckets ?? {}) },
          freedomBandBuckets: { ...base.fiSnapshot.freedomBandBuckets, ...(fiRaw?.freedomBandBuckets ?? {}) },
          avgScore: { ...base.fiSnapshot.avgScore, ...(fiRaw?.avgScore ?? {}) },
          avgNetWorth: { ...base.fiSnapshot.avgNetWorth, ...(fiRaw?.avgNetWorth ?? {}) },
          avgFiNumber: { ...base.fiSnapshot.avgFiNumber, ...(fiRaw?.avgFiNumber ?? {}) },
          avgFiProgressPct: { ...base.fiSnapshot.avgFiProgressPct, ...(fiRaw?.avgFiProgressPct ?? {}) },
          avgMonthlyInvesting: { ...base.fiSnapshot.avgMonthlyInvesting, ...(fiRaw?.avgMonthlyInvesting ?? {}) },
          avgYearsToFi: { ...base.fiSnapshot.avgYearsToFi, ...(fiRaw?.avgYearsToFi ?? {}) },
          freedomGoalSessions: fiRaw?.freedomGoalSessions ?? base.fiSnapshot.freedomGoalSessions,
          independenceBandSessions: fiRaw?.independenceBandSessions ?? base.fiSnapshot.independenceBandSessions,
          highProgressSessions: fiRaw?.highProgressSessions ?? base.fiSnapshot.highProgressSessions,
          negativeNetWorthSessions: fiRaw?.negativeNetWorthSessions ?? base.fiSnapshot.negativeNetWorthSessions,
          highInvestingSessions: fiRaw?.highInvestingSessions ?? base.fiSnapshot.highInvestingSessions,
        }
      : undefined,
    cryptoYield: base.cryptoYield
      ? {
          ...base.cryptoYield,
          ...cryptoRaw,
          goals: { ...base.cryptoYield.goals, ...(cryptoRaw?.goals ?? {}) },
          principalBuckets: { ...base.cryptoYield.principalBuckets, ...(cryptoRaw?.principalBuckets ?? {}) },
          apyBuckets: { ...base.cryptoYield.apyBuckets, ...(cryptoRaw?.apyBuckets ?? {}) },
          horizonBuckets: { ...base.cryptoYield.horizonBuckets, ...(cryptoRaw?.horizonBuckets ?? {}) },
          compoundingBuckets: { ...base.cryptoYield.compoundingBuckets, ...(cryptoRaw?.compoundingBuckets ?? {}) },
          avgScore: { ...base.cryptoYield.avgScore, ...(cryptoRaw?.avgScore ?? {}) },
          avgFutureValue: { ...base.cryptoYield.avgFutureValue, ...(cryptoRaw?.avgFutureValue ?? {}) },
          avgApyPercent: { ...base.cryptoYield.avgApyPercent, ...(cryptoRaw?.avgApyPercent ?? {}) },
          avgInterestEarned: { ...base.cryptoYield.avgInterestEarned, ...(cryptoRaw?.avgInterestEarned ?? {}) },
          avgEffectiveApy: { ...base.cryptoYield.avgEffectiveApy, ...(cryptoRaw?.avgEffectiveApy ?? {}) },
          compareGoalSessions: cryptoRaw?.compareGoalSessions ?? base.cryptoYield.compareGoalSessions,
          highApySessions: cryptoRaw?.highApySessions ?? base.cryptoYield.highApySessions,
          dailyCompoundSessions: cryptoRaw?.dailyCompoundSessions ?? base.cryptoYield.dailyCompoundSessions,
          longHorizonSessions: cryptoRaw?.longHorizonSessions ?? base.cryptoYield.longHorizonSessions,
        }
      : undefined,
    lastEventAt: typeof o.lastEventAt === "string" ? o.lastEventAt : null,
  };
}

export function bumpToolAnalytics(
  doc: ToolAnalyticsDoc,
  event: ToolEventType,
  meta?: Record<string, unknown>
): ToolAnalyticsDoc {
  const next: ToolAnalyticsDoc = {
    ...doc,
    funnel: { ...doc.funnel },
    actions: { ...doc.actions },
    budget: doc.budget
      ? {
          ...doc.budget,
          goals: { ...doc.budget.goals },
          modes: { ...doc.budget.modes },
          incomeBuckets: { ...doc.budget.incomeBuckets },
          bufferBuckets: { ...doc.budget.bufferBuckets },
          avgScore: { ...doc.budget.avgScore },
          avgLineItems: { ...doc.budget.avgLineItems },
          avgIncome: { ...doc.budget.avgIncome },
        }
      : undefined,
    emergencyFund: doc.emergencyFund
      ? {
          ...doc.emergencyFund,
          goals: { ...doc.emergencyFund.goals },
          planModes: { ...doc.emergencyFund.planModes },
          essentialsBuckets: { ...doc.emergencyFund.essentialsBuckets },
          targetMonthBuckets: { ...doc.emergencyFund.targetMonthBuckets },
          avgScore: { ...doc.emergencyFund.avgScore },
          avgRunwayMonths: { ...doc.emergencyFund.avgRunwayMonths },
          avgPctFunded: { ...doc.emergencyFund.avgPctFunded },
          avgLineItems: { ...doc.emergencyFund.avgLineItems },
        }
      : undefined,
    subscriptionAudit: doc.subscriptionAudit
      ? {
          ...doc.subscriptionAudit,
          goals: { ...doc.subscriptionAudit.goals },
          modes: { ...doc.subscriptionAudit.modes },
          recurringBuckets: { ...doc.subscriptionAudit.recurringBuckets },
          countBuckets: { ...doc.subscriptionAudit.countBuckets },
          trimBuckets: { ...doc.subscriptionAudit.trimBuckets },
          avgScore: { ...doc.subscriptionAudit.avgScore },
          avgMonthlyRecurring: { ...doc.subscriptionAudit.avgMonthlyRecurring },
          avgLineItems: { ...doc.subscriptionAudit.avgLineItems },
          avgTrimPercent: { ...doc.subscriptionAudit.avgTrimPercent },
        }
      : undefined,
    mortgage: doc.mortgage
      ? {
          ...doc.mortgage,
          goals: { ...doc.mortgage.goals },
          homePriceBuckets: { ...doc.mortgage.homePriceBuckets },
          downPaymentBuckets: { ...doc.mortgage.downPaymentBuckets },
          rateBuckets: { ...doc.mortgage.rateBuckets },
          ltvBuckets: { ...doc.mortgage.ltvBuckets },
          dtiBuckets: { ...doc.mortgage.dtiBuckets },
          avgScore: { ...doc.mortgage.avgScore },
          avgPiti: { ...doc.mortgage.avgPiti },
          avgHousingDtiPct: { ...doc.mortgage.avgHousingDtiPct },
        }
      : undefined,
    loan: doc.loan
      ? {
          ...doc.loan,
          goals: { ...doc.loan.goals },
          principalBuckets: { ...doc.loan.principalBuckets },
          aprBuckets: { ...doc.loan.aprBuckets },
          termBuckets: { ...doc.loan.termBuckets },
          avgScore: { ...doc.loan.avgScore },
          avgMonthlyPayment: { ...doc.loan.avgMonthlyPayment },
          avgTotalInterest: { ...doc.loan.avgTotalInterest },
        }
      : undefined,
    debtPayoff: doc.debtPayoff
      ? {
          ...doc.debtPayoff,
          goals: { ...doc.debtPayoff.goals },
          balanceBuckets: { ...doc.debtPayoff.balanceBuckets },
          extraPayBuckets: { ...doc.debtPayoff.extraPayBuckets },
          avgScore: { ...doc.debtPayoff.avgScore },
          avgTotalDebt: { ...doc.debtPayoff.avgTotalDebt },
          avgExtraMonthly: { ...doc.debtPayoff.avgExtraMonthly },
          avgAvalancheMonths: { ...doc.debtPayoff.avgAvalancheMonths },
        }
      : undefined,
    studentLoan: doc.studentLoan
      ? {
          ...doc.studentLoan,
          goals: { ...doc.studentLoan.goals },
          balanceBuckets: { ...doc.studentLoan.balanceBuckets },
          incomeBuckets: { ...doc.studentLoan.incomeBuckets },
          aprBuckets: { ...doc.studentLoan.aprBuckets },
          avgScore: { ...doc.studentLoan.avgScore },
          avgStandardMonthly: { ...doc.studentLoan.avgStandardMonthly },
          avgIdrMonthly: { ...doc.studentLoan.avgIdrMonthly },
          avgIdrEndingBalance: { ...doc.studentLoan.avgIdrEndingBalance },
        }
      : undefined,
    creditScore: doc.creditScore
      ? {
          ...doc.creditScore,
          goals: { ...doc.creditScore.goals },
          utilizationBuckets: { ...doc.creditScore.utilizationBuckets },
          scoreBandBuckets: { ...doc.creditScore.scoreBandBuckets },
          avgSimulatedScore: { ...doc.creditScore.avgSimulatedScore },
          avgUtilization: { ...doc.creditScore.avgUtilization },
        }
      : undefined,
    investment: doc.investment
      ? {
          ...doc.investment,
          goals: { ...doc.investment.goals },
          initialBuckets: { ...doc.investment.initialBuckets },
          monthlyBuckets: { ...doc.investment.monthlyBuckets },
          horizonBuckets: { ...doc.investment.horizonBuckets },
          avgScore: { ...doc.investment.avgScore },
          avgFinalNominal: { ...doc.investment.avgFinalNominal },
          avgMonthlyContribution: { ...doc.investment.avgMonthlyContribution },
          avgYearsToFire: { ...doc.investment.avgYearsToFire },
        }
      : undefined,
    retirement: doc.retirement
      ? {
          ...doc.retirement,
          goals: { ...doc.retirement.goals },
          balanceBuckets: { ...doc.retirement.balanceBuckets },
          monthlyBuckets: { ...doc.retirement.monthlyBuckets },
          yearsToRetireBuckets: { ...doc.retirement.yearsToRetireBuckets },
          spendingBuckets: { ...doc.retirement.spendingBuckets },
          avgScore: { ...doc.retirement.avgScore },
          avgFiNumber: { ...doc.retirement.avgFiNumber },
          avgBalanceAtRetire: { ...doc.retirement.avgBalanceAtRetire },
          avgMonthlyContribution: { ...doc.retirement.avgMonthlyContribution },
          avgYearsToRetire: { ...doc.retirement.avgYearsToRetire },
        }
      : undefined,
    fiSnapshot: doc.fiSnapshot
      ? {
          ...doc.fiSnapshot,
          goals: { ...doc.fiSnapshot.goals },
          netWorthBuckets: { ...doc.fiSnapshot.netWorthBuckets },
          assetBuckets: { ...doc.fiSnapshot.assetBuckets },
          liabilityBuckets: { ...doc.fiSnapshot.liabilityBuckets },
          expenseBuckets: { ...doc.fiSnapshot.expenseBuckets },
          investingBuckets: { ...doc.fiSnapshot.investingBuckets },
          freedomBandBuckets: { ...doc.fiSnapshot.freedomBandBuckets },
          avgScore: { ...doc.fiSnapshot.avgScore },
          avgNetWorth: { ...doc.fiSnapshot.avgNetWorth },
          avgFiNumber: { ...doc.fiSnapshot.avgFiNumber },
          avgFiProgressPct: { ...doc.fiSnapshot.avgFiProgressPct },
          avgMonthlyInvesting: { ...doc.fiSnapshot.avgMonthlyInvesting },
          avgYearsToFi: { ...doc.fiSnapshot.avgYearsToFi },
        }
      : undefined,
    cryptoYield: doc.cryptoYield
      ? {
          ...doc.cryptoYield,
          goals: { ...doc.cryptoYield.goals },
          principalBuckets: { ...doc.cryptoYield.principalBuckets },
          apyBuckets: { ...doc.cryptoYield.apyBuckets },
          horizonBuckets: { ...doc.cryptoYield.horizonBuckets },
          compoundingBuckets: { ...doc.cryptoYield.compoundingBuckets },
          avgScore: { ...doc.cryptoYield.avgScore },
          avgFutureValue: { ...doc.cryptoYield.avgFutureValue },
          avgApyPercent: { ...doc.cryptoYield.avgApyPercent },
          avgInterestEarned: { ...doc.cryptoYield.avgInterestEarned },
          avgEffectiveApy: { ...doc.cryptoYield.avgEffectiveApy },
        }
      : undefined,
    lastEventAt: new Date().toISOString(),
  };

  switch (event) {
    case "page_view":
      next.funnel.pageViews += 1;
      break;
    case "journey_start":
      next.funnel.journeyStarts += 1;
      break;
    case "journey_skip":
      next.funnel.journeySkips += 1;
      break;
    case "journey_complete":
      next.funnel.journeyCompletes += 1;
      applyBudgetJourneyMeta(next, meta);
      applyEmergencyFundJourneyMeta(next, meta);
      applySubscriptionAuditJourneyMeta(next, meta);
      applyMortgageJourneyMeta(next, meta);
      applyLoanJourneyMeta(next, meta);
      applyDebtPayoffJourneyMeta(next, meta);
      applyStudentLoanJourneyMeta(next, meta);
      applyCreditScoreJourneyMeta(next, meta);
      applyInvestmentJourneyMeta(next, meta);
      applyRetirementJourneyMeta(next, meta);
      applyFiSnapshotJourneyMeta(next, meta);
      applyCryptoYieldJourneyMeta(next, meta);
      break;
    case "results_view":
      next.funnel.resultsViews += 1;
      break;
    case "dashboard_open":
      next.funnel.dashboardOpens += 1;
      break;
    case "retake_click":
      next.funnel.retakeClicks += 1;
      break;
    case "export_json":
      next.actions.exportJson += 1;
      break;
    case "export_text":
      next.actions.exportText += 1;
      break;
    case "walkthrough_open":
      next.actions.walkthroughOpens += 1;
      break;
    case "walkthrough_complete":
      next.actions.walkthroughCompletes += 1;
      break;
    case "starter_plan_load":
      next.actions.starterPlansLoaded += 1;
      break;
    case "target_fill":
      next.actions.targetFillClicks += 1;
      break;
    case "auto_assign_savings":
      next.actions.autoAssignClicks += 1;
      break;
    case "session_telemetry":
      next.actions.sessionTelemetryReports += 1;
      applyBudgetTelemetryMeta(next, meta);
      applyEmergencyFundTelemetryMeta(next, meta);
      applySubscriptionAuditTelemetryMeta(next, meta);
      applyMortgageTelemetryMeta(next, meta);
      applyLoanTelemetryMeta(next, meta);
      applyDebtPayoffTelemetryMeta(next, meta);
      applyStudentLoanTelemetryMeta(next, meta);
      applyCreditScoreTelemetryMeta(next, meta);
      applyInvestmentTelemetryMeta(next, meta);
      applyRetirementTelemetryMeta(next, meta);
      applyFiSnapshotTelemetryMeta(next, meta);
      applyCryptoYieldTelemetryMeta(next, meta);
      break;
  }

  return next;
}

function applyBudgetJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.budget || !meta) return;
  const goal = meta.goal;
  const mode = meta.mode;
  if (typeof goal === "string") inc(doc.budget.goals, goal);
  if (typeof mode === "string") inc(doc.budget.modes, mode);
  const income = Number(meta.incomeMonthly);
  if (Number.isFinite(income)) {
    inc(doc.budget.incomeBuckets, incomeBucket(income));
    incAvg(doc.budget.avgIncome, income);
  }
  const bufferPct = Number(meta.bufferPct);
  if (Number.isFinite(bufferPct)) inc(doc.budget.bufferBuckets, bufferBucket(bufferPct));
}

function applyBudgetTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.budget || !meta) return;
  const goal = meta.goal;
  const mode = meta.mode;
  if (typeof goal === "string") inc(doc.budget.goals, goal);
  if (typeof mode === "string") inc(doc.budget.modes, mode);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.budget.avgScore, score);
  const lineItemCount = Number(meta.lineItemCount);
  if (Number.isFinite(lineItemCount)) incAvg(doc.budget.avgLineItems, lineItemCount);
  const income = Number(meta.incomeMonthly);
  if (Number.isFinite(income)) incAvg(doc.budget.avgIncome, income);
  if (meta.overBudget === true) doc.budget.overBudgetSessions += 1;
  if (meta.balancedZeroBased === true) doc.budget.balancedZeroBasedSessions += 1;
}

function applyEmergencyFundJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.emergencyFund || !meta) return;
  const goal = meta.goal;
  const planMode = meta.planMode;
  if (typeof goal === "string") inc(doc.emergencyFund.goals, goal);
  if (typeof planMode === "string") inc(doc.emergencyFund.planModes, planMode);
  const essentials = Number(meta.monthlyEssentials);
  if (Number.isFinite(essentials)) inc(doc.emergencyFund.essentialsBuckets, essentialsBucket(essentials));
  const targetMonths = Number(meta.targetMonths);
  if (Number.isFinite(targetMonths)) inc(doc.emergencyFund.targetMonthBuckets, targetMonthBucket(targetMonths));
}

function applyEmergencyFundTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.emergencyFund || !meta) return;
  const goal = meta.goal;
  const planMode = meta.planMode;
  if (typeof goal === "string") inc(doc.emergencyFund.goals, goal);
  if (typeof planMode === "string") inc(doc.emergencyFund.planModes, planMode);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.emergencyFund.avgScore, score);
  const runwayMonths = Number(meta.runwayMonths);
  if (Number.isFinite(runwayMonths)) incAvg(doc.emergencyFund.avgRunwayMonths, runwayMonths);
  const pctFunded = Number(meta.pctFunded);
  if (Number.isFinite(pctFunded)) incAvg(doc.emergencyFund.avgPctFunded, pctFunded);
  const lineItemCount = Number(meta.lineItemCount);
  if (Number.isFinite(lineItemCount)) incAvg(doc.emergencyFund.avgLineItems, lineItemCount);
  const essentials = Number(meta.monthlyEssentials);
  if (Number.isFinite(essentials)) inc(doc.emergencyFund.essentialsBuckets, essentialsBucket(essentials));
  const targetMonths = Number(meta.targetMonths);
  if (Number.isFinite(targetMonths)) inc(doc.emergencyFund.targetMonthBuckets, targetMonthBucket(targetMonths));
  if (meta.fullyFunded === true) doc.emergencyFund.fullyFundedSessions += 1;
  if (Number.isFinite(runwayMonths) && runwayMonths < 3) doc.emergencyFund.underThreeMonthRunwaySessions += 1;
}

function applySubscriptionAuditJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.subscriptionAudit || !meta) return;
  const goal = meta.goal;
  const mode = meta.mode;
  if (typeof goal === "string") inc(doc.subscriptionAudit.goals, goal);
  if (typeof mode === "string") inc(doc.subscriptionAudit.modes, mode);
  const monthly = Number(meta.estimatedMonthlyRecurring);
  if (Number.isFinite(monthly)) inc(doc.subscriptionAudit.recurringBuckets, recurringSpendBucket(monthly));
  const count = Number(meta.subscriptionCount);
  if (Number.isFinite(count)) inc(doc.subscriptionAudit.countBuckets, subscriptionCountBucket(count));
  const trim = Number(meta.targetTrimPercent);
  if (Number.isFinite(trim)) {
    inc(doc.subscriptionAudit.trimBuckets, trimPercentBucket(trim));
    incAvg(doc.subscriptionAudit.avgTrimPercent, trim);
  }
}

function applySubscriptionAuditTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.subscriptionAudit || !meta) return;
  const goal = meta.goal;
  const mode = meta.mode;
  if (typeof goal === "string") inc(doc.subscriptionAudit.goals, goal);
  if (typeof mode === "string") inc(doc.subscriptionAudit.modes, mode);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.subscriptionAudit.avgScore, score);
  const monthly = Number(meta.monthlyRecurring);
  if (Number.isFinite(monthly)) {
    inc(doc.subscriptionAudit.recurringBuckets, recurringSpendBucket(monthly));
    incAvg(doc.subscriptionAudit.avgMonthlyRecurring, monthly);
  }
  const lineItemCount = Number(meta.lineItemCount);
  if (Number.isFinite(lineItemCount)) {
    incAvg(doc.subscriptionAudit.avgLineItems, lineItemCount);
    inc(doc.subscriptionAudit.countBuckets, subscriptionCountBucket(lineItemCount));
  }
  const trimPercent = Number(meta.trimPercent);
  if (Number.isFinite(trimPercent)) {
    inc(doc.subscriptionAudit.trimBuckets, trimPercentBucket(trimPercent));
    incAvg(doc.subscriptionAudit.avgTrimPercent, trimPercent);
  }
  if (meta.highBurn === true) doc.subscriptionAudit.highBurnSessions += 1;
  if (meta.trimGoalSet === true) doc.subscriptionAudit.trimGoalSessions += 1;
  if (meta.mode === "line_item_audit") doc.subscriptionAudit.lineItemAuditSessions += 1;
}

function applyMortgageJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.mortgage || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.mortgage.goals, goal);
    if (goal === "refinancing") doc.mortgage.refiGoalSessions += 1;
  }
  const homePrice = Number(meta.homePrice);
  if (Number.isFinite(homePrice)) inc(doc.mortgage.homePriceBuckets, homePriceBucket(homePrice));
  const downPercent = Number(meta.downPercent);
  if (Number.isFinite(downPercent)) inc(doc.mortgage.downPaymentBuckets, downPaymentBucket(downPercent));
  const rate = Number(meta.rate);
  if (Number.isFinite(rate)) inc(doc.mortgage.rateBuckets, mortgageRateBucket(rate));
  const ltv = Number(meta.ltv);
  if (Number.isFinite(ltv)) inc(doc.mortgage.ltvBuckets, ltvBucket(ltv));
  const housingDtiPct = Number(meta.housingDtiPct);
  if (Number.isFinite(housingDtiPct)) {
    inc(doc.mortgage.dtiBuckets, housingDtiBucket(housingDtiPct));
    incAvg(doc.mortgage.avgHousingDtiPct, housingDtiPct);
  }
  const piti = Number(meta.pitiFirstMonth);
  if (Number.isFinite(piti)) incAvg(doc.mortgage.avgPiti, piti);
  if (meta.needsPmi === true) doc.mortgage.pmiRequiredSessions += 1;
}

function applyMortgageTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.mortgage || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.mortgage.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.mortgage.avgScore, score);
  const homePrice = Number(meta.homePrice);
  if (Number.isFinite(homePrice)) inc(doc.mortgage.homePriceBuckets, homePriceBucket(homePrice));
  const downPercent = Number(meta.downPercent);
  if (Number.isFinite(downPercent)) inc(doc.mortgage.downPaymentBuckets, downPaymentBucket(downPercent));
  const rate = Number(meta.rate);
  if (Number.isFinite(rate)) inc(doc.mortgage.rateBuckets, mortgageRateBucket(rate));
  const ltv = Number(meta.ltv);
  if (Number.isFinite(ltv)) inc(doc.mortgage.ltvBuckets, ltvBucket(ltv));
  const housingDtiPct = Number(meta.housingDtiPct);
  if (Number.isFinite(housingDtiPct)) {
    inc(doc.mortgage.dtiBuckets, housingDtiBucket(housingDtiPct));
    incAvg(doc.mortgage.avgHousingDtiPct, housingDtiPct);
  }
  const piti = Number(meta.pitiFirstMonth);
  if (Number.isFinite(piti)) incAvg(doc.mortgage.avgPiti, piti);
  if (meta.highDti === true) doc.mortgage.highDtiSessions += 1;
  if (meta.needsPmi === true) doc.mortgage.pmiRequiredSessions += 1;
}

function applyLoanJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.loan || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.loan.goals, goal);
    if (goal === "refinance") doc.loan.refiGoalSessions += 1;
  }
  const principal = Number(meta.principal);
  if (Number.isFinite(principal)) inc(doc.loan.principalBuckets, loanPrincipalBucket(principal));
  const apr = Number(meta.apr);
  if (Number.isFinite(apr)) inc(doc.loan.aprBuckets, loanAprBucket(apr));
  const termYears = Number(meta.termYears);
  if (Number.isFinite(termYears)) inc(doc.loan.termBuckets, loanTermBucket(termYears));
  const monthlyPayment = Number(meta.monthlyPayment);
  if (Number.isFinite(monthlyPayment)) incAvg(doc.loan.avgMonthlyPayment, monthlyPayment);
  const totalInterest = Number(meta.totalInterest);
  if (Number.isFinite(totalInterest)) incAvg(doc.loan.avgTotalInterest, totalInterest);
  if (Number.isFinite(apr) && apr >= 12) doc.loan.highAprSessions += 1;
  const extraMonthly = Number(meta.extraMonthly);
  if (Number.isFinite(extraMonthly) && extraMonthly > 0) doc.loan.extraPaySessions += 1;
}

function applyLoanTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.loan || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.loan.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.loan.avgScore, score);
  const principal = Number(meta.principal);
  if (Number.isFinite(principal)) inc(doc.loan.principalBuckets, loanPrincipalBucket(principal));
  const apr = Number(meta.apr);
  if (Number.isFinite(apr)) inc(doc.loan.aprBuckets, loanAprBucket(apr));
  const termYears = Number(meta.termYears);
  if (Number.isFinite(termYears)) inc(doc.loan.termBuckets, loanTermBucket(termYears));
  const monthlyPayment = Number(meta.monthlyPayment);
  if (Number.isFinite(monthlyPayment)) incAvg(doc.loan.avgMonthlyPayment, monthlyPayment);
  const totalInterest = Number(meta.totalInterest);
  if (Number.isFinite(totalInterest)) incAvg(doc.loan.avgTotalInterest, totalInterest);
  if (meta.highApr === true) doc.loan.highAprSessions += 1;
  if (meta.extraPay === true) doc.loan.extraPaySessions += 1;
  if (meta.compareBActive === true) doc.loan.compareBSessions += 1;
}

function applyDebtPayoffJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.debtPayoff || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.debtPayoff.goals, goal);
    if (goal === "compare") doc.debtPayoff.compareGoalSessions += 1;
  }
  const totalDebt = Number(meta.totalDebt);
  if (Number.isFinite(totalDebt)) inc(doc.debtPayoff.balanceBuckets, totalDebtBucket(totalDebt));
  const extraMonthly = Number(meta.extraMonthly);
  if (Number.isFinite(extraMonthly)) {
    inc(doc.debtPayoff.extraPayBuckets, debtExtraPayBucket(extraMonthly));
    incAvg(doc.debtPayoff.avgExtraMonthly, extraMonthly);
    if (extraMonthly > 0) doc.debtPayoff.extraPaySessions += 1;
  }
  if (Number.isFinite(totalDebt)) incAvg(doc.debtPayoff.avgTotalDebt, totalDebt);
  const avalancheMonths = Number(meta.avalancheMonths);
  if (Number.isFinite(avalancheMonths)) incAvg(doc.debtPayoff.avgAvalancheMonths, avalancheMonths);
  if (meta.highAprDebt === true) doc.debtPayoff.highAprDebtSessions += 1;
}

function applyDebtPayoffTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.debtPayoff || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.debtPayoff.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.debtPayoff.avgScore, score);
  const totalDebt = Number(meta.totalDebt);
  if (Number.isFinite(totalDebt)) {
    inc(doc.debtPayoff.balanceBuckets, totalDebtBucket(totalDebt));
    incAvg(doc.debtPayoff.avgTotalDebt, totalDebt);
  }
  const extraMonthly = Number(meta.extraMonthly);
  if (Number.isFinite(extraMonthly)) {
    inc(doc.debtPayoff.extraPayBuckets, debtExtraPayBucket(extraMonthly));
    incAvg(doc.debtPayoff.avgExtraMonthly, extraMonthly);
  }
  const avalancheMonths = Number(meta.avalancheMonths);
  if (Number.isFinite(avalancheMonths)) incAvg(doc.debtPayoff.avgAvalancheMonths, avalancheMonths);
  if (meta.highAprDebt === true) doc.debtPayoff.highAprDebtSessions += 1;
  if (meta.extraPay === true) doc.debtPayoff.extraPaySessions += 1;
  if (meta.multiDebt === true) doc.debtPayoff.multiDebtSessions += 1;
}

function applyStudentLoanJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.studentLoan || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.studentLoan.goals, goal);
    if (goal === "compare") doc.studentLoan.compareGoalSessions += 1;
    if (goal === "idr") doc.studentLoan.idrGoalSessions += 1;
  }
  const balance = Number(meta.balance);
  if (Number.isFinite(balance)) {
    inc(doc.studentLoan.balanceBuckets, loanPrincipalBucket(balance));
    if (balance >= 50_000) doc.studentLoan.highBalanceSessions += 1;
  }
  const annualIncome = Number(meta.annualIncome);
  if (Number.isFinite(annualIncome)) inc(doc.studentLoan.incomeBuckets, studentLoanIncomeBucket(annualIncome));
  const apr = Number(meta.apr);
  if (Number.isFinite(apr)) inc(doc.studentLoan.aprBuckets, loanAprBucket(apr));
  const standardMonthly = Number(meta.standardMonthly);
  if (Number.isFinite(standardMonthly)) incAvg(doc.studentLoan.avgStandardMonthly, standardMonthly);
  const idrMonthly = Number(meta.idrMonthly);
  if (Number.isFinite(idrMonthly)) incAvg(doc.studentLoan.avgIdrMonthly, idrMonthly);
  if (meta.idrBelowInterest === true) doc.studentLoan.idrBelowInterestSessions += 1;
}

function applyStudentLoanTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.studentLoan || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.studentLoan.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.studentLoan.avgScore, score);
  const balance = Number(meta.balance);
  if (Number.isFinite(balance)) {
    inc(doc.studentLoan.balanceBuckets, loanPrincipalBucket(balance));
    if (balance >= 50_000) doc.studentLoan.highBalanceSessions += 1;
  }
  const annualIncome = Number(meta.annualIncome);
  if (Number.isFinite(annualIncome)) inc(doc.studentLoan.incomeBuckets, studentLoanIncomeBucket(annualIncome));
  const apr = Number(meta.apr);
  if (Number.isFinite(apr)) inc(doc.studentLoan.aprBuckets, loanAprBucket(apr));
  const standardMonthly = Number(meta.standardMonthly);
  if (Number.isFinite(standardMonthly)) incAvg(doc.studentLoan.avgStandardMonthly, standardMonthly);
  const idrMonthly = Number(meta.idrMonthly);
  if (Number.isFinite(idrMonthly)) incAvg(doc.studentLoan.avgIdrMonthly, idrMonthly);
  const idrEndingBalance = Number(meta.idrEndingBalance);
  if (Number.isFinite(idrEndingBalance)) incAvg(doc.studentLoan.avgIdrEndingBalance, idrEndingBalance);
  if (meta.idrBelowInterest === true) doc.studentLoan.idrBelowInterestSessions += 1;
  if (meta.idrGoal === true) doc.studentLoan.idrGoalSessions += 1;
}

function applyCreditScoreJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.creditScore || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.creditScore.goals, goal);
    if (goal === "improve") doc.creditScore.improveGoalSessions += 1;
  }
  const score = Number(meta.score);
  if (Number.isFinite(score)) {
    inc(doc.creditScore.scoreBandBuckets, creditScoreBandBucket(score));
    incAvg(doc.creditScore.avgSimulatedScore, score);
    if (score < 670) doc.creditScore.lowScoreSessions += 1;
  }
  const utilizationPct = Number(meta.utilizationPct);
  if (Number.isFinite(utilizationPct)) {
    inc(doc.creditScore.utilizationBuckets, creditUtilizationBucket(utilizationPct));
    incAvg(doc.creditScore.avgUtilization, utilizationPct);
    if (utilizationPct >= 30) doc.creditScore.highUtilSessions += 1;
  }
}

function applyCreditScoreTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.creditScore || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.creditScore.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) {
    inc(doc.creditScore.scoreBandBuckets, creditScoreBandBucket(score));
    incAvg(doc.creditScore.avgSimulatedScore, score);
  }
  const utilizationPct = Number(meta.utilizationPct);
  if (Number.isFinite(utilizationPct)) {
    inc(doc.creditScore.utilizationBuckets, creditUtilizationBucket(utilizationPct));
    incAvg(doc.creditScore.avgUtilization, utilizationPct);
  }
  if (meta.highUtil === true) doc.creditScore.highUtilSessions += 1;
  if (meta.lowScore === true) doc.creditScore.lowScoreSessions += 1;
  if (meta.improveGoal === true) doc.creditScore.improveGoalSessions += 1;
}

function applyInvestmentJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.investment || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.investment.goals, goal);
    if (goal === "fire") doc.investment.fireGoalSessions += 1;
  }
  const initial = Number(meta.initial);
  if (Number.isFinite(initial)) inc(doc.investment.initialBuckets, loanPrincipalBucket(initial));
  const monthly = Number(meta.monthly);
  if (Number.isFinite(monthly)) {
    inc(doc.investment.monthlyBuckets, investmentMonthlyBucket(monthly));
    incAvg(doc.investment.avgMonthlyContribution, monthly);
    if (monthly >= 1000) doc.investment.highContributionSessions += 1;
  }
  const years = Number(meta.years);
  if (Number.isFinite(years)) {
    inc(doc.investment.horizonBuckets, investmentHorizonBucket(years));
    if (years >= 25) doc.investment.longHorizonSessions += 1;
  }
  const finalNominal = Number(meta.finalNominal);
  if (Number.isFinite(finalNominal)) incAvg(doc.investment.avgFinalNominal, finalNominal);
  const yearsToFire = Number(meta.yearsToFire);
  if (Number.isFinite(yearsToFire)) incAvg(doc.investment.avgYearsToFire, yearsToFire);
}

function applyInvestmentTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.investment || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.investment.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.investment.avgScore, score);
  const initial = Number(meta.initial);
  if (Number.isFinite(initial)) inc(doc.investment.initialBuckets, loanPrincipalBucket(initial));
  const monthly = Number(meta.monthly);
  if (Number.isFinite(monthly)) {
    inc(doc.investment.monthlyBuckets, investmentMonthlyBucket(monthly));
    incAvg(doc.investment.avgMonthlyContribution, monthly);
  }
  const years = Number(meta.years);
  if (Number.isFinite(years)) inc(doc.investment.horizonBuckets, investmentHorizonBucket(years));
  const finalNominal = Number(meta.finalNominal);
  if (Number.isFinite(finalNominal)) incAvg(doc.investment.avgFinalNominal, finalNominal);
  const yearsToFire = Number(meta.yearsToFire);
  if (Number.isFinite(yearsToFire)) incAvg(doc.investment.avgYearsToFire, yearsToFire);
  if (meta.fireGoal === true) doc.investment.fireGoalSessions += 1;
  if (meta.highContribution === true) doc.investment.highContributionSessions += 1;
  if (meta.longHorizon === true) doc.investment.longHorizonSessions += 1;
}

function applyRetirementJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.retirement || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.retirement.goals, goal);
    if (goal === "fire") doc.retirement.fireGoalSessions += 1;
  }
  const totalBalance = Number(meta.totalBalance);
  if (Number.isFinite(totalBalance)) inc(doc.retirement.balanceBuckets, loanPrincipalBucket(totalBalance));
  const monthly = Number(meta.monthly);
  if (Number.isFinite(monthly)) {
    inc(doc.retirement.monthlyBuckets, investmentMonthlyBucket(monthly));
    incAvg(doc.retirement.avgMonthlyContribution, monthly);
    if (monthly >= 1000) doc.retirement.highContributionSessions += 1;
  }
  const yearsToRetire = Number(meta.yearsToRetire);
  if (Number.isFinite(yearsToRetire)) {
    inc(doc.retirement.yearsToRetireBuckets, retirementYearsToRetireBucket(yearsToRetire));
    incAvg(doc.retirement.avgYearsToRetire, yearsToRetire);
    if (yearsToRetire >= 25) doc.retirement.longTimelineSessions += 1;
  }
  const annualSpending = Number(meta.annualSpending);
  if (Number.isFinite(annualSpending)) inc(doc.retirement.spendingBuckets, retirementSpendingBucket(annualSpending));
  const fiNumber = Number(meta.fiNumber);
  if (Number.isFinite(fiNumber)) incAvg(doc.retirement.avgFiNumber, fiNumber);
  const balanceAtRetire = Number(meta.balanceAtRetire);
  if (Number.isFinite(balanceAtRetire)) incAvg(doc.retirement.avgBalanceAtRetire, balanceAtRetire);
  if (meta.onTrack === true) doc.retirement.onTrackSessions += 1;
  if (meta.onTrack === false) doc.retirement.offTrackSessions += 1;
}

function applyRetirementTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.retirement || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.retirement.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.retirement.avgScore, score);
  const totalBalance = Number(meta.totalBalance);
  if (Number.isFinite(totalBalance)) inc(doc.retirement.balanceBuckets, loanPrincipalBucket(totalBalance));
  const monthly = Number(meta.monthly);
  if (Number.isFinite(monthly)) {
    inc(doc.retirement.monthlyBuckets, investmentMonthlyBucket(monthly));
    incAvg(doc.retirement.avgMonthlyContribution, monthly);
  }
  const yearsToRetire = Number(meta.yearsToRetire);
  if (Number.isFinite(yearsToRetire)) {
    inc(doc.retirement.yearsToRetireBuckets, retirementYearsToRetireBucket(yearsToRetire));
    incAvg(doc.retirement.avgYearsToRetire, yearsToRetire);
  }
  const annualSpending = Number(meta.annualSpending);
  if (Number.isFinite(annualSpending)) inc(doc.retirement.spendingBuckets, retirementSpendingBucket(annualSpending));
  const fiNumber = Number(meta.fiNumber);
  if (Number.isFinite(fiNumber)) incAvg(doc.retirement.avgFiNumber, fiNumber);
  const balanceAtRetire = Number(meta.balanceAtRetire);
  if (Number.isFinite(balanceAtRetire)) incAvg(doc.retirement.avgBalanceAtRetire, balanceAtRetire);
  if (meta.fireGoal === true) doc.retirement.fireGoalSessions += 1;
  if (meta.onTrack === true) doc.retirement.onTrackSessions += 1;
  if (meta.offTrack === true) doc.retirement.offTrackSessions += 1;
  if (meta.highContribution === true) doc.retirement.highContributionSessions += 1;
  if (meta.longTimeline === true) doc.retirement.longTimelineSessions += 1;
  if (meta.hasSocialSecurity === true) doc.retirement.socialSecuritySessions += 1;
}

function applyFiSnapshotJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.fiSnapshot || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.fiSnapshot.goals, goal);
    if (goal === "freedom") doc.fiSnapshot.freedomGoalSessions += 1;
  }
  const netWorth = Number(meta.netWorth);
  if (Number.isFinite(netWorth)) {
    inc(doc.fiSnapshot.netWorthBuckets, fiSnapshotBalanceBucket(netWorth));
    incAvg(doc.fiSnapshot.avgNetWorth, netWorth);
    if (netWorth < 0) doc.fiSnapshot.negativeNetWorthSessions += 1;
  }
  const totalAssets = Number(meta.totalAssets);
  if (Number.isFinite(totalAssets)) inc(doc.fiSnapshot.assetBuckets, fiSnapshotBalanceBucket(totalAssets));
  const liabilities = Number(meta.liabilities);
  if (Number.isFinite(liabilities)) inc(doc.fiSnapshot.liabilityBuckets, fiSnapshotBalanceBucket(liabilities));
  const monthlyExpenses = Number(meta.monthlyExpenses);
  if (Number.isFinite(monthlyExpenses)) inc(doc.fiSnapshot.expenseBuckets, essentialsBucket(monthlyExpenses));
  const monthlyInvesting = Number(meta.monthlyInvesting);
  if (Number.isFinite(monthlyInvesting)) {
    inc(doc.fiSnapshot.investingBuckets, investmentMonthlyBucket(monthlyInvesting));
    incAvg(doc.fiSnapshot.avgMonthlyInvesting, monthlyInvesting);
    if (monthlyInvesting >= 1000) doc.fiSnapshot.highInvestingSessions += 1;
  }
  const fiNumber = Number(meta.fiNumber);
  if (Number.isFinite(fiNumber)) incAvg(doc.fiSnapshot.avgFiNumber, fiNumber);
  const fiProgressPct = Number(meta.fiProgressPct);
  if (Number.isFinite(fiProgressPct)) {
    incAvg(doc.fiSnapshot.avgFiProgressPct, fiProgressPct);
    if (fiProgressPct >= 75) doc.fiSnapshot.highProgressSessions += 1;
  }
  const freedomBand = meta.freedomBand;
  if (typeof freedomBand === "string") {
    inc(doc.fiSnapshot.freedomBandBuckets, freedomBand);
    if (freedomBand === "independence") doc.fiSnapshot.independenceBandSessions += 1;
  }
  const yearsToFi = Number(meta.yearsToFi);
  if (Number.isFinite(yearsToFi)) incAvg(doc.fiSnapshot.avgYearsToFi, yearsToFi);
}

function applyFiSnapshotTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.fiSnapshot || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.fiSnapshot.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.fiSnapshot.avgScore, score);
  const netWorth = Number(meta.netWorth);
  if (Number.isFinite(netWorth)) {
    inc(doc.fiSnapshot.netWorthBuckets, fiSnapshotBalanceBucket(netWorth));
    incAvg(doc.fiSnapshot.avgNetWorth, netWorth);
  }
  const totalAssets = Number(meta.totalAssets);
  if (Number.isFinite(totalAssets)) inc(doc.fiSnapshot.assetBuckets, fiSnapshotBalanceBucket(totalAssets));
  const liabilities = Number(meta.liabilities);
  if (Number.isFinite(liabilities)) inc(doc.fiSnapshot.liabilityBuckets, fiSnapshotBalanceBucket(liabilities));
  const monthlyExpenses = Number(meta.monthlyExpenses);
  if (Number.isFinite(monthlyExpenses)) inc(doc.fiSnapshot.expenseBuckets, essentialsBucket(monthlyExpenses));
  const monthlyInvesting = Number(meta.monthlyInvesting);
  if (Number.isFinite(monthlyInvesting)) {
    inc(doc.fiSnapshot.investingBuckets, investmentMonthlyBucket(monthlyInvesting));
    incAvg(doc.fiSnapshot.avgMonthlyInvesting, monthlyInvesting);
  }
  const fiNumber = Number(meta.fiNumber);
  if (Number.isFinite(fiNumber)) incAvg(doc.fiSnapshot.avgFiNumber, fiNumber);
  const fiProgressPct = Number(meta.fiProgressPct);
  if (Number.isFinite(fiProgressPct)) incAvg(doc.fiSnapshot.avgFiProgressPct, fiProgressPct);
  const freedomBand = meta.freedomBand;
  if (typeof freedomBand === "string") inc(doc.fiSnapshot.freedomBandBuckets, freedomBand);
  const yearsToFi = Number(meta.yearsToFi);
  if (Number.isFinite(yearsToFi)) incAvg(doc.fiSnapshot.avgYearsToFi, yearsToFi);
  if (meta.freedomGoal === true) doc.fiSnapshot.freedomGoalSessions += 1;
  if (meta.independenceBand === true) doc.fiSnapshot.independenceBandSessions += 1;
  if (meta.highProgress === true) doc.fiSnapshot.highProgressSessions += 1;
  if (meta.negativeNetWorth === true) doc.fiSnapshot.negativeNetWorthSessions += 1;
  if (meta.highInvesting === true) doc.fiSnapshot.highInvestingSessions += 1;
}

function applyCryptoYieldJourneyMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.cryptoYield || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") {
    inc(doc.cryptoYield.goals, goal);
    if (goal === "compare") doc.cryptoYield.compareGoalSessions += 1;
  }
  const principal = Number(meta.principal);
  if (Number.isFinite(principal)) {
    inc(doc.cryptoYield.principalBuckets, loanPrincipalBucket(principal));
  }
  const apyPercent = Number(meta.apyPercent);
  if (Number.isFinite(apyPercent)) {
    inc(doc.cryptoYield.apyBuckets, cryptoApyBucket(apyPercent));
    incAvg(doc.cryptoYield.avgApyPercent, apyPercent);
    if (apyPercent >= 8) doc.cryptoYield.highApySessions += 1;
  }
  const months = Number(meta.months);
  if (Number.isFinite(months)) {
    inc(doc.cryptoYield.horizonBuckets, cryptoHorizonBucket(months));
    if (months >= 24) doc.cryptoYield.longHorizonSessions += 1;
  }
  const compounding = meta.compounding;
  if (typeof compounding === "string") {
    inc(doc.cryptoYield.compoundingBuckets, compounding);
    if (compounding === "daily") doc.cryptoYield.dailyCompoundSessions += 1;
  }
  const futureValue = Number(meta.futureValue);
  if (Number.isFinite(futureValue)) incAvg(doc.cryptoYield.avgFutureValue, futureValue);
  const interestEarned = Number(meta.interestEarned);
  if (Number.isFinite(interestEarned)) incAvg(doc.cryptoYield.avgInterestEarned, interestEarned);
  const effectiveApyPercent = Number(meta.effectiveApyPercent);
  if (Number.isFinite(effectiveApyPercent)) incAvg(doc.cryptoYield.avgEffectiveApy, effectiveApyPercent);
}

function applyCryptoYieldTelemetryMeta(doc: ToolAnalyticsDoc, meta?: Record<string, unknown>) {
  if (!doc.cryptoYield || !meta) return;
  const goal = meta.goal;
  if (typeof goal === "string") inc(doc.cryptoYield.goals, goal);
  const score = Number(meta.score);
  if (Number.isFinite(score)) incAvg(doc.cryptoYield.avgScore, score);
  const principal = Number(meta.principal);
  if (Number.isFinite(principal)) inc(doc.cryptoYield.principalBuckets, loanPrincipalBucket(principal));
  const apyPercent = Number(meta.apyPercent);
  if (Number.isFinite(apyPercent)) {
    inc(doc.cryptoYield.apyBuckets, cryptoApyBucket(apyPercent));
    incAvg(doc.cryptoYield.avgApyPercent, apyPercent);
  }
  const months = Number(meta.months);
  if (Number.isFinite(months)) inc(doc.cryptoYield.horizonBuckets, cryptoHorizonBucket(months));
  const compounding = meta.compounding;
  if (typeof compounding === "string") inc(doc.cryptoYield.compoundingBuckets, compounding);
  const futureValue = Number(meta.futureValue);
  if (Number.isFinite(futureValue)) incAvg(doc.cryptoYield.avgFutureValue, futureValue);
  const interestEarned = Number(meta.interestEarned);
  if (Number.isFinite(interestEarned)) incAvg(doc.cryptoYield.avgInterestEarned, interestEarned);
  const effectiveApyPercent = Number(meta.effectiveApyPercent);
  if (Number.isFinite(effectiveApyPercent)) incAvg(doc.cryptoYield.avgEffectiveApy, effectiveApyPercent);
  if (meta.compareGoal === true) doc.cryptoYield.compareGoalSessions += 1;
  if (meta.highApy === true) doc.cryptoYield.highApySessions += 1;
  if (meta.dailyCompound === true) doc.cryptoYield.dailyCompoundSessions += 1;
  if (meta.longHorizon === true) doc.cryptoYield.longHorizonSessions += 1;
}

export type ToolFunnelRates = {
  journeyStartRate: number | null;
  journeyCompleteRate: number | null;
  skipRate: number | null;
  resultsToDashboardRate: number | null;
  dashboardFromJourneyRate: number | null;
};

export function toolFunnelRates(funnel: ToolFunnelMetrics): ToolFunnelRates {
  const pv = funnel.pageViews;
  return {
    journeyStartRate: pv > 0 ? funnel.journeyStarts / pv : null,
    journeyCompleteRate:
      funnel.journeyStarts > 0 ? funnel.journeyCompletes / funnel.journeyStarts : null,
    skipRate: funnel.journeyStarts > 0 ? funnel.journeySkips / funnel.journeyStarts : null,
    resultsToDashboardRate:
      funnel.resultsViews > 0 ? funnel.dashboardOpens / funnel.resultsViews : null,
    dashboardFromJourneyRate:
      funnel.journeyCompletes > 0 ? funnel.dashboardOpens / funnel.journeyCompletes : null,
  };
}

export function formatToolRate(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${Math.round(n * 1000) / 10}%`;
}
