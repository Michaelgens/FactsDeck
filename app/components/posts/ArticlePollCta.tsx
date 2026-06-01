"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import type { ArticlePoll } from "../../lib/poll-types";
import { requestOpenArticlePoll } from "../../lib/poll-open-event";

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
    <button type="button" onClick={() => requestOpenArticlePoll(postId)} className={className}>
      {children}
    </button>
  );
}

type ArticlePollCtaProps = {
  poll: ArticlePoll;
  postId: string;
  variant?: "hero" | "end";
};

/** Poll CTAs — all open the modal. */
export default function ArticlePollCta({
  poll,
  postId,
  variant = "hero",
}: ArticlePollCtaProps) {
  const total = poll.questions.length;
  const open = () => requestOpenArticlePoll(postId);

  if (variant === "end") {
    return (
      <div className="mb-8 rounded-2xl border border-dashed border-blue-300/80 bg-blue-50/50 px-5 py-4 dark:border-cyan-800/50 dark:bg-cyan-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-display font-bold text-zinc-900 dark:text-zinc-100">Still with us?</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            {total} quick questions — see how you compare with other readers.
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Take the poll
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-2 text-sm font-bold text-blue-900 shadow-sm transition-colors hover:bg-blue-100 dark:border-cyan-800/60 dark:bg-cyan-950/40 dark:text-cyan-100 dark:hover:bg-cyan-950/60"
    >
      <Sparkles className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
      Take the {total}-question challenge
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}
