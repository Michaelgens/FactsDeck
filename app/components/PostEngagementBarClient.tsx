"use client";

import { useCallback, useEffect, useState } from "react";
import {
  incrementPostViews,
  incrementPostLikes,
  decrementPostLikes,
  incrementPostBookmarks,
  decrementPostBookmarks,
} from "../lib/post-actions";
import {
  Heart,
  Eye,
  Bookmark,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Props = {
  articleId: string;
  initialLikes: number;
  initialBookmarks: number;
  initialViews: string | number;
  title: string;
};

export default function PostEngagementBarClient({
  articleId,
  initialLikes,
  initialBookmarks,
  initialViews,
  title,
}: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [views, setViews] = useState(initialViews);
  /** Mobile-only: hide sticky bar for reading; floating button brings it back */
  const [mobileBarHidden, setMobileBarHidden] = useState(false);

  const LIKED_KEY = "factsdeck-liked";
  const BOOKMARKED_KEY = "factsdeck-bookmarked";

  const getSet = useCallback((key: string): Set<string> => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const raw = localStorage.getItem(key);
      const arr = (raw ? JSON.parse(raw) : []) as string[];
      return new Set(arr);
    } catch {
      return new Set<string>();
    }
  }, []);

  const saveSet = useCallback((key: string, set: Set<string>) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const liked = getSet(LIKED_KEY).has(articleId);
    const bookmarked = getSet(BOOKMARKED_KEY).has(articleId);
    setIsLiked(liked);
    setIsBookmarked(bookmarked);
  }, [articleId, getSet]);

  useEffect(() => {
    const viewedKey = `factsdeck-viewed-${articleId}`;
    if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, "1");
      incrementPostViews(articleId).then((res) => {
        if (res.ok) setViews((v) => String((parseInt(String(v || "0"), 10) || 0) + 1));
      });
    }
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setReadingProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : prev - 1));

    const s = getSet(LIKED_KEY);
    if (nextLiked) {
      s.add(articleId);
      const res = await incrementPostLikes(articleId);
      if (res.ok && res.likes != null) setLikes(res.likes);
      else if (!res.ok) {
        setIsLiked(false);
        setLikes((p) => p - 1);
        s.delete(articleId);
      }
    } else {
      s.delete(articleId);
      const res = await decrementPostLikes(articleId);
      if (res.ok && res.likes != null) setLikes(res.likes);
      else if (!res.ok) {
        setIsLiked(true);
        setLikes((p) => p + 1);
        s.add(articleId);
      }
    }
    saveSet(LIKED_KEY, s);
  };

  const handleBookmark = async () => {
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    setBookmarks((prev) => (nextBookmarked ? prev + 1 : prev - 1));

    const s = getSet(BOOKMARKED_KEY);
    if (nextBookmarked) {
      s.add(articleId);
      const res = await incrementPostBookmarks(articleId);
      if (res.ok && res.bookmarks != null) setBookmarks(res.bookmarks);
      else if (!res.ok) {
        setIsBookmarked(false);
        setBookmarks((p) => p - 1);
        s.delete(articleId);
      }
    } else {
      s.delete(articleId);
      const res = await decrementPostBookmarks(articleId);
      if (res.ok && res.bookmarks != null) setBookmarks(res.bookmarks);
      else if (!res.ok) {
        setIsBookmarked(true);
        setBookmarks((p) => p + 1);
        s.add(articleId);
      }
    }
    saveSet(BOOKMARKED_KEY, s);
  };

  const handleShare = (platform: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        );
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

  const collapseMobileBar = () => {
    setShowShareMenu(false);
    setMobileBarHidden(true);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 z-50">
        <div
          className="h-full bg-zinc-900 dark:bg-zinc-200 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {mobileBarHidden && (
        <button
          type="button"
          onClick={() => setMobileBarHidden(false)}
          className="fixed top-20 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-lg transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 md:hidden"
          aria-label="Show article actions"
        >
          <ChevronUp className="h-6 w-6" aria-hidden />
        </button>
      )}

      <div
        className={`relative sticky z-30 mb-8 rounded-2xl border border-zinc-200 bg-white/95 p-4 pt-3 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:top-32 md:p-6 md:pt-6 max-md:top-[4.25rem] ${mobileBarHidden ? "max-md:hidden" : ""}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                isLiked
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
            >
              <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isLiked ? "fill-current" : ""}`} />
              <span>{likes.toLocaleString()}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                isBookmarked
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/40"
              }`}
            >
              <Bookmark className={`h-4 w-4 md:h-5 md:w-5 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">Bookmark</span>
            </button>

            <div className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-xl font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 text-sm md:text-base">
              <Eye className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">{views}</span>
            </div>
          </div>

          {/* Share button and mobile show/hide button grouped together */}
          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-xl font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-300 text-sm md:text-base"
            >
              <Share2 className="h-4 w-4 md:h-5 md:w-5" />
              <span>Share</span>
            </button>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-2 z-50">
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex items-center w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <Twitter className="h-4 w-4 mr-2 text-zinc-500" />
                  Share on Twitter
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex items-center w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <Facebook className="h-4 w-4 mr-2 text-zinc-500" />
                  Share on Facebook
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="flex items-center w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <Linkedin className="h-4 w-4 mr-2 text-zinc-500" />
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="flex items-center w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-zinc-900 dark:text-zinc-100" />
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
            <button
              type="button"
              onClick={collapseMobileBar}
              className="flex h-9 w-auto items-center justify-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
              aria-label="Hide article actions"
              style={{ marginLeft: '0.5rem' }} // small spacing to right of share
            >
              <ChevronDown className="h-5 w-5" aria-hidden />
              <span className="text-sm font-medium">Hide</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

