import type {
  SubscriptionAuditGoal,
  SubscriptionAuditMode,
  SubscriptionJourneyAnswers,
} from "./subscription-audit-journey-types";
import type { SubscriptionLine } from "./compute-subscription-audit-metrics";

const STORAGE_KEY = "factsdeck:subscription-audit:v1";

export type SubscriptionAuditPersistedState = {
  goal: SubscriptionAuditGoal;
  mode: SubscriptionAuditMode;
  trimPercent: number;
  lines: SubscriptionLine[];
  updatedAt: string;
};

export function loadSubscriptionAuditState(): SubscriptionAuditPersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SubscriptionAuditPersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.lines)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSubscriptionAuditState(state: Omit<SubscriptionAuditPersistedState, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: SubscriptionAuditPersistedState = { ...state, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearSubscriptionAuditState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function journeyToPersistSeed(answers: SubscriptionJourneyAnswers): Omit<SubscriptionAuditPersistedState, "updatedAt"> {
  return {
    goal: answers.goal,
    mode: answers.mode,
    trimPercent: answers.targetTrimPercent,
    lines: [],
  };
}
