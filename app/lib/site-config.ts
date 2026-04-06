/** Site configuration - not post content (stored separately) */

/** 4 default categories shown when no articles exist yet */
export const defaultCategories = [
  { name: "Investing", count: "0 Articles", color: "from-zinc-800 to-zinc-900", iconKey: "TrendingUp" },
  { name: "Personal Finance", count: "0 Articles", color: "from-zinc-800 to-zinc-900", iconKey: "CreditCard" },
  { name: "Banking", count: "0 Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Building2" },
  { name: "Guides", count: "0 Articles", color: "from-zinc-800 to-zinc-900", iconKey: "BookOpen" },
];

export const categories = [
  { name: "Comparison", count: "320+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Scale" },
  { name: "Guides", count: "750+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "BookOpen" },
  { name: "Decision Making", count: "180+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Brain" },
  { name: "Economy", count: "290+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "BarChart3" },
  { name: "Markets", count: "540+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Activity" },
  { name: "Wealth", count: "380+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Target" },
  { name: "Investing", count: "1,250+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "TrendingUp" },
  { name: "Banking", count: "890+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Building2" },
  { name: "Personal Finance", count: "1,450+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "CreditCard" },
  { name: "Credit Cards", count: "567+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "CreditCard" },
  { name: "Crypto", count: "210+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Bitcoin" },
  { name: "Real Estate", count: "423+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Home" },
  { name: "Retirement", count: "678+ Articles", color: "from-zinc-800 to-zinc-900", iconKey: "Target" },
];

export type SiteTool = {
  slug: string;
  /** Lower = listed first on `/tools` (importance / broad appeal). */
  displayOrder: number;
  name: string;
  users: string;
  iconKey: string;
  /** One line for cards and SEO snippets */
  tagline: string;
  /** Longer blurb for the tools index */
  description: string;
  /** Extra tokens matched by site search */
  searchTerms: string[];
  /** Hero image on `/tools` when this tool is the featured spotlight */
  spotlightImage?: string;
};

/** Canonical list — add new tools here; slugs power `/tools/[slug]`. */
export const siteTools: SiteTool[] = [
  {
    slug: "mortgage-calculator",
    displayOrder: 2,
    name: "Mortgage Calculator",
    users: "125K+",
    iconKey: "Calculator",
    tagline: "PITI, PMI, amortization & refinance math",
    description:
      "Advanced home loan calculator with taxes, insurance, PMI lifecycle, full amortization schedules, refinance break-even, and affordability from your DTI.",
    searchTerms: ["mortgage", "home loan", "PITI", "PMI", "house payment", "refinance", "amortization"],
  },
  {
    slug: "investment-calculator",
    displayOrder: 3,
    name: "Investment Calculator",
    users: "98K+",
    iconKey: "BarChart3",
    tagline: "Compound growth, FIRE paths & Monte Carlo",
    description:
      "Project wealth with fees and inflation, explore FIRE timelines, stress tests, lump sum vs DCA, and illustrative Monte Carlo bands.",
    searchTerms: ["invest", "compound", "FIRE", "portfolio", "stocks", "returns", "Monte Carlo", "DCA"],
  },
  {
    slug: "budget-planner",
    displayOrder: 1,
    name: "Budget Planner",
    users: "156K+",
    iconKey: "PieChart",
    tagline: "Zero-based buckets & 50/30/20",
    description:
      "Build a monthly plan with needs, wants, savings, and debt buckets—track what’s left and export a snapshot for review.",
    searchTerms: ["budget", "spending", "50 30 20", "zero based", "monthly plan", "cash flow"],
    spotlightImage:
      "https://images.unsplash.com/photo-1579621970563-ebec7569ff3e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "retirement-calculator",
    displayOrder: 4,
    name: "Retirement Calculator",
    users: "87K+",
    iconKey: "Target",
    tagline: "Nest egg, withdrawals & longevity",
    description:
      "Estimate how savings and drawdown rules interact—set targets, try contribution paths, and stress-test your retirement timeline.",
    searchTerms: ["retirement", "401k", "nest egg", "withdrawal", "pension", "RMD", "savings rate"],
  },
  {
    slug: "loan-calculator",
    displayOrder: 7,
    name: "Loan Calculator",
    users: "76K+",
    iconKey: "DollarSign",
    tagline: "Payoff curves, extra payments & compare",
    description:
      "Amortize auto and personal loans, model extra payments, compare scenarios, and see total interest at a glance.",
    searchTerms: ["loan", "auto loan", "personal loan", "payment", "interest", "payoff", "amortization"],
  },
  {
    slug: "credit-score-simulator",
    displayOrder: 8,
    name: "Credit Score Simulator",
    users: "134K+",
    iconKey: "Activity",
    tagline: "Factors, mix & utilization what-ifs",
    description:
      "Educational simulator for utilization, payment history, age of accounts, inquiries, and credit mix—not a real bureau score.",
    searchTerms: ["credit score", "FICO", "utilization", "inquiries", "credit mix", "payment history", "improve credit"],
  },
  {
    slug: "emergency-fund-calculator",
    displayOrder: 5,
    name: "Emergency Fund & Runway",
    users: "64K+",
    iconKey: "Umbrella",
    tagline: "Months of runway, targets & time-to-goal",
    description:
      "Estimate how long your cash cushion lasts, set a months-of-expenses target, and see how fast monthly savings can close the gap.",
    searchTerms: ["emergency fund", "runway", "rainy day", "savings buffer", "months of expenses", "financial cushion"],
  },
  {
    slug: "debt-payoff-planner",
    displayOrder: 6,
    name: "Debt Payoff Planner",
    users: "71K+",
    iconKey: "Layers",
    tagline: "Snowball vs avalanche & payoff order",
    description:
      "Model multiple debts with minimums and extra payments—compare snowball (smallest balance first) vs avalanche (highest APR first) and see months and total interest.",
    searchTerms: ["debt snowball", "debt avalanche", "pay off debt", "credit card payoff", "debt free", "minimum payment"],
  },
  {
    slug: "net-worth-fi-snapshot",
    displayOrder: 9,
    name: "Net Worth & FI Snapshot",
    users: "58K+",
    iconKey: "Gem",
    tagline: "Balance sheet, FI target & freedom bands",
    description:
      "Plot net worth, a withdrawal-rate FI number, illustrative progress, lean vs fat spend moons, and a playful freedom band—then export JSON.",
    searchTerms: ["net worth", "financial independence", "FI number", "4 percent rule", "FIRE calculator", "freedom", "balance sheet"],
  },
  {
    slug: "student-loan-snapshot",
    displayOrder: 10,
    name: "Student Loan Path Snapshot",
    users: "62K+",
    iconKey: "GraduationCap",
    tagline: "Standard vs IDR-style payment (illustrative)",
    description:
      "Compare a level standard payment to a simplified income-driven payment using estimated discretionary income—see interest, payment stress, and an illustrative balance path. Not federal servicer math.",
    searchTerms: ["student loans", "IDR", "income driven repayment", "SAVE", "PAYE", "student debt", "federal loans", "discretionary income"],
  },
  {
    slug: "crypto-yield-lab",
    displayOrder: 12,
    name: "Crypto Staking & Yield Lab",
    users: "49K+",
    iconKey: "Coins",
    tagline: "APY, compounding & APR → APY",
    description:
      "See how headline APY compounds on daily, monthly, or annual schedules; compare frequencies at the same rate; convert APR to APY for literacy—not live protocol quotes.",
    searchTerms: ["crypto staking", "APY calculator", "DeFi yield", "compound interest crypto", "APR vs APY", "staking rewards"],
  },
  {
    slug: "subscription-spend-audit",
    displayOrder: 11,
    name: "Subscription & Recurring Spend Audit",
    users: "53K+",
    iconKey: "Repeat",
    tagline: "Annualize autopay & model trims",
    description:
      "Add recurring charges by line, see monthly and yearly totals, category bars, an optional trim scenario, and export JSON—awareness for subscriptions and autopay.",
    searchTerms: ["subscription tracker", "recurring expenses", "monthly subscriptions", "cancel subscriptions", "autopay audit", "spending leaks"],
  },
];

/** Same tools as `siteTools`, sorted for the tools index and related promos (lower `displayOrder` first). */
export const siteToolsByDisplayOrder: SiteTool[] = [...siteTools].sort(
  (a, b) => a.displayOrder - b.displayOrder
);

/** @deprecated Prefer `siteTools` — same array, kept for gradual migration */
export const quickTools = siteTools;
