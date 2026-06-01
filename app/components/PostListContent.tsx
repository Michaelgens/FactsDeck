"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronRight,
  Clock,
  Star,
  Flame,
  Calculator,
  BookOpen,
  CalendarDays,
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
import { CategoryPills, categoryLabelList } from "../lib/post-display";
import type { Post } from "../lib/types";
import type { CategoryWithCount, PartitionedPosts } from "../lib/posts";
import { siteTools, type SiteTool } from "../lib/site-config";
import { toolMatchesSearch } from "../lib/tools-utils";
import {
  LATEST_ARTICLES_PAGE_SIZE,
  buildMajorSections,
  filterPostsByCategory,
  filterPostsBySearch,
  flattenPartitioned,
  getAnalysisFeed,
  getTopPicksPosts,
  postsForTabType,
  sortPosts,
} from "../lib/post-feeds";
import {
  CompactMajorBlocks,
  LatestAnalysisBlock,
  MajorCoverageStack,
  PopularRail,
  PostGrid,
  TopPicksRail,
} from "./posts/ArticleFeedUi";
import EmptyState from "./EmptyState";
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

const iconWrapSm =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

const linkAccent =
  "font-semibold text-blue-800 transition-colors hover:text-blue-900 dark:text-cyan-300 dark:hover:text-cyan-200";

const ALUX_URL = "https://www.alux.com/";

/** Sponsored lead in the wide column — same silhouette as static major + minors stack. */
function AluxPostListLeadCard() {
  return (
    <div className="space-y-2">
      <a
        href={ALUX_URL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group relative block overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm outline-offset-2 transition-colors hover:border-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-amber-600/55 dark:focus-visible:outline-cyan-400"
        aria-label="Sponsored: ALUX — opens in a new tab"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <Image
            src="/alux.png"
            alt="ALUX promotional creative"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(min-width: 1024px) 42vw, 100vw"
          />
          <div className="absolute left-4 top-4">
            <div className="mt-2 text-3xl font-black tracking-tight text-white drop-shadow sm:text-4xl">
              ALUX
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center">
            <p className="mt-2 text-sm font-semibold text-white text-center">
              Where future billionaires come to get inspired
            </p>
          </div>
        </div>
      </a>


      <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800/90 dark:border-zinc-800 dark:bg-zinc-950">
        <li className="bg-gradient-to-r from-orange-50/40 via-white to-sky-50/30 px-5 py-3.5 transition-colors hover:from-orange-50/70 dark:from-emerald-950/25 dark:via-zinc-950 dark:to-cyan-950/20 dark:hover:from-emerald-950/40">
          <a
            href={ALUX_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700/90 dark:text-amber-400/90">
                Partner spotlight
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Explore videos & courses on ALUX.com
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Opens in a new window · curated for readers who want sharper habits
              </p>
            </div>
            <span
              className={`mt-2 inline-flex shrink-0 items-center gap-1 self-start text-sm sm:mt-0 sm:self-center ${linkAccent}`}
            >
              Go to site
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </a>
        </li>
      </ul>
    </div>
  );
}

const CONTENT_TYPES = [
  { key: "featured", label: "Featured", icon: Star },
  { key: "latest", label: "Latest", icon: Clock },
  { key: "expert-picks", label: "Expert picks", icon: BookOpen },
  { key: "guides", label: "Guides", icon: BookOpen },
  { key: "trending", label: "Top stories", icon: Flame },
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]["key"];

const POST_BASE = "/post";

type PostListContentProps = {
  partitioned: PartitionedPosts;
  categoriesWithCounts: CategoryWithCount[];
  sidebarTools: SiteTool[];
  popularPosts: Post[];
};

export default function PostListContent({
  partitioned,
  categoriesWithCounts: _categoriesWithCounts,
  sidebarTools,
  popularPosts,
}: PostListContentProps) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "latest";
  const category = searchParams.get("category") || "";
  const queryParam = searchParams.get("q") || "";
  const type = (CONTENT_TYPES.some((t) => t.key === typeParam) ? typeParam : "latest") as ContentType;

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [sortBy, setSortBy] = useState("newest");
  const [filterCategory, setFilterCategory] = useState(category || "All Categories");
  const [latestArticlesPage, setLatestArticlesPage] = useState(1);
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  const matchingTools = useMemo(() => {
    const q = searchTerm.trim();
    if (q.length < 2) return [];
    return siteTools.filter((t) => toolMatchesSearch(t, q));
  }, [searchTerm]);

  const allPublished = useMemo(() => flattenPartitioned(partitioned), [partitioned]);

  const allCategories = useMemo(
    () => [
      "All Categories",
      ...Array.from(new Set(allPublished.flatMap((p) => categoryLabelList(p)))).sort(),
    ],
    [allPublished]
  );

  const displayPosts = useMemo(() => {
    const base = queryParam.trim()
      ? filterPostsBySearch(allPublished, queryParam)
      : postsForTabType(partitioned, type);
    return sortPosts(filterPostsByCategory(base, filterCategory), sortBy);
  }, [allPublished, partitioned, queryParam, type, filterCategory, sortBy]);

  const editorialSections = useMemo(
    () => buildMajorSections(displayPosts, 5, 4),
    [displayPosts]
  );
  const leftSections = useMemo(() => editorialSections.slice(0, 2), [editorialSections]);
  const rightSections = useMemo(() => editorialSections.slice(2, 5), [editorialSections]);

  const latestGridPool = useMemo(() => {
    let pool = queryParam.trim() ? filterPostsBySearch(allPublished, queryParam) : allPublished;
    pool = filterPostsByCategory(pool, filterCategory);
    return sortPosts(pool, sortBy);
  }, [allPublished, queryParam, filterCategory, sortBy]);

  const analysisFeed = useMemo(() => getAnalysisFeed(partitioned), [partitioned]);
  const topPicksPosts = useMemo(() => getTopPicksPosts(partitioned, 8), [partitioned]);

  const isArticleType = queryParam ? true : type === "featured" || type === "latest" || type === "expert-picks";

  const monthPicksUpper = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date()).toUpperCase(),
    []
  );

  const showEditorialLead = isArticleType || type === "guides" || type === "trending";

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

  const editorialTabLabel = useMemo(() => {
    if (queryParam.trim()) return "Search";
    const row = CONTENT_TYPES.find((t) => t.key === type);
    return row?.label ?? "Latest";
  }, [queryParam, type]);

  const latestArticlesTotalPages = Math.max(
    1,
    Math.ceil(latestGridPool.length / LATEST_ARTICLES_PAGE_SIZE)
  );
  const latestArticlesSlice = useMemo(() => {
    const start = (latestArticlesPage - 1) * LATEST_ARTICLES_PAGE_SIZE;
    return latestGridPool.slice(start, start + LATEST_ARTICLES_PAGE_SIZE);
  }, [latestArticlesPage, latestGridPool]);

  useEffect(() => {
    setLatestArticlesPage(1);
  }, [queryParam, type, filterCategory, sortBy]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Ambient layers */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/30 dark:to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[28rem] right-[-10%] h-96 w-96 rounded-full bg-orange-100/30 blur-3xl dark:bg-cyan-950/25"
        aria-hidden
      />
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Back to home
            </Link>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Article library
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">
                  {pageTitle}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                  Browse by section, filter by category, and search articles and tools in one place.
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <LayoutGrid className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
                    Browse
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Use the search bar below to filter and discover matching tools.
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
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    type === key
                      ? "inline-flex h-8 items-center justify-center rounded-lg bg-zinc-900 px-4 text-xs font-medium text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                      : "inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
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

            {showEditorialLead ? (
              <section className="mb-10" aria-label="Featured coverage">
                <div className="mb-4 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Articles
                    </p>
                    <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl dark:text-zinc-100">
                      {editorialTabLabel}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                      Curated picks
                    </span>
                  </div>
                </div>

                {displayPosts.length === 0 ? (
                  <EmptyState
                    iconKey="FileText"
                    title="No articles found"
                    description="Try another section, category, or search term."
                    compact
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
                    <div className="min-w-0 space-y-8 lg:col-span-5">
                      <CompactMajorBlocks sections={rightSections} />
                    </div>
                    <div className="min-w-0 lg:col-span-7">
                      <div className="space-y-7">
                        <MajorCoverageStack
                          sections={leftSections}
                          heroSizes="(min-width: 1024px) 42vw, 100vw"
                        />
                        <AluxPostListLeadCard />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            ) : null}
          </div>

          {/* Column 2 — right rail (same as Home column 3) */}
          <aside className="order-2 space-y-8 lg:order-2 lg:col-span-3">
            <PopularRail posts={popularPosts} limit={5} viewAllHref={POST_BASE} />

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
              <h3 className="border-b border-zinc-200 pb-3 font-display text-lg font-bold leading-tight tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                Find the Best Financial Tools
              </h3>
              {/* Mobile: swipeable tool cards */}
              <div className="mt-4 md:hidden ml-3">
                <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {siteTools.map((tool) => {
                    const ToolIcon = iconMap[tool.iconKey || "Calculator"] ?? Calculator;
                    return (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="group snap-start rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-cyan-800 dark:hover:bg-zinc-900"
                      >
                        <div className="flex w-[15rem] items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-3">
                            <span className={`${iconWrapSm} shrink-0`}>
                              <ToolIcon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0 block line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                              {tool.name}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-blue-700 dark:group-hover:text-cyan-400 flex items-center" aria-hidden />
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

            <TopPicksRail
              posts={topPicksPosts}
              monthLabel={monthPicksUpper}
              limit={8}
              viewAllHref={`${POST_BASE}?type=guides`}
            />
          </aside>
        </div>
      </div>
      {/* Article Section End */}

      {/* Full-width sections (no sidebar) — order matches request: analysis first, then latest grid */}
      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                Latest analysis
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                LATEST ANALYSIS
              </h2>
            </div>
            <Link href={`${POST_BASE}?type=trending`} className={`shrink-0 text-sm font-semibold ${linkAccent}`}>
              View all <ChevronRight className="inline h-4 w-4" aria-hidden />
            </Link>
          </div>

          <LatestAnalysisBlock
            featured={analysisFeed.featured}
            items={analysisFeed.items}
            viewAllHref={`${POST_BASE}?type=trending`}
          />
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Latest
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Latest Articles
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <p className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                Page {latestArticlesPage} of {latestArticlesTotalPages} · {latestGridPool.length} total
              </p>
              <Link href={POST_BASE} className={`shrink-0 text-sm font-semibold ${linkAccent}`}>
                View all <ChevronRight className="inline h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <PostGrid posts={latestArticlesSlice} />

          {latestArticlesTotalPages > 1 ? (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 dark:border-zinc-800 sm:flex-row">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Showing {(latestArticlesPage - 1) * LATEST_ARTICLES_PAGE_SIZE + 1}–
                {Math.min(latestArticlesPage * LATEST_ARTICLES_PAGE_SIZE, latestGridPool.length)} of{" "}
                {latestGridPool.length}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setLatestArticlesPage((p) => Math.max(1, p - 1))}
                  disabled={latestArticlesPage === 1}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/40"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, latestArticlesTotalPages) }, (_, i) => {
                  const page =
                    latestArticlesTotalPages <= 5
                      ? i + 1
                      : latestArticlesPage <= 3
                        ? i + 1
                        : latestArticlesPage >= latestArticlesTotalPages - 2
                          ? latestArticlesTotalPages - 4 + i
                          : latestArticlesPage - 2 + i;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setLatestArticlesPage(page)}
                      className={`rounded-xl px-4 py-2 text-sm transition-colors ${
                        latestArticlesPage === page
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                          : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/40"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setLatestArticlesPage((p) => Math.min(latestArticlesTotalPages, p + 1))}
                  disabled={latestArticlesPage === latestArticlesTotalPages}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
