/** Site configuration - not post content (stored separately) */

/** 4 default categories shown when no articles exist yet */
export const defaultCategories = [
  { name: "Investing", count: "0 Articles", color: "from-purple-500 to-purple-600", iconKey: "TrendingUp" },
  { name: "Personal Finance", count: "0 Articles", color: "from-purple-500 to-purple-600", iconKey: "CreditCard" },
  { name: "Banking", count: "0 Articles", color: "from-emerald-500 to-emerald-600", iconKey: "Building2" },
  { name: "Guides", count: "0 Articles", color: "from-green-500 to-green-600", iconKey: "BookOpen" },
];

export const categories = [
  { name: "Comparison", count: "320+ Articles", color: "from-blue-500 to-blue-600", iconKey: "Scale" },
  { name: "Guides", count: "750+ Articles", color: "from-green-500 to-green-600", iconKey: "BookOpen" },
  { name: "Decision Making", count: "180+ Articles", color: "from-violet-500 to-violet-600", iconKey: "Brain" },
  { name: "Economy", count: "290+ Articles", color: "from-red-500 to-red-600", iconKey: "BarChart3" },
  { name: "Markets", count: "540+ Articles", color: "from-cyan-500 to-cyan-600", iconKey: "Activity" },
  { name: "Wealth", count: "380+ Articles", color: "from-amber-500 to-amber-600", iconKey: "Target" },
  { name: "Investing", count: "1,250+ Articles", color: "from-purple-500 to-purple-600", iconKey: "TrendingUp" },
  { name: "Banking", count: "890+ Articles", color: "from-emerald-500 to-emerald-600", iconKey: "Building2" },
  { name: "Personal Finance", count: "1,450+ Articles", color: "from-purple-500 to-purple-600", iconKey: "CreditCard" },
  { name: "Credit Cards", count: "567+ Articles", color: "from-orange-500 to-orange-600", iconKey: "CreditCard" },
  { name: "Real Estate", count: "423+ Articles", color: "from-pink-500 to-pink-600", iconKey: "Home" },
  { name: "Retirement", count: "678+ Articles", color: "from-indigo-500 to-indigo-600", iconKey: "Target" },
];

export type SiteTool = {
  slug: string;
  name: string;
  users: string;
  iconKey: string;
  /** One line for cards and SEO snippets */
  tagline: string;
  /** Longer blurb for the tools index */
  description: string;
  /** Extra tokens matched by site search */
  searchTerms: string[];
};

/** Canonical list — add new tools here; slugs power `/tools/[slug]`. */
export const siteTools: SiteTool[] = [
  {
    slug: "mortgage-calculator",
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
    name: "Budget Planner",
    users: "156K+",
    iconKey: "PieChart",
    tagline: "Zero-based buckets & 50/30/20",
    description:
      "Build a monthly plan with needs, wants, savings, and debt buckets—track what’s left and export a snapshot for review.",
    searchTerms: ["budget", "spending", "50 30 20", "zero based", "monthly plan", "cash flow"],
  },
  {
    slug: "retirement-calculator",
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
    name: "Credit Score Simulator",
    users: "134K+",
    iconKey: "Activity",
    tagline: "Factors, mix & utilization what-ifs",
    description:
      "Educational simulator for utilization, payment history, age of accounts, inquiries, and credit mix—not a real bureau score.",
    searchTerms: ["credit score", "FICO", "utilization", "inquiries", "credit mix", "payment history", "improve credit"],
  },
];

/** @deprecated Prefer `siteTools` — same array, kept for gradual migration */
export const quickTools = siteTools;
