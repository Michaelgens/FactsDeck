"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, FileText, Flame, Search, Star, type LucideIcon } from "lucide-react";

const ICONS = {
  BookOpen,
  FileText,
  Flame,
  Search,
  Star,
} satisfies Record<string, LucideIcon>;

/** Matches HomePage / PostList / marketing pages — icon sits in a tinted “card” */
const iconWrap =
  "inline-flex shrink-0 items-center justify-center rounded-2xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950 dark:text-cyan-300 h-12 w-12";

const iconWrapCompact =
  "inline-flex shrink-0 items-center justify-center rounded-xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950 dark:text-cyan-300 h-10 w-10";

type EmptyStateProps = {
  icon?: LucideIcon;
  /** Server-safe icon selector (preferred for Server Components). */
  iconKey?: keyof typeof ICONS;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
};

export default function EmptyState({
  icon: iconProp,
  iconKey,
  title,
  description,
  ctaLabel,
  ctaHref,
  compact = false,
}: EmptyStateProps) {
  const Icon = iconProp ?? (iconKey ? ICONS[iconKey] : BookOpen);

  const outer =
    compact
      ? "rounded-xl border border-zinc-200 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-950"
      : "rounded-2xl border border-zinc-200 bg-white px-6 py-12 sm:py-16 dark:border-zinc-800 dark:bg-zinc-950";

  return (
    <div className={outer}>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className={compact ? `mb-4 ${iconWrapCompact}` : `mb-6 ${iconWrap}`} aria-hidden>
          <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} />
        </div>
        <h3
          className={
            compact
              ? "mb-1 font-display font-semibold text-zinc-700 dark:text-zinc-200"
              : "mb-2 font-display text-xl font-bold text-zinc-900 dark:text-zinc-100"
          }
        >
          {title}
        </h3>
        {description && (
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="inline-flex h-12 items-center gap-2 justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
          >
            {ctaLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
