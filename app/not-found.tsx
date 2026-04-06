import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";

const cardSurface =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950";

const iconWrap =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center bg-white px-4 py-12 dark:bg-zinc-950">
      <div className={`w-full max-w-md p-8 text-center md:p-10 ${cardSurface}`}>
        <div className="mb-6 flex justify-center">
          <div className={iconWrap} aria-hidden>
            <FileQuestion className="h-6 w-6" />
          </div>
        </div>
        <p className="text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90">NOT FOUND</p>
        <h1 className="mt-4 font-display">
          <span className="block text-6xl font-bold leading-none md:text-8xl">
            <span className="text-blue-800 dark:text-emerald-300">4</span>
            <span className="text-orange-600 dark:text-cyan-400">0</span>
            <span className="text-blue-800 dark:text-emerald-300">4</span>
          </span>
          <span className="mt-4 block text-xl font-bold text-zinc-900 md:text-2xl dark:text-zinc-100">
            Page not found
          </span>
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
          This page may have moved, or the link might be incorrect. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Home className="h-5 w-5" aria-hidden />
            Go home
          </Link>
          <Link
            href="/post"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
          >
            <Search className="h-5 w-5" aria-hidden />
            Browse articles
          </Link>
        </div>
      </div>
    </div>
  );
}
