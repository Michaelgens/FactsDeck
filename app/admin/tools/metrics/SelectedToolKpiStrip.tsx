"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  DollarSign,
  ExternalLink,
  Home,
  Layers,
  MousePointerClick,
  Scissors,
  Target,
  TrendingDown,
} from "lucide-react";
import {
  cryptoYieldAdminSummary,
  creditScoreAdminSummary,
  debtPayoffAdminSummary,
  fiSnapshotAdminSummary,
  investmentAdminSummary,
  loanAdminSummary,
  mortgageAdminSummary,
  retirementAdminSummary,
  studentLoanAdminSummary,
  subscriptionAuditAdminSummary,
  type ToolMetricsRow,
} from "../../../lib/tool-insights";
import { KpiCard } from "../../components/admin-ui";
import { admin } from "../../components/admin-theme";

type KpiCardDef = {
  name: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  gradient: string;
};

type SnapshotConfig = {
  title: string;
  description: string;
  href: string;
  cards: KpiCardDef[];
};

function roundScore(value: number | null | undefined): string {
  return value != null ? String(Math.round(value)) : "—";
}

function roundMoney(value: number | null | undefined): string {
  return value != null ? `$${Math.round(value).toLocaleString()}` : "—";
}

function roundPercent(value: number | null | undefined): string {
  return value != null ? `${Math.round(value)}%` : "—";
}

function roundDecimal(value: number | null | undefined, places = 1): string {
  return value != null ? String(Math.round(value * 10 ** places) / 10 ** places) : "—";
}

function snapshotForSlug(slug: string, row: ToolMetricsRow | undefined): SnapshotConfig | null {
  if (!row) return null;

  switch (slug) {
    case "subscription-spend-audit": {
      const s = subscriptionAuditAdminSummary(row);
      if (!s) return null;
      return {
        title: "Subscription Audit snapshot",
        description: "Recurring spend audit behavior at a glance",
        href: "/tools/subscription-spend-audit",
        cards: [
          { name: "Avg awareness", value: roundScore(s.avgAwarenessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg recurring", value: roundMoney(s.avgMonthlyRecurring), sub: "Per month (anonymous)", icon: TrendingDown, gradient: "from-rose-500 to-red-600" },
          { name: "Avg trim target", value: roundPercent(s.avgTrimPercent), sub: "Goal trim band", icon: Scissors, gradient: "from-amber-500 to-orange-600" },
          { name: "High burn", value: String(s.highBurnSessions), sub: "Workspace flags", icon: BarChart3, gradient: "from-sky-500 to-blue-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
          { name: "Trim actions", value: String(s.goalTrimApplied), sub: `${s.starterListsLoaded} starter lists`, icon: Scissors, gradient: "from-indigo-500 to-violet-600" },
        ],
      };
    }
    case "mortgage-calculator": {
      const s = mortgageAdminSummary(row);
      if (!s) return null;
      return {
        title: "Mortgage Calculator snapshot",
        description: "PITI, DTI, and readiness signals at a glance",
        href: "/tools/mortgage-calculator",
        cards: [
          { name: "Avg readiness", value: roundScore(s.avgReadinessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg PITI", value: roundMoney(s.avgPiti), sub: "Per month (anonymous)", icon: Home, gradient: "from-sky-500 to-blue-600" },
          { name: "Avg housing DTI", value: roundPercent(s.avgHousingDtiPct), sub: "Front-end ratio band", icon: TrendingDown, gradient: "from-amber-500 to-orange-600" },
          { name: "High DTI", value: String(s.highDtiSessions), sub: "Workspace flags", icon: BarChart3, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
          { name: "CSV exports", value: String(s.csvExports), sub: `${s.pmiRequiredSessions} PMI sessions`, icon: Home, gradient: "from-indigo-500 to-violet-600" },
        ],
      };
    }
    case "loan-calculator": {
      const s = loanAdminSummary(row);
      if (!s) return null;
      return {
        title: "Loan Calculator snapshot",
        description: "Payment, interest, and readiness signals at a glance",
        href: "/tools/loan-calculator",
        cards: [
          { name: "Avg readiness", value: roundScore(s.avgReadinessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg payment", value: roundMoney(s.avgMonthlyPayment), sub: "Per month (anonymous)", icon: DollarSign, gradient: "from-sky-500 to-blue-600" },
          { name: "Avg total interest", value: roundMoney(s.avgTotalInterest), sub: "Full term estimate", icon: TrendingDown, gradient: "from-amber-500 to-orange-600" },
          { name: "High APR", value: String(s.highAprSessions), sub: "Workspace flags", icon: BarChart3, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
        ],
      };
    }
    case "debt-payoff-planner": {
      const s = debtPayoffAdminSummary(row);
      if (!s) return null;
      return {
        title: "Debt Payoff Planner snapshot",
        description: "Snowball vs avalanche behavior at a glance",
        href: "/tools/debt-payoff-planner",
        cards: [
          { name: "Avg readiness", value: roundScore(s.avgReadinessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg total debt", value: roundMoney(s.avgTotalDebt), sub: "Anonymous bands", icon: Layers, gradient: "from-sky-500 to-blue-600" },
          { name: "Avg extra / mo", value: roundMoney(s.avgExtraMonthly), sub: "Beyond minimums", icon: TrendingDown, gradient: "from-amber-500 to-orange-600" },
          { name: "High APR debt", value: String(s.highAprDebtSessions), sub: "Workspace flags", icon: BarChart3, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
        ],
      };
    }
    case "student-loan-snapshot": {
      const s = studentLoanAdminSummary(row);
      if (!s) return null;
      return {
        title: "Student Loan Path Snapshot",
        description: "Standard vs IDR behavior at a glance",
        href: "/tools/student-loan-snapshot",
        cards: [
          { name: "Avg readiness", value: roundScore(s.avgReadinessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg standard", value: roundMoney(s.avgStandardMonthly), sub: "Per month (anonymous)", icon: DollarSign, gradient: "from-sky-500 to-blue-600" },
          { name: "Avg IDR payment", value: roundMoney(s.avgIdrMonthly), sub: "Illustrative IDR", icon: TrendingDown, gradient: "from-amber-500 to-orange-600" },
          { name: "IDR below interest", value: String(s.idrBelowInterestSessions), sub: "Workspace flags", icon: BarChart3, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
        ],
      };
    }
    case "credit-score-simulator": {
      const s = creditScoreAdminSummary(row);
      if (!s) return null;
      return {
        title: "Credit Score Simulator snapshot",
        description: "Utilization, score bands, and improve intent at a glance",
        href: "/tools/credit-score-simulator",
        cards: [
          { name: "Avg score", value: roundScore(s.avgSimulatedScore), sub: "Illustrative model", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg utilization", value: roundPercent(s.avgUtilization), sub: "Revolving balances", icon: Activity, gradient: "from-sky-500 to-blue-600" },
          { name: "High util", value: String(s.highUtilSessions), sub: "Workspace flags", icon: BarChart3, gradient: "from-amber-500 to-orange-600" },
          { name: "Low score band", value: String(s.lowScoreSessions), sub: "Below 670", icon: TrendingDown, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
        ],
      };
    }
    case "investment-calculator": {
      const s = investmentAdminSummary(row);
      if (!s) return null;
      return {
        title: "Investment Calculator snapshot",
        description: "Goals, contributions, and FIRE signals at a glance",
        href: "/tools/investment-calculator",
        cards: [
          { name: "Avg readiness", value: roundScore(s.avgReadinessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg ending balance", value: roundMoney(s.avgFinalNominal), sub: "Nominal projection", icon: DollarSign, gradient: "from-sky-500 to-blue-600" },
          { name: "Avg monthly contrib.", value: roundMoney(s.avgMonthlyContribution), sub: "Anonymous bands", icon: Activity, gradient: "from-amber-500 to-orange-600" },
          { name: "Avg years to FIRE", value: roundDecimal(s.avgYearsToFire, 0), sub: `${s.fireGoalSessions} FIRE goal`, icon: BarChart3, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
          { name: "CSV exports", value: String(s.csvExports), sub: `${s.highContributionSessions} high contrib.`, icon: Layers, gradient: "from-indigo-500 to-violet-600" },
        ],
      };
    }
    case "retirement-calculator": {
      const s = retirementAdminSummary(row);
      if (!s) return null;
      return {
        title: "Retirement Calculator snapshot",
        description: "FI targets, on/off-track signals, and timeline at a glance",
        href: "/tools/retirement-calculator",
        cards: [
          { name: "Avg readiness", value: roundScore(s.avgReadinessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg FI number", value: roundMoney(s.avgFiNumber), sub: "Simple withdrawal rule", icon: DollarSign, gradient: "from-sky-500 to-blue-600" },
          { name: "Avg balance at retire", value: roundMoney(s.avgBalanceAtRetire), sub: "Nominal projection", icon: Activity, gradient: "from-amber-500 to-orange-600" },
          { name: "Avg years to retire", value: roundDecimal(s.avgYearsToRetire, 0), sub: `${s.onTrackSessions} on track`, icon: BarChart3, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
        ],
      };
    }
    case "net-worth-fi-snapshot": {
      const s = fiSnapshotAdminSummary(row);
      if (!s) return null;
      return {
        title: "Net Worth & FI Snapshot",
        description: "Net worth, FI progress, and freedom bands at a glance",
        href: "/tools/net-worth-fi-snapshot",
        cards: [
          { name: "Avg readiness", value: roundScore(s.avgReadinessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg net worth", value: roundMoney(s.avgNetWorth), sub: "Anonymous bands", icon: DollarSign, gradient: "from-sky-500 to-blue-600" },
          { name: "Avg FI progress", value: roundPercent(s.avgFiProgressPct), sub: `${s.highProgressSessions} high progress`, icon: Activity, gradient: "from-amber-500 to-orange-600" },
          { name: "Avg years to FI", value: roundDecimal(s.avgYearsToFi), sub: `${s.independenceBandSessions} independence`, icon: BarChart3, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
        ],
      };
    }
    case "crypto-yield-lab": {
      const s = cryptoYieldAdminSummary(row);
      if (!s) return null;
      return {
        title: "Crypto Staking & Yield Lab",
        description: "APY, compounding, and ending balance signals at a glance",
        href: "/tools/crypto-yield-lab",
        cards: [
          { name: "Avg readiness", value: roundScore(s.avgReadinessScore), sub: "Workspace sessions", icon: Target, gradient: "from-violet-500 to-purple-600" },
          { name: "Avg ending balance", value: roundMoney(s.avgFutureValue), sub: "Illustrative model", icon: DollarSign, gradient: "from-sky-500 to-blue-600" },
          { name: "Avg nominal APY", value: s.avgApyPercent != null ? `${roundDecimal(s.avgApyPercent)}%` : "—", sub: `${s.highApySessions} high APY`, icon: Activity, gradient: "from-amber-500 to-orange-600" },
          { name: "Avg effective APY", value: s.avgEffectiveApy != null ? `${roundDecimal(s.avgEffectiveApy)}%` : "—", sub: `${s.compareGoalSessions} compare goal`, icon: BarChart3, gradient: "from-rose-500 to-red-600" },
          { name: "Quick tests done", value: String(s.journeyCompletes), sub: `${s.dashboardOpens} workspace opens`, icon: MousePointerClick, gradient: "from-emerald-500 to-teal-600" },
        ],
      };
    }
    default:
      return null;
  }
}

export default function SelectedToolKpiStrip({
  selectedSlug,
  row,
}: {
  selectedSlug: string;
  row: ToolMetricsRow | undefined;
}) {
  const snapshot = snapshotForSlug(selectedSlug, row);
  if (!snapshot) return null;

  return (
    <section
      key={selectedSlug}
      className="mb-6 animate-in fade-in duration-200"
      aria-label={`${snapshot.title} KPIs`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
            {snapshot.title}
          </p>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-0.5">{snapshot.description}</p>
        </div>
        <Link
          href={snapshot.href}
          target="_blank"
          className={`inline-flex items-center gap-2 text-sm font-semibold ${admin.link}`}
        >
          Open tool
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {snapshot.cards.map((card) => (
          <KpiCard key={card.name} {...card} />
        ))}
      </div>
    </section>
  );
}
