/** Answers collected in the interactive mortgage journey (before full dashboard). */

/** Official name for the 5-step interactive flow (slides + summary). */
export const FACTS_DECK_MORTGAGE_TEST = "Facts Deck Mortgage Test";

/** Full product name on the welcome slide. */
export const FACTS_DECK_MORTGAGE_CALCULATOR = "Facts Deck Mortgage Calculator";

export type BuyerGoal = "buying" | "refinancing" | "exploring";

export type MortgageJourneyAnswers = {
  goal: BuyerGoal;
  homePrice: number;
  downPercent: number;
  rate: number;
  termYears: number;
  incomeMonthly: number;
  extraMonthly: number;
};

export const JOURNEY_DEFAULTS: MortgageJourneyAnswers = {
  goal: "buying",
  homePrice: 425_000,
  downPercent: 10,
  rate: 6.75,
  termYears: 30,
  incomeMonthly: 9_500,
  extraMonthly: 0,
};
