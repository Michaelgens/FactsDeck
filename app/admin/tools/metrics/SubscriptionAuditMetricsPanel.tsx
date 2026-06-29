"use client";

import { MousePointerClick, Scissors, TrendingDown } from "lucide-react";
import type { ToolMetricsRow } from "../../../lib/tool-insights";
import { avgValue, formatToolRate } from "../../../lib/tool-insights";
import {
  RECURRING_BUCKET_LABEL,
  SUB_COUNT_BUCKET_LABEL,
  SUB_GOAL_METRIC_LABEL,
  SUB_MODE_METRIC_LABEL,
  TRIM_BUCKET_LABEL,
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

export function SubscriptionAuditFunnelCallout({ row }: { row: ToolMetricsRow }) {
  const s = row.analytics.subscriptionAudit;
  const f = row.analytics.funnel;
  const a = row.analytics.actions;
  const r = row.rates;
  const telemetry = a.sessionTelemetryReports;

  const highBurnRate = telemetry > 0 && s ? s.highBurnSessions / telemetry : null;
  const trimGoalRate = telemetry > 0 && s ? s.trimGoalSessions / telemetry : null;
  const lineItemAuditRate = telemetry > 0 && s ? s.lineItemAuditSessions / telemetry : null;
  const starterRate = f.dashboardOpens > 0 ? a.starterPlansLoaded / f.dashboardOpens : null;
  const trimApplyRate = f.dashboardOpens > 0 ? a.targetFillClicks / f.dashboardOpens : null;

  return (
    <div className={`mb-8 rounded-2xl ${admin.calloutSky} border px-5 py-4 text-sm`}>
      <p className="font-semibold mb-2 flex items-center gap-2">
        <Scissors className="h-4 w-4" />
        Subscription audit funnel
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
              High burn sessions: <strong>{formatToolRate(highBurnRate)}</strong> of workspace reports
            </li>
            <li>
              Trim goal set (20%+): <strong>{formatToolRate(trimGoalRate)}</strong> of workspace reports
            </li>
            <li>
              Line-item audit mode: <strong>{formatToolRate(lineItemAuditRate)}</strong> of workspace reports
            </li>
          </>
        ) : null}
        {f.dashboardOpens > 0 ? (
          <>
            <li>
              Starter lists loaded: <strong>{formatToolRate(starterRate)}</strong> of workspace opens
            </li>
            <li>
              Goal trim applied: <strong>{formatToolRate(trimApplyRate)}</strong> of workspace opens
            </li>
          </>
        ) : null}
      </ul>
    </div>
  );
}

export function SubscriptionAuditEngagementPanel({ row }: { row: ToolMetricsRow }) {
  const a = row.analytics.actions;

  return (
    <AdminPanel
      title="Subscription workspace actions"
      description="Starter lists, trim targets, exports, and walkthrough — subscription-specific engagement"
      className="mb-8"
    >
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Starter lists loaded", value: a.starterPlansLoaded },
          { label: "Goal trim applied", value: a.targetFillClicks },
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

export default function SubscriptionAuditMetricsPanel({ row }: { row: ToolMetricsRow }) {
  const s = row.analytics.subscriptionAudit;
  if (!s) return null;

  const avgRecurring = avgValue(s.avgMonthlyRecurring);
  const avgTrim = avgValue(s.avgTrimPercent);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdminPanel title="Audit mission & style" description="From completed quick tests and workspace telemetry">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Goals chosen" data={s.goals} labels={SUB_GOAL_METRIC_LABEL} />
          <DistributionList title="Workspace modes" data={s.modes} labels={SUB_MODE_METRIC_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel title="Recurring & count bands" description="Anonymous monthly totals and subscription counts">
        <div className="grid sm:grid-cols-2 gap-6">
          <DistributionList title="Monthly recurring" data={s.recurringBuckets} labels={RECURRING_BUCKET_LABEL} />
          <DistributionList title="Sub count bands" data={s.countBuckets} labels={SUB_COUNT_BUCKET_LABEL} />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Trim target bands"
        description="Target trim % chosen in quick test or set in workspace (anonymous bands only)"
        className="lg:col-span-2"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DistributionList title="Trim % bands" data={s.trimBuckets} labels={TRIM_BUCKET_LABEL} />
          <div className="rounded-xl border border-slate-100 dark:border-zinc-800 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5" />
              Trim snapshot
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600 dark:text-zinc-400">Avg trim target</dt>
                <dd className="font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                  {avgTrim != null ? `${Math.round(avgTrim)}%` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600 dark:text-zinc-400">Avg monthly recurring</dt>
                <dd className="font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                  {avgRecurring != null ? `$${Math.round(avgRecurring).toLocaleString()}/mo` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600 dark:text-zinc-400">Sessions with trim goal 20%+</dt>
                <dd className="font-bold tabular-nums text-slate-900 dark:text-zinc-100">{s.trimGoalSessions}</dd>
              </div>
            </dl>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${admin.calloutViolet}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5" />
              What we track
            </p>
            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              Goal/mode selections, recurring spend bands, subscription counts, trim targets, awareness score, and
              high-burn flags — never subscription names or merchant details.
            </p>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Audit quality signals"
        description="Aggregated from autosaved workspace sessions (no line-item names stored)"
        className="lg:col-span-2"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Avg awareness score",
              value: avgValue(s.avgScore) != null ? String(Math.round(avgValue(s.avgScore)!)) : "—",
            },
            {
              label: "Avg recurring",
              value: avgRecurring != null ? `$${Math.round(avgRecurring).toLocaleString()}/mo` : "—",
            },
            {
              label: "Avg line items",
              value: avgValue(s.avgLineItems) != null ? avgValue(s.avgLineItems)!.toFixed(1) : "—",
            },
            {
              label: "Avg trim %",
              value: avgTrim != null ? `${Math.round(avgTrim)}%` : "—",
            },
            { label: "High burn sessions", value: String(s.highBurnSessions) },
            { label: "Trim goal set (20%+)", value: String(s.trimGoalSessions) },
            { label: "Line-item audit mode", value: String(s.lineItemAuditSessions) },
            { label: "Starter lists loaded", value: String(row.analytics.actions.starterPlansLoaded) },
            { label: "Goal trim applied", value: String(row.analytics.actions.targetFillClicks) },
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
