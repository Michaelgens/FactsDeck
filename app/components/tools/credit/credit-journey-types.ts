/** Interactive credit score journey (before full AdvancedCreditScoreSimulator). */

export const FACTS_DECK_CREDIT_TEST = "Facts Deck Credit Test";

export const FACTS_DECK_CREDIT_SCORE_SIMULATOR = "Facts Deck Credit Score Simulator";

export type CreditJourneyGoal = "improve" | "learn" | "exploring";

export type CreditJourneyAnswers = {
  goal: CreditJourneyGoal;
  utilizationPct: number;
  onTimePct: number;
  avgAgeYears: number;
  hardInquiries12m: number;
  accountTypes: number;
};

export const CREDIT_JOURNEY_DEFAULTS: CreditJourneyAnswers = {
  goal: "learn",
  utilizationPct: 28,
  onTimePct: 99,
  avgAgeYears: 7,
  hardInquiries12m: 1,
  accountTypes: 3,
};
