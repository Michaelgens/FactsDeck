import type { LoanGoal, LoanJourneyAnswers } from "./loan-journey-types";

const STORAGE_KEY = "factsdeck:loan-calculator:v1";

export type LoanPersistedState = {
  goal: LoanGoal;
  principal: number;
  apr: number;
  termYears: number;
  extraMonthly: number;
  feePct: number;
  bPrincipal: number;
  bApr: number;
  bYears: number;
  updatedAt: string;
};

export function loadLoanState(): LoanPersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LoanPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLoanState(state: Omit<LoanPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: LoanPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearLoanState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: LoanJourneyAnswers): Omit<LoanPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    principal: answers.principal,
    apr: answers.apr,
    termYears: answers.termYears,
    extraMonthly: answers.extraMonthly,
    feePct: answers.feePct,
    bPrincipal: answers.principal,
    bApr: Math.max(0.5, answers.apr - 1.5),
    bYears: Math.max(0.5, answers.termYears - 1),
  };
}
