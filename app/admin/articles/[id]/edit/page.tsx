import { notFound } from "next/navigation";
import { getPostById } from "../../../../lib/posts";
import PostForm from "../../PostForm";

export default async function AdminEditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100 mb-2">
        Edit Article
      </h1>
      <p className="text-slate-600 dark:text-purple-300 mb-8">
        Update content and metadata. Use an MD file URL from Vercel Blob for the article body.
      </p>
      <PostForm mode="edit" post={post} />
    </div>
  );
}
