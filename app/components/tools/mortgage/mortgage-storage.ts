import type { BuyerGoal, MortgageJourneyAnswers } from "./mortgage-journey-types";

const STORAGE_KEY = "factsdeck:mortgage-calculator:v1";

export type MortgagePersistedState = {
  goal: BuyerGoal;
  homePrice: number;
  downPercent: number;
  rate: number;
  termYears: number;
  propertyTaxPercent: number;
  insuranceYearly: number;
  hoaMonthly: number;
  pmiAnnualPercent: number;
  extraMonthly: number;
  incomeMonthly: number;
  debtsMonthly: number;
  updatedAt: string;
};

export function loadMortgageState(): MortgagePersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MortgagePersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMortgageState(state: Omit<MortgagePersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: MortgagePersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearMortgageState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: MortgageJourneyAnswers): Omit<MortgagePersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    homePrice: answers.homePrice,
    downPercent: answers.downPercent,
    rate: answers.rate,
    termYears: answers.termYears,
    propertyTaxPercent: 1.15,
    insuranceYearly: Math.round(answers.homePrice * 0.0035),
    hoaMonthly: 0,
    pmiAnnualPercent: 0.65,
    extraMonthly: answers.extraMonthly,
    incomeMonthly: answers.incomeMonthly,
    debtsMonthly: 0,
  };
}
