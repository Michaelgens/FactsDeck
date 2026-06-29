"use client";

import { Gem, MousePointerClick } from "lucide-react";
import type { ToolMetricsRow } from "../../../lib/tool-insights";
import { avgValue, formatToolRate } from "../../../lib/tool-insights";
import {
  ESSENTIALS_BUCKET_LABEL,
  FI_SNAPSHOT_BALANCE_BUCKET_LABEL,
  FI_SNAPSHOT_BAND_METRIC_LABEL,
  FI_SNAPSHOT_GOAL_METRIC_LABEL,
  INVEST_MONTHLY_BUCKET_LABEL,
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

export function FiSnapshotFunnelCallout({ row }: { row: ToolMetricsRow }) {
  const fi = row.analytics.fiSnapshot;
  const f = row.analytics.funnel;
  const a = row.analytics.actions;
  const r = row.rates;
  const telemetry = a.sessionTelemetryReports;

  const independenceRate = telemetry > 0 && fi ? fi.independenceBandSessions / telemetry : null;
  const highProgressRate = telemetry > 0 && fi ? fi.highProgressSessions / telemetry : null;

  return (
    <div className={`mb-8 rounded-2xl ${admin.calloutSky} border px-5 py-4 text-sm`}>
      <p className="font-semibold mb-2 flex items-center gap-2">
        <Gem className="h-4 w-4" />
        Net Worth &amp; FI Snapshot funnel
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
              Independence band: <strong>{formatToolRate(independenceRate)}</strong> of workspace reports
            </li>
            <li>
              High FI progress (75%+): <strong>{formatToolRate(highProgressRate)}</strong> of workspace reports
            </li>
            <li>
              Freedom goal journeys: <strong>{fi?.freedomGoalSessions ?? 0}</strong>
            </li>
          </>
        ) : null}
      </ul>
    </div>
  );
}

export function FiSnapshotEngagementPanel({ row }: { row: ToolMetricsRow }) {
  const a = row.analytics.actions;

  return (
    <AdminPanel
      title="FI snapshot workspace actions"
      description="Walkthrough, exports, and workspace telemetry"
      className="mb-8"
    >
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "JSON exports", value: a.exportJson },
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

export default function FiSnapshotMetricsPanel({ row }: { row: ToolMetricsRow }) {
  const fi = row.analytics.fiSnapshot;
  if (!fi) return null;

  const avgNetWorth = avgValue(fi.avgNetWorth);
  const avgFiNumber = avgValue(fi.avgFiNumber);
  const avgProgress = avgValue(fi.avgFiProgressPct);
  const avgInvesting = avgValue(fi.avgMonthlyInvesting);
  const avgYearsToFi = avgValue(fi.avgYearsToFi);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Snapshot goals" description="From completed quick tests and workspace telemetry">
        <DistributionList title="Mindsets chosen" data={fi.goals} labels={FI_SNAPSHOT_GOAL_METRIC_LABEL} />
      </AdminPanel>

      <AdminPanel title="Freedom bands" description="Illustrative orbit bands from FI progress">
        <DistributionList title="Bands reached" data={fi.freedomBandBuckets} labels={FI_SNAPSHOT_BAND_METRIC_LABEL} />
      </AdminPanel>

      <AdminPanel title="Balance sheet bands" description="Anonymous net worth and asset levels" className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DistributionList title="Net worth bands" data={fi.netWorthBuckets} labels={FI_SNAPSHOT_BALANCE_BUCKET_LABEL} />
          <DistributionList title="Total asset bands" data={fi.assetBuckets} labels={FI_SNAPSHOT_BALANCE_BUCKET_LABEL} />
          <DistributionList title="Liability bands" data={fi.liabilityBuckets} labels={FI_SNAPSHOT_BALANCE_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel title="Cash flows" description="Monthly spend and investing bands">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Monthly expense bands" data={fi.expenseBuckets} labels={ESSENTIALS_BUCKET_LABEL} />
          <DistributionList title="Monthly investing bands" data={fi.investingBuckets} labels={INVEST_MONTHLY_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel
        title="FI snapshot quality signals"
        description="Aggregated from autosaved workspace sessions (no PII stored)"
        className="lg:col-span-2"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Avg readiness score",
              value: avgValue(fi.avgScore) != null ? String(Math.round(avgValue(fi.avgScore)!)) : "—",
            },
            {
              label: "Avg net worth",
              value: avgNetWorth != null ? `$${Math.round(avgNetWorth).toLocaleString()}` : "—",
            },
            {
              label: "Avg FI number",
              value: avgFiNumber != null ? `$${Math.round(avgFiNumber).toLocaleString()}` : "—",
            },
            {
              label: "Avg FI progress",
              value: avgProgress != null ? `${Math.round(avgProgress)}%` : "—",
            },
            {
              label: "Avg monthly investing",
              value: avgInvesting != null ? `$${Math.round(avgInvesting).toLocaleString()}/mo` : "—",
            },
            {
              label: "Avg years to FI",
              value: avgYearsToFi != null ? String(Math.round(avgYearsToFi * 10) / 10) : "—",
            },
            { label: "Independence band", value: String(fi.independenceBandSessions) },
            { label: "High progress (75%+)", value: String(fi.highProgressSessions) },
            { label: "Negative net worth", value: String(fi.negativeNetWorthSessions) },
            { label: "Freedom goal", value: String(fi.freedomGoalSessions) },
            { label: "High investing", value: String(fi.highInvestingSessions) },
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
            Goal mindsets, balance sheet and cash-flow bands, FI progress, freedom orbit bands, and investing intensity —
            never account numbers, institution names, or holdings detail.
          </p>
        </div>
      </AdminPanel>
    </div>
  );
}
