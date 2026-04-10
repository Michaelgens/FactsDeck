/**
 * Static copy for article detail + post list rails (Popular, top picks, carousels).
 * Keeps marketing/demo cards in sync with PostListContent / HomePageClient.
 */

export const STATIC_POPULAR = [
  { title: "How compound interest actually compounds (with examples)", tag: "Education" },
  { title: "Debt snowball vs avalanche: which wins (and when)?", tag: "Debt" },
  { title: "What is a good savings rate in 2026?", tag: "Saving" },
  { title: "Roth vs Traditional: a decision checklist", tag: "Retirement" },
  { title: "DTI explained: how lenders evaluate you", tag: "Loans" },
] as const;

export const STATIC_TOP_PICKS_FOR_MONTH = [
  { title: "The 1% rule for big purchases", tag: "Spending", readTime: "4 min" },
  { title: "A simple IRA contribution ladder", tag: "Retirement", readTime: "5 min" },
  { title: "Debt payoff order that minimizes interest", tag: "Debt", readTime: "6 min" },
  { title: "Mortgage points: when they pay off", tag: "Housing", readTime: "5 min" },
  { title: "A two-account system that simplifies budgeting", tag: "Budgeting", readTime: "4 min" },
  { title: "The easiest way to start an emergency fund", tag: "Saving", readTime: "4 min" },
  { title: "401(k) match math: what to contribute first", tag: "Retirement", readTime: "5 min" },
  { title: "A simple rule for credit card payoff order", tag: "Credit", readTime: "4 min" },
] as const;

const CAROUSEL_BANK = [
  { category: "Investing", title: "ETFs vs index funds: the difference that matters", date: "Apr 9, 2026" },
  { category: "Credit", title: "Utilization: the simplest way to lift your score", date: "Apr 8, 2026" },
  { category: "Budgeting", title: "A two-account system that makes budgeting stick", date: "Apr 7, 2026" },
  { category: "Retirement", title: "401(k) match math: what to contribute first", date: "Apr 6, 2026" },
  { category: "Housing", title: "Mortgage points: when they pay off (and when they don’t)", date: "Apr 5, 2026" },
] as const;

export type StaticCarouselCard = {
  id: string;
  category: string;
  title: string;
  date: string;
  imageSrc: string;
};

export function buildStaticCarouselItems(count: number, idPrefix: string): StaticCarouselCard[] {
  return Array.from({ length: count }, (_, i) => {
    const row = CAROUSEL_BANK[i % CAROUSEL_BANK.length];
    const imageSrc = i % 2 === 0 ? "/first.jpeg" : "/budget.png";
    return { id: `${idPrefix}-${i}`, ...row, imageSrc };
  });
}

/** Home-style horizontal “Latest Articles” strip length */
export const STATIC_RELATED_ARTICLES_CAROUSEL = buildStaticCarouselItems(20, "detail-related");

/** 4×4 desktop grid (16 cards) */
export const STATIC_READ_MORE_GRID = buildStaticCarouselItems(16, "detail-read-more");
