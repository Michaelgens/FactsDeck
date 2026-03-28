import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import type { Post, PostSummary } from "./types";

function rowToPost(row: Record<string, unknown>): Post {
  return {
    id: String(row.id),
    title: String(row.title),
    excerpt: String(row.excerpt),
    category: String(row.category),
    image: String(row.image_url),
    contentUrl: (row.content_url as string) || null,
    content: (row.content as string) || null,
    author: {
      name: String(row.author_name),
      title: String(row.author_title),
      image: String(row.author_image),
      bio: row.author_bio ? String(row.author_bio) : undefined,
      followers: row.author_followers ? String(row.author_followers) : undefined,
      articles: row.author_articles != null ? Number(row.author_articles) : undefined,
    },
    publishDate: String(row.publish_date),
    readTime: String(row.read_time),
    views: String(row.views),
    likes: Number(row.likes) ?? 0,
    bookmarks: Number(row.bookmarks) ?? 0,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    featured: Boolean(row.featured),
    expertPicks: Boolean(row.expert_picks),
    trending: Boolean(row.trending),
    guides: Boolean(row.guides),
    createdAt: String(row.created_at),
  };
}

/** Latest articles: sorted by publish_date descending (newest first) */
export async function getLatestPosts(limit = 50): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("publish_date", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[getLatestPosts]", error.message, error.code);
    return [];
  }
  return (data || []).map(rowToPost);
}

/** Featured articles */
export async function getFeaturedPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("featured", true)
    .order("publish_date", { ascending: false });
  if (error) {
    console.error("[getFeaturedPosts]", error.message, error.code);
    return [];
  }
  return (data || []).map(rowToPost);
}

/** Expert picks */
export async function getExpertPickPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("expert_picks", true)
    .order("publish_date", { ascending: false });
  if (error) {
    console.error("[getExpertPickPosts]", error.message, error.code);
    return [];
  }
  return (data || []).map(rowToPost);
}

/** Trending posts */
export async function getTrendingPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("trending", true)
    .order("publish_date", { ascending: false });
  if (error) {
    console.error("[getTrendingPosts]", error.message, error.code);
    return [];
  }
  return (data || []).map(rowToPost);
}

/** Popular guides */
export async function getGuidePosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("guides", true)
    .order("publish_date", { ascending: false });
  if (error) {
    console.error("[getGuidePosts]", error.message, error.code);
    return [];
  }
  return (data || []).map(rowToPost);
}

export type PartitionedPosts = {
  featured: Post[];
  latest: Post[];
  expertPicks: Post[];
  trending: Post[];
  guides: Post[];
};

/**
 * Partition posts into sections with no duplicates.
 * Each post appears in exactly one section based on priority:
 * Featured > Expert Picks > Trending > Popular Guides > Latest
 * Optionally exclude a post (e.g. current article on single post page)
 */
export function partitionPostsBySection(
  posts: Post[],
  excludeId?: string
): PartitionedPosts {
  const filtered = excludeId ? posts.filter((p) => p.id !== excludeId) : posts;
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  const featured: Post[] = [];
  const expertPicks: Post[] = [];
  const trending: Post[] = [];
  const guides: Post[] = [];
  const latest: Post[] = [];
  const assigned = new Set<string>();

  for (const post of sorted) {
    if (assigned.has(post.id)) continue;
    if (post.featured) {
      featured.push(post);
      assigned.add(post.id);
    } else if (post.expertPicks) {
      expertPicks.push(post);
      assigned.add(post.id);
    } else if (post.trending) {
      trending.push(post);
      assigned.add(post.id);
    } else if (post.guides) {
      guides.push(post);
      assigned.add(post.id);
    } else {
      latest.push(post);
      assigned.add(post.id);
    }
  }

  return { featured, latest, expertPicks, trending, guides };
}

/** Fetch all posts and return partitioned sections (no duplicates) */
export async function getPartitionedPosts(
  excludeId?: string
): Promise<PartitionedPosts> {
  const all = await getAllPosts();
  return partitionPostsBySection(all, excludeId);
}

/** All posts (for filtering by type/category/search) */
export async function getAllPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("publish_date", { ascending: false });
  if (error) {
    console.error("[getAllPosts]", error.message, error.code);
    return [];
  }
  return (data || []).map(rowToPost);
}

/** Get single post by id */
export async function getPostById(id: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
  if (error) {
    console.error("[getPostById]", error.message, error.code);
    return null;
  }
  if (!data) return null;
  return rowToPost(data);
}

/** Related articles: same category or recent, sorted by publish_date (newest first), excluding current id */
export async function getRelatedPosts(
  currentId: string,
  category: string,
  limit = 3
): Promise<PostSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, excerpt, category, image_url, read_time, publish_date, author_name, author_title, author_image, views, likes, tags")
    .neq("id", currentId)
    .order("publish_date", { ascending: false })
    .limit(limit * 2); // fetch extra in case we want category preference
  if (error) {
    console.error("[getRelatedPosts]", error.message, error.code);
    return [];
  }
  const rows = (data || []) as Array<Record<string, unknown>>;
  const posts = rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    excerpt: String(r.excerpt),
    category: String(r.category),
    image: String(r.image_url),
    readTime: String(r.read_time),
    publishDate: String(r.publish_date),
    author: { name: String(r.author_name), title: String(r.author_title), image: String(r.author_image) },
    views: String(r.views),
    likes: Number(r.likes),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
  }));
  const sameCategory = posts.filter((p) => p.category === category);
  const others = posts.filter((p) => p.category !== category);
  return [...sameCategory, ...others].slice(0, limit) as PostSummary[];
}

const MIN_CATEGORIES_DISPLAY = 4;

/** Categories with article counts from Supabase. Always returns at least 4 categories. */
export type CategoryWithCount = {
  name: string;
  count: string;
  color: string;
  iconKey: string;
};

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const { defaultCategories } = await import("./site-config");
  if (!isSupabaseConfigured()) return [...defaultCategories];
  const supabase = createServerClient();
  const { data, error } = await supabase.from("posts").select("category");
  if (error) {
    console.error("[getCategoriesWithCounts]", error.message, error.code);
    return [...defaultCategories];
  }
  const rows = (data || []) as Array<{ category: string }>;
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const c = String(r?.category || "").trim();
    if (c) counts[c] = (counts[c] || 0) + 1;
  }
  const withArticles = Object.entries(counts).filter(([, n]) => n >= 1);

  const { categories } = await import("./site-config");
  const metaMap = new Map(categories.map((c) => [c.name, c]));
  const fallbackColor = "from-purple-500 to-purple-600";
  const fallbackIcon = "BookOpen";

  const result: CategoryWithCount[] = withArticles
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => {
      const m = metaMap.get(name);
      return {
        name,
        count: `${n} Article${n !== 1 ? "s" : ""}`,
        color: m?.color ?? fallbackColor,
        iconKey: m?.iconKey ?? fallbackIcon,
      };
    });

  // Ensure minimum of 4 categories: pad with default categories not already shown
  if (result.length < MIN_CATEGORIES_DISPLAY) {
    const existingNames = new Set(result.map((c) => c.name));
    for (const def of defaultCategories) {
      if (result.length >= MIN_CATEGORIES_DISPLAY) break;
      if (!existingNames.has(def.name)) {
        result.push({ ...def });
        existingNames.add(def.name);
      }
    }
  }

  return result;
}

/** Get post content: prefer content_url (MD file), else inline content (legacy) */
export async function getPostContent(
  content: string | null | undefined,
  contentUrl: string | null
): Promise<string> {
  if (contentUrl && contentUrl.trim()) {
    try {
      const res = await fetch(contentUrl);
      if (res.ok) return await res.text();
    } catch {
      /* fall through to legacy content */
    }
  }
  if (content && content.trim()) return content;
  return "";
}
