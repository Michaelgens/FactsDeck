import type { BudgetGoal, BudgetJourneyAnswers } from "./budget-journey-types";
import type { BudgetExpenseItem, BudgetMode } from "./compute-budget-journey-metrics";

const STORAGE_KEY = "factsdeck:budget-planner:v1";

export type BudgetPersistedState = {
  mode: BudgetMode;
  incomeMonthly: number;
  bufferPct: number;
  goal: BudgetGoal;
  items: BudgetExpenseItem[];
  updatedAt: string;
};

export function loadBudgetState(): BudgetPersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BudgetPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveBudgetState(state: Omit<BudgetPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: BudgetPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearBudgetState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: BudgetJourneyAnswers): Omit<BudgetPersistedState, "updatedAt"> {
  return {
    mode: answers.mode,
    incomeMonthly: answers.incomeMonthly,
    bufferPct: answers.bufferPct,
    goal: answers.goal,
    items: [],
  };
}
