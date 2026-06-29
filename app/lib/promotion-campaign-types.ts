export type PromotionTemplate = {
  subject: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  disclaimer: string;
};

export const DEFAULT_PROMOTION_TEMPLATE: PromotionTemplate = {
  subject: "[Promotion] A message for Facts Deck readers",
  preheader: "Partner highlight — clearly labeled, optional to read.",
  eyebrow: "Promotion",
  headline: "Featured for our readers",
  body:
    "We're sharing an offer we think may be relevant to your financial goals. Editorial coverage on Facts Deck is independent — this message is clearly promotional.",
  ctaLabel: "View offer",
  ctaUrl: "https://factsdeck.com",
  disclaimer:
    "Facts Deck may receive compensation from partners. This does not influence our independent editorial coverage.",
};

export type SubscribersPage = {
  rows: Array<{ id: string; email: string; createdAt: string }>;
  total: number;
  page: number;
  limit: number;
  query: string;
};

/** Explicit list or all subscribers minus exclusions (resolved server-side on send). */
export type PromotionRecipientSelection =
  | { mode: "explicit"; emails: string[] }
  | { mode: "all"; excludeEmails: string[] };

export type PromotionCampaignPerformance = {
  id: string;
  name: string;
  subject: string;
  headline: string;
  status: string;
  createdAt: string;
  targeted: number;
  delivered: number;
  failed: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
};

export const PROMOTION_PRESETS: { id: string; label: string; template: Partial<PromotionTemplate> }[] = [
  {
    id: "partner",
    label: "Partner highlight",
    template: {
      eyebrow: "Partner offer",
      headline: "Exclusive for Facts Deck subscribers",
      body: "Our partner has extended an offer for readers who want to go deeper on this topic. Review details on their site — no obligation.",
    },
  },
  {
    id: "tool",
    label: "Tool spotlight",
    template: {
      eyebrow: "Tool",
      headline: "Try a Facts Deck calculator",
      body: "We've updated our tools library with calculators designed for real decisions — mortgages, budgets, and more.",
      ctaLabel: "Explore tools",
      ctaUrl: "https://factsdeck.com/tools",
    },
  },
  {
    id: "brief",
    label: "Editorial promo",
    template: {
      eyebrow: "From the desk",
      headline: "Don't miss this week's deep dive",
      body: "Our editors published a guide we think you'll want on your reading list. Clear, research-backed, and free on Facts Deck.",
      ctaLabel: "Read on Facts Deck",
    },
  },
];
