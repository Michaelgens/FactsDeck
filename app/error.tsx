"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

const cardSurface =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950";

const iconWrap =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center bg-white px-4 py-12 dark:bg-zinc-950">
      <div className={`w-full max-w-md p-8 text-center md:p-10 ${cardSurface}`}>
        <div className="mb-6 flex justify-center">
          <div className={iconWrap} aria-hidden>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
        <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">ERROR</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-zinc-900 md:text-3xl dark:text-zinc-100">
          Something went wrong
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
          We hit a snag loading this page. Please try again, or head back to continue exploring.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <RefreshCw className="h-5 w-5" aria-hidden />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
          >
            <Home className="h-5 w-5" aria-hidden />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
