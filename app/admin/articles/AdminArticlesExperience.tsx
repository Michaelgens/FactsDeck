"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import type { Post } from "../../lib/types";
import type { ArticleListStats } from "../../lib/article-list-stats";
import AdminArticleRow from "./AdminArticleRow";
import AdminFilterBar from "../components/AdminFilterBar";
import AdminPagination from "../components/AdminPagination";
import ArticlesSubnav from "../components/ArticlesSubnav";
import { AdminAlert, AdminPageHeader, KpiCard } from "../components/admin-ui";
import { admin } from "../components/admin-theme";
import { AdminRefreshButton, AdminRefreshShell, adminSyncLabel } from "../components/admin-refresh-ui";
import AutoAllocateArticles from "../components/AutoAllocateArticles";

const LIMITS = [10, 50, 100] as const;

type ArticlesApiResponse = {
  posts: Post[];
  loadError: string | null;
  stats: ArticleListStats;
};

function parseListParams(searchParams: URLSearchParams) {
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limitRaw = Number(searchParams.get("limit"));
  const limit = LIMITS.includes(limitRaw as (typeof LIMITS)[number]) ? limitRaw : 10;
  return { q, category, status, page, limit };
}

function filterPosts(posts: Post[], q: string, category: string, status: string) {
  const ql = q.toLowerCase();
  return posts.filter((p) => {
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(ql) ||
      p.excerpt.toLowerCase().includes(ql) ||
      (p.categories ?? []).some((c) => c.toLowerCase().includes(ql)) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(ql));
    const matchesCategory = !category || (p.categories ?? []).includes(category);
    const matchesStatus =
      !status || (status === "published" && p.published) || (status === "hidden" && !p.published);
    return matchesSearch && matchesCategory && matchesStatus;
  });
}

export default function AdminArticlesExperience({
  initialPosts,
  initialLoadError,
  initialStats,
}: {
  initialPosts: Post[];
  initialLoadError: string | null;
  initialStats: ArticleListStats;
}) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState(initialPosts);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [stats, setStats] = useState(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const { q, category, status, page, limit } = useMemo(
    () => parseListParams(searchParams),
    [searchParams]
  );

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
      const res = await fetch("/api/admin/articles", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Session expired — sign in again." : "Could not refresh articles.");
      }
      const next = (await res.json()) as ArticlesApiResponse;
      setPosts(next.posts);
      setLoadError(next.loadError);
      setStats(next.stats);
      setLastSyncedAt(new Date());
      setJustSynced(true);
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const filtered = useMemo(() => filterPosts(posts, q, category, status), [posts, q, category, status]);
  const totalCount = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  const categories = useMemo(
    () => [...new Set(posts.flatMap((p) => p.categories ?? []))].filter(Boolean).sort(),
    [posts]
  );

  return (
    <div>
      {loadError ? (
        <AdminAlert title="Could not load articles from the database" variant="warning">
          {loadError}
        </AdminAlert>
      ) : null}

      {refreshError ? (
        <AdminAlert title="Refresh failed" variant="error">
          {refreshError}
        </AdminAlert>
      ) : null}

      <AdminPageHeader
        title="Content management"
        description="Full CRUD for articles powering Home, Post list, and Post detail. Set placement flags, SEO, and visibility."
      >
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <AdminRefreshButton
              isRefreshing={isRefreshing}
              justSynced={justSynced}
              onRefresh={refresh}
              syncedLabel="Articles updated"
            />
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-accent-600 text-white px-4 py-2.5 rounded-xl font-bold hover:from-purple-700 hover:to-accent-700 transition-all shrink-0 text-sm"
            >
              <Plus className="h-5 w-5" />
              New article
            </Link>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 sm:text-right">
            {adminSyncLabel(lastSyncedAt)}
          </p>
        </div>
      </AdminPageHeader>

      <ArticlesSubnav />

      <AdminRefreshShell
        isRefreshing={isRefreshing}
        loadingTitle="Refreshing article library"
        loadingDescription="Reloading posts, counts, and placement totals"
      >
        <div className="space-y-6">
          <AutoAllocateArticles variant="panel" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard name="Total" value={String(stats.total)} icon={FileText} gradient="from-purple-500 to-purple-600" />
            <KpiCard
              name="Published"
              value={String(stats.published)}
              sub={`${stats.hidden} hidden`}
              icon={FileText}
              gradient="from-emerald-500 to-emerald-600"
            />
            <KpiCard
              name="Featured"
              value={String(stats.featured)}
              icon={FileText}
              gradient="from-violet-500 to-violet-600"
            />
            <KpiCard
              name="Expert picks"
              value={String(stats.expertPicks)}
              icon={FileText}
              gradient="from-amber-500 to-amber-600"
            />
          </div>

          <div className={`rounded-2xl ${admin.card} overflow-hidden`}>
            <AdminFilterBar
              key={`${q}-${category}-${status}-${limit}`}
              action="/admin/articles"
              searchName="q"
              searchPlaceholder="Search title, excerpt, tags, or categories..."
              searchDefault={q}
              limit={limit}
              hasActiveFilters={!!(q || category || status)}
              clearHref={`/admin/articles?limit=${limit}`}
              categoryFilter={
                categories.length > 0
                  ? {
                      name: "category",
                      options: categories.map((c) => ({ value: c, label: c })),
                      defaultValue: category,
                    }
                  : undefined
              }
              statusFilter={{
                name: "status",
                options: [
                  { value: "", label: "All visibility" },
                  { value: "published", label: "Published (live)" },
                  { value: "hidden", label: "Hidden (draft)" },
                ],
                defaultValue: status,
              }}
            />

            {paginated.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-purple-600 dark:text-violet-400" />
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">
                  {q || category || status ? "No matching articles" : "No articles yet"}
                </h3>
                <p className="text-slate-600 dark:text-zinc-400 mb-6">
                  {q || category || status ? "Try different filters." : "Add your first article in Supabase."}
                </p>
                {(q || category || status) && (
                  <Link
                    href="/admin/articles"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 dark:bg-violet-600 text-white font-semibold hover:bg-purple-700 dark:hover:bg-violet-500 transition-colors text-sm"
                  >
                    Clear filters
                  </Link>
                )}
              </div>
            ) : (
              <>
                <ul className="divide-y divide-slate-200 dark:divide-purple-500/20">
                  {paginated.map((article) => (
                    <AdminArticleRow key={article.id} article={article} />
                  ))}
                </ul>
                <AdminPagination
                  totalCount={totalCount}
                  currentPage={page}
                  limit={limit}
                  itemLabel="articles"
                />
              </>
            )}
          </div>
        </div>
      </AdminRefreshShell>
    </div>
  );
}
