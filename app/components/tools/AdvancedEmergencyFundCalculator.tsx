"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  HelpCircle,
  Plus,
  RotateCcw,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Umbrella,
  Wand2,
} from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import {
  EMERGENCY_FUND_JOURNEY_DEFAULTS,
  FACTS_DECK_EMERGENCY_FUND_CALCULATOR,
  type EmergencyFundGoal,
  type EmergencyFundPlanMode,
  type EssentialCategory,
  type EssentialLineItem,
} from "./emergency-fund/emergency-fund-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import EmergencyFundRelatedTools from "./emergency-fund/EmergencyFundRelatedTools";
import EmergencyFundRunwayChart from "./emergency-fund/EmergencyFundRunwayChart";
import {
  clearEmergencyFundState,
  loadEmergencyFundState,
  saveEmergencyFundState,
} from "./emergency-fund/emergency-fund-storage";
import {
  CATEGORY_META,
  GOAL_LABEL,
  PLAN_MODE_LABEL,
  buildEmergencyFundInsights,
  buildGoalAwareEssentials,
  categoryOrderForGoal,
  clamp,
  computeEmergencyFundMetrics,
  computeResilienceScore,
  defaultDemoEssentials,
  formatEfMoney,
  scoreExplanation,
  suggestRelatedTools,
  suggestedMonthlyContribution,
  uid,
} from "./emergency-fund/compute-emergency-fund-journey-metrics";
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
import { EMERGENCY_FUND_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

export type EmergencyFundCalculatorInitialValues = {
  goal?: EmergencyFundGoal;
  planMode?: EmergencyFundPlanMode;
  monthlyEssentials?: number;
  currentFund?: number;
  monthlyContribution?: number;
  targetMonths?: number;
  fromJourney?: boolean;
};

type Props = {
  initialValues?: EmergencyFundCalculatorInitialValues;
  deferWalkthrough?: boolean;
};

const TARGET_CHIPS = [3, 6, 9, 12] as const;

function resolveInitialState(initialValues?: EmergencyFundCalculatorInitialValues) {
  const saved = typeof window !== "undefined" ? loadEmergencyFundState() : null;
  const d = EMERGENCY_FUND_JOURNEY_DEFAULTS;

  if (initialValues?.fromJourney) {
    return {
      goal: initialValues.goal ?? d.goal,
      planMode: initialValues.planMode ?? d.planMode,
      monthlyEssentials: initialValues.monthlyEssentials ?? d.monthlyEssentials,
      currentFund: initialValues.currentFund ?? d.currentFund,
      monthlyContribution: initialValues.monthlyContribution ?? d.monthlyContribution,
      targetMonths: initialValues.targetMonths ?? d.targetMonths,
      essentialItems: [] as EssentialLineItem[],
    };
  }

  if (saved) {
    return {
      goal: saved.goal,
      planMode: saved.planMode,
      monthlyEssentials: saved.monthlyEssentials,
      currentFund: saved.currentFund,
      monthlyContribution: saved.monthlyContribution,
      targetMonths: saved.targetMonths,
      essentialItems: saved.essentialItems,
    };
  }

  return {
    goal: initialValues?.goal ?? d.goal,
    planMode: initialValues?.planMode ?? d.planMode,
    monthlyEssentials: initialValues?.monthlyEssentials ?? d.monthlyEssentials,
    currentFund: initialValues?.currentFund ?? d.currentFund,
    monthlyContribution: initialValues?.monthlyContribution ?? d.monthlyContribution,
    targetMonths: initialValues?.targetMonths ?? d.targetMonths,
    essentialItems: defaultDemoEssentials(initialValues?.monthlyEssentials ?? d.monthlyEssentials),
  };
}

export default function AdvancedEmergencyFundCalculator({
  initialValues,
  deferWalkthrough = false,
}: Props = {}) {
  const [hydrated, setHydrated] = useState(false);
  const [goal, setGoal] = useState<EmergencyFundGoal>("essentials");
  const [planMode, setPlanMode] = useState<EmergencyFundPlanMode>("runway_math");
  const [monthlyEssentials, setMonthlyEssentials] = useState(4500);
  const [currentFund, setCurrentFund] = useState(8000);
  const [monthlyContribution, setMonthlyContribution] = useState(400);
  const [targetMonths, setTargetMonths] = useState(6);
  const [essentialItems, setEssentialItems] = useState<EssentialLineItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "emergency-fund-calculator";

  useEffect(() => {
    const state = resolveInitialState(initialValues);
    setGoal(state.goal);
    setPlanMode(state.planMode);
    setMonthlyEssentials(state.monthlyEssentials);
    setCurrentFund(state.currentFund);
    setMonthlyContribution(state.monthlyContribution);
    setTargetMonths(state.targetMonths);
    setEssentialItems(state.essentialItems);
    setHydrated(true);
  }, [initialValues]);

  useEffect(() => {
    if (!hydrated) return;
    saveEmergencyFundState({
      goal,
      planMode,
      monthlyEssentials,
      currentFund,
      monthlyContribution,
      targetMonths,
      essentialItems,
    });
  }, [
    hydrated,
    goal,
    planMode,
    monthlyEssentials,
    currentFund,
    monthlyContribution,
    targetMonths,
    essentialItems,
  ]);

  const metrics = useMemo(
    () =>
      computeEmergencyFundMetrics({
        goal,
        planMode,
        monthlyEssentials,
        currentFund,
        monthlyContribution,
        targetMonths,
        essentialItems,
      }),
    [goal, planMode, monthlyEssentials, currentFund, monthlyContribution, targetMonths, essentialItems]
  );

  const score = useMemo(
    () => computeResilienceScore(goal, planMode, metrics, monthlyContribution, essentialItems.length),
    [goal, planMode, metrics, monthlyContribution, essentialItems.length]
  );

  const insights = useMemo(
    () => buildEmergencyFundInsights(goal, planMode, metrics, monthlyContribution, essentialItems.length),
    [goal, planMode, metrics, monthlyContribution, essentialItems.length]
  );

  const relatedTools = useMemo(
    () => suggestRelatedTools(goal, metrics, planMode),
    [goal, metrics, planMode]
  );

  const catOrder = useMemo(() => categoryOrderForGoal(goal), [goal]);

  useEffect(() => {
    if (!hydrated || deferWalkthrough) return;
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => {
      trackToolEvent(EMERGENCY_FUND_SLUG, "walkthrough_open", undefined, true);
      setTourOpen(true);
    }, 450);
    return () => window.clearTimeout(t);
  }, [deferWalkthrough, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      trackToolEvent(
        EMERGENCY_FUND_SLUG,
        "session_telemetry",
        {
          goal,
          planMode,
          score: Math.round(score * 100),
          runwayMonths: Math.round(metrics.runwayMonths * 10) / 10,
          pctFunded: Math.round(metrics.pctOfTarget),
          lineItemCount: essentialItems.length,
          fullyFunded: metrics.fullyFunded,
          monthlyEssentials: Math.round(metrics.monthlyEssentials),
          targetMonths: metrics.targetMonths,
        },
        true
      );
    }, 4000);
    return () => window.clearTimeout(t);
  }, [
    hydrated,
    goal,
    planMode,
    score,
    metrics.runwayMonths,
    metrics.pctOfTarget,
    metrics.fullyFunded,
    metrics.monthlyEssentials,
    metrics.targetMonths,
    essentialItems.length,
  ]);

  const openWalkthrough = () => {
    trackToolEvent(EMERGENCY_FUND_SLUG, "walkthrough_open", undefined, true);
    setTourOpen(true);
  };

  const loadStarterEssentials = () => {
    trackToolEvent(EMERGENCY_FUND_SLUG, "starter_plan_load");
    const items = buildGoalAwareEssentials(goal, monthlyEssentials);
    setEssentialItems(items);
    setPlanMode("essentials_builder");
  };

  const applySuggestedContribution = () => {
    trackToolEvent(EMERGENCY_FUND_SLUG, "target_fill");
    const months = goal === "peace" ? 18 : goal === "job_buffer" ? 12 : 9;
    setMonthlyContribution(suggestedMonthlyContribution(metrics, months));
  };

  const addEssentialItem = (category: EssentialCategory) => {
    setEssentialItems((prev) => [
      ...prev,
      { id: uid(), name: "", category, amountMonthly: 0 },
    ]);
  };

  const updateEssentialItem = (id: string, patch: Partial<EssentialLineItem>) => {
    setEssentialItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const removeEssentialItem = (id: string) => {
    setEssentialItems((prev) => prev.filter((x) => x.id !== id));
  };

  const resetToDemo = () => {
    if (!window.confirm("Reset to demo data? Your saved fund plan will be replaced.")) return;
    const d = EMERGENCY_FUND_JOURNEY_DEFAULTS;
    setGoal("essentials");
    setPlanMode("runway_math");
    setMonthlyEssentials(d.monthlyEssentials);
    setCurrentFund(d.currentFund);
    setMonthlyContribution(d.monthlyContribution);
    setTargetMonths(d.targetMonths);
    setEssentialItems(defaultDemoEssentials(d.monthlyEssentials));
  };

  const clearSaved = () => {
    if (!window.confirm("Clear saved fund plan from this browser?")) return;
    clearEmergencyFundState();
    setEssentialItems([]);
  };

  const exportPayload = useMemo(
    () => ({
      tool: FACTS_DECK_EMERGENCY_FUND_CALCULATOR,
      goal,
      goalLabel: GOAL_LABEL[goal],
      planMode,
      inputs: {
        monthlyEssentials: Math.round(metrics.monthlyEssentials),
        currentFund: Math.round(currentFund),
        monthlyContribution: Math.round(monthlyContribution),
        targetMonths: metrics.targetMonths,
      },
      results: {
        runwayMonths: Math.round(metrics.runwayMonths * 100) / 100,
        targetBalance: Math.round(metrics.targetBalance),
        gap: Math.round(metrics.gap),
        pctOfTarget: Math.round(metrics.pctOfTarget * 10) / 10,
        monthsToTarget: metrics.monthsToTarget,
        resilienceScore: Math.round(score * 100),
      },
      essentialItems: essentialItems.map((i) => ({
        name: i.name || "(unnamed)",
        category: i.category,
        amountMonthly: Math.round(i.amountMonthly || 0),
      })),
      assumptions: "No interest on savings; expenses held steady. Educational estimate only.",
      createdAt: new Date().toISOString(),
    }),
    [goal, planMode, metrics, currentFund, monthlyContribution, score, essentialItems]
  );

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    trackToolEvent(EMERGENCY_FUND_SLUG, "export_json");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const walkthroughSteps: WalkthroughStep[] = useMemo(
    () => [
      {
        id: "welcome",
        placement: "center",
        title: "Welcome to the runway workspace",
        body: (
          <div className="space-y-3">
            <p>
              If you completed the <strong>Facts Deck Emergency Fund Test</strong>, your goal, essentials, balance, and
              target months are pre-filled. Essentials builder starts empty — load a starter list or add line items.
            </p>
          </div>
        ),
      },
      {
        id: "stats",
        target: "[data-tour='ef-stats']",
        title: "Runway, target, gap, time to goal",
        body: <p>Top cards translate balance and essentials into months of runway and a funding timeline.</p>,
      },
      {
        id: "chart",
        target: "[data-tour='ef-chart']",
        title: "Runway chart",
        body: <p>Funding progress, runway vs. target months, and an essentials donut when you use builder mode.</p>,
      },
      {
        id: "mode",
        target: "[data-tour='ef-mode']",
        title: "Runway math vs. essentials builder",
        body: (
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Runway math</strong>: one essentials number.
            </li>
            <li>
              <strong>Essentials builder</strong>: line items by category — totals sync automatically.
            </li>
          </ul>
        ),
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: <p>Your plan autosaves in this browser. Export JSON anytime — educational planning only.</p>,
      },
    ],
    []
  );

  const headerStat = (label: string, value: string, sub?: string) => (
    <div className={tdStatCard}>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">{value}</p>
      {sub ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{sub}</p> : null}
    </div>
  );

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
          trackToolEvent(EMERGENCY_FUND_SLUG, "walkthrough_complete", undefined, true);
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        }}
        steps={walkthroughSteps}
      />

      <section className={tdHero}>
        <ToolDashboardHeroBackdrop accent="sky" />

        <div className={tdHeroInner}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/post?category=Personal%20Finance&q=emergency%20fund" className={tdNavLink}>
              Read emergency fund guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className={tdIconTile}>
                  <Umbrella className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 bg-clip-text text-transparent dark:from-sky-300 dark:via-cyan-300 dark:to-teal-300">
                      {FACTS_DECK_EMERGENCY_FUND_CALCULATOR}
                    </span>
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Focus: <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — <span className="hidden sm:inline">runway months, target balance, and resilience score.</span><span className="sm:hidden">Runway & targets</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={openWalkthrough} className={tdGhostBtn}>
                  <BookOpen className="h-4 w-4" />
                  Walk-through
                </button>
                {planMode === "essentials_builder" && essentialItems.length === 0 ? (
                  <button type="button" onClick={loadStarterEssentials} className={tdGhostBtn}>
                    <Wand2 className="h-4 w-4" />
                    Load starter essentials
                  </button>
                ) : null}
              </div>

              <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3" data-tour="ef-stats">
                {headerStat("Runway", `${metrics.runwayMonths.toFixed(1)} mo`, "Balance ÷ essentials")}
                {headerStat("Target", formatEfMoney(metrics.targetBalance), `${metrics.targetMonths} mo of expenses`)}
                {headerStat("Gap", formatEfMoney(metrics.gap), `${metrics.pctOfTarget.toFixed(0)}% funded`)}
                {headerStat(
                  "Time to target",
                  metrics.monthsToTarget === null
                    ? "—"
                    : metrics.monthsToTarget === 0
                      ? "Done"
                      : `${metrics.monthsToTarget} mo`,
                  monthlyContribution > 0 ? "At your contribution" : "Set contribution"
                )}
              </div>
            </div>

            <div className={tdPanelLg} data-tour="ef-mode">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky-700 dark:text-sky-400" />
                  Resilience
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200"
                  title={scoreExplanation(goal)}
                >
                  Score {Math.round(score * 100)}
                  <HelpCircle className="h-3.5 w-3.5 opacity-60" aria-label={scoreExplanation(goal)} />
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">{scoreExplanation(goal)}</p>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
                  Focus
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as EmergencyFundGoal)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {(Object.keys(GOAL_LABEL) as EmergencyFundGoal[]).map((g) => (
                    <option key={g} value={g}>
                      {GOAL_LABEL[g]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["runway_math", "essentials_builder"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPlanMode(m)}
                    className={`px-3 py-2 rounded-2xl text-xs font-semibold border transition-colors ${
                      planMode === m
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {PLAN_MODE_LABEL[m]}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {metrics.gap > 0 && monthlyContribution <= 0 ? (
                  <button type="button" onClick={applySuggestedContribution} className={`${tdGhostBtn} w-full`}>
                    <Target className="h-4 w-4" />
                    Suggest monthly contribution
                  </button>
                ) : null}
                <button type="button" onClick={copyJson} className={`${tdGhostBtn} w-full`} data-tour="ef-copy-json">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied JSON" : "Copy JSON"}
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

          <ToolDashboardTestCta
            toolSlug="emergency-fund-calculator"
            testLabel={FACTS_DECK_EMERGENCY_FUND_CALCULATOR}
          />

          <div className="mt-7 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div data-tour="ef-chart">
                <EmergencyFundRunwayChart
                  goal={goal}
                  metrics={metrics}
                  currentFund={currentFund}
                  essentialItems={essentialItems}
                  showEssentialsBreakdown={planMode === "essentials_builder"}
                />
              </div>

              <div
                data-tour="ef-inputs"
                className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/30"
              >
                <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Core inputs</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  After-tax numbers. Essentials = must-pay costs if income stopped.
                </p>

                <div className="grid gap-8 lg:grid-cols-2">
                  {planMode === "runway_math" ? (
                    <label className="block space-y-2 lg:col-span-2">
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Monthly essentials</span>
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={Number.isFinite(monthlyEssentials) ? monthlyEssentials : 0}
                        onChange={(e) => setMonthlyEssentials(clamp(Number(e.target.value) || 0, 0, 200_000))}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-900/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                      <input
                        type="range"
                        min={0}
                        max={20000}
                        step={50}
                        value={clamp(monthlyEssentials, 0, 20000)}
                        onChange={(e) => setMonthlyEssentials(Number(e.target.value))}
                        className="w-full accent-sky-700 dark:accent-sky-400"
                      />
                    </label>
                  ) : (
                    <p className="lg:col-span-2 text-sm text-sky-800 dark:text-sky-300 font-medium rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 px-4 py-3">
                      Essentials total: <strong>{formatEfMoney(metrics.monthlyEssentials)}/mo</strong> from{" "}
                      {essentialItems.length} line item{essentialItems.length === 1 ? "" : "s"} — edit categories below.
                    </p>
                  )}

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Current emergency fund</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={Number.isFinite(currentFund) ? currentFund : 0}
                      onChange={(e) => setCurrentFund(clamp(Number(e.target.value) || 0, 0, 5_000_000))}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <input
                      type="range"
                      min={0}
                      max={200000}
                      step={500}
                      value={clamp(currentFund, 0, 200000)}
                      onChange={(e) => setCurrentFund(Number(e.target.value))}
                      className="w-full accent-sky-700 dark:accent-sky-400"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Monthly contribution</span>
                    <input
                      type="number"
                      min={0}
                      step={25}
                      value={Number.isFinite(monthlyContribution) ? monthlyContribution : 0}
                      onChange={(e) => setMonthlyContribution(clamp(Number(e.target.value) || 0, 0, 50_000))}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <input
                      type="range"
                      min={0}
                      max={5000}
                      step={25}
                      value={clamp(monthlyContribution, 0, 5000)}
                      onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                      className="w-full accent-sky-700 dark:accent-sky-400"
                    />
                  </label>

                  <div className="space-y-3 lg:col-span-2">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Target months</span>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_CHIPS.map((mo) => (
                        <button
                          key={mo}
                          type="button"
                          onClick={() => setTargetMonths(mo)}
                          className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors ${
                            metrics.targetMonths === mo
                              ? "border-sky-700 bg-sky-700 text-white dark:border-sky-400 dark:bg-sky-500"
                              : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                          }`}
                        >
                          {mo} mo
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={36}
                      step={1}
                      value={clamp(metrics.targetMonths, 1, 36)}
                      onChange={(e) => setTargetMonths(Number(e.target.value))}
                      className="w-full accent-sky-700 dark:accent-sky-400"
                    />
                  </div>
                </div>
              </div>

              {planMode === "essentials_builder"
                ? catOrder.map((category) => {
                    const list = essentialItems.filter((i) => i.category === category);
                    const meta = CATEGORY_META[category];
                    const catTotal = list.reduce((s, i) => s + (i.amountMonthly || 0), 0);

                    return (
                      <section
                        key={category}
                        className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${meta.chip}`}>
                                {meta.label}
                              </span>
                              <span className="text-sm text-zinc-600 dark:text-zinc-300">{meta.hint}</span>
                            </div>
                            <p className="mt-2 text-2xl font-extrabold tabular-nums">{formatEfMoney(catTotal)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addEssentialItem(category)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </button>
                        </div>
                        <div className="space-y-3">
                          {list.map((it) => (
                            <div
                              key={it.id}
                              className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_2.75rem] gap-2 items-center rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                            >
                              <input
                                value={it.name}
                                onChange={(e) => updateEssentialItem(it.id, { name: e.target.value })}
                                placeholder={`e.g. ${meta.label}`}
                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                              />
                              <input
                                type="number"
                                min={0}
                                step={10}
                                value={Number.isFinite(it.amountMonthly) ? it.amountMonthly : 0}
                                onChange={(e) =>
                                  updateEssentialItem(it.id, { amountMonthly: Number(e.target.value) })
                                }
                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-right font-mono dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                              />
                              <button
                                type="button"
                                onClick={() => removeEssentialItem(it.id)}
                                className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/40"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {list.length === 0 ? (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No items — add or load starter list.</p>
                          ) : null}
                        </div>
                      </section>
                    );
                  })
                : null}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  What your runway says
                </p>
                <div className="mt-4 space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={
                        insight.emphasis
                          ? "rounded-xl bg-sky-50 dark:bg-sky-950/30 p-3 border border-sky-100 dark:border-sky-900"
                          : ""
                      }
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {insight.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{insight.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <EmergencyFundRelatedTools tools={relatedTools} />

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Quick savings boosts
                </p>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                  One-time windfalls modeled as extra balance (not recurring).
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { label: "Tax refund", amount: 1200 },
                    { label: "Bonus slice", amount: 800 },
                    { label: "Side gig month", amount: 500 },
                    { label: "Sell item", amount: 350 },
                  ].map((x) => (
                    <button
                      key={x.label}
                      type="button"
                      onClick={() => setCurrentFund((f) => f + x.amount)}
                      className="text-left rounded-2xl border border-zinc-200 bg-white p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
                    >
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">+{formatEfMoney(x.amount)}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{x.label}</p>
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
