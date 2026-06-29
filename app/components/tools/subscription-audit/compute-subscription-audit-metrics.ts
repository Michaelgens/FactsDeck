import type { SubscriptionAuditGoal, SubscriptionAuditMode, SubscriptionJourneyAnswers } from "./subscription-audit-journey-types";

export type SubscriptionCategory =
  | "Streaming"
  | "Software & apps"
  | "Fitness"
  | "News & learning"
  | "Food & delivery"
  | "Cloud & storage"
  | "Other";

export type SubscriptionLine = {
  id: string;
  name: string;
  amountMonthly: number;
  category: SubscriptionCategory;
};

export type SubInsight = {
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

export type SubJourneyMetrics = {
  monthly: number;
  annual: number;
  daily: number;
  subscriptionCount: number;
  avgPerSub: number;
  cut10Annual: number;
  cut15Annual: number;
  cut25Annual: number;
  targetTrimAnnual: number;
  targetTrimMonthly: number;
  targetTrimPercent: number;
};

export type SubWorkspaceMetrics = {
  monthly: number;
  annual: number;
  daily: number;
  lineCount: number;
  avgPerLine: number;
  trimMonthly: number;
  trimAnnual: number;
  byCategory: Partial<Record<SubscriptionCategory, number>>;
  topCategory: SubscriptionCategory | null;
  duplicateCategories: SubscriptionCategory[];
};

export const SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] = [
  "Streaming",
  "Software & apps",
  "Fitness",
  "News & learning",
  "Food & delivery",
  "Cloud & storage",
  "Other",
];

export const GOAL_LABEL: Record<SubscriptionAuditGoal, string> = {
  leaks: "Find leaks",
  cut: "Cut costs",
  exploring: "Exploring",
};

export const MODE_LABEL: Record<SubscriptionAuditMode, string> = {
  quick_estimate: "Quick estimate",
  line_item_audit: "Line-item audit",
};

export const CATEGORY_META: Record<
  SubscriptionCategory,
  { hint: string; bar: string; chip: string; chart: string }
> = {
  Streaming: {
    hint: "Video, music, live TV",
    bar: "bg-rose-600 dark:bg-rose-400",
    chip: "bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800",
    chart: "#e11d48",
  },
  "Software & apps": {
    hint: "SaaS, creative tools, AI",
    bar: "bg-violet-600 dark:bg-violet-400",
    chip: "bg-violet-100 text-violet-900 border border-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-800",
    chart: "#7c3aed",
  },
  Fitness: {
    hint: "Gym, classes, wearables",
    bar: "bg-emerald-600 dark:bg-emerald-400",
    chip: "bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800",
    chart: "#059669",
  },
  "News & learning": {
    hint: "News, courses, audiobooks",
    bar: "bg-sky-600 dark:bg-sky-400",
    chip: "bg-sky-100 text-sky-900 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800",
    chart: "#0284c7",
  },
  "Food & delivery": {
    hint: "Meal kits, delivery passes",
    bar: "bg-amber-600 dark:bg-amber-400",
    chip: "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
    chart: "#d97706",
  },
  "Cloud & storage": {
    hint: "Backup, photos, hosting",
    bar: "bg-cyan-600 dark:bg-cyan-400",
    chip: "bg-cyan-100 text-cyan-900 border border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-200 dark:border-cyan-800",
    chart: "#0891b2",
  },
  Other: {
    hint: "Insurance, memberships, misc",
    bar: "bg-zinc-600 dark:bg-zinc-400",
    chip: "bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
    chart: "#52525b",
  },
};

export function categoryOrderForGoal(goal: SubscriptionAuditGoal): SubscriptionCategory[] {
  switch (goal) {
    case "cut":
      return ["Streaming", "Software & apps", "Food & delivery", "Fitness", "News & learning", "Cloud & storage", "Other"];
    case "leaks":
      return ["Software & apps", "Streaming", "Cloud & storage", "Fitness", "News & learning", "Food & delivery", "Other"];
    default:
      return SUBSCRIPTION_CATEGORIES;
  }
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function formatSubMoney(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function monthlyFromAnnual(annual: number) {
  return Math.round(Math.max(0, annual) / 12);
}

export function totalMonthlyFromLines(lines: Pick<SubscriptionLine, "amountMonthly">[]) {
  return lines.reduce((s, l) => s + Math.max(0, Number(l.amountMonthly) || 0), 0);
}

export function computeSubscriptionJourneyMetrics(a: SubscriptionJourneyAnswers): SubJourneyMetrics {
  const monthly = Math.max(0, a.estimatedMonthlyRecurring);
  const annual = monthly * 12;
  const daily = monthly / 30;
  const count = Math.max(0, Math.round(a.subscriptionCount));
  const avgPerSub = count > 0 ? monthly / count : 0;
  const trimPct = clamp(a.targetTrimPercent, 0, 50) / 100;

  return {
    monthly,
    annual,
    daily,
    subscriptionCount: count,
    avgPerSub,
    cut10Annual: annual * 0.1,
    cut15Annual: annual * 0.15,
    cut25Annual: annual * 0.25,
    targetTrimPercent: Math.round(trimPct * 100),
    targetTrimMonthly: monthly * trimPct,
    targetTrimAnnual: annual * trimPct,
  };
}

export function computeWorkspaceMetrics(lines: SubscriptionLine[], trimPercent: number): SubWorkspaceMetrics {
  const monthly = totalMonthlyFromLines(lines);
  const annual = monthly * 12;
  const daily = monthly / 30;
  const lineCount = lines.length;
  const avgPerLine = lineCount > 0 ? monthly / lineCount : 0;
  const trimPct = clamp(trimPercent, 0, 50) / 100;
  const trimMonthly = monthly * trimPct;
  const trimAnnual = trimMonthly * 12;

  const byCategory: Partial<Record<SubscriptionCategory, number>> = {};
  for (const l of lines) {
    byCategory[l.category] = (byCategory[l.category] ?? 0) + Math.max(0, Number(l.amountMonthly) || 0);
  }

  let topCategory: SubscriptionCategory | null = null;
  let topAmt = 0;
  for (const c of SUBSCRIPTION_CATEGORIES) {
    const v = byCategory[c] ?? 0;
    if (v > topAmt) {
      topAmt = v;
      topCategory = c;
    }
  }

  const duplicateCategories = SUBSCRIPTION_CATEGORIES.filter(
    (c) => lines.filter((l) => l.category === c && (l.amountMonthly || 0) > 0).length >= 2
  );

  return {
    monthly,
    annual,
    daily,
    lineCount,
    avgPerLine,
    trimMonthly,
    trimAnnual,
    byCategory,
    topCategory,
    duplicateCategories,
  };
}

export function computeAwarenessScore(
  goal: SubscriptionAuditGoal,
  mode: SubscriptionAuditMode,
  metrics: SubWorkspaceMetrics,
  trimPercent: number,
  journeyCount?: number
): number {
  const namedLines = metrics.lineCount;
  const coverage =
    journeyCount && journeyCount > 0
      ? clamp(namedLines / journeyCount, 0, 1.2) / 1.2
      : clamp(namedLines / 6, 0, 1);

  const detailScore = mode === "line_item_audit" ? coverage : namedLines >= 1 ? 0.6 : 0.3;
  const trimScore =
    goal === "cut"
      ? clamp(trimPercent / 25, 0, 1)
      : goal === "leaks"
        ? clamp(trimPercent / 15, 0, 1)
        : 0.7;

  const categoryScore = metrics.lineCount >= 3 ? 1 : metrics.lineCount >= 1 ? 0.55 : 0.2;
  const burnPenalty = metrics.monthly > 400 ? 0.85 : metrics.monthly > 250 ? 0.92 : 1;

  const raw = detailScore * 0.45 + trimScore * 0.2 + categoryScore * 0.25 + (metrics.monthly > 0 ? 0.1 : 0);
  return clamp(raw * burnPenalty, 0, 1);
}

export function scoreExplanation(goal: SubscriptionAuditGoal): string {
  switch (goal) {
    case "cut":
      return "Awareness score rewards naming each charge, setting a meaningful trim %, and splitting autopay into categories you can actually cancel.";
    case "leaks":
      return "Leak-finder score favors a detailed line list vs. your rough count — visibility beats perfection.";
    default:
      return "Awareness score blends how many subs you've named, category coverage, and whether you've set a trim scenario.";
  }
}

export function buildGoalAwareStarterLines(
  goal: SubscriptionAuditGoal,
  monthlyTotal: number
): SubscriptionLine[] {
  const base = Math.max(80, monthlyTotal);
  const mk = (name: string, category: SubscriptionCategory, share: number): SubscriptionLine => ({
    id: uid(),
    name,
    category,
    amountMonthly: Math.round(base * share),
  });

  if (goal === "cut") {
    return [
      mk("Streaming bundle", "Streaming", 0.22),
      mk("Music", "Streaming", 0.08),
      mk("Productivity SaaS", "Software & apps", 0.28),
      mk("Cloud backup", "Cloud & storage", 0.06),
      mk("Gym / fitness", "Fitness", 0.2),
      mk("Delivery pass", "Food & delivery", 0.16),
    ];
  }

  return [
    mk("Primary streaming", "Streaming", 0.18),
    mk("Music", "Streaming", 0.07),
    mk("Phone cloud", "Cloud & storage", 0.05),
    mk("Work software", "Software & apps", 0.32),
    mk("News / learning", "News & learning", 0.12),
    mk("Misc membership", "Other", 0.26),
  ];
}

export function defaultDemoLines(): SubscriptionLine[] {
  return [
    { id: uid(), name: "Streaming", amountMonthly: 22, category: "Streaming" },
    { id: uid(), name: "Music", amountMonthly: 11, category: "Streaming" },
    { id: uid(), name: "Cloud storage", amountMonthly: 3, category: "Cloud & storage" },
    { id: uid(), name: "Software", amountMonthly: 35, category: "Software & apps" },
    { id: uid(), name: "Gym / fitness app", amountMonthly: 40, category: "Fitness" },
  ];
}

export function buildSubscriptionInsights(
  goal: SubscriptionAuditGoal,
  metrics: SubWorkspaceMetrics,
  trimPercent: number,
  journeyCount?: number
): SubInsight[] {
  const insights: SubInsight[] = [];

  if (metrics.monthly <= 0) {
    insights.push({
      id: "empty",
      title: "Start naming charges",
      body: "Add rows or load a starter list — autopay stays invisible until each charge has a name.",
      emphasis: true,
    });
    return insights;
  }

  insights.push({
    id: "annual-shock",
    title: "Annual autoplay",
    body: `${formatSubMoney(metrics.monthly)}/mo becomes ${formatSubMoney(metrics.annual)}/yr — that's the number worth putting on a sticky note.`,
    emphasis: goal === "leaks",
  });

  if (metrics.topCategory && (metrics.byCategory[metrics.topCategory] ?? 0) > metrics.monthly * 0.35) {
    insights.push({
      id: "top-cat",
      title: "Biggest bucket",
      body: `${metrics.topCategory} is ${Math.round(((metrics.byCategory[metrics.topCategory] ?? 0) / metrics.monthly) * 100)}% of recurring — a natural place to negotiate or consolidate.`,
      emphasis: goal === "cut",
    });
  }

  if (metrics.duplicateCategories.length > 0) {
    insights.push({
      id: "dupes",
      title: "Stacked categories",
      body: `Multiple charges in ${metrics.duplicateCategories.join(", ")} — classic leak territory (overlapping streaming or SaaS).`,
    });
  }

  if (journeyCount && metrics.lineCount < journeyCount * 0.5) {
    insights.push({
      id: "under-count",
      title: "Still hiding subs?",
      body: `You estimated ~${journeyCount} active subs but only listed ${metrics.lineCount} lines — add the forgotten ones.`,
    });
  }

  if (trimPercent > 0) {
    insights.push({
      id: "trim",
      title: "Trim scenario",
      body: `At ${trimPercent}% you'd free ~${formatSubMoney(metrics.trimMonthly)}/mo (${formatSubMoney(metrics.trimAnnual)}/yr) — redirect to savings or debt if you follow through.`,
    });
  }

  if (metrics.monthly > 300) {
    insights.push({
      id: "high-burn",
      title: "High recurring load",
      body: "Over $300/mo in autopay is worth a quarterly re-audit — prices creep via annual renewals.",
    });
  }

  return insights.slice(0, 5);
}

export function suggestRelatedTools(goal: SubscriptionAuditGoal, metrics: SubWorkspaceMetrics): RelatedTool[] {
  const out: RelatedTool[] = [];
  const push = (slug: string, name: string, reason: string) => {
    if (out.some((t) => t.slug === slug)) return;
    out.push({ slug, name, reason });
  };

  push("budget-planner", "Budget Planner", "Slot trimmed recurring into Wants vs. Savings buckets.");
  if (goal === "cut" || metrics.monthly > 200) {
    push("emergency-fund-calculator", "Emergency Fund Calculator", "Redirect savings from canceled subs into runway.");
  }
  if (metrics.byCategory["Software & apps"] && (metrics.byCategory["Software & apps"] ?? 0) > 40) {
    push("debt-payoff-planner", "Debt Payoff Planner", "Free cash flow for debt if SaaS stack gets leaner.");
  }
  if (goal === "leaks") {
    push("investment-calculator", "Investment Calculator", "See long-term growth if recurring leaks become investing.");
  }

  return out.slice(0, 3);
}

export function goalResultsHeadline(goal: SubscriptionAuditGoal): { title: string; subtitle: string } {
  switch (goal) {
    case "cut":
      return {
        title: "Your cut-ready recurring snapshot",
        subtitle: "Annualized autopay and trim targets — open the audit to name each charge and export JSON.",
      };
    case "leaks":
      return {
        title: "Your recurring leak snapshot",
        subtitle: "Quiet monthly charges, loud yearly totals — build a line-item list in the workspace.",
      };
    case "exploring":
    default:
      return {
        title: "Your recurring spend snapshot",
        subtitle: "Ballpark monthly load annualized — refine with real names in the full audit.",
      };
  }
}

export function burnStatusLabel(metrics: SubWorkspaceMetrics): { label: string; tone: "calm" | "watch" | "hot" } {
  if (metrics.monthly >= 350) return { label: "High autopay load", tone: "hot" };
  if (metrics.monthly >= 180) return { label: "Worth a trim pass", tone: "watch" };
  return { label: "Moderate recurring", tone: "calm" };
}

export function recurringBucket(monthly: number): string {
  if (monthly < 50) return "under_50";
  if (monthly < 150) return "50_150";
  if (monthly < 300) return "150_300";
  return "300_plus";
}

export function subscriptionCountBucket(count: number): string {
  if (count <= 5) return "1_5";
  if (count <= 10) return "6_10";
  if (count <= 15) return "11_15";
  return "16_plus";
}
