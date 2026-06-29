import type { CreditJourneyAnswers, CreditJourneyGoal } from "./credit-journey-types";

const STORAGE_KEY = "factsdeck:credit-score-simulator:v1";

export type CreditScorePersistedState = {
  goal: CreditJourneyGoal;
  utilizationPct: number;
  onTimePct: number;
  avgAgeYears: number;
  hardInquiries12m: number;
  accountTypes: number;
  updatedAt: string;
};

export function loadCreditScoreState(): Omit<CreditScorePersistedState, "updatedAt"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreditScorePersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCreditScoreState(state: Omit<CreditScorePersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: CreditScorePersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearCreditScoreState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: CreditJourneyAnswers): Omit<CreditScorePersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    utilizationPct: answers.utilizationPct,
    onTimePct: answers.onTimePct,
    avgAgeYears: answers.avgAgeYears,
    hardInquiries12m: answers.hardInquiries12m,
    accountTypes: answers.accountTypes,
  };
}
