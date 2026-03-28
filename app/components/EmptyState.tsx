"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
};

export default function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  ctaLabel,
  ctaHref,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={
        compact
          ? "py-6 px-4"
          : "py-12 sm:py-16 px-6 rounded-2xl border border-dashed border-slate-300 dark:border-purple-500/40 bg-slate-50/50 dark:bg-purple-950/20"
      }
    >
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        <div
          className={
            compact
              ? "w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              : "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white dark:bg-dark-900/50 shadow-lg border border-slate-200 dark:border-purple-500/30"
          }
        >
          <Icon
            className={
              compact
                ? "h-6 w-6 text-slate-400 dark:text-purple-400"
                : "h-8 w-8 text-purple-500 dark:text-purple-400"
            }
          />
        </div>
        <h3
          className={
            compact
              ? "font-display font-semibold text-slate-700 dark:text-purple-200 mb-1"
              : "font-display text-xl font-bold text-slate-900 dark:text-purple-200 mb-2"
          }
        >
          {title}
        </h3>
        {description && (
          <p className="text-slate-600 dark:text-purple-300/90 text-sm mb-4">
            {description}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors text-sm"
          >
            {ctaLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
