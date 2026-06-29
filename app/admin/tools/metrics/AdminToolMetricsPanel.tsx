"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Copy,
  MousePointerClick,
  PieChart,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ToolMetricsRow } from "../../../lib/tool-insights";
import { avgValue, formatToolRate } from "../../../lib/tool-insights";
import {
  BUFFER_BUCKET_LABEL,
  EF_GOAL_METRIC_LABEL,
  EF_PLAN_MODE_LABEL,
  ESSENTIALS_BUCKET_LABEL,
  GOAL_METRIC_LABEL,
  INCOME_BUCKET_LABEL,
  MODE_METRIC_LABEL,
  TARGET_MONTH_BUCKET_LABEL,
} from "../../../lib/tool-analytics-types";
import { admin } from "../../components/admin-theme";
import { AdminPanel } from "../../components/admin-ui";
import SubscriptionAuditMetricsPanel, {
  SubscriptionAuditEngagementPanel,
  SubscriptionAuditFunnelCallout,
} from "./SubscriptionAuditMetricsPanel";
import MortgageMetricsPanel, {
  MortgageEngagementPanel,
  MortgageFunnelCallout,
} from "./MortgageMetricsPanel";
import LoanMetricsPanel, {
  LoanEngagementPanel,
  LoanFunnelCallout,
} from "./LoanMetricsPanel";
import DebtPayoffMetricsPanel, {
  DebtPayoffEngagementPanel,
  DebtPayoffFunnelCallout,
} from "./DebtPayoffMetricsPanel";
import StudentLoanMetricsPanel, {
  StudentLoanEngagementPanel,
  StudentLoanFunnelCallout,
} from "./StudentLoanMetricsPanel";
import CreditScoreMetricsPanel, {
  CreditScoreEngagementPanel,
  CreditScoreFunnelCallout,
} from "./CreditScoreMetricsPanel";
import InvestmentMetricsPanel, {
  InvestmentEngagementPanel,
  InvestmentFunnelCallout,
} from "./InvestmentMetricsPanel";
import RetirementMetricsPanel, {
  RetirementEngagementPanel,
  RetirementFunnelCallout,
} from "./RetirementMetricsPanel";
import FiSnapshotMetricsPanel, {
  FiSnapshotEngagementPanel,
  FiSnapshotFunnelCallout,
} from "./FiSnapshotMetricsPanel";
import CryptoYieldMetricsPanel, {
  CryptoYieldEngagementPanel,
  CryptoYieldFunnelCallout,
} from "./CryptoYieldMetricsPanel";

function DistributionList({
  title,
  data,
  labels,
}: {
  title: string;
  data: Record<string, number>;
  labels: Record<string, string>;
}) {
  const entries = useMemo(
    () =>
      Object.entries(data)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]),
    [data]
  );
  const max = entries[0]?.[1] ?? 1;

  if (entries.length === 0) {
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500 mb-2">{title}</p>
        <p className="text-sm text-slate-500 dark:text-zinc-400">No data yet</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500 mb-3">{title}</p>
      <ul className="space-y-2">
        {entries.map(([key, count]) => (
          <li key={key}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-700 dark:text-zinc-300">{labels[key] ?? key}</span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-zinc-100">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 dark:bg-violet-400"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BudgetPlannerPanel({ row }: { row: ToolMetricsRow }) {
  const b = row.analytics.budget;
  if (!b) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Budget focus & style" description="From completed quick tests and workspace telemetry">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Goals chosen" data={b.goals} labels={GOAL_METRIC_LABEL} />
          <DistributionList title="Budget modes" data={b.modes} labels={MODE_METRIC_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel title="Income & buffer bands" description="Anonymous take-home income and buffer selections">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Income bands" data={b.incomeBuckets} labels={INCOME_BUCKET_LABEL} />
          <DistributionList title="Buffer bands" data={b.bufferBuckets} labels={BUFFER_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Workspace quality signals"
        description="Aggregated from autosaved workspace sessions (no line-item content stored)"
        className="lg:col-span-2"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Avg score",
              value: avgValue(b.avgScore) != null ? String(Math.round(avgValue(b.avgScore)!)) : "—",
            },
            {
              label: "Avg line items",
              value: avgValue(b.avgLineItems) != null ? avgValue(b.avgLineItems)!.toFixed(1) : "—",
            },
            {
              label: "Avg income",
              value:
                avgValue(b.avgIncome) != null
                  ? `$${Math.round(avgValue(b.avgIncome)!).toLocaleString()}`
                  : "—",
            },
            { label: "Over-budget sessions", value: String(b.overBudgetSessions) },
            { label: "Balanced zero-based", value: String(b.balancedZeroBasedSessions) },
            { label: "Starter plans loaded", value: String(row.analytics.actions.starterPlansLoaded) },
            { label: "Fill gaps to targets", value: String(row.analytics.actions.targetFillClicks) },
            { label: "Auto-assign savings", value: String(row.analytics.actions.autoAssignClicks) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-100 dark:border-zinc-800 px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                {item.label}
              </dt>
              <dd className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-zinc-100">{item.value}</dd>
            </div>
          ))}
        </dl>
      </AdminPanel>
    </div>
  );
}

function EmergencyFundPanel({ row }: { row: ToolMetricsRow }) {
  const ef = row.analytics.emergencyFund;
  if (!ef) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Fund focus & workspace style" description="From completed quick tests and workspace telemetry">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Goals chosen" data={ef.goals} labels={EF_GOAL_METRIC_LABEL} />
          <DistributionList title="Plan modes" data={ef.planModes} labels={EF_PLAN_MODE_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel title="Essentials & target bands" description="Anonymous essentials totals and target months">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Essentials bands" data={ef.essentialsBuckets} labels={ESSENTIALS_BUCKET_LABEL} />
          <DistributionList title="Target month bands" data={ef.targetMonthBuckets} labels={TARGET_MONTH_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Runway quality signals"
        description="Aggregated from autosaved workspace sessions (no line-item content stored)"
        className="lg:col-span-2"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Avg resilience score",
              value: avgValue(ef.avgScore) != null ? String(Math.round(avgValue(ef.avgScore)!)) : "—",
            },
            {
              label: "Avg runway (mo)",
              value: avgValue(ef.avgRunwayMonths) != null ? avgValue(ef.avgRunwayMonths)!.toFixed(1) : "—",
            },
            {
              label: "Avg % funded",
              value: avgValue(ef.avgPctFunded) != null ? `${Math.round(avgValue(ef.avgPctFunded)!)}%` : "—",
            },
            {
              label: "Avg line items",
              value: avgValue(ef.avgLineItems) != null ? avgValue(ef.avgLineItems)!.toFixed(1) : "—",
            },
            { label: "Fully funded sessions", value: String(ef.fullyFundedSessions) },
            { label: "Under 3 mo runway", value: String(ef.underThreeMonthRunwaySessions) },
            { label: "Starter lists loaded", value: String(row.analytics.actions.starterPlansLoaded) },
            { label: "Suggest contribution", value: String(row.analytics.actions.targetFillClicks) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-100 dark:border-zinc-800 px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                {item.label}
              </dt>
              <dd className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-zinc-100">{item.value}</dd>
            </div>
          ))}
        </dl>
      </AdminPanel>
    </div>
  );
}

function GenericToolPanel({ row }: { row: ToolMetricsRow }) {
  return (
    <AdminPanel title="Instrumentation" description="Event tracking for this tool">
      {row.instrumented ? (
        <p className="text-sm text-slate-600 dark:text-zinc-400">No events recorded yet for this tool.</p>
      ) : (
        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          This tool is listed in the catalog but does not yet send analytics events. Budget Planner, Emergency Fund &
          Runway, Subscription Audit, Mortgage Calculator, Loan Calculator, Debt Payoff Planner, Student Loan Path
          Snapshot, Credit Score Simulator, Investment Calculator, Retirement Calculator, Net Worth &amp; FI Snapshot, and Crypto Staking &amp; Yield Lab are fully instrumented — use them as
          templates when wiring other calculators.
        </p>
      )}
    </AdminPanel>
  );
}

export default function AdminToolMetricsPanel({
  tools,
  selectedSlug,
}: {
  tools: ToolMetricsRow[];
  selectedSlug: string;
}) {
  const row = tools.find((t) => t.slug === selectedSlug) ?? tools[0];

  if (!row) return null;

  const f = row.analytics.funnel;
  const a = row.analytics.actions;
  const r = row.rates;
  const isSubscriptionAudit = row.slug === "subscription-spend-audit" && row.analytics.subscriptionAudit;
  const isMortgage = row.slug === "mortgage-calculator" && row.analytics.mortgage;
  const isLoan = row.slug === "loan-calculator" && row.analytics.loan;
  const isDebtPayoff = row.slug === "debt-payoff-planner" && row.analytics.debtPayoff;
  const isStudentLoan = row.slug === "student-loan-snapshot" && row.analytics.studentLoan;
  const isCreditScore = row.slug === "credit-score-simulator" && row.analytics.creditScore;
  const isInvestment = row.slug === "investment-calculator" && row.analytics.investment;
  const isRetirement = row.slug === "retirement-calculator" && row.analytics.retirement;
  const isFiSnapshot = row.slug === "net-worth-fi-snapshot" && row.analytics.fiSnapshot;
  const isCryptoYield = row.slug === "crypto-yield-lab" && row.analytics.cryptoYield;

  return (
    <div key={row.slug} className="animate-in fade-in duration-200">
      <header className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 truncate">{row.name}</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            {row.instrumented ? "Fully instrumented" : "Catalog only — not yet instrumented"}
            {row.totalEvents > 0 ? ` · ${row.totalEvents.toLocaleString()} events` : ""}
          </p>
        </div>
        <Link
          href={`/tools/${row.slug}`}
          target="_blank"
          className={`inline-flex items-center gap-2 text-sm font-semibold ${admin.link}`}
        >
          Open {row.name}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        {row.lastEventAt ? (
          <span className="text-xs text-slate-500 dark:text-zinc-500">
            Last event {new Date(row.lastEventAt).toLocaleString()}
          </span>
        ) : null}
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Page views", value: f.pageViews, icon: Users },
          { label: "Journey starts", value: f.journeyStarts, icon: MousePointerClick },
          { label: "Journey completes", value: f.journeyCompletes, icon: Target },
          { label: "Skips to workspace", value: f.journeySkips, icon: TrendingUp },
          { label: "Results views", value: f.resultsViews, icon: PieChart },
          { label: "Dashboard opens", value: f.dashboardOpens, icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className={`rounded-2xl ${admin.card} p-4`}>
            <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400 mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500">{label}</p>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">{value}</p>
          </div>
        ))}
      </div>

      {isSubscriptionAudit ? (
        <SubscriptionAuditFunnelCallout row={row} />
      ) : isMortgage ? (
        <MortgageFunnelCallout row={row} />
      ) : isLoan ? (
        <LoanFunnelCallout row={row} />
      ) : isDebtPayoff ? (
        <DebtPayoffFunnelCallout row={row} />
      ) : isStudentLoan ? (
        <StudentLoanFunnelCallout row={row} />
      ) : isCreditScore ? (
        <CreditScoreFunnelCallout row={row} />
      ) : isInvestment ? (
        <InvestmentFunnelCallout row={row} />
      ) : isRetirement ? (
        <RetirementFunnelCallout row={row} />
      ) : isFiSnapshot ? (
        <FiSnapshotFunnelCallout row={row} />
      ) : isCryptoYield ? (
        <CryptoYieldFunnelCallout row={row} />
      ) : (
        <div className={`mb-8 rounded-2xl ${admin.calloutSky} border px-5 py-4 text-sm`}>
          <p className="font-semibold mb-2 flex items-center gap-2">
            <MousePointerClick className="h-4 w-4" />
            Funnel rates
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-slate-700 dark:text-zinc-300">
            <li>Journey start rate: <strong>{formatToolRate(r.journeyStartRate)}</strong> of page views</li>
            <li>Journey completion rate: <strong>{formatToolRate(r.journeyCompleteRate)}</strong> of starts</li>
            <li>Skip rate: <strong>{formatToolRate(r.skipRate)}</strong> of starts</li>
            <li>Results → dashboard: <strong>{formatToolRate(r.resultsToDashboardRate)}</strong></li>
            <li>Complete → dashboard: <strong>{formatToolRate(r.dashboardFromJourneyRate)}</strong></li>
            <li>Retake clicks: <strong>{f.retakeClicks}</strong></li>
          </ul>
        </div>
      )}

      {isSubscriptionAudit ? (
        <SubscriptionAuditEngagementPanel row={row} />
      ) : isMortgage ? (
        <MortgageEngagementPanel row={row} />
      ) : isLoan ? (
        <LoanEngagementPanel row={row} />
      ) : isDebtPayoff ? (
        <DebtPayoffEngagementPanel row={row} />
      ) : isStudentLoan ? (
        <StudentLoanEngagementPanel row={row} />
      ) : isCreditScore ? (
        <CreditScoreEngagementPanel row={row} />
      ) : isInvestment ? (
        <InvestmentEngagementPanel row={row} />
      ) : isRetirement ? (
        <RetirementEngagementPanel row={row} />
      ) : isFiSnapshot ? (
        <FiSnapshotEngagementPanel row={row} />
      ) : isCryptoYield ? (
        <CryptoYieldEngagementPanel row={row} />
      ) : (
        <AdminPanel title="Engagement actions" description="Exports, walkthrough, and workspace actions" className="mb-8">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "JSON exports", value: a.exportJson, icon: Copy },
              { label: "Text exports", value: a.exportText, icon: Copy },
              { label: "Walkthrough opens", value: a.walkthroughOpens, icon: BookOpen },
              { label: "Walkthrough finishes", value: a.walkthroughCompletes, icon: BookOpen },
              { label: "Telemetry reports", value: a.sessionTelemetryReports, icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-slate-100 dark:border-zinc-800 px-3 py-2.5">
                <Icon className="h-4 w-4 text-slate-400 mb-1" />
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="text-lg font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </AdminPanel>
      )}

      {row.slug === "budget-planner" && row.analytics.budget ? (
        <BudgetPlannerPanel row={row} />
      ) : row.slug === "emergency-fund-calculator" && row.analytics.emergencyFund ? (
        <EmergencyFundPanel row={row} />
      ) : isSubscriptionAudit ? (
        <SubscriptionAuditMetricsPanel row={row} />
      ) : isMortgage ? (
        <MortgageMetricsPanel row={row} />
      ) : isLoan ? (
        <LoanMetricsPanel row={row} />
      ) : isDebtPayoff ? (
        <DebtPayoffMetricsPanel row={row} />
      ) : isStudentLoan ? (
        <StudentLoanMetricsPanel row={row} />
      ) : isCreditScore ? (
        <CreditScoreMetricsPanel row={row} />
      ) : isInvestment ? (
        <InvestmentMetricsPanel row={row} />
      ) : isRetirement ? (
        <RetirementMetricsPanel row={row} />
      ) : isFiSnapshot ? (
        <FiSnapshotMetricsPanel row={row} />
      ) : isCryptoYield ? (
        <CryptoYieldMetricsPanel row={row} />
      ) : (
        <GenericToolPanel row={row} />
      )}
    </div>
  );
}
