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
  Repeat,
  RotateCcw,
  Scissors,
  Sparkles,
  Target,
  Trash2,
  Wand2,
} from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import {
  FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL,
  SUBSCRIPTION_AUDIT_JOURNEY_DEFAULTS,
  type SubscriptionAuditGoal,
  type SubscriptionAuditMode,
} from "./subscription-audit/subscription-audit-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import SubscriptionRelatedTools from "./subscription-audit/SubscriptionRelatedTools";
import SubscriptionSpendChart from "./subscription-audit/SubscriptionSpendChart";
import {
  clearSubscriptionAuditState,
  loadSubscriptionAuditState,
  saveSubscriptionAuditState,
} from "./subscription-audit/subscription-audit-storage";
import {
  CATEGORY_META,
  GOAL_LABEL,
  MODE_LABEL,
  SUBSCRIPTION_CATEGORIES,
  buildGoalAwareStarterLines,
  buildSubscriptionInsights,
  computeAwarenessScore,
  computeWorkspaceMetrics,
  defaultDemoLines,
  formatSubMoney,
  monthlyFromAnnual,
  scoreExplanation,
  suggestRelatedTools,
  uid,
  type SubscriptionCategory,
  type SubscriptionLine,
} from "./subscription-audit/compute-subscription-audit-metrics";
import {
  ToolDashboardGridBackdrop,
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
  tdPanelLg,
  tdStatCard,
} from "./tool-dashboard-ui";
import { SUBSCRIPTION_AUDIT_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";

export type SubscriptionAuditInitialValues = {
  goal?: SubscriptionAuditGoal;
  mode?: SubscriptionAuditMode;
  estimatedMonthlyRecurring?: number;
  subscriptionCount?: number;
  targetTrimPercent?: number;
  fromJourney?: boolean;
  loadStarterLines?: boolean;
};

type Props = {
  initialValues?: SubscriptionAuditInitialValues;
  deferWalkthrough?: boolean;
};

function resolveInitialState(initialValues?: SubscriptionAuditInitialValues) {
  const saved = typeof window !== "undefined" ? loadSubscriptionAuditState() : null;
  const d = SUBSCRIPTION_AUDIT_JOURNEY_DEFAULTS;

  if (initialValues?.fromJourney) {
    return {
      goal: initialValues.goal ?? d.goal,
      mode: initialValues.mode ?? d.mode,
      trimPercent: initialValues.targetTrimPercent ?? d.targetTrimPercent,
      lines: initialValues.loadStarterLines
        ? buildGoalAwareStarterLines(
            initialValues.goal ?? d.goal,
            initialValues.estimatedMonthlyRecurring ?? d.estimatedMonthlyRecurring
          )
        : ([] as SubscriptionLine[]),
      journeyCount: initialValues.subscriptionCount ?? d.subscriptionCount,
      journeyMonthly: initialValues.estimatedMonthlyRecurring ?? d.estimatedMonthlyRecurring,
    };
  }

  if (saved) {
    return {
      goal: saved.goal,
      mode: saved.mode,
      trimPercent: saved.trimPercent,
      lines: saved.lines,
      journeyCount: undefined as number | undefined,
      journeyMonthly: undefined as number | undefined,
    };
  }

  return {
    goal: initialValues?.goal ?? d.goal,
    mode: initialValues?.mode ?? "line_item_audit" as SubscriptionAuditMode,
    trimPercent: initialValues?.targetTrimPercent ?? d.targetTrimPercent,
    lines: defaultDemoLines(),
    journeyCount: undefined as number | undefined,
    journeyMonthly: undefined as number | undefined,
  };
}

export default function AdvancedSubscriptionAudit({
  initialValues,
  deferWalkthrough = false,
}: Props = {}) {
  const [hydrated, setHydrated] = useState(false);
  const [goal, setGoal] = useState<SubscriptionAuditGoal>("leaks");
  const [mode, setMode] = useState<SubscriptionAuditMode>("line_item_audit");
  const [trimPercent, setTrimPercent] = useState(15);
  const [lines, setLines] = useState<SubscriptionLine[]>([]);
  const [journeyCount, setJourneyCount] = useState<number | undefined>();
  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "subscription-spend-audit";

  useEffect(() => {
    const state = resolveInitialState(initialValues);
    setGoal(state.goal);
    setMode(state.mode);
    setTrimPercent(state.trimPercent);
    setLines(state.lines);
    setJourneyCount(state.journeyCount);
    setHydrated(true);
  }, [initialValues]);

  useEffect(() => {
    if (!hydrated) return;
    saveSubscriptionAuditState({ goal, mode, trimPercent, lines });
  }, [hydrated, goal, mode, trimPercent, lines]);

  const metrics = useMemo(() => computeWorkspaceMetrics(lines, trimPercent), [lines, trimPercent]);
  const score = useMemo(
    () => computeAwarenessScore(goal, mode, metrics, trimPercent, journeyCount),
    [goal, mode, metrics, trimPercent, journeyCount]
  );
  const insights = useMemo(
    () => buildSubscriptionInsights(goal, metrics, trimPercent, journeyCount),
    [goal, metrics, trimPercent, journeyCount]
  );
  const relatedTools = useMemo(() => suggestRelatedTools(goal, metrics), [goal, metrics]);

  useEffect(() => {
    if (!hydrated || deferWalkthrough) return;
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => {
      trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "walkthrough_open", undefined, true);
      setTourOpen(true);
    }, 450);
    return () => window.clearTimeout(t);
  }, [deferWalkthrough, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      trackToolEvent(
        SUBSCRIPTION_AUDIT_SLUG,
        "session_telemetry",
        {
          goal,
          mode,
          score: Math.round(score * 100),
          lineItemCount: lines.length,
          monthlyRecurring: Math.round(metrics.monthly),
          trimPercent,
          highBurn: metrics.monthly >= 300,
          trimGoalSet: trimPercent >= 20,
        },
        true
      );
    }, 4000);
    return () => window.clearTimeout(t);
  }, [hydrated, goal, mode, score, lines.length, metrics.monthly, trimPercent]);

  const openWalkthrough = () => {
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "walkthrough_open", undefined, true);
    setTourOpen(true);
  };

  const loadStarterList = () => {
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "starter_plan_load");
    const base =
      initialValues?.estimatedMonthlyRecurring ??
      SUBSCRIPTION_AUDIT_JOURNEY_DEFAULTS.estimatedMonthlyRecurring;
    setLines(buildGoalAwareStarterLines(goal, base));
    setMode("line_item_audit");
  };

  const applyGoalTrim = () => {
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "target_fill");
    setTrimPercent(goal === "cut" ? 25 : goal === "leaks" ? 15 : 10);
  };

  const addLine = (category: SubscriptionCategory = "Other") => {
    setLines((prev) => [...prev, { id: uid(), name: "", amountMonthly: 10, category }]);
  };

  const updateLine = (id: string, patch: Partial<SubscriptionLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.id !== id)));
  };

  const resetToDemo = () => {
    if (!window.confirm("Reset to demo data? Your saved audit will be replaced.")) return;
    setLines(defaultDemoLines());
    setGoal("leaks");
    setMode("line_item_audit");
    setTrimPercent(15);
  };

  const clearSaved = () => {
    if (!window.confirm("Clear saved audit from this browser?")) return;
    clearSubscriptionAuditState();
    setLines([]);
  };

  const exportPayload = useMemo(
    () => ({
      tool: FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL,
      goal,
      goalLabel: GOAL_LABEL[goal],
      mode,
      awarenessScore: Math.round(score * 100),
      lines: lines.map((l) => ({
        name: l.name || "(unnamed)",
        amountMonthly: Math.round(l.amountMonthly * 100) / 100,
        annualEquivalent: Math.round((l.amountMonthly || 0) * 12),
        category: l.category,
      })),
      totals: {
        monthly: Math.round(metrics.monthly * 100) / 100,
        annual: Math.round(metrics.annual * 100) / 100,
        daily: Math.round(metrics.daily * 100) / 100,
      },
      trimScenario: {
        percent: trimPercent,
        monthlySavings: Math.round(metrics.trimMonthly * 100) / 100,
        annualSavings: Math.round(metrics.trimAnnual * 100) / 100,
      },
      byCategory: metrics.byCategory,
      createdAt: new Date().toISOString(),
    }),
    [goal, mode, score, lines, metrics, trimPercent]
  );

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "export_json");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const walkthroughSteps: WalkthroughStep[] = useMemo(
    () => [
      {
        id: "welcome",
        placement: "center",
        title: "Welcome to the audit workspace",
        body: (
          <p>
            After the quick test, buckets start empty — load a starter list or add rows yourself. Name every autopay
            charge; annual totals update live.
          </p>
        ),
      },
      {
        id: "totals",
        target: "[data-tour='sub-stats']",
        title: "Monthly, annual, trim savings",
        body: <p>Top cards show the sting in yearly dollars plus your trim scenario.</p>,
      },
      {
        id: "chart",
        target: "[data-tour='sub-chart']",
        title: "Category breakdown",
        body: <p>See where autopay clusters — streaming stacks and SaaS sprawl show up fast.</p>,
      },
      {
        id: "lines",
        target: "[data-tour='sub-lines']",
        title: "Line items",
        body: <p>Monthly and annual fields per row. Use quick-add chips for common subs.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: <p>Export JSON anytime — awareness, not shame.</p>,
      },
    ],
    []
  );

  const headerStat = (label: string, value: string, sub?: string) => (
    <div className={tdStatCard}>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">{value}</p>
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
          trackToolEvent(SUBSCRIPTION_AUDIT_SLUG, "walkthrough_complete", undefined, true);
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        }}
        steps={walkthroughSteps}
      />

      <section className={tdHero}>
        <ToolDashboardHeroBackdrop accent="default" />

        <div className={tdHeroInner}>
          <div className="flex items-center justify-between gap-3" data-tour="sub-top-nav">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/post?category=Personal%20Finance&q=subscription" className={tdNavLink}>
              Read subscription guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className={tdIconTile}>
                  <Repeat className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-violet-700 via-fuchsia-700 to-rose-700 bg-clip-text text-transparent dark:from-violet-300 dark:via-fuchsia-300 dark:to-rose-300">
                      {FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL}
                    </span>
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    <span className="hidden sm:inline">
                      Focus: <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — name autopay, annualize burn, and model a trim.
                    </span>
                    <span className="sm:hidden">
                      Focus: <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — audit & trim
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={openWalkthrough} className={tdGhostBtn}>
                  <BookOpen className="h-4 w-4" />
                  Walk-through
                </button>
                {lines.length === 0 ? (
                  <button type="button" onClick={loadStarterList} className={tdGhostBtn}>
                    <Wand2 className="h-4 w-4" />
                    Load starter list
                  </button>
                ) : null}
              </div>

              <div className="mt-6">
                <ToolDashboardTestCta toolSlug="subscription-spend-audit" testLabel={FACTS_DECK_SUBSCRIPTION_AUDIT_TOOL} />
              </div>

              <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3" data-tour="sub-stats">
                {headerStat("Monthly", formatSubMoney(metrics.monthly), `${metrics.lineCount} line items`)}
                {headerStat("Annualized", formatSubMoney(metrics.annual), "Quiet autopay × 12")}
                {headerStat("Trim save", formatSubMoney(metrics.trimAnnual) + "/yr", `At ${trimPercent}% cut`)}
                {headerStat("Per sub avg", formatSubMoney(metrics.avgPerLine), metrics.lineCount ? "This list" : "—")}
              </div>
            </div>

            <div className={tdPanelLg} data-tour="sub-trim">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Awareness
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
                  title={scoreExplanation(goal)}
                >
                  Score {Math.round(score * 100)}
                  <HelpCircle className="h-3.5 w-3.5 opacity-60" aria-label={scoreExplanation(goal)} />
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">{scoreExplanation(goal)}</p>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
                  Mission
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as SubscriptionAuditGoal)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {(Object.keys(GOAL_LABEL) as SubscriptionAuditGoal[]).map((g) => (
                    <option key={g} value={g}>
                      {GOAL_LABEL[g]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["quick_estimate", "line_item_audit"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-2 py-2 rounded-2xl text-xs font-semibold border transition-colors ${
                      mode === m
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {MODE_LABEL[m]}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Trim scenario
                  </label>
                  <span className="text-sm font-bold tabular-nums">{trimPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={trimPercent}
                  onChange={(e) => setTrimPercent(Number(e.target.value))}
                  className="w-full accent-rose-700 dark:accent-rose-400"
                />
                <button type="button" onClick={applyGoalTrim} className={`${tdGhostBtn} w-full mt-3`}>
                  <Scissors className="h-4 w-4" />
                  Use goal trim ({goal === "cut" ? "25" : goal === "leaks" ? "15" : "10"}%)
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button type="button" onClick={copyJson} className={`${tdGhostBtn} w-full`} data-tour="sub-copy">
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

          <div className="mt-7 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div data-tour="sub-chart">
                <SubscriptionSpendChart goal={goal} metrics={metrics} trimPercent={trimPercent} />
              </div>

              <div data-tour="sub-lines" className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Line items</h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Monthly and annual — divide yearly renewals by 12 in the annual field.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addLine()}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    <Plus className="h-4 w-4" />
                    Add row
                  </button>
                </div>

                <div className="space-y-3">
                  {lines.map((l) => (
                    <div
                      key={l.id}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_7rem_7rem_minmax(7rem,1fr)_2.75rem] gap-2 items-center rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                      data-tour="sub-item-row"
                    >
                      <input
                        value={l.name}
                        onChange={(e) => updateLine(l.id, { name: e.target.value })}
                        placeholder="e.g. Netflix"
                        aria-label="Subscription name"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                      <div>
                        <label className="sr-only">Monthly amount</label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={l.amountMonthly}
                          onChange={(e) =>
                            updateLine(l.id, { amountMonthly: Math.max(0, Number(e.target.value) || 0) })
                          }
                          aria-label={`${l.name || "Subscription"} monthly amount`}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-right font-mono dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                        />
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-500">/ mo</span>
                      </div>
                      <div>
                        <label className="sr-only">Annual amount</label>
                        <input
                          type="number"
                          min={0}
                          step={12}
                          value={Math.round((l.amountMonthly || 0) * 12)}
                          onChange={(e) =>
                            updateLine(l.id, { amountMonthly: monthlyFromAnnual(Number(e.target.value)) })
                          }
                          aria-label={`${l.name || "Subscription"} annual amount`}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-right font-mono dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                        />
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-500">/ yr</span>
                      </div>
                      <div>
                        <label className="sr-only">Category</label>
                        <select
                          value={l.category}
                          onChange={(e) => updateLine(l.id, { category: e.target.value as SubscriptionCategory })}
                          aria-label={`${l.name || "Subscription"} category`}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                        >
                          {SUBSCRIPTION_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(l.id)}
                        disabled={lines.length <= 1}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-900/40"
                        aria-label="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {lines.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      No rows yet — load a starter list or add your first subscription.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  What autopay says
                </p>
                <div className="mt-4 space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={
                        insight.emphasis
                          ? "rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 border border-rose-100 dark:border-rose-900"
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

              <SubscriptionRelatedTools tools={relatedTools} />

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Quick add common subs</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { name: "Netflix", amount: 16, category: "Streaming" as SubscriptionCategory },
                    { name: "Spotify", amount: 11, category: "Streaming" as SubscriptionCategory },
                    { name: "iCloud", amount: 3, category: "Cloud & storage" as SubscriptionCategory },
                    { name: "ChatGPT Plus", amount: 20, category: "Software & apps" as SubscriptionCategory },
                  ].map((x) => (
                    <button
                      key={x.name}
                      type="button"
                      onClick={() =>
                        setLines((prev) => [...prev, { id: uid(), name: x.name, amountMonthly: x.amount, category: x.category }])
                      }
                      className="text-left rounded-2xl border border-zinc-200 bg-white p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
                    >
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{x.name}</p>
                      <p className="text-xs text-zinc-500">{formatSubMoney(x.amount)}/mo</p>
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
