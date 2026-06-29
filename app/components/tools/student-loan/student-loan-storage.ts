import type { StudentLoanJourneyAnswers, StudentLoanPathGoal } from "./student-loan-journey-types";

const STORAGE_KEY = "factsdeck:student-loan-snapshot:v1";

export type StudentLoanPersistedState = {
  goal: StudentLoanPathGoal;
  balance: number;
  aprPercent: number;
  annualIncome: number;
  familySize: number;
  standardTermYears: number;
  idrPercentOfDiscretionary: number;
  idrHorizonYears: number;
  updatedAt: string;
};

export function loadStudentLoanState(): Omit<StudentLoanPersistedState, "updatedAt"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentLoanPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStudentLoanState(state: Omit<StudentLoanPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: StudentLoanPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearStudentLoanState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: StudentLoanJourneyAnswers): Omit<StudentLoanPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    balance: answers.balance,
    aprPercent: answers.aprPercent,
    annualIncome: answers.annualIncome,
    familySize: answers.familySize,
    standardTermYears: 10,
    idrPercentOfDiscretionary: 10,
    idrHorizonYears: 20,
  };
}
