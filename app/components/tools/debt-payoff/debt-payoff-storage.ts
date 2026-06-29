import type { DebtJourneyAnswers, DebtPayoffGoal } from "./debt-payoff-journey-types";
import { journeyAnswersToDebts, type DebtLineInput } from "./compute-debt-payoff-metrics";

const STORAGE_KEY = "factsdeck:debt-payoff-planner:v1";

export type DebtPayoffPersistedState = {
  goal: DebtPayoffGoal;
  debts: DebtLineInput[];
  extraMonthly: number;
  updatedAt: string;
};

export function loadDebtPayoffState(): DebtPayoffPersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DebtPayoffPersistedState;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.debts)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDebtPayoffState(state: Omit<DebtPayoffPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: DebtPayoffPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearDebtPayoffState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: DebtJourneyAnswers): Omit<DebtPayoffPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    debts: journeyAnswersToDebts(answers),
    extraMonthly: answers.extraMonthly,
  };
}
