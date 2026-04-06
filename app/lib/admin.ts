import { createServerClient, isSupabaseConfigured } from "./supabase/server";
import { logSupabaseReadError } from "./supabase-read-errors";

export type AdminStats = {
  totalArticles: number;
  featuredCount: number;
  guidesCount: number;
  totalLikes: number;
  totalViews: number;
  totalBookmarks: number;
};

/** Parse views string (e.g. "125K", "1.2M", "500") to number */
function parseViews(s: string): number {
  const v = String(s || "0").trim().toUpperCase();
  const num = parseFloat(v.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return 0;
  if (v.includes("M")) return Math.round(num * 1_000_000);
  if (v.includes("K")) return Math.round(num * 1_000);
  return Math.round(num);
}

/** Aggregated stats from Supabase posts for admin dashboard */
export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured()) {
    return {
      totalArticles: 0,
      featuredCount: 0,
      guidesCount: 0,
      totalLikes: 0,
      totalViews: 0,
      totalBookmarks: 0,
    };
  }
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("featured, guides, likes, views, bookmarks");
    if (error) {
      logSupabaseReadError("getAdminStats", error);
      return {
        totalArticles: 0,
        featuredCount: 0,
        guidesCount: 0,
        totalLikes: 0,
        totalViews: 0,
        totalBookmarks: 0,
      };
    }
    const rows = (data || []) as Array<{
      featured?: boolean;
      guides?: boolean;
      likes?: number;
      views?: string;
      bookmarks?: number;
    }>;
    let totalLikes = 0;
    let totalViews = 0;
    let totalBookmarks = 0;
    let featuredCount = 0;
    let guidesCount = 0;
    for (const r of rows) {
      totalLikes += Number(r.likes) || 0;
      totalViews += parseViews(r.views ?? "0");
      totalBookmarks += Number(r.bookmarks) || 0;
      if (r.featured) featuredCount++;
      if (r.guides) guidesCount++;
    }
    return {
      totalArticles: rows.length,
      featuredCount,
      guidesCount,
      totalLikes,
      totalViews,
      totalBookmarks,
    };
  } catch (e) {
    logSupabaseReadError("getAdminStats", e);
    return {
      totalArticles: 0,
      featuredCount: 0,
      guidesCount: 0,
      totalLikes: 0,
      totalViews: 0,
      totalBookmarks: 0,
    };
  }
}

/** Format large numbers for display */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
