"use client";

import { DollarSign, MousePointerClick } from "lucide-react";
import type { ToolMetricsRow } from "../../../lib/tool-insights";
import { avgValue, formatToolRate } from "../../../lib/tool-insights";
import {
  LOAN_APR_BUCKET_LABEL,
  LOAN_GOAL_METRIC_LABEL,
  LOAN_TERM_BUCKET_LABEL,
  PRINCIPAL_BUCKET_LABEL,
} from "../../../lib/tool-analytics-types";
import { admin } from "../../components/admin-theme";
import { AdminPanel } from "../../components/admin-ui";

function DistributionList({
  title,
  data,
  labels,
}: {
  title: string;
  data: Record<string, number>;
  labels: Record<string, string>;
}) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
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

export function LoanFunnelCallout({ row }: { row: ToolMetricsRow }) {
  const l = row.analytics.loan;
  const f = row.analytics.funnel;
  const a = row.analytics.actions;
  const r = row.rates;
  const telemetry = a.sessionTelemetryReports;

  const highAprRate = telemetry > 0 && l ? l.highAprSessions / telemetry : null;
  const extraPayRate = telemetry > 0 && l ? l.extraPaySessions / telemetry : null;
  const compareBRate = telemetry > 0 && l ? l.compareBSessions / telemetry : null;

  return (
    <div className={`mb-8 rounded-2xl ${admin.calloutSky} border px-5 py-4 text-sm`}>
      <p className="font-semibold mb-2 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Loan calculator funnel
      </p>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-slate-700 dark:text-zinc-300">
        <li>
          Journey start rate: <strong>{formatToolRate(r.journeyStartRate)}</strong> of page views
        </li>
        <li>
          Quick test completion: <strong>{formatToolRate(r.journeyCompleteRate)}</strong> of starts
        </li>
        <li>
          Skip to workspace: <strong>{formatToolRate(r.skipRate)}</strong> of starts
        </li>
        <li>
          Results → workspace: <strong>{formatToolRate(r.resultsToDashboardRate)}</strong>
        </li>
        <li>
          Complete → workspace: <strong>{formatToolRate(r.dashboardFromJourneyRate)}</strong>
        </li>
        <li>
          Retake clicks: <strong>{f.retakeClicks}</strong>
        </li>
        {telemetry > 0 ? (
          <>
            <li>
              High APR sessions: <strong>{formatToolRate(highAprRate)}</strong> of workspace reports
            </li>
            <li>
              Extra pay sessions: <strong>{formatToolRate(extraPayRate)}</strong> of workspace reports
            </li>
            <li>
              Scenario B active: <strong>{formatToolRate(compareBRate)}</strong> of workspace reports
            </li>
            <li>
              Refi goal journeys: <strong>{l?.refiGoalSessions ?? 0}</strong>
            </li>
          </>
        ) : null}
      </ul>
    </div>
  );
}

export function LoanEngagementPanel({ row }: { row: ToolMetricsRow }) {
  const a = row.analytics.actions;

  return (
    <AdminPanel
      title="Loan workspace actions"
      description="Walkthrough, exports, and workspace telemetry"
      className="mb-8"
    >
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "JSON copies", value: a.exportJson },
          { label: "Text exports", value: a.exportText },
          { label: "Walkthrough opens", value: a.walkthroughOpens },
          { label: "Walkthrough finishes", value: a.walkthroughCompletes },
          { label: "Workspace telemetry", value: a.sessionTelemetryReports },
          { label: "Retake clicks", value: row.analytics.funnel.retakeClicks },
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
  );
}

export default function LoanMetricsPanel({ row }: { row: ToolMetricsRow }) {
  const l = row.analytics.loan;
  if (!l) return null;

  const avgPayment = avgValue(l.avgMonthlyPayment);
  const avgInterest = avgValue(l.avgTotalInterest);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Loan goals" description="From completed quick tests and workspace telemetry">
        <DistributionList title="Goals chosen" data={l.goals} labels={LOAN_GOAL_METRIC_LABEL} />
      </AdminPanel>

      <AdminPanel title="Principal & APR bands" description="Anonymous loan size and rate selections">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Principal bands" data={l.principalBuckets} labels={PRINCIPAL_BUCKET_LABEL} />
          <DistributionList title="APR bands" data={l.aprBuckets} labels={LOAN_APR_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel title="Term bands" description="Loan term selections from journey and workspace">
        <DistributionList title="Term bands" data={l.termBuckets} labels={LOAN_TERM_BUCKET_LABEL} />
      </AdminPanel>

      <AdminPanel
        title="Loan quality signals"
        description="Aggregated from autosaved workspace sessions (no PII stored)"
        className="lg:col-span-2"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Avg readiness score",
              value: avgValue(l.avgScore) != null ? String(Math.round(avgValue(l.avgScore)!)) : "—",
            },
            {
              label: "Avg payment",
              value: avgPayment != null ? `$${Math.round(avgPayment).toLocaleString()}/mo` : "—",
            },
            {
              label: "Avg total interest",
              value: avgInterest != null ? `$${Math.round(avgInterest).toLocaleString()}` : "—",
            },
            { label: "High APR sessions", value: String(l.highAprSessions) },
            { label: "Extra pay sessions", value: String(l.extraPaySessions) },
            { label: "Scenario B sessions", value: String(l.compareBSessions) },
            { label: "Refi goal journeys", value: String(l.refiGoalSessions) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-100 dark:border-zinc-800 px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                {item.label}
              </dt>
              <dd className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-zinc-100">{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className={`mt-4 rounded-xl border px-4 py-3 ${admin.calloutViolet}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5" />
            What we track
          </p>
          <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
            Goal selections, principal/APR/term bands, readiness score, high-APR flags, extra-payment usage, and scenario
            B comparisons — never names, emails, or exact account details.
          </p>
        </div>
      </AdminPanel>
    </div>
  );
}
