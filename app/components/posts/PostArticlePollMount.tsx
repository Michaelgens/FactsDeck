"use client";

import type { ArticlePoll } from "../../lib/poll-types";
import { ArticlePollShell } from "./ArticlePollExperience";

/** Single mount point for poll provider + modal on the post detail page. */
export default function PostArticlePollMount({
  poll,
  postId,
}: {
  poll: ArticlePoll;
  postId: string;
}) {
  return <ArticlePollShell poll={poll} postId={postId} />;
}
