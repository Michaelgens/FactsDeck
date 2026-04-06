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
      <div className="min-w-0 w-full">
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
    </>
  );
}
