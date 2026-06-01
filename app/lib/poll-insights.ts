import { getAllPostsWithLoadError } from "./posts";
import type { Post } from "./types";
import {
  emptyPollAnalytics,
  isPollActive,
  pollRates,
  totalPollVotes,
  votesPerQuestion,
  type PollAnalytics,
} from "./poll-types";

function parseViews(s: string): number {
  const v = String(s || "0").trim().toUpperCase();
  const num = parseFloat(v.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return 0;
  if (v.includes("M")) return Math.round(num * 1_000_000);
  if (v.includes("K")) return Math.round(num * 1_000);
  return Math.round(num);
}

export type ArticleContentRow = {
  id: string;
  title: string;
  slug: string | null;
  published: boolean;
  views: number;
  likes: number;
  bookmarks: number;
  pollEnabled: boolean;
  pollTitle: string | null;
  analytics: PollAnalytics;
  totalVotes: number;
  votesPerQuestion: number[];
  participationRate: number | null;
  completionRate: number | null;
  skipRate: number | null;
  passiveRate: number | null;
  passiveCount: number;
};

export type ContentMetricsInsights = {
  postsLoadError: string | null;
  totals: {
    articles: number;
    published: number;
    withActivePoll: number;
    impressions: number;
    starts: number;
    completions: number;
    skips: number;
    totalAnswerVotes: number;
    avgParticipationRate: number | null;
    avgCompletionRate: number | null;
  };
  rows: ArticleContentRow[];
  topByCompletion: ArticleContentRow[];
  needsAttention: ArticleContentRow[];
};

function rowFromPost(post: Post): ArticleContentRow {
  const poll = post.poll;
  const active = isPollActive(poll);
  const analytics = poll?.analytics ?? emptyPollAnalytics();
  const rates = pollRates(analytics);
  const totalVotes = poll ? totalPollVotes(poll) : 0;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    published: post.published,
    views: parseViews(post.views),
    likes: post.likes,
    bookmarks: post.bookmarks,
    pollEnabled: active,
    pollTitle: poll?.title ?? null,
    analytics,
    totalVotes,
    votesPerQuestion: poll ? votesPerQuestion(poll) : [],
    participationRate: rates.participationRate,
    completionRate: rates.completionRate,
    skipRate: rates.skipRate,
    passiveRate: rates.passiveRate,
    passiveCount: rates.passive,
  };
}

function avgRate(rows: ArticleContentRow[], pick: (r: ArticleContentRow) => number | null): number | null {
  const vals = rows.map(pick).filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export async function getContentMetricsInsights(): Promise<ContentMetricsInsights> {
  const { posts, loadError: postsLoadError } = await getAllPostsWithLoadError();
  const rows = posts.map(rowFromPost).sort((a, b) => b.views - a.views);

  const withPoll = rows.filter((r) => r.pollEnabled);
  const withImpressions = rows.filter((r) => r.analytics.impressions > 0);

  const totals = {
    articles: rows.length,
    published: rows.filter((r) => r.published).length,
    withActivePoll: withPoll.length,
    impressions: rows.reduce((s, r) => s + r.analytics.impressions, 0),
    starts: rows.reduce((s, r) => s + r.analytics.starts, 0),
    completions: rows.reduce((s, r) => s + r.analytics.completions, 0),
    skips: rows.reduce((s, r) => s + r.analytics.skips, 0),
    totalAnswerVotes: rows.reduce((s, r) => s + r.totalVotes, 0),
    avgParticipationRate: avgRate(withImpressions, (r) => r.participationRate),
    avgCompletionRate: avgRate(
      withImpressions.filter((r) => r.analytics.starts > 0),
      (r) => r.completionRate
    ),
  };

  const topByCompletion = [...withImpressions]
    .filter((r) => r.analytics.starts > 0)
    .sort((a, b) => (b.completionRate ?? 0) - (a.completionRate ?? 0))
    .slice(0, 5);

  const needsAttention = withPoll
    .filter(
      (r) =>
        r.analytics.impressions >= 10 &&
        ((r.participationRate ?? 1) < 0.15 || (r.completionRate ?? 1) < 0.4)
    )
    .slice(0, 8);

  return {
    postsLoadError,
    totals,
    rows,
    topByCompletion,
    needsAttention,
  };
}

export function formatRate(rate: number | null): string {
  if (rate == null || Number.isNaN(rate)) return "—";
  return `${Math.round(rate * 100)}%`;
}
