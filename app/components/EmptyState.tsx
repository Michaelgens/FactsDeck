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

const iconWrap =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

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
  return (
    <div
      className={
        compact
          ? "py-6 px-4"
          : "rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-12 sm:py-16 dark:border-zinc-700 dark:bg-zinc-900/30"
      }
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className={compact ? "mb-3" : `mb-6 ${iconWrap}`}>
          <Icon
            className={
              compact ? "h-6 w-6 text-zinc-400 dark:text-zinc-400" : "h-7 w-7"
            }
          />
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {ctaLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
