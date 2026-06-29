import { getAllPostsWithLoadError } from "./posts";
import type { Post } from "./types";
import {
  emptyQuizAnalytics,
  isQuizActive,
  quizRates,
  QUIZ_QUESTION_COUNT,
  type QuizAnalytics,
  type QuizResultBand,
} from "./quiz-types";
import { formatRate } from "./poll-insights";

function parseViews(s: string): number {
  const v = String(s || "0").trim().toUpperCase();
  const num = parseFloat(v.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return 0;
  if (v.includes("M")) return Math.round(num * 1_000_000);
  if (v.includes("K")) return Math.round(num * 1_000);
  return Math.round(num);
}

export type ArticleQuizRow = {
  id: string;
  title: string;
  slug: string | null;
  published: boolean;
  views: number;
  likes: number;
  bookmarks: number;
  quizEnabled: boolean;
  quizTitle: string | null;
  questionCount: number;
  resultBands: QuizResultBand[];
  analytics: QuizAnalytics;
  participationRate: number | null;
  completionRate: number | null;
  skipRate: number | null;
  passiveRate: number | null;
  passiveCount: number;
  /** Estimated score-card views (same as completions — graded client-side). */
  scoreCardsEarned: number;
};

export type QuizMetricsInsights = {
  postsLoadError: string | null;
  totals: {
    articles: number;
    published: number;
    withActiveQuiz: number;
    withoutQuiz: number;
    impressions: number;
    starts: number;
    completions: number;
    skips: number;
    scoreCardsEarned: number;
    avgParticipationRate: number | null;
    avgCompletionRate: number | null;
  };
  rows: ArticleQuizRow[];
  topByCompletion: ArticleQuizRow[];
  highIntentLowFinish: ArticleQuizRow[];
  quizDeserts: ArticleQuizRow[];
  launchCandidates: ArticleQuizRow[];
};

function rowFromPost(post: Post): ArticleQuizRow {
  const quiz = post.quiz;
  const active = isQuizActive(quiz);
  const analytics = quiz?.analytics ?? emptyQuizAnalytics();
  const rates = quizRates(analytics);

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    published: post.published,
    views: parseViews(post.views),
    likes: post.likes,
    bookmarks: post.bookmarks,
    quizEnabled: active,
    quizTitle: quiz?.title ?? null,
    questionCount: quiz?.questions.length ?? 0,
    resultBands: quiz?.resultBands ?? [],
    analytics,
    participationRate: rates.participationRate,
    completionRate: rates.completionRate,
    skipRate: rates.skipRate,
    passiveRate: rates.passiveRate,
    passiveCount: rates.passive,
    scoreCardsEarned: analytics.completions,
  };
}

function avgRate(rows: ArticleQuizRow[], pick: (r: ArticleQuizRow) => number | null): number | null {
  const vals = rows.map(pick).filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export async function getQuizMetricsInsights(): Promise<QuizMetricsInsights> {
  const { posts, loadError: postsLoadError } = await getAllPostsWithLoadError();
  const rows = posts.map(rowFromPost).sort((a, b) => b.views - a.views);

  const withQuiz = rows.filter((r) => r.quizEnabled);
  const withImpressions = rows.filter((r) => r.analytics.impressions > 0);

  const totals = {
    articles: rows.length,
    published: rows.filter((r) => r.published).length,
    withActiveQuiz: withQuiz.length,
    withoutQuiz: rows.filter((r) => r.published && !r.quizEnabled).length,
    impressions: rows.reduce((s, r) => s + r.analytics.impressions, 0),
    starts: rows.reduce((s, r) => s + r.analytics.starts, 0),
    completions: rows.reduce((s, r) => s + r.analytics.completions, 0),
    skips: rows.reduce((s, r) => s + r.analytics.skips, 0),
    scoreCardsEarned: rows.reduce((s, r) => s + r.scoreCardsEarned, 0),
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

  const highIntentLowFinish = withQuiz
    .filter(
      (r) =>
        r.analytics.starts >= 3 &&
        (r.completionRate ?? 1) < 0.5 &&
        (r.completionRate ?? 0) > 0
    )
    .sort((a, b) => (a.completionRate ?? 0) - (b.completionRate ?? 0))
    .slice(0, 6);

  const quizDeserts = withQuiz
    .filter(
      (r) =>
        r.analytics.impressions >= 15 &&
        r.analytics.starts === 0 &&
        r.views >= 50
    )
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  const launchCandidates = rows
    .filter((r) => r.published && !r.quizEnabled && r.views >= 100)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    postsLoadError,
    totals,
    rows,
    topByCompletion,
    highIntentLowFinish,
    quizDeserts,
    launchCandidates,
  };
}

export { formatRate, QUIZ_QUESTION_COUNT };
