import type { Post } from "./types";
import {
  HOME_TOP_PICKS_MAX,
  LATEST_ANALYSIS_ITEMS_MAX,
  POST_LIST_MAJOR_COVERAGE_MAX,
  sortByPublishDateDesc,
  sortByViewsDesc,
} from "./post-feeds";

export type EditorialBucket = "featured" | "expertPicks" | "trending" | "guides" | "latest";

export type AllocationQuotas = {
  featured: number;
  expertPicks: number;
  trending: number;
  guides: number;
};

export type PostFlagAssignment = {
  featured: boolean;
  expert_picks: boolean;
  trending: boolean;
  guides: boolean;
};

export type AllocationPlan = {
  assignments: Map<string, PostFlagAssignment>;
  bucketByPostId: Map<string, EditorialBucket>;
  counts: Record<EditorialBucket, number>;
  quotas: AllocationQuotas;
  totalPublished: number;
};

/** Target exclusive-bucket sizes (Latest = all remaining published). */
export function getTargetQuotas(): AllocationQuotas {
  return {
    featured: POST_LIST_MAJOR_COVERAGE_MAX,
    expertPicks: HOME_TOP_PICKS_MAX,
    trending: LATEST_ANALYSIS_ITEMS_MAX + 1,
    guides: HOME_TOP_PICKS_MAX,
  };
}

function parseViews(views: string): number {
  return parseInt(String(views ?? "0").replace(/[^0-9]/g, ""), 10) || 0;
}

function engagementScore(p: Post): number {
  return parseViews(p.views) + p.likes * 12 + p.bookmarks * 8;
}

function isGuideCandidate(p: Post): boolean {
  const cats = (p.categories ?? []).join(" ").toLowerCase();
  if (cats.includes("guide")) return true;
  return (p.tags ?? []).some((t) => /guide|how-to|howto|tutorial|walkthrough/i.test(t));
}

/** When the library is smaller than quota sum, fill higher-priority buckets first. */
export function scaleQuotasToAvailable(total: number, quotas: AllocationQuotas): AllocationQuotas {
  const priority: (keyof AllocationQuotas)[] = ["featured", "expertPicks", "trending", "guides"];
  const sum = priority.reduce((a, k) => a + quotas[k], 0);
  if (total >= sum) return { ...quotas };

  const out: AllocationQuotas = { featured: 0, expertPicks: 0, trending: 0, guides: 0 };
  let left = total;
  for (const key of priority) {
    const take = Math.min(quotas[key], left);
    out[key] = take;
    left -= take;
    if (left <= 0) break;
  }
  return out;
}

function removeFromPool(pool: Post[], picked: Post[]): Post[] {
  const ids = new Set(picked.map((p) => p.id));
  return pool.filter((p) => !ids.has(p.id));
}

/** Round-robin across categories so Featured majors aren’t all one topic. */
function pickFeaturedDiverse(pool: Post[], count: number): Post[] {
  if (count <= 0 || pool.length === 0) return [];
  const byViews = sortByViewsDesc(pool);
  const groups = new Map<string, Post[]>();
  for (const p of byViews) {
    const cat = p.categories?.[0] ?? "General";
    const list = groups.get(cat) ?? [];
    list.push(p);
    groups.set(cat, list);
  }
  const cats = [...groups.keys()].sort();
  const picked: Post[] = [];
  const pickedIds = new Set<string>();
  let round = 0;
  while (picked.length < count && round < count * cats.length + 1) {
    for (const cat of cats) {
      if (picked.length >= count) break;
      const list = groups.get(cat) ?? [];
      const next = list.find((p) => !pickedIds.has(p.id));
      if (next) {
        picked.push(next);
        pickedIds.add(next.id);
      }
    }
    round++;
  }
  if (picked.length < count) {
    for (const p of byViews) {
      if (picked.length >= count) break;
      if (!pickedIds.has(p.id)) {
        picked.push(p);
        pickedIds.add(p.id);
      }
    }
  }
  return picked.slice(0, count);
}

function assignmentForBucket(bucket: EditorialBucket): PostFlagAssignment {
  return {
    featured: bucket === "featured",
    expert_picks: bucket === "expertPicks",
    trending: bucket === "trending",
    guides: bucket === "guides",
  };
}

/**
 * Assign each published article to exactly one editorial bucket (mutually exclusive flags).
 * Latest bucket = all remaining articles (powers paginated Latest tab & Read more).
 */
export function computeArticleAllocation(publishedPosts: Post[]): AllocationPlan {
  const target = getTargetQuotas();
  const sorted = sortByPublishDateDesc(publishedPosts);
  const quotas = scaleQuotasToAvailable(sorted.length, target);

  let pool = [...sorted];
  const bucketByPostId = new Map<string, EditorialBucket>();
  const assignments = new Map<string, PostFlagAssignment>();

  const assign = (posts: Post[], bucket: EditorialBucket) => {
    for (const p of posts) {
      bucketByPostId.set(p.id, bucket);
      assignments.set(p.id, assignmentForBucket(bucket));
    }
  };

  const guideCandidates = pool.filter(isGuideCandidate);
  const guidePool = sortByViewsDesc(guideCandidates);
  let guidesPicked = guidePool.slice(0, Math.min(quotas.guides, guidePool.length));
  if (guidesPicked.length < quotas.guides) {
    const pickedIds = new Set(guidesPicked.map((p) => p.id));
    const extra = sortByViewsDesc(pool.filter((p) => !pickedIds.has(p.id))).slice(
      0,
      quotas.guides - guidesPicked.length
    );
    guidesPicked = [...guidesPicked, ...extra];
  }
  assign(guidesPicked.slice(0, quotas.guides), "guides");
  pool = removeFromPool(pool, guidesPicked);

  const trendingPicked = sortByPublishDateDesc(pool).slice(0, quotas.trending);
  assign(trendingPicked, "trending");
  pool = removeFromPool(pool, trendingPicked);

  const featuredPicked = pickFeaturedDiverse(pool, quotas.featured);
  assign(featuredPicked, "featured");
  pool = removeFromPool(pool, featuredPicked);

  const expertPicked = sortByViewsDesc(pool).slice(0, quotas.expertPicks);
  assign(expertPicked, "expertPicks");
  pool = removeFromPool(pool, expertPicked);

  assign(pool, "latest");

  const counts: Record<EditorialBucket, number> = {
    featured: 0,
    expertPicks: 0,
    trending: 0,
    guides: 0,
    latest: 0,
  };
  for (const bucket of bucketByPostId.values()) {
    counts[bucket]++;
  }

  return {
    assignments,
    bucketByPostId,
    counts,
    quotas,
    totalPublished: sorted.length,
  };
}

export function allocationPlanToSummary(plan: AllocationPlan): string {
  const { counts, quotas, totalPublished } = plan;
  return [
    `${totalPublished} published articles → one bucket each (no duplicates).`,
    `Featured ${counts.featured}/${quotas.featured} · Expert ${counts.expertPicks}/${quotas.expertPicks} · Trending ${counts.trending}/${quotas.trending} · Guides ${counts.guides}/${quotas.guides} · Latest ${counts.latest} (all remaining, paginated grids).`,
  ].join(" ");
}
