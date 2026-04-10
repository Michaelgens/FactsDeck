"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Clock,
  Star,
  Flame,
  Calculator,
  BookOpen,
  Scale,
  Brain,
  BarChart3,
  Activity,
  Target,
  CreditCard,
  Home,
  DollarSign,
  TrendingUp,
  Building2,
  PieChart,
  Bitcoin,
  Wrench,
  LayoutGrid,
} from "lucide-react";
import type { Post } from "../lib/types";
import { postPublicPath } from "../lib/post-url";
import { CategoryPills, categoryLabelList, postHasCategory, postMatchesSearch } from "../lib/post-display";
import type { CategoryWithCount, PartitionedPosts } from "../lib/posts";
import type { SiteTool } from "../lib/site-config";
import { siteTools } from "../lib/site-config";
import { toolMatchesSearch } from "../lib/tools-utils";
import EmptyState from "./EmptyState";
import { LatestArticleCard } from "./LatestArticleCard";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale,
  BookOpen,
  Brain,
  BarChart3,
  Activity,
  Target,
  Calculator,
  CreditCard,
  Home,
  DollarSign,
  TrendingUp,
  Building2,
  PieChart,
  Bitcoin,
};

const cardSurface =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80";

const iconWrapSm =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

const linkAccent =
  "font-semibold text-blue-800 transition-colors hover:text-blue-900 dark:text-cyan-300 dark:hover:text-cyan-200";

const CONTENT_TYPES = [
  { key: "featured", label: "Featured", icon: Star },
  { key: "latest", label: "Latest", icon: Clock },
  { key: "expert-picks", label: "Expert picks", icon: BookOpen },
  { key: "guides", label: "Guides", icon: BookOpen },
  { key: "trending", label: "Top stories", icon: Flame },
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]["key"];

const ITEMS_PER_PAGE = 12;
const POST_BASE = "/post";

/** Mirrors `HomePageClient` — static right-rail “Popular” */
const STATIC_POPULAR = [
  { title: "How compound interest actually compounds (with examples)", tag: "Education" },
  { title: "Debt snowball vs avalanche: which wins (and when)?", tag: "Debt" },
  { title: "What is a good savings rate in 2026?", tag: "Saving" },
  { title: "Roth vs Traditional: a decision checklist", tag: "Retirement" },
  { title: "DTI explained: how lenders evaluate you", tag: "Loans" },
] as const;

/** Mirrors `HomePageClient` — static “Our top picks for {month}” */
const STATIC_TOP_PICKS_FOR_MONTH = [
  { title: "The 1% rule for big purchases", tag: "Spending", readTime: "4 min" },
  { title: "A simple IRA contribution ladder", tag: "Retirement", readTime: "5 min" },
  { title: "Debt payoff order that minimizes interest", tag: "Debt", readTime: "6 min" },
  { title: "Mortgage points: when they pay off", tag: "Housing", readTime: "5 min" },
  { title: "A two-account system that simplifies budgeting", tag: "Budgeting", readTime: "4 min" },
  { title: "The easiest way to start an emergency fund", tag: "Saving", readTime: "4 min" },
  { title: "401(k) match math: what to contribute first", tag: "Retirement", readTime: "5 min" },
  { title: "A simple rule for credit card payoff order", tag: "Credit", readTime: "4 min" },
] as const;

type PostListContentProps = {
  partitioned: PartitionedPosts;
  categoriesWithCounts: CategoryWithCount[];
  sidebarTools: SiteTool[];
};

export default function PostListContent({
  partitioned,
  categoriesWithCounts,
  sidebarTools,
}: PostListContentProps) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "latest";
  const category = searchParams.get("category") || "";
  const queryParam = searchParams.get("q") || "";
  const type = (CONTENT_TYPES.some((t) => t.key === typeParam) ? typeParam : "latest") as ContentType;

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [sortBy, setSortBy] = useState("newest");
  const [filterCategory, setFilterCategory] = useState(category || "All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [type, category, searchTerm, filterCategory, sortBy, queryParam]);

  const matchingTools = useMemo(() => {
    const q = searchTerm.trim();
    if (q.length < 2) return [];
    return siteTools.filter((t) => toolMatchesSearch(t, q));
  }, [searchTerm]);

  const { items: displayItems, totalCount } = useMemo(() => {
    let data: Post[] = [];

    if (type === "featured") {
      data = [...partitioned.featured];
    } else if (type === "expert-picks") {
      data = [...partitioned.expertPicks];
    } else if (type === "guides") {
      data = [...partitioned.guides];
    } else if (type === "trending") {
      data = [...partitioned.trending];
    } else {
      data = [...partitioned.latest];
    }

    if (category) {
      data = data.filter((p) => postHasCategory(p, category));
    }

    if (type !== "guides" && type !== "trending") {
      let filtered = data.filter((item) => postMatchesSearch(item, searchTerm));
      filtered = filtered.filter(
        (item) =>
          filterCategory === "All Categories" || postHasCategory(item, filterCategory)
      );
      if (sortBy === "newest") {
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
      } else if (sortBy === "oldest") {
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
        );
      } else if (sortBy === "popular") {
        filtered = [...filtered].sort(
          (a, b) =>
            parseInt(String(b.views).replace(/[^0-9]/g, ""), 10) -
            parseInt(String(a.views).replace(/[^0-9]/g, ""), 10)
        );
      }
      data = filtered;
    } else if (searchTerm) {
      data = data.filter((p) => postMatchesSearch(p, searchTerm));
    }

    return { items: data, totalCount: data.length };
  }, [type, category, searchTerm, filterCategory, sortBy, queryParam, partitioned]);

  const allPostsForCategories = [
    ...partitioned.featured,
    ...partitioned.latest,
    ...partitioned.expertPicks,
    ...partitioned.trending,
    ...partitioned.guides,
  ];
  const allCategories = [
    "All Categories",
    ...Array.from(new Set(allPostsForCategories.flatMap((p) => categoryLabelList(p)))).sort(),
  ];

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = displayItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const categoriesSorted = useMemo(() => {
    const toNum = (v: unknown) => {
      if (typeof v === "number") return v;
      const n = Number(String(v).replace(/[^0-9.]/g, ""));
      return Number.isFinite(n) ? n : 0;
    };
    return [...categoriesWithCounts].sort((a, b) => toNum(b.count) - toNum(a.count));
  }, [categoriesWithCounts]);

  const categoriesTop = categoriesSorted.slice(0, 5);
  const categoriesRest = categoriesSorted.slice(5);

  const monthPicksUpper = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date()).toUpperCase(),
    []
  );

  const sidebarTrendingPosts = useMemo(
    () => partitioned.trending.slice(0, 8),
    [partitioned.trending]
  );

  const pageTitle = queryParam
    ? `Search results for "${queryParam}"`
    : type === "featured"
      ? "Featured Articles"
      : type === "expert-picks"
        ? "Expert Picks"
        : type === "guides"
          ? "Guides"
          : type === "trending"
            ? "Top stories"
            : category
              ? `${category} Articles`
              : "Latest Articles";

  const isArticleType = queryParam ? true : type === "featured" || type === "latest" || type === "expert-picks";

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                Back to home
              </Link>
              <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                {totalCount} {type === "guides" ? "guides" : type === "trending" ? "stories" : "articles"}
              </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Article library
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl md:text-5xl dark:text-zinc-100">
                  {pageTitle}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                  Browse by section, filter by category, and search articles and tools in one place.
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      <LayoutGrid className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
                      Layout
                    </div>
                    {isArticleType && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setViewMode("list")}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            viewMode === "list"
                              ? "bg-blue-700 text-white dark:bg-emerald-600"
                              : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                          }`}
                        >
                          <List className="mr-1 inline h-4 w-4" aria-hidden /> List
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("grid")}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            viewMode === "grid"
                              ? "bg-blue-700 text-white dark:bg-emerald-600"
                              : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                          }`}
                        >
                          <Grid className="mr-1 inline h-4 w-4" aria-hidden /> Grid
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Use the search bar below for full filtering (articles and tools).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(({ key, label }) => (
                <Link
                  key={key}
                  href={
                    key === "latest"
                      ? queryParam
                        ? `${POST_BASE}?q=${encodeURIComponent(queryParam)}`
                        : POST_BASE
                      : `${POST_BASE}?type=${key}${queryParam ? `&q=${encodeURIComponent(queryParam)}` : ""}`
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    type === key
                      ? "bg-blue-700 text-white shadow-sm dark:bg-emerald-600"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Article Section Start */}
      {isArticleType && (
        <section className="sticky top-16 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
                <input
                  type="search"
                  placeholder="Search articles and tools…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600 dark:text-emerald-400" aria-hidden />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most read</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Column 1 — merged (Home columns 1 + 2) */}
          <div className="min-w-0 lg:col-span-9">
            {matchingTools.length > 0 && (
              <section
                className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                aria-label="Matching tools"
              >
                <div className="mb-4 flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                  <Wrench className="h-5 w-5 text-blue-700 dark:text-cyan-400" aria-hidden />
                  <h2 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">Matching tools</h2>
                </div>
                <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
                  {matchingTools.map((tool) => {
                    const ToolIcon = iconMap[tool.iconKey || "Calculator"] ?? Calculator;
                    return (
                      <li key={tool.slug}>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className={`group flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-emerald-800/80 dark:hover:bg-zinc-900/70`}
                        >
                          <div className={`${iconWrapSm} h-10 w-10`}>
                            <ToolIcon className="h-5 w-5" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                              {tool.name}
                            </p>
                            <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{tool.tagline}</p>
                          </div>
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-blue-700 dark:group-hover:text-cyan-400"
                            aria-hidden
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/tools" className={`mt-4 inline-flex items-center gap-1 text-sm ${linkAccent}`}>
                  Browse all tools <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </section>
            )}

            <div className="mb-10 grid grid-cols-1 gap-8 xl:grid-cols-12">
              <section className="xl:col-span-5">
                <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Categories
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Browse by category
                  </h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-1">
                  {[...categoriesTop, ...categoriesRest].slice(0, 10).map((cat, i) => {
                    const IconComponent = iconMap[cat.iconKey ?? "BookOpen"] ?? BookOpen;
                    return (
                      <Link
                        key={`${cat.name}-${i}`}
                        href={`${POST_BASE}?category=${encodeURIComponent(cat.name)}`}
                        className="group flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-cyan-800 dark:hover:bg-zinc-900 dark:hover:text-cyan-300 md:rounded-lg md:border-0 md:bg-transparent md:px-2 md:py-2.5 md:shadow-none md:hover:bg-zinc-50 md:dark:hover:bg-zinc-900"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className={`${iconWrapSm} shrink-0 md:border md:border-zinc-200 md:bg-white md:text-blue-700 md:shadow-sm md:dark:border-zinc-800 md:dark:bg-zinc-950 md:dark:text-cyan-300`}>
                            <IconComponent className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold tabular-nums text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                          {cat.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <Link href={POST_BASE} className={`mt-4 inline-flex items-center gap-1 text-sm ${linkAccent}`}>
                  View all topics <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 xl:col-span-7">
                <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      News
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      More stories
                    </h3>
                  </div>
                  <Link href={`${POST_BASE}?type=trending`} className={`shrink-0 text-sm ${linkAccent}`}>
                    View all
                  </Link>
                </div>

                <ul className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                  {sidebarTrendingPosts.slice(0, 10).map((p) => {
                    const tag = categoryLabelList(p)[0] ?? "Trending";
                    return (
                      <li key={p.id} className="py-3.5 first:pt-0 last:pb-0">
                        <Link href={`${postPublicPath(p)}?from=trending`} className="group block">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                            {tag}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                            {p.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {p.readTime}
                            <span aria-hidden className="text-zinc-300 dark:text-zinc-700">
                              ·
                            </span>
                            <span className="tabular-nums">{p.views.toLocaleString()} views</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {sidebarTrendingPosts.length === 0 && <EmptyState icon={Flame} title="No stories yet" compact />}
              </section>
            </div>

            {paginatedItems.length === 0 ? (
              matchingTools.length > 0 ? (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-10 text-center">
                  <p className="text-zinc-800 dark:text-zinc-100 font-medium mb-2">No articles match this search.</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
                    Try different keywords, clear filters, or use the matching tools above.
                  </p>
                  <Link
                    href="/tools"
                    className="inline-flex mt-6 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                  >
                    View all calculators & simulators
                  </Link>
                </div>
              ) : (
              <EmptyState
                icon={Search}
                title="Nothing here yet"
                description="Try another content type, adjust your filters, or search for something different."
                ctaLabel="Browse all articles"
                ctaHref="/post"
              />
              )
            ) : (
              <>
                <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Showing{" "}
                  <span className="font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, totalCount)}
                  </span>{" "}
                  of <span className="font-bold tabular-nums text-zinc-800 dark:text-zinc-200">{totalCount}</span>{" "}
                  {type === "guides" ? "guides" : type === "trending" ? "stories" : "articles"}
                </p>

                {isArticleType && (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6"
                        : "overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    }
                  >
                    {paginatedItems.map((article) => (
                      <LatestArticleCard
                        key={article.id}
                        article={article}
                        from={type}
                        variant={viewMode === "grid" ? "grid" : "list"}
                      />
                    ))}
                  </div>
                )}

                {type === "guides" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {paginatedItems.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`${postPublicPath(guide)}?from=guides`}
                        className={`group block p-4 sm:p-5 ${cardSurface} hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40`}
                      >
                        <CategoryPills
                          categories={categoryLabelList(guide)}
                          variant="muted"
                          max={3}
                          className="[&>span]:text-[10px] [&>span]:uppercase [&>span]:tracking-wide"
                        />
                        <h3 className="font-display font-bold text-lg leading-snug text-zinc-900 dark:text-zinc-100 mt-2 mb-3 line-clamp-3 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                          {guide.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                          <span>{guide.readTime}</span>
                          <span>-</span>
                        </div>
                        <span className="inline-flex items-center mt-4 text-zinc-900 dark:text-zinc-100 font-semibold text-sm group-hover:text-zinc-700 dark:hover:text-white group-hover:gap-2 transition-all gap-1">
                          Read guide <ChevronRight className="h-4 w-4" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {type === "trending" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {paginatedItems.map((post) => (
                      <Link
                        key={post.id}
                        href={`${postPublicPath(post)}?from=trending`}
                        className={`group flex items-center gap-3 p-4 sm:gap-4 sm:p-5 ${cardSurface} hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40`}
                      >
                        <div className={`${iconWrapSm} h-10 w-10 sm:h-12 sm:w-12`}>
                          <Flame className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-zinc-900 dark:text-zinc-100 line-clamp-3 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            <span>{post.views} views</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-400 dark:text-zinc-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page =
                          totalPages <= 5
                            ? i + 1
                            : currentPage <= 3
                              ? i + 1
                              : currentPage >= totalPages - 2
                                ? totalPages - 4 + i
                                : currentPage - 2 + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-xl px-4 py-2 transition-colors ${
                              currentPage === page
                                ? "bg-blue-700 text-white dark:bg-emerald-600"
                                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/40"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Column 2 — right rail (same as Home column 3) */}
          <aside className="order-2 space-y-8 lg:order-2 lg:col-span-3">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <h3 className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Popular
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Today
                </span>
              </div>
              <ol className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                {STATIC_POPULAR.slice(0, 5).map((p, idx) => (
                  <li key={p.title} className="py-3.5 first:pt-0 last:pb-0">
                    <Link href={POST_BASE} className="group block">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-bold tabular-nums text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                            {p.tag}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                            {p.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
              <h3 className="border-b border-zinc-200 pb-3 font-display text-lg font-bold leading-tight tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                Find the Best Financial Tools
              </h3>
              {/* Mobile: swipeable tool cards */}
              <div className="mt-4 md:hidden">
                <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {sidebarTools.slice(0, 5).map((tool) => {
                    const ToolIcon = iconMap[tool.iconKey || "Calculator"] ?? Calculator;
                    return (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="group snap-start rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-cyan-800 dark:hover:bg-zinc-900"
                      >
                        <div className="flex w-[15rem] items-start justify-between gap-3">
                          <span className="flex min-w-0 items-start gap-3">
                            <span className={`${iconWrapSm} mt-0.5 shrink-0`}>
                              <ToolIcon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                                Tool
                              </span>
                              <span className="mt-1 block line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                                {tool.name}
                              </span>
                            </span>
                          </span>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400 group-hover:text-blue-700 dark:group-hover:text-cyan-400" aria-hidden />
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Swipe to explore tools</p>
              </div>

              {/* Desktop: vertical list */}
              <ul className="mt-4 hidden space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800/90 md:block">
                {sidebarTools.slice(0, 5).map((tool) => {
                  const ToolIcon = iconMap[tool.iconKey || "Calculator"] ?? Calculator;
                  return (
                    <li key={tool.slug} className="pt-2 first:pt-0">
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="group flex items-center justify-between gap-3 py-3.5 text-sm first:pt-0 last:pb-0"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className={`${iconWrapSm} shrink-0`}>
                            <ToolIcon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="font-semibold leading-snug text-zinc-900 group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                            {tool.name}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-blue-700 dark:group-hover:text-cyan-400" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/tools"
                className={`mt-4 flex items-center gap-1 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
              >
                Browse all tools <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
              <h3 className="border-b border-zinc-200 pb-3 font-display text-base font-bold leading-snug tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100 sm:text-lg">
                OUR TOP PICKS FOR {monthPicksUpper}
              </h3>
              <ul className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                {STATIC_TOP_PICKS_FOR_MONTH.slice(0, 8).map((item) => (
                  <li key={item.title} className="py-3 first:pt-0 last:pb-0">
                    <Link href={`${POST_BASE}?type=guides`} className="group block">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                        {item.tag}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                        {item.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {item.readTime}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`${POST_BASE}?type=guides`}
                className={`mt-4 flex items-center gap-1 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
              >
                See all guides <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </section>
          </aside>
        </div>
      </div>
      {/* Article Section End */}
    </div>
  );
}
