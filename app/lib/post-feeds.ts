import type { Post, PostSummary } from "./types";
import type { PartitionedPosts } from "./posts";
import { categoryLabelList } from "./post-display";

export const SIDEBAR_RAIL_MAX = 20;
/** Home `/` — “Latest Articles” horizontal carousel */
export const HOME_LATEST_CAROUSEL_MAX = 40;
/** Post list `/post` — paginated “Latest articles” grid (per page) */
export const LATEST_ARTICLES_PAGE_SIZE = 32;
export const RELATED_CAROUSEL_MAX = 40;
/** Post detail — “Read more” grid */
export const READ_MORE_MAX = 32;

/** Home major coverage: sections × (1 hero + minors each) */
export const HOME_MAJOR_SECTIONS = 3;
export const HOME_MINORS_PER_SECTION = 4;
export const HOME_MAJOR_COVERAGE_MAX = HOME_MAJOR_SECTIONS * (1 + HOME_MINORS_PER_SECTION);

/** Post list editorial majors (compact + large stacks) */
export const POST_LIST_MAJOR_SECTIONS = 5;
export const POST_LIST_MINORS_PER_SECTION = 4;
export const POST_LIST_MAJOR_COVERAGE_MAX = POST_LIST_MAJOR_SECTIONS * (1 + POST_LIST_MINORS_PER_SECTION);

export const HOME_HEADLINE_LIST_MAX = 13;
export const HOME_POPULAR_RAIL_MAX = 5;
export const HOME_TOP_PICKS_MAX = 8;
export const LATEST_ANALYSIS_ITEMS_MAX = 6;

export type FeedArticle = Post | PostSummary;

export type MajorSection = {
  major: FeedArticle;
  minors: FeedArticle[];
};

export function parseViewCount(views: string | undefined): number {
  return parseInt(String(views ?? "0").replace(/[^0-9]/g, ""), 10) || 0;
}

export function sortByViewsDesc<T extends FeedArticle>(posts: T[]): T[] {
  return [...posts].sort((a, b) => parseViewCount(b.views) - parseViewCount(a.views));
}

export function sortByPublishDateDesc<T extends FeedArticle>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export function sortByPublishDateAsc<T extends FeedArticle>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
  );
}

export function dedupePostsById<T extends FeedArticle>(posts: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const p of posts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

export function flattenPartitioned(partitioned: PartitionedPosts): Post[] {
  return dedupePostsById([
    ...partitioned.featured,
    ...partitioned.expertPicks,
    ...partitioned.trending,
    ...partitioned.guides,
    ...partitioned.latest,
  ]);
}

export function postsForTabType(partitioned: PartitionedPosts, type: string): Post[] {
  switch (type) {
    case "featured":
      return partitioned.featured;
    case "expert-picks":
      return partitioned.expertPicks;
    case "guides":
      return partitioned.guides;
    case "trending":
      return partitioned.trending;
    default:
      return partitioned.latest;
  }
}

export function filterPostsBySearch<T extends FeedArticle>(posts: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return posts;
  return posts.filter((p) => {
    if (p.title.toLowerCase().includes(q)) return true;
    if ("excerpt" in p && p.excerpt?.toLowerCase().includes(q)) return true;
    if (categoryLabelList(p).some((c) => c.toLowerCase().includes(q))) return true;
    if ("tags" in p && (p.tags ?? []).some((t) => t.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function filterPostsByCategory<T extends FeedArticle>(posts: T[], category: string): T[] {
  if (!category || category === "All Categories") return posts;
  return posts.filter((p) => categoryLabelList(p).includes(category));
}

export function sortPosts<T extends FeedArticle>(posts: T[], sortBy: string): T[] {
  if (sortBy === "oldest") return sortByPublishDateAsc(posts);
  if (sortBy === "popular") return sortByViewsDesc(posts);
  return sortByPublishDateDesc(posts);
}

export function buildMajorSections(
  posts: FeedArticle[],
  sectionCount: number,
  minorsPerSection: number
): MajorSection[] {
  const sections: MajorSection[] = [];
  let i = 0;
  for (let s = 0; s < sectionCount && i < posts.length; s++) {
    const major = posts[i++];
    const minors: FeedArticle[] = [];
    for (let m = 0; m < minorsPerSection && i < posts.length; m++) {
      minors.push(posts[i++]);
    }
    sections.push({ major, minors });
  }
  return sections;
}

export function getTopPicksPosts(partitioned: PartitionedPosts, limit = SIDEBAR_RAIL_MAX): Post[] {
  return dedupePostsById([...partitioned.guides, ...partitioned.expertPicks]).slice(0, limit);
}

export function getAnalysisFeed(partitioned: PartitionedPosts): {
  featured: Post | null;
  items: Post[];
} {
  const pool = dedupePostsById([...partitioned.trending, ...partitioned.expertPicks, ...partitioned.featured]);
  if (pool.length === 0) return { featured: null, items: [] };
  return { featured: pool[0], items: pool.slice(1, 7) };
}

export function primaryCategoryLabel(article: FeedArticle): string {
  return categoryLabelList(article)[0] ?? "Article";
}
