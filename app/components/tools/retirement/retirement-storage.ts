import type { RetirementGoal, RetirementJourneyAnswers } from "./retirement-journey-types";

const STORAGE_KEY = "factsdeck:retirement-calculator:v1";

export type StoredRetirementAccount = {
  id: string;
  name: string;
  balance: number;
  contributionMonthly: number;
  employerMatchMonthly: number;
};

export type RetirementPersistedState = {
  goal: RetirementGoal;
  currentAge: number;
  retireAge: number;
  lifeExpectancy: number;
  inflation: number;
  returnNominal: number;
  withdrawalRate: number;
  annualSpendingToday: number;
  socialSecurityAnnualAtRetire: number;
  oneTimeAtRetire: number;
  accounts: StoredRetirementAccount[];
  updatedAt: string;
};

export function loadRetirementState(): Omit<RetirementPersistedState, "updatedAt"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RetirementPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveRetirementState(state: Omit<RetirementPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: RetirementPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearRetirementState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(
  answers: RetirementJourneyAnswers,
  accountId: string
): Omit<RetirementPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    currentAge: answers.currentAge,
    retireAge: answers.retireAge,
    lifeExpectancy: 92,
    inflation: answers.inflation / 100,
    returnNominal: answers.returnNominal / 100,
    withdrawalRate: answers.withdrawalRate / 100,
    annualSpendingToday: answers.annualSpendingToday,
    socialSecurityAnnualAtRetire: 0,
    oneTimeAtRetire: 0,
    accounts: [
      {
        id: accountId,
        name: "Your accounts (from test)",
        balance: answers.totalBalance,
        contributionMonthly: answers.contributionMonthly,
        employerMatchMonthly: 0,
      },
    ],
  };
}
