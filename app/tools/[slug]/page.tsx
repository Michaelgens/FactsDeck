import Link from "next/link";
import type { Metadata } from "next";
import {
  Wrench,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { siteTools, siteToolsByDisplayOrder } from "../../lib/site-config";
import MortgageCalculatorEntry from "../../components/tools/MortgageCalculatorEntry";
import InvestmentCalculatorEntry from "../../components/tools/InvestmentCalculatorEntry";
import BudgetCalculatorEntry from "../../components/tools/BudgetCalculatorEntry";
import RetirementCalculatorEntry from "../../components/tools/RetirementCalculatorEntry";
import LoanCalculatorEntry from "../../components/tools/LoanCalculatorEntry";
import CreditCalculatorEntry from "../../components/tools/CreditCalculatorEntry";
import EmergencyFundCalculatorEntry from "../../components/tools/EmergencyFundCalculatorEntry";
import DebtPayoffPlannerEntry from "../../components/tools/DebtPayoffPlannerEntry";
import FiSnapshotEntry from "../../components/tools/FiSnapshotEntry";
import StudentLoanSnapshotEntry from "../../components/tools/StudentLoanSnapshotEntry";
import CryptoYieldLabEntry from "../../components/tools/CryptoYieldLabEntry";
import SubscriptionAuditEntry from "../../components/tools/SubscriptionAuditEntry";
import { buildToolJsonLd, buildToolMetadata } from "../../lib/tool-seo";

const SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  siteTools.map((t) => [t.slug, t.name])
);
const LAST_UPDATED = "March 9, 2026";

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
  const meta = buildToolMetadata(slug);
  if (meta) return meta;
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
  const jsonLd = buildToolJsonLd(slug);
  const ldScript = jsonLd ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  ) : null;

  if (slug === "mortgage-calculator") {
    return (
      <>
        {ldScript}
        <MortgageCalculatorEntry />
      </>
    );
  }
  if (slug === "investment-calculator") {
    return (
      <>
        {ldScript}
        <InvestmentCalculatorEntry />
      </>
    );
  }
  if (slug === "budget-planner") {
    return (
      <>
        {ldScript}
        <BudgetCalculatorEntry />
      </>
    );
  }
  if (slug === "retirement-calculator") {
    return (
      <>
        {ldScript}
        <RetirementCalculatorEntry />
      </>
    );
  }
  if (slug === "loan-calculator") {
    return (
      <>
        {ldScript}
        <LoanCalculatorEntry />
      </>
    );
  }
  if (slug === "credit-score-simulator") {
    return (
      <>
        {ldScript}
        <CreditCalculatorEntry />
      </>
    );
  }
  if (slug === "emergency-fund-calculator") {
    return (
      <>
        {ldScript}
        <EmergencyFundCalculatorEntry />
      </>
    );
  }
  if (slug === "debt-payoff-planner") {
    return (
      <>
        {ldScript}
        <DebtPayoffPlannerEntry />
      </>
    );
  }
  if (slug === "net-worth-fi-snapshot") {
    return (
      <>
        {ldScript}
        <FiSnapshotEntry />
      </>
    );
  }
  if (slug === "student-loan-snapshot") {
    return (
      <>
        {ldScript}
        <StudentLoanSnapshotEntry />
      </>
    );
  }
  if (slug === "crypto-yield-lab") {
    return (
      <>
        {ldScript}
        <CryptoYieldLabEntry />
      </>
    );
  }
  if (slug === "subscription-spend-audit") {
    return (
      <>
        {ldScript}
        <SubscriptionAuditEntry />
      </>
    );
  }

  const toolName = SLUG_TO_NAME[slug] ?? slugToTitle(slug);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <section className="relative border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-900/10 to-transparent dark:via-white/10" />
          <div className="absolute -top-24 left-1/2 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-zinc-900/5 blur-3xl dark:bg-white/5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to tools
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                <Wrench className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" aria-hidden />
                Tool workspace
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950">
                <Sparkles className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" aria-hidden />
                Updated {LAST_UPDATED}
              </span>
            </div>
          </div>

          <div className="mt-10 max-w-3xl">
            <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-300">TOOLS</p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] text-zinc-900 dark:text-zinc-100 text-balance">
              {toolName}
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
              This tool isn’t published yet. In the meantime, you can explore our guides or open another tool.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/post"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <BookOpen className="h-4 w-4" aria-hidden />
                Browse articles
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/40"
              >
                See all tools
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden />
            Coming soon
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            We ship tools with clear assumptions and careful UX. When this page goes live, it will include a
            walk-through and export-friendly outputs.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Other tools available now
          </p>
          <div className="flex flex-wrap gap-2">
            {siteToolsByDisplayOrder
              .filter((t) => t.name !== toolName)
              .slice(0, 6)
              .map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 transition-colors text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/40"
                >
                  <Calculator className="h-3.5 w-3.5" aria-hidden />
                  {tool.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
