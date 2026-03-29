"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import { slugify } from "./slug";
import { postPublicPath } from "./post-url";

export type PostFormData = {
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  contentUrl: string;
  /** Paste Markdown here when not using a hosted .md URL */
  bodyMarkdown?: string;
  /** Optional URL segment; auto-generated from title if empty */
  slug?: string;
  authorName: string;
  authorTitle: string;
  authorImage: string;
  authorBio?: string;
  authorFollowers?: string;
  authorArticles?: number;
  readTime: string;
  tags: string[];
  featured: boolean;
  expertPicks: boolean;
  trending: boolean;
  guides: boolean;
};

export type PostFlags = {
  featured?: boolean;
  expert_picks?: boolean;
  trending?: boolean;
  guides?: boolean;
};

async function ensureUniqueSlug(base: string, excludePostId?: string): Promise<string> {
  const supabase = createServerClient();
  const b = base || "article";
  for (let n = 0; n < 500; n++) {
    const candidate = n === 0 ? b : `${b}-${n}`;
    const { data } = await supabase.from("posts").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    if (excludePostId && data.id === excludePostId) return candidate;
  }
  return `${b}-${Date.now()}`;
}

export async function updatePostFlags(
  id: string,
  flags: PostFlags
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase not configured" };
  }
  const supabase = createServerClient();
  const payload: { featured?: boolean; expert_picks?: boolean; trending?: boolean; guides?: boolean } = {};
  if (typeof flags.featured === "boolean") payload.featured = flags.featured;
  if (typeof flags.expert_picks === "boolean") payload.expert_picks = flags.expert_picks;
  if (typeof flags.trending === "boolean") payload.trending = flags.trending;
  if (typeof flags.guides === "boolean") payload.guides = flags.guides;
  if (Object.keys(payload).length === 0) return { ok: true };

  const { error } = await supabase.from("posts").update(payload).eq("id", id);

  if (error) {
    console.error("[updatePostFlags]", error.message);
    return { ok: false, error: error.message };
  }
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function createPost(
  data: PostFormData
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const crypto = await import("crypto");
  const id = crypto.randomUUID();

  const contentUrl = data.contentUrl?.trim() || null;
  const body = data.bodyMarkdown?.trim() || null;
  const inlineContent = !contentUrl && body ? body : null;

  const baseSlug = slugify(data.slug?.trim() || data.title);
  const slug = await ensureUniqueSlug(baseSlug);

  const supabase = createServerClient();
  const row = {
    id,
    slug,
    title: data.title.trim() || "Untitled",
    excerpt: data.excerpt.trim() || "",
    category: data.category.trim() || "General",
    image_url: data.imageUrl.trim() || "/placeholder.svg",
    content: inlineContent,
    content_url: contentUrl,
    author_name: data.authorName.trim() || "Anonymous",
    author_title: data.authorTitle.trim() || "Writer",
    author_image: data.authorImage.trim() || "https://api.dicebear.com/9.x/avataaars/svg?seed=author",
    author_bio: data.authorBio?.trim() || null,
    author_followers: data.authorFollowers?.trim() || null,
    author_articles: data.authorArticles ?? null,
    publish_date: new Date().toISOString(),
    read_time: data.readTime.trim() || "5 min read",
    views: "0",
    likes: 0,
    bookmarks: 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: Boolean(data.featured),
    expert_picks: Boolean(data.expertPicks),
    trending: Boolean(data.trending),
    guides: Boolean(data.guides),
  };

  const { error } = await supabase.from("posts").insert(row);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/post");
  revalidatePath(postPublicPath({ id, slug }));
  return { ok: true, id };
}

export async function updatePost(
  id: string,
  data: PostFormData
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };

  const contentUrl = data.contentUrl?.trim() || null;
  const body = data.bodyMarkdown?.trim() || null;

  const baseSlug = slugify(data.slug?.trim() || data.title);
  const slug = await ensureUniqueSlug(baseSlug, id);

  const supabase = createServerClient();
  const row: Record<string, unknown> = {
    slug,
    title: data.title.trim() || "Untitled",
    excerpt: data.excerpt.trim() || "",
    category: data.category.trim() || "General",
    image_url: data.imageUrl.trim() || "/placeholder.svg",
    content_url: contentUrl,
    author_name: data.authorName.trim() || "Anonymous",
    author_title: data.authorTitle.trim() || "Writer",
    author_image: data.authorImage.trim() || "https://api.dicebear.com/9.x/avataaars/svg?seed=author",
    author_bio: data.authorBio?.trim() || null,
    author_followers: data.authorFollowers?.trim() || null,
    author_articles: data.authorArticles ?? null,
    read_time: data.readTime.trim() || "5 min read",
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: Boolean(data.featured),
    expert_picks: Boolean(data.expertPicks),
    trending: Boolean(data.trending),
    guides: Boolean(data.guides),
  };

  if (contentUrl) {
    row.content = null;
  } else if (body) {
    row.content = body;
  } else {
    row.content = null;
  }

  const { error } = await supabase.from("posts").update(row).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/post");
  revalidatePath(postPublicPath({ id, slug }));
  revalidatePath(`/post/${id}`);
  return { ok: true };
}

export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };
  const supabase = createServerClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/post");
  return { ok: true };
}
