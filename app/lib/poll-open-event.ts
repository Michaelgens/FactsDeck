/** Cross–client-island signal to open the article poll modal (Server Components cannot share React context). */
export const POLL_OPEN_EVENT = "factsdeck-open-poll";

export function requestOpenArticlePoll(postId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(POLL_OPEN_EVENT, { detail: { postId } })
  );
}
