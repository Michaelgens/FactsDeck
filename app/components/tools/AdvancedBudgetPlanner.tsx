"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  HelpCircle,
  PiggyBank,
  Wallet,
  Sparkles,
  Target,
  Shield,
  Plus,
  Trash2,
  Check,
  Copy,
  Wand2,
  RotateCcw,
} from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import type { BudgetGoal } from "./budget/budget-journey-types";
import { FACTS_DECK_BUDGET_PLANNER } from "./budget/budget-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import BudgetAllocationChart from "./budget/BudgetAllocationChart";
import BudgetRelatedTools from "./budget/BudgetRelatedTools";
import { clearBudgetState, loadBudgetState, saveBudgetState } from "./budget/budget-storage";
import {
  type BudgetExpenseItem,
  type BudgetMode,
  type ExpenseGroup,
  GROUP_META,
  GOAL_LABEL,
  bucketOrderForGoal,
  buildBudgetInsights,
  buildGoalAwareStarterItems,
  computeBudgetScore,
  computeBudgetTargets,
  computeBudgetTotals,
  defaultDemoItems,
  formatBudgetMoney,
  formatBudgetPct,
  monthlyFromAnnual,
  scoreExplanation,
  suggestRelatedTools,
  uid,
} from "./budget/compute-budget-journey-metrics";
import {
  ToolDashboardHeroBackdrop,
  ToolDashboardGridBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
  tdPanelLg,
  tdStatCard,
} from "./tool-dashboard-ui";
import { BUDGET_PLANNER_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

export type BudgetPlannerInitialValues = {
  goal?: BudgetGoal;
  mode?: BudgetMode;
  incomeMonthly?: number;
  bufferPct?: number;
  fromJourney?: boolean;
};

type AdvancedBudgetPlannerProps = {
  initialValues?: BudgetPlannerInitialValues;
  deferWalkthrough?: boolean;
};

function resolveInitialState(initialValues?: BudgetPlannerInitialValues) {
  const saved = typeof window !== "undefined" ? loadBudgetState() : null;

  if (initialValues?.fromJourney) {
    return {
      goal: initialValues.goal ?? "organize",
      mode: initialValues.mode ?? "50-30-20",
      incomeMonthly: initialValues.incomeMonthly ?? 6200,
      bufferPct: initialValues.bufferPct ?? 0.03,
      items: [] as BudgetExpenseItem[],
    };
  }

  if (saved) {
    return {
      goal: saved.goal,
      mode: saved.mode,
      incomeMonthly: saved.incomeMonthly,
      bufferPct: saved.bufferPct,
      items: saved.items,
    };
  }

  return {
    goal: initialValues?.goal ?? "organize",
    mode: initialValues?.mode ?? "50-30-20",
    incomeMonthly: initialValues?.incomeMonthly ?? 6200,
    bufferPct: initialValues?.bufferPct ?? 0.03,
    items: defaultDemoItems(),
  };
}

export default function AdvancedBudgetPlanner({
  initialValues,
  deferWalkthrough = false,
}: AdvancedBudgetPlannerProps = {}) {
  const [hydrated, setHydrated] = useState(false);
  const [goal, setGoal] = useState<BudgetGoal>("organize");
  const [mode, setMode] = useState<BudgetMode>("50-30-20");
  const [incomeMonthly, setIncomeMonthly] = useState(6200);
  const [bufferPct, setBufferPct] = useState(0.03);
  const [items, setItems] = useState<BudgetExpenseItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "budget-planner";

  useEffect(() => {
    const state = resolveInitialState(initialValues);
    setGoal(state.goal as BudgetGoal);
    setMode(state.mode);
    setIncomeMonthly(state.incomeMonthly);
    setBufferPct(state.bufferPct);
    setItems(state.items);
    setHydrated(true);
  }, [initialValues]);

  useEffect(() => {
    if (!hydrated) return;
    saveBudgetState({ goal, mode, incomeMonthly, bufferPct, items });
  }, [hydrated, goal, mode, incomeMonthly, bufferPct, items]);

  useEffect(() => {
    if (!hydrated || deferWalkthrough) return;
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => {
      trackToolEvent(BUDGET_PLANNER_SLUG, "walkthrough_open", undefined, true);
      setTourOpen(true);
    }, 450);
    return () => window.clearTimeout(t);
  }, [deferWalkthrough, hydrated]);

  const totals = useMemo(
    () => computeBudgetTotals(incomeMonthly, bufferPct, items),
    [items, incomeMonthly, bufferPct]
  );
  const targets = useMemo(() => computeBudgetTargets(totals.available, mode), [totals.available, mode]);
  const score = useMemo(() => computeBudgetScore(mode, totals, targets), [mode, totals, targets]);
  const insights = useMemo(() => buildBudgetInsights(goal, mode, totals, targets), [goal, mode, totals, targets]);
  const relatedTools = useMemo(
    () => suggestRelatedTools(goal, totals, targets),
    [goal, totals, targets]
  );
  const bucketOrder = useMemo(() => bucketOrderForGoal(goal), [goal]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      trackToolEvent(
        BUDGET_PLANNER_SLUG,
        "session_telemetry",
        {
          goal,
          mode,
          score: Math.round(score * 100),
          lineItemCount: items.length,
          incomeMonthly,
          remaining: Math.round(totals.remaining),
          overBudget: totals.remaining < 0,
          balancedZeroBased: mode === "zero-based" && Math.abs(totals.remaining) < 50,
        },
        true
      );
    }, 4000);
    return () => window.clearTimeout(t);
  }, [hydrated, goal, mode, score, items.length, incomeMonthly, totals.remaining]);

  const openWalkthrough = () => {
    trackToolEvent(BUDGET_PLANNER_SLUG, "walkthrough_open", undefined, true);
    setTourOpen(true);
  };

  const addItem = (group: ExpenseGroup) => {
    setItems((prev) => [...prev, { id: uid(), name: "", group, amountMonthly: 0 }]);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const updateItem = (id: string, patch: Partial<BudgetExpenseItem>) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const loadStarterPlan = () => {
    trackToolEvent(BUDGET_PLANNER_SLUG, "starter_plan_load");
    setItems(buildGoalAwareStarterItems(goal, incomeMonthly, bufferPct, mode));
  };

  const applyTargetsToBuckets = () => {
    if (mode !== "50-30-20") return;
    trackToolEvent(BUDGET_PLANNER_SLUG, "target_fill");
    setItems((prev) => {
      const t = computeBudgetTotals(incomeMonthly, bufferPct, prev);
      const tTargets = computeBudgetTargets(t.available, mode);
      if (!tTargets) return prev;
      const next = [...prev];
      const addGap = (group: ExpenseGroup, target: number, label: string) => {
        const current = next.filter((i) => i.group === group).reduce((s, i) => s + (i.amountMonthly || 0), 0);
        const gap = Math.round(target - current);
        if (gap > 0) next.push({ id: uid(), name: label, group, amountMonthly: gap });
      };
      addGap("Needs", tTargets.needs, "Gap to needs target");
      addGap("Wants", tTargets.wants, "Gap to wants target");
      const savingsDebt = t.byGroup.Savings + t.byGroup.Debt;
      const sdGap = Math.round(tTargets.savingsDebt - savingsDebt);
      if (sdGap > 0) {
        const bucket: ExpenseGroup = goal === "debt" ? "Debt" : "Savings";
        next.push({ id: uid(), name: "Gap to savings+debt target", group: bucket, amountMonthly: sdGap });
      }
      return next;
    });
  };

  const autoAssignRemainingToSavings = () => {
    if (totals.remaining <= 0) return;
    trackToolEvent(BUDGET_PLANNER_SLUG, "auto_assign_savings");
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        name: "Unassigned cash → savings",
        group: "Savings",
        amountMonthly: Math.round(totals.remaining),
      },
    ]);
  };

  const resetToDemo = () => {
    if (!window.confirm("Reset to demo data? Your saved budget will be replaced.")) return;
    setItems(defaultDemoItems());
    setGoal("organize");
    setMode("50-30-20");
    setIncomeMonthly(6200);
    setBufferPct(0.03);
  };

  const clearSaved = () => {
    if (!window.confirm("Clear saved budget from this browser?")) return;
    clearBudgetState();
    setItems([]);
  };

  const exportPayload = useMemo(
    () => ({
      tool: "Advanced Budget Planner",
      goal,
      goalLabel: GOAL_LABEL[goal],
      mode,
      incomeMonthly,
      bufferPct,
      bufferMonthly: Math.round(totals.buffer),
      availableMonthly: Math.round(totals.available),
      score: Math.round(score * 100),
      totals: {
        needs: Math.round(totals.byGroup.Needs),
        wants: Math.round(totals.byGroup.Wants),
        savings: Math.round(totals.byGroup.Savings),
        debt: Math.round(totals.byGroup.Debt),
        planned: Math.round(totals.planned),
        remaining: Math.round(totals.remaining),
      },
      items: items.map((i) => ({
        name: i.name || "(unnamed)",
        group: i.group,
        amountMonthly: Math.round(i.amountMonthly || 0),
        annualEquivalent: Math.round((i.amountMonthly || 0) * 12),
      })),
      createdAt: new Date().toISOString(),
    }),
    [goal, mode, incomeMonthly, bufferPct, totals, score, items]
  );

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    trackToolEvent(BUDGET_PLANNER_SLUG, "export_json");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const walkthroughSteps: WalkthroughStep[] = useMemo(
    () => [
      {
        id: "welcome",
        placement: "center",
        title: "Welcome to the workspace",
        body: (
          <div className="space-y-3">
            <p>
              If you completed the <strong>Facts Deck Budget Test</strong>, your income, buffer, goal, and style are
              pre-filled. Buckets start empty — load a starter plan or add line items yourself.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from the Walk-through button.</p>
          </div>
        ),
      },
      {
        id: "top-stats",
        target: "[data-tour='budget-stats']",
        title: "Top cards: income, available, remaining",
        body: (
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Monthly income</strong>: use after‑tax if you can.
            </li>
            <li>
              <strong>Available</strong>: income minus your buffer.
            </li>
            <li>
              <strong>Remaining</strong>: what’s left after all your items.
            </li>
          </ul>
        ),
      },
      {
        id: "chart",
        target: "[data-tour='budget-chart']",
        title: "Allocation chart",
        body: <p>See bucket totals, targets, and a donut breakdown at a glance.</p>,
      },
      {
        id: "style",
        target: "[data-tour='budget-style']",
        title: "Budget style: 50/30/20 vs zero‑based",
        body: (
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>50 / 30 / 20</strong>: aim for target splits; use “Fill gaps to targets”.
            </li>
            <li>
              <strong>Zero‑based</strong>: assign every dollar; use “Auto-assign to savings”.
            </li>
          </ul>
        ),
      },
      {
        id: "buckets",
        target: "[data-tour='budget-buckets']",
        title: "Color-coded buckets",
        body: <p>Each bucket has monthly and annual fields. Annual amounts auto-convert to monthly.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: <p>Your budget autosaves in this browser. Export JSON anytime for backup.</p>,
      },
    ],
    []
  );

  const headerStat = (label: string, value: string, sub?: string) => (
    <div className={tdStatCard}>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{value}</p>
      {sub ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{sub}</p> : null}
    </div>
  );

  const bar = (value: number, max: number, barClass: string) => {
    const w = `${Math.round(Math.min(1, max <= 0 ? 0 : value / max) * 100)}%`;
    return (
      <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: w }} />
      </div>
    );
  };

  if (!hydrated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500 text-sm">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className={tdPage}>
      <ToolDashboardGridBackdrop />
      <ToolWalkthrough
        id={TOUR_ID}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
          trackToolEvent(BUDGET_PLANNER_SLUG, "walkthrough_complete", undefined, true);
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        }}
        steps={walkthroughSteps}
      />
      <section className={tdHero}>
        <ToolDashboardHeroBackdrop />

        <div className={tdHeroInner}>
          <div className="flex items-center justify-between gap-3" data-tour="budget-top-nav">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/post?category=Personal%20Finance&q=budget" className={tdNavLink}>
              Read budgeting guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className={tdIconTile}>
                  <Wallet className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-cyan-300 dark:to-sky-300">
                      {FACTS_DECK_BUDGET_PLANNER}
                    </span>
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    <span className="hidden sm:inline"><strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — buffer, buckets, and a clear "what next".</span>
                    <span className="sm:hidden">Focus: <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — plan & save</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={openWalkthrough} className={tdGhostBtn}>
                  <BookOpen className="h-4 w-4" />
                  Walk-through
                </button>
                {items.length === 0 ? (
                  <button type="button" onClick={loadStarterPlan} className={tdGhostBtn}>
                    <Wand2 className="h-4 w-4" />
                    Load starter plan
                  </button>
                ) : null}
              </div>

              <div className="mt-6">
                <ToolDashboardTestCta toolSlug="budget-planner" testLabel={FACTS_DECK_BUDGET_PLANNER} />
              </div>

              <div
                className="mt-5 sm:mt-6 grid grid-cols-2 grid-rows-2 gap-3 sm:grid-cols-3 sm:grid-rows-1"
                data-tour="budget-stats"
              >
                <div className="col-span-1">{headerStat("Monthly income", formatBudgetMoney(incomeMonthly), "After-tax is best")}</div>
                <div className="col-span-1">
                  {headerStat(
                    "Available (after buffer)",
                    formatBudgetMoney(totals.available),
                    `${formatBudgetPct(bufferPct)} buffer = ${formatBudgetMoney(totals.buffer)}`
                  )}
                </div>
                <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-1 sm:col-start-3 flex justify-center sm:justify-normal">
                  {headerStat(
                    "Remaining",
                    formatBudgetMoney(totals.remaining),
                    mode === "zero-based"
                      ? totals.remaining >= 0
                        ? "Assign until near $0"
                        : "Over budget"
                      : totals.remaining >= 0
                        ? "Unassigned cash"
                        : "Over budget"
                  )}
                </div>
              </div>
            </div>

            <div className={tdPanelLg} data-tour="budget-style">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  Budget style
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                  title={scoreExplanation(mode)}
                >
                  Score {Math.round(score * 100)}
                  <HelpCircle className="h-3.5 w-3.5 opacity-60" aria-label={scoreExplanation(mode)} />
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">{scoreExplanation(mode)}</p>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
                  Focus
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as BudgetGoal)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {(Object.keys(GOAL_LABEL) as BudgetGoal[]).map((g) => (
                    <option key={g} value={g}>
                      {GOAL_LABEL[g]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["50-30-20", "zero-based"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-3 py-2 rounded-2xl text-sm font-semibold border transition-colors ${
                      mode === m
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {m === "50-30-20" ? "50 / 30 / 20" : "Zero-based"}
                  </button>
                ))}
              </div>

              <div className="mt-4" data-tour="budget-income">
                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Income (monthly)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={incomeMonthly}
                  onChange={(e) => setIncomeMonthly(Number(e.target.value))}
                  className="mt-1 w-full px-4 py-2 rounded-2xl border border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div className="mt-4" data-tour="budget-buffer">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Buffer (for “life happens”)
                  </label>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    {formatBudgetPct(bufferPct)} · {formatBudgetMoney(totals.buffer)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.12}
                  step={0.005}
                  value={bufferPct}
                  onChange={(e) => setBufferPct(Number(e.target.value))}
                  className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
                  <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                  A small buffer keeps you from “budget whiplash” when bills fluctuate.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {mode === "50-30-20" && targets ? (
                  <button type="button" onClick={applyTargetsToBuckets} className={`${tdGhostBtn} w-full`}>
                    <Target className="h-4 w-4" />
                    Fill gaps to targets
                  </button>
                ) : null}
                {mode === "zero-based" && totals.remaining > 0 ? (
                  <button type="button" onClick={autoAssignRemainingToSavings} className={`${tdGhostBtn} w-full`}>
                    <PiggyBank className="h-4 w-4" />
                    Auto-assign remaining to savings
                  </button>
                ) : null}
                <button type="button" onClick={copyJson} className={`${tdGhostBtn} w-full`} data-tour="budget-copy-json">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied budget JSON" : "Copy budget JSON"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={resetToDemo} className={`${tdGhostBtn} text-xs`}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Demo data
                  </button>
                  <button type="button" onClick={clearSaved} className={`${tdGhostBtn} text-xs`}>
                    Clear saved
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="lg:col-span-2 space-y-6" data-tour="budget-buckets">
              <div data-tour="budget-chart">
                <BudgetAllocationChart totals={totals} targets={targets} mode={mode} />
              </div>

              {bucketOrder.map((group) => {
                const list = items.filter((i) => i.group === group);
                const total = totals.byGroup[group];
                const meta = GROUP_META[group];
                const savingsDebtActual = totals.byGroup.Savings + totals.byGroup.Debt;
                const target =
                  mode === "50-30-20" && targets
                    ? group === "Needs"
                      ? targets.needs
                      : group === "Wants"
                        ? targets.wants
                        : group === "Savings" || group === "Debt"
                          ? null
                          : undefined
                    : undefined;

                return (
                  <section
                    key={group}
                    className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                    data-tour="budget-bucket-card"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${meta.chip}`}>
                            {group}
                          </span>
                          <span className="text-sm text-zinc-600 dark:text-zinc-300 truncate">{meta.hint}</span>
                        </div>
                        <div className="mt-2 flex items-end gap-3">
                          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{formatBudgetMoney(total)}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {totals.available > 0 ? formatBudgetPct(total / totals.available) : "0%"} of available
                          </p>
                        </div>
                        <div className="mt-2">{bar(total, totals.available, meta.bar)}</div>
                        {mode === "50-30-20" && target != null && (
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Target: {formatBudgetMoney(target)}</p>
                        )}
                        {mode === "50-30-20" && (group === "Savings" || group === "Debt") && targets && (
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Combined Savings + Debt target: {formatBudgetMoney(targets.savingsDebt)} (currently{" "}
                            {formatBudgetMoney(savingsDebtActual)})
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem(group)}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                        data-tour="budget-add-item"
                      >
                        <Plus className="h-4 w-4" />
                        Add item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {list.map((it) => (
                        <div
                          key={it.id}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_7rem_7rem_2.75rem] gap-2 items-center rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                          data-tour="budget-item-row"
                        >
                          <input
                            value={it.name}
                            onChange={(e) => updateItem(it.id, { name: e.target.value })}
                            placeholder="e.g. Car insurance (sinking fund)"
                            aria-label={`${group} item name`}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                          <div>
                            <label className="sr-only">Monthly amount</label>
                            <input
                              type="number"
                              min={0}
                              step={10}
                              value={Number.isFinite(it.amountMonthly) ? it.amountMonthly : 0}
                              onChange={(e) => updateItem(it.id, { amountMonthly: Number(e.target.value) })}
                              aria-label={`${it.name || group} monthly amount`}
                              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-right font-mono dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-500">/ mo</span>
                          </div>
                          <div>
                            <label className="sr-only">Annual amount</label>
                            <input
                              type="number"
                              min={0}
                              step={120}
                              value={Math.round((it.amountMonthly || 0) * 12)}
                              onChange={(e) =>
                                updateItem(it.id, { amountMonthly: monthlyFromAnnual(Number(e.target.value)) })
                              }
                              aria-label={`${it.name || group} annual amount`}
                              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-right font-mono dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-500">/ yr</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/40"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {list.length === 0 && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          No items yet. Add one or load a starter plan above.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            <aside className="space-y-6">
              <div
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                data-tour="budget-insights"
              >
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  What this budget says
                </p>
                <div className="mt-4 space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={insight.emphasis ? "rounded-xl bg-zinc-50 dark:bg-zinc-950/80 p-3 border border-zinc-100 dark:border-zinc-800" : ""}
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {insight.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{insight.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <BudgetRelatedTools tools={relatedTools} />

              <div
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                data-tour="budget-sinking"
              >
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  Sinking funds (quick add)
                </p>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                  Annual bill? We add the monthly slice to Savings automatically.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { name: "Car insurance", yearly: 1200 },
                    { name: "Gifts & holidays", yearly: 600 },
                    { name: "Car maintenance", yearly: 900 },
                    { name: "Travel", yearly: 1500 },
                  ].map((x) => (
                    <button
                      key={x.name}
                      type="button"
                      onClick={() =>
                        setItems((prev) => [
                          ...prev,
                          {
                            id: uid(),
                            name: `${x.name} sinking fund`,
                            group: "Savings",
                            amountMonthly: monthlyFromAnnual(x.yearly),
                          },
                        ])
                      }
                      className="text-left rounded-2xl border border-zinc-200 bg-white p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
                    >
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{x.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        ~{formatBudgetMoney(monthlyFromAnnual(x.yearly))}/mo
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
