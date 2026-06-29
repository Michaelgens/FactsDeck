"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BarChart3, Eye, MousePointerClick, Target } from "lucide-react";
import type { ToolMetricsInsights } from "../../../lib/tool-insights";
import { AdminAlert, AdminPageHeader, KpiCard } from "../../components/admin-ui";
import { admin } from "../../components/admin-theme";
import { AdminRefreshButton, AdminRefreshShell, adminSyncLabel } from "../../components/admin-refresh-ui";
import ToolsSubnav from "../ToolsSubnav";
import PerformanceMetricsExperience from "./PerformanceMetricsExperience";

export default function AdminToolMetricsExperience({
  initialData,
  initialTool,
}: {
  initialData: ToolMetricsInsights;
  initialTool: string;
}) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!justSynced) return;
    const id = window.setTimeout(() => setJustSynced(false), 2400);
    return () => window.clearTimeout(id);
  }, [justSynced]);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshError(null);
    setJustSynced(false);

    try {
      const res = await fetch("/api/admin/tools/metrics", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Session expired — sign in again." : "Could not refresh metrics.");
      }
      const next = (await res.json()) as ToolMetricsInsights;
      setData(next);
      setLastSyncedAt(new Date());
      setJustSynced(true);
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  return (
    <div>
      {refreshError ? (
        <AdminAlert title="Refresh failed" variant="error">
          {refreshError}
        </AdminAlert>
      ) : null}

      <AdminPageHeader
        title="Tool performance"
        description="Anonymous funnel and behavior metrics per calculator — pick a tool to inspect without leaving the page."
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <AdminRefreshButton
              isRefreshing={isRefreshing}
              justSynced={justSynced}
              onRefresh={refresh}
              syncedLabel="Metrics updated"
            />
            <Link
              href="/admin/tools"
              className={`inline-flex items-center gap-2 text-sm font-semibold ${admin.link} hover:underline`}
            >
              Tool directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 sm:text-right">
            {adminSyncLabel(lastSyncedAt)}
          </p>
        </div>
      </AdminPageHeader>

      <ToolsSubnav />

      {data.loadError ? (
        <AdminAlert title="Could not load tool metrics" variant={data.configured ? "error" : "warning"}>
          {data.loadError}
        </AdminAlert>
      ) : null}

      <AdminRefreshShell
        isRefreshing={isRefreshing}
        loadingTitle="Refreshing tool metrics"
        loadingDescription="Funnel counts, behavior panels, and KPI snapshots"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              name="Tools in catalog"
              value={String(data.totals.toolCount)}
              sub={`${data.totals.instrumentedCount} instrumented`}
              icon={Target}
              gradient="from-violet-500 to-purple-600"
            />
            <KpiCard
              name="Total tool page views"
              value={data.totals.totalPageViews.toLocaleString()}
              sub="All calculators combined"
              icon={Eye}
              gradient="from-sky-500 to-blue-600"
            />
            <KpiCard
              name="Journey completions"
              value={data.totals.totalJourneyCompletes.toLocaleString()}
              sub="Quick tests finished"
              icon={MousePointerClick}
              gradient="from-amber-500 to-orange-600"
            />
            <KpiCard
              name="Dashboard opens"
              value={data.totals.totalDashboardOpens.toLocaleString()}
              sub="Full workspace entered"
              icon={BarChart3}
              gradient="from-emerald-500 to-teal-600"
            />
          </div>

          <PerformanceMetricsExperience tools={data.tools} initialTool={initialTool} />

          <div className={`rounded-2xl ${admin.calloutViolet} border px-5 py-4 text-sm leading-relaxed`}>
            <p className="font-semibold mb-2">Privacy & storage</p>
            <p className="text-slate-700 dark:text-zinc-300">
              Metrics are anonymous aggregates — no budgets, fund balances, subscription names, emails, or line-item
              details are stored. Instrumented tools send goal/mode bands, funnel counts, export actions, and session
              quality signals only. Run migration{" "}
              <code className={admin.code}>20250609120000_tool_analytics.sql</code> if the table is missing.
            </p>
          </div>
        </div>
      </AdminRefreshShell>
    </div>
  );
}
