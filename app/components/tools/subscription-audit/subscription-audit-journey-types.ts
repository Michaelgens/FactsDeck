/** Interactive subscription audit journey (before AdvancedSubscriptionAudit). */

export const FACTS_DECK_SUBSCRIPTION_AUDIT_TEST = "Facts Deck Recurring Spend Test";

export const FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL = "Subscription & Recurring Spend Audit";

export type SubscriptionAuditGoal = "leaks" | "cut" | "exploring";

/** Quick estimate vs line-item audit in the workspace. */
export type SubscriptionAuditMode = "quick_estimate" | "line_item_audit";

export type SubscriptionJourneyAnswers = {
  goal: SubscriptionAuditGoal;
  mode: SubscriptionAuditMode;
  estimatedMonthlyRecurring: number;
  subscriptionCount: number;
  targetTrimPercent: number;
};

export const SUBSCRIPTION_AUDIT_JOURNEY_DEFAULTS: SubscriptionJourneyAnswers = {
  goal: "leaks",
  mode: "line_item_audit",
  estimatedMonthlyRecurring: 186,
  subscriptionCount: 9,
  targetTrimPercent: 15,
};

export function recommendedTrimPercent(goal: SubscriptionAuditGoal): number {
  switch (goal) {
    case "cut":
      return 25;
    case "leaks":
      return 15;
    case "exploring":
    default:
      return 10;
  }
}
