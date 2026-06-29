"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, Download, Mail, UserPlus, Users } from "lucide-react";
import type { AdminUsersPageData } from "../../lib/admin-users-page-data";
import type { Subscriber } from "../../lib/subscriber-actions";
import AdminUsersTable from "./AdminUsersTable";
import AdminFilterBar from "../components/AdminFilterBar";
import AdminPagination from "../components/AdminPagination";
import { AdminAlert, AdminPageHeader, AdminPanel, KpiCard } from "../components/admin-ui";
import { admin } from "../components/admin-theme";
import { AdminRefreshButton, AdminRefreshShell, adminSyncLabel } from "../components/admin-refresh-ui";
import { GroupedBarChart } from "../components/admin-charts";

const LIMITS = [10, 50, 100] as const;

function parseListParams(searchParams: URLSearchParams) {
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limitRaw = Number(searchParams.get("limit"));
  const limit = LIMITS.includes(limitRaw as (typeof LIMITS)[number]) ? limitRaw : 10;
  return { q, page, limit, searchQuery: searchParams.get("q")?.trim() ?? "" };
}

function filterSubscribers(subscribers: Subscriber[], q: string) {
  return q ? subscribers.filter((s) => s.email.toLowerCase().includes(q)) : subscribers;
}

export default function AdminUsersExperience({ initialData }: { initialData: AdminUsersPageData }) {
  const searchParams = useSearchParams();
  const [subscribers, setSubscribers] = useState(initialData.subscribers);
  const [insights, setInsights] = useState(initialData.insights);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const queryString = searchParams.toString();
  const { q, page, limit, searchQuery } = useMemo(() => parseListParams(searchParams), [searchParams]);

  useEffect(() => {
    setSubscribers(initialData.subscribers);
    setInsights(initialData.insights);
  }, [initialData, queryString]);

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
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Session expired — sign in again." : "Could not refresh subscribers.");
      }
      const next = (await res.json()) as AdminUsersPageData;
      setSubscribers(next.subscribers);
      setInsights(next.insights);
      setLastSyncedAt(new Date());
      setJustSynced(true);
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const filtered = useMemo(() => filterSubscribers(subscribers, q), [subscribers, q]);
  const totalCount = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return (
    <div>
      {refreshError ? (
        <AdminAlert title="Refresh failed" variant="error">
          {refreshError}
        </AdminAlert>
      ) : null}

      <AdminPageHeader
        title="Audience & subscribers"
        description="Newsletter signups from the site footer — export for campaigns or review growth trends."
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <AdminRefreshButton
              isRefreshing={isRefreshing}
              justSynced={justSynced}
              onRefresh={refresh}
              syncedLabel="Subscribers updated"
            />
            <a
              href="/admin/users/export"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold hover:bg-purple-50 dark:hover:bg-zinc-800 text-sm"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 sm:text-right">
            {adminSyncLabel(lastSyncedAt)}
          </p>
        </div>
      </AdminPageHeader>

      <AdminRefreshShell
        isRefreshing={isRefreshing}
        loadingTitle="Refreshing subscriber data"
        loadingDescription="Growth KPIs, chart, and mailing list for current filters"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              name="Total subscribers"
              value={String(insights.total)}
              icon={Users}
              gradient="from-purple-500 to-purple-600"
            />
            <KpiCard
              name="This month"
              value={String(insights.thisMonth)}
              icon={Calendar}
              gradient="from-accent-500 to-accent-600"
            />
            <KpiCard
              name="Last 7 days"
              value={String(insights.last7Days)}
              icon={UserPlus}
              gradient="from-emerald-500 to-emerald-600"
              trend={{
                label: insights.last7Days > 0 ? "Growing" : "No new signups this week",
                positive: insights.last7Days > 0,
              }}
            />
            <KpiCard
              name="Last 30 days"
              value={String(insights.last30Days)}
              icon={Mail}
              gradient="from-amber-500 to-amber-600"
            />
          </div>

          <AdminPanel title="Growth (6 months)" description="New subscribers per month">
            <GroupedBarChart
              labels={insights.growthSeries.map((g) => g.label)}
              series={[
                {
                  name: "New subscribers",
                  values: insights.growthSeries.map((g) => g.count),
                  color: "bg-emerald-500",
                },
              ]}
            />
          </AdminPanel>

          <div className={`rounded-2xl ${admin.card} overflow-hidden`}>
            <AdminFilterBar
              key={`${searchQuery}-${limit}`}
              action="/admin/users"
              searchName="q"
              searchPlaceholder="Search by email..."
              searchDefault={searchQuery}
              limit={limit}
              hasActiveFilters={!!q}
              clearHref={`/admin/users?limit=${limit}`}
            />

            {paginated.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
                <h3 className="font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">
                  {q ? "No matching subscribers" : "No subscribers yet"}
                </h3>
                <p className="text-slate-600 dark:text-zinc-400 text-sm max-w-md mx-auto">
                  {q
                    ? "Try a different search term."
                    : "Signups from the footer newsletter form will appear here. Welcome emails send when FACTSDECK_BACKEND_URL is configured."}
                </p>
                {!q && (
                  <Link
                    href="/"
                    className="inline-block mt-4 text-sm font-semibold text-purple-600 dark:text-violet-400 hover:underline"
                  >
                    View public site →
                  </Link>
                )}
              </div>
            ) : (
              <>
                <AdminUsersTable subscribers={paginated} />
                <AdminPagination
                  totalCount={totalCount}
                  currentPage={page}
                  limit={limit}
                  itemLabel="subscribers"
                />
              </>
            )}
          </div>
        </div>
      </AdminRefreshShell>
    </div>
  );
}
