"use client";

import { useState, useEffect, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
  CalendarDays,
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
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950 dark:text-cyan-300 sm:h-12 sm:w-12";

const iconWrapSm =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950 dark:text-cyan-300";

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
  const items = useMemo(
    () =>
      categoriesWithCounts
        .map((c) => ({ ...c, n: Number.parseInt(String(c.count || "0"), 10) || 0 }))
        .filter((c) => c.n > 0)
        .sort((a, b) => b.n - a.n),
    [categoriesWithCounts]
  );

  if (items.length === 0) return null;

  const MAX_VISIBLE = 6;
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, MAX_VISIBLE);
  const hiddenCount = Math.max(0, items.length - MAX_VISIBLE);

  return (
    <div className="mt-4">
      {/* Mobile: chip grid (thumb friendly) */}
      <div className="mt-3 md:hidden">
        <div className="grid grid-cols-2 gap-2">
          {visible.map((cat) => (
            <Link
              key={cat.name}
              href={`/post?category=${encodeURIComponent(cat.name)}`}
              className="group flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-cyan-800 dark:hover:bg-zinc-900 dark:hover:text-cyan-300"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white dark:ring-zinc-950"
                  style={{ backgroundColor: cat.color || "#71717a" }}
                  aria-hidden
                />
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold tabular-nums text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                {cat.n}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: vertical list */}
      <ul className="mt-2 hidden divide-y divide-zinc-100 dark:divide-zinc-800/90 md:block">
        {visible.map((cat) => (
          <li key={cat.name} className="first:pt-0 last:pb-0">
            <Link
              href={`/post?category=${encodeURIComponent(cat.name)}`}
              className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 hover:text-blue-800 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-cyan-300"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white dark:ring-zinc-950"
                  style={{ backgroundColor: cat.color || "#71717a" }}
                  aria-hidden
                />
                <span className="truncate leading-snug">{cat.name}</span>
              </span>
              <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs font-bold tabular-nums text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                {cat.n}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`flex w-full items-center justify-between gap-2 text-sm font-semibold ${linkAccent}`}
          >
            <span>{expanded ? "Show fewer" : `Show ${hiddenCount} more`}</span>
            {expanded ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      ) : null}
    </div>
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
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "bg-white text-slate-700 hover:bg-white dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
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
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
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
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
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
  const STATIC_TOP_STORY = {
    title: "Inflation is cooling, but your budget hasn’t noticed—here’s why",
    deck: "A practical breakdown of sticky prices, timing mismatches, and the levers you can pull this week.",
    label: "Today’s Brief",
    readTime: "6 min read",
    date: "Apr 9, 2026",
  };

  const STATIC_LATEST = [
    { title: "Mortgage rates: what a 0.25% move really changes", tag: "Housing", readTime: "5 min" },
    { title: "ETF basics: expense ratios that quietly eat returns", tag: "Investing", readTime: "7 min" },
    { title: "Credit utilization: the threshold most people miss", tag: "Credit", readTime: "4 min" },
    { title: "Budgeting systems: zero‑based vs 50/30/20 in real life", tag: "Personal Finance", readTime: "8 min" },
    { title: "Emergency fund targets: runway math for variable income", tag: "Planning", readTime: "6 min" },
  ];

  const STATIC_MARKET_MOVERS = [
    { symbol: "S&P 500", value: "6,782.81", change: "+2.5%", positive: true },
    { symbol: "NASDAQ", value: "22,635.00", change: "+2.8%", positive: true },
    { symbol: "DOW", value: "47,909.92", change: "+2.8%", positive: true },
    { symbol: "Bitcoin", value: "$71,020", change: "−0.9%", positive: false },
  ];

  const STATIC_LEFT_HEADLINES = [
    { title: "Stock market today: what moved and what matters next", tag: "Markets", readTime: "4 min" },
    { title: "The hidden cost of “buy now, pay later” on your cashflow", tag: "Personal finance", readTime: "6 min" },
    { title: "Treasury yields explained: the signal most investors ignore", tag: "Bonds", readTime: "5 min" },
    { title: "3 habits that quietly raise your credit score over time", tag: "Credit", readTime: "5 min" },
    { title: "Your budget should be seasonal — here’s the template", tag: "Budgeting", readTime: "7 min" },
    { title: "Index funds vs ETFs: the real differences that matter", tag: "Investing", readTime: "6 min" },
    { title: "Emergency fund math: runway by household type", tag: "Planning", readTime: "5 min" },
    { title: "Retirement contribution limits: what changed this year", tag: "Retirement", readTime: "3 min" },
    { title: "Mortgage pre-approval: a checklist that saves time", tag: "Housing", readTime: "6 min" },
    { title: "Debt payoff: a quick order-of-operations guide", tag: "Debt", readTime: "4 min" },
  ];

  const STATIC_MAJOR_STORIES = [
    {
      title: "The simple portfolio rule that makes rebalancing feel automatic",
      deck: "A clean framework for allocation bands, contribution routing, and the “when to rebalance” decision.",
      tag: "Investing",
      readTime: "8 min read",
      imageSrc: "/first.jpeg",
    },
    {
      title: "A smarter budget: track fewer categories, get better results",
      deck: "How to design a budget around decisions — not receipts — and still stay in control.",
      tag: "Personal finance",
      readTime: "7 min read",
      imageSrc: "/budget.png",
    },
  ];

  const STATIC_CENTER_SECTIONS = [
    {
      major: STATIC_MAJOR_STORIES[0],
      minors: [
        { title: "How to rebalance without overthinking it", tag: "Investing", readTime: "3 min", date: "Apr 9" },
        { title: "The allocation bands rule: a practical example", tag: "Education", readTime: "4 min", date: "Apr 8" },
        { title: "Contribution routing: the simplest automation", tag: "Planning", readTime: "3 min", date: "Apr 7" },
        { title: "Taxable vs IRA rebalancing: what to do first", tag: "Taxes", readTime: "5 min", date: "Apr 6" },
      ],
    },
    {
      major: STATIC_MAJOR_STORIES[1],
      minors: [
        { title: "Budget categories you can delete today", tag: "Budgeting", readTime: "4 min", date: "Apr 9" },
        { title: "The two-account method: checking + bills", tag: "Personal finance", readTime: "5 min", date: "Apr 8" },
        { title: "How to set targets when income varies", tag: "Planning", readTime: "4 min", date: "Apr 7" },
        { title: "Weekly budget review: a 10-minute routine", tag: "Habits", readTime: "3 min", date: "Apr 6" },
      ],
    },
    {
      major: {
        title: "Credit score moves: the 3 levers that matter most",
        deck: "A practical guide to utilization, age, and payment history—plus what to ignore.",
        tag: "Credit",
        readTime: "6 min read",
        imageSrc: "/first.jpeg",
      },
      minors: [
        { title: "Utilization targets: 10% vs 30% vs 0%", tag: "Credit", readTime: "4 min", date: "Apr 9" },
        { title: "Late payments: what “30 days” really means", tag: "Credit", readTime: "3 min", date: "Apr 8" },
        { title: "Average age of accounts: the slow advantage", tag: "Education", readTime: "4 min", date: "Apr 7" },
        { title: "Hard vs soft inquiries: the simple rule", tag: "Basics", readTime: "2 min", date: "Apr 6" },
      ],
    },
  ] as const;

  const STATIC_POPULAR = [
    { title: "How compound interest actually compounds (with examples)", tag: "Education" },
    { title: "Debt snowball vs avalanche: which wins (and when)?", tag: "Debt" },
    { title: "What is a good savings rate in 2026?", tag: "Saving" },
    { title: "Roth vs Traditional: a decision checklist", tag: "Retirement" },
    { title: "DTI explained: how lenders evaluate you", tag: "Loans" },
  ];

  const STATIC_LATEST_CAROUSEL = Array.from({ length: 20 }).map((_, i) => {
    const bank = [
      { category: "Investing", title: "ETFs vs index funds: the difference that matters", date: "Apr 9, 2026" },
      { category: "Credit", title: "Utilization: the simplest way to lift your score", date: "Apr 8, 2026" },
      { category: "Budgeting", title: "A two-account system that makes budgeting stick", date: "Apr 7, 2026" },
      { category: "Retirement", title: "401(k) match math: what to contribute first", date: "Apr 6, 2026" },
      { category: "Housing", title: "Mortgage points: when they pay off (and when they don’t)", date: "Apr 5, 2026" },
    ] as const;
    const row = bank[i % bank.length];
    const imageSrc = i % 2 === 0 ? "/first.jpeg" : "/budget.png";
    return { id: `latest-${i}`, ...row, imageSrc };
  });

  const STATIC_LATEST_ANALYSIS = {
    featured: {
      imageSrc: "/first.jpeg",
      category: "Markets",
      title: "The week’s big shift: why risk is back on the table",
      description:
        "A quick, plain-English breakdown of what changed in markets, what it means for your portfolio, and how to think about the next 30 days.",
      readTime: "7 min read",
      date: "Apr 9, 2026",
    },
    items: [
      { category: "Stocks", title: "Earnings season: what matters more than guidance", readTime: "4 min", date: "Apr 9, 2026" },
      { category: "Crypto", title: "Bitcoin’s move explained (without the hype)", readTime: "3 min", date: "Apr 8, 2026" },
      { category: "Rates", title: "Bond yields: the signal hidden in the curve", readTime: "5 min", date: "Apr 8, 2026" },
      { category: "Personal finance", title: "Budget reset: the fastest way to find $200/month", readTime: "4 min", date: "Apr 7, 2026" },
      { category: "Strategy", title: "A 3-step checklist for buying dips responsibly", readTime: "6 min", date: "Apr 6, 2026" },
      { category: "Retirement", title: "Contribution order: match, Roth, HSA, taxable?", readTime: "5 min", date: "Apr 6, 2026" },
    ],
  } as const;

  const monthPicksUpper = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date()).toUpperCase(),
    []
  );

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
      <section className="border-b border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
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
                <span className="bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">Straightforward finance, clearly explained.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
                Independent education and tools—editorial standards, primary sources, and comparisons built for readers
                who manage real money.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/post"
                  className="inline-flex h-12 gap-2 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                >
                  <BookOpen className="hidden h-5 w-5 sm:block" aria-hidden />
                  Explore articles
                  <ArrowRight className="hidden h-5 w-5 sm:block" aria-hidden />
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex h-12 gap-2 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  <Calculator className="h-5 w-5 sm:hidden" aria-hidden />
                  Use calculators
                </Link>
                <Link
                  href="#newsletter"
                  className="inline-flex h-12 gap-2 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
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

            <div className="lg:col-span-6 hidden md:block">
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
                      className="group block rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800/80 dark:hover:bg-zinc-800 sm:p-4"
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
                      className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-orange-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80 dark:hover:bg-emerald-950"
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
                      className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-orange-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80 dark:hover:bg-emerald-950"
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
                        className="flex shrink-0 items-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 transition-colors hover:border-zinc-600 sm:gap-3 sm:px-4 sm:py-2.5"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-100"
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
      <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8 lg:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
            {/* Column 1 — Left rail (more headlines + categories) */}
            <aside className="order-2 space-y-8 lg:order-1 lg:col-span-3">
              <section>
                <div className="border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Categories
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Browse by category
                  </h3>
                </div>
                <CategoryBrowseStrip categoriesWithCounts={categoriesWithCounts} />
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
                <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      News
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      More stories
                    </h3>
                  </div>
                </div>

                <ul className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                  {[...STATIC_LEFT_HEADLINES, ...STATIC_LATEST].slice(0, 13).map((item) => (
                    <li key={item.title} className="py-3.5 first:pt-0 last:pb-0">
                      <Link href="/post" className="group block">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                          {"tag" in item ? item.tag : "Latest"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                          {item.title}
                        </p>
                        {"readTime" in item && (
                          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {item.readTime}
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/post"
                  className={`mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
                >
                  View all
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </section>
            </aside>

            {/* Column 2 — Center (major stories with images + sub stories) */}
            <div className="order-1 space-y-8 lg:order-2 lg:col-span-6">
              <section>
                <div className="mb-4 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Top stories
                    </p>
                    <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl dark:text-zinc-100">
                      Major coverage
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                      Updated hourly
                    </span>
                  </div>
                </div>
                <div className="space-y-7">
                  {STATIC_CENTER_SECTIONS.slice(0, 3).map((section) => (
                    <div key={section.major.title} className="space-y-2">
                      <Link
                        href="/post"
                        className="group relative block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                          <Image
                            src={section.major.imageSrc}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            priority={false}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90">
                              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                                {section.major.tag}
                              </span>
                              <span className="text-white/70">{section.major.readTime}</span>
                            </div>
                            <h3 className="mt-3 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
                              {section.major.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm text-white/80">{section.major.deck}</p>
                          </div>
                        </div>
                      </Link>

                      <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800/90 dark:border-zinc-800 dark:bg-zinc-950">
                        {section.minors.slice(0, 4).map((minor) => (
                          <li key={minor.title} className="px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                            <Link href="/post" className="group block">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                                {minor.tag}
                              </p>
                              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                                {minor.title}
                              </p>
                              <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" aria-hidden />
                                  {minor.readTime}
                                </span>
                                <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
                                <span>{minor.date}</span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Column 3 — popular / tools / picks */}
            <aside className="order-3 space-y-8 lg:order-3 lg:col-span-3">
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
                      <Link href="/post" className="group block">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-bold tabular-nums text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                              {p.tag}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
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
                  Tools
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
                  {[
                    { title: "The 1% rule for big purchases", tag: "Spending", readTime: "4 min" },
                    { title: "A simple IRA contribution ladder", tag: "Retirement", readTime: "5 min" },
                    { title: "Debt payoff order that minimizes interest", tag: "Debt", readTime: "6 min" },
                    { title: "Mortgage points: when they pay off", tag: "Housing", readTime: "5 min" },
                    { title: "A two-account system that simplifies budgeting", tag: "Budgeting", readTime: "4 min" },
                    { title: "The easiest way to start an emergency fund", tag: "Saving", readTime: "4 min" },
                    { title: "401(k) match math: what to contribute first", tag: "Retirement", readTime: "5 min" },
                    { title: "A simple rule for credit card payoff order", tag: "Credit", readTime: "4 min" },
                  ].slice(0, 8).map((item) => (
                    <li key={item.title} className="py-3 first:pt-0 last:pb-0">
                      <Link href="/post" className="group block">
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
                  href="/post?type=guides"
                  className={`mt-4 flex items-center gap-1 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
                >
                  See all guides <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </div>
      {/* Articles Section End */}

      {/* Ads section (ALUX) */}
      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-orange-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950 sm:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute -top-28 left-1/2 h-80 w-[min(62rem,160%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-200/55 via-blue-200/25 to-transparent blur-3xl dark:from-cyan-950/40 dark:via-emerald-950/35 dark:to-transparent"
              aria-hidden
            />
            <div className="relative grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-center">
              <div className="order-2 lg:order-1 lg:col-span-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Sponsored
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-bold tracking-wide text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                    ALUX
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Motivation, money & personal growth
                  </span>
                </div>

                <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300 sm:text-3xl">
                  Upgrade your mindset with premium learning experiences.
                </h2>
           
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                  Discover motivational videos, courses, and bite-sized knowledge designed to help you build better habits,
                  stronger mental models, and long-term wealth thinking.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href="https://www.alux.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                  >
                    Visit ALUX
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                  </a>
                  <a
                    href="https://www.alux.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    Explore courses & videos
                  </a>
                </div>
              </div>

              <div className="order-1 lg:order-2 lg:col-span-5">
                <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="relative aspect-[3/2] w-full bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src="/alux.png"
                      alt="ALUX promotional creative"
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 20rem, 100vw"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles (horizontal) */}
      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Latest
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Latest Articles
              </h2>
            </div>
            <Link href="/post" className={`shrink-0 text-sm font-semibold ${linkAccent}`}>
              View all <ChevronRight className="inline h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="relative">
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {STATIC_LATEST_CAROUSEL.map((a) => (
                <Link
                  key={a.id}
                  href="/post"
                  className="group w-[min(18rem,calc(100vw-4rem))] shrink-0 snap-start overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80 sm:w-72"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={a.imageSrc}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="288px"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                      {a.category}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                      {a.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      <span>{a.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA + Video */}
      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[min(56rem,140%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/45 via-orange-100/20 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/20 dark:to-transparent"
              aria-hidden
            />
            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="order-2 lg:order-1 lg:col-span-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Start here
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                  <span className="text-blue-700 dark:text-emerald-400">Facts</span>{" "}
                  <span className="text-orange-600 dark:text-cyan-400">Deck </span>
                   makes money feel simple.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                  If you’re building financial literacy, you don’t need more noise—you need clear explanations,
                  practical frameworks, and tools you can trust. Watch the quick overview, then explore the library.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-200">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-700 dark:bg-cyan-300" aria-hidden />
                    <span>
                      <span className="font-semibold">Plain-English breakdowns</span> with real-world examples.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-600 dark:bg-emerald-300" aria-hidden />
                    <span>
                      <span className="font-semibold">Practical tools</span> to budget, plan, and compare options.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-700 dark:bg-cyan-300" aria-hidden />
                    <span>
                      <span className="font-semibold">Editorial-first</span> so the “why” is never hidden.
                    </span>
                  </li>
                </ul>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/post"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
                  >
                    Explore articles
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/tools"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    Try the tools
                  </Link>
                </div>
              </div>

              <div className="order-1 lg:order-2 lg:col-span-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-sm dark:bg-zinc-900">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src="https://www.youtube.com/embed/Lys4EVugJmk?si=KRDBEyxIXdiNW_IX"
                    title="Facts Deck — Financial literacy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Analysis */}
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
            <Link href="/post?type=analysis" className={`shrink-0 text-sm font-semibold ${linkAccent}`}>
              View all <ChevronRight className="inline h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left (1/3): featured */}
            <div className="lg:col-span-4">
              <Link
                href="/post"
                className="group block overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={STATIC_LATEST_ANALYSIS.featured.imageSrc}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 28rem, 100vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                    {STATIC_LATEST_ANALYSIS.featured.category}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                    {STATIC_LATEST_ANALYSIS.featured.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {STATIC_LATEST_ANALYSIS.featured.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {STATIC_LATEST_ANALYSIS.featured.readTime}
                    </span>
                    <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
                    <span>{STATIC_LATEST_ANALYSIS.featured.date}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right (2/3): list */}
            <div className="lg:col-span-8">
              <div className="overflow-hidden bg-white dark:bg-zinc-950">
                <ul className="grid grid-cols-1 gap-3 p-4 sm:p-5 lg:grid-cols-2">
                  {STATIC_LATEST_ANALYSIS.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href="/post"
                        className="group block h-full rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800/80 dark:hover:bg-zinc-800 sm:p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CategoryPills categories={[item.category]} variant="muted" max={2} />
                            <div className="mt-2 font-display text-base font-bold leading-snug text-zinc-900 line-clamp-2 dark:text-zinc-100 sm:text-lg">
                              {item.title}
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" aria-hidden />
                                {item.readTime}
                              </span>
                              <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
                              <span>{item.date}</span>
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
                    </li>
                  ))}
                </ul>
                <Link
                  href="/post?type=analysis"
                  className={`flex items-center justify-between gap-2 border-t border-zinc-100 px-5 py-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
                >
                  Browse more analysis
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
