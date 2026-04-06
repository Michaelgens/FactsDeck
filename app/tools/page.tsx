import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  BarChart3,
  PieChart,
  Target,
  DollarSign,
  Activity,
  Umbrella,
  Layers,
  Gem,
  GraduationCap,
  Coins,
  Repeat,
  Check,
  Shield,
  Sparkles,
} from "lucide-react";
import type { SiteTool } from "../lib/site-config";
import { siteTools, siteToolsByDisplayOrder } from "../lib/site-config";
import { SITE_URL, absoluteUrl } from "../lib/seo";
import { proxiedImageSrc } from "../lib/image-proxy";

const toolsPageDescription =
  "Free financial calculators and simulators: mortgage, investing, budgeting, retirement, loans, and credit. Interactive tools for planning—education only, not professional advice.";

const iconByKey: Record<string, ComponentType<{ className?: string }>> = {
  Calculator,
  BarChart3,
  PieChart,
  Target,
  DollarSign,
  Activity,
  Umbrella,
  Layers,
  Gem,
  GraduationCap,
  Coins,
  Repeat,
};

/** Curated groups for navigation + scanability (every slug appears once). */
const TOOL_GROUPS: { id: string; label: string; blurb: string; slugs: string[] }[] = [
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
    slugs: ["mortgage-calculator", "loan-calculator", "debt-payoff-planner", "student-loan-snapshot", "credit-score-simulator"],
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

function toolBySlug(slug: string): SiteTool | undefined {
  return siteTools.find((t) => t.slug === slug);
}

/** Used when the featured tool has no `spotlightImage` */
const SPOTLIGHT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80";

export const metadata: Metadata = {
  title: { absolute: "Financial Tools & Calculators | Facts Deck" },
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
        name: "Financial Tools & Calculators | Facts Deck",
        description: toolsPageDescription,
        url: canonical,
        isPartOf: { "@id": `${SITE_URL}#website` },
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
        itemListElement: siteToolsByDisplayOrder.map((tool, i) => ({
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

  const spotlight = siteToolsByDisplayOrder[0];
  const spotlightImageSrc = spotlight
    ? proxiedImageSrc(spotlight.spotlightImage ?? SPOTLIGHT_FALLBACK_IMAGE)
    : "";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Ambient layers */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-200/40 via-indigo-100/20 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/30 dark:to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-[28rem] right-[-10%] h-96 w-96 rounded-full bg-orange-100/30 blur-3xl dark:bg-cyan-950/25"
          aria-hidden
        />

        {/* Hero */}
        <header className="relative border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8">
            <nav className="flex flex-wrap items-center justify-between gap-4" aria-label="Breadcrumb">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm backdrop-blur-sm transition-all hover:border-zinc-300 hover:bg-white hover:shadow-md dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:-translate-x-0.5 dark:text-zinc-400" />
                Home
              </Link>
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-500">/</span>
                <span className="text-zinc-700 dark:text-zinc-300">Tools</span>
              </div>
            </nav>

            <div className="mt-12 max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50/90 px-3 py-1 text-xs font-semibold text-sky-900 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Product suite
              </div>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Precision tools for{" "}
                <span className="bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">
                  every money decision
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                {toolsPageDescription}
              </p>
            </div>

            {/* Stat strip */}
            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-200/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-4">
              {[
                { k: "Utilities", v: String(siteTools.length), d: "In this release" },
                { k: "Cost", v: "$0", d: "No paywall" },
                { k: "Account", v: "None", d: "Use instantly" },
                { k: "Stance", v: "Edu", d: "Not advice" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="bg-white px-5 py-4 dark:bg-zinc-950 sm:px-6 sm:py-5"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                    {row.k}
                  </dt>
                  <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                    {row.v}
                  </dd>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">{row.d}</p>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#directory"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-100"
              >
                Explore directory
              </a>
              <Link
                href="/post"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80"
              >
                Editorial guides
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/disclaimer"
                className="inline-flex h-12 items-center justify-center px-2 text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </header>

        {/* Spotlight — image first in DOM so it appears on top on mobile; lg:order swaps columns */}
        {spotlight && spotlightImageSrc && (
          <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12" aria-labelledby="spotlight-heading">
            <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-white to-zinc-50 shadow-xl shadow-zinc-900/[0.04] ring-1 ring-zinc-900/[0.03] dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 dark:shadow-black/20 dark:ring-white/[0.04]">
              <div className="grid gap-0 lg:grid-cols-12 lg:items-stretch">
                <div className="relative aspect-[16/10] w-full min-h-[200px] bg-zinc-100 dark:bg-zinc-900 lg:order-2 lg:col-span-5 lg:aspect-auto lg:min-h-[min(22rem,50vh)]">
                  <Image
                    src={"/budget.png"}
                    alt={`${spotlight.name} — featured workspace`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-black/10"
                    aria-hidden
                  />
                </div>
                <div className="relative flex flex-col justify-center border-t border-zinc-100 p-8 sm:p-10 lg:order-1 lg:col-span-7 lg:border-t-0 lg:border-r dark:border-zinc-800/80">
                  <div className="absolute right-6 top-6 hidden font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 lg:block dark:text-zinc-600">
                    Featured
                  </div>
                  <p id="spotlight-heading" className="text-xs font-semibold uppercase tracking-widest text-sky-700 dark:text-emerald-400">
                    Start here
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                    {spotlight.name}
                  </h2>
                  <p className="mt-2 text-base font-medium text-zinc-800 dark:text-zinc-200">{spotlight.tagline}</p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {spotlight.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {spotlight.users} sessions
                    </span>
                    <Link
                      href={`/tools/${spotlight.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                    >
                      Launch workspace
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Directory */}
        <section id="directory" className="relative scroll-mt-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:flex lg:gap-12 lg:px-8 lg:py-16">
            {/* Sticky section nav (desktop) */}
            <aside className="mb-10 hidden shrink-0 lg:block lg:w-52 xl:w-56">
              <div className="sticky top-28 space-y-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">On this page</p>
                <nav className="space-y-1 border-l border-zinc-200 dark:border-zinc-800" aria-label="Tool groups">
                  {TOOL_GROUPS.map((g) => (
                    <a
                      key={g.id}
                      href={`#${g.id}`}
                      className="block border-l-2 border-transparent py-1.5 pl-4 text-sm font-medium text-zinc-600 transition hover:border-sky-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-emerald-500 dark:hover:text-zinc-100"
                    >
                      {g.label}
                    </a>
                  ))}
                </nav>
                <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 text-xs leading-relaxed text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    What we ship
                  </div>
                  Transparent assumptions, clear outputs, and exports where it helps—built for learning, not personalized advice.
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="mb-12 max-w-2xl lg:mb-14">
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Full directory</h2>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  Every workspace runs in your browser. Pick a category or jump straight to a tool.
                </p>
              </div>

              <div className="space-y-16 lg:space-y-20">
                {TOOL_GROUPS.map((group, gi) => (
                  <div key={group.id} id={group.id} className="scroll-mt-28">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                          {String(gi + 1).padStart(2, "0")} — Suite
                        </p>
                        <h3 className="mt-1 font-display text-xl font-bold tracking-tight sm:text-2xl">{group.label}</h3>
                        <p className="mt-1 max-w-lg text-sm text-zinc-600 dark:text-zinc-400">{group.blurb}</p>
                      </div>
                    </div>

                    <ul className="m-0 list-none space-y-3 p-0">
                      {group.slugs.map((slug) => {
                        const tool = toolBySlug(slug);
                        if (!tool) return null;
                        const Icon = iconByKey[tool.iconKey] ?? Calculator;
                        return (
                          <li key={tool.slug}>
                            <Link
                              href={`/tools/${tool.slug}`}
                              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200/90 hover:shadow-lg hover:shadow-sky-900/[0.06] sm:flex-row sm:items-center sm:gap-6 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800/60 dark:hover:shadow-black/30"
                            >
                              <div
                                className="absolute left-0 top-0 h-full w-1 opacity-90 dark:from-emerald-500 dark:to-cyan-600"
                                aria-hidden
                              />
                              <div className="flex shrink-0 items-start gap-4 sm:items-center sm:pl-2">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-sky-800 shadow-inner dark:border-zinc-800 dark:bg-zinc-900 dark:text-emerald-400">
                                  <Icon className="h-7 w-7" aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1 sm:hidden">
                                  <h4 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">{tool.name}</h4>
                                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{tool.tagline}</p>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1 sm:pl-0">
                                <div className="hidden sm:block">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">{tool.name}</h4>
                                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                      {tool.users}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{tool.tagline}</p>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-600 line-clamp-2 dark:text-zinc-400 sm:line-clamp-none">
                                  {tool.description}
                                </p>
                                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 transition group-hover:gap-2 dark:text-emerald-400">
                                  Open
                                  <ArrowRight className="h-4 w-4" />
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center justify-end sm:flex-col sm:items-end sm:gap-2">
                                <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 sm:hidden dark:bg-zinc-800 dark:text-zinc-400">
                                  {tool.users}
                                </span>
                                <ArrowUpRight className="h-5 w-5 text-zinc-400 transition group-hover:text-sky-700 dark:group-hover:text-emerald-400" aria-hidden />
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust footer */}
        <footer className="border-t border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-8 sm:flex-row sm:items-start sm:gap-8 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                <Shield className="h-6 w-6 text-zinc-600 dark:text-zinc-400" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">Education, not advice</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  These tools help you explore scenarios and build intuition—they are not tax, legal, or investment advice.
                  Outcomes depend on your inputs; confirm anything material with official sources or a qualified professional.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                  <Link href="/about" className="text-sky-800 underline-offset-4 hover:underline dark:text-emerald-400">
                    About Facts Deck
                  </Link>
                  <Link href="/disclaimer" className="text-sky-800 underline-offset-4 hover:underline dark:text-emerald-400">
                    Full disclaimer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
