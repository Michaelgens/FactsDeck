import Link from "next/link";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import {
  ArrowRight,
  Calculator,
  BarChart3,
  PieChart,
  Target,
  DollarSign,
  Activity,
  Sparkles,
  Wrench,
} from "lucide-react";
import { siteTools } from "../lib/site-config";
import { SITE_URL, absoluteUrl } from "../lib/seo";

const toolsPageDescription =
  "Free financial calculators and simulators: mortgage, investing, budgeting, retirement, loans, and credit. Interactive tools for planning—education only, not professional advice.";

const iconByKey: Record<string, ComponentType<{ className?: string }>> = {
  Calculator,
  BarChart3,
  PieChart,
  Target,
  DollarSign,
  Activity,
};

export const metadata: Metadata = {
  title: "Financial Tools & Calculators | Facts Deck",
  description: toolsPageDescription,
  keywords: [
    "financial calculators",
    "mortgage calculator",
    "investment calculator",
    "budget planner",
    "retirement calculator",
    "loan calculator",
    "credit score simulator",
    "personal finance tools",
    "free finance tools",
  ],
  alternates: { canonical: absoluteUrl("/tools") },
  openGraph: {
    title: "Financial Tools & Calculators | Facts Deck",
    description: toolsPageDescription,
    url: absoluteUrl("/tools"),
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Tools & Calculators | Facts Deck",
    description: toolsPageDescription,
  },
  robots: { index: true, follow: true },
};

export default function ToolsIndexPage() {
  const canonical = absoluteUrl("/tools");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        name: "Financial Tools & Calculators",
        description: toolsPageDescription,
        url: canonical,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en-US",
        about: {
          "@type": "Thing",
          name: "Personal finance calculators",
        },
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#itemlist`,
        name: "Facts Deck financial tools",
        numberOfItems: siteTools.length,
        itemListElement: siteTools.map((tool, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "WebApplication",
            name: tool.name,
            description: tool.description,
            url: absoluteUrl(`/tools/${tool.slug}`),
            applicationCategory: "FinanceApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Tools", item: canonical },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white dark:bg-dark-950">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-amber-900 dark:from-dark-950 dark:via-purple-950 dark:to-dark-900 text-white">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
            <div className="flex flex-wrap items-center gap-2 text-sm text-purple-200 mb-6">
              <Wrench className="h-4 w-4 text-amber-300" aria-hidden />
              <span>Interactive · Free · No sign-up</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold max-w-3xl text-balance mb-6">
              Tools that turn numbers into{" "}
              <span className="bg-gradient-to-r from-amber-200 to-purple-200 bg-clip-text text-transparent">
                clearer decisions
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-purple-100/95 max-w-2xl leading-relaxed mb-10">
              {toolsPageDescription}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/post?category=Personal%20Finance"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-6 py-3.5 font-semibold backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors"
              >
                <Sparkles className="h-5 w-5 text-amber-300" />
                Read related guides
              </Link>
              <Link
                href="/post"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-purple-900 px-6 py-3.5 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Browse articles
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-purple-100">
                All calculators & simulators
              </h2>
              <p className="mt-2 text-slate-600 dark:text-purple-300/90 max-w-xl">
                Pick a tool to open the full workspace. We add new utilities here as we ship them—bookmark this page.
              </p>
            </div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 shrink-0">
              {siteTools.length} tools available
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 list-none p-0 m-0">
            {siteTools.map((tool) => {
              const Icon = iconByKey[tool.iconKey] ?? Calculator;
              return (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200 dark:border-purple-500/35 bg-gradient-to-br from-white to-slate-50/80 dark:from-dark-900/80 dark:to-dark-850/50 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-purple-300/60 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-amber-600 shadow-md group-hover:scale-105 transition-transform">
                        <Icon className="h-6 w-6 text-white" aria-hidden />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-purple-400/80">
                        {tool.users} users
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400/90 mb-3">{tool.tagline}</p>
                    <p className="text-slate-600 dark:text-purple-200/80 text-sm leading-relaxed flex-1 mb-6">
                      {tool.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                      Open tool <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="border-t border-slate-200 dark:border-purple-500/25 bg-slate-50 dark:bg-dark-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <p className="text-sm text-slate-600 dark:text-purple-300/90 max-w-2xl mx-auto leading-relaxed">
              These tools are for education and planning—they don&apos;t constitute tax, legal, or investment advice.
              Results depend on your inputs; always verify with a qualified professional when it matters.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
