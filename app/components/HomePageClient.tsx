"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock,
  Eye,
  Bookmark,
  Filter,
  Share2,
  Check,
  Star,
  CheckCircle,
  Users,
  Flame,
  Calculator,
  BarChart3,
  PieChart,
  DollarSign,
  Activity,
  CreditCard,
  Home,
  Target,
  Building2,
  Scale,
  Brain,
  TrendingUp,
  TrendingDown,
  Globe2,
  Heart,
  Bitcoin,
  Gem,
  Droplet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Post } from "../lib/types";
import { postPublicPath } from "../lib/post-url";
import { CategoryPills, categoryLabelList, postHasCategory } from "../lib/post-display";
import type { CategoryWithCount } from "../lib/posts";
import type { MarketDataItem } from "../lib/market-data";
import { formatPublishDate } from "../lib/format-date";
import type { SiteTool } from "../lib/site-config";
import { proxiedImageSrc } from "../lib/image-proxy";
import { usePostEngagement } from "../hooks/usePostEngagement";
import EmptyState from "./EmptyState";

/** Matches `label` from `getMarketData()` in `app/lib/market-data.ts` */
const MARKET_LABEL_ICONS: Record<string, LucideIcon> = {
  "S&P 500": BarChart3,
  NASDAQ: Activity,
  DOW: Building2,
  Bitcoin,
  Gold: Gem,
  Oil: Droplet,
};

function postUrl(article: Post): string {
  if (typeof window === "undefined") return postPublicPath(article);
  return `${window.location.origin}${postPublicPath(article)}`;
}

async function shareArticle(article: Post): Promise<"shared" | "copied"> {
  const url = postUrl(article);
  try {
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.excerpt, url });
      return "shared";
    }
  } catch {
    // user cancelled or share failed -> fallback to copy
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

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
  PieChart,
  DollarSign,
  TrendingUp,
  Building2,
  Bitcoin,
  Heart,
};

const cardSurface =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80";

const iconWrap =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300 sm:h-12 sm:w-12";

const iconWrapSm =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

const sectionKicker = "text-xs font-semibold tracking-widest text-orange-800/80 dark:text-cyan-400/90";

const linkAccent =
  "font-semibold text-blue-800 transition-colors hover:text-blue-900 dark:text-cyan-300 dark:hover:text-cyan-200";

function formatListDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function likeHeartButtonClass(isLiked: boolean): string {
  return isLiked
    ? "text-red-600 fill-red-600 dark:text-red-500 dark:fill-red-500"
    : "text-zinc-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-500";
}

function EditorialSectionHeader({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{kicker}</p>
        <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl dark:text-zinc-100">
          {title}
        </h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function CategoryBrowseStrip({ categoriesWithCounts }: { categoriesWithCounts: CategoryWithCount[] }) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const rafRef = useRef<number>(0);
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoScroll = categoriesWithCounts.length > 10;

  const clearResume = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const scheduleResume = () => {
    clearResume();
    resumeTimerRef.current = setTimeout(() => setPaused(false), 2200);
  };

  useEffect(() => {
    if (!autoScroll || paused) return;
    const tick = () => {
      const node = scrollRef.current;
      if (!node) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const max = node.scrollWidth - node.clientWidth;
      if (max <= 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      node.scrollLeft += 0.4;
      if (node.scrollLeft >= max - 0.5) {
        node.scrollLeft = 0;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoScroll, paused, categoriesWithCounts.length]);

  useEffect(() => () => clearResume(), []);

  const onPointerDown = () => {
    if (!autoScroll) return;
    clearResume();
    setPaused(true);
  };

  const onPointerUp = () => {
    if (!autoScroll) return;
    scheduleResume();
  };

  const ulClass = autoScroll
    ? "scrollbar-hide mt-4 -mx-4 flex list-none gap-3 overflow-x-auto scroll-smooth pb-3 pl-4 pr-4 pt-0.5 touch-pan-x snap-x snap-mandatory sm:-mx-6 sm:gap-4 sm:pl-6 sm:pr-6 lg:mx-0 lg:gap-4 lg:px-0"
    : "mt-4 -mx-4 flex list-none gap-3 overflow-x-auto scroll-smooth pb-3 pl-4 pr-4 pt-0.5 touch-pan-x snap-x snap-mandatory sm:-mx-6 sm:gap-4 sm:pl-6 sm:pr-6 lg:mx-0 lg:gap-4 lg:px-0 [scrollbar-width:thin]";

  return (
    <ul
      ref={scrollRef}
      className={ulClass}
      aria-label="Browse by category"
      onPointerDown={autoScroll ? onPointerDown : undefined}
      onPointerUp={autoScroll ? onPointerUp : undefined}
      onPointerLeave={autoScroll ? onPointerUp : undefined}
    >
      {categoriesWithCounts.map((category, index) => {
        const IconComponent = iconMap[category.iconKey || "BookOpen"] ?? BookOpen;
        return (
          <li key={index} className="w-[min(10.5rem,calc(100vw-4rem))] shrink-0 snap-start sm:w-40">
            <Link
              href={`/post?category=${encodeURIComponent(category.name)}`}
              className={`group flex h-full flex-col text-center ${cardSurface} p-4 sm:p-5`}
            >
              <div className={`${iconWrap} mx-auto mb-3`}>
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
              </div>
              <h3 className="mb-1.5 line-clamp-2 font-display text-sm font-bold leading-snug text-zinc-900 sm:text-base dark:text-zinc-100">
                {category.name}
              </h3>
              <p className="mt-auto text-sm text-zinc-500 dark:text-zinc-400">{category.count}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function FeaturedArticleCard({ article }: { article: Post }) {
  const { likes, isLiked, isBookmarked, handleLike, handleBookmark } = usePostEngagement(
    article.id,
    article.likes,
    article.bookmarks
  );
  return (
    <Link
      href={postPublicPath(article)}
      className={`group block overflow-hidden ${cardSurface}`}
    >
      <div className="relative">
        <Image
          src={proxiedImageSrc(article.image)}
          alt={article.title}
          width={800}
          height={192}
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-44"
        />
        <span className="absolute top-3 left-3 max-w-[calc(100%-5rem)]">
          <CategoryPills categories={categoryLabelList(article)} variant="overlay" max={3} />
        </span>
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            type="button"
            onClick={handleBookmark}
            className={`p-1.5 rounded-full transition-colors ${
              isBookmarked
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
                : "bg-white/90 dark:bg-white/80 text-slate-700 hover:bg-white"
            }`}
            aria-label="Bookmark"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center space-x-3 mb-2">
          <span className="inline-block rounded-full border border-zinc-200 dark:border-zinc-700 p-0.5">
            <Image
              src={proxiedImageSrc(article.author.image)}
              alt={article.author.name}
              width={32}
              height={32}
              className="w-7 h-7 rounded-full object-cover"
            />
          </span>
          <div className="text-xs">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{article.author.name}</p>
            <p className="text-zinc-500 dark:text-zinc-400">{formatPublishDate(article.publishDate)}</p>
          </div>
        </div>
        <h3 className="font-display font-bold text-sm sm:text-base leading-tight text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-3 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-3">
          <div className="flex items-center space-x-3">
            <span className="flex items-center whitespace-nowrap min-w-0">
              <Clock className="h-3.5 w-3.5 mr-1 shrink-0" />
              <span className="truncate leading-none">{article.readTime}</span>
            </span>
            <span className="flex items-center whitespace-nowrap min-w-0">
              <Eye className="h-3.5 w-3.5 mr-1 shrink-0" />
              <span className="truncate leading-none">{article.views.toLocaleString()}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={isLiked}
            aria-label={isLiked ? "Unlike" : "Like"}
            className={`flex items-center gap-1 transition-colors ${likeHeartButtonClass(isLiked)} px-0.5 py-0.5`}
          >
            <Heart className={`h-3.5 w-3.5 shrink-0 ${isLiked ? "fill-current" : ""}`} aria-hidden />
            <span className="truncate leading-none">{likes.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

function LatestArticleRow({ article }: { article: Post }) {
  const { likes, isLiked, isBookmarked, handleLike, handleBookmark } = usePostEngagement(
    article.id,
    article.likes,
    article.bookmarks
  );
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await shareArticle(article);
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const shortDate = formatListDate(article.publishDate);

  return (
    <article className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
      <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:gap-6 sm:px-5 sm:py-6 lg:gap-8">
        <Link
          href={postPublicPath(article)}
          className="relative aspect-[5/3] w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:aspect-[4/3] sm:w-44 md:w-48 lg:w-52 dark:bg-zinc-900"
        >
          <Image
            src={proxiedImageSrc(article.image)}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(min-width: 1024px) 14rem, (min-width: 640px) 12rem, 100vw"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={postPublicPath(article)} className="group block min-w-0">
            <CategoryPills categories={categoryLabelList(article)} max={4} />
            <h3 className="mt-3 font-display text-xl font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 sm:text-2xl dark:text-zinc-100 dark:group-hover:text-cyan-300">
              {article.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:line-clamp-3">
              {article.excerpt}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-600">
                  <Image
                    src={proxiedImageSrc(article.author.image)}
                    alt=""
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                </span>
                {article.author.name}
              </span>
              <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
                ·
              </span>
              <time dateTime={article.publishDate}>{shortDate}</time>
            </div>
          </Link>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800/90">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {article.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {article.views.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleShare}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                aria-label="Share"
              >
                {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleBookmark}
                className={`rounded-lg p-2 transition-colors ${
                  isBookmarked
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                }`}
                aria-label="Bookmark"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
              <button
                type="button"
                onClick={handleLike}
                aria-pressed={isLiked}
                aria-label={isLiked ? "Unlike" : "Like"}
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm tabular-nums transition-colors ${likeHeartButtonClass(isLiked)}`}
              >
                <Heart className={`h-4 w-4 shrink-0 ${isLiked ? "fill-current" : ""}`} aria-hidden />
                {likes.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

type HomePageClientProps = {
  featuredPosts: Post[];
  latestPosts: Post[];
  expertPickPosts: Post[];
  trendingPosts: Post[];
  guidePosts: Post[];
  categoriesWithCounts: CategoryWithCount[];
  marketData: MarketDataItem[] | null;
  /** Daily-rotating subset for sidebar */
  sidebarTools: SiteTool[];
};

export default function HomePageClient({
  featuredPosts,
  latestPosts,
  expertPickPosts,
  trendingPosts,
  guidePosts,
  categoriesWithCounts,
  marketData,
  sidebarTools,
}: HomePageClientProps) {
  const [activeFilter, setActiveFilter] = useState("All Categories");
  const availableCategories = [
    "All Categories",
    ...Array.from(
      new Set(latestPosts.flatMap((p) => categoryLabelList(p)))
    ).sort(),
  ];
  const filteredArticles = latestPosts.filter(
    (article) =>
      activeFilter === "All Categories" || postHasCategory(article, activeFilter)
  );

  const monthPicksUpper = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date()).toUpperCase(),
    []
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/40">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  <Star className="h-3.5 w-3.5 fill-current text-orange-500 dark:text-cyan-400" aria-hidden />
                  4.9 reader rating
                </span>
                <span className="hidden h-3 w-px bg-zinc-200 sm:block dark:bg-zinc-700" aria-hidden />
                <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-emerald-400" aria-hidden />
                  2.5M+ readers
                </span>
              </div>

              <p className={`${sectionKicker} mt-5`}>HOME</p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
                <span className="text-blue-800 dark:text-emerald-300">Straightforward finance,</span>{" "}
                <span className="text-orange-600 dark:text-cyan-400">clearly explained.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
                Independent education and tools—editorial standards, primary sources, and comparisons built for readers
                who manage real money.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/post"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <BookOpen className="hidden h-5 w-5 sm:block" aria-hidden />
                  Explore articles
                  <ArrowRight className="hidden h-5 w-5 sm:block" aria-hidden />
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 font-semibold text-zinc-900 transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
                >
                  <Calculator className="h-5 w-5 sm:hidden" aria-hidden />
                  Use calculators
                </Link>
                <Link
                  href="#newsletter"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3.5 font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:text-blue-800 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:text-cyan-300"
                >
                  <Users className="h-5 w-5 sm:hidden" aria-hidden />
                  Weekly brief
                </Link>
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Built like a modern newsroom
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                  {[
                    { k: "2.5M+", v: "Monthly readers", accent: "blue" as const },
                    { k: "5,000+", v: "Articles", accent: "orange" as const },
                    { k: "10+", v: "Tools", accent: "blue" as const },
                    { k: "Daily", v: "Market snapshots", accent: "orange" as const },
                  ].map((s) => (
                    <div
                      key={s.v}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div
                        className={
                          s.accent === "blue"
                            ? "text-base font-bold tabular-nums text-blue-800 dark:text-emerald-300 sm:text-lg"
                            : "text-base font-bold tabular-nums text-orange-600 dark:text-cyan-400 sm:text-lg"
                        }
                      >
                        {s.k}
                      </div>
                      <div className="text-xs leading-snug text-zinc-600 dark:text-zinc-300 sm:text-sm">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className={iconWrap}>
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Editor’s brief</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Today’s reads, in plain English</div>
                    </div>
                  </div>
                  <Link href="/post" className={`text-xs ${linkAccent}`}>
                    View all
                  </Link>
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                  {(latestPosts.length ? latestPosts.slice(0, 3) : featuredPosts.slice(0, 3)).map((p) => (
                    <Link
                      key={p.id}
                      href={postPublicPath(p)}
                      className="group block rounded-xl border border-zinc-200 bg-zinc-50/80 p-3.5 transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-emerald-800/80 dark:hover:bg-zinc-900/60 sm:p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CategoryPills categories={categoryLabelList(p)} variant="muted" max={2} />
                          <div className="mt-2 font-display text-base font-bold leading-snug text-zinc-900 line-clamp-2 dark:text-zinc-100 sm:text-lg">
                            {p.title}
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" aria-hidden />
                              {p.readTime}
                            </span>
                            <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
                            <span>{formatPublishDate(p.publishDate)}</span>
                          </div>
                        </div>
                        <span
                          className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 transition-colors group-hover:border-blue-200 group-hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:group-hover:text-cyan-300"
                          aria-hidden
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  ))}

                  <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                    <Link
                      href="/tools"
                      className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-orange-50/50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80 dark:hover:bg-emerald-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tools</p>
                        <Calculator className="h-4 w-4 text-blue-700 dark:text-cyan-400" aria-hidden />
                      </div>
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                        Simulators and calculators for quick answers.
                      </p>
                    </Link>
                    <Link
                      href="/post?type=guides"
                      className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-orange-50/50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80 dark:hover:bg-emerald-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Guides</p>
                        <ChevronRight className="h-4 w-4 text-orange-600 dark:text-cyan-400" aria-hidden />
                      </div>
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                        Step-by-step explainers you can bookmark.
                      </p>
                    </Link>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                Editorial tone, practical takeaways—built to earn trust over time.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Market Data Section */}
      {marketData && marketData.length > 0 && (
        <section className="overflow-hidden border-t border-zinc-800 bg-zinc-950 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-2.5 sm:py-3">
              <div className="mr-4 flex shrink-0 items-center space-x-2 sm:space-x-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                <Globe2 className="h-5 w-5 text-cyan-300" aria-hidden />
                <span className="hidden text-sm font-bold text-zinc-100 sm:inline">Live market data</span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="ticker-scroll flex gap-3 pr-4 sm:gap-5">
                  {[...marketData, ...marketData].map((item, index) => {
                    const Icon = MARKET_LABEL_ICONS[item.symbol] ?? Globe2;
                    return (
                      <div
                        key={`${item.symbol}-${index}`}
                        className="flex shrink-0 items-center gap-2.5 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3 py-2 transition-colors hover:border-zinc-600 sm:gap-3 sm:px-4 sm:py-2.5"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-600/80 bg-zinc-800/80 text-zinc-100"
                          aria-hidden
                        >
                          <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-zinc-300 truncate">
                            {item.symbol}
                          </span>
                          <span className="text-sm sm:text-base font-bold tabular-nums text-white leading-tight">
                            {item.value}
                          </span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold tabular-nums whitespace-nowrap ${
                            item.positive
                              ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-300"
                              : "border-red-400/35 bg-red-500/15 text-red-300"
                          }`}
                        >
                          {item.positive ? (
                            <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          )}
                          {item.change}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Articles Section Start */}
      <div className="border-t border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8 lg:py-12">
          <div className="grid grid-cols-1 gap-9 lg:grid-cols-12 lg:gap-10 xl:gap-12">
            <div className="space-y-11 lg:col-span-8 xl:col-span-8">
              {/* Latest Articles — editorial list */}
              <section>
                <EditorialSectionHeader
                  kicker="Latest"
                  title="Latest articles"
                  action={
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden />
                        <select
                          value={activeFilter}
                          onChange={(e) => setActiveFilter(e.target.value)}
                          className="min-w-[10rem] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25"
                        >
                          {availableCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Link
                        href="/post"
                        className={`inline-flex items-center justify-center gap-1 text-sm ${linkAccent}`}
                      >
                        View all <ChevronRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  }
                />
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/90">
                    {filteredArticles.slice(0, 6).map((article) => (
                      <LatestArticleRow key={article.id} article={article} />
                    ))}
                  </div>
                </div>
                {filteredArticles.length === 0 && (
                  <div className="mt-4">
                    <EmptyState
                      icon={BookOpen}
                      title="No articles yet"
                      description="We're building our library. Come back soon for fresh financial insights."
                      ctaLabel="Browse categories"
                      ctaHref="/post"
                    />
                  </div>
                )}
              </section>

              {/* Browse by category */}
              <section>
                <EditorialSectionHeader kicker="Topics" title="Browse by category" />
                <CategoryBrowseStrip categoriesWithCounts={categoriesWithCounts} />
              </section>

              {/* Expert picks */}
              <section>
                <EditorialSectionHeader
                  kicker="Analysis"
                  title="Expert picks"
                  action={
                    <Link href="/post?type=expert-picks" className={`inline-flex items-center gap-1 text-sm ${linkAccent}`}>
                      View all <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  }
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {expertPickPosts.slice(0, 4).map((pick) => (
                    <Link
                      key={pick.id}
                      href={postPublicPath(pick)}
                      className="group flex flex-col border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60"
                    >
                      <div className="mb-3 flex items-start gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                        <span className="inline-block shrink-0 rounded-full border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
                          <Image
                            src={proxiedImageSrc(pick.author.image)}
                            alt={pick.author.name}
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{pick.author.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{pick.author.title}</p>
                        </div>
                      </div>
                      <CategoryPills categories={categoryLabelList(pick)} max={2} className="mb-3" />
                      <h3 className="font-display text-sm font-bold leading-snug text-zinc-900 group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300 sm:text-base">
                        {pick.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between pt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {pick.readTime}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-700 dark:group-hover:text-cyan-400" aria-hidden />
                      </div>
                    </Link>
                  ))}
                </div>
                {expertPickPosts.length === 0 && (
                  <EmptyState
                    icon={Star}
                    title="No expert picks yet"
                    description="Our experts are preparing their top recommendations."
                    ctaLabel="View latest articles"
                    ctaHref="/post"
                    compact
                  />
                )}
              </section>

              {/* Featured */}
              <section>
                <EditorialSectionHeader
                  kicker="Spotlight"
                  title="Featured articles"
                  action={
                    <Link href="/post?type=featured" className={`inline-flex items-center gap-1 text-sm ${linkAccent}`}>
                      View all <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  }
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {featuredPosts.slice(0, 6).map((article) => (
                    <FeaturedArticleCard key={article.id} article={article} />
                  ))}
                </div>
                {featuredPosts.length === 0 && (
                  <EmptyState
                    icon={Star}
                    title="No featured articles yet"
                    description="Check back soon for curated picks from our editorial team."
                    ctaLabel="Browse all articles"
                    ctaHref="/post"
                  />
                )}
              </section>
            </div>

            {/* Sidebar — Investopedia-style compact rails */}
            <aside className="space-y-8 lg:col-span-4 xl:col-span-4">
              <div className={`border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6`}>
                <h3 className="border-b border-zinc-200 pb-3 font-display text-lg font-bold tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                  Other Top Stories
                </h3>
                <ul className="mt-4 space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                  {trendingPosts.slice(0, 6).map((post) => (
                    <li key={post.id}>
                      <Link
                        href={postPublicPath(post)}
                        className="group block py-3.5 text-sm leading-snug text-zinc-800 transition-colors first:pt-0 last:pb-0 hover:text-blue-800 dark:text-zinc-200 dark:hover:text-cyan-300"
                      >
                        <span className="line-clamp-3 font-medium">{post.title}</span>
                        <span className="mt-1 block text-xs tabular-nums text-zinc-500 dark:text-zinc-500">
                          {post.views.toLocaleString()} views
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {trendingPosts.length === 0 && (
                  <EmptyState
                    icon={Flame}
                    title="No stories yet"
                    description="Check back soon."
                    compact
                  />
                )}
                <Link
                  href="/post?type=trending"
                  className={`mt-4 flex items-center gap-1 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
                >
                  View more <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              <div className={`border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6`}>
                <h3 className="border-b border-zinc-200 pb-3 font-display text-lg font-bold leading-tight tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                  Find the Best Financial Tools
                </h3>
                <ul className="mt-4 space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                  {sidebarTools.map((tool) => {
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
              </div>

              <div className={`border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6`}>
                <h3 className="border-b border-zinc-200 pb-3 font-display text-base font-bold leading-snug tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100 sm:text-lg">
                  OUR TOP PICKS FOR {monthPicksUpper}
                </h3>
                <ul className="mt-4 space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                  {guidePosts.slice(0, 6).map((guide) => (
                    <li key={guide.id}>
                      <Link
                        href={postPublicPath(guide)}
                        className="group block py-3.5 text-sm leading-snug first:pt-0 last:pb-0"
                      >
                        <span className="line-clamp-3 font-medium text-zinc-800 transition-colors group-hover:text-blue-800 dark:text-zinc-200 dark:group-hover:text-cyan-300">
                          {guide.title}
                        </span>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-500">
                          <CategoryPills categories={categoryLabelList(guide)} variant="muted" max={2} className="min-w-0" />
                          <span className="tabular-nums">{guide.readTime}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {guidePosts.length === 0 && (
                  <EmptyState
                    icon={BookOpen}
                    title="No guides yet"
                    description="Step-by-step guides coming soon."
                    compact
                  />
                )}
                <Link
                  href="/post?type=guides"
                  className={`mt-4 flex items-center gap-1 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
                >
                  See all guides <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
      {/* Articles Section End */}
    </div>
  );
}
