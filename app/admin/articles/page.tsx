import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { getAllPostsWithLoadError } from "../../lib/posts";
import AdminArticleRow from "./AdminArticleRow";
import AdminFilterBar from "../components/AdminFilterBar";
import AdminPagination from "../components/AdminPagination";

const LIMITS = [10, 50, 100] as const;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; limit?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = LIMITS.includes(Number(params.limit) as (typeof LIMITS)[number])
    ? Number(params.limit)
    : 10;

  const { posts: allPosts, loadError } = await getAllPostsWithLoadError();

  const ql = q.toLowerCase();
  const filtered = allPosts.filter((p) => {
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(ql) ||
      p.excerpt.toLowerCase().includes(ql) ||
      (p.categories ?? []).some((c) => c.toLowerCase().includes(ql)) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(ql));
    const matchesCategory = !category || (p.categories ?? []).includes(category);
    const matchesStatus =
      !status ||
      (status === "published" && p.published) ||
      (status === "hidden" && !p.published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  const categories = [...new Set(allPosts.flatMap((p) => p.categories ?? []))].filter(Boolean).sort();

  return (
    <div>
      {loadError && (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          <p className="font-semibold">Could not load articles from the database</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">{loadError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100">
            Articles
          </h1>
          <p className="text-slate-600 dark:text-purple-300 mt-1">
            Manage content. Toggle Featured, Expert Pick, Trending, Popular Guide per article.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-accent-600 text-white px-4 py-2 rounded-xl font-bold hover:from-purple-700 hover:to-accent-700 transition-all shrink-0"
        >
          <Plus className="h-5 w-5" />
          New Article
        </Link>
      </div>

      <div className="rounded-2xl bg-white dark:bg-dark-800/50 border border-slate-200 dark:border-purple-500/30 overflow-hidden">
        <AdminFilterBar
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
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-dark-100 mb-2">
              {q || category || status ? "No matching articles" : "No articles yet"}
            </h3>
            <p className="text-slate-600 dark:text-purple-300 mb-6">
              {q || category || status
                ? "Try different filters."
                : "Add your first article in Supabase."}
            </p>
            {(q || category || status) && (
              <Link
                href="/admin/articles"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors text-sm"
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
  );
}
