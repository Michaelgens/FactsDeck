import { unstable_noStore as noStore } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import { logSupabaseReadError, readErrorMessage } from "./supabase-read-errors";
import type { Post, PostSummary } from "./types";
import { isUuid } from "./slug";

function decodeSlugParam(slug: string): string {
  try {
    return decodeURIComponent(slug).trim();
  } catch {
    return slug.trim();
  }
}

/** Normalize path segment for DB lookup (hyphens, trim, optional /post/ prefix). */
export function normalizeSlugParam(param: string): string {
  let s = decodeSlugParam(param);
  s = s.replace(/^\/+/, "");
  if (/^post\//i.test(s)) s = s.slice(5);
  s = s.replace(/[\u2010\u2011\u2012\u2013\u2014\u2212\uFE63\uFF0D]/g, "-");
  return s.normalize("NFC").trim();
}

function normalizeCategories(row: Record<string, unknown>): string[] {
  const raw = row.categories;
  if (Array.isArray(raw) && raw.length > 0) {
    return (raw as unknown[]).map((c) => String(c).trim()).filter(Boolean);
  }
  return ["General"];
}

function rowToPost(row: Record<string, unknown>): Post {
  return {
    id: String(row.id),
    slug: row.slug != null && String(row.slug).trim() ? String(row.slug).trim() : null,
    title: String(row.title),
    excerpt: String(row.excerpt),
    categories: normalizeCategories(row),
    published: row.published === false || row.published === 0 ? false : true,
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
    .eq("published", true)
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
    .eq("published", true)
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
    .eq("published", true)
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
    .eq("published", true)
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
    .eq("published", true)
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

/** Published posts only — used for homepage & article listings */
export async function getPublishedPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("publish_date", { ascending: false });
  if (error) {
    console.error("[getPublishedPosts]", error.message, error.code);
    return [];
  }
  return (data || []).map(rowToPost);
}

/** Fetch published posts and return partitioned sections (no duplicates) */
export async function getPartitionedPosts(
  excludeId?: string
): Promise<PartitionedPosts> {
  const all = await getPublishedPosts();
  return partitionPostsBySection(all, excludeId);
}

async function getAllPostsInternal(): Promise<{ posts: Post[]; loadError: string | null }> {
  if (!isSupabaseConfigured()) {
    return { posts: [], loadError: null };
  }
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("publish_date", { ascending: false });
    if (error) {
      logSupabaseReadError("getAllPosts", error);
      return { posts: [], loadError: readErrorMessage(error) };
    }
    return { posts: (data || []).map(rowToPost), loadError: null };
  } catch (e) {
    logSupabaseReadError("getAllPosts", e);
    return { posts: [], loadError: readErrorMessage(e) };
  }
}

/** All posts (for filtering by type/category/search) */
export async function getAllPosts(): Promise<Post[]> {
  const { posts } = await getAllPostsInternal();
  return posts;
}

/**
 * Same data as {@link getAllPosts}, plus a user-facing message when the DB cannot be reached
 * (e.g. `TypeError: fetch failed`) or Supabase returns an error. Use in admin UI.
 */
export async function getAllPostsWithLoadError(): Promise<{
  posts: Post[];
  loadError: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return {
      posts: [],
      loadError:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to .env.local.",
    };
  }
  return getAllPostsInternal();
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

/** Get single post by URL slug (SEO path segment) */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) return null;
  const normalized = normalizeSlugParam(slug);
  if (!normalized) return null;
  const supabase = createServerClient();

  const { data: rpcRows, error: rpcError } = await supabase.rpc("get_post_by_slug", {
    p_slug: normalized,
  });
  if (!rpcError && rpcRows && rpcRows.length > 0) {
    return rowToPost(rpcRows[0] as Record<string, unknown>);
  }
  if (rpcError) {
    console.warn("[getPostBySlug] rpc unavailable, using filters:", rpcError.message);
  }

  const { data, error } = await supabase.from("posts").select("*").eq("slug", normalized).maybeSingle();
  if (error) {
    console.error("[getPostBySlug]", error.message, error.code);
    return null;
  }
  if (data) return rowToPost(data);

  const { data: ilikeRow, error: ilikeErr } = await supabase
    .from("posts")
    .select("*")
    .ilike("slug", normalized)
    .maybeSingle();
  if (ilikeErr) {
    console.error("[getPostBySlug ilike]", ilikeErr.message, ilikeErr.code);
    return null;
  }
  if (ilikeRow) return rowToPost(ilikeRow);

  return null;
}

/** Resolve route param: UUID → by id; otherwise by slug. Public routes only — unpublished posts return null. */
export async function getPostBySlugOrId(param: string): Promise<Post | null> {
  noStore();
  const raw = typeof param === "string" ? param : "";
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const post = isUuid(trimmed) ? await getPostById(trimmed) : await getPostBySlug(trimmed);
  if (!post || !post.published) return null;
  return post;
}

function normalizeTagsForMatch(tags: string[] | undefined): Set<string> {
  const s = new Set<string>();
  for (const t of tags ?? []) {
    const n = String(t).trim().toLowerCase();
    if (n) s.add(n);
  }
  return s;
}

function sharedTagCount(postTags: string[], current: Set<string>): number {
  let n = 0;
  for (const t of postTags) {
    const k = String(t).trim().toLowerCase();
    if (k && current.has(k)) n++;
  }
  return n;
}

function sharesAnyCategory(postCats: string[], currentCats: string[]): boolean {
  const set = new Set(currentCats.map((c) => c.trim()).filter(Boolean));
  return postCats.some((c) => set.has(String(c).trim()));
}

/** Related articles: shared tag(s) first, then overlapping category, then other recent posts (newest first within each tier). */
export async function getRelatedPosts(
  currentId: string,
  currentCategories: string[],
  currentTags: string[] | undefined,
  limit = 3
): Promise<PostSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createServerClient();
  const pool = Math.min(150, Math.max(limit * 20, 60));
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, categories, image_url, read_time, publish_date, author_name, author_title, author_image, views, likes, tags"
    )
    .eq("published", true)
    .neq("id", currentId)
    .order("publish_date", { ascending: false })
    .limit(pool);
  if (error) {
    console.error("[getRelatedPosts]", error.message, error.code);
    return [];
  }
  const rows = (data || []) as Array<Record<string, unknown>>;
  const posts = rows.map((r) => ({
    id: String(r.id),
    slug: r.slug != null && String(r.slug).trim() ? String(r.slug).trim() : null,
    title: String(r.title),
    excerpt: String(r.excerpt),
    categories: normalizeCategories(r),
    image: String(r.image_url),
    readTime: String(r.read_time),
    publishDate: String(r.publish_date),
    author: { name: String(r.author_name), title: String(r.author_title), image: String(r.author_image) },
    views: String(r.views),
    likes: Number(r.likes),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
  })) as PostSummary[];

  const currentSet = normalizeTagsForMatch(currentTags);
  const cats = currentCategories?.length ? currentCategories : ["General"];
  const byDateDesc = (a: PostSummary, b: PostSummary) =>
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();

  const tier1 = posts
    .filter((p) => sharedTagCount(p.tags, currentSet) > 0)
    .sort(byDateDesc);
  const tier2 = posts
    .filter(
      (p) =>
        sharedTagCount(p.tags, currentSet) === 0 && sharesAnyCategory(p.categories, cats)
    )
    .sort(byDateDesc);
  const tier3 = posts
    .filter(
      (p) =>
        sharedTagCount(p.tags, currentSet) === 0 && !sharesAnyCategory(p.categories, cats)
    )
    .sort(byDateDesc);

  const out: PostSummary[] = [];
  const seen = new Set<string>();
  for (const tier of [tier1, tier2, tier3]) {
    for (const p of tier) {
      if (out.length >= limit) break;
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
    if (out.length >= limit) break;
  }
  return out;
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
  const { data, error } = await supabase.from("posts").select("categories").eq("published", true);
  if (error) {
    console.error("[getCategoriesWithCounts]", error.message, error.code);
    return [...defaultCategories];
  }
  const rows = (data || []) as Array<{ categories: string[] | null }>;
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const arr = Array.isArray(r.categories) ? r.categories : [];
    for (const raw of arr) {
      const c = String(raw || "").trim();
      if (c) counts[c] = (counts[c] || 0) + 1;
    }
  }
  const withArticles = Object.entries(counts).filter(([, n]) => n >= 1);

  const { categories } = await import("./site-config");
  const metaMap = new Map(categories.map((c) => [c.name, c]));
  const fallbackColor = "from-zinc-800 to-zinc-900";
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

function resolveContentAbsoluteUrl(url: string): string {
  const siteBase =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!siteBase) return url;
  return `${siteBase.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}

/**
 * Private Vercel Blob URLs (*.private.blob.vercel-storage.com) return 403 to plain fetch.
 * Use @vercel/blob get() with BLOB_READ_WRITE_TOKEN (set on Vercel when the store is linked).
 */
async function fetchMarkdownFromUrl(absoluteUrl: string): Promise<string | null> {
  const isPrivateVercelBlob = absoluteUrl.includes("private.blob.vercel-storage.com");
  if (isPrivateVercelBlob) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn(
        "[getPostContent] Private blob URL needs BLOB_READ_WRITE_TOKEN in env, or use a public URL (*.public.blob.vercel-storage.com).",
        absoluteUrl
      );
      return null;
    }
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(absoluteUrl, { access: "private", useCache: false });
      if (result?.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text();
        if (text.trim()) return text;
      }
    } catch (e) {
      console.error("[getPostContent] @vercel/blob get failed", absoluteUrl, e);
    }
    return null;
  }

  try {
    const res = await fetch(absoluteUrl, {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: { Accept: "text/markdown, text/plain, */*" },
    });
    if (res.ok) {
      const text = await res.text();
      if (text.trim()) return text;
    } else {
      const hint =
        res.status === 403 && absoluteUrl.includes("blob.vercel-storage.com")
          ? " (private blob: set BLOB_READ_WRITE_TOKEN or use a public blob URL)"
          : "";
      console.error("[getPostContent] HTTP", res.status, absoluteUrl + hint);
    }
  } catch (e) {
    console.error("[getPostContent] fetch failed", absoluteUrl, e);
  }
  return null;
}

/** Get post content: prefer content_url (MD file), else inline content (legacy) */
export async function getPostContent(
  content: string | null | undefined,
  contentUrl: string | null
): Promise<string> {
  if (contentUrl && contentUrl.trim()) {
    const url = contentUrl.trim();
    try {
      const absoluteUrl = resolveContentAbsoluteUrl(url);
      const remote = await fetchMarkdownFromUrl(absoluteUrl);
      if (remote) return remote;
    } catch (e) {
      console.error("[getPostContent] failed", url, e);
    }
  }
  if (content && content.trim()) return content;
  return "";
}
