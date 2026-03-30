"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Heart,
  Bookmark,
  Wrench,
  ArrowUpRight,
} from "lucide-react";
import type { Post } from "../lib/types";
import { postPublicPath } from "../lib/post-url";
import { CategoryPills, categoryLabelList, postHasCategory, postMatchesSearch } from "../lib/post-display";
import type { CategoryWithCount, PartitionedPosts } from "../lib/posts";
import type { SiteTool } from "../lib/site-config";
import { siteTools } from "../lib/site-config";
import { toolMatchesSearch } from "../lib/tools-utils";
import { usePostEngagement } from "../hooks/usePostEngagement";
import EmptyState from "./EmptyState";
import { proxiedImageSrc } from "../lib/image-proxy";

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
};

const CONTENT_TYPES = [
  { key: "featured", label: "Featured", icon: Star },
  { key: "latest", label: "Latest", icon: Clock },
  { key: "expert-picks", label: "Expert Picks", icon: BookOpen },
  { key: "guides", label: "Popular Guides", icon: BookOpen },
  { key: "trending", label: "Trending Now", icon: Flame },
] as const;

type ContentType = (typeof CONTENT_TYPES)[number]["key"];

const ITEMS_PER_PAGE = 10;
const POST_BASE = "/post";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

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

  const pageTitle = queryParam
    ? `Search results for "${queryParam}"`
    : type === "featured"
      ? "Featured Articles"
      : type === "expert-picks"
        ? "Expert Picks"
        : type === "guides"
          ? "Popular Guides"
          : type === "trending"
            ? "Trending Now"
            : category
              ? `${category} Articles`
              : "Latest Articles";

  const isArticleType = queryParam ? true : type === "featured" || type === "latest" || type === "expert-picks";

  function ArticleItem({ article, from }: { article: Post; from: string }) {
    const { likes, isLiked, isBookmarked, handleLike, handleBookmark } = usePostEngagement(
      article.id,
      article.likes,
      article.bookmarks
    );
    return (
      <Link
        href={`${postPublicPath(article)}?from=${from}`}
        className="group block"
      >
        {viewMode === "grid" ? (
          <div className="bg-white dark:bg-dark-900/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-purple-500/30 hover:-translate-y-2">
            <div className="relative h-48">
              <Image
                src={proxiedImageSrc(article.image)}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 max-w-[calc(100%-5rem)]">
                <CategoryPills categories={categoryLabelList(article)} variant="overlay" max={3} />
              </span>
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={handleBookmark}
                  className={`p-2 rounded-full transition-colors ${
                    isBookmarked
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
                      : "bg-white/90 dark:bg-white/80 text-slate-700 hover:bg-white"
                  }`}
                  aria-label="Bookmark"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-200 mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-slate-600 dark:text-purple-200 text-sm line-clamp-2 mb-4 leading-relaxed">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-purple-300/80">
                <span className="flex items-center gap-2">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </span>
                  <span>{article.views} views</span>
                </span>
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1 transition-colors ${
                    isLiked ? "text-red-600 dark:text-red-400" : "hover:text-red-600 dark:hover:text-red-400"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {likes}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-900/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-purple-500/30 hover:-translate-y-1 flex flex-col md:flex-row">
            <div className="md:w-1/3 relative h-48 md:min-h-[200px]">
              <Image
                src={proxiedImageSrc(article.image)}
                alt={article.title}
                fill
                className="object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={handleBookmark}
                  className={`p-2 rounded-full transition-colors ${
                    isBookmarked
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
                      : "bg-white/90 dark:bg-white/80 text-slate-700 hover:bg-white"
                  }`}
                  aria-label="Bookmark"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <CategoryPills categories={categoryLabelList(article)} max={4} />
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-purple-200 mt-3 mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-slate-600 dark:text-purple-200 mb-4 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-purple-300/80">
                <span>{article.author.name} • {article.readTime} • {article.views} views</span>
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1 transition-colors ${
                    isLiked ? "text-red-600 dark:text-red-400" : "hover:text-red-600 dark:hover:text-red-400"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {likes} likes
                </button>
              </div>
            </div>
          </div>
        )}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-amber-800 dark:from-dark-900 dark:via-dark-850 dark:to-dark-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-400/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-amber-400/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-purple-200 hover:text-white mb-6 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="text-center max-w-4xl mx-auto">
            <span className="text-purple-100 dark:text-purple-200 text-sm font-medium">
              {totalCount} {type === "guides" ? "guides" : type === "trending" ? "topics" : "articles"} • Explore & read
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance mt-2">
              {pageTitle}
            </h1>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {CONTENT_TYPES.map(({ key, label }) => (
                <Link
                  key={key}
                  href={
                    key === "latest"
                      ? queryParam ? `${POST_BASE}?q=${encodeURIComponent(queryParam)}` : POST_BASE
                      : `${POST_BASE}?type=${key}${queryParam ? `&q=${encodeURIComponent(queryParam)}` : ""}`
                  }
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    type === key
                      ? "bg-white text-purple-600 dark:text-purple-700 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {isArticleType && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-white text-purple-600 dark:text-purple-700 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <List className="h-4 w-4 inline mr-1" /> List
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-white text-purple-600 dark:text-purple-700 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Grid className="h-4 w-4 inline mr-1" /> Grid
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {isArticleType && (
        <section className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 border-b border-slate-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-purple-400" />
                <input
                  type="text"
                  placeholder="Search articles & tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-purple-500/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500/50 bg-slate-50 dark:bg-dark-850/50 dark:text-dark-100"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-500 dark:text-purple-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white dark:bg-dark-900/50 border border-slate-300 dark:border-purple-500/50 rounded-xl px-4 py-2 text-sm dark:text-purple-200"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-dark-900/50 border border-slate-300 dark:border-purple-500/50 rounded-xl px-4 py-2 text-sm dark:text-purple-200"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {matchingTools.length > 0 && (
              <section
                className="mb-8 rounded-2xl border border-purple-200/80 dark:border-purple-500/40 bg-gradient-to-br from-purple-50/90 to-amber-50/50 dark:from-purple-950/40 dark:to-dark-850/60 p-6 shadow-sm"
                aria-label="Matching tools"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="h-5 w-5 text-purple-600 dark:text-emerald-400" aria-hidden />
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-purple-100">
                    Matching tools
                  </h2>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
                  {matchingTools.map((tool) => {
                    const ToolIcon = iconMap[tool.iconKey || "Calculator"] ?? Calculator;
                    return (
                      <li key={tool.slug}>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="flex items-center gap-3 rounded-xl bg-white/90 dark:bg-dark-900/70 border border-slate-200/80 dark:border-purple-500/30 p-4 hover:border-purple-400 dark:hover:border-emerald-500/50 hover:shadow-md transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-amber-600 flex items-center justify-center flex-shrink-0">
                            <ToolIcon className="h-5 w-5 text-white" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                              {tool.name}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-purple-300/90 line-clamp-2">{tool.tagline}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 flex-shrink-0" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href="/tools"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-emerald-300"
                >
                  Browse all tools <ChevronRight className="h-4 w-4" />
                </Link>
              </section>
            )}

            {paginatedItems.length === 0 ? (
              matchingTools.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-slate-50/80 dark:bg-dark-900/40 px-6 py-10 text-center">
                  <p className="text-slate-700 dark:text-purple-200 font-medium mb-2">No articles match this search.</p>
                  <p className="text-sm text-slate-600 dark:text-purple-300/90 max-w-md mx-auto">
                    Try different keywords, clear filters, or use the matching tools above.
                  </p>
                  <Link
                    href="/tools"
                    className="inline-flex mt-6 text-sm font-bold text-purple-600 dark:text-emerald-400 hover:underline"
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
                <p className="text-slate-600 dark:text-purple-200 mb-6">
                  Showing{" "}
                  <span className="font-semibold">
                    {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, totalCount)}
                  </span>{" "}
                  of <span className="font-semibold">{totalCount}</span>
                </p>

                {isArticleType && (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                        : "space-y-6"
                    }
                  >
                    {paginatedItems.map((article) => (
                      <ArticleItem key={article.id} article={article} from={type} />
                    ))}
                  </div>
                )}

                {type === "guides" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {paginatedItems.map((guide) => (
                      <Link
                        key={guide.id}
                        href={`${postPublicPath(guide)}?from=guides`}
                        className="group block bg-white dark:bg-dark-900/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-purple-500/30 hover:-translate-y-2"
                      >
                        <CategoryPills
                          categories={categoryLabelList(guide)}
                          variant="muted"
                          max={3}
                          className="[&>span]:text-[10px] [&>span]:uppercase [&>span]:tracking-wide"
                        />
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-200 mt-2 mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                          {guide.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-purple-300/80">
                          <span>{guide.readTime}</span>
                          <span>-</span>
                        </div>
                        <span className="inline-flex items-center mt-4 text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:text-purple-700 dark:hover:text-purple-300 group-hover:gap-2 transition-all gap-1">
                          Read guide <ChevronRight className="h-4 w-4" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {type === "trending" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {paginatedItems.map((post) => (
                      <Link
                        key={post.id}
                        href={`${postPublicPath(post)}?from=trending`}
                        className="group flex items-center gap-4 bg-white dark:bg-dark-900/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-purple-500/30 hover:-translate-y-2"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Flame className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-slate-900 dark:text-purple-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-purple-300/80">
                            <span>{post.views} views</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-purple-500 dark:text-purple-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-4">
                    <p className="text-sm text-slate-600 dark:text-purple-200">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-slate-300 dark:border-purple-500/50 rounded-xl text-slate-700 dark:text-purple-200 hover:bg-slate-50 dark:hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            className={`px-4 py-2 rounded-xl transition-colors ${
                              currentPage === page
                                ? "bg-purple-600 text-white"
                                : "border border-slate-300 dark:border-purple-500/50 text-slate-700 dark:text-purple-200 hover:bg-slate-50 dark:hover:bg-purple-900/30"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-slate-300 dark:border-purple-500/50 rounded-xl text-slate-700 dark:text-purple-200 hover:bg-slate-50 dark:hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-xl p-6 shadow-lg border border-slate-200">
              <h3 className="font-display font-bold text-slate-900 dark:text-purple-200 mb-4">
                Browse by Category
              </h3>
              <div className="space-y-2">
                {categoriesWithCounts.map((cat, i) => {
                  const IconComponent = iconMap[cat.iconKey ?? "BookOpen"] ?? BookOpen;
                  return (
                    <Link
                      key={i}
                      href={`${POST_BASE}?category=${encodeURIComponent(cat.name)}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color ?? "from-purple-500 to-purple-600"} flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-sm text-slate-900 dark:text-purple-200 group-hover:text-purple-600 dark:group-hover:text-emerald-400 block truncate">
                          {cat.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-purple-300">{cat.count}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h3 className="font-display font-bold text-slate-900 dark:text-purple-200">
                    Trending Now
                  </h3>
                </div>
                <Link
                  href={`${POST_BASE}?type=trending`}
                  className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {partitioned.trending.slice(0, 5).map((p) => (
                    <Link
                      key={p.id}
                      href={`${postPublicPath(p)}?from=trending`}
                      className="block p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                    >
                      <p className="font-semibold text-sm text-slate-900 dark:text-purple-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                        {p.title}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-purple-300">{p.views}</span>
                    </Link>
                  ))}
              </div>
              {partitioned.trending.length === 0 && (
                <EmptyState
                  icon={Flame}
                  title="No trending posts"
                  compact
                />
              )}
            </div>

            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-purple-500" />
                  <h3 className="font-display font-bold text-slate-900 dark:text-purple-200">
                    Quick Tools
                  </h3>
                </div>
                <span className="text-xs font-medium text-purple-500 dark:text-purple-400/90">Spotlight</span>
              </div>
              <div className="space-y-3">
                {sidebarTools.map((tool) => {
                  const ToolIcon = iconMap[tool.iconKey || "Calculator"] ?? Calculator;
                  return (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="block flex items-center justify-between gap-2 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <ToolIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-purple-200 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 text-start">
                          {tool.name}
                        </span>
                      </div>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 dark:border-purple-500/35 bg-slate-50/90 dark:bg-dark-850/60 text-slate-400 group-hover:border-purple-300 group-hover:bg-purple-100/80 group-hover:text-purple-600 dark:group-hover:border-emerald-500/45 dark:group-hover:bg-emerald-950/30 dark:group-hover:text-emerald-400 transition-all group-hover:scale-105"
                        aria-hidden
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/tools"
                className="mt-4 flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-sm hover:text-purple-700 dark:hover:text-purple-300 transition-colors py-2"
              >
                All tools <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <h3 className="font-display font-bold text-slate-900 dark:text-purple-200">
                    Popular Guides
                  </h3>
                </div>
                <Link
                  href={`${POST_BASE}?type=guides`}
                  className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  Read more
                </Link>
              </div>
              <div className="space-y-4">
                {partitioned.guides.slice(0, 5).map((guide) => (
                    <Link
                      key={guide.id}
                      href={`${postPublicPath(guide)}?from=guides`}
                      className="block p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                    >
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-purple-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                        {guide.title}
                      </h4>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-purple-200">
                        <CategoryPills categories={categoryLabelList(guide)} variant="muted" max={2} className="min-w-0" />
                        <span className="shrink-0">{guide.readTime}</span>
                      </div>
                    </Link>
                  ))}
              </div>
              {partitioned.guides.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No guides yet"
                  compact
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
