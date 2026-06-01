/** Shared copy for admin placement UI — matches `partitionPostsBySection` in posts.ts */

import {
  HOME_HEADLINE_LIST_MAX,
  HOME_LATEST_CAROUSEL_MAX,
  HOME_MAJOR_COVERAGE_MAX,
  HOME_POPULAR_RAIL_MAX,
  HOME_TOP_PICKS_MAX,
  LATEST_ANALYSIS_ITEMS_MAX,
  LATEST_ARTICLES_PAGE_SIZE,
  POST_LIST_MAJOR_COVERAGE_MAX,
  READ_MORE_MAX,
  RELATED_CAROUSEL_MAX,
  SIDEBAR_RAIL_MAX,
} from "./post-feeds";

export const PLACEMENT_PRIORITY =
  "Featured → Expert Pick → Trending → Popular Guide → Latest slot (default)";

export const PLACEMENT_SLOTS = [
  {
    key: "featured" as const,
    label: "Featured",
    color: "bg-violet-500",
    summary: "Hero stacks (1 major + 4 minors per section)",
    surfaces: "Home major coverage · /post editorial majors",
    /** Minimum published articles to flag for healthy home/post majors */
    recommendedCount: HOME_MAJOR_COVERAGE_MAX,
    recommendedLabel: `${HOME_MAJOR_COVERAGE_MAX}+ articles`,
  },
  {
    key: "expertPicks" as const,
    label: "Expert picks",
    color: "bg-amber-500",
    summary: "Top picks rails and expert sections",
    surfaces: "Home top picks · /post sidebar · article detail sidebar",
    recommendedCount: HOME_TOP_PICKS_MAX,
    recommendedLabel: `${HOME_TOP_PICKS_MAX}+ articles`,
  },
  {
    key: "trending" as const,
    label: "Trending",
    color: "bg-orange-500",
    summary: "Latest analysis block (priority slot)",
    surfaces: "Home & /post analysis modules",
    recommendedCount: LATEST_ANALYSIS_ITEMS_MAX + 1,
    recommendedLabel: `${LATEST_ANALYSIS_ITEMS_MAX + 1}+ articles (1 hero + ${LATEST_ANALYSIS_ITEMS_MAX} items)`,
  },
  {
    key: "guides" as const,
    label: "Guides",
    color: "bg-emerald-500",
    summary: "Guide-labeled stacks and top-picks fallback",
    surfaces: "Home top picks fallback · /post guides tab",
    recommendedCount: HOME_TOP_PICKS_MAX,
    recommendedLabel: `${HOME_TOP_PICKS_MAX}+ articles`,
  },
  {
    key: "latest" as const,
    label: "Latest slot",
    color: "bg-sky-500",
    summary: "Default bucket — no editorial flags set",
    surfaces: `/post Latest tab · grid (${LATEST_ARTICLES_PAGE_SIZE}/page) · detail Read more (${READ_MORE_MAX})`,
    recommendedCount: LATEST_ARTICLES_PAGE_SIZE,
    recommendedLabel: `${LATEST_ARTICLES_PAGE_SIZE}+ for a full grid page`,
  },
] as const;

export const HOME_LATEST_CAROUSEL = {
  title: "Latest Articles",
  location: "Homepage (`/`) — section near the bottom, above the CTA block",
  maxVisible: HOME_LATEST_CAROUSEL_MAX,
  behavior: `Shows up to ${HOME_LATEST_CAROUSEL_MAX} published posts sorted by publish date from your full article pool (all sections combined), not only articles in the “Latest slot” bucket.`,
};

/** Per-page UI blocks with hard caps from the codebase (for admin allocation planning). */
export const SURFACE_BLOCK_ALLOCATIONS = [
  {
    page: "Home (`/`)",
    blocks: [
      {
        block: "Headline list (left rail)",
        maxShown: HOME_HEADLINE_LIST_MAX,
        pool: "All published (feed pool)",
        flagHint: "Any; Featured appear first in pool",
      },
      {
        block: "Major coverage (center)",
        maxShown: HOME_MAJOR_COVERAGE_MAX,
        pool: `${HOME_MAJOR_COVERAGE_MAX} slots = 3 stacks × (1 hero + 4 minors)`,
        flagHint: `Aim for ${HOME_MAJOR_COVERAGE_MAX}+ Featured`,
      },
      {
        block: "Popular (sidebar)",
        maxShown: HOME_POPULAR_RAIL_MAX,
        pool: "Top by views (loads up to 20, shows 5)",
        flagHint: "Any published article",
      },
      {
        block: "Top picks (sidebar)",
        maxShown: HOME_TOP_PICKS_MAX,
        pool: "Guides + Expert picks (deduped)",
        flagHint: `${HOME_TOP_PICKS_MAX}+ Guides and/or Expert Pick`,
      },
      {
        block: "Latest Articles carousel",
        maxShown: HOME_LATEST_CAROUSEL_MAX,
        pool: "All published by date",
        flagHint: "Any; not limited to Latest slot",
      },
      {
        block: "Latest analysis",
        maxShown: LATEST_ANALYSIS_ITEMS_MAX + 1,
        pool: "Trending → Expert → Featured",
        flagHint: `${LATEST_ANALYSIS_ITEMS_MAX + 1}+ Trending (or Expert/Featured fallback)`,
      },
    ],
  },
  {
    page: "Post list (`/post`)",
    blocks: [
      {
        block: "Editorial major stacks",
        maxShown: POST_LIST_MAJOR_COVERAGE_MAX,
        pool: `${POST_LIST_MAJOR_COVERAGE_MAX} slots = 5 stacks × (1 hero + 4 minors)`,
        flagHint: `Varies by tab; Featured tab needs ${POST_LIST_MAJOR_COVERAGE_MAX}+ Featured`,
      },
      {
        block: "Popular (sidebar)",
        maxShown: HOME_POPULAR_RAIL_MAX,
        pool: "Top by views",
        flagHint: "Any",
      },
      {
        block: "Top picks (sidebar)",
        maxShown: HOME_TOP_PICKS_MAX,
        pool: "Guides + Expert picks",
        flagHint: `${HOME_TOP_PICKS_MAX}+ Guides / Expert Pick`,
      },
      {
        block: "Latest analysis (full width)",
        maxShown: LATEST_ANALYSIS_ITEMS_MAX + 1,
        pool: "Trending → Expert → Featured",
        flagHint: `${LATEST_ANALYSIS_ITEMS_MAX + 1}+ Trending`,
      },
      {
        block: "Latest articles grid",
        maxShown: LATEST_ARTICLES_PAGE_SIZE,
        pool: "Per page; filtered by tab/search",
        flagHint: `Latest slot or all; ${LATEST_ARTICLES_PAGE_SIZE} per page`,
      },
    ],
  },
  {
    page: "Post detail (`/post/[slug]`)",
    blocks: [
      {
        block: "Popular rail",
        maxShown: SIDEBAR_RAIL_MAX,
        pool: "Top views (excl. current)",
        flagHint: "Any",
      },
      {
        block: "Top picks rail",
        maxShown: SIDEBAR_RAIL_MAX,
        pool: "Guides + Expert picks",
        flagHint: "Guides / Expert Pick",
      },
      {
        block: "Related articles carousel",
        maxShown: RELATED_CAROUSEL_MAX,
        pool: "Tag → category → recent",
        flagHint: "Strong tags/categories help fill",
      },
      {
        block: "Read more grid",
        maxShown: READ_MORE_MAX,
        pool: "Latest slot bucket",
        flagHint: `${READ_MORE_MAX}+ in Latest slot (no flags)`,
      },
    ],
  },
] as const;
