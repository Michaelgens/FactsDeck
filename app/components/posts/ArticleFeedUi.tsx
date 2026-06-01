import Link from "next/link";
import Image from "next/image";
import { Clock, CalendarDays, ChevronRight } from "lucide-react";
import type { FeedArticle, MajorSection } from "../../lib/post-feeds";
import { primaryCategoryLabel } from "../../lib/post-feeds";
import { postPublicPath } from "../../lib/post-url";
import { proxiedImageSrc } from "../../lib/image-proxy";
import { CategoryPills, categoryLabelList } from "../../lib/post-display";
import { formatPublishDate } from "../../lib/format-date";
import EmptyState from "../EmptyState";

const linkAccent =
  "font-semibold text-blue-800 transition-colors hover:text-blue-900 dark:text-cyan-300 dark:hover:text-cyan-200";

export function PopularRail({
  posts,
  limit = 5,
  viewAllHref = "/post",
}: {
  posts: FeedArticle[];
  limit?: number;
  viewAllHref?: string;
}) {
  const items = posts.slice(0, limit);
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <h3 className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Popular
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Today
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No articles yet.</p>
      ) : (
        <ol className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
          {items.map((p, idx) => (
            <li key={p.id} className="py-3.5 first:pt-0 last:pb-0">
              <Link href={postPublicPath(p)} className="group block">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-bold tabular-nums text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                      {primaryCategoryLabel(p)}
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
      )}
      {items.length > 0 ? (
        <Link href={viewAllHref} className={`mt-4 flex items-center gap-1 text-sm ${linkAccent}`}>
          View all <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </section>
  );
}

export function TopPicksRail({
  posts,
  monthLabel,
  limit = 8,
  viewAllHref = "/post?type=guides",
}: {
  posts: FeedArticle[];
  monthLabel: string;
  limit?: number;
  viewAllHref?: string;
}) {
  const items = posts.slice(0, limit);
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <h3 className="border-b border-zinc-200 pb-3 font-display text-base font-bold leading-snug tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100 sm:text-lg">
        OUR TOP PICKS FOR {monthLabel}
      </h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No picks yet.</p>
      ) : (
        <ul className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
          {items.map((item) => (
            <li key={item.id} className="py-3 first:pt-0 last:pb-0">
              <Link href={postPublicPath(item)} className="group block">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                  {primaryCategoryLabel(item)}
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
      )}
      {items.length > 0 ? (
        <Link
          href={viewAllHref}
          className={`mt-4 flex items-center gap-1 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
        >
          See all guides <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </section>
  );
}

export function HeadlineList({
  posts,
  limit = 13,
  viewAllHref = "/post",
}: {
  posts: FeedArticle[];
  limit?: number;
  viewAllHref?: string;
}) {
  const items = posts.slice(0, limit);
  return (
    <section className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
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
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No stories yet.</p>
      ) : (
        <ul className="mt-4 space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/90">
          {items.map((item) => (
            <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
              <Link href={postPublicPath(item)} className="group block">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                  {primaryCategoryLabel(item)}
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
      )}
      {items.length > 0 ? (
        <Link
          href={viewAllHref}
          className={`mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
        >
          View all
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </section>
  );
}

export function MajorCoverageStack({
  sections,
  heroSizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  sections: MajorSection[];
  heroSizes?: string;
}) {
  if (sections.length === 0) {
    return (
      <EmptyState
        iconKey="FileText"
        title="No coverage yet"
        description="Publish articles with featured flags to populate this section."
        compact
      />
    );
  }
  return (
    <div className="space-y-7">
      {sections.map((section) => (
        <div key={section.major.id} className="space-y-2">
          <Link
            href={postPublicPath(section.major)}
            className="group relative block overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={proxiedImageSrc(section.major.image)}
                alt={section.major.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes={heroSizes}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90">
                  <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                    {primaryCategoryLabel(section.major)}
                  </span>
                  <span className="text-white/70">{section.major.readTime}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
                  {section.major.title}
                </h3>
              </div>
            </div>
          </Link>
          {section.minors.length > 0 ? (
            <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800/90 dark:border-zinc-800 dark:bg-zinc-950">
              {section.minors.map((minor) => (
                <li key={minor.id} className="px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <Link href={postPublicPath(minor)} className="group block">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                      {primaryCategoryLabel(minor)}
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
                      <span>{formatPublishDate(minor.publishDate)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CompactMajorBlocks({ sections }: { sections: MajorSection[] }) {
  if (sections.length === 0) return null;
  return (
    <>
      {sections.map((block) => (
        <div key={block.major.id} className="space-y-2">
          <Link
            href={postPublicPath(block.major)}
            className="group block overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80"
          >
            <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={proxiedImageSrc(block.major.image)}
                alt={block.major.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 320px, 100vw"
              />
            </div>
            <div className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                {primaryCategoryLabel(block.major)}
              </p>
              <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                {block.major.title}
              </h3>
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                <span>{formatPublishDate(block.major.publishDate)}</span>
              </div>
            </div>
          </Link>
          {block.minors.length > 0 ? (
            <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800/90 dark:border-zinc-800 dark:bg-zinc-950">
              {block.minors.map((row) => (
                <li key={row.id} className="px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <Link href={postPublicPath(row)} className="group block">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                      {primaryCategoryLabel(row)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                      {row.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {row.readTime}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </>
  );
}

export function PostCarousel({
  posts,
  viewAllHref = "/post",
}: {
  posts: FeedArticle[];
  viewAllHref?: string;
}) {
  if (posts.length === 0) {
    return (
      <EmptyState
        iconKey="FileText"
        title="No articles yet"
        description="Published articles will appear in this carousel."
        compact
      />
    );
  }
  return (
    <div className="relative min-w-0 overflow-hidden">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((a) => (
          <Link
            key={a.id}
            href={postPublicPath(a)}
            className="group w-[min(18rem,calc(100vw-4rem))] shrink-0 snap-start overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80 sm:w-72"
          >
            <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={proxiedImageSrc(a.image)}
                alt={a.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="288px"
              />
            </div>
            <div className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                {primaryCategoryLabel(a)}
              </p>
              <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                {a.title}
              </h3>
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                <span>{formatPublishDate(a.publishDate)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link href={viewAllHref} className={`mt-3 inline-flex text-sm ${linkAccent}`}>
        View all <ChevronRight className="ml-0.5 inline h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function PostGrid({ posts }: { posts: FeedArticle[] }) {
  if (posts.length === 0) {
    return (
      <EmptyState
        iconKey="FileText"
        title="No articles yet"
        description="Check back soon for more to read."
        compact
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-5">
      {posts.map((a) => (
        <Link
          key={a.id}
          href={postPublicPath(a)}
          className="group flex h-full flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80"
        >
          <div className="relative h-40 w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={proxiedImageSrc(a.image)}
              alt={a.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-1 flex-col p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
              {primaryCategoryLabel(a)}
            </p>
            <h3 className="mt-2 line-clamp-2 flex-1 font-display text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
              {a.title}
            </h3>
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{formatPublishDate(a.publishDate)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function LatestAnalysisBlock({
  featured,
  items,
  viewAllHref = "/post?type=trending",
}: {
  featured: FeedArticle | null;
  items: FeedArticle[];
  viewAllHref?: string;
}) {
  if (!featured && items.length === 0) {
    return (
      <EmptyState
        iconKey="FileText"
        title="No analysis yet"
        description="Mark articles as trending or expert picks to feature analysis here."
        compact
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-4">
        {featured ? (
          <Link
            href={postPublicPath(featured)}
            className="group block overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-colors hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/80"
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={proxiedImageSrc(featured.image)}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 28rem, 100vw"
              />
            </div>
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                {primaryCategoryLabel(featured)}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-800 dark:text-zinc-100 dark:group-hover:text-cyan-300">
                {featured.title}
              </h3>
              {"excerpt" in featured && featured.excerpt ? (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {featured.excerpt}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {featured.readTime}
                </span>
                <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
                <span>{formatPublishDate(featured.publishDate)}</span>
              </div>
            </div>
          </Link>
        ) : null}
      </div>
      <div className="lg:col-span-8">
        <div className="overflow-hidden bg-white dark:bg-zinc-950">
          {items.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 p-4 sm:p-5 lg:grid-cols-2">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={postPublicPath(item)}
                    className="group block h-full rounded-sm border border-zinc-200 bg-zinc-50 p-3.5 transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800/80 dark:hover:bg-zinc-800 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CategoryPills categories={categoryLabelList(item)} variant="muted" max={2} />
                        <div className="mt-2 font-display text-base font-bold leading-snug text-zinc-900 line-clamp-2 dark:text-zinc-100 sm:text-lg">
                          {item.title}
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {item.readTime}
                          </span>
                          <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
                          <span>{formatPublishDate(item.publishDate)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-zinc-500 dark:text-zinc-400">More analysis stories coming soon.</p>
          )}
          <Link
            href={viewAllHref}
            className={`flex items-center justify-between gap-2 border-t border-zinc-100 px-5 py-4 text-sm font-semibold dark:border-zinc-800 ${linkAccent}`}
          >
            Browse more analysis
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
