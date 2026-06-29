/** Cross–client-island signal to open poll/quiz modal on article pages. */
export const ENGAGEMENT_OPEN_EVENT = "factsdeck-open-engagement";

/** @deprecated use ENGAGEMENT_OPEN_EVENT */
export const POLL_OPEN_EVENT = ENGAGEMENT_OPEN_EVENT;

export type EngagementMode = "poll" | "quiz";

export function requestOpenArticleEngagement(postId: string, mode?: EngagementMode) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ENGAGEMENT_OPEN_EVENT, { detail: { postId, mode } })
  );
}

/** Opens poll mode (backward compatible). */
export function requestOpenArticlePoll(postId: string) {
  requestOpenArticleEngagement(postId, "poll");
}

export function requestOpenArticleQuiz(postId: string) {
  requestOpenArticleEngagement(postId, "quiz");
}
