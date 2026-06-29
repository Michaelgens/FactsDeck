"use client";

import type { ArticlePoll } from "../../lib/poll-types";
import type { ArticleQuiz } from "../../lib/quiz-types";
import { ArticleEngagementShell } from "./ArticleEngagementExperience";

/** Single mount point for poll/quiz provider + modal on the post detail page. */
export default function PostArticleEngagementMount({
  poll,
  quiz,
  postId,
}: {
  poll?: ArticlePoll | null;
  quiz?: ArticleQuiz | null;
  postId: string;
}) {
  return <ArticleEngagementShell poll={poll} quiz={quiz} postId={postId} />;
}

/** @deprecated use PostArticleEngagementMount as default export */
export function PostArticlePollMount({
  poll,
  postId,
}: {
  poll: ArticlePoll;
  postId: string;
}) {
  return <ArticleEngagementShell poll={poll} postId={postId} />;
}
