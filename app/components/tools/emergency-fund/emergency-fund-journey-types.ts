/** Interactive emergency fund journey (before full AdvancedEmergencyFundCalculator). */

export const FACTS_DECK_EMERGENCY_FUND_TEST = "Facts Deck Emergency Fund Test";

export const FACTS_DECK_EMERGENCY_FUND_CALCULATOR = "Facts Deck Emergency Fund & Runway Calculator";

export type EmergencyFundGoal = "essentials" | "job_buffer" | "peace" | "exploring";

export type EmergencyFundJourneyAnswers = {
  goal: EmergencyFundGoal;
  monthlyEssentials: number;
  currentFund: number;
  monthlyContribution: number;
  targetMonths: number;
};

export const EMERGENCY_FUND_JOURNEY_DEFAULTS: EmergencyFundJourneyAnswers = {
  goal: "essentials",
  monthlyEssentials: 4500,
  currentFund: 8000,
  monthlyContribution: 400,
  targetMonths: 6,
};
