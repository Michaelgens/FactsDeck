"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import { getPostById } from "./posts";
import { postPublicPath } from "./post-url";

async function revalidatePostPage(postId: string) {
  const p = await getPostById(postId);
  if (p) revalidatePath(postPublicPath(p));
  else revalidatePath(`/post/${postId}`);
}

/** Increment view count when user visits a post. Idempotent per session (caller should guard). */
export async function incrementPostViews(
  postId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Database not configured" };
  const supabase = createServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("views")
    .eq("id", postId)
    .single();

  if (fetchError || !row) {
    console.error("[incrementPostViews]", fetchError?.message);
    return { ok: false, error: fetchError?.message ?? "Post not found" };
  }

  const current = parseInt(String(row.views || "0").replace(/[^0-9]/g, ""), 10) || 0;
  const newViews = String(current + 1);

  const { error } = await supabase
    .from("posts")
    .update({ views: newViews })
    .eq("id", postId);

  if (error) {
    console.error("[incrementPostViews]", error.message);
    return { ok: false, error: error.message };
  }

  await revalidatePostPage(postId);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  return { ok: true };
}

/** Increment likes. Returns new count. */
export async function incrementPostLikes(
  postId: string
): Promise<{ ok: boolean; likes?: number; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Database not configured" };
  const supabase = createServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("likes")
    .eq("id", postId)
    .single();

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Post not found" };
  }

  const current = Number(row.likes) || 0;
  const newLikes = current + 1;

  const { error } = await supabase
    .from("posts")
    .update({ likes: newLikes })
    .eq("id", postId);

  if (error) {
    console.error("[incrementPostLikes]", error.message);
    return { ok: false, error: error.message };
  }

  await revalidatePostPage(postId);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  return { ok: true, likes: newLikes };
}

/** Decrement likes. Returns new count. */
export async function decrementPostLikes(
  postId: string
): Promise<{ ok: boolean; likes?: number; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Database not configured" };
  const supabase = createServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("likes")
    .eq("id", postId)
    .single();

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Post not found" };
  }

  const current = Math.max(0, Number(row.likes) || 0);
  const newLikes = Math.max(0, current - 1);

  const { error } = await supabase
    .from("posts")
    .update({ likes: newLikes })
    .eq("id", postId);

  if (error) {
    console.error("[decrementPostLikes]", error.message);
    return { ok: false, error: error.message };
  }

  await revalidatePostPage(postId);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  return { ok: true, likes: newLikes };
}

/** Increment bookmarks. Returns new count. */
export async function incrementPostBookmarks(
  postId: string
): Promise<{ ok: boolean; bookmarks?: number; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Database not configured" };
  const supabase = createServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("bookmarks")
    .eq("id", postId)
    .single();

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Post not found" };
  }

  const current = Number(row.bookmarks) || 0;
  const newBookmarks = current + 1;

  const { error } = await supabase
    .from("posts")
    .update({ bookmarks: newBookmarks })
    .eq("id", postId);

  if (error) {
    console.error("[incrementPostBookmarks]", error.message);
    return { ok: false, error: error.message };
  }

  await revalidatePostPage(postId);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  return { ok: true, bookmarks: newBookmarks };
}

/** Decrement bookmarks. Returns new count. */
export async function decrementPostBookmarks(
  postId: string
): Promise<{ ok: boolean; bookmarks?: number; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Database not configured" };
  const supabase = createServerClient();

  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("bookmarks")
    .eq("id", postId)
    .single();

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Post not found" };
  }

  const current = Math.max(0, Number(row.bookmarks) || 0);
  const newBookmarks = Math.max(0, current - 1);

  const { error } = await supabase
    .from("posts")
    .update({ bookmarks: newBookmarks })
    .eq("id", postId);

  if (error) {
    console.error("[decrementPostBookmarks]", error.message);
    return { ok: false, error: error.message };
  }

  await revalidatePostPage(postId);
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  return { ok: true, bookmarks: newBookmarks };
}
