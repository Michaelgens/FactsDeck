import type { CompoundingMode, CryptoYieldGoal, CryptoYieldJourneyAnswers } from "./crypto-yield-journey-types";

const STORAGE_KEY = "factsdeck:crypto-yield-lab:v1";

export type CryptoYieldPersistedState = {
  goal: CryptoYieldGoal;
  principal: number;
  apyPercent: number;
  months: number;
  compounding: CompoundingMode;
  aprForConvert: number;
  aprCompoundMode: CompoundingMode;
  updatedAt: string;
};

export function loadCryptoYieldState(): Omit<CryptoYieldPersistedState, "updatedAt"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CryptoYieldPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCryptoYieldState(state: Omit<CryptoYieldPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: CryptoYieldPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearCryptoYieldState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: CryptoYieldJourneyAnswers): Omit<CryptoYieldPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    principal: answers.principal,
    apyPercent: answers.apyPercent,
    months: answers.months,
    compounding: answers.compounding,
    aprForConvert: answers.apyPercent,
    aprCompoundMode: answers.compounding,
  };
}
