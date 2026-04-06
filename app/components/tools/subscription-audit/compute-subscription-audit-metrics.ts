import type { SubscriptionJourneyAnswers } from "./subscription-audit-journey-types";

export type SubscriptionLine = {
  id: string;
  name: string;
  amountMonthly: number;
  category: SubscriptionCategory;
};

export type SubscriptionCategory =
  | "Streaming"
  | "Software & apps"
  | "Fitness"
  | "News & learning"
  | "Food & delivery"
  | "Cloud & storage"
  | "Other";

export const SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] = [
  "Streaming",
  "Software & apps",
  "Fitness",
  "News & learning",
  "Food & delivery",
  "Cloud & storage",
  "Other",
];

export function computeSubscriptionJourneyMetrics(a: SubscriptionJourneyAnswers) {
  const monthly = Math.max(0, a.estimatedMonthlyRecurring);
  const annual = monthly * 12;
  const daily = monthly / 30;
  const count = Math.max(0, Math.round(a.subscriptionCount));
  const avgPerSub = count > 0 ? monthly / count : 0;

  return {
    monthly,
    annual,
    daily,
    subscriptionCount: count,
    avgPerSub,
    cut10Annual: annual * 0.1,
    cut15Annual: annual * 0.15,
    cut25Annual: annual * 0.25,
  };
}

export function totalMonthlyFromLines(lines: Pick<SubscriptionLine, "amountMonthly">[]) {
  return lines.reduce((s, l) => s + Math.max(0, l.amountMonthly), 0);
}

export function formatSubMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
