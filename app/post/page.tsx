import type { Metadata } from "next";
import { Suspense } from "react";
import { getPartitionedPosts, getCategoriesWithCounts } from "../lib/posts";
import PostListContent from "../components/PostListContent";
import PostListLoading from "./loading";
import { siteTools } from "../lib/site-config";
import { pickDailyTools } from "../lib/tools-utils";
import { absoluteUrl } from "../lib/seo";

const canonical = absoluteUrl("/post");

const description =
  "Browse Facts Deck articles by section—latest, featured, expert picks, guides, and trending—with search, categories, and filters.";

export const metadata: Metadata = {
  title: { absolute: "Articles | Facts Deck" },
  description,
  alternates: { canonical },
  openGraph: {
    title: "Articles | Facts Deck",
    description,
    url: canonical,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles | Facts Deck",
    description,
  },
  robots: { index: true, follow: true },
};

export default async function PostListPage() {
  const [partitioned, categoriesWithCounts] = await Promise.all([
    getPartitionedPosts(),
    getCategoriesWithCounts(),
  ]);
  const sidebarTools = pickDailyTools(siteTools, 5, "post-list-sidebar");

  return (
    <Suspense fallback={<PostListLoading />}>
      <PostListContent
        partitioned={partitioned}
        categoriesWithCounts={categoriesWithCounts}
        sidebarTools={sidebarTools}
      />
    </Suspense>
  );
}
