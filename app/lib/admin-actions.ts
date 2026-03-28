"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";

export type PostFormData = {
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  contentUrl: string;
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

  // @ts-expect-error - Supabase Update type inference issue with partial payload
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

  const supabase = createServerClient();
  const row = {
    id,
    title: data.title.trim() || "Untitled",
    excerpt: data.excerpt.trim() || "",
    category: data.category.trim() || "General",
    image_url: data.imageUrl.trim() || "/placeholder.svg",
    content: null,
    content_url: data.contentUrl?.trim() || null,
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

  const { error } = await supabase.from("posts").insert(row as never);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, id };
}

export async function updatePost(
  id: string,
  data: PostFormData
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };

  const supabase = createServerClient();
  const contentUrlTrimmed = data.contentUrl?.trim() || null;
  const row: Record<string, unknown> = {
    title: data.title.trim() || "Untitled",
    excerpt: data.excerpt.trim() || "",
    category: data.category.trim() || "General",
    image_url: data.imageUrl.trim() || "/placeholder.svg",
    content: contentUrlTrimmed ? null : undefined,
    content_url: contentUrlTrimmed,
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
  if (row.content === undefined) delete row.content;
  if (!contentUrlTrimmed) delete row.content_url;

  const { error } = await supabase.from("posts").update(row as never).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
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
  return { ok: true };
}
