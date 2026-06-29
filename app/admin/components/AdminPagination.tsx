"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { admin } from "./admin-theme";

const LIMIT_OPTIONS = [10, 50, 100] as const;

interface AdminPaginationProps {
  totalCount: number;
  currentPage: number;
  limit: number;
  itemLabel?: string;
  /** Always include these query params (e.g. tab=welcome). */
  pinnedParams?: Record<string, string>;
  pageParam?: string;
  limitParam?: string;
}

export default function AdminPagination({
  totalCount,
  currentPage,
  limit,
  itemLabel = "items",
  pinnedParams,
  pageParam = "page",
  limitParam = "limit",
}: AdminPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageFromUrl = Math.max(1, parseInt(searchParams.get(pageParam) ?? String(currentPage), 10) || 1);
  const limitFromUrl = LIMIT_OPTIONS.includes(Number(searchParams.get(limitParam)) as (typeof LIMIT_OPTIONS)[number])
    ? Number(searchParams.get(limitParam))
    : limit;
  const activePage = pageParam !== "page" ? pageFromUrl : currentPage;
  const activeLimit = limitParam !== "limit" ? limitFromUrl : limit;

  const totalPages = Math.max(1, Math.ceil(totalCount / activeLimit));
  const start = (activePage - 1) * activeLimit + 1;
  const end = Math.min(activePage * activeLimit, totalCount);
  const hasResults = totalCount > 0;

  const pageNumbers = getPageNumbers(activePage, totalPages);

  const buildHref = (page: number, lim: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageParam, String(page));
    params.set(limitParam, String(lim));
    if (pinnedParams) {
      for (const [key, value] of Object.entries(pinnedParams)) {
        params.set(key, value);
      }
    }
    return `${pathname}?${params.toString()}`;
  };

  const handleLimitChange = (newLimit: number) => {
    router.push(buildHref(1, newLimit));
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t ${admin.divide} ${admin.muted}`}>
      <div className="flex items-center gap-4 flex-wrap">
        <p className={`text-sm ${admin.body}`}>
          {hasResults ? (
            <>
              Showing <span className={`font-semibold ${admin.heading}`}>{start}–{end}</span> of{" "}
              <span className="font-semibold">{totalCount}</span> {itemLabel}
            </>
          ) : (
            <span>No {itemLabel} to display</span>
          )}
        </p>
        <div className="flex items-center gap-1">
          <span className={`text-xs mr-2 ${admin.subtle}`}>Per page:</span>
          {LIMIT_OPTIONS.map((opt) => (
            <LimitButton key={opt} value={opt} active={activeLimit === opt} onClick={() => handleLimitChange(opt)} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {activePage > 1 ? (
            <a
              href={buildHref(activePage - 1, activeLimit)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${admin.label} hover:bg-slate-100 dark:hover:bg-zinc-800`}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </a>
          ) : (
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${admin.subtle} cursor-not-allowed opacity-50`}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </span>
          )}
          <div className="flex items-center gap-0.5 mx-1">
            {pageNumbers.map((num, i) =>
              num === "..." ? (
                <span key={`ellipsis-${i}`} className={`px-2 py-1 ${admin.subtle}`}>
                  …
                </span>
              ) : (
                <a
                  key={num}
                  href={buildHref(num, limit)}
                  className={`min-w-[2rem] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    num === activePage
                      ? "bg-purple-600 dark:bg-violet-600 text-white shadow-md"
                      : `${admin.body} hover:bg-slate-100 dark:hover:bg-zinc-800`
                  }`}
                >
                  {num}
                </a>
              )
            )}
          </div>
          {activePage < totalPages ? (
            <a
              href={buildHref(activePage + 1, activeLimit)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${admin.label} hover:bg-slate-100 dark:hover:bg-zinc-800`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : (
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${admin.subtle} cursor-not-allowed opacity-50`}>
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}

function LimitButton({
  value,
  active,
  onClick,
}: {
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all ${
        active
          ? "bg-purple-600 dark:bg-violet-600 text-white shadow-sm"
          : `${admin.body} hover:bg-slate-200 dark:hover:bg-zinc-700`
      }`}
    >
      {value}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
