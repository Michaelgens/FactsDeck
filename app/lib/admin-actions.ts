"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminForAction } from "./admin-auth";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import { slugify } from "./slug";
import { postPublicPath } from "./post-url";
import { getPostById } from "./posts";
import type { ArticlePoll } from "./poll-types";
import {
  mergePollServerFields,
  serializePollForDb,
  validatePollForAdmin,
} from "./poll-types";
import type { ArticleQuiz } from "./quiz-types";
import {
  mergeQuizServerFields,
  serializeQuizForDb,
  validateQuizForAdmin,
} from "./quiz-types";

export type PostFormData = {
  title: string;
  excerpt: string;
  categories: string[];
  /** false = hidden / not published on the public site */
  published: boolean;
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
  poll?: ArticlePoll | null;
  quiz?: ArticleQuiz | null;
};

export type PostFlags = {
  featured?: boolean;
  expert_picks?: boolean;
  trending?: boolean;
  guides?: boolean;
};

function engagementValidationError(data: PostFormData): string | null {
  const pollErrors = validatePollForAdmin(data.poll ?? null);
  if (pollErrors.length) return pollErrors[0];
  const quizErrors = validateQuizForAdmin(data.quiz ?? null);
  if (quizErrors.length) return quizErrors[0];
  return null;
}

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
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;

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
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;

  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };

  const engagementError = engagementValidationError(data);
  if (engagementError) return { ok: false, error: engagementError };

  const crypto = await import("crypto");
  const id = crypto.randomUUID();

  const contentUrl = data.contentUrl?.trim() || null;
  const body = data.bodyMarkdown?.trim() || null;
  const inlineContent = !contentUrl && body ? body : null;

  const baseSlug = slugify(data.slug?.trim() || data.title);
  const slug = await ensureUniqueSlug(baseSlug);

  const supabase = createServerClient();
  const categories =
    Array.isArray(data.categories) && data.categories.length > 0
      ? data.categories.map((c) => c.trim()).filter(Boolean)
      : ["General"];

  const row = {
    id,
    slug,
    title: data.title.trim() || "Untitled",
    excerpt: data.excerpt.trim() || "",
    categories,
    published: Boolean(data.published),
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
    poll: serializePollForDb(data.poll),
    quiz: serializeQuizForDb(data.quiz),
  };

  const { error } = await supabase.from("posts").insert(row);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}/preview`);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/post");
  revalidatePath(postPublicPath({ id, slug }));
  revalidatePath("/admin/articles/content");
  revalidatePath("/admin/articles/quiz-metrics");
  return { ok: true, id };
}

export async function updatePost(
  id: string,
  data: PostFormData
): Promise<{ ok: boolean; error?: string }> {
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;

  if (!isSupabaseConfigured()) return { ok: false, error: "Supabase not configured" };

  const engagementError = engagementValidationError(data);
  if (engagementError) return { ok: false, error: engagementError };

  const contentUrl = data.contentUrl?.trim() || null;
  const body = data.bodyMarkdown?.trim() || null;

  const baseSlug = slugify(data.slug?.trim() || data.title);
  const slug = await ensureUniqueSlug(baseSlug, id);

  const supabase = createServerClient();
  const { data: existingRow } = await supabase
    .from("posts")
    .select("poll, quiz")
    .eq("id", id)
    .maybeSingle();

  const categories =
    Array.isArray(data.categories) && data.categories.length > 0
      ? data.categories.map((c) => c.trim()).filter(Boolean)
      : ["General"];

  const row: Record<string, unknown> = {
    slug,
    title: data.title.trim() || "Untitled",
    excerpt: data.excerpt.trim() || "",
    categories,
    published: Boolean(data.published),
    image_url: data.imageUrl.trim() || "/placeholder.svg",
    content_url: contentUrl,
    author_name: data.authorName.trim() || "Anonymous",
    author_title: data.authorTitle.trim() || "Writer",
    author_image: data.authorImage.trim() || "https://api.dicebear.com/9.x/avataaars/svg?seed=author",
    author_bio: data.authorBio?.trim() || null,
    author_followers: data.authorFollowers?.trim() || null,
    author_articles: data.authorArticles ?? null,
    /** Refresh listing date on every save so edited articles surface as latest. */
    publish_date: new Date().toISOString(),
    read_time: data.readTime.trim() || "5 min read",
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: Boolean(data.featured),
    expert_picks: Boolean(data.expertPicks),
    trending: Boolean(data.trending),
    guides: Boolean(data.guides),
    poll: mergePollServerFields(serializePollForDb(data.poll), existingRow?.poll),
    quiz: mergeQuizServerFields(serializeQuizForDb(data.quiz), existingRow?.quiz),
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
  revalidatePath(`/admin/articles/${id}/preview`);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/post");
  revalidatePath(postPublicPath({ id, slug }));
  revalidatePath(`/post/${id}`);
  revalidatePath("/admin/articles/content");
  revalidatePath("/admin/articles/quiz-metrics");
  return { ok: true };
}

export async function setPostPublished(
  id: string,
  published: boolean
): Promise<{ ok: boolean; error?: string }> {
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase not configured" };
  }
  const supabase = createServerClient();
  const { error } = await supabase.from("posts").update({ published }).eq("id", id);
  if (error) {
    console.error("[setPostPublished]", error.message);
    return { ok: false, error: error.message };
  }
  const p = await getPostById(id);
  if (p) {
    revalidatePath(postPublicPath(p));
    revalidatePath(`/post/${id}`);
  }
  revalidatePath(`/admin/articles/${id}/preview`);
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/post");
  return { ok: true };
}

export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  const auth = await verifyAdminForAction();
  if (!auth.ok) return auth;

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
