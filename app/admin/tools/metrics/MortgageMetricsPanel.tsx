"use client";

import { Home, MousePointerClick } from "lucide-react";
import type { ToolMetricsRow } from "../../../lib/tool-insights";
import { avgValue, formatToolRate } from "../../../lib/tool-insights";
import {
  DOWN_PAYMENT_BUCKET_LABEL,
  DTI_BUCKET_LABEL,
  HOME_PRICE_BUCKET_LABEL,
  LTV_BUCKET_LABEL,
  MORTGAGE_GOAL_METRIC_LABEL,
  MORTGAGE_RATE_BUCKET_LABEL,
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

export function MortgageFunnelCallout({ row }: { row: ToolMetricsRow }) {
  const m = row.analytics.mortgage;
  const f = row.analytics.funnel;
  const a = row.analytics.actions;
  const r = row.rates;
  const telemetry = a.sessionTelemetryReports;

  const highDtiRate = telemetry > 0 && m ? m.highDtiSessions / telemetry : null;
  const pmiRate = telemetry > 0 && m ? m.pmiRequiredSessions / telemetry : null;

  return (
    <div className={`mb-8 rounded-2xl ${admin.calloutSky} border px-5 py-4 text-sm`}>
      <p className="font-semibold mb-2 flex items-center gap-2">
        <Home className="h-4 w-4" />
        Mortgage calculator funnel
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
              High DTI sessions: <strong>{formatToolRate(highDtiRate)}</strong> of workspace reports
            </li>
            <li>
              PMI required: <strong>{formatToolRate(pmiRate)}</strong> of workspace reports
            </li>
            <li>
              Refi goal journeys: <strong>{m?.refiGoalSessions ?? 0}</strong>
            </li>
          </>
        ) : null}
        {f.dashboardOpens > 0 ? (
          <>
            <li>
              CSV exports: <strong>{a.exportText}</strong>
            </li>
            <li>
              JSON copies: <strong>{a.exportJson}</strong>
            </li>
          </>
        ) : null}
      </ul>
    </div>
  );
}

export function MortgageEngagementPanel({ row }: { row: ToolMetricsRow }) {
  const a = row.analytics.actions;

  return (
    <AdminPanel
      title="Mortgage workspace actions"
      description="Walkthrough, exports, email summary usage, and workspace telemetry"
      className="mb-8"
    >
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "CSV exports", value: a.exportText },
          { label: "JSON copies", value: a.exportJson },
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

export default function MortgageMetricsPanel({ row }: { row: ToolMetricsRow }) {
  const m = row.analytics.mortgage;
  if (!m) return null;

  const avgPiti = avgValue(m.avgPiti);
  const avgDti = avgValue(m.avgHousingDtiPct);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Buyer goals" description="From completed quick tests and workspace telemetry">
        <DistributionList title="Goals chosen" data={m.goals} labels={MORTGAGE_GOAL_METRIC_LABEL} />
      </AdminPanel>

      <AdminPanel title="Home price & down payment" description="Anonymous price and down-payment bands">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Home price bands" data={m.homePriceBuckets} labels={HOME_PRICE_BUCKET_LABEL} />
          <DistributionList title="Down payment bands" data={m.downPaymentBuckets} labels={DOWN_PAYMENT_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel title="Rate, LTV & DTI bands" description="Anonymous loan structure and affordability signals">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Rate bands" data={m.rateBuckets} labels={MORTGAGE_RATE_BUCKET_LABEL} />
          <DistributionList title="LTV bands" data={m.ltvBuckets} labels={LTV_BUCKET_LABEL} />
          <DistributionList title="Housing DTI bands" data={m.dtiBuckets} labels={DTI_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Mortgage quality signals"
        description="Aggregated from autosaved workspace sessions (no income or address stored)"
        className="lg:col-span-2"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Avg readiness score",
              value: avgValue(m.avgScore) != null ? String(Math.round(avgValue(m.avgScore)!)) : "—",
            },
            {
              label: "Avg PITI",
              value: avgPiti != null ? `$${Math.round(avgPiti).toLocaleString()}/mo` : "—",
            },
            {
              label: "Avg housing DTI",
              value: avgDti != null ? `${Math.round(avgDti)}%` : "—",
            },
            { label: "High DTI sessions", value: String(m.highDtiSessions) },
            { label: "PMI required sessions", value: String(m.pmiRequiredSessions) },
            { label: "Refi goal journeys", value: String(m.refiGoalSessions) },
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
            Goal selections, home price/down/rate/LTV/DTI bands, readiness score, PMI and high-DTI flags — never addresses,
            emails, or exact income unless bucketed.
          </p>
        </div>
      </AdminPanel>
    </div>
  );
}
