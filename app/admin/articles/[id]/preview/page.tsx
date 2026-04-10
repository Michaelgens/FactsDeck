import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostById, getPostContent } from "../../../../lib/posts";
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

  const sidebarTools = pickDailyTools(siteTools, 5, `admin-preview-${post.id}`);

  return (
    <PostPageView
      article={post}
      content={content}
      sidebarTools={sidebarTools}
      adminPreview={{ editHref: `/admin/articles/${id}/edit` }}
    />
  );
}
