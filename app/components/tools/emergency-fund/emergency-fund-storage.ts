import type { EmergencyFundJourneyAnswers, EssentialLineItem, EmergencyFundPlanMode, EmergencyFundGoal } from "./emergency-fund-journey-types";

const STORAGE_KEY = "factsdeck:emergency-fund:v1";

export type EmergencyFundPersistedState = {
  goal: EmergencyFundGoal;
  planMode: EmergencyFundPlanMode;
  monthlyEssentials: number;
  currentFund: number;
  monthlyContribution: number;
  targetMonths: number;
  essentialItems: EssentialLineItem[];
  updatedAt: string;
};

export function loadEmergencyFundState(): EmergencyFundPersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmergencyFundPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.essentialItems)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveEmergencyFundState(state: Omit<EmergencyFundPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: EmergencyFundPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearEmergencyFundState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: EmergencyFundJourneyAnswers): Omit<EmergencyFundPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    planMode: answers.planMode,
    monthlyEssentials: answers.monthlyEssentials,
    currentFund: answers.currentFund,
    monthlyContribution: answers.monthlyContribution,
    targetMonths: answers.targetMonths,
    essentialItems: [],
  };
}
