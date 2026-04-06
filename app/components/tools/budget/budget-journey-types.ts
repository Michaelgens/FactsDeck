/** Interactive budget journey (before full AdvancedBudgetPlanner). */

export const FACTS_DECK_BUDGET_TEST = "Facts Deck Budget Test";

export const FACTS_DECK_BUDGET_PLANNER = "Facts Deck Budget Planner";

export type BudgetGoal = "organize" | "debt" | "save" | "exploring";

export type BudgetJourneyAnswers = {
  goal: BudgetGoal;
  mode: "50-30-20" | "zero-based";
  incomeMonthly: number;
  bufferPct: number;
};

export const BUDGET_JOURNEY_DEFAULTS: BudgetJourneyAnswers = {
  goal: "organize",
  mode: "50-30-20",
  incomeMonthly: 6200,
  bufferPct: 0.03,
};
