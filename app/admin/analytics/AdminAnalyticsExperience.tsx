"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BarChart3, ExternalLink, FileText, Globe, Users, Wrench } from "lucide-react";
import type { AnalyticsInsights } from "../../lib/admin-insights";
import { formatCount } from "../../lib/admin-insights";
import { postPublicPath } from "../../lib/post-url";
import { GroupedBarChart, DonutStat, HorizontalBarChart } from "../components/admin-charts";
import { AdminAlert, AdminPageHeader, AdminPanel, KpiCard } from "../components/admin-ui";
import { admin } from "../components/admin-theme";
import { AdminRefreshButton, AdminRefreshShell, adminSyncLabel } from "../components/admin-refresh-ui";

export default function AdminAnalyticsExperience({
  initialData,
  vercelProject,
  vercelUrl,
}: {
  initialData: AnalyticsInsights;
  vercelProject: string;
  vercelUrl: string;
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
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Session expired — sign in again." : "Could not refresh analytics data.");
      }
      const next = (await res.json()) as AnalyticsInsights;
      setData(next);
      setLastSyncedAt(new Date());
      setJustSynced(true);
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const { stats, placementBreakdown, publishTimeline, subscriberGrowth, categoryBreakdown, viewsByPost } = data;

  return (
    <div>
      {refreshError ? (
        <AdminAlert title="Refresh failed" variant="error">
          {refreshError}
        </AdminAlert>
      ) : null}

      <AdminPageHeader
        title="Analytics & insights"
        description="Editorial performance from Supabase (views, likes, placements) plus hosting metrics from Vercel."
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <AdminRefreshButton
              isRefreshing={isRefreshing}
              justSynced={justSynced}
              onRefresh={refresh}
              syncedLabel="Analytics updated"
            />
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 text-sm"
            >
              Vercel dashboard
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 sm:text-right">
            {adminSyncLabel(lastSyncedAt)}
          </p>
        </div>
      </AdminPageHeader>

      <AdminRefreshShell
        isRefreshing={isRefreshing}
        loadingTitle="Refreshing analytics"
        loadingDescription="Charts, rankings, and Supabase totals"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              name="Avg views / article"
              value={formatCount(data.avgViewsPerPost)}
              sub={`${data.publishedCount} published`}
              icon={BarChart3}
              gradient="from-purple-500 to-purple-600"
            />
            <KpiCard
              name="Avg likes / article"
              value={String(data.avgLikesPerPost)}
              sub={`${formatCount(stats.totalLikes)} total likes`}
              icon={FileText}
              gradient="from-accent-500 to-accent-600"
            />
            <KpiCard
              name="Engagement rate"
              value={`${data.engagementRate}%`}
              sub="(likes + bookmarks) / views"
              icon={Globe}
              gradient="from-emerald-500 to-emerald-600"
            />
            <KpiCard
              name="Subscribers"
              value={formatCount(data.subscriberTotal)}
              href="/admin/users"
              icon={Users}
              gradient="from-amber-500 to-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminPanel title="Publishing velocity" description="Articles published per month (Supabase)">
              <GroupedBarChart
                labels={publishTimeline.map((p) => p.label)}
                series={[
                  {
                    name: "Published",
                    values: publishTimeline.map((p) => p.count),
                    color: "bg-purple-500",
                  },
                ]}
              />
            </AdminPanel>

            <AdminPanel title="Newsletter growth" description="New subscribers per month (footer signup)">
              <GroupedBarChart
                labels={subscriberGrowth.map((p) => p.label)}
                series={[
                  {
                    name: "Subscribers",
                    values: subscriberGrowth.map((p) => p.count),
                    color: "bg-emerald-500",
                  },
                ]}
              />
            </AdminPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminPanel title="Feed placement mix" description="Where published articles appear on Home & /post">
              <DonutStat segments={placementBreakdown} />
            </AdminPanel>

            <AdminPanel title="Categories" description="Published articles by topic">
              <HorizontalBarChart items={categoryBreakdown.map((c) => ({ label: c.name, count: c.count }))} />
            </AdminPanel>
          </div>

          <AdminPanel
            title="Top articles by views"
            description="Supabase-recorded view counts — pair with Vercel for real traffic"
          >
            {viewsByPost.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-zinc-400 text-center py-6">No published articles yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800">
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Article</th>
                      <th className="py-3 px-3 text-right">Views</th>
                      <th className="py-3 px-3 text-right">Likes</th>
                      <th className="py-3 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {viewsByPost.map((p, i) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-50 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      >
                        <td className="py-3 px-3 font-bold text-slate-400">{i + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-900 dark:text-zinc-100 max-w-md truncate">
                          {p.title}
                        </td>
                        <td className="py-3 px-3 text-right font-bold tabular-nums">{formatCount(p.views)}</td>
                        <td className="py-3 px-3 text-right tabular-nums text-slate-600 dark:text-zinc-400">
                          {p.likes}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {p.slug ? (
                            <Link
                              href={postPublicPath({ id: p.id, slug: p.slug })}
                              className="text-purple-600 dark:text-violet-400 font-semibold hover:underline"
                            >
                              View
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminPanel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`rounded-2xl ${admin.card} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-zinc-100">Vercel Web Analytics</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Page views, visitors, referrers, devices</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4 leading-relaxed">
                Real user traffic is collected via{" "}
                <code className="text-xs bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-zinc-200">
                  @vercel/analytics
                </code>{" "}
                in your layout. Open your project&apos;s Analytics tab for page-level paths, countries, and conversion
                funnels.
              </p>
              <ul className="text-sm text-slate-600 dark:text-zinc-400 space-y-2 mb-4">
                <li>· Deployment: {vercelProject}</li>
                <li>· {data.draftCount} drafts not counted in public traffic</li>
                <li>· {data.toolCount} interactive tools on /tools</li>
              </ul>
              <a
                href="https://vercel.com/docs/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-violet-400 hover:underline"
              >
                Vercel Analytics docs
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className={`rounded-2xl ${admin.card} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-accent-500 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-zinc-100">Content database</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Supabase posts & subscribers</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/80 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">{stats.totalArticles}</p>
                  <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400">Total posts</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/80 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">{formatCount(stats.totalBookmarks)}</p>
                  <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400">Bookmarks</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Preview URL when deployed: {vercelUrl}</p>
            </div>
          </div>
        </div>
      </AdminRefreshShell>
    </div>
  );
}
