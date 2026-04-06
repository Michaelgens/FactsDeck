import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPostById,
  getPostContent,
  getPartitionedPosts,
  getCategoriesWithCounts,
  getRelatedPosts,
} from "../../../../lib/posts";
import { requireAdmin } from "../../../../lib/admin-auth";
import PostPageView from "../../../../components/PostPageView";
import { siteTools } from "../../../../lib/site-config";
import { pickDailyTools } from "../../../../lib/tools-utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Article preview | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const [content, partitioned, categoriesWithCounts, relatedPosts] = await Promise.all([
    getPostContent(post.content, post.contentUrl),
    getPartitionedPosts(post.id),
    getCategoriesWithCounts(),
    getRelatedPosts(post.id, post.categories, post.tags, 12),
  ]);

  const sidebarTools = pickDailyTools(siteTools, 5, `admin-preview-${post.id}`);

  return (
    <PostPageView
      article={post}
      content={content}
      trendingPosts={partitioned.trending}
      guidePosts={partitioned.guides}
      relatedPosts={relatedPosts}
      categoriesWithCounts={categoriesWithCounts}
      sidebarTools={sidebarTools}
      adminPreview={{ editHref: `/admin/articles/${id}/edit` }}
    />
  );
}
