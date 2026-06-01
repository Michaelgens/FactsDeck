"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import {
  bumpPollAnalytics,
  emptyPollAnalytics,
  normalizePoll,
  parsePollAnalytics,
  parsePollForAdmin,
  type ArticlePoll,
  type PollEventType,
} from "./poll-types";
import { getPostById } from "./posts";
import { postPublicPath } from "./post-url";

export type RecordPollAnswerResult = {
  ok: boolean;
  error?: string;
  poll?: ArticlePoll;
};

/** Increment vote count for one option on one question (one vote per question per browser session). */
export async function recordPollAnswer(
  postId: string,
  questionId: string,
  optionId: string
): Promise<RecordPollAnswerResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createServerClient();
  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("poll")
    .eq("id", postId)
    .maybeSingle();

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Post not found" };
  }

  const poll = normalizePoll(row.poll);
  if (!poll) {
    return { ok: false, error: "This article has no active poll" };
  }

  const qIndex = poll.questions.findIndex((q) => q.id === questionId);
  if (qIndex < 0) {
    return { ok: false, error: "Question not found" };
  }

  const question = poll.questions[qIndex];
  const oIndex = question.options.findIndex((o) => o.id === optionId);
  if (oIndex < 0) {
    return { ok: false, error: "Option not found" };
  }

  const updated: ArticlePoll = {
    ...poll,
    analytics: poll.analytics ?? emptyPollAnalytics(),
    questions: poll.questions.map((q, qi) => {
      if (qi !== qIndex) return q;
      return {
        ...q,
        options: q.options.map((o, oi) =>
          oi === oIndex ? { ...o, votes: o.votes + 1 } : o
        ),
      };
    }),
  };

  const { error: updateError } = await supabase
    .from("posts")
    .update({ poll: updated })
    .eq("id", postId);

  if (updateError) {
    console.error("[recordPollAnswer]", updateError.message);
    return { ok: false, error: updateError.message };
  }

  const post = await getPostById(postId);
  if (post) revalidatePath(postPublicPath(post));
  revalidatePath("/admin/articles/content");

  return { ok: true, poll: updated };
}

export async function recordPollEvent(
  postId: string,
  event: PollEventType
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createServerClient();
  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("poll")
    .eq("id", postId)
    .maybeSingle();

  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Post not found" };
  }

  const existing = parsePollForAdmin(row.poll);
  if (!existing?.enabled) {
    return { ok: false, error: "Poll not active" };
  }

  const analytics = bumpPollAnalytics(
    existing.analytics ?? parsePollAnalytics((row.poll as Record<string, unknown>)?.analytics),
    event
  );

  const updated: ArticlePoll = { ...existing, analytics };

  const { error: updateError } = await supabase
    .from("posts")
    .update({ poll: updated })
    .eq("id", postId);

  if (updateError) {
    console.error("[recordPollEvent]", updateError.message);
    return { ok: false, error: updateError.message };
  }

  revalidatePath("/admin/articles/content");
  return { ok: true };
}
