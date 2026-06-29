import { partitionPostsBySection } from "./posts";
import type { Post } from "./types";

export type ArticleListStats = {
  total: number;
  published: number;
  hidden: number;
  featured: number;
  expertPicks: number;
};

export function computeArticleListStats(posts: Post[]): ArticleListStats {
  const publishedPosts = posts.filter((p) => p.published);
  const partitioned = partitionPostsBySection(publishedPosts);

  return {
    total: posts.length,
    published: publishedPosts.length,
    hidden: posts.length - publishedPosts.length,
    featured: partitioned.featured.length,
    expertPicks: partitioned.expertPicks.length,
  };
}
