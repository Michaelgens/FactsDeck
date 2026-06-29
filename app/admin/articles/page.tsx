import { Suspense } from "react";
import { getAllPostsWithLoadError } from "../../lib/posts";
import { computeArticleListStats } from "../../lib/article-list-stats";
import AdminArticlesExperience from "./AdminArticlesExperience";

function ArticlesLoadingFallback() {
  return (
    <div className="py-16 text-center text-sm text-slate-500 dark:text-zinc-400">Loading articles…</div>
  );
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; limit?: string; status?: string }>;
}) {
  await searchParams;
  const { posts, loadError } = await getAllPostsWithLoadError();
  const stats = computeArticleListStats(posts);

  return (
    <Suspense fallback={<ArticlesLoadingFallback />}>
      <AdminArticlesExperience initialPosts={posts} initialLoadError={loadError} initialStats={stats} />
    </Suspense>
  );
}
