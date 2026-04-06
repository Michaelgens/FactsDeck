/** Interactive loan journey (before full AdvancedLoanCalculator). */

export const FACTS_DECK_LOAN_TEST = "Facts Deck Loan Test";

export const FACTS_DECK_LOAN_CALCULATOR = "Facts Deck Loan Calculator";

export type LoanGoal = "auto" | "personal" | "refinance" | "exploring";

export type LoanJourneyAnswers = {
  goal: LoanGoal;
  principal: number;
  apr: number;
  termYears: number;
  extraMonthly: number;
  feePct: number;
};

export const LOAN_JOURNEY_DEFAULTS: LoanJourneyAnswers = {
  goal: "auto",
  principal: 28_000,
  apr: 8.49,
  termYears: 5,
  extraMonthly: 0,
  feePct: 0,
};
