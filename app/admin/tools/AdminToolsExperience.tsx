"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  ExternalLink,
  Layers,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import {
  TOOL_SURFACE_BLOCKS,
  type ToolDirectoryInsights,
} from "../../lib/tools-directory";
import type { ToolMetricsInsights } from "../../lib/tool-insights";
import { INSTRUMENTED_TOOL_SLUGS } from "../../lib/tool-analytics-types";
import { AdminAlert, AdminPageHeader, AdminPanel, KpiCard } from "../components/admin-ui";
import { admin } from "../components/admin-theme";
import { AdminRefreshButton, AdminRefreshShell, adminSyncLabel } from "../components/admin-refresh-ui";
import AdminToolsTable, { type ToolMetricsSummary } from "./AdminToolsTable";
import ToolsSubnav from "./ToolsSubnav";

type ToolsApiResponse = {
  directory: ToolDirectoryInsights;
  metrics: ToolMetricsInsights;
};

function buildMetricsBySlug(metrics: ToolMetricsInsights): Record<string, ToolMetricsSummary> {
  return Object.fromEntries(
    metrics.tools.map((t) => [
      t.slug,
      {
        instrumented: t.instrumented,
        pageViews: t.analytics.funnel.pageViews,
        journeyCompletes: t.analytics.funnel.journeyCompletes,
        dashboardOpens: t.analytics.funnel.dashboardOpens,
        totalEvents: t.totalEvents,
        lastEventAt: t.lastEventAt,
      },
    ])
  );
}

export default function AdminToolsExperience({
  initialDirectory,
  initialMetrics,
}: {
  initialDirectory: ToolDirectoryInsights;
  initialMetrics: ToolMetricsInsights;
}) {
  const [directory, setDirectory] = useState(initialDirectory);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const metricsBySlug = useMemo(() => buildMetricsBySlug(metrics), [metrics]);

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
      const res = await fetch("/api/admin/tools", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Session expired — sign in again." : "Could not refresh tools data.");
      }
      const next = (await res.json()) as ToolsApiResponse;
      setDirectory(next.directory);
      setMetrics(next.metrics);
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
        title="Tools directory"
        description="Financial calculators and simulators on /tools — catalog metadata, index groups, surface caps, and wiring health."
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <AdminRefreshButton
              isRefreshing={isRefreshing}
              justSynced={justSynced}
              onRefresh={refresh}
              syncedLabel="Tools updated"
            />
            <Link
              href="/tools"
              target="_blank"
              className={`inline-flex items-center gap-2 text-sm font-semibold ${admin.link} hover:underline`}
            >
              View public index
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 sm:text-right">
            {adminSyncLabel(lastSyncedAt)}
          </p>
        </div>
      </AdminPageHeader>

      <ToolsSubnav />

      <AdminRefreshShell
        isRefreshing={isRefreshing}
        loadingTitle="Refreshing tools directory"
        loadingDescription="Catalog health, metrics, and instrumented tool stats"
      >
        <div className="space-y-8">
          {!directory.isHealthy ? (
            <AdminAlert title="Directory needs attention" variant="warning">
              <ul className="list-disc pl-5 space-y-1 mt-1">
                {directory.missingFromGroups.length > 0 ? (
                  <li>
                    Tools not assigned to an index group:{" "}
                    <code className={admin.code}>{directory.missingFromGroups.join(", ")}</code>
                  </li>
                ) : null}
                {directory.orphanGroupSlugs.length > 0 ? (
                  <li>
                    Group slugs with no matching tool:{" "}
                    <code className={admin.code}>{directory.orphanGroupSlugs.join(", ")}</code>
                  </li>
                ) : null}
                {directory.missingSeo.length > 0 ? (
                  <li>
                    Missing SEO pack in <code className={admin.code}>tool-seo.ts</code>:{" "}
                    <code className={admin.code}>{directory.missingSeo.join(", ")}</code>
                  </li>
                ) : null}
                {directory.missingEntry.length > 0 ? (
                  <li>
                    Missing entry component mapping:{" "}
                    <code className={admin.code}>{directory.missingEntry.join(", ")}</code>
                  </li>
                ) : null}
              </ul>
            </AdminAlert>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <KpiCard
              name="Live tools"
              value={String(directory.toolCount)}
              sub={`${directory.groupCount} index groups`}
              icon={Wrench}
              gradient="from-violet-500 to-purple-600"
              href="/tools"
            />
            <KpiCard
              name="Featured spotlight"
              value={directory.spotlightName}
              sub="Lowest displayOrder on /tools"
              icon={Sparkles}
              gradient="from-amber-500 to-orange-600"
            />
            <KpiCard
              name="SEO coverage"
              value={`${directory.seoCoverage}/${directory.toolCount}`}
              sub="tool-seo.ts packs"
              icon={Target}
              gradient="from-sky-500 to-blue-600"
            />
            <KpiCard
              name="Entry components"
              value={`${directory.entryCoverage}/${directory.toolCount}`}
              sub="Slug → *Entry.tsx wiring"
              icon={Calculator}
              gradient="from-emerald-500 to-teal-600"
            />
            <KpiCard
              name="Performance metrics"
              value={String(metrics.totals.instrumentedCount)}
              sub={`${metrics.totals.totalPageViews.toLocaleString()} page views · instrumented tools`}
              icon={Target}
              gradient="from-sky-500 to-indigo-600"
              href="/admin/tools/metrics"
            />
          </div>

          {metrics.loadError ? (
            <AdminAlert title="Tool metrics unavailable" variant={metrics.configured ? "error" : "warning"}>
              {metrics.loadError}
            </AdminAlert>
          ) : null}

          {!metrics.loadError ? (
            <AdminPanel
              title="Instrumented tools"
              description="Calculators sending anonymous funnel and behavior telemetry to admin metrics"
            >
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.tools
                  .filter((t) => INSTRUMENTED_TOOL_SLUGS.has(t.slug))
                  .map((t) => (
                    <li
                      key={t.slug}
                      className="rounded-xl border border-slate-100 dark:border-zinc-800 px-4 py-3 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{t.name}</p>
                          <p className="text-xs font-mono text-slate-500 dark:text-zinc-500">{t.slug}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 tabular-nums">
                        {t.analytics.funnel.pageViews.toLocaleString()} views · {t.analytics.funnel.journeyCompletes}{" "}
                        completes · {t.analytics.funnel.dashboardOpens} workspace
                      </p>
                      <Link
                        href={`/admin/tools/metrics?tool=${t.slug}`}
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${admin.link}`}
                      >
                        View metrics
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  ))}
              </ul>
            </AdminPanel>
          ) : null}

          <div className={`rounded-2xl ${admin.calloutViolet} border px-5 py-4 text-sm leading-relaxed`}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              How tools are managed today
            </p>
            <p className="text-slate-700 dark:text-zinc-300">
              Tool metadata lives in code — not the database. To add or edit a tool, update{" "}
              <code className={admin.code}>app/lib/site-config.ts</code> (catalog), wire the slug in{" "}
              <code className={admin.code}>app/tools/[slug]/page.tsx</code>, add SEO in{" "}
              <code className={admin.code}>app/lib/tool-seo.ts</code>, and place it in a group via{" "}
              <code className={admin.code}>app/lib/tools-directory.ts</code>.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-zinc-900 text-sm font-semibold text-slate-800 dark:text-zinc-200 hover:text-purple-600"
              >
                Platform settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AdminPanel
              title="Index groups"
              description="Sections on /tools — each slug should appear exactly once"
            >
              <ul className="space-y-3">
                {directory.groups.map((group) => (
                  <li
                    key={group.id}
                    className="rounded-xl border border-slate-100 dark:border-zinc-800 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{group.label}</span>
                      <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                        {group.toolCount}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{group.blurb}</p>
                    {group.missingSlugs.length > 0 ? (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                        Missing tools: {group.missingSlugs.join(", ")}
                      </p>
                    ) : null}
                    <Link
                      href={`/tools#${group.id}`}
                      target="_blank"
                      className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${admin.link}`}
                    >
                      Jump to section
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </AdminPanel>

            <div className={`lg:col-span-2 rounded-2xl ${admin.card} overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${admin.cardHeader}`}>
                <h2 className={`font-display font-bold text-lg ${admin.heading}`}>Surface allocation</h2>
                <p className={`text-sm ${admin.body} mt-0.5`}>
                  Where tools appear across Home, articles, header, footer, and tool detail pages
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${admin.tableHead} border-b ${admin.divide} text-left`}>
                      <th className="py-3 px-4 font-semibold">Surface</th>
                      <th className="py-3 px-4 font-semibold">Block</th>
                      <th className="py-3 px-4 font-semibold">Max shown</th>
                      <th className="py-3 px-4 font-semibold">Pool</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOOL_SURFACE_BLOCKS.map((row) => (
                      <tr key={`${row.surface}-${row.block}`} className={`border-b ${admin.divideSubtle}`}>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-zinc-100">{row.surface}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">{row.block}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-bold tabular-nums text-purple-700 dark:text-violet-300">
                            <Target className="h-3.5 w-3.5" />
                            {row.maxShown}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-400 max-w-md">
                          {row.pool}
                          {row.notes ? (
                            <span className="block mt-1 text-xs text-slate-500 dark:text-zinc-500">{row.notes}</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <AdminPanel
            title="Tool catalog"
            description="Sorted by displayOrder — lower numbers surface first on /tools and related promos"
          >
            <AdminToolsTable rows={directory.rows} metricsBySlug={metricsBySlug} />
          </AdminPanel>
        </div>
      </AdminRefreshShell>
    </div>
  );
}
