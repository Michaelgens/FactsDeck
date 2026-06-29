"use client";

import { LineChart, MousePointerClick } from "lucide-react";
import type { ToolMetricsRow } from "../../../lib/tool-insights";
import { avgValue, formatToolRate } from "../../../lib/tool-insights";
import {
  INVEST_GOAL_METRIC_LABEL,
  INVEST_HORIZON_BUCKET_LABEL,
  INVEST_MONTHLY_BUCKET_LABEL,
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

export function InvestmentFunnelCallout({ row }: { row: ToolMetricsRow }) {
  const inv = row.analytics.investment;
  const f = row.analytics.funnel;
  const a = row.analytics.actions;
  const r = row.rates;
  const telemetry = a.sessionTelemetryReports;

  const highContribRate = telemetry > 0 && inv ? inv.highContributionSessions / telemetry : null;
  const longHorizonRate = telemetry > 0 && inv ? inv.longHorizonSessions / telemetry : null;

  return (
    <div className={`mb-8 rounded-2xl ${admin.calloutSky} border px-5 py-4 text-sm`}>
      <p className="font-semibold mb-2 flex items-center gap-2">
        <LineChart className="h-4 w-4" />
        Investment Calculator funnel
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
              High contributions: <strong>{formatToolRate(highContribRate)}</strong> of workspace reports
            </li>
            <li>
              Long horizon (25+ yr): <strong>{formatToolRate(longHorizonRate)}</strong> of workspace reports
            </li>
            <li>
              FIRE goal journeys: <strong>{inv?.fireGoalSessions ?? 0}</strong>
            </li>
          </>
        ) : null}
      </ul>
    </div>
  );
}

export function InvestmentEngagementPanel({ row }: { row: ToolMetricsRow }) {
  const a = row.analytics.actions;

  return (
    <AdminPanel
      title="Investment workspace actions"
      description="Walkthrough, exports, and workspace telemetry"
      className="mb-8"
    >
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Exports (CSV & text)", value: a.exportText },
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

export default function InvestmentMetricsPanel({ row }: { row: ToolMetricsRow }) {
  const inv = row.analytics.investment;
  if (!inv) return null;

  const avgFinal = avgValue(inv.avgFinalNominal);
  const avgMonthly = avgValue(inv.avgMonthlyContribution);
  const avgFireYears = avgValue(inv.avgYearsToFire);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Investment goals" description="From completed quick tests and workspace telemetry">
        <DistributionList title="Goals chosen" data={inv.goals} labels={INVEST_GOAL_METRIC_LABEL} />
      </AdminPanel>

      <AdminPanel title="Starting balance & contributions" description="Anonymous portfolio input bands">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Initial balance bands" data={inv.initialBuckets} labels={PRINCIPAL_BUCKET_LABEL} />
          <DistributionList title="Monthly contribution bands" data={inv.monthlyBuckets} labels={INVEST_MONTHLY_BUCKET_LABEL} />
        </div>
        <div className="mt-6">
          <DistributionList title="Horizon bands" data={inv.horizonBuckets} labels={INVEST_HORIZON_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Investment quality signals"
        description="Aggregated from autosaved workspace sessions (no PII stored)"
        className="lg:col-span-2"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Avg readiness score",
              value: avgValue(inv.avgScore) != null ? String(Math.round(avgValue(inv.avgScore)!)) : "—",
            },
            {
              label: "Avg ending balance",
              value: avgFinal != null ? `$${Math.round(avgFinal).toLocaleString()}` : "—",
            },
            {
              label: "Avg monthly contrib.",
              value: avgMonthly != null ? `$${Math.round(avgMonthly).toLocaleString()}/mo` : "—",
            },
            {
              label: "Avg years to FIRE",
              value: avgFireYears != null ? String(Math.round(avgFireYears)) : "—",
            },
            { label: "FIRE goal journeys", value: String(inv.fireGoalSessions) },
            { label: "High contribution", value: String(inv.highContributionSessions) },
            { label: "Long horizon", value: String(inv.longHorizonSessions) },
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
            Goal selections, balance/contribution/horizon bands, readiness score, ending balance estimates, FIRE timing
            signals, and contribution intensity — never account numbers, holdings, or tax IDs.
          </p>
        </div>
      </AdminPanel>
    </div>
  );
}
