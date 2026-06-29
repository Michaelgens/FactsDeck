"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Database,
  FileText,
  Eye,
  Heart,
  PenLine,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { DashboardInsights } from "../lib/admin-insights";
import { formatCount } from "../lib/admin-insights";
import { postPublicPath } from "../lib/post-url";
import { HOME_LATEST_CAROUSEL, PLACEMENT_PRIORITY, PLACEMENT_SLOTS } from "../lib/placement-labels";
import { MiniSparkline } from "./components/admin-charts";
import {
  AdminAlert,
  AdminPageHeader,
  AdminPanel,
  KpiCard,
  PlacementPill,
  RankedListRow,
} from "./components/admin-ui";
import { admin } from "./components/admin-theme";
import { AdminRefreshButton, AdminRefreshShell, adminSyncLabel } from "./components/admin-refresh-ui";

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 60) return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function AdminDashboardExperience({
  initialData,
  supabaseConfigured,
}: {
  initialData: DashboardInsights;
  supabaseConfigured: boolean;
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
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Session expired — sign in again." : "Could not refresh dashboard data.");
      }
      const next = (await res.json()) as DashboardInsights;
      setData(next);
      setLastSyncedAt(new Date());
      setJustSynced(true);
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const { stats, placement, topByViews, recentPosts, subscriberSparkline } = data;
  const publishRate =
    stats.totalArticles > 0 ? Math.round((data.publishedCount / stats.totalArticles) * 100) : 0;

  return (
    <div>
      {data.postsLoadError ? (
        <AdminAlert title="Could not load articles from the database">{data.postsLoadError}</AdminAlert>
      ) : null}

      {refreshError ? (
        <AdminAlert title="Refresh failed" variant="error">
          {refreshError}
        </AdminAlert>
      ) : null}

      <AdminPageHeader
        title="Executive Dashboard"
        description="Audience growth, feed placement counts, and recent articles — your editorial command center for Home, Post list, and article detail."
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <AdminRefreshButton
              isRefreshing={isRefreshing}
              justSynced={justSynced}
              onRefresh={refresh}
              syncedLabel="Dashboard updated"
            />
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-accent-600 text-white px-4 py-2.5 rounded-xl font-bold hover:from-purple-700 hover:to-accent-700 transition-all text-sm"
            >
              <Plus className="h-4 w-4" />
              New article
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold hover:bg-purple-50 dark:hover:bg-zinc-800 text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 sm:text-right">
            {adminSyncLabel(lastSyncedAt)}
          </p>
        </div>
      </AdminPageHeader>

      <AdminRefreshShell
        isRefreshing={isRefreshing}
        loadingTitle="Pulling latest metrics"
        loadingDescription="Articles, subscribers, and engagement"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              name="Published articles"
              value={String(data.publishedCount)}
              sub={`${data.draftCount} drafts · ${publishRate}% live`}
              icon={FileText}
              href="/admin/articles"
              gradient="from-purple-500 to-purple-600"
            />
            <KpiCard
              name="Total views"
              value={formatCount(stats.totalViews)}
              sub="Across all articles (Supabase)"
              icon={Eye}
              href="/admin/analytics"
              gradient="from-accent-500 to-accent-600"
            />
            <KpiCard
              name="Newsletter subscribers"
              value={formatCount(data.subscriberTotal)}
              icon={Users}
              href="/admin/users"
              gradient="from-emerald-500 to-emerald-600"
              trend={{
                label: `+${data.subscribersLast7Days} this week · +${data.subscribersLast30Days} this month`,
                positive: data.subscribersLast7Days > 0,
              }}
            />
            <KpiCard
              name="Engagement"
              value={formatCount(stats.totalLikes)}
              sub={`${formatCount(stats.totalBookmarks)} bookmarks`}
              icon={Heart}
              href="/admin/analytics"
              gradient="from-amber-500 to-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AdminPanel
              title="Editorial placement buckets"
              description="How many published articles sit in each slot (one bucket per article)"
              className="lg:col-span-1"
              action={
                <Link
                  href="/admin/articles/placements"
                  className="text-sm font-semibold text-purple-600 dark:text-violet-400 hover:underline"
                >
                  Placement guide →
                </Link>
              }
            >
              {PLACEMENT_SLOTS.map((slot) => (
                <PlacementPill
                  key={slot.key}
                  label={slot.label}
                  count={placement[slot.key]}
                  color={slot.color}
                />
              ))}
              <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Priority: {PLACEMENT_PRIORITY}. The count for <strong>Latest slot</strong> is articles with{" "}
                <em>no</em> Featured / Expert / Trending / Guide flags — not the number of cards in a carousel.
              </p>
              <div className="mt-3 rounded-xl border border-sky-200/80 bg-sky-50/80 dark:border-sky-800/50 dark:bg-sky-950/30 px-3 py-2.5 text-xs text-sky-950 dark:text-sky-100 leading-relaxed">
                <p className="font-semibold">{HOME_LATEST_CAROUSEL.title}</p>
                <p className="mt-1 text-sky-900/90 dark:text-sky-200/90">
                  <strong>Where:</strong> {HOME_LATEST_CAROUSEL.location}. {HOME_LATEST_CAROUSEL.behavior}
                </p>
              </div>
            </AdminPanel>

            <AdminPanel
              title="Subscriber momentum"
              description="Footer newsletter signups (last 14 days)"
              className="lg:col-span-1"
              action={
                <Link href="/admin/users" className="text-sm font-semibold text-purple-600 dark:text-violet-400 hover:underline">
                  Manage →
                </Link>
              }
            >
              <p className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-1">{data.subscriberTotal}</p>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">Total active subscribers</p>
              <MiniSparkline values={subscriberSparkline} className="h-14" />
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/80 py-3 px-2">
                  <p className="text-lg font-bold text-slate-900 dark:text-zinc-100">{data.subscribersLast7Days}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-zinc-400 font-semibold">7 days</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/80 py-3 px-2">
                  <p className="text-lg font-bold text-slate-900 dark:text-zinc-100">{data.subscribersLast30Days}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-zinc-400 font-semibold">30 days</p>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel title="System status" description="Infrastructure at a glance" className="lg:col-span-1">
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <Database className="h-4 w-4 text-purple-500 shrink-0" />
                  <span className="text-slate-700 dark:text-zinc-200 flex-1">Supabase</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      supabaseConfigured
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}
                  >
                    {supabaseConfigured ? "Connected" : "Not configured"}
                  </span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <TrendingUp className="h-4 w-4 text-accent-500 shrink-0" />
                  <span className="text-slate-700 dark:text-zinc-200 flex-1">Vercel Analytics</span>
                  <Link href="/admin/analytics" className="text-xs font-semibold text-purple-600 dark:text-violet-400">
                    View →
                  </Link>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-slate-700 dark:text-zinc-200 flex-1">Site settings</span>
                  <Link href="/admin/settings" className="text-xs font-semibold text-purple-600 dark:text-violet-400">
                    Configure →
                  </Link>
                </li>
              </ul>
            </AdminPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminPanel
              title="Top performing content"
              description="By recorded views in Supabase"
              action={
                <Link href="/admin/analytics" className="text-sm font-semibold text-purple-600 dark:text-violet-400">
                  Full report →
                </Link>
              }
            >
              {topByViews.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-400 py-4 text-center">Publish articles to see rankings.</p>
              ) : (
                <ul>
                  {topByViews.map((p, i) => (
                    <RankedListRow
                      key={p.id}
                      rank={i + 1}
                      title={p.title}
                      meta={p.published ? "Live" : "Draft"}
                      href={p.slug ? postPublicPath({ id: p.id, slug: p.slug }) : `/admin/articles/${p.id}/edit`}
                      value={formatCount(p.views)}
                    />
                  ))}
                </ul>
              )}
            </AdminPanel>

            <AdminPanel
              title="Recent articles"
              description="All posts in Supabase, newest publish date first (includes drafts and live articles)"
              action={
                <Link href="/admin/articles" className="text-sm font-semibold text-purple-600 dark:text-violet-400">
                  All articles →
                </Link>
              }
            >
              {recentPosts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-400 py-4 text-center">No articles yet.</p>
              ) : (
                <ul className="space-y-0">
                  {recentPosts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-zinc-800 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <PenLine className="h-4 w-4 text-purple-600 dark:text-violet-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/articles/${p.id}/edit`}
                          className="font-medium text-slate-900 dark:text-zinc-100 truncate block hover:text-purple-600"
                        >
                          {p.title}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {timeAgo(p.publishDate)} · {p.published ? "Published" : "Hidden"}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          p.published
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        }`}
                      >
                        {p.published ? "Live" : "Draft"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanel>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/10 dark:from-violet-950/40 dark:to-zinc-900 border border-purple-200/50 dark:border-zinc-800 p-6">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-zinc-100 mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { href: "/admin/articles/new", label: "Create article", icon: Plus },
                { href: "/admin/articles/placements", label: "Placement guide", icon: Sparkles },
                { href: "/admin/users", label: "Subscribers", icon: Users },
                { href: "/admin/settings", label: "Site settings", icon: Settings },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/80 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-800 transition-colors"
                >
                  <Icon className="h-5 w-5 text-purple-600 dark:text-violet-400" />
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </AdminRefreshShell>
    </div>
  );
}
