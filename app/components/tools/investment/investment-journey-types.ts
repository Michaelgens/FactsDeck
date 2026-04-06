/** Interactive investment journey (before full AdvancedInvestmentCalculator). */

export const FACTS_DECK_INVESTMENT_TEST = "Facts Deck Investment Test";

/** Full product name on the welcome slide. */
export const FACTS_DECK_INVESTMENT_CALCULATOR = "Facts Deck Investment Calculator";

export type InvestmentGoal = "wealth" | "fire" | "exploring";

export type InvestmentJourneyAnswers = {
  goal: InvestmentGoal;
  initial: number;
  monthly: number;
  years: number;
  nominal: number;
  inflation: number;
  annualSpend: number;
  swr: number;
};

export const INVESTMENT_JOURNEY_DEFAULTS: InvestmentJourneyAnswers = {
  goal: "wealth",
  initial: 25_000,
  monthly: 800,
  years: 25,
  nominal: 7,
  inflation: 2.5,
  annualSpend: 60_000,
  swr: 4,
};
