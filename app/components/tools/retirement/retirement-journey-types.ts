/** Interactive retirement journey (before full AdvancedRetirementCalculator). */

export const FACTS_DECK_RETIREMENT_TEST = "Facts Deck Retirement Test";

export const FACTS_DECK_RETIREMENT_CALCULATOR = "Facts Deck Retirement Calculator";

export type RetirementGoal = "retire" | "fire" | "exploring";

export type RetirementJourneyAnswers = {
  goal: RetirementGoal;
  currentAge: number;
  retireAge: number;
  annualSpendingToday: number;
  totalBalance: number;
  contributionMonthly: number;
  /** Percent, e.g. 2.5 for 2.5% */
  inflation: number;
  /** Percent, e.g. 7 for 7% */
  returnNominal: number;
  /** Percent, e.g. 4 for 4% withdrawal */
  withdrawalRate: number;
};

export const RETIREMENT_JOURNEY_DEFAULTS: RetirementJourneyAnswers = {
  goal: "retire",
  currentAge: 35,
  retireAge: 62,
  annualSpendingToday: 72_000,
  totalBalance: 85_000,
  contributionMonthly: 1200,
  inflation: 2.5,
  returnNominal: 7,
  withdrawalRate: 4,
};
