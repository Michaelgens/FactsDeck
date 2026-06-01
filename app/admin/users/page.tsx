import Link from "next/link";
import { Download, Mail, Users, UserPlus, Calendar } from "lucide-react";
import { getSubscribers } from "../../lib/subscriber-actions";
import { getSubscriberInsights } from "../../lib/admin-insights";
import AdminUsersTable from "./AdminUsersTable";
import AdminFilterBar from "../components/AdminFilterBar";
import AdminPagination from "../components/AdminPagination";
import { AdminPageHeader, KpiCard, AdminPanel } from "../components/admin-ui";
import { admin } from "../components/admin-theme";
import { GroupedBarChart } from "../components/admin-charts";

const LIMITS = [10, 50, 100] as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim().toLowerCase() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = LIMITS.includes(Number(params.limit) as (typeof LIMITS)[number])
    ? Number(params.limit)
    : 10;

  const [allSubscribers, insights] = await Promise.all([getSubscribers(), getSubscriberInsights()]);

  const filtered = q
    ? allSubscribers.filter((s) => s.email.toLowerCase().includes(q))
    : allSubscribers;

  const totalCount = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return (
    <div>
      <AdminPageHeader
        title="Audience & subscribers"
        description="Newsletter signups from the site footer — export for campaigns or review growth trends."
      >
        <a
          href="/admin/users/export"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold hover:bg-purple-50 dark:hover:bg-zinc-800 text-sm"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </AdminPageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <AdminPanel title="Growth (6 months)" description="New subscribers per month" className="mb-6">
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
          action="/admin/users"
          searchName="q"
          searchPlaceholder="Search by email..."
          searchDefault={params.q ?? ""}
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
              <Link href="/" className="inline-block mt-4 text-sm font-semibold text-purple-600 dark:text-violet-400 hover:underline">
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
  );
}
