import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Clock,
  Eye,
  ThumbsUp,
  Bookmark,
  User,
  Tag,
  Calculator,
  BookOpen,
  Flame,
  BarChart3,
  Target,
  DollarSign,
  PieChart,
  Activity,
  ChevronRight,
  Scale,
  Brain,
  CreditCard,
  Home,
  TrendingUp,
  Building2,
  Bitcoin,
  Search,
  Star,
} from "lucide-react";
import type { Post, PostSummary } from "../lib/types";
import { postPublicPath } from "../lib/post-url";
import { proxiedImageSrc } from "../lib/image-proxy";
import { CategoryPills, categoriesLabelList, categoryLabelList } from "../lib/post-display";
import type { CategoryWithCount } from "../lib/posts";
import { formatPublishDate } from "../lib/format-date";
import type { SiteTool } from "../lib/site-config";
import EmptyState from "./EmptyState";
import PostEngagementBarClient from "./PostEngagementBarClient";
import PostArticleBrowseCategories from "./PostArticleBrowseCategories";

const linkAccent =
  "font-semibold text-blue-800 transition-colors hover:text-blue-900 dark:text-cyan-300 dark:hover:text-cyan-200";

/** Matches PostListContent `cardSurface` */
const cardSurface =
  "rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80";

const railCard =
  "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6";

const iconWrapSm =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-200/90 bg-orange-50 text-blue-700 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-cyan-300";

const POST_BASE = "/post";

const ARTICLE_SECTION_NAV = [
  { key: "featured", label: "Featured", icon: Star },
  { key: "latest", label: "Latest", icon: Clock },
  { key: "expert-picks", label: "Expert picks", icon: BookOpen },
  { key: "guides", label: "Guides", icon: BookOpen },
  { key: "trending", label: "Top stories", icon: Flame },
] as const;

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
  Bitcoin,
};

const FROM_LABELS: Record<string, string> = {
  featured: "Featured Articles",
  latest: "Latest Articles",
  "expert-picks": "Expert Picks",
  guides: "Popular Guides",
  trending: "Trending Now",
};

type Props = {
  article: Post;
  content: string;
  from?: string;
  trendingPosts: Post[];
  guidePosts: Post[];
  /** Same-origin related articles (tags/categories/recent); up to 12 for bottom grid, sidebar uses first 3. */
  relatedPosts: PostSummary[];
  categoriesWithCounts: CategoryWithCount[];
  sidebarTools: SiteTool[];
  /** Admin-only preview: banner + links back to CMS (not indexed). */
  adminPreview?: { editHref: string };
};

export default function PostPageView({
  article,
  content,
  from,
  trendingPosts,
  guidePosts,
  relatedPosts,
  categoriesWithCounts,
  sidebarTools,
  adminPreview,
}: Props) {
  const sidebarRelated = relatedPosts.slice(0, 3);
  const fromLabel = from && FROM_LABELS[from] ? FROM_LABELS[from] : null;
  const monthPicksUpper = new Intl.DateTimeFormat("en-US", { month: "long" })
    .format(new Date())
    .toUpperCase();
  const authorBio =
    article.author.bio ??
    "Expert contributor at Facts Deck, dedicated to making financial education accessible to everyone.";
  const authorFollowers = article.author.followers ?? "125K";
  const authorArticles = article.author.articles ?? 89;
  const tags = article.tags ?? [];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {adminPreview && (
        <div
          className="sticky top-0 z-40 border-b border-amber-500/40 bg-amber-50 text-amber-950 dark:bg-amber-950/90 dark:text-amber-50 dark:border-amber-600/50 px-4 py-3"
          role="status"
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-sm font-semibold">
              Admin preview
              {article.published ? (
                <span className="font-normal text-amber-800 dark:text-amber-200/90">
                  {" "}
                  — This is how the article appears on the site.{" "}
                  <Link
                    href={postPublicPath(article)}
                    className="underline font-medium hover:no-underline"
                  >
                    Open public URL
                  </Link>
                </span>
              ) : (
                <span className="font-normal text-amber-800 dark:text-amber-200/90">
                  {" "}
                  — Hidden from the public site (visitors get a 404 until you publish).
                </span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm shrink-0">
              <Link
                href={adminPreview.editHref}
                className="font-semibold underline underline-offset-2 hover:no-underline"
              >
                Edit article
              </Link>
              <span className="text-amber-700/70 dark:text-amber-300/50" aria-hidden>
                ·
              </span>
              <Link href="/admin/articles" className="font-semibold underline underline-offset-2 hover:no-underline">
                All articles
              </Link>
            </div>
          </div>
        </div>
      )}
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href={
                  adminPreview
                    ? "/admin/articles"
                    : fromLabel
                      ? `/post?type=${from}`
                      : "/"
                }
                className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-emerald-950/50 dark:hover:text-cyan-300"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                {adminPreview ? "Back to Articles" : fromLabel ? `Back to ${fromLabel}` : "Back to home"}
              </Link>
              <div className="flex flex-wrap items-center gap-3 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4 shrink-0" aria-hidden />
                  {article.readTime}
                </span>
                <span className="hidden h-3 w-px bg-zinc-200 sm:inline dark:bg-zinc-700" aria-hidden />
                <span>{formatPublishDate(article.publishDate)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Article library
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <span className="text-zinc-500 dark:text-zinc-500">Reading ·</span>{" "}
                  <Link href={POST_BASE} className={linkAccent}>
                    All articles
                  </Link>
                  {adminPreview ? (
                    <>
                      {" "}
                      <span aria-hidden>·</span>{" "}
                      <Link href={adminPreview.editHref} className={linkAccent}>
                        Edit in CMS
                      </Link>
                    </>
                  ) : null}
                </p>
                <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-zinc-900 sm:text-4xl md:text-5xl dark:text-zinc-100">
                  {article.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {article.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <CategoryPills
                    categories={categoryLabelList(article)}
                    variant="muted"
                    max={4}
                    className="[&>span]:text-[10px] sm:[&>span]:text-xs"
                  />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800/90">
                  <Image
                    src={proxiedImageSrc(article.author.image)}
                    alt={article.author.name}
                    width={56}
                    height={56}
                    className="h-12 w-12 rounded-full border-2 border-zinc-200 object-cover dark:border-zinc-700 sm:h-14 sm:w-14"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-zinc-900 dark:text-zinc-100">{article.author.name}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{article.author.title}</p>
                  </div>
                  <div className="flex w-full flex-wrap gap-x-5 gap-y-1 text-xs tabular-nums text-zinc-500 sm:w-auto sm:justify-end sm:text-sm dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-4 w-4 shrink-0" aria-hidden />
                      {article.views}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 shrink-0" aria-hidden />
                      {article.likes.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bookmark className="h-4 w-4 shrink-0" aria-hidden />
                      {article.bookmarks}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl lg:aspect-auto lg:min-h-[260px] lg:max-h-[340px]">
                    <Image
                      src={proxiedImageSrc(article.image)}
                      alt={article.title}
                      fill
                      sizes="(min-width: 1024px) 480px, 100vw"
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {!adminPreview && (
              <div className="flex flex-wrap gap-2">
                {ARTICLE_SECTION_NAV.map(({ key, label, icon: Icon }) => (
                  <Link
                    key={key}
                    href={key === "latest" ? POST_BASE : `${POST_BASE}?type=${key}`}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                      from === key
                        ? "bg-blue-700 text-white shadow-sm dark:bg-emerald-600"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-orange-50 hover:text-blue-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-emerald-950/40 dark:hover:text-cyan-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link
              href={POST_BASE}
              className="relative block max-w-md flex-1 rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-500 shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              Search articles and tools…
            </Link>
            <Link
              href="#article-body"
              className={`text-sm font-semibold ${linkAccent}`}
            >
              Jump to article
              <ChevronRight className="ml-0.5 inline h-4 w-4 align-text-bottom" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-8">
            <PostEngagementBarClient
              articleId={article.id}
              initialLikes={article.likes}
              initialBookmarks={article.bookmarks}
              initialViews={article.views}
              title={article.title}
            />

            <article id="article-body" className={`${railCard} mb-8 p-6 md:p-8 lg:p-10`}>
              <div className="article-prose max-w-none">
                {content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt }) => {
                        if (!src) return null;
                        const s = typeof src === "string" ? src : String(src);
                        return (
                          <span className="block my-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
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
                      iconKey="FileText"
                      title="No content available"
                      description="This article's content is still being prepared."
                      compact
                    />
                  </div>
                )}
              </div>
            </article>

            {tags.length > 0 && (
              <div className={`${railCard} mb-8`}>
                <h3 className="mb-4 border-b border-zinc-200 pb-3 font-display text-lg font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/post?q=${encodeURIComponent(tag)}`}
                      className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 px-3 py-1 rounded-full text-sm font-semibold hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className={railCard}>
              <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:gap-6">
                <span className="inline-flex items-center justify-center rounded-full border-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1">
                  <Image
                    src={proxiedImageSrc(article.author.image)}
                    alt={article.author.name}
                    width={96}
                    height={96}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                  />
                </span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-xl md:text-2xl text-zinc-900 dark:text-zinc-100 mb-2">
                    {article.author.name}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 font-semibold mb-3">{article.author.title}</p>
                  <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed mb-4">{authorBio}</p>
                  <div className="flex items-center space-x-6 text-sm text-zinc-600 dark:text-zinc-300">
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

            {relatedPosts.length > 0 && (
              <section className="mt-10 border-t border-zinc-200 pt-10 dark:border-zinc-800" aria-labelledby="related-articles-inline-heading">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Read next
                    </p>
                    <h2
                      id="related-articles-inline-heading"
                      className="mt-1 font-display text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-100"
                    >
                      Related articles
                    </h2>
                  </div>
                </div>

                <div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5"
                  role="list"
                >
                  {relatedPosts.map((item) => (
                    <Link
                      key={item.id}
                      href={postPublicPath(item)}
                      role="listitem"
                      className={`group flex flex-col overflow-hidden ${cardSurface}`}
                    >
                      <div className="relative h-36 w-full shrink-0 sm:h-40">
                        <Image
                          src={proxiedImageSrc(item.image)}
                          alt={item.title}
                          fill
                          sizes="(min-width: 1024px) 240px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="flex min-h-0 flex-1 flex-col p-4">
                        <CategoryPills
                          categories={categoriesLabelList(item.categories)}
                          variant="muted"
                          max={2}
                          className="mb-2 [&>span]:text-[10px] [&>span]:uppercase [&>span]:tracking-wide"
                        />
                        <h3 className="font-display text-sm font-bold leading-snug text-zinc-900 line-clamp-2 group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300 sm:text-base">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {item.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-500 dark:border-zinc-800/90 dark:text-zinc-400">
                          <span>{formatPublishDate(item.publishDate)}</span>
                          <span className="tabular-nums">{item.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-center sm:text-left">
                  <Link href={POST_BASE} className={`inline-flex items-center gap-1 text-sm ${linkAccent}`}>
                    View all articles
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className={railCard}>
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <h3 className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Other Top Stories
                </h3>
                <Link href={`${POST_BASE}?type=trending`} className={`text-sm ${linkAccent}`}>
                  View all
                </Link>
              </div>
              <ul className="mt-4 space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                {trendingPosts.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={postPublicPath(p)}
                      className="group block py-3.5 text-sm leading-snug first:pt-0 last:pb-0"
                    >
                      <span className="line-clamp-3 font-medium text-zinc-800 transition-colors group-hover:text-blue-800 dark:text-zinc-200 dark:group-hover:text-cyan-300">
                        {p.title}
                      </span>
                      <span className="mt-1 block text-xs tabular-nums text-zinc-500 dark:text-zinc-500">
                        {p.views} views
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {trendingPosts.length === 0 && (
                <EmptyState iconKey="Flame" title="No stories yet" description="Check back soon." compact />
              )}
            </div>

            <div className={railCard}>
              <h3 className="border-b border-zinc-200 pb-3 font-display text-lg font-bold leading-tight tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                Find the Best Financial Tools
              </h3>
              <ul className="mt-4 space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                {sidebarTools.map((tool) => {
                  const ToolIcon = iconMap[tool.iconKey || "Calculator"] ?? Calculator;
                  return (
                    <li key={tool.slug}>
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
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-blue-700 dark:group-hover:text-cyan-400"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/tools"
                className={`mt-4 flex items-center gap-1 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
              >
                Browse all tools
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className={railCard}>
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <h3 className="max-w-[85%] font-display text-base font-bold leading-snug tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
                  OUR TOP PICKS FOR {monthPicksUpper}
                </h3>
                <Link href={`${POST_BASE}?type=guides`} className={`shrink-0 text-sm ${linkAccent}`}>
                  See all
                </Link>
              </div>
              <ul className="mt-4 space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                {guidePosts.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link href={postPublicPath(p)} className="group block py-3.5 text-sm leading-snug first:pt-0 last:pb-0">
                      <span className="line-clamp-3 font-medium text-zinc-800 transition-colors group-hover:text-blue-800 dark:text-zinc-200 dark:group-hover:text-cyan-300">
                        {p.title}
                      </span>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-500">
                        <CategoryPills categories={categoryLabelList(p)} variant="muted" max={2} className="min-w-0" />
                        <span className="tabular-nums">{p.readTime}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {guidePosts.length === 0 && (
                <EmptyState iconKey="BookOpen" title="No guides yet" description="Step-by-step guides coming soon." compact />
              )}
            </div>

            {sidebarRelated.length > 0 && (
              <div className={railCard}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <h3 className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Related articles
                  </h3>
                </div>
                <ul className="mt-4 space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/90">
                  {sidebarRelated.map((item) => (
                    <li key={item.id}>
                      <Link href={postPublicPath(item)} className="group flex gap-3 py-3.5 first:pt-0 last:pb-0">
                        <Image
                          src={proxiedImageSrc(item.image)}
                          alt={item.title}
                          width={56}
                          height={56}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover transition-transform group-hover:scale-[1.02]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug text-zinc-900 line-clamp-2 group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                            {item.title}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span className="truncate">{categoriesLabelList(item.categories).join(" · ")}</span>
                            <span className="shrink-0 tabular-nums">{item.readTime}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={railCard}>
              <h3 className="border-b border-zinc-200 pb-3 font-display text-lg font-bold tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                Browse by category
              </h3>
              <PostArticleBrowseCategories categories={categoriesWithCounts} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

