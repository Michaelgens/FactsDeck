import { Suspense } from "react";
import { getPartitionedPosts, getCategoriesWithCounts } from "../lib/posts";
import PostListContent from "../components/PostListContent";
import PostListLoading from "./loading";

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
    <Suspense fallback={<PostListLoading />}>
      <PostListContent
        partitioned={partitioned}
        categoriesWithCounts={categoriesWithCounts}
      />
    </Suspense>
  );
}
