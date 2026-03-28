"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

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
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4 py-12 bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:via-dark-900 dark:to-purple-950">
      <div className="text-center max-w-md w-full rounded-2xl bg-white/80 dark:bg-dark-900/50 border border-slate-200 dark:border-purple-500/30 p-8 md:p-10 shadow-lg dark:shadow-purple-900/10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mb-8 ring-4 ring-amber-100/50 dark:ring-amber-500/20">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-dark-100 mb-4">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-purple-300 mb-8 leading-relaxed">
          We hit a snag loading this page. Please try again, or head back to continue exploring.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-accent-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-accent-700 transition-all shadow-lg shadow-purple-500/25 dark:shadow-purple-900/30"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-300 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-emerald-400 transition-colors"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
