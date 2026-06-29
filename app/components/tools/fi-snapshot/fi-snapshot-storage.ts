import type { FiSnapshotGoal, FiSnapshotJourneyAnswers } from "./fi-snapshot-journey-types";

const STORAGE_KEY = "factsdeck:net-worth-fi-snapshot:v1";

export type FiSnapshotPersistedState = {
  goal: FiSnapshotGoal;
  liquidCash: number;
  invested: number;
  otherAssets: number;
  liabilities: number;
  monthlyExpenses: number;
  monthlyInvesting: number;
  withdrawalRatePct: number;
  investmentReturnAnnual: number;
  updatedAt: string;
};

export function loadFiSnapshotState(): Omit<FiSnapshotPersistedState, "updatedAt"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FiSnapshotPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveFiSnapshotState(state: Omit<FiSnapshotPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: FiSnapshotPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearFiSnapshotState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: FiSnapshotJourneyAnswers): Omit<FiSnapshotPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    liquidCash: answers.liquidCash,
    invested: answers.invested,
    otherAssets: answers.otherAssets,
    liabilities: answers.liabilities,
    monthlyExpenses: answers.monthlyExpenses,
    monthlyInvesting: answers.monthlyInvesting,
    withdrawalRatePct: 4,
    investmentReturnAnnual: 0.07,
  };
}
