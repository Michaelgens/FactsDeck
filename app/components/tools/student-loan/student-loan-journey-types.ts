/** Interactive student loan path journey (before AdvancedStudentLoanSnapshot). */

export const FACTS_DECK_STUDENT_LOAN_TEST = "Facts Deck Student Loan Path Test";

export const FACTS_DECK_STUDENT_LOAN_SNAPSHOT = "Facts Deck Student Loan Path Snapshot";

export type StudentLoanPathGoal = "standard" | "idr" | "compare" | "exploring";

export type StudentLoanJourneyAnswers = {
  goal: StudentLoanPathGoal;
  balance: number;
  aprPercent: number;
  annualIncome: number;
  familySize: number;
};

export const STUDENT_LOAN_JOURNEY_DEFAULTS: StudentLoanJourneyAnswers = {
  goal: "compare",
  balance: 28_500,
  aprPercent: 5.5,
  annualIncome: 48_000,
  familySize: 1,
};
