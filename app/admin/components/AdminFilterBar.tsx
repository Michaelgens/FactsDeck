"use client";

import Link from "next/link";
import { Search, Filter, X } from "lucide-react";

interface AdminFilterBarProps {
  action: string;
  searchName?: string;
  searchPlaceholder?: string;
  searchDefault?: string;
  limit?: number;
  hasActiveFilters?: boolean;
  clearHref?: string;
  categoryFilter?: {
    name: string;
    options: { value: string; label: string }[];
    defaultValue?: string;
  };
}

export default function AdminFilterBar({
  action,
  searchName = "q",
  searchPlaceholder = "Search...",
  searchDefault = "",
  limit,
  hasActiveFilters,
  clearHref,
  categoryFilter,
}: AdminFilterBarProps) {
  return (
    <form
      action={action}
      method="get"
      className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-200 dark:border-purple-500/20"
    >
      <input type="hidden" name="page" value="1" />
      {limit != null && <input type="hidden" name="limit" value={limit} />}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          name={searchName}
          defaultValue={searchDefault}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-purple-500/30 text-slate-900 dark:text-dark-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>
      {categoryFilter && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            name={categoryFilter.name}
            defaultValue={categoryFilter.defaultValue ?? ""}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-purple-500/30 text-slate-900 dark:text-dark-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">All categories</option>
            {categoryFilter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex gap-2 shrink-0">
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
        >
          Apply
        </button>
        {hasActiveFilters && clearHref && (
          <Link
            href={clearHref}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-purple-500/30 text-slate-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-purple-900/20 transition-colors font-medium"
          >
            <X className="h-4 w-4" />
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
