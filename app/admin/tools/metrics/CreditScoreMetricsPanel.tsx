"use client";

import { Activity, MousePointerClick } from "lucide-react";
import type { ToolMetricsRow } from "../../../lib/tool-insights";
import { avgValue, formatToolRate } from "../../../lib/tool-insights";
import {
  CREDIT_GOAL_METRIC_LABEL,
  CREDIT_SCORE_BAND_LABEL,
  CREDIT_UTIL_BUCKET_LABEL,
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

export function CreditScoreFunnelCallout({ row }: { row: ToolMetricsRow }) {
  const c = row.analytics.creditScore;
  const f = row.analytics.funnel;
  const a = row.analytics.actions;
  const r = row.rates;
  const telemetry = a.sessionTelemetryReports;

  const highUtilRate = telemetry > 0 && c ? c.highUtilSessions / telemetry : null;
  const lowScoreRate = telemetry > 0 && c ? c.lowScoreSessions / telemetry : null;

  return (
    <div className={`mb-8 rounded-2xl ${admin.calloutSky} border px-5 py-4 text-sm`}>
      <p className="font-semibold mb-2 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Credit Score Simulator funnel
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
              High utilization: <strong>{formatToolRate(highUtilRate)}</strong> of workspace reports
            </li>
            <li>
              Low score band: <strong>{formatToolRate(lowScoreRate)}</strong> of workspace reports
            </li>
            <li>
              Improve goal journeys: <strong>{c?.improveGoalSessions ?? 0}</strong>
            </li>
          </>
        ) : null}
      </ul>
    </div>
  );
}

export function CreditScoreEngagementPanel({ row }: { row: ToolMetricsRow }) {
  const a = row.analytics.actions;

  return (
    <AdminPanel
      title="Credit simulator workspace actions"
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

export default function CreditScoreMetricsPanel({ row }: { row: ToolMetricsRow }) {
  const c = row.analytics.creditScore;
  if (!c) return null;

  const avgScore = avgValue(c.avgSimulatedScore);
  const avgUtil = avgValue(c.avgUtilization);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Credit goals" description="From completed quick tests and workspace telemetry">
        <DistributionList title="Goals chosen" data={c.goals} labels={CREDIT_GOAL_METRIC_LABEL} />
      </AdminPanel>

      <AdminPanel title="Utilization & score bands" description="Anonymous profile bands from journey and workspace">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Utilization bands" data={c.utilizationBuckets} labels={CREDIT_UTIL_BUCKET_LABEL} />
          <DistributionList title="Score bands" data={c.scoreBandBuckets} labels={CREDIT_SCORE_BAND_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Credit profile signals"
        description="Aggregated from autosaved workspace sessions (no PII stored)"
        className="lg:col-span-2"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Avg simulated score",
              value: avgScore != null ? String(Math.round(avgScore)) : "—",
            },
            {
              label: "Avg utilization",
              value: avgUtil != null ? `${Math.round(avgUtil)}%` : "—",
            },
            { label: "High util sessions", value: String(c.highUtilSessions) },
            { label: "Low score sessions", value: String(c.lowScoreSessions) },
            { label: "Improve goal journeys", value: String(c.improveGoalSessions) },
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
            Goal selections, utilization and score bands, simulated score averages, high-utilization flags, and
            improve-score intent — never names, bureau reports, or account numbers.
          </p>
        </div>
      </AdminPanel>
    </div>
  );
}
