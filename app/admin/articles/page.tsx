import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { getAllPosts } from "../../lib/posts";
import AdminArticleRow from "./AdminArticleRow";
import AdminFilterBar from "../components/AdminFilterBar";
import AdminPagination from "../components/AdminPagination";

const LIMITS = [10, 50, 100] as const;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = LIMITS.includes(Number(params.limit) as (typeof LIMITS)[number])
    ? Number(params.limit)
    : 10;

  const allPosts = await getAllPosts();

  const filtered = allPosts.filter((p) => {
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase());
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const totalCount = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  const categories = [...new Set(allPosts.map((p) => p.category))].sort();

  return (
    <div>
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
          searchPlaceholder="Search by title, excerpt, or category..."
          searchDefault={q}
          limit={limit}
          hasActiveFilters={!!(q || category)}
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
        />

        {paginated.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-dark-100 mb-2">
              {q || category ? "No matching articles" : "No articles yet"}
            </h3>
            <p className="text-slate-600 dark:text-purple-300 mb-6">
              {q || category
                ? "Try different filters."
                : "Add your first article in Supabase."}
            </p>
            {(q || category) && (
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
