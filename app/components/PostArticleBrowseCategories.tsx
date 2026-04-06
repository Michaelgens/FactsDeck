"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Calculator,
  BarChart3,
  Target,
  DollarSign,
  PieChart,
  Activity,
  Scale,
  Brain,
  CreditCard,
  Home,
  TrendingUp,
  Building2,
  Bitcoin,
} from "lucide-react";
import type { CategoryWithCount } from "../lib/posts";

const POST_BASE = "/post";

const iconWrapSm =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  BarChart3,
  Target,
  DollarSign,
  PieChart,
  Activity,
  Scale,
  BookOpen,
  Brain,
  CreditCard,
  Home,
  TrendingUp,
  Building2,
  Bitcoin,
};

const MAX_VISIBLE = 6;

function CategoryRow({ cat }: { cat: CategoryWithCount }) {
  const IconComponent = iconMap[cat.iconKey ?? "BookOpen"] ?? BookOpen;
  return (
    <Link
      href={`${POST_BASE}?category=${encodeURIComponent(cat.name)}`}
      className="flex items-center gap-3 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50"
    >
      <span className={`${iconWrapSm} shrink-0`}>
        <IconComponent className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{cat.name}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{cat.count}</span>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
    </Link>
  );
}

export default function PostArticleBrowseCategories({ categories }: { categories: CategoryWithCount[] }) {
  const [expanded, setExpanded] = useState(false);
  const top = categories.slice(0, MAX_VISIBLE);
  const rest = categories.slice(MAX_VISIBLE);

  return (
    <>
      <div className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
        {top.map((cat, i) => (
          <CategoryRow key={`${cat.name}-${i}`} cat={cat} />
        ))}
      </div>
      {rest.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:bg-zinc-900/70"
            aria-expanded={expanded}
          >
            <span>{expanded ? "Show fewer categories" : `Show ${rest.length} more`}</span>
            <ChevronRight
              className={`h-4 w-4 text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
              aria-hidden
            />
          </button>
          {expanded && (
            <div className="mt-2 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
              {rest.map((cat, i) => (
                <CategoryRow key={`${cat.name}-more-${i}`} cat={cat} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
