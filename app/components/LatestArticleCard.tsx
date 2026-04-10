"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Check, Clock, Eye, Heart, Share2 } from "lucide-react";
import type { Post } from "../lib/types";
import { postPublicPath } from "../lib/post-url";
import { CategoryPills, categoryLabelList } from "../lib/post-display";
import { proxiedImageSrc } from "../lib/image-proxy";
import { usePostEngagement } from "../hooks/usePostEngagement";

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
    // user cancelled or share failed
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

export type LatestArticleCardVariant = "grid" | "list";

export function LatestArticleCard({
  article,
  from,
  variant,
}: {
  article: Post;
  from: string;
  variant: LatestArticleCardVariant;
}) {
  const href = `${postPublicPath(article)}?from=${encodeURIComponent(from)}`;
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

  const metaRow = (
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
  );

  const body = (
    <>
      <Link
        href={href}
        className={
          variant === "grid"
            ? "relative aspect-[5/3] w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900"
            : "relative aspect-[5/3] w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:aspect-[4/3] sm:w-44 md:w-48 lg:w-52 dark:bg-zinc-900"
        }
      >
        <Image
          src={proxiedImageSrc(article.image)}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-[1.02]"
          sizes={
            variant === "grid"
              ? "(min-width: 1024px) 28vw, (min-width: 768px) 42vw, 100vw"
              : "(min-width: 1024px) 14rem, (min-width: 640px) 12rem, 100vw"
          }
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={href} className="group block min-w-0">
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
        {metaRow}
      </div>
    </>
  );

  if (variant === "grid") {
    return (
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-900/50">
        <div className="flex flex-col gap-4 p-4 sm:p-5">{body}</div>
      </article>
    );
  }

  return (
    <article className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
      <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:gap-6 sm:px-5 sm:py-6 lg:gap-8">{body}</div>
    </article>
  );
}
