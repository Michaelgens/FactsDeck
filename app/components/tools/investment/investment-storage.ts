import type { InvestmentJourneyAnswers, InvestmentGoal } from "./investment-journey-types";

const STORAGE_KEY = "factsdeck:investment-calculator:v1";

export type InvestmentPersistedState = {
  goal: InvestmentGoal;
  initial: number;
  monthly: number;
  years: number;
  nominal: number;
  expenseRatio: number;
  inflation: number;
  taxOnGains: number;
  annualSpend: number;
  swr: number;
  updatedAt: string;
};

export function loadInvestmentState(): Omit<InvestmentPersistedState, "updatedAt"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InvestmentPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveInvestmentState(state: Omit<InvestmentPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: InvestmentPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearInvestmentState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: InvestmentJourneyAnswers): Omit<InvestmentPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    initial: answers.initial,
    monthly: answers.monthly,
    years: answers.years,
    nominal: answers.nominal,
    expenseRatio: 0.08,
    inflation: answers.inflation,
    taxOnGains: 15,
    annualSpend: answers.annualSpend,
    swr: answers.swr,
  };
}
