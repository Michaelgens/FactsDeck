import type {
  EmergencyFundGoal,
  EmergencyFundJourneyAnswers,
  EmergencyFundPlanMode,
  EssentialCategory,
  EssentialLineItem,
} from "./emergency-fund-journey-types";

export type EfInsight = {
  id: string;
  title: string;
  body: string;
  emphasis?: boolean;
};

export type RelatedTool = {
  slug: string;
  name: string;
  reason: string;
};

export type EfMetrics = {
  runwayMonths: number;
  targetBalance: number;
  gap: number;
  pctOfTarget: number;
  monthsToTarget: number | null;
  targetMonths: number;
  monthlyEssentials: number;
  fullyFunded: boolean;
  runwayShortfallMonths: number;
};

export const GOAL_LABEL: Record<EmergencyFundGoal, string> = {
  essentials: "Cover essentials",
  job_buffer: "Job-loss buffer",
  peace: "Peace of mind",
  exploring: "Exploring",
};

export const PLAN_MODE_LABEL: Record<EmergencyFundPlanMode, string> = {
  runway_math: "Runway math",
  essentials_builder: "Essentials builder",
};

export const CATEGORY_META: Record<
  EssentialCategory,
  { label: string; hint: string; bar: string; chip: string; chart: string }
> = {
  housing: {
    label: "Housing",
    hint: "Rent, mortgage, HOA",
    bar: "bg-sky-600 dark:bg-sky-400",
    chip: "bg-sky-100 text-sky-900 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800",
    chart: "#0284c7",
  },
  food: {
    label: "Food",
    hint: "Groceries, not dining out",
    bar: "bg-emerald-600 dark:bg-emerald-400",
    chip: "bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800",
    chart: "#059669",
  },
  utilities: {
    label: "Utilities",
    hint: "Power, water, internet, phone",
    bar: "bg-amber-600 dark:bg-amber-400",
    chip: "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
    chart: "#d97706",
  },
  transport: {
    label: "Transport",
    hint: "Car payment, gas, transit",
    bar: "bg-violet-600 dark:bg-violet-400",
    chip: "bg-violet-100 text-violet-900 border border-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-800",
    chart: "#7c3aed",
  },
  debt_min: {
    label: "Debt minimums",
    hint: "Required payments only",
    bar: "bg-rose-600 dark:bg-rose-400",
    chip: "bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800",
    chart: "#e11d48",
  },
  other: {
    label: "Other essentials",
    hint: "Insurance, childcare, meds",
    bar: "bg-zinc-600 dark:bg-zinc-400",
    chip: "bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
    chart: "#52525b",
  },
};

const CATEGORY_ORDER: EssentialCategory[] = [
  "housing",
  "food",
  "utilities",
  "transport",
  "debt_min",
  "other",
];

export function categoryOrderForGoal(goal: EmergencyFundGoal): EssentialCategory[] {
  switch (goal) {
    case "job_buffer":
      return ["housing", "food", "debt_min", "utilities", "transport", "other"];
    case "peace":
      return ["housing", "utilities", "food", "transport", "debt_min", "other"];
    default:
      return CATEGORY_ORDER;
  }
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function formatEfMoney(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatEfMonths(n: number) {
  if (!Number.isFinite(n)) return "0 mo";
  if (n === 1) return "1 mo";
  return `${n.toFixed(n < 10 ? 1 : 0)} mo`;
}

export function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function computeEssentialsTotal(
  planMode: EmergencyFundPlanMode,
  monthlyEssentials: number,
  items: EssentialLineItem[]
): number {
  if (planMode === "essentials_builder" && items.length > 0) {
    return items.reduce((s, i) => s + Math.max(0, Number(i.amountMonthly) || 0), 0);
  }
  return Math.max(0, monthlyEssentials);
}

export function computeEmergencyFundJourneyMetrics(a: EmergencyFundJourneyAnswers): EfMetrics {
  return computeEmergencyFundMetrics({
    goal: a.goal,
    planMode: a.planMode,
    monthlyEssentials: a.monthlyEssentials,
    currentFund: a.currentFund,
    monthlyContribution: a.monthlyContribution,
    targetMonths: a.targetMonths,
    essentialItems: [],
  });
}

export function computeEmergencyFundMetrics(input: {
  goal: EmergencyFundGoal;
  planMode: EmergencyFundPlanMode;
  monthlyEssentials: number;
  currentFund: number;
  monthlyContribution: number;
  targetMonths: number;
  essentialItems: EssentialLineItem[];
}): EfMetrics {
  const ess = computeEssentialsTotal(input.planMode, input.monthlyEssentials, input.essentialItems);
  const fund = Math.max(0, input.currentFund);
  const contrib = Math.max(0, input.monthlyContribution);
  const targetMonths = clamp(Math.round(input.targetMonths), 1, 120);

  const runwayMonths = ess > 0 ? fund / ess : 0;
  const targetBalance = ess * targetMonths;
  const gap = Math.max(0, targetBalance - fund);
  const pctOfTarget = targetBalance > 0 ? Math.min(100, (fund / targetBalance) * 100) : 0;

  let monthsToTarget: number | null = null;
  if (gap <= 0) monthsToTarget = 0;
  else if (contrib > 0) monthsToTarget = Math.ceil(gap / contrib);
  else monthsToTarget = null;

  return {
    runwayMonths,
    targetBalance,
    gap,
    pctOfTarget,
    monthsToTarget,
    targetMonths,
    monthlyEssentials: ess,
    fullyFunded: gap <= 0,
    runwayShortfallMonths: Math.max(0, targetMonths - runwayMonths),
  };
}

export function computeResilienceScore(
  goal: EmergencyFundGoal,
  planMode: EmergencyFundPlanMode,
  metrics: EfMetrics,
  monthlyContribution: number,
  lineItemCount: number
): number {
  const funded = clamp(metrics.pctOfTarget / 100, 0, 1);
  const runwayRatio =
    metrics.targetMonths > 0 ? clamp(metrics.runwayMonths / metrics.targetMonths, 0, 1.2) / 1.2 : 0;

  let contributionScore = 1;
  if (metrics.gap > 0) {
    if (monthlyContribution <= 0) contributionScore = 0.2;
    else {
      const months = metrics.monthsToTarget ?? 999;
      const idealMonths = goal === "peace" ? 18 : goal === "job_buffer" ? 12 : 9;
      contributionScore = clamp(1 - (months - idealMonths) / idealMonths, 0.15, 1);
    }
  }

  let builderScore = 1;
  if (planMode === "essentials_builder") {
    builderScore = lineItemCount >= 4 ? 1 : lineItemCount >= 2 ? 0.75 : lineItemCount >= 1 ? 0.5 : 0.25;
  }

  const raw = funded * 0.42 + runwayRatio * 0.28 + contributionScore * 0.18 + builderScore * 0.12;
  return clamp(raw, 0, 1);
}

export function scoreExplanation(goal: EmergencyFundGoal): string {
  switch (goal) {
    case "job_buffer":
      return "Resilience score weights runway vs. your job-loss target, funding progress, and whether contributions close the gap at a realistic pace.";
    case "peace":
      return "Peace-of-mind score favors hitting your target months, steady contributions, and a detailed essentials list if you use builder mode.";
    case "essentials":
      return "Essentials score highlights how much of your must-pay baseline you've banked and how quickly you're closing the gap.";
    default:
      return "Resilience score blends % funded, runway vs. target months, contribution pace, and essentials detail.";
  }
}

export function buildGoalAwareEssentials(
  goal: EmergencyFundGoal,
  monthlyEssentials: number
): EssentialLineItem[] {
  const base = Math.max(1500, monthlyEssentials);
  const mk = (name: string, category: EssentialCategory, share: number): EssentialLineItem => ({
    id: uid(),
    name,
    category,
    amountMonthly: Math.round(base * share),
  });

  const housingShare = goal === "job_buffer" ? 0.42 : 0.38;
  const foodShare = 0.16;
  const utilShare = 0.12;
  const transportShare = goal === "peace" ? 0.1 : 0.14;
  const debtShare = goal === "job_buffer" ? 0.14 : 0.08;
  const otherShare = 1 - housingShare - foodShare - utilShare - transportShare - debtShare;

  return [
    mk("Housing", "housing", housingShare),
    mk("Groceries", "food", foodShare),
    mk("Utilities & phone", "utilities", utilShare),
    mk("Transport", "transport", transportShare),
    mk("Minimum debt payments", "debt_min", debtShare),
    mk("Insurance & other", "other", Math.max(0.05, otherShare)),
  ];
}

export function defaultDemoEssentials(monthlyEssentials = 4500): EssentialLineItem[] {
  return buildGoalAwareEssentials("essentials", monthlyEssentials);
}

export function essentialsByCategory(items: EssentialLineItem[]): Record<EssentialCategory, number> {
  const out: Record<EssentialCategory, number> = {
    housing: 0,
    food: 0,
    utilities: 0,
    transport: 0,
    debt_min: 0,
    other: 0,
  };
  for (const it of items) out[it.category] += Math.max(0, Number(it.amountMonthly) || 0);
  return out;
}

export function buildEmergencyFundInsights(
  goal: EmergencyFundGoal,
  planMode: EmergencyFundPlanMode,
  metrics: EfMetrics,
  monthlyContribution: number,
  lineItemCount: number
): EfInsight[] {
  const insights: EfInsight[] = [];

  if (metrics.fullyFunded) {
    insights.push({
      id: "funded",
      title: "Target reached",
      body:
        goal === "peace"
          ? "You're at or above your cushion target — consider redirecting new savings toward investing or sinking funds."
          : "Your fund meets the target you set. Revisit essentials yearly or after life changes.",
      emphasis: true,
    });
  } else if (metrics.runwayMonths < 1) {
    insights.push({
      id: "critical",
      title: "Runway under 1 month",
      body: `You have about ${formatEfMonths(metrics.runwayMonths)} of essentials covered. Even a small automatic transfer helps break the zero cycle.`,
      emphasis: true,
    });
  } else if (metrics.runwayShortfallMonths > 0) {
    insights.push({
      id: "runway-gap",
      title: "Runway vs. target",
      body: `You're ${formatEfMonths(metrics.runwayMonths)} banked but aiming for ${metrics.targetMonths} mo — about ${formatEfMonths(metrics.runwayShortfallMonths)} short on runway alone.`,
      emphasis: goal === "job_buffer",
    });
  }

  if (goal === "job_buffer" && metrics.targetMonths < 6) {
    insights.push({
      id: "job-target",
      title: "Job search horizon",
      body: "Many planners use 6+ months for job-loss buffers — you can raise target months without changing essentials.",
    });
  }

  if (monthlyContribution <= 0 && metrics.gap > 0) {
    insights.push({
      id: "no-contrib",
      title: "No contribution set",
      body: `Gap is ${formatEfMoney(metrics.gap)} — add a monthly amount to see time-to-target.`,
    });
  } else if (metrics.monthsToTarget != null && metrics.monthsToTarget > 0 && metrics.monthsToTarget <= 12) {
    insights.push({
      id: "pace",
      title: "On a clear path",
      body: `At ${formatEfMoney(monthlyContribution)}/mo you could hit target in ~${metrics.monthsToTarget} months (simple, no interest).`,
    });
  }

  if (planMode === "essentials_builder" && lineItemCount === 0) {
    insights.push({
      id: "builder-empty",
      title: "Essentials builder",
      body: "Load a starter list or add line items — totals sync to your runway math automatically.",
    });
  }

  if (planMode === "runway_math" && metrics.monthlyEssentials >= 8000) {
    insights.push({
      id: "high-essentials",
      title: "High essentials baseline",
      body: "Double-check must-pay vs. nice-to-have — trimming Wants in the Budget Planner can free cash for this fund.",
    });
  }

  return insights.slice(0, 5);
}

export function suggestRelatedTools(
  goal: EmergencyFundGoal,
  metrics: EfMetrics,
  planMode: EmergencyFundPlanMode
): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (out.some((t) => t.slug === slug)) return;
    out.push({ slug, name, reason });
  };

  push("budget-planner", "Budget Planner", "Find cash to fund savings by organizing Needs vs. Wants.");
  if (goal === "job_buffer" || metrics.runwayMonths < 3) {
    push("debt-payoff-planner", "Debt Payoff Planner", "Free minimum-payment headroom before building runway.");
  }
  if (metrics.fullyFunded || goal === "peace") {
    push("investment-calculator", "Investment Calculator", "Project growth once your cushion is solid.");
  }
  if (planMode === "essentials_builder" || metrics.monthlyEssentials > 6000) {
    push("subscription-spend-audit", "Subscription Audit", "Spot recurring costs inflating your essentials.");
  }
  if (metrics.monthsToTarget != null && metrics.monthsToTarget > 18) {
    push("loan-calculator", "Loan Calculator", "See if refinancing frees monthly room for contributions.");
  }

  return out.slice(0, 3);
}

export function goalResultsHeadline(
  goal: EmergencyFundGoal,
  planMode: EmergencyFundPlanMode
): { title: string; subtitle: string } {
  switch (goal) {
    case "job_buffer":
      return {
        title: "Your job-loss runway snapshot",
        subtitle:
          "Bridge between paychecks — open the workspace to tune essentials, target months, and track resilience.",
      };
    case "peace":
      return {
        title: "Your peace-of-mind snapshot",
        subtitle:
          planMode === "essentials_builder"
            ? "Build a line-item essentials list in the full calculator, then watch runway grow."
            : "Runway math shows how long your cushion lasts — refine numbers in the workspace.",
      };
    case "exploring":
      return {
        title: "Your emergency fund snapshot",
        subtitle: "Runway, target balance, and time to goal — open the calculator to model scenarios.",
      };
    case "essentials":
    default:
      return {
        title: "Your essentials cushion snapshot",
        subtitle:
          "Must-pay monthly costs translated into months of runway — load a starter essentials list or edit line by line.",
      };
  }
}

export function runwayStatusLabel(metrics: EfMetrics): { label: string; tone: "good" | "warn" | "critical" } {
  if (metrics.fullyFunded) return { label: "Fully funded", tone: "good" };
  if (metrics.runwayMonths >= metrics.targetMonths) return { label: "Runway at target", tone: "good" };
  if (metrics.runwayMonths >= metrics.targetMonths * 0.5) return { label: "Building momentum", tone: "warn" };
  if (metrics.runwayMonths >= 1) return { label: "Thin cushion", tone: "warn" };
  return { label: "Critical runway", tone: "critical" };
}

export function suggestedMonthlyContribution(metrics: EfMetrics, monthsToReach = 12): number {
  if (metrics.gap <= 0) return 0;
  return Math.ceil(metrics.gap / Math.max(1, monthsToReach));
}
