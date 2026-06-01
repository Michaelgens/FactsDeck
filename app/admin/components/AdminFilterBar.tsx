"use client";

import Link from "next/link";
import { Search, Filter, X } from "lucide-react";
import { admin } from "./admin-theme";

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
  statusFilter?: {
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
  statusFilter,
}: AdminFilterBarProps) {
  return (
    <form action={action} method="get" className={`flex flex-col sm:flex-row gap-3 p-4 border-b ${admin.divide}`}>
      <input type="hidden" name="page" value="1" />
      {limit != null && <input type="hidden" name="limit" value={limit} />}
      <div className="flex-1 relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${admin.subtle}`} />
        <input
          type="search"
          name={searchName}
          defaultValue={searchDefault}
          placeholder={searchPlaceholder}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${admin.input} ${admin.focus} transition-all`}
        />
      </div>
      {categoryFilter && (
        <div className="flex items-center gap-2">
          <Filter className={`h-4 w-4 shrink-0 ${admin.subtle}`} />
          <select
            name={categoryFilter.name}
            defaultValue={categoryFilter.defaultValue ?? ""}
            className={`px-4 py-2.5 rounded-xl ${admin.input} ${admin.focus} transition-all`}
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
      {statusFilter && (
        <select
          name={statusFilter.name}
          defaultValue={statusFilter.defaultValue ?? ""}
          className={`px-4 py-2.5 rounded-xl min-w-[10rem] ${admin.input} ${admin.focus} transition-all`}
        >
          {statusFilter.options.map((opt) => (
            <option key={opt.value || "__all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-2 shrink-0">
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-purple-600 dark:bg-violet-600 text-white font-semibold hover:bg-purple-700 dark:hover:bg-violet-500 transition-colors"
        >
          Apply
        </button>
        {hasActiveFilters && clearHref && (
          <Link
            href={clearHref}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border ${admin.card} ${admin.body} hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium`}
          >
            <X className="h-4 w-4" />
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
