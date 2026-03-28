import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4 py-12 bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:via-dark-900 dark:to-purple-950">
      <div className="text-center max-w-md w-full rounded-2xl bg-white/80 dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900 border border-slate-200 dark:border-purple-500/30 p-8 md:p-10 shadow-lg dark:shadow-purple-900/10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 mb-8 ring-4 ring-purple-100/50 dark:ring-purple-500/20">
          <FileQuestion className="h-10 w-10" />
        </div>
        <h1 className="font-display text-6xl md:text-8xl font-bold text-purple-600 dark:text-purple-400 mb-2">
          404
        </h1>
        <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900 dark:text-dark-100 mb-4">
          Page not found
        </h2>
        <p className="text-slate-600 dark:text-purple-300 mb-8 leading-relaxed">
          This page may have moved, or the link might be incorrect. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-accent-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-accent-700 transition-all shadow-lg shadow-purple-500/25 dark:shadow-purple-900/30"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          <Link
            href="/post"
            className="inline-flex items-center justify-center gap-2 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-300 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-emerald-400 transition-colors"
          >
            <Search className="h-5 w-5" />
            Browse Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
