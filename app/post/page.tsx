import { Suspense } from "react";
import { getPartitionedPosts, getCategoriesWithCounts } from "../lib/posts";
import PostListContent from "../components/PostListContent";

export const metadata = {
  title: "Articles | Facts Deck",
  description: "Browse our latest articles, guides, and expert picks on investing, banking, and personal finance.",
};

export default async function PostListPage() {
  const [partitioned, categoriesWithCounts] = await Promise.all([
    getPartitionedPosts(),
    getCategoriesWithCounts(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-purple-300">
          Loading...
        </div>
      }
    >
      <PostListContent
        partitioned={partitioned}
        categoriesWithCounts={categoriesWithCounts}
      />
    </Suspense>
  );
}
