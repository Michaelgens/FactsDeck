"use client";

import { recordToolEvent } from "./tool-analytics-actions";
import type { ToolEventType } from "./tool-analytics-types";

function sessionKey(toolSlug: string, event: ToolEventType) {
  return `factsdeck:tool-analytics:${toolSlug}:${event}`;
}

/** Fire-and-forget anonymous tool analytics (optional once-per-session dedupe). */
export function trackToolEvent(
  toolSlug: string,
  event: ToolEventType,
  meta?: Record<string, unknown>,
  oncePerSession = false
) {
  if (typeof window === "undefined") return;
  if (oncePerSession) {
    const key = sessionKey(toolSlug, event);
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
  }
  void recordToolEvent(toolSlug, event, meta);
}

export const BUDGET_PLANNER_SLUG = "budget-planner";
export const EMERGENCY_FUND_SLUG = "emergency-fund-calculator";
export const SUBSCRIPTION_AUDIT_SLUG = "subscription-spend-audit";
export const MORTGAGE_SLUG = "mortgage-calculator";
export const LOAN_SLUG = "loan-calculator";
export const DEBT_PAYOFF_SLUG = "debt-payoff-planner";
export const STUDENT_LOAN_SLUG = "student-loan-snapshot";
export const CREDIT_SCORE_SLUG = "credit-score-simulator";
export const INVESTMENT_SLUG = "investment-calculator";
export const RETIREMENT_SLUG = "retirement-calculator";
export const FI_SNAPSHOT_SLUG = "net-worth-fi-snapshot";
export const CRYPTO_YIELD_SLUG = "crypto-yield-lab";
