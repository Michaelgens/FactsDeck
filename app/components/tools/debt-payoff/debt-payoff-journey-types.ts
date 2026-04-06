/** Interactive debt payoff journey (before AdvancedDebtPayoffPlanner). */

export const FACTS_DECK_DEBT_PAYOFF_TEST = "Facts Deck Debt Payoff Test";

export const FACTS_DECK_DEBT_PAYOFF_PLANNER = "Facts Deck Debt Payoff Planner";

export type DebtPayoffGoal = "snowball" | "avalanche" | "compare" | "exploring";

export type DebtJourneyAnswers = {
  goal: DebtPayoffGoal;
  debt1Balance: number;
  debt1Apr: number;
  debt1Min: number;
  debt2Balance: number;
  debt2Apr: number;
  debt2Min: number;
  extraMonthly: number;
};

export const DEBT_PAYOFF_JOURNEY_DEFAULTS: DebtJourneyAnswers = {
  goal: "compare",
  debt1Balance: 4_200,
  debt1Apr: 22.9,
  debt1Min: 120,
  debt2Balance: 7_800,
  debt2Apr: 9.9,
  debt2Min: 180,
  extraMonthly: 200,
};
