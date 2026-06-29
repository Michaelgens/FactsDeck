"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import {
  bumpPollAnalytics,
  emptyPollAnalytics,
  isPollActive,
  parsePollAnalytics,
  parsePollForAdmin,
  sanitizePollForClient,
  type ArticlePoll,
  type PollEventType,
} from "./poll-types";
import { getPostById } from "./posts";
import { postPublicPath } from "./post-url";
import {
  checkEngagementRateLimit,
  clientIpFromHeaders,
  engagementClientKey,
} from "./engagement-rate-limit";

export type RecordPollAnswerResult = {
  ok: boolean;
  error?: string;
  poll?: ArticlePoll;
};

const MAX_VOTE_FINGERPRINTS = 50_000;

function voterFingerprint(questionId: string, voterToken: string): string {
  const hash = createHash("sha256").update(voterToken.trim()).digest("hex").slice(0, 24);
  return `${questionId}:${hash}`;
}

async function assertEngagementRateLimit(postId: string, action: string): Promise<boolean> {
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  return checkEngagementRateLimit(engagementClientKey(ip, postId, action));
}

/** Increment vote count for one option on one question (deduped per voter token). */
export async function recordPollAnswer(
  postId: string,
  questionId: string,
  optionId: string,
  voterToken?: string
): Promise<RecordPollAnswerResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  if (!voterToken?.trim()) {
    return { ok: false, error: "Missing voter token" };
  }

  if (!(await assertEngagementRateLimit(postId, "vote"))) {
    return { ok: false, error: "Too many requests. Please wait a moment and try again." };
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

  const poll = parsePollForAdmin(row.poll);
  if (!isPollActive(poll)) {
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

  const fp = voterFingerprint(questionId, voterToken);
  const fingerprints = [...(poll.voteFingerprints ?? [])];
  if (fingerprints.includes(fp)) {
    return { ok: true, poll: sanitizePollForClient(poll) };
  }

  fingerprints.push(fp);
  const trimmed =
    fingerprints.length > MAX_VOTE_FINGERPRINTS
      ? fingerprints.slice(-MAX_VOTE_FINGERPRINTS)
      : fingerprints;

  const updated: ArticlePoll = {
    ...poll,
    voteFingerprints: trimmed,
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

  return { ok: true, poll: sanitizePollForClient(updated) };
}

export async function recordPollEvent(
  postId: string,
  event: PollEventType
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
