/** Interactive emergency fund journey (before full AdvancedEmergencyFundCalculator). */

export const FACTS_DECK_EMERGENCY_FUND_TEST = "Facts Deck Emergency Fund Test";

export const FACTS_DECK_EMERGENCY_FUND_CALCULATOR = "Emergency Fund & Runway Calculator";

export type EmergencyFundGoal = "essentials" | "job_buffer" | "peace" | "exploring";

/** Runway math = single essentials number; essentials builder = line-item buckets in workspace. */
export type EmergencyFundPlanMode = "runway_math" | "essentials_builder";

export type EssentialCategory = "housing" | "food" | "utilities" | "transport" | "debt_min" | "other";

export type EssentialLineItem = {
  id: string;
  name: string;
  category: EssentialCategory;
  amountMonthly: number;
};

export type EmergencyFundJourneyAnswers = {
  goal: EmergencyFundGoal;
  planMode: EmergencyFundPlanMode;
  monthlyEssentials: number;
  currentFund: number;
  monthlyContribution: number;
  targetMonths: number;
};

export const EMERGENCY_FUND_JOURNEY_DEFAULTS: EmergencyFundJourneyAnswers = {
  goal: "essentials",
  planMode: "runway_math",
  monthlyEssentials: 4500,
  currentFund: 8000,
  monthlyContribution: 400,
  targetMonths: 6,
};

export function recommendedTargetMonths(goal: EmergencyFundGoal): number {
  switch (goal) {
    case "job_buffer":
      return 6;
    case "peace":
      return 9;
    case "essentials":
      return 3;
    case "exploring":
    default:
      return 6;
  }
}
