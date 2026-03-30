import Link from "next/link";
import type { Metadata } from "next";
import {
  Wrench,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Calculator,
} from "lucide-react";
import { siteTools } from "../../lib/site-config";
import AdvancedMortgageCalculator from "../../components/tools/AdvancedMortgageCalculator";
import AdvancedInvestmentCalculator from "../../components/tools/AdvancedInvestmentCalculator";
import AdvancedBudgetPlanner from "../../components/tools/AdvancedBudgetPlanner";
import AdvancedRetirementCalculator from "../../components/tools/AdvancedRetirementCalculator";
import AdvancedLoanCalculator from "../../components/tools/AdvancedLoanCalculator";
import AdvancedCreditScoreSimulator from "../../components/tools/AdvancedCreditScoreSimulator";
import { SITE_URL, absoluteUrl } from "../../lib/seo";

const SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  siteTools.map((t) => [t.slug, t.name])
);

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  return siteTools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "mortgage-calculator") {
    const canonical = absoluteUrl("/tools/mortgage-calculator");
    const title = "Advanced Mortgage Calculator — PITI, PMI & amortization";
    const description =
      "Free advanced mortgage calculator: PITI, PMI drop-off, amortization schedule, refinance break-even, DTI affordability, bi-weekly vs monthly, inflation-adjusted NPV, CSV export, and email your summary.";
    return {
      title,
      description,
      keywords: [
        "mortgage calculator",
        "PITI calculator",
        "PMI calculator",
        "amortization schedule",
        "home loan calculator",
        "mortgage payment calculator",
        "refinance calculator",
        "DTI calculator",
        "house affordability calculator",
      ],
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "Facts Deck",
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
  if (slug === "investment-calculator") {
    const canonical = absoluteUrl("/tools/investment-calculator");
    const title = "Advanced Investment Calculator — compound, FIRE & Monte Carlo";
    const description =
      "Free advanced investment calculator: compound growth with expense-ratio drag, inflation-adjusted wealth, FIRE number and years-to-target, sequence-of-returns lab, lump sum vs DCA, stress test, and Monte Carlo bands.";
    return {
      title,
      description,
      keywords: [
        "investment calculator",
        "compound interest calculator",
        "FIRE calculator",
        "retirement savings calculator",
        "Monte Carlo investment",
        "DCA vs lump sum",
        "sequence of returns",
        "expense ratio calculator",
        "portfolio projection",
      ],
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "Facts Deck",
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
  if (slug === "budget-planner") {
    const canonical = absoluteUrl("/tools/budget-planner");
    const title = "Advanced Budget Planner — zero-based & 50/30/20";
    const description =
      "Free advanced budget planner: build buckets (needs/wants/savings/debt), add a buffer, track remaining cash, and copy a budget JSON snapshot. Educational planning tool.";
    return {
      title,
      description,
      keywords: [
        "budget planner",
        "monthly budget",
        "zero based budget",
        "50 30 20 rule",
        "sinking funds",
        "budget categories",
        "personal finance budget",
      ],
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "Facts Deck",
        type: "website",
        locale: "en_US",
      },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
    };
  }
  if (slug === "retirement-calculator") {
    const canonical = absoluteUrl("/tools/retirement-calculator");
    const title = "Advanced Retirement Calculator — FI number & timeline";
    const description =
      "Free advanced retirement calculator: estimate your FI number using inflation + Social Security assumptions, combine multiple accounts (balance + contributions + match), project balances, and copy results as JSON.";
    return {
      title,
      description,
      keywords: [
        "retirement calculator",
        "FIRE calculator",
        "financial independence number",
        "safe withdrawal rate",
        "4% rule",
        "401k calculator",
        "retirement planning",
        "inflation adjusted retirement",
      ],
      alternates: { canonical },
      openGraph: { title, description, url: canonical, siteName: "Facts Deck", type: "website", locale: "en_US" },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
    };
  }
  if (slug === "loan-calculator") {
    const canonical = absoluteUrl("/tools/loan-calculator");
    const title = "Advanced Loan Calculator — amortization, extra pay & compare";
    const description =
      "Free advanced loan calculator: fixed-rate monthly payment, full amortization schedule, extra principal payments, origination fees, and side-by-side loan comparison. Copy results as JSON.";
    return {
      title,
      description,
      keywords: [
        "loan calculator",
        "amortization calculator",
        "personal loan calculator",
        "auto loan calculator",
        "extra payment calculator",
        "refinance comparison",
        "total interest calculator",
      ],
      alternates: { canonical },
      openGraph: { title, description, url: canonical, siteName: "Facts Deck", type: "website", locale: "en_US" },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
    };
  }
  if (slug === "credit-score-simulator") {
    const canonical = absoluteUrl("/tools/credit-score-simulator");
    const title = "Advanced Credit Score Simulator — factors & what-if";
    const description =
      "Educational credit score simulator: adjust utilization, payment history, age of accounts, inquiries, and mix—see an illustrative score band and what-if scenarios. Not a real bureau score.";
    return {
      title,
      description,
      keywords: [
        "credit score simulator",
        "credit utilization",
        "FICO factors",
        "improve credit score",
        "hard inquiries",
        "credit mix",
        "payment history",
      ],
      alternates: { canonical },
      openGraph: { title, description, url: canonical, siteName: "Facts Deck", type: "website", locale: "en_US" },
      twitter: { card: "summary_large_image", title, description },
      robots: { index: true, follow: true },
    };
  }
  const toolName = SLUG_TO_NAME[slug] ?? slugToTitle(slug);
  return {
    title: `${toolName} | Facts Deck Tools`,
    description: `Financial tool: ${toolName}. Facts Deck — personal finance education.`,
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "mortgage-calculator") {
    const canonical = absoluteUrl("/tools/mortgage-calculator");
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": `${canonical}#calculator`,
          name: "Advanced Mortgage Calculator",
          description:
            "Estimate PITI, PMI, amortization, refinance break-even, DTI-based affordability, and export schedules. Educational estimates only.",
          url: canonical,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          provider: {
            "@type": "Organization",
            name: "Facts Deck",
            url: SITE_URL,
          },
          featureList: [
            "Principal and interest (P&I)",
            "PITI including taxes, insurance, HOA",
            "PMI with cancellation estimate",
            "Full amortization schedule and CSV export",
            "Refinance break-even and points",
            "DTI affordability",
            "Email summary of results",
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Advanced Mortgage Calculator",
              item: canonical,
            },
          ],
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AdvancedMortgageCalculator />
      </>
    );
  }

  if (slug === "investment-calculator") {
    const canonical = absoluteUrl("/tools/investment-calculator");
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": `${canonical}#calculator`,
          name: "Advanced Investment Calculator",
          description:
            "Project wealth with contributions, expense drag, inflation, FIRE targets, sequence-of-returns scenarios, and Monte Carlo bands. Educational estimates only.",
          url: canonical,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          provider: {
            "@type": "Organization",
            name: "Facts Deck",
            url: SITE_URL,
          },
          featureList: [
            "Compound growth with expense-ratio drag",
            "Inflation-adjusted balances",
            "FIRE number and years to goal",
            "Sequence-of-returns comparison",
            "Lump sum vs dollar-cost averaging",
            "Monte Carlo percentile bands",
            "CSV export of yearly trajectory",
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Advanced Investment Calculator",
              item: canonical,
            },
          ],
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AdvancedInvestmentCalculator />
      </>
    );
  }
  if (slug === "budget-planner") {
    const canonical = absoluteUrl("/tools/budget-planner");
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": `${canonical}#planner`,
          name: "Advanced Budget Planner",
          description:
            "Plan a monthly budget with buckets, buffer, and simple rules like 50/30/20 or zero-based budgeting. Educational estimates only.",
          url: canonical,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          provider: { "@type": "Organization", name: "Facts Deck", url: SITE_URL },
          featureList: [
            "Needs/Wants/Savings/Debt buckets",
            "Buffer for irregular bills",
            "50/30/20 target comparison",
            "Zero-based mode (assign every dollar)",
            "Copy budget JSON snapshot",
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Advanced Budget Planner", item: canonical },
          ],
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AdvancedBudgetPlanner />
      </>
    );
  }
  if (slug === "retirement-calculator") {
    const canonical = absoluteUrl("/tools/retirement-calculator");
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": `${canonical}#calculator`,
          name: "Advanced Retirement Calculator",
          description:
            "Estimate a retirement FI number using inflation and withdrawal rate assumptions, project multi-account balances, and explore how contributions and match affect your timeline. Educational estimates only.",
          url: canonical,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          provider: { "@type": "Organization", name: "Facts Deck", url: SITE_URL },
          featureList: [
            "FI number from spending + withdrawal rate",
            "Inflation-adjusted spending projection",
            "Social Security offset",
            "Multiple accounts (balance + contributions + match)",
            "Timeline chart and JSON export",
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Advanced Retirement Calculator", item: canonical },
          ],
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AdvancedRetirementCalculator />
      </>
    );
  }
  if (slug === "loan-calculator") {
    const canonical = absoluteUrl("/tools/loan-calculator");
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": `${canonical}#calculator`,
          name: "Advanced Loan Calculator",
          description:
            "Calculate fixed-rate loan payments, amortization schedules, extra principal payments, origination fees, and compare two loan scenarios. Educational estimates only.",
          url: canonical,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          provider: { "@type": "Organization", name: "Facts Deck", url: SITE_URL },
          featureList: [
            "Monthly P&I payment",
            "Amortization schedule preview",
            "Extra principal per month",
            "Origination fee modeling",
            "Side-by-side scenario comparison",
            "Copy JSON export",
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Advanced Loan Calculator", item: canonical },
          ],
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AdvancedLoanCalculator />
      </>
    );
  }
  if (slug === "credit-score-simulator") {
    const canonical = absoluteUrl("/tools/credit-score-simulator");
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": `${canonical}#simulator`,
          name: "Advanced Credit Score Simulator",
          description:
            "Educational interactive model illustrating how common credit factors might influence an illustrative score band. Not a real credit score from any bureau.",
          url: canonical,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          provider: { "@type": "Organization", name: "Facts Deck", url: SITE_URL },
          featureList: [
            "Factor-style sliders (utilization, payments, age, inquiries, mix)",
            "Illustrative 300–850 score gauge",
            "What-if utilization scenarios",
            "Copy JSON export",
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Advanced Credit Score Simulator", item: canonical },
          ],
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AdvancedCreditScoreSimulator />
      </>
    );
  }

  const toolName = SLUG_TO_NAME[slug] ?? slugToTitle(slug);

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-accent-600/10 dark:from-purple-900/30 dark:to-accent-900/30" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-400/20 dark:bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-emerald-400 font-semibold transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-500 to-accent-600 flex items-center justify-center shadow-2xl shadow-purple-500/25 dark:shadow-purple-900/50 animate-pulse">
            <Calculator className="h-12 w-12 md:h-16 md:w-16 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-amber-400 dark:bg-amber-500 flex items-center justify-center shadow-lg">
            <Wrench className="h-6 w-6 text-amber-900" />
          </div>
        </div>

        <h1 className="font-display text-2xl md:text-4xl font-bold text-gray-900 dark:text-purple-100 mb-4">
          <span className="text-purple-600 dark:text-purple-400">{toolName}</span>
          <br />
          is on its way
        </h1>

        <p className="text-lg text-gray-600 dark:text-purple-200 leading-relaxed mb-8 max-w-lg mx-auto">
          We&apos;re polishing our calculators and tools to give you the best experience.
          This one isn&apos;t ready yet — but our team is hard at work bringing it to life.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/post"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-accent-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-accent-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <BookOpen className="h-5 w-5" />
            Explore Articles
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 px-6 py-4 rounded-2xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="bg-white/80 dark:bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-purple-500/30 text-left">
          <p className="text-sm font-semibold text-gray-700 dark:text-purple-200 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Coming soon
          </p>
          <p className="text-gray-600 dark:text-purple-300 text-sm leading-relaxed">
            In the meantime, browse our guides and expert insights to plan your finances.
            We&apos;ll have powerful tools ready for you soon — stay tuned.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-purple-500/20">
          <p className="text-xs text-gray-500 dark:text-purple-400 mb-4">
            Other tools we&apos;re building
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {siteTools
              .filter((t) => t.name !== toolName)
              .slice(0, 4)
              .map((tool) => (
                <span
                  key={tool.slug}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-purple-300 text-xs font-medium"
                >
                  {tool.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
