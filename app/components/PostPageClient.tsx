"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  incrementPostViews,
  incrementPostLikes,
  decrementPostLikes,
  incrementPostBookmarks,
  decrementPostBookmarks,
} from "../lib/post-actions";
import {
  ArrowLeft,
  Clock,
  Eye,
  FileText,
  ThumbsUp,
  Bookmark,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  User,
  Calendar,
  Tag,
  Heart,
  Calculator,
  BookOpen,
  Star,
  Flame,
  BarChart3,
  Target,
  DollarSign,
  PieChart,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Scale,
  Brain,
  CreditCard,
  Home,
  TrendingUp,
  Building2,
} from "lucide-react";
import type { Post, PostSummary } from "../lib/types";
import { postPublicPath } from "../lib/post-url";
import { proxiedImageSrc } from "../lib/image-proxy";
import { CategoryPills, categoriesLabelList, categoryLabelList } from "../lib/post-display";
import type { CategoryWithCount } from "../lib/posts";
import { formatPublishDate } from "../lib/format-date";
import type { SiteTool } from "../lib/site-config";
import EmptyState from "./EmptyState";

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
};

const FROM_LABELS: Record<string, string> = {
  featured: "Featured Articles",
  latest: "Latest Articles",
  "expert-picks": "Expert Picks",
  guides: "Popular Guides",
  trending: "Trending Now",
};

type PostPageClientProps = {
  article: Post;
  content: string;
  from?: string;
  relatedArticles: PostSummary[];
  /** Additional posts from the same related query (shown below the article; excludes sidebar items). */
  moreArticles: PostSummary[];
  trendingPosts: Post[];
  guidePosts: Post[];
  categoriesWithCounts: CategoryWithCount[];
  sidebarTools: SiteTool[];
};

export default function PostPageClient({
  article,
  content,
  from,
  relatedArticles,
  moreArticles,
  trendingPosts,
  guidePosts,
  categoriesWithCounts,
  sidebarTools,
}: PostPageClientProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [likes, setLikes] = useState(article.likes);
  const [bookmarks, setBookmarks] = useState(article.bookmarks);
  const [views, setViews] = useState(article.views);

  const fromLabel = from && FROM_LABELS[from] ? FROM_LABELS[from] : null;

  const allRelatedArticles = useMemo(
    () => [...relatedArticles, ...moreArticles],
    [relatedArticles, moreArticles]
  );

  const LIKED_KEY = "factsdeck-liked";
  const BOOKMARKED_KEY = "factsdeck-bookmarked";

  const getLikedSet = useCallback((): Set<string> => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const raw = localStorage.getItem(LIKED_KEY);
      const arr = (raw ? JSON.parse(raw) : []) as string[];
      return new Set(arr);
    } catch {
      return new Set<string>();
    }
  }, []);

  const getBookmarkedSet = useCallback((): Set<string> => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const raw = localStorage.getItem(BOOKMARKED_KEY);
      const arr = (raw ? JSON.parse(raw) : []) as string[];
      return new Set(arr);
    } catch {
      return new Set<string>();
    }
  }, []);

  const saveLikedSet = useCallback((set: Set<string>) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
    } catch {
      /* ignore */
    }
  }, []);

  const saveBookmarkedSet = useCallback((set: Set<string>) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(BOOKMARKED_KEY, JSON.stringify([...set]));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const liked = getLikedSet().has(article.id);
    const bookmarked = getBookmarkedSet().has(article.id);
    setIsLiked(liked);
    setIsBookmarked(bookmarked);
  }, [article.id, getLikedSet, getBookmarkedSet]);

  useEffect(() => {
    const viewedKey = `factsdeck-viewed-${article.id}`;
    if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, "1");
      incrementPostViews(article.id).then((res) => {
        if (res.ok) setViews((v) => String((parseInt(String(v || "0"), 10) || 0) + 1));
      });
    }
  }, [article.id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : prev - 1));

    const s = getLikedSet();
    if (nextLiked) {
      s.add(article.id);
      const res = await incrementPostLikes(article.id);
      if (res.ok && res.likes != null) setLikes(res.likes);
      else if (!res.ok) {
        setIsLiked(false);
        setLikes((p) => p - 1);
        s.delete(article.id);
      }
    } else {
      s.delete(article.id);
      const res = await decrementPostLikes(article.id);
      if (res.ok && res.likes != null) setLikes(res.likes);
      else if (!res.ok) {
        setIsLiked(true);
        setLikes((p) => p + 1);
        s.add(article.id);
      }
    }
    saveLikedSet(s);
  };

  const handleBookmark = async () => {
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    setBookmarks((prev) => (nextBookmarked ? prev + 1 : prev - 1));

    const s = getBookmarkedSet();
    if (nextBookmarked) {
      s.add(article.id);
      const res = await incrementPostBookmarks(article.id);
      if (res.ok && res.bookmarks != null) setBookmarks(res.bookmarks);
      else if (!res.ok) {
        setIsBookmarked(false);
        setBookmarks((p) => p - 1);
        s.delete(article.id);
      }
    } else {
      s.delete(article.id);
      const res = await decrementPostBookmarks(article.id);
      if (res.ok && res.bookmarks != null) setBookmarks(res.bookmarks);
      else if (!res.ok) {
        setIsBookmarked(true);
        setBookmarks((p) => p + 1);
        s.add(article.id);
      }
    }
    saveBookmarkedSet(s);
  };

  const handleShare = (platform: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = article.title;
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  const authorBio = article.author.bio ?? "Expert contributor at Facts Deck, dedicated to making financial education accessible to everyone.";
  const authorFollowers = article.author.followers ?? "125K";
  const authorArticles = article.author.articles ?? 89;

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-dark-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-accent-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-accent-800 dark:from-dark-900 dark:via-purple-900 dark:to-accent-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent dark:from-black/50" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-5 left-5 w-32 h-32 md:top-10 md:left-10 md:w-72 md:h-72 bg-purple-400/20 dark:bg-purple-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-5 right-5 w-48 h-48 md:bottom-10 md:right-10 md:w-96 md:h-96 bg-purple-400/20 dark:bg-accent-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="flex items-center justify-between gap-3 mb-6">
            <Link
              href={fromLabel ? `/post?type=${from}` : "/"}
              className="inline-flex items-center glass-effect text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 backdrop-blur-lg border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm md:text-base"
            >
              <ArrowLeft className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
              {fromLabel ? `Back to ${fromLabel}` : "Back to Home"}
            </Link>
            <Link
              href="/post"
              className="text-white/90 hover:text-white text-sm font-medium transition-colors text-right"
            >
              Browse all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                <CategoryPills
                  categories={categoryLabelList(article)}
                  variant="overlay"
                  className="[&>span]:text-xs md:[&>span]:text-sm"
                />
                <div className="flex items-center text-purple-200 text-xs md:text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {formatPublishDate(article.publishDate)}
                </div>
                <div className="flex items-center text-purple-200 text-xs md:text-sm">
                  <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {article.readTime}
                </div>
              </div>
              <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-balance leading-tight">
                {article.title}
              </h1>
              <p className="text-base md:text-lg text-purple-100 leading-relaxed mb-6 md:mb-8">
                {article.excerpt}
              </p>
              <div className="flex items-center space-x-4 mb-6 md:mb-8">
                <Image
                  src={proxiedImageSrc(article.author.image)}
                  alt={article.author.name}
                  width={64}
                  height={64}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <p className="font-bold text-base md:text-lg">{article.author.name}</p>
                  <p className="text-purple-200 text-sm md:text-base">{article.author.title}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base">
                <div className="flex items-center text-purple-200">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                  {views}
                </div>
                <div className="flex items-center text-purple-200">
                  <ThumbsUp className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                  {likes.toLocaleString()}
                </div>
                <div className="flex items-center text-purple-200">
                  <Bookmark className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                  {bookmarks}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="relative h-48 md:h-64 lg:h-80">
                <Image
                  src={proxiedImageSrc(article.image)}
                  alt={article.title}
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="sticky top-20 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200 dark:border-purple-500/30 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2 md:space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                      isLiked ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-purple-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    }`}
                  >
                    <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isLiked ? "fill-current" : ""}`} />
                    <span>{likes.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                      isBookmarked ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 md:h-5 md:w-5 ${isBookmarked ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline">Bookmark</span>
                  </button>
                  <div className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-xl font-semibold bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-purple-300 text-sm md:text-base">
                    <Eye className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">{views}</span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 text-sm md:text-base"
                  >
                    <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Share</span>
                  </button>
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border dark:border-purple-500/50 py-2 z-50">
                      <button onClick={() => handleShare("twitter")} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-900/30 transition-colors">
                        <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                        Share on Twitter
                      </button>
                      <button onClick={() => handleShare("facebook")} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-900/30 transition-colors">
                        <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                        Share on Facebook
                      </button>
                      <button onClick={() => handleShare("linkedin")} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-900/30 transition-colors">
                        <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                        Share on LinkedIn
                      </button>
                      <button onClick={() => handleShare("copy")} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-900/30 transition-colors">
                        {copySuccess ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Link Copied!
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <article className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 md:p-8 lg:p-10 shadow-lg border border-gray-200 dark:border-purple-500/30 mb-8">
              <div className="article-prose max-w-none">
                {content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt }) => {
                        if (!src) return null;
                        const s = typeof src === "string" ? src : String(src);
                        return (
                          <span className="block my-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-dark-900/40">
                            <Image
                              src={proxiedImageSrc(s)}
                              alt={alt ?? ""}
                              width={1400}
                              height={800}
                              sizes="(min-width: 1024px) 768px, 100vw"
                              className="w-full h-auto"
                            />
                          </span>
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <div className="py-8">
                    <EmptyState
                      icon={FileText}
                      title="No content available"
                      description="This article's content is still being prepared."
                      compact
                    />
                  </div>
                )}
              </div>
            </article>

            {article.tags.length > 0 && (
              <div className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30 mb-8">
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/post?q=${encodeURIComponent(tag)}`}
                      className="flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 md:p-8 shadow-lg border border-purple-200 dark:border-purple-500/30">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <span className="inline-flex items-center justify-center rounded-full border-4 border-purple-400 dark:border-emerald-400 bg-white dark:bg-dark-900 p-1">
                  <Image
                    src={proxiedImageSrc(article.author.image)}
                    alt={article.author.name}
                    width={96}
                    height={96}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                  />
                </span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-xl md:text-2xl text-gray-900 dark:text-purple-200 mb-2">
                    {article.author.name}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 font-semibold mb-3">{article.author.title}</p>
                  <p className="text-gray-700 dark:text-purple-200 leading-relaxed mb-4">{authorBio}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-purple-300">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {authorFollowers} followers
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {authorArticles} articles
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Articles Section */}
            <section
              className="mt-10"
              aria-labelledby="related-articles-inline-heading"
            >
              <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
                <h2
                  id="related-articles-inline-heading"
                  className="font-display text-xl md:text-2xl font-bold text-gray-900 dark:text-purple-100"
                >
                  Related articles
                </h2>
                {allRelatedArticles.length > 1 && (
                  <p className="text-xs text-gray-500 dark:text-purple-400">
                    <span className="sm:hidden">Swipe sideways for more</span>
                    <span className="hidden sm:inline">Scroll left or right for more</span>
                  </p>
                )}
              </div>
              {allRelatedArticles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-purple-500/40 bg-gray-50/90 dark:bg-dark-800/60 p-8 md:p-10">
                  <EmptyState
                    icon={BookOpen}
                    title="No related articles available"
                    description="No related articles found yet. More related posts will be coming soon."
                    compact
                  />
                  <div className="mt-6 text-center">
                    <Link
                      href="/post"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-emerald-400 hover:text-purple-700 dark:hover:text-emerald-300"
                    >
                      Browse all articles
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="relative -mx-1">
                  <div
                    className="flex gap-4 overflow-x-auto overscroll-x-contain pb-4 pt-1 px-1 snap-x snap-mandatory scroll-pl-2 sm:scroll-pl-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 dark:focus-visible:ring-purple-400/30 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-purple-600/50"
                    role="list"
                    tabIndex={0}
                  >
                    {allRelatedArticles.map((item) => (
                      <Link
                        key={item.id}
                        href={postPublicPath(item)}
                        role="listitem"
                        className="group flex-none w-[min(18rem,calc(100vw-3rem))] sm:w-72 snap-start flex flex-col bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors"
                      >
                        <div className="relative h-36 w-full shrink-0">
                          <Image
                            src={proxiedImageSrc(item.image)}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-1 min-h-0">
                          <div className="mb-1.5">
                            <CategoryPills
                              categories={categoriesLabelList(item.categories)}
                              variant="muted"
                              max={2}
                              className="[&>span]:text-[10px] [&>span]:uppercase [&>span]:tracking-wide"
                            />
                          </div>
                          <h3 className="font-display font-bold text-base text-gray-900 dark:text-purple-100 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between mt-auto pt-3 text-xs text-gray-500 dark:text-purple-400">
                            <span>{formatPublishDate(item.publishDate)}</span>
                            <span>{item.readTime}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200 mb-4">Browse by Category</h3>
              <div className="space-y-2">
                {categoriesWithCounts.map((cat, i) => {
                  const IconComponent = iconMap[cat.iconKey ?? "BookOpen"] ?? BookOpen;
                  return (
                    <Link
                      key={i}
                      href={`/post?category=${encodeURIComponent(cat.name)}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-purple-900/20 transition-colors group"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color ?? "from-purple-500 to-purple-600"} flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-purple-200 group-hover:text-purple-600 dark:group-hover:text-emerald-400 block truncate">
                          {cat.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-purple-300">{cat.count}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200 mb-6">Related Articles</h3>
              <div className="space-y-4">
                {relatedArticles.map((item) => (
                  <Link key={item.id} href={postPublicPath(item)} className="flex gap-3 group p-3 -m-3 rounded-xl hover:bg-gray-50 dark:hover:bg-purple-900/20 transition-colors">
                    <Image
                      src={proxiedImageSrc(item.image)}
                      alt={item.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-purple-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between gap-2 mt-2 text-xs text-gray-500 dark:text-purple-300">
                        <span className="truncate min-w-0">
                          {categoriesLabelList(item.categories).join(" · ")}
                        </span>
                        <span className="shrink-0">{item.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {relatedArticles.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No related articles"
                  description="More content coming soon."
                  compact
                />
              )}
            </div>

            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30">
              <div className="flex items-center space-x-2 mb-6">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200">Trending Now</h3>
              </div>
              <div className="space-y-4">
                {trendingPosts.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    href={postPublicPath(post)}
                    className="group block"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-purple-900/20 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Flame className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-purple-200 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors">
                          {post.title}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-purple-300">{post.views} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {trendingPosts.length === 0 && (
                <EmptyState
                  icon={Flame}
                  title="No trending posts"
                  compact
                />
              )}
            </div>

            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-purple-500" />
                  <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200">Quick Tools</h3>
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
                      className="block w-full group"
                    >
                      <div className="flex items-center justify-between gap-2 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ToolIcon className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-semibold text-sm text-gray-900 dark:text-purple-200 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors text-start line-clamp-2">
                            {tool.name}
                          </span>
                        </div>
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-purple-500/35 bg-gray-50/90 dark:bg-dark-850/60 text-gray-400 group-hover:border-purple-300 group-hover:bg-purple-100/80 group-hover:text-purple-600 dark:group-hover:border-emerald-500/45 dark:group-hover:bg-emerald-950/30 dark:group-hover:text-emerald-400 transition-all group-hover:scale-105"
                          aria-hidden
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
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

            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-purple-900/50 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-purple-500/30">
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-purple-200">Popular Guides</h3>
              </div>
              <div className="space-y-4">
                {guidePosts.slice(0, 4).map((post) => (
                  <Link key={post.id} href={postPublicPath(post)} className="group block">
                    <div className="p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-purple-200 mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-purple-300">
                        <CategoryPills
                          categories={categoryLabelList(post)}
                          variant="muted"
                          max={2}
                          className="min-w-0"
                        />
                        <span className="shrink-0">{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {guidePosts.length === 0 && (
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
