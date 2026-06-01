import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPostById,
  getPostContent,
  getPublishedPosts,
  getRelatedPosts,
  partitionPostsBySection,
} from "../../../../lib/posts";
import {
  READ_MORE_MAX,
  RELATED_CAROUSEL_MAX,
  SIDEBAR_RAIL_MAX,
  getTopPicksPosts,
  sortByPublishDateDesc,
  sortByViewsDesc,
} from "../../../../lib/post-feeds";
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

  const content = await getPostContent(post.content, post.contentUrl);

  const published = await getPublishedPosts();
  const partitioned = partitionPostsBySection(published, post.id);
  const popularPosts = sortByViewsDesc(published.filter((p) => p.id !== post.id)).slice(
    0,
    SIDEBAR_RAIL_MAX
  );
  const topPicksPosts = getTopPicksPosts(partitioned, SIDEBAR_RAIL_MAX);
  const relatedPosts = await getRelatedPosts(
    post.id,
    post.categories,
    post.tags,
    RELATED_CAROUSEL_MAX
  );
  const readMorePosts = sortByPublishDateDesc(partitioned.latest).slice(0, READ_MORE_MAX);

  const sidebarTools = pickDailyTools(siteTools, 5, `admin-preview-${post.id}`);

  return (
    <PostPageView
      article={post}
      content={content}
      sidebarTools={sidebarTools}
      popularPosts={popularPosts}
      topPicksPosts={topPicksPosts}
      relatedPosts={relatedPosts}
      readMorePosts={readMorePosts}
      adminPreview={{ editHref: `/admin/articles/${id}/edit` }}
    />
  );
}
