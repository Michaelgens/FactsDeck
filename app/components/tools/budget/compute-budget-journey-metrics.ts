import type { BudgetGoal, BudgetJourneyAnswers } from "./budget-journey-types";

export type ExpenseGroup = "Needs" | "Wants" | "Savings" | "Debt";
export type BudgetMode = "50-30-20" | "zero-based";

export type BudgetExpenseItem = {
  id: string;
  name: string;
  group: ExpenseGroup;
  amountMonthly: number;
};

export type BudgetTargets = {
  needs: number;
  wants: number;
  savingsDebt: number;
};

export type BudgetTotals = {
  byGroup: Record<ExpenseGroup, number>;
  planned: number;
  buffer: number;
  available: number;
  remaining: number;
};

export const GOAL_LABEL: Record<BudgetGoal, string> = {
  organize: "Get organized",
  debt: "Pay down debt",
  save: "Save more",
  exploring: "Exploring",
};

export const GROUP_META: Record<
  ExpenseGroup,
  { color: string; bar: string; chip: string; hint: string; chart: string }
> = {
  Needs: {
    color: "from-sky-600 to-blue-700",
    bar: "bg-sky-600 dark:bg-sky-400",
    chip: "bg-sky-100 text-sky-900 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800",
    hint: "Housing, groceries, utilities, minimums",
    chart: "#0284c7",
  },
  Wants: {
    color: "from-violet-600 to-purple-700",
    bar: "bg-violet-600 dark:bg-violet-400",
    chip: "bg-violet-100 text-violet-900 border border-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-800",
    hint: "Dining, subscriptions, fun money",
    chart: "#7c3aed",
  },
  Savings: {
    color: "from-emerald-600 to-teal-700",
    bar: "bg-emerald-600 dark:bg-emerald-400",
    chip: "bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800",
    hint: "Emergency fund, investing, sinking funds",
    chart: "#059669",
  },
  Debt: {
    color: "from-amber-600 to-orange-700",
    bar: "bg-amber-600 dark:bg-amber-400",
    chip: "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
    hint: "Extra payments, snowball/avalanche",
    chart: "#d97706",
  },
};

const GROUP_ORDER_DEFAULT: ExpenseGroup[] = ["Needs", "Wants", "Savings", "Debt"];

export function bucketOrderForGoal(goal: BudgetGoal): ExpenseGroup[] {
  switch (goal) {
    case "debt":
      return ["Debt", "Needs", "Savings", "Wants"];
    case "save":
      return ["Savings", "Needs", "Debt", "Wants"];
    case "organize":
    case "exploring":
    default:
      return GROUP_ORDER_DEFAULT;
  }
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function formatBudgetMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatBudgetPct(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n * 100)}%`;
}

export function monthlyFromAnnual(annual: number) {
  return Math.round(Math.max(0, annual) / 12);
}

export function computeBudgetTotals(
  incomeMonthly: number,
  bufferPct: number,
  items: BudgetExpenseItem[]
): BudgetTotals {
  const byGroup: Record<ExpenseGroup, number> = { Needs: 0, Wants: 0, Savings: 0, Debt: 0 };
  for (const it of items) byGroup[it.group] += Number(it.amountMonthly) || 0;
  const planned = byGroup.Needs + byGroup.Wants + byGroup.Savings + byGroup.Debt;
  const buffer = incomeMonthly * clamp(bufferPct, 0, 0.25);
  const available = incomeMonthly - buffer;
  const remaining = available - planned;
  return { byGroup, planned, buffer, available, remaining };
}

export function computeBudgetTargets(available: number, mode: BudgetMode): BudgetTargets | null {
  if (mode !== "50-30-20") return null;
  return {
    needs: available * 0.5,
    wants: available * 0.3,
    savingsDebt: available * 0.2,
  };
}

export function computeBudgetScore(mode: BudgetMode, totals: BudgetTotals, targets: BudgetTargets | null): number {
  const available = Math.max(1, totals.available);

  if (mode === "zero-based") {
    const gap = Math.abs(totals.remaining);
    const gapRatio = gap / available;
    const overPenalty = totals.remaining < 0 ? Math.min(0.35, Math.abs(totals.remaining) / available) : 0;
    return clamp(1 - clamp(gapRatio, 0, 0.35) - overPenalty, 0, 1);
  }

  if (!targets) return 0.5;

  const savingsDebtActual = totals.byGroup.Savings + totals.byGroup.Debt;
  const needsDelta = Math.abs(totals.byGroup.Needs - targets.needs) / available;
  const wantsDelta = Math.abs(totals.byGroup.Wants - targets.wants) / available;
  const savingsDelta = Math.abs(savingsDebtActual - targets.savingsDebt) / available;
  const drift = (needsDelta + wantsDelta + savingsDelta) / 3;
  const remPenalty = totals.remaining < 0 ? Math.min(0.25, Math.abs(totals.remaining) / available) : 0;
  return clamp(1 - clamp(drift + remPenalty, 0, 1), 0, 1);
}

export function scoreExplanation(mode: BudgetMode): string {
  if (mode === "zero-based") {
    return "Zero-based score rewards assigning every dollar — remaining near $0 scores highest; going over budget lowers it.";
  }
  return "50/30/20 score measures how close Needs, Wants, and Savings+Debt are to target splits, plus whether you stay within available cash.";
}

export function computeBudgetJourneyMetrics(a: BudgetJourneyAnswers) {
  const bufferPct = clamp(a.bufferPct, 0, 0.25);
  const income = Math.max(0, a.incomeMonthly);
  const bufferMonthly = income * bufferPct;
  const available = income - bufferMonthly;
  const targets = computeBudgetTargets(available, a.mode);
  return { bufferMonthly, available, targets, bufferPct };
}

export function uid() {
  try {
    // Prefer secure UUID when available
    // @ts-ignore runtime check
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      // @ts-ignore
      return (crypto as any).randomUUID();
    }
  } catch {
    /* fall through to fallback */
  }
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function buildGoalAwareStarterItems(
  goal: BudgetGoal,
  incomeMonthly: number,
  bufferPct: number,
  mode: BudgetMode
): BudgetExpenseItem[] {
  const { available } = computeBudgetTotals(incomeMonthly, bufferPct, []);
  const targets = computeBudgetTargets(available, mode);
  const t = targets ?? {
    needs: available * 0.5,
    wants: available * 0.3,
    savingsDebt: available * 0.2,
  };

  const mk = (name: string, group: ExpenseGroup, amount: number): BudgetExpenseItem => ({
    id: uid(),
    name,
    group,
    amountMonthly: Math.max(0, Math.round(amount)),
  });

  const needsItems = [
    mk("Housing", "Needs", t.needs * 0.55),
    mk("Groceries", "Needs", t.needs * 0.2),
    mk("Utilities & transport", "Needs", t.needs * 0.25),
  ];

  const wantsItems = [mk("Dining & fun", "Wants", t.wants * 0.65), mk("Subscriptions", "Wants", t.wants * 0.35)];

  const savingsShare = goal === "debt" ? 0.35 : goal === "save" ? 0.65 : 0.5;
  const debtShare = 1 - savingsShare;
  const savingsItems = [
    mk("Emergency fund", "Savings", t.savingsDebt * savingsShare * 0.45),
    mk("Investing / goals", "Savings", t.savingsDebt * savingsShare * 0.55),
  ];
  const debtItems = [mk("Extra debt payoff", "Debt", t.savingsDebt * debtShare)];

  if (goal === "debt") return [...needsItems, ...debtItems, ...savingsItems, ...wantsItems];
  if (goal === "save") return [...needsItems, ...savingsItems, ...debtItems, ...wantsItems];
  return [...needsItems, ...wantsItems, ...savingsItems, ...debtItems];
}

export function defaultDemoItems(): BudgetExpenseItem[] {
  return [
    { id: uid(), name: "Rent / Mortgage", group: "Needs", amountMonthly: 2100 },
    { id: uid(), name: "Groceries", group: "Needs", amountMonthly: 520 },
    { id: uid(), name: "Utilities", group: "Needs", amountMonthly: 260 },
    { id: uid(), name: "Transport", group: "Needs", amountMonthly: 280 },
    { id: uid(), name: "Dining out", group: "Wants", amountMonthly: 220 },
    { id: uid(), name: "Subscriptions", group: "Wants", amountMonthly: 60 },
    { id: uid(), name: "Emergency fund", group: "Savings", amountMonthly: 300 },
    { id: uid(), name: "Investing", group: "Savings", amountMonthly: 450 },
    { id: uid(), name: "Extra debt payoff", group: "Debt", amountMonthly: 200 },
  ];
}

export type BudgetInsight = {
  id: string;
  title: string;
  body: string;
  emphasis?: boolean;
};

export function buildBudgetInsights(
  goal: BudgetGoal,
  mode: BudgetMode,
  totals: BudgetTotals,
  targets: BudgetTargets | null
): BudgetInsight[] {
  const available = Math.max(0, totals.available);
  const savingsDebt = totals.byGroup.Savings + totals.byGroup.Debt;

  if (mode === "zero-based") {
    const insights: BudgetInsight[] = [
      {
        id: "assign",
        title: "Assign every dollar",
        body:
          totals.remaining > 0
            ? `${formatBudgetMoney(totals.remaining)} still unassigned. Give it a job — savings, debt, or a sinking fund — until remaining is near zero.`
            : totals.remaining < 0
              ? `Over by ${formatBudgetMoney(Math.abs(totals.remaining))}. Trim Wants first, then revisit Needs.`
              : "Every dollar has a job — your zero-based plan is balanced.",
        emphasis: true,
      },
    ];
    if (goal === "debt" && totals.byGroup.Debt < savingsDebt * 0.4) {
      insights.push({
        id: "debt-focus",
        title: "Debt focus",
        body: "You chose debt payoff — consider shifting unassigned cash toward extra debt payments before lifestyle upgrades.",
      });
    }
    if (goal === "save" && totals.byGroup.Savings < savingsDebt * 0.5) {
      insights.push({
        id: "save-focus",
        title: "Savings focus",
        body: "Boost Savings items until they reflect your save-more goal — emergency fund and investing buckets first.",
      });
    }
    return insights;
  }

  const insights: BudgetInsight[] = [];

  if (goal === "debt") {
    insights.push({
      id: "debt-primary",
      title: "Debt payoff path",
      body:
        totals.byGroup.Debt >= (targets?.savingsDebt ?? available * 0.2) * 0.45
          ? "Debt bucket is getting meaningful extra cash — keep minimums in Needs and protect the buffer."
          : "Try allocating more to Debt until extra payments feel substantial vs. minimums alone.",
      emphasis: true,
    });
  } else if (goal === "save") {
    insights.push({
      id: "save-primary",
      title: "Future-you funding",
      body:
        savingsDebt >= available * 0.2
          ? "Savings + debt combined hit the 20% band — strong foundation for your save-more goal."
          : "Aim for at least ~20% of available cash in Savings + Debt until your cushion grows.",
      emphasis: true,
    });
  }

  insights.push({
    id: "safety",
    title: "Safety first",
    body:
      savingsDebt >= available * 0.2
        ? "You’re funding future-you aggressively. Nice."
        : "Consider bumping Savings/Debt until you hit at least ~20% of available cash.",
  });

  insights.push({
    id: "flexibility",
    title: "Flexibility",
    body:
      totals.byGroup.Wants <= available * 0.3
        ? "Wants are under control — you’ll feel less guilt spending."
        : "Wants are heavy. Try trimming one subscription or capping dining for a month.",
  });

  insights.push({
    id: "cashflow",
    title: "Cash flow",
    body:
      totals.remaining >= 0
        ? `You still have ${formatBudgetMoney(totals.remaining)} unassigned. Give it a job: emergency fund, sinking fund, or debt.`
        : `You’re over by ${formatBudgetMoney(Math.abs(totals.remaining))}. Cut Wants first, then renegotiate Needs.`,
  });

  return insights;
}

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export function suggestRelatedTools(
  goal: BudgetGoal,
  totals: BudgetTotals,
  targets: BudgetTargets | null
): RelatedTool[] {
  const available = Math.max(1, totals.available);
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (out.some((t) => t.slug === slug)) return;
    out.push({ slug, name, reason });
  };

  if (goal === "debt" || totals.byGroup.Debt > totals.byGroup.Savings) {
    push("debt-payoff-planner", "Debt Payoff Planner", "Compare snowball vs avalanche with your extra payment.");
    push("loan-calculator", "Loan Calculator", "Model payoff curves and interest saved.");
  }
  if (goal === "save" || totals.byGroup.Savings < available * 0.12) {
    push("emergency-fund-calculator", "Emergency Fund Calculator", "Set a months-of-expenses target and runway.");
    push("investment-calculator", "Investment Calculator", "Project long-term growth from what you free up.");
  }
  if (totals.byGroup.Wants > available * 0.32) {
    push("subscription-spend-audit", "Subscription Audit", "Find recurring leaks in your Wants bucket.");
  }
  if (goal === "organize") {
    push("subscription-spend-audit", "Subscription Audit", "Annualize autopay and spot trim opportunities.");
  }

  return out.slice(0, 3);
}

export function goalResultsHeadline(goal: BudgetGoal, mode: BudgetMode): { title: string; subtitle: string } {
  switch (goal) {
    case "debt":
      return {
        title: "Your debt-focused snapshot",
        subtitle:
          "See available cash after your buffer — then load a debt-weighted starter plan or build buckets line by line.",
      };
    case "save":
      return {
        title: "Your savings-first snapshot",
        subtitle:
          "Targets show how much room you have for future-you — open the planner to assign real line items.",
      };
    case "exploring":
      return {
        title: "Your budget snapshot",
        subtitle:
          mode === "zero-based"
            ? "Zero-based mode: aim to assign every dollar in the full planner."
            : "50/30/20 targets below — open the workspace to make them real.",
      };
    case "organize":
    default:
      return {
        title: "Your budget snapshot",
        subtitle: "Available cash after your buffer — then open the full planner to add real line items and buckets.",
      };
  }
}

export function goalHighlightTarget(
  goal: BudgetGoal,
  targets: BudgetTargets
): "needs" | "wants" | "savingsDebt" | null {
  if (goal === "debt") return "savingsDebt";
  if (goal === "save") return "savingsDebt";
  return null;
}
