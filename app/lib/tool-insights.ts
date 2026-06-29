import { siteTools } from "./site-config";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import {
  INSTRUMENTED_TOOL_SLUGS,
  avgValue,
  emptyToolAnalytics,
  formatToolRate,
  parseToolAnalytics,
  toolFunnelRates,
  type ToolAnalyticsDoc,
  type ToolFunnelRates,
} from "./tool-analytics-types";

export type ToolMetricsRow = {
  slug: string;
  name: string;
  displayOrder: number;
  instrumented: boolean;
  analytics: ToolAnalyticsDoc;
  rates: ToolFunnelRates;
  lastEventAt: string | null;
  updatedAt: string | null;
  totalEvents: number;
};

export type ToolMetricsInsights = {
  loadError: string | null;
  configured: boolean;
  tools: ToolMetricsRow[];
  totals: {
    toolCount: number;
    instrumentedCount: number;
    totalPageViews: number;
    totalJourneyCompletes: number;
    totalDashboardOpens: number;
  };
};

function countEvents(doc: ToolAnalyticsDoc): number {
  const f = doc.funnel;
  const a = doc.actions;
  return (
    f.pageViews +
    f.journeyStarts +
    f.journeySkips +
    f.journeyCompletes +
    f.resultsViews +
    f.dashboardOpens +
    f.retakeClicks +
    a.exportJson +
    a.exportText +
    a.walkthroughOpens +
    a.walkthroughCompletes +
    a.starterPlansLoaded +
    a.targetFillClicks +
    a.autoAssignClicks +
    a.sessionTelemetryReports
  );
}

export async function getToolMetricsInsights(): Promise<ToolMetricsInsights> {
  const empty: ToolMetricsInsights = {
    loadError: null,
    configured: isSupabaseConfigured(),
    tools: siteTools.map((t) => ({
      slug: t.slug,
      name: t.name,
      displayOrder: t.displayOrder,
      instrumented: INSTRUMENTED_TOOL_SLUGS.has(t.slug),
      analytics: emptyToolAnalytics(t.slug),
      rates: toolFunnelRates(emptyToolAnalytics(t.slug).funnel),
      lastEventAt: null,
      updatedAt: null,
      totalEvents: 0,
    })),
    totals: {
      toolCount: siteTools.length,
      instrumentedCount: INSTRUMENTED_TOOL_SLUGS.size,
      totalPageViews: 0,
      totalJourneyCompletes: 0,
      totalDashboardOpens: 0,
    },
  };

  if (!isSupabaseConfigured()) {
    return { ...empty, loadError: "Supabase is not configured — tool metrics require the database." };
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("tool_analytics").select("tool_slug, analytics, updated_at");

    if (error) {
      if (error.message.includes("tool_analytics") || error.code === "42P01") {
        return {
          ...empty,
          loadError: "Run migration 20250609120000_tool_analytics.sql in Supabase to enable tool metrics.",
        };
      }
      return { ...empty, loadError: error.message };
    }

    const bySlug = new Map((data ?? []).map((r) => [r.tool_slug, r]));

    const tools: ToolMetricsRow[] = siteTools.map((t) => {
      const row = bySlug.get(t.slug);
      const analytics = parseToolAnalytics(row?.analytics, t.slug);
      return {
        slug: t.slug,
        name: t.name,
        displayOrder: t.displayOrder,
        instrumented: INSTRUMENTED_TOOL_SLUGS.has(t.slug),
        analytics,
        rates: toolFunnelRates(analytics.funnel),
        lastEventAt: analytics.lastEventAt,
        updatedAt: row?.updated_at ?? null,
        totalEvents: countEvents(analytics),
      };
    });

    tools.sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      loadError: null,
      configured: true,
      tools,
      totals: {
        toolCount: tools.length,
        instrumentedCount: tools.filter((t) => t.instrumented).length,
        totalPageViews: tools.reduce((s, t) => s + t.analytics.funnel.pageViews, 0),
        totalJourneyCompletes: tools.reduce((s, t) => s + t.analytics.funnel.journeyCompletes, 0),
        totalDashboardOpens: tools.reduce((s, t) => s + t.analytics.funnel.dashboardOpens, 0),
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load tool metrics";
    return { ...empty, loadError: msg };
  }
}

export function getToolMetricsRow(tools: ToolMetricsRow[], slug: string): ToolMetricsRow | undefined {
  return tools.find((t) => t.slug === slug);
}

export type SubscriptionAuditAdminSummary = {
  avgAwarenessScore: number | null;
  avgMonthlyRecurring: number | null;
  avgTrimPercent: number | null;
  highBurnSessions: number;
  trimGoalSessions: number;
  lineItemAuditSessions: number;
  starterListsLoaded: number;
  goalTrimApplied: number;
  journeyCompletes: number;
  dashboardOpens: number;
};

export function subscriptionAuditAdminSummary(row: ToolMetricsRow | undefined): SubscriptionAuditAdminSummary | null {
  if (!row || row.slug !== "subscription-spend-audit") return null;
  const s = row.analytics.subscriptionAudit;
  if (!s) return null;

  return {
    avgAwarenessScore: avgValue(s.avgScore),
    avgMonthlyRecurring: avgValue(s.avgMonthlyRecurring),
    avgTrimPercent: avgValue(s.avgTrimPercent),
    highBurnSessions: s.highBurnSessions,
    trimGoalSessions: s.trimGoalSessions,
    lineItemAuditSessions: s.lineItemAuditSessions,
    starterListsLoaded: row.analytics.actions.starterPlansLoaded,
    goalTrimApplied: row.analytics.actions.targetFillClicks,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
  };
}

export type MortgageAdminSummary = {
  avgReadinessScore: number | null;
  avgPiti: number | null;
  avgHousingDtiPct: number | null;
  highDtiSessions: number;
  pmiRequiredSessions: number;
  refiGoalSessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  csvExports: number;
};

export function mortgageAdminSummary(row: ToolMetricsRow | undefined): MortgageAdminSummary | null {
  if (!row || row.slug !== "mortgage-calculator") return null;
  const m = row.analytics.mortgage;
  if (!m) return null;

  return {
    avgReadinessScore: avgValue(m.avgScore),
    avgPiti: avgValue(m.avgPiti),
    avgHousingDtiPct: avgValue(m.avgHousingDtiPct),
    highDtiSessions: m.highDtiSessions,
    pmiRequiredSessions: m.pmiRequiredSessions,
    refiGoalSessions: m.refiGoalSessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    csvExports: row.analytics.actions.exportText,
  };
}

export type LoanAdminSummary = {
  avgReadinessScore: number | null;
  avgMonthlyPayment: number | null;
  avgTotalInterest: number | null;
  highAprSessions: number;
  extraPaySessions: number;
  compareBSessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  jsonExports: number;
};

export function loanAdminSummary(row: ToolMetricsRow | undefined): LoanAdminSummary | null {
  if (!row || row.slug !== "loan-calculator") return null;
  const l = row.analytics.loan;
  if (!l) return null;

  return {
    avgReadinessScore: avgValue(l.avgScore),
    avgMonthlyPayment: avgValue(l.avgMonthlyPayment),
    avgTotalInterest: avgValue(l.avgTotalInterest),
    highAprSessions: l.highAprSessions,
    extraPaySessions: l.extraPaySessions,
    compareBSessions: l.compareBSessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    jsonExports: row.analytics.actions.exportJson,
  };
}

export type DebtPayoffAdminSummary = {
  avgReadinessScore: number | null;
  avgTotalDebt: number | null;
  avgExtraMonthly: number | null;
  avgAvalancheMonths: number | null;
  highAprDebtSessions: number;
  extraPaySessions: number;
  multiDebtSessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  jsonExports: number;
};

export function debtPayoffAdminSummary(row: ToolMetricsRow | undefined): DebtPayoffAdminSummary | null {
  if (!row || row.slug !== "debt-payoff-planner") return null;
  const d = row.analytics.debtPayoff;
  if (!d) return null;

  return {
    avgReadinessScore: avgValue(d.avgScore),
    avgTotalDebt: avgValue(d.avgTotalDebt),
    avgExtraMonthly: avgValue(d.avgExtraMonthly),
    avgAvalancheMonths: avgValue(d.avgAvalancheMonths),
    highAprDebtSessions: d.highAprDebtSessions,
    extraPaySessions: d.extraPaySessions,
    multiDebtSessions: d.multiDebtSessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    jsonExports: row.analytics.actions.exportJson,
  };
}

export type StudentLoanAdminSummary = {
  avgReadinessScore: number | null;
  avgStandardMonthly: number | null;
  avgIdrMonthly: number | null;
  avgIdrEndingBalance: number | null;
  idrBelowInterestSessions: number;
  highBalanceSessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  jsonExports: number;
};

export function studentLoanAdminSummary(row: ToolMetricsRow | undefined): StudentLoanAdminSummary | null {
  if (!row || row.slug !== "student-loan-snapshot") return null;
  const sl = row.analytics.studentLoan;
  if (!sl) return null;

  return {
    avgReadinessScore: avgValue(sl.avgScore),
    avgStandardMonthly: avgValue(sl.avgStandardMonthly),
    avgIdrMonthly: avgValue(sl.avgIdrMonthly),
    avgIdrEndingBalance: avgValue(sl.avgIdrEndingBalance),
    idrBelowInterestSessions: sl.idrBelowInterestSessions,
    highBalanceSessions: sl.highBalanceSessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    jsonExports: row.analytics.actions.exportJson,
  };
}

export type CreditScoreAdminSummary = {
  avgSimulatedScore: number | null;
  avgUtilization: number | null;
  highUtilSessions: number;
  lowScoreSessions: number;
  improveGoalSessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  jsonExports: number;
};

export function creditScoreAdminSummary(row: ToolMetricsRow | undefined): CreditScoreAdminSummary | null {
  if (!row || row.slug !== "credit-score-simulator") return null;
  const c = row.analytics.creditScore;
  if (!c) return null;

  return {
    avgSimulatedScore: avgValue(c.avgSimulatedScore),
    avgUtilization: avgValue(c.avgUtilization),
    highUtilSessions: c.highUtilSessions,
    lowScoreSessions: c.lowScoreSessions,
    improveGoalSessions: c.improveGoalSessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    jsonExports: row.analytics.actions.exportJson,
  };
}

export type InvestmentAdminSummary = {
  avgReadinessScore: number | null;
  avgFinalNominal: number | null;
  avgMonthlyContribution: number | null;
  avgYearsToFire: number | null;
  fireGoalSessions: number;
  highContributionSessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  csvExports: number;
};

export function investmentAdminSummary(row: ToolMetricsRow | undefined): InvestmentAdminSummary | null {
  if (!row || row.slug !== "investment-calculator") return null;
  const inv = row.analytics.investment;
  if (!inv) return null;

  return {
    avgReadinessScore: avgValue(inv.avgScore),
    avgFinalNominal: avgValue(inv.avgFinalNominal),
    avgMonthlyContribution: avgValue(inv.avgMonthlyContribution),
    avgYearsToFire: avgValue(inv.avgYearsToFire),
    fireGoalSessions: inv.fireGoalSessions,
    highContributionSessions: inv.highContributionSessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    csvExports: row.analytics.actions.exportText,
  };
}

export type RetirementAdminSummary = {
  avgReadinessScore: number | null;
  avgFiNumber: number | null;
  avgBalanceAtRetire: number | null;
  avgYearsToRetire: number | null;
  onTrackSessions: number;
  offTrackSessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  jsonExports: number;
};

export function retirementAdminSummary(row: ToolMetricsRow | undefined): RetirementAdminSummary | null {
  if (!row || row.slug !== "retirement-calculator") return null;
  const ret = row.analytics.retirement;
  if (!ret) return null;

  return {
    avgReadinessScore: avgValue(ret.avgScore),
    avgFiNumber: avgValue(ret.avgFiNumber),
    avgBalanceAtRetire: avgValue(ret.avgBalanceAtRetire),
    avgYearsToRetire: avgValue(ret.avgYearsToRetire),
    onTrackSessions: ret.onTrackSessions,
    offTrackSessions: ret.offTrackSessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    jsonExports: row.analytics.actions.exportJson,
  };
}

export type FiSnapshotAdminSummary = {
  avgReadinessScore: number | null;
  avgNetWorth: number | null;
  avgFiProgressPct: number | null;
  avgYearsToFi: number | null;
  independenceBandSessions: number;
  highProgressSessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  jsonExports: number;
};

export function fiSnapshotAdminSummary(row: ToolMetricsRow | undefined): FiSnapshotAdminSummary | null {
  if (!row || row.slug !== "net-worth-fi-snapshot") return null;
  const fi = row.analytics.fiSnapshot;
  if (!fi) return null;

  return {
    avgReadinessScore: avgValue(fi.avgScore),
    avgNetWorth: avgValue(fi.avgNetWorth),
    avgFiProgressPct: avgValue(fi.avgFiProgressPct),
    avgYearsToFi: avgValue(fi.avgYearsToFi),
    independenceBandSessions: fi.independenceBandSessions,
    highProgressSessions: fi.highProgressSessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    jsonExports: row.analytics.actions.exportJson,
  };
}

export type CryptoYieldAdminSummary = {
  avgReadinessScore: number | null;
  avgFutureValue: number | null;
  avgApyPercent: number | null;
  avgEffectiveApy: number | null;
  compareGoalSessions: number;
  highApySessions: number;
  journeyCompletes: number;
  dashboardOpens: number;
  jsonExports: number;
};

export function cryptoYieldAdminSummary(row: ToolMetricsRow | undefined): CryptoYieldAdminSummary | null {
  if (!row || row.slug !== "crypto-yield-lab") return null;
  const cy = row.analytics.cryptoYield;
  if (!cy) return null;

  return {
    avgReadinessScore: avgValue(cy.avgScore),
    avgFutureValue: avgValue(cy.avgFutureValue),
    avgApyPercent: avgValue(cy.avgApyPercent),
    avgEffectiveApy: avgValue(cy.avgEffectiveApy),
    compareGoalSessions: cy.compareGoalSessions,
    highApySessions: cy.highApySessions,
    journeyCompletes: row.analytics.funnel.journeyCompletes,
    dashboardOpens: row.analytics.funnel.dashboardOpens,
    jsonExports: row.analytics.actions.exportJson,
  };
}

export { formatToolRate, avgValue };
