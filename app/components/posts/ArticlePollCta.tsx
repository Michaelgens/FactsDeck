"use client";

import { ChevronRight, MessageCircleQuestion, Sparkles, Trophy } from "lucide-react";
import type { ArticlePoll } from "../../lib/poll-types";
import { isPollActive } from "../../lib/poll-types";
import type { ArticleQuiz } from "../../lib/quiz-types";
import { isQuizActive } from "../../lib/quiz-types";
import {
  requestOpenArticleEngagement,
  requestOpenArticlePoll,
  requestOpenArticleQuiz,
} from "../../lib/poll-open-event";

const pollBtnMotion =
  "engagement-shimmer-btn engagement-glow-poll engagement-pill-breathe transition-[filter,background-color] hover:brightness-110 active:scale-[0.96]";
const quizBtnMotion =
  "engagement-shimmer-btn engagement-glow-quiz engagement-shimmer-delay engagement-pill-breathe transition-[filter,background-color] hover:brightness-110 active:scale-[0.96]";

/** Text link / button that opens the poll modal from anywhere on the page. */
export function PollOpenLink({
  postId,
  className,
  children,
}: {
  postId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => requestOpenArticlePoll(postId)}
      className={`engagement-link-poll ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function QuizOpenLink({
  postId,
  className,
  children,
}: {
  postId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => requestOpenArticleQuiz(postId)}
      className={`engagement-link-quiz ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

type ArticleEngagementCtaProps = {
  poll?: ArticlePoll | null;
  quiz?: ArticleQuiz | null;
  postId: string;
  variant?: "hero" | "end";
};

/** Poll + quiz CTAs — open the shared engagement modal. */
export function ArticleEngagementCta({
  poll,
  quiz,
  postId,
  variant = "hero",
}: ArticleEngagementCtaProps) {
  const pollCount = poll?.questions.length ?? 0;
  const quizCount = quiz?.questions.length ?? 0;
  const hasPoll = isPollActive(poll ?? null);
  const hasQuiz = isQuizActive(quiz ?? null);

  if (!hasPoll && !hasQuiz) return null;

  const openPoll = () => requestOpenArticlePoll(postId);
  const openQuiz = () => requestOpenArticleQuiz(postId);
  const openEither = () => requestOpenArticleEngagement(postId);

  if (variant === "end") {
    return (
      <div className="engagement-card-shell mb-8 engagement-modal-enter">
        <div className="engagement-card-inner border border-dashed border-violet-300/40 bg-gradient-to-br from-violet-50/90 via-white to-amber-50/60 dark:border-violet-800/40 dark:from-violet-950/25 dark:via-zinc-950 dark:to-amber-950/25">
          <div className="engagement-card-content px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-display font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="engagement-icon-sparkle text-violet-600 dark:text-violet-400">
                  <Sparkles className="h-4 w-4" />
                </span>
                Still with us?
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                {hasPoll && hasQuiz
                  ? "Take the community poll, test yourself with the quiz — or both."
                  : hasPoll
                    ? "One quick question — vote and see how readers responded."
                    : `${quizCount} graded question${quizCount === 1 ? "" : "s"} — earn your score card.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {hasPoll ? (
                <button
                  type="button"
                  onClick={openPoll}
                  className={`inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 ${pollBtnMotion}`}
                >
                  <span className="engagement-icon-poll">
                    <MessageCircleQuestion className="h-4 w-4" />
                  </span>
                  Take the poll
                </button>
              ) : null}
              {hasQuiz ? (
                <button
                  type="button"
                  onClick={openQuiz}
                  className={`inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700 ${quizBtnMotion}`}
                >
                  <span className="engagement-icon-quiz">
                    <Trophy className="h-4 w-4" />
                  </span>
                  Take the quiz
                </button>
              ) : null}
              {hasPoll && hasQuiz ? (
                <button
                  type="button"
                  onClick={openEither}
                  className="engagement-shimmer-btn inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-bold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Choose
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2 engagement-modal-enter">
      {hasPoll ? (
        <button
          type="button"
          onClick={openPoll}
          className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-2 text-sm font-bold text-blue-900 shadow-sm hover:bg-blue-100 dark:border-cyan-800/60 dark:bg-cyan-950/40 dark:text-cyan-100 dark:hover:bg-cyan-950/60 ${pollBtnMotion}`}
        >
          <span className="engagement-icon-sparkle text-blue-600 dark:text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </span>
          Take the poll
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
      {hasQuiz ? (
        <button
          type="button"
          onClick={openQuiz}
          className={`inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/90 px-4 py-2 text-sm font-bold text-amber-900 shadow-sm hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60 ${quizBtnMotion}`}
        >
          <span className="engagement-icon-quiz text-amber-600 dark:text-amber-400">
            <Trophy className="h-4 w-4" />
          </span>
          Take the quiz
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

type ArticlePollCtaProps = {
  poll: ArticlePoll;
  postId: string;
  variant?: "hero" | "end";
};

/** @deprecated prefer ArticleEngagementCta with poll + quiz props */
export default function ArticlePollCta({ poll, postId, variant = "hero" }: ArticlePollCtaProps) {
  return <ArticleEngagementCta poll={poll} postId={postId} variant={variant} />;
}
