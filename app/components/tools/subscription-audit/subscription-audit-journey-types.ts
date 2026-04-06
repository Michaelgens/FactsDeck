/** Interactive subscription audit journey (before AdvancedSubscriptionAudit). */

export const FACTS_DECK_SUBSCRIPTION_AUDIT_TEST = "Facts Deck Recurring Spend Test";

export const FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL = "Facts Deck Subscription & Recurring Spend Audit";

export type SubscriptionAuditGoal = "leaks" | "cut" | "exploring";

export type SubscriptionJourneyAnswers = {
  goal: SubscriptionAuditGoal;
  estimatedMonthlyRecurring: number;
  subscriptionCount: number;
};

export const SUBSCRIPTION_AUDIT_JOURNEY_DEFAULTS: SubscriptionJourneyAnswers = {
  goal: "leaks",
  estimatedMonthlyRecurring: 186,
  subscriptionCount: 9,
};
