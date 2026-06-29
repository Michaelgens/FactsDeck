import { getEmailFunnelInsights, getWelcomeSendsPaginated } from "./email-funnel-actions";
import type { EmailFunnelInsights, WelcomeSendsPage } from "./email-funnel-types";
import {
  getPromotionCampaigns,
  getSubscriberTotalCount,
  getSubscribersPaginated,
} from "./promotion-campaign-actions";
import type { PromotionCampaignPerformance, SubscribersPage } from "./promotion-campaign-types";
import {
  getPostsForWeeklyBrief,
  getWeeklyBriefEditions,
} from "./weekly-brief-actions";
import type { BriefPostPick, WeeklyBriefEdition } from "./weekly-brief-types";

export const EMAIL_FUNNEL_TABS = ["main", "welcome", "promotion", "weekly-brief"] as const;
export type EmailFunnelTabId = (typeof EMAIL_FUNNEL_TABS)[number];

const LIMITS = [10, 50, 100] as const;

export type EmailFunnelPageParams = {
  tab: EmailFunnelTabId;
  welcomePage: number;
  welcomeLimit: number;
  welcomeQuery: string;
  promoPage: number;
  promoLimit: number;
  promoQuery: string;
  briefPage: number;
  briefLimit: number;
  briefQuery: string;
};

export type EmailFunnelPageData = {
  insights: EmailFunnelInsights;
  welcomeSends: WelcomeSendsPage;
  subscribersPage: SubscribersPage;
  totalAllSubscribers: number;
  promotionCampaigns: PromotionCampaignPerformance[];
  briefPostPicks: BriefPostPick[];
  briefSubscribersPage: SubscribersPage;
  weeklyBriefEditions: WeeklyBriefEdition[];
};

function parseLimit(value: string | null | undefined, fallback: number): number {
  const n = Number(value);
  return LIMITS.includes(n as (typeof LIMITS)[number]) ? n : fallback;
}

export function parseEmailFunnelSearchParams(
  params: Record<string, string | undefined>
): EmailFunnelPageParams {
  const tabParam = params.tab ?? "main";
  const tab = EMAIL_FUNNEL_TABS.includes(tabParam as EmailFunnelTabId)
    ? (tabParam as EmailFunnelTabId)
    : "main";

  return {
    tab,
    welcomePage: Math.max(1, parseInt(params.page ?? "1", 10) || 1),
    welcomeLimit: parseLimit(params.limit, 10),
    welcomeQuery: params.q?.trim() ?? "",
    promoPage: Math.max(1, parseInt(params.promoPage ?? "1", 10) || 1),
    promoLimit: parseLimit(params.promoLimit, 10),
    promoQuery: params.promoQ?.trim() ?? "",
    briefPage: Math.max(1, parseInt(params.briefPage ?? "1", 10) || 1),
    briefLimit: parseLimit(params.briefLimit, 10),
    briefQuery: params.briefQ?.trim() ?? "",
  };
}

export async function loadEmailFunnelPageData(
  params: EmailFunnelPageParams
): Promise<EmailFunnelPageData> {
  const [
    insights,
    welcomeSends,
    subscribersPage,
    promotionCampaigns,
    totalAllSubscribers,
    briefPostPicks,
    briefSubscribersPage,
    weeklyBriefEditions,
  ] = await Promise.all([
    getEmailFunnelInsights(),
    getWelcomeSendsPaginated({
      page: params.welcomePage,
      limit: params.welcomeLimit,
      query: params.welcomeQuery,
    }),
    getSubscribersPaginated({
      page: params.promoPage,
      limit: params.promoLimit,
      query: params.promoQuery,
    }),
    getPromotionCampaigns(),
    getSubscriberTotalCount(),
    getPostsForWeeklyBrief(),
    getSubscribersPaginated({
      page: params.briefPage,
      limit: params.briefLimit,
      query: params.briefQuery,
    }),
    getWeeklyBriefEditions(),
  ]);

  return {
    insights,
    welcomeSends,
    subscribersPage,
    totalAllSubscribers,
    promotionCampaigns,
    briefPostPicks,
    briefSubscribersPage,
    weeklyBriefEditions,
  };
}

export function emailFunnelParamsToSearchString(params: EmailFunnelPageParams): string {
  const sp = new URLSearchParams();
  sp.set("tab", params.tab);
  if (params.welcomePage !== 1) sp.set("page", String(params.welcomePage));
  if (params.welcomeLimit !== 10) sp.set("limit", String(params.welcomeLimit));
  if (params.welcomeQuery) sp.set("q", params.welcomeQuery);
  if (params.promoPage !== 1) sp.set("promoPage", String(params.promoPage));
  if (params.promoLimit !== 10) sp.set("promoLimit", String(params.promoLimit));
  if (params.promoQuery) sp.set("promoQ", params.promoQuery);
  if (params.briefPage !== 1) sp.set("briefPage", String(params.briefPage));
  if (params.briefLimit !== 10) sp.set("briefLimit", String(params.briefLimit));
  if (params.briefQuery) sp.set("briefQ", params.briefQuery);
  return sp.toString();
}
