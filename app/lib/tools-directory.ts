import { siteTools, siteToolsByDisplayOrder, type SiteTool } from "./site-config";
import { TOOL_SEO } from "./tool-seo";

export type ToolGroup = {
  id: string;
  label: string;
  blurb: string;
  slugs: string[];
};

/** Curated groups for `/tools` directory navigation — every slug should appear once. */
export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "plan",
    label: "Plan & cash flow",
    blurb: "Budgets, buffers, and where your money goes.",
    slugs: ["budget-planner", "emergency-fund-calculator", "subscription-spend-audit"],
  },
  {
    id: "borrow",
    label: "Borrow & credit",
    blurb: "Loans, payoff strategies, and credit literacy.",
    slugs: [
      "mortgage-calculator",
      "loan-calculator",
      "debt-payoff-planner",
      "student-loan-snapshot",
      "credit-score-simulator",
    ],
  },
  {
    id: "grow",
    label: "Invest & retire",
    blurb: "Long-term wealth, independence, and drawdown thinking.",
    slugs: ["investment-calculator", "retirement-calculator", "net-worth-fi-snapshot"],
  },
  {
    id: "markets",
    label: "Markets & specialized",
    blurb: "Targeted scenarios and niche planning utilities.",
    slugs: ["crypto-yield-lab"],
  },
];

/** Slug → React entry component filename under `app/components/tools/`. */
export const TOOL_ENTRY_FILES: Record<string, string> = {
  "mortgage-calculator": "MortgageCalculatorEntry.tsx",
  "investment-calculator": "InvestmentCalculatorEntry.tsx",
  "budget-planner": "BudgetCalculatorEntry.tsx",
  "retirement-calculator": "RetirementCalculatorEntry.tsx",
  "loan-calculator": "LoanCalculatorEntry.tsx",
  "credit-score-simulator": "CreditCalculatorEntry.tsx",
  "emergency-fund-calculator": "EmergencyFundCalculatorEntry.tsx",
  "debt-payoff-planner": "DebtPayoffPlannerEntry.tsx",
  "net-worth-fi-snapshot": "FiSnapshotEntry.tsx",
  "student-loan-snapshot": "StudentLoanSnapshotEntry.tsx",
  "crypto-yield-lab": "CryptoYieldLabEntry.tsx",
  "subscription-spend-audit": "SubscriptionAuditEntry.tsx",
};

export type ToolSurfaceBlock = {
  surface: string;
  block: string;
  maxShown: number | string;
  pool: string;
  notes?: string;
};

/** Where tools surface across the public site (from layout code). */
export const TOOL_SURFACE_BLOCKS: ToolSurfaceBlock[] = [
  {
    surface: "Tools index",
    block: "Featured spotlight",
    maxShown: 1,
    pool: "Lowest `displayOrder` in `siteToolsByDisplayOrder`",
    notes: "Hero card at top of `/tools`",
  },
  {
    surface: "Tools index",
    block: "Directory groups",
    maxShown: "All",
    pool: "`TOOL_GROUPS` — each slug listed once",
  },
  {
    surface: "Home",
    block: "Sidebar rail (desktop)",
    maxShown: 5,
    pool: "`pickDailyTools(siteTools, 5, \"home-sidebar\")`",
  },
  {
    surface: "Home",
    block: "Mobile tools carousel",
    maxShown: "All",
    pool: "Full `siteTools` array",
  },
  {
    surface: "Post list",
    block: "Sidebar rail",
    maxShown: 5,
    pool: "`pickDailyTools(siteTools, 5, \"post-list-sidebar\")`",
  },
  {
    surface: "Article detail",
    block: "Sidebar rail (desktop)",
    maxShown: 5,
    pool: "`pickDailyTools(siteTools, 5, \"post-article-{id}\")` per article",
  },
  {
    surface: "Article detail",
    block: "Mobile tools carousel",
    maxShown: "All",
    pool: "Full `siteTools` array",
  },
  {
    surface: "Header",
    block: "Nav spotlight",
    maxShown: 3,
    pool: "`pickDailyTools(siteTools, 3, \"nav-tools-spotlight\")`",
  },
  {
    surface: "Header",
    block: "Site search results",
    maxShown: 5,
    pool: "`toolMatchesSearch` on `siteTools`",
  },
  {
    surface: "Footer",
    block: "Tools links",
    maxShown: 3,
    pool: "`pickDailyTools(siteTools, 3, \"nav-tools-spotlight\")`",
  },
  {
    surface: "Tool detail",
    block: "Related tools rail",
    maxShown: "All − current",
    pool: "`siteToolsByDisplayOrder` minus active slug",
  },
];

export type ToolDirectoryRow = {
  slug: string;
  name: string;
  displayOrder: number;
  groupLabel: string | null;
  groupId: string | null;
  users: string;
  iconKey: string;
  tagline: string;
  description: string;
  searchTerms: string[];
  hasSeo: boolean;
  hasEntry: boolean;
  hasSpotlightImage: boolean;
  isSpotlight: boolean;
  publicPath: string;
  entryFile: string | null;
};

export type ToolGroupSummary = ToolGroup & {
  toolCount: number;
  missingSlugs: string[];
};

export type ToolDirectoryInsights = {
  toolCount: number;
  groupCount: number;
  spotlightSlug: string | null;
  spotlightName: string;
  seoCoverage: number;
  entryCoverage: number;
  rows: ToolDirectoryRow[];
  groups: ToolGroupSummary[];
  missingFromGroups: string[];
  orphanGroupSlugs: string[];
  missingSeo: string[];
  missingEntry: string[];
  isHealthy: boolean;
};

function buildSlugToGroup(): Map<string, { id: string; label: string }> {
  const map = new Map<string, { id: string; label: string }>();
  for (const group of TOOL_GROUPS) {
    for (const slug of group.slugs) {
      map.set(slug, { id: group.id, label: group.label });
    }
  }
  return map;
}

export function getToolDirectoryInsights(): ToolDirectoryInsights {
  const allSlugs = new Set(siteTools.map((t) => t.slug));
  const groupedSlugs = new Set(TOOL_GROUPS.flatMap((g) => g.slugs));
  const slugToGroup = buildSlugToGroup();
  const spotlight = siteToolsByDisplayOrder[0] ?? null;

  const missingFromGroups = siteTools.filter((t) => !groupedSlugs.has(t.slug)).map((t) => t.slug);
  const orphanGroupSlugs = [...groupedSlugs].filter((s) => !allSlugs.has(s));
  const missingSeo = siteTools.filter((t) => !TOOL_SEO[t.slug]).map((t) => t.slug);
  const missingEntry = siteTools.filter((t) => !TOOL_ENTRY_FILES[t.slug]).map((t) => t.slug);

  const rows: ToolDirectoryRow[] = siteToolsByDisplayOrder.map((tool) => {
    const group = slugToGroup.get(tool.slug);
    return {
      slug: tool.slug,
      name: tool.name,
      displayOrder: tool.displayOrder,
      groupLabel: group?.label ?? null,
      groupId: group?.id ?? null,
      users: tool.users,
      iconKey: tool.iconKey,
      tagline: tool.tagline,
      description: tool.description,
      searchTerms: tool.searchTerms,
      hasSeo: Boolean(TOOL_SEO[tool.slug]),
      hasEntry: Boolean(TOOL_ENTRY_FILES[tool.slug]),
      hasSpotlightImage: Boolean(tool.spotlightImage),
      isSpotlight: spotlight?.slug === tool.slug,
      publicPath: `/tools/${tool.slug}`,
      entryFile: TOOL_ENTRY_FILES[tool.slug] ?? null,
    };
  });

  const groups: ToolGroupSummary[] = TOOL_GROUPS.map((group) => ({
    ...group,
    toolCount: group.slugs.filter((s) => allSlugs.has(s)).length,
    missingSlugs: group.slugs.filter((s) => !allSlugs.has(s)),
  }));

  return {
    toolCount: siteTools.length,
    groupCount: TOOL_GROUPS.length,
    spotlightSlug: spotlight?.slug ?? null,
    spotlightName: spotlight?.name ?? "—",
    seoCoverage: siteTools.length - missingSeo.length,
    entryCoverage: siteTools.length - missingEntry.length,
    rows,
    groups,
    missingFromGroups,
    orphanGroupSlugs,
    missingSeo,
    missingEntry,
    isHealthy:
      missingFromGroups.length === 0 &&
      orphanGroupSlugs.length === 0 &&
      missingSeo.length === 0 &&
      missingEntry.length === 0,
  };
}

export function toolBySlug(slug: string): SiteTool | undefined {
  return siteTools.find((t) => t.slug === slug);
}
