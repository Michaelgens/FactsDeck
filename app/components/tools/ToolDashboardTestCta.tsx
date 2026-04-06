"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, ChevronRight, X } from "lucide-react";

export type ToolDashboardTestCtaProps = {
  /** `siteTools` slug, e.g. `mortgage-calculator` */
  toolSlug: string;
  /** e.g. Facts Deck Mortgage Test */
  testLabel: string;
  /** One line under the title */
  blurb?: string;
};

function sessionDismissKey(toolSlug: string) {
  return `factsdeck:tool-test-nudge-dismissed:${toolSlug}`;
}

/**
 * Dismissible reminder to run the tool’s quick journey (`?retake=1`).
 * Dismissal is per browser tab session so the nudge can return on the next visit.
 */
export default function ToolDashboardTestCta({
  toolSlug,
  testLabel,
  blurb = "Run the short interactive flow again—fresh answers, results snapshot, then land back here with the full workspace.",
}: ToolDashboardTestCtaProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(sessionDismissKey(toolSlug)) !== "1") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, [toolSlug]);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(sessionDismissKey(toolSlug), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, [toolSlug]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Quick test reminder"
      className="relative my-6 overflow-hidden rounded-xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 via-white to-zinc-50/95 pl-4 pr-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_32px_-8px_rgba(5,150,105,0.15)] ring-1 ring-emerald-500/[0.08] backdrop-blur-[2px] dark:border-emerald-800/40 dark:from-emerald-950/35 dark:via-zinc-950 dark:to-zinc-900/95 dark:shadow-[0_8px_32px_-10px_rgba(0,0,0,0.5)] dark:ring-emerald-500/10 sm:pr-4"
    >
      {/* “Unread” stripe like a system banner */}
      <div
        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 dark:from-emerald-500 dark:via-emerald-400 dark:to-emerald-600"
        aria-hidden
      />

      <div className="flex flex-col gap-3 py-3.5 pl-2 sm:flex-row sm:items-center sm:gap-4 sm:py-3 sm:pl-1">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <span className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30 dark:bg-emerald-500 dark:ring-emerald-400/25">
            <BellRing className="h-5 w-5" aria-hidden />
            <span
              className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400 shadow-sm dark:border-emerald-950"
              aria-hidden
            />
          </span>
          <div className="min-w-0 pt-0.5 sm:pt-0">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="inline-flex items-center rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                Reminder
              </span>
              <span className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-50 sm:text-base">
                Try the quick test
              </span>
            </p>
            <p className="mt-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-100 sm:text-sm">{testLabel}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">{blurb}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[3.25rem] sm:justify-end sm:pl-0">
          <Link
            href={`/tools/${toolSlug}?retake=1`}
            className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:hover:bg-emerald-500 sm:flex-initial"
          >
            Start test
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200/90 bg-white/80 text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Dismiss this reminder"
          >
            <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
