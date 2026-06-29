"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import {
  bumpQuizAnalytics,
  emptyQuizAnalytics,
  parseQuizAnalytics,
  parseQuizForAdmin,
  type QuizEventType,
} from "./quiz-types";
import { getPostById } from "./posts";
import { postPublicPath } from "./post-url";
import {
  checkEngagementRateLimit,
  clientIpFromHeaders,
  engagementClientKey,
} from "./engagement-rate-limit";

async function assertEngagementRateLimit(postId: string, action: string): Promise<boolean> {
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  return checkEngagementRateLimit(engagementClientKey(ip, postId, action));
}

export async function recordQuizEvent(
  postId: string,
  event: QuizEventType,
  score?: number
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  if (!(await assertEngagementRateLimit(postId, `event:${event}`))) {
    return { ok: false, error: "Too many requests" };
  }

  const supabase = createServerClient();
  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("quiz")
    .eq("id", postId)
    .maybeSingle();

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Post not found" };
  }

  const existing = parseQuizForAdmin(row.quiz);
  if (!existing?.enabled) {
    return { ok: false, error: "Quiz not active" };
  }

  const analytics = bumpQuizAnalytics(
    existing.analytics ?? parseQuizAnalytics((row.quiz as Record<string, unknown>)?.analytics),
    event,
    event === "complete" ? score : undefined
  );

  const updated = { ...existing, analytics };

  const { error: updateError } = await supabase
    .from("posts")
    .update({ quiz: updated })
    .eq("id", postId);

  if (updateError) {
    console.error("[recordQuizEvent]", updateError.message);
    return { ok: false, error: updateError.message };
  }

  revalidatePath("/admin/articles/content");
  revalidatePath("/admin/articles/quiz-metrics");
  const post = await getPostById(postId);
  if (post) revalidatePath(postPublicPath(post));
  return { ok: true };
}
