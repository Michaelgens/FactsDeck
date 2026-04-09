import type { Metadata } from "next";
import HomePageClient from "./components/HomePageClient";
import { getPartitionedPosts, getCategoriesWithCounts } from "./lib/posts";
import { getMarketData } from "./lib/market-data";
import { SITE_URL } from "./lib/seo";
import { siteTools } from "./lib/site-config";
import { pickDailyTools } from "./lib/tools-utils";

const homeDescription =
  "Expert investing, banking & personal finance guides, tools & comparisons. Build financial literacy with Facts Deck — trusted by millions of readers.";

export const metadata: Metadata = {
  title: { absolute: "Facts Deck | Your Financial Knowledge Hub" },
  description: homeDescription,
  keywords: [
    "personal finance",
    "investing",
    "banking",
    "financial education",
    "investment guides",
    "money management",
    "wealth building",
    "retirement planning",
    "credit cards",
    "mortgage",
    "financial literacy",
    "stock market",
    "budgeting",
    "Crypto",
  ],
  openGraph: {
    title: "Facts Deck | Your Financial Knowledge Hub",
    description: homeDescription,
    url: SITE_URL,
    siteName: "Facts Deck",
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Facts Deck | Your Financial Knowledge Hub",
    description: homeDescription,
  },
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: "Facts Deck",
      url: SITE_URL,
      description: homeDescription,
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/post?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "Facts Deck",
      url: SITE_URL,
      description: "Independent financial education — articles, guides, and tools for smarter money decisions.",
    },
  ],
};

export default async function HomePage() {
  const [partitioned, categoriesWithCounts, marketData] = await Promise.all([
    getPartitionedPosts(),
    getCategoriesWithCounts(),
    getMarketData(),
  ]);
  const sidebarTools = pickDailyTools(siteTools, 5, "home-sidebar");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Ambient layers — matches tools / legal marketing pages */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[min(90rem,200%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-200/35 via-orange-100/15 to-transparent blur-3xl dark:from-emerald-950/50 dark:via-blue-950/30 dark:to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-[28rem] right-[-10%] h-96 w-96 rounded-full bg-orange-100/30 blur-3xl dark:bg-cyan-950/25"
          aria-hidden
        />
        <div className="relative min-w-0 w-full">
          <HomePageClient
            featuredPosts={partitioned.featured}
            latestPosts={partitioned.latest}
            expertPickPosts={partitioned.expertPicks}
            trendingPosts={partitioned.trending}
            guidePosts={partitioned.guides}
            categoriesWithCounts={categoriesWithCounts}
            marketData={marketData}
            sidebarTools={sidebarTools}
          />
        </div>
      </div>
    </>
  );
}
