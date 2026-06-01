import { logSupabaseReadError } from "./supabase-read-errors";
import { partitionPostsBySection, getAllPostsWithLoadError } from "./posts";
import type { Post } from "./types";
import { formatCount, type AdminStats } from "./admin";
import { getSubscribers } from "./subscriber-actions";

function parseViews(s: string): number {
  const v = String(s || "0").trim().toUpperCase();
  const num = parseFloat(v.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num)) return 0;
  if (v.includes("M")) return Math.round(num * 1_000_000);
  if (v.includes("K")) return Math.round(num * 1_000);
  return Math.round(num);
}

export type DashboardInsights = {
  stats: AdminStats;
  publishedCount: number;
  draftCount: number;
  subscriberTotal: number;
  subscribersLast7Days: number;
  subscribersLast30Days: number;
  placement: {
    featured: number;
    expertPicks: number;
    trending: number;
    guides: number;
    latest: number;
  };
  topByViews: Array<{ id: string; title: string; views: number; slug: string | null; published: boolean }>;
  topByEngagement: Array<{ id: string; title: string; likes: number; bookmarks: number; slug: string | null }>;
  recentPosts: Post[];
  subscriberSparkline: number[];
  postsLoadError: string | null;
};

export type AnalyticsInsights = {
  stats: AdminStats;
  publishedCount: number;
  draftCount: number;
  avgViewsPerPost: number;
  avgLikesPerPost: number;
  engagementRate: number;
  viewsByPost: Array<{ id: string; title: string; views: number; likes: number; slug: string | null }>;
  categoryBreakdown: Array<{ name: string; count: number }>;
  placementBreakdown: Array<{ label: string; count: number; color: string }>;
  publishTimeline: Array<{ label: string; count: number }>;
  subscriberGrowth: Array<{ label: string; count: number }>;
  subscriberTotal: number;
  toolCount: number;
};

export type SubscriberInsights = {
  total: number;
  last7Days: number;
  last30Days: number;
  thisMonth: number;
  growthSeries: Array<{ label: string; count: number }>;
};

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lastNMonths(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(
    new Date(y, m - 1, 1)
  );
}

async function loadAllPosts(): Promise<{ posts: Post[]; loadError: string | null }> {
  try {
    return await getAllPostsWithLoadError();
  } catch (e) {
    logSupabaseReadError("admin-insights posts", e);
    return { posts: [], loadError: "Failed to load posts" };
  }
}

export async function getDashboardInsights(): Promise<DashboardInsights> {
  const [{ posts, loadError }, subscribers] = await Promise.all([loadAllPosts(), getSubscribers()]);

  const published = posts.filter((p) => p.published);
  const draftCount = posts.length - published.length;
  const partitioned = partitionPostsBySection(published);

  let totalLikes = 0;
  let totalViews = 0;
  let totalBookmarks = 0;
  let featuredCount = 0;
  let guidesCount = 0;
  for (const p of posts) {
    totalLikes += p.likes;
    totalViews += parseViews(p.views);
    totalBookmarks += p.bookmarks;
    if (p.featured) featuredCount++;
    if (p.guides) guidesCount++;
  }

  const stats: AdminStats = {
    totalArticles: posts.length,
    featuredCount,
    guidesCount,
    totalLikes,
    totalViews,
    totalBookmarks,
  };

  const now = Date.now();
  const weekAgo = now - 7 * 86_400_000;
  const monthAgo = now - 30 * 86_400_000;
  const subscribersLast7Days = subscribers.filter((s) => new Date(s.createdAt).getTime() >= weekAgo).length;
  const subscribersLast30Days = subscribers.filter((s) => new Date(s.createdAt).getTime() >= monthAgo).length;

  const dayBuckets = Array.from({ length: 14 }, (_, i) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (13 - i));
    return start.getTime();
  });
  const subscriberSparkline = dayBuckets.map((dayStart, i) => {
    const dayEnd = i < 13 ? dayBuckets[i + 1] : now + 86_400_000;
    return subscribers.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
  });

  const topByViews = [...published]
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      title: p.title,
      views: parseViews(p.views),
      slug: p.slug,
      published: p.published,
    }));

  const topByEngagement = [...published]
    .sort((a, b) => b.likes + b.bookmarks - (a.likes + a.bookmarks))
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      title: p.title,
      likes: p.likes,
      bookmarks: p.bookmarks,
      slug: p.slug,
    }));

  return {
    stats,
    publishedCount: published.length,
    draftCount,
    subscriberTotal: subscribers.length,
    subscribersLast7Days,
    subscribersLast30Days,
    placement: {
      featured: partitioned.featured.length,
      expertPicks: partitioned.expertPicks.length,
      trending: partitioned.trending.length,
      guides: partitioned.guides.length,
      latest: partitioned.latest.length,
    },
    topByViews,
    topByEngagement,
    recentPosts: posts.slice(0, 8),
    subscriberSparkline,
    postsLoadError: loadError,
  };
}

export async function getAnalyticsInsights(): Promise<AnalyticsInsights> {
  const [{ posts }, subscribers] = await Promise.all([loadAllPosts(), getSubscribers()]);
  const published = posts.filter((p) => p.published);
  const draftCount = posts.length - published.length;
  const partitioned = partitionPostsBySection(published);

  let totalLikes = 0;
  let totalViews = 0;
  let totalBookmarks = 0;
  let featuredCount = 0;
  let guidesCount = 0;
  for (const p of posts) {
    totalLikes += p.likes;
    totalViews += parseViews(p.views);
    totalBookmarks += p.bookmarks;
    if (p.featured) featuredCount++;
    if (p.guides) guidesCount++;
  }

  const stats: AdminStats = {
    totalArticles: posts.length,
    featuredCount,
    guidesCount,
    totalLikes,
    totalViews,
    totalBookmarks,
  };

  const publishedCount = published.length;
  const avgViewsPerPost = publishedCount ? Math.round(totalViews / publishedCount) : 0;
  const avgLikesPerPost = publishedCount ? Math.round((totalLikes / publishedCount) * 10) / 10 : 0;
  const engagementRate =
    totalViews > 0 ? Math.min(100, Math.round(((totalLikes + totalBookmarks) / totalViews) * 1000) / 10) : 0;

  const viewsByPost = [...published]
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, 15)
    .map((p) => ({
      id: p.id,
      title: p.title,
      views: parseViews(p.views),
      likes: p.likes,
      slug: p.slug,
    }));

  const catMap: Record<string, number> = {};
  for (const p of published) {
    for (const c of p.categories ?? ["General"]) {
      catMap[c] = (catMap[c] || 0) + 1;
    }
  }
  const categoryBreakdown = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const placementBreakdown = [
    { label: "Featured", count: partitioned.featured.length, color: "bg-violet-500" },
    { label: "Expert picks", count: partitioned.expertPicks.length, color: "bg-amber-500" },
    { label: "Trending", count: partitioned.trending.length, color: "bg-orange-500" },
    { label: "Guides", count: partitioned.guides.length, color: "bg-emerald-500" },
    { label: "Latest", count: partitioned.latest.length, color: "bg-sky-500" },
  ];

  const months = lastNMonths(6);
  const publishTimeline = months.map((key) => ({
    label: formatMonthLabel(key),
    count: published.filter((p) => monthKey(new Date(p.publishDate)) === key).length,
  }));

  const subscriberGrowth = months.map((key) => ({
    label: formatMonthLabel(key),
    count: subscribers.filter((s) => monthKey(new Date(s.createdAt)) === key).length,
  }));

  const { siteTools } = await import("./site-config");

  return {
    stats,
    publishedCount,
    draftCount,
    avgViewsPerPost,
    avgLikesPerPost,
    engagementRate,
    viewsByPost,
    categoryBreakdown,
    placementBreakdown,
    publishTimeline,
    subscriberGrowth,
    subscriberTotal: subscribers.length,
    toolCount: siteTools.length,
  };
}

export async function getSubscriberInsights(): Promise<SubscriberInsights> {
  const subscribers = await getSubscribers();
  const now = Date.now();
  const weekAgo = now - 7 * 86_400_000;
  const monthAgo = now - 30 * 86_400_000;
  const thisMonthKey = monthKey(new Date());

  const growthSeries = lastNMonths(6).map((key) => ({
    label: formatMonthLabel(key),
    count: subscribers.filter((s) => monthKey(new Date(s.createdAt)) === key).length,
  }));

  return {
    total: subscribers.length,
    last7Days: subscribers.filter((s) => new Date(s.createdAt).getTime() >= weekAgo).length,
    last30Days: subscribers.filter((s) => new Date(s.createdAt).getTime() >= monthAgo).length,
    thisMonth: subscribers.filter((s) => monthKey(new Date(s.createdAt)) === thisMonthKey).length,
    growthSeries,
  };
}

export { formatCount, parseViews };
