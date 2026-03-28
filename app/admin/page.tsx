import {
  FileText,
  Users,
  Eye,
  Bookmark,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { getAdminStats, formatCount } from "../lib/admin";
import { getLatestPosts } from "../lib/posts";

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 60) return diffMins <= 1 ? "Just now" : `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return d.toLocaleDateString();
}

export default async function AdminDashboardPage() {
  const [stats, latestPosts] = await Promise.all([
    getAdminStats(),
    getLatestPosts(5),
  ]);

  const statCards = [
    { name: "Total Articles", value: String(stats.totalArticles), icon: FileText, href: "/admin/articles", color: "from-purple-500 to-purple-600" },
    { name: "Total Views", value: formatCount(stats.totalViews), icon: Eye, href: "/admin/analytics", color: "from-accent-500 to-accent-600" },
    { name: "Total Likes", value: formatCount(stats.totalLikes), icon: Users, href: "/admin/analytics", color: "from-emerald-500 to-emerald-600" },
    { name: "Total Bookmarks", value: formatCount(stats.totalBookmarks), icon: Bookmark, href: "/admin/articles", color: "from-amber-500 to-amber-600" },
  ];

  const recentActivity = latestPosts.map((p) => ({
    action: "Article",
    title: p.title,
    time: timeAgo(p.publishDate),
    id: p.id,
  }));
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-purple-300 mt-1">
          Overview of your Facts Deck admin
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-500/50 transition-all"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-purple-400 font-medium">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-dark-100">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-slate-300 dark:text-purple-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100">
              Recent Activity
            </h2>
            <Link
              href="/admin/analytics"
              className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-emerald-400 transition-colors"
            >
              View all
            </Link>
          </div>
          <ul className="space-y-4">
            {recentActivity.length === 0 ? (
              <li className="py-8 text-center text-slate-500 dark:text-purple-400 text-sm">
                No articles yet. Add content in Articles.
              </li>
            ) : (
              recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-purple-500/20 last:border-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/post/${item.id}`} className="font-medium text-slate-900 dark:text-dark-100 truncate block hover:text-purple-600 dark:hover:text-purple-400">
                      {item.title}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-purple-400">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-accent-500/10 dark:from-purple-900/30 dark:to-accent-900/20 border border-purple-200/50 dark:border-purple-500/30 p-6">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-dark-100 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/articles"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-dark-800/50 hover:bg-white dark:hover:bg-dark-800 transition-colors"
            >
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-slate-900 dark:text-dark-100">New Article</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-dark-800/50 hover:bg-white dark:hover:bg-dark-800 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-accent-600 dark:text-accent-400" />
              <span className="font-medium text-slate-900 dark:text-dark-100">View Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
