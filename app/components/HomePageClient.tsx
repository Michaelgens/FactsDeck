"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock,
  Eye,
  ThumbsUp,
  Bookmark,
  Filter,
  Share2,
  Star,
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
} from "lucide-react";
import type { Post } from "../lib/types";
import { postPublicPath } from "../lib/post-url";
import type { CategoryWithCount } from "../lib/posts";
import type { MarketDataItem } from "../lib/market-data";
import { formatPublishDate } from "../lib/format-date";
import { quickTools } from "../lib/site-config";
import { usePostEngagement } from "../hooks/usePostEngagement";
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
  PieChart,
  DollarSign,
  TrendingUp,
  Building2,
};

function FeaturedArticleCard({ article }: { article: Post }) {
  const { likes, isLiked, isBookmarked, handleLike, handleBookmark } = usePostEngagement(
    article.id,
    article.likes,
    article.bookmarks
  );
  return (
    <Link
      href={postPublicPath(article)}
      className="group block bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-purple-500/30 hover:-translate-y-2"
    >
      <div className="relative">
        <Image
          src={article.image}
          alt={article.title}
          width={800}
          height={192}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
          {article.category}
        </span>
        <div className="absolute top-3 right-3 flex space-x-2">
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
        <div className="flex items-center space-x-4 mb-4">
          <span className="inline-block rounded-full border-2 border-purple-400 dark:border-emerald-400 p-0.5">
            <Image
              src={article.author.image}
              alt={article.author.name}
              width={38}
              height={38}
              className="w-8 h-8 rounded-full object-cover"
            />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-slate-900 dark:text-purple-200">{article.author.name}</p>
            <p className="text-slate-500 dark:text-purple-300/80">{formatPublishDate(article.publishDate)}</p>
          </div>
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200 mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-purple-300/80">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {article.readTime}
            </span>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {article.views}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              isLiked ? "text-red-600 dark:text-red-400" : "hover:text-red-600 dark:hover:text-red-400"
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likes.toLocaleString()}
          </button>
        </div>
      </div>
    </Link>
  );
}

function LatestArticleCard({ article }: { article: Post }) {
  const { likes, isLiked, isBookmarked, handleLike, handleBookmark } = usePostEngagement(
    article.id,
    article.likes,
    article.bookmarks
  );
  return (
    <Link
      href={postPublicPath(article)}
      className="group block bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-purple-500/30 hover:-translate-y-1"
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative h-48 md:h-auto">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
              {article.category}
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="text-slate-500 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-400 p-2 rounded-lg transition-colors"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-slate-500 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
                aria-label="Bookmark"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
          <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
            {article.title}
          </h3>
          <p className="text-slate-600 dark:text-purple-200 mb-4 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center justify-center rounded-full border-2 border-purple-400 dark:border-purple-600 w-9 h-9 bg-white dark:bg-dark-900">
                <Image
                  src={article.author.image}
                  alt={article.author.name}
                  width={36}
                  height={36}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-slate-900 dark:text-purple-200">{article.author.name}</p>
                <p className="text-slate-500 dark:text-purple-200">{formatPublishDate(article.publishDate)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-purple-200">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {article.readTime}
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {article.views}
              </span>
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1 transition-colors ${
                  isLiked ? "text-red-600 dark:text-red-400" : "hover:text-red-600 dark:hover:text-red-400"
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {likes.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
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
};

export default function HomePageClient({
  featuredPosts,
  latestPosts,
  expertPickPosts,
  trendingPosts,
  guidePosts,
  categoriesWithCounts,
  marketData,
}: HomePageClientProps) {
  const [activeFilter, setActiveFilter] = useState("All Categories");
  const availableCategories = [
    "All Categories",
    ...Array.from(new Set(latestPosts.map((p) => p.category))).filter(Boolean),
  ];
  const filteredArticles = latestPosts.filter(
    (article) =>
      activeFilter === "All Categories" || article.category === activeFilter
  );

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-amber-800 dark:from-dark-900 dark:via-dark-850 dark:to-dark-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 dark:bg-purple-400/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-amber-400/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-purple-200 fill-current" />
              ))}
              <span className="text-purple-100 dark:text-purple-200 text-sm font-medium">
                Trusted by 2.5M+ readers worldwide
              </span>
            </div>

            <header className="mb-10">
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 sm:mb-8 text-balance drop-shadow-lg">
                <span className="block">Welcome to</span>
                <span className="gradient-text block mt-2">
                  Your Financial Knowledge Hub
                </span>
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl text-purple-100 dark:text-purple-200 leading-relaxed max-w-2xl mx-auto mb-3 font-semibold">
                Empowering smarter money moves for everyone.
              </h2>
              <p className="text-base sm:text-lg text-purple-100/90 dark:text-purple-200/90 leading-relaxed max-w-2xl mx-auto mb-6">
                Unlock world-class guides, clear comparisons, market data, and practical tools
                to help you master investing, banking, and personal finance.
              </p>
            </header>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/post"
                className="group bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
              >
                <BookOpen className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#newsletter"
                className="group glass-effect text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center border border-white/30 backdrop-blur-lg transform hover:-translate-y-2 hover:scale-105"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">2.5M+</div>
                <div className="text-sm text-purple-200">Monthly Readers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">5,000+</div>
                <div className="text-sm text-purple-200">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">50+</div>
                <div className="text-sm text-purple-200">Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">4.9★</div>
                <div className="text-sm text-purple-200">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {marketData && marketData.length > 0 && (
        <section className="bg-slate-900 dark:bg-dark-950 dark:border-purple-500/30 text-white py-3 sm:py-4 border-b border-slate-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 sm:space-x-3 mr-4 sm:mr-8 flex-shrink-0">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <Globe2 className="h-5 w-5 text-purple-400" />
                <span className="font-bold text-sm hidden sm:inline">Live Market Data</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="ticker-scroll flex space-x-8">
                  {[...marketData, ...marketData].map((item, index) => (
                    <div
                      key={`${item.symbol}-${index}`}
                      className="flex items-center space-x-3 group cursor-pointer hover:bg-white/10 dark:hover:bg-purple-900/30 px-4 py-2 rounded-lg transition-all duration-200 flex-shrink-0"
                    >
                      <span className="text-slate-300 dark:text-purple-200 text-sm font-bold whitespace-nowrap">
                        {item.symbol}
                      </span>
                      <span className="text-white dark:text-purple-100 font-bold whitespace-nowrap">{item.value}</span>
                      <span
                        className={`text-sm font-bold flex items-center whitespace-nowrap ${
                          item.positive ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {item.positive ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {item.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-10 sm:space-y-12">
            {/* Latest Articles Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-purple-200">
                  Latest Articles
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-slate-500 dark:text-purple-400" />
                    <select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="bg-white dark:bg-dark-900/50 border border-slate-300 dark:border-purple-500/50 rounded-lg px-3 py-2 text-sm dark:text-purple-200"
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
                    className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
                  >
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                {filteredArticles.slice(0, 5).map((article) => (
                  <LatestArticleCard key={article.id} article={article} />
                ))}
              </div>
              {filteredArticles.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No articles yet"
                  description="We're building our library. Come back soon for fresh financial insights."
                  ctaLabel="Browse categories"
                  ctaHref="/post"
                />
              )}
            </section>

            {/* Browse by Category Section */}
            <section>
              <div className="mb-6 md:mb-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-purple-200">
                  Browse by Category
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
                {categoriesWithCounts.map((category, index) => {
                  const IconComponent = iconMap[category.iconKey || "BookOpen"] ?? BookOpen;
                  return (
                    <Link
                      key={index}
                      href={`/post?category=${encodeURIComponent(category.name)}`}
                      className="group bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-purple-500/30 hover:-translate-y-2 text-center"
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${category.color || "from-purple-500 to-purple-600"} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200 mb-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-purple-200">{category.count}</p>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Expert Picks Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-purple-200">
                  Expert Picks
                </h2>
                <Link
                  href="/post?type=expert-picks"
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
                >
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {expertPickPosts.slice(0, 3).map((pick) => (
                  <Link
                    key={pick.id}
                    href={postPublicPath(pick)}
                    className="group block bg-gradient-to-br from-purple-50 to-white dark:from-dark-900 dark:to-dark-850/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-500/30 hover:-translate-y-2"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="inline-block rounded-full border-2 border-purple-500 dark:border-emerald-400 p-0.5 bg-white dark:bg-dark-900">
                        <Image
                          src={pick.author.image}
                          alt={pick.author.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-purple-200">{pick.author.name}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          {pick.author.title}
                        </p>
                      </div>
                    </div>
                    <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">
                      {pick.category}
                    </span>
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200 mb-3 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                      {pick.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-purple-200">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {pick.readTime}
                      </span>
                      <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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

            {/* Featured Articles Section */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-purple-200">
                  Featured Articles
                </h2>
                <Link
                  href="/post?type=featured"
                  className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
                >
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {featuredPosts.slice(0, 3).map((article) => (
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

          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
              <div className="flex items-center space-x-2 mb-6">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-200">
                  Trending Now
                </h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                {trendingPosts.slice(0, 5).map((post) => (
                  <Link
                    key={post.id}
                    href={postPublicPath(post)}
                    className="block group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Flame className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-purple-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 text-start transition-colors">
                          {post.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-slate-500 dark:text-purple-200">
                            {post.views} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {trendingPosts.length === 0 && (
                <EmptyState
                  icon={Flame}
                  title="No trending posts yet"
                  description="Hot topics will appear here."
                  compact
                />
              )}
              <Link
                href="/post?type=trending"
                className="mt-4 flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-sm hover:text-purple-700 dark:hover:text-purple-300 transition-colors py-2"
              >
                View more <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
              <div className="flex items-center space-x-2 mb-6">
                <Calculator className="h-5 w-5 text-purple-500" />
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-200">
                  Quick Tools
                </h3>
              </div>
              <div className="space-y-3">
                {quickTools.map((tool, index) => {
                  const ToolIcon = iconMap[tool.iconKey || "Calculator"] ?? Calculator;
                  const slug = tool.name.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <Link
                      key={index}
                      href={`/tools/${slug}`}
                      className="block w-full group text-left"
                    >
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <ToolIcon className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-semibold text-sm text-gray-900 dark:text-purple-200 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors text-start">
                            {tool.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-purple-200">{tool.users}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-900/50 dark:border-purple-500/30 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="h-5 w-5 text-purple-500" />
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-purple-200">
                  Popular Guides
                </h3>
              </div>
              <div className="space-y-3 md:space-y-4">
                {guidePosts.slice(0, 5).map((guide) => (
                  <Link
                    key={guide.id}
                    href={postPublicPath(guide)}
                    className="block group cursor-pointer p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-purple-200 mb-2 line-clamp-2 transition-colors group-hover:text-purple-600 dark:group-hover:text-emerald-400">
                      {guide.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-purple-200">
                      <span>{guide.category}</span>
                      <div className="flex items-center space-x-2">
                        <span>{guide.readTime}</span>
                        <span>-</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
                className="mt-4 flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-sm hover:text-purple-700 dark:hover:text-purple-300 transition-colors py-2"
              >
                Read more <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
