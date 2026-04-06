import type { Metadata } from "next";
import { absoluteUrl, SITE_URL } from "./seo";

/** Per-tool SEO: distinct SERP angles (planner vs “test/lab/simulator”) under the Facts Deck brand. */
export type ToolSeoConfig = {
  /** Full `<title>`; use with `title.absolute` so root layout template does not duplicate “| Facts Deck”. */
  title: string;
  description: string;
  keywords: string[];
  /** Primary WebApplication name in JSON-LD */
  webAppName: string;
  /** Extra names people might search (e.g. “Budget Test”, “mortgage payment calculator”) */
  alternateNames: string[];
  /** Short description for schema (can mirror meta description) */
  schemaDescription: string;
  featureList: string[];
  /** Breadcrumb label (often matches hero H1 intent) */
  breadcrumbName: string;
};

const BRAND = "Facts Deck";

export const TOOL_SEO: Record<string, ToolSeoConfig> = {
  "mortgage-calculator": {
    title: `${BRAND} Mortgage Calculator — PITI, PMI & Home Loan Payment Test | Refinance & Affordability`,
    description:
      `${BRAND} advanced mortgage calculator: PITI, PMI drop-off, amortization, refinance break-even, DTI affordability, bi-weekly vs monthly, inflation NPV, CSV export. Free; educational estimates.`,
    keywords: [
      "Facts Deck mortgage calculator",
      "mortgage payment calculator",
      "PITI calculator",
      "PMI calculator",
      "home loan calculator",
      "mortgage refinance calculator",
      "house affordability calculator",
      "amortization schedule calculator",
      "mortgage test",
    ],
    webAppName: `${BRAND} Advanced Mortgage Calculator`,
    alternateNames: [
      "Mortgage Payment Test",
      "Home Loan & Refinance Lab",
      "PITI Calculator Online",
    ],
    schemaDescription:
      "Estimate PITI, PMI, amortization, refinance break-even, DTI-based affordability, and export schedules. Educational estimates only.",
    featureList: [
      "Principal and interest (P&I)",
      "PITI including taxes, insurance, HOA",
      "PMI with cancellation estimate",
      "Full amortization schedule and CSV export",
      "Refinance break-even and points",
      "DTI affordability",
      "Email summary of results",
    ],
    breadcrumbName: "Mortgage Calculator",
  },
  "investment-calculator": {
    title: `${BRAND} Investment Calculator — Compound Growth, FIRE & Monte Carlo Wealth Test`,
    description:
      `${BRAND} investment calculator: compound growth with expense-ratio drag, inflation-adjusted wealth, FIRE number, sequence-of-returns lab, lump sum vs DCA, stress test, Monte Carlo bands, CSV export. Free.`,
    keywords: [
      "Facts Deck investment calculator",
      "compound interest calculator",
      "FIRE calculator",
      "Monte Carlo investment simulator",
      "portfolio projection calculator",
      "DCA vs lump sum calculator",
      "retirement savings calculator",
      "investment stress test",
    ],
    webAppName: `${BRAND} Advanced Investment Calculator`,
    alternateNames: [
      "Wealth Projection Lab",
      "FIRE & Compound Growth Test",
      "Portfolio Monte Carlo Calculator",
    ],
    schemaDescription:
      "Project wealth with contributions, expense drag, inflation, FIRE targets, sequence-of-returns scenarios, and Monte Carlo bands. Educational estimates only.",
    featureList: [
      "Compound growth with expense-ratio drag",
      "Inflation-adjusted balances",
      "FIRE number and years to goal",
      "Sequence-of-returns comparison",
      "Lump sum vs dollar-cost averaging",
      "Monte Carlo percentile bands",
      "CSV export of yearly trajectory",
    ],
    breadcrumbName: "Investment Calculator",
  },
  "budget-planner": {
    title: `${BRAND} Budget Planner & Budget Skills Test — 50/30/20, Zero-Based & Monthly Plan`,
    description:
      `${BRAND} budget planner and interactive budget test: needs/wants/savings/debt buckets, buffer, 50/30/20 vs zero-based modes, remaining cash, JSON snapshot. Free personal finance education.`,
    keywords: [
      "Facts Deck budget planner",
      "budget test online",
      "monthly budget calculator",
      "50 30 20 budget tool",
      "zero based budget app",
      "budget categories planner",
      "personal budget test",
      "cash flow budget",
    ],
    webAppName: `${BRAND} Budget Planner`,
    alternateNames: [
      "Facts Deck Budget Test",
      "Monthly Budget Skills Check",
      "50/30/20 Budget Lab",
    ],
    schemaDescription:
      "Plan a monthly budget with buckets, buffer, and simple rules like 50/30/20 or zero-based budgeting. Educational estimates only.",
    featureList: [
      "Needs/Wants/Savings/Debt buckets",
      "Buffer for irregular bills",
      "50/30/20 target comparison",
      "Zero-based mode (assign every dollar)",
      "Copy budget JSON snapshot",
    ],
    breadcrumbName: "Budget Planner",
  },
  "retirement-calculator": {
    title: `${BRAND} Retirement Calculator — FI Number, Nest Egg & Withdrawal Timeline Test`,
    description:
      `${BRAND} retirement calculator: inflation + Social Security assumptions, multi-account balances and match, FI number from spending, safe withdrawal framing, timeline chart, JSON export. Free; educational.`,
    keywords: [
      "Facts Deck retirement calculator",
      "retirement nest egg calculator",
      "financial independence number calculator",
      "401k projection calculator",
      "4 percent rule calculator",
      "retirement savings test",
      "withdrawal rate calculator",
    ],
    webAppName: `${BRAND} Advanced Retirement Calculator`,
    alternateNames: [
      "Retirement Readiness Test",
      "FI Timeline & Nest Egg Lab",
      "401k & IRA Projection Calculator",
    ],
    schemaDescription:
      "Estimate a retirement FI number using inflation and withdrawal rate assumptions, project multi-account balances, and explore how contributions and match affect your timeline. Educational estimates only.",
    featureList: [
      "FI number from spending + withdrawal rate",
      "Inflation-adjusted spending projection",
      "Social Security offset",
      "Multiple accounts (balance + contributions + match)",
      "Timeline chart and JSON export",
    ],
    breadcrumbName: "Retirement Calculator",
  },
  "loan-calculator": {
    title: `${BRAND} Loan Calculator — Amortization, Extra Pay & Side-by-Side Loan Comparison Test`,
    description:
      `${BRAND} loan calculator: fixed-rate payment, full amortization, extra principal, origination fees, compare two loans, total interest, JSON export. Auto & personal loans. Free.`,
    keywords: [
      "Facts Deck loan calculator",
      "amortization calculator",
      "auto loan calculator",
      "personal loan payment calculator",
      "extra payment calculator",
      "loan comparison calculator",
      "payoff calculator",
    ],
    webAppName: `${BRAND} Advanced Loan Calculator`,
    alternateNames: [
      "Loan Payoff & Compare Test",
      "Amortization Schedule Lab",
      "Debt Payment Calculator Online",
    ],
    schemaDescription:
      "Calculate fixed-rate loan payments, amortization schedules, extra principal payments, origination fees, and compare two loan scenarios. Educational estimates only.",
    featureList: [
      "Monthly P&I payment",
      "Amortization schedule preview",
      "Extra principal per month",
      "Origination fee modeling",
      "Side-by-side scenario comparison",
      "Copy JSON export",
    ],
    breadcrumbName: "Loan Calculator",
  },
  "credit-score-simulator": {
    title: `${BRAND} Credit Score Simulator — FICO-Style Factors & What-If Score Test`,
    description:
      `${BRAND} credit score simulator (educational): slide utilization, payment history, age, inquiries, mix—see an illustrative 300–850 band and scenarios. Not a real bureau score.`,
    keywords: [
      "Facts Deck credit score simulator",
      "credit score test online",
      "credit utilization calculator",
      "improve credit score tool",
      "FICO factors simulator",
      "credit what if calculator",
      "hard inquiry impact",
    ],
    webAppName: `${BRAND} Credit Score Simulator`,
    alternateNames: [
      "Credit Factors Lab",
      "Score Impact What-If Test",
      "Educational FICO-Style Simulator",
    ],
    schemaDescription:
      "Educational interactive model illustrating how common credit factors might influence an illustrative score band. Not a real credit score from any bureau.",
    featureList: [
      "Factor-style sliders (utilization, payments, age, inquiries, mix)",
      "Illustrative 300–850 score gauge",
      "What-if utilization scenarios",
      "Copy JSON export",
    ],
    breadcrumbName: "Credit Score Simulator",
  },
  "emergency-fund-calculator": {
    title: `${BRAND} Emergency Fund Calculator — Runway Months, Target Balance & Time-to-Goal Test`,
    description:
      `${BRAND} emergency fund calculator: monthly essentials, savings, contribution, target months—runway, gap, percent funded, months to goal. JSON export. Educational planning only.`,
    keywords: [
      "Facts Deck emergency fund calculator",
      "emergency savings calculator",
      "months of expenses calculator",
      "financial runway calculator",
      "savings goal calculator",
      "rainy day fund test",
    ],
    webAppName: `${BRAND} Emergency Fund & Runway Calculator`,
    alternateNames: [
      "Runway & Cushion Test",
      "Months-of-Expenses Lab",
      "Emergency Savings Goal Calculator",
    ],
    schemaDescription:
      "Estimate emergency fund runway (months covered), target balance from monthly essentials and goal months, gap, and months to goal at a steady contribution. Educational estimates only.",
    featureList: [
      "Runway months from balance and essentials",
      "Target balance from essentials × months",
      "Gap and percent funded",
      "Months to goal at monthly contribution",
      "Copy JSON export",
    ],
    breadcrumbName: "Emergency Fund & Runway",
  },
  "debt-payoff-planner": {
    title: `${BRAND} Debt Payoff Planner — Snowball vs Avalanche Strategy Test & Payoff Order`,
    description:
      `${BRAND} debt payoff planner: list balances, APRs, minimums—compare snowball vs avalanche, months to debt-free, total interest, extra payment modeling, JSON. Educational.`,
    keywords: [
      "Facts Deck debt payoff planner",
      "debt snowball calculator",
      "debt avalanche calculator",
      "credit card payoff calculator",
      "pay off debt faster",
      "debt free plan tool",
      "debt strategy test",
    ],
    webAppName: `${BRAND} Debt Payoff Planner`,
    alternateNames: [
      "Snowball vs Avalanche Test",
      "Multi-Debt Payoff Lab",
      "Debt-Free Timeline Calculator",
    ],
    schemaDescription:
      "Compare snowball and avalanche debt payoff strategies with multiple balances, APRs, and minimum payments—see estimated months and total interest. Educational estimates only.",
    featureList: [
      "Snowball vs avalanche side by side",
      "Multiple debts with minimums",
      "Extra monthly payment beyond minimums",
      "Months and total interest comparison",
      "Copy JSON export",
    ],
    breadcrumbName: "Debt Payoff Planner",
  },
  "net-worth-fi-snapshot": {
    title: `${BRAND} Net Worth & FI Snapshot — Balance Sheet, FI Number & Freedom Band Test`,
    description:
      `${BRAND} net worth and FI snapshot: assets vs liabilities, withdrawal-rate FI number, orbit progress, lean/fat spend moons, years-to-FI illustration, freedom band, JSON. Educational.`,
    keywords: [
      "Facts Deck net worth calculator",
      "financial independence calculator",
      "FI number calculator",
      "net worth snapshot",
      "FIRE snapshot tool",
      "balance sheet calculator",
      "4 percent rule test",
    ],
    webAppName: `${BRAND} Net Worth & Financial Independence Snapshot`,
    alternateNames: [
      "FI Progress Test",
      "Wealth Orbit Lab",
      "Freedom Band Snapshot",
    ],
    schemaDescription:
      "Estimate net worth, a withdrawal-rate financial independence number, illustrative progress, spend scenarios, and years-to-FI. Educational estimates only.",
    featureList: [
      "Net worth from assets and liabilities",
      "FI number from spending and withdrawal rate",
      "Illustrative FI progress and freedom band",
      "Lean, standard, and fat spend scenarios",
      "Years-to-FI projection and JSON export",
    ],
    breadcrumbName: "Net Worth & FI Snapshot",
  },
  "student-loan-snapshot": {
    title: `${BRAND} Student Loan Snapshot — Standard vs IDR Payment Path Test (Illustrative)`,
    description:
      `${BRAND} student loan snapshot: level standard vs simplified income-driven payment from discretionary income, total interest, long-run balance path. Not your servicer’s official calculation.`,
    keywords: [
      "Facts Deck student loan calculator",
      "student loan payment calculator",
      "IDR calculator",
      "income driven repayment estimate",
      "SAVE repayment calculator",
      "federal student loan test",
      "discretionary income calculator",
    ],
    webAppName: `${BRAND} Student Loan Path Snapshot`,
    alternateNames: [
      "Standard vs IDR Test",
      "Student Debt Path Lab",
      "Loan Repayment Scenario Calculator",
    ],
    schemaDescription:
      "Compare level standard student loan payments to a simplified income-driven style payment using estimated discretionary income. Illustrative balances and interest—not federal servicer results.",
    featureList: [
      "Standard level payment and total interest",
      "Illustrative IDR payment from discretionary income",
      "Long-run balance path simulation",
      "Payment vs interest stress check",
      "Copy JSON export",
    ],
    breadcrumbName: "Student Loan Path Snapshot",
  },
  "crypto-yield-lab": {
    title: `${BRAND} Crypto Yield Lab — Staking APY, Compounding & APR-to-APY Test`,
    description:
      `${BRAND} crypto staking & yield lab: compound headline APY (daily/monthly/annual), compare frequencies, APR→APY. Educational literacy only—not investment advice; excludes fees and protocol risk.`,
    keywords: [
      "Facts Deck crypto calculator",
      "crypto APY calculator",
      "staking yield calculator",
      "APR vs APY crypto",
      "compound interest DeFi calculator",
      "staking rewards test",
    ],
    webAppName: `${BRAND} Crypto Staking & Yield Lab`,
    alternateNames: [
      "Staking Compounding Test",
      "DeFi Yield Literacy Lab",
      "APR to APY Converter Crypto",
    ],
    schemaDescription:
      "Educational calculator for nominal APY compounded at different frequencies, frequency comparison at the same headline rate, and APR to APY conversion. Not investment advice.",
    featureList: [
      "Future value from nominal APY and compounding",
      "Compare daily, monthly, and annual compounding",
      "APR to APY reference conversion",
      "Effective APY over a horizon",
      "Copy JSON export",
    ],
    breadcrumbName: "Crypto Staking & Yield Lab",
  },
  "subscription-spend-audit": {
    title: `${BRAND} Subscription Audit — Recurring Spend, Annual Total & Trim Scenario Test`,
    description:
      `${BRAND} subscription & recurring spend audit: line items, monthly/annual totals, category mix, optional trim %, JSON export. Manual entries—awareness, not bank linking.`,
    keywords: [
      "Facts Deck subscription calculator",
      "subscription spend tracker",
      "recurring expenses calculator",
      "monthly subscriptions total",
      "cut subscriptions tool",
      "autopay audit",
      "annual subscription cost test",
    ],
    webAppName: `${BRAND} Subscription & Recurring Spend Audit`,
    alternateNames: [
      "Recurring Spend Test",
      "Autopay & Subscriptions Lab",
      "Subscription Cost Annualizer",
    ],
    schemaDescription:
      "List recurring charges by line, see monthly and annual totals, category mix, a trim scenario, and copy JSON. Manual entries for awareness—not bank linking.",
    featureList: [
      "Line-item recurring charges with categories",
      "Monthly and annual totals",
      "Category bar chart",
      "Optional trim percentage scenario",
      "Copy JSON export",
    ],
    breadcrumbName: "Subscription & Recurring Spend Audit",
  },
};

const TOOLS_INDEX = absoluteUrl("/tools");

const JSON_LD_TYPE_BY_SLUG: Record<string, string> = {
  "mortgage-calculator": "calculator",
  "investment-calculator": "calculator",
  "budget-planner": "planner",
  "retirement-calculator": "calculator",
  "loan-calculator": "calculator",
  "credit-score-simulator": "simulator",
  "emergency-fund-calculator": "calculator",
  "debt-payoff-planner": "planner",
  "net-worth-fi-snapshot": "snapshot",
  "student-loan-snapshot": "snapshot",
  "crypto-yield-lab": "lab",
  "subscription-spend-audit": "audit",
};

export function buildToolMetadata(slug: string): Metadata | null {
  const config = TOOL_SEO[slug];
  if (!config) return null;

  const canonical = absoluteUrl(`/tools/${slug}`);
  const { title, description, keywords } = config;

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: BRAND,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export function buildToolJsonLd(slug: string): object | null {
  const config = TOOL_SEO[slug];
  if (!config) return null;

  const canonical = absoluteUrl(`/tools/${slug}`);
  const fragment = JSON_LD_TYPE_BY_SLUG[slug] ?? "app";

  const webApp: Record<string, unknown> = {
    "@type": "WebApplication",
    "@id": `${canonical}#${fragment}`,
    name: config.webAppName,
    alternateName: config.alternateNames,
    description: config.schemaDescription,
    url: canonical,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: BRAND,
      url: SITE_URL,
    },
    featureList: config.featureList,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      webApp,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tools", item: TOOLS_INDEX },
          {
            "@type": "ListItem",
            position: 3,
            name: config.breadcrumbName,
            item: canonical,
          },
        ],
      },
    ],
  };
}
