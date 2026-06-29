"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Copy, Layers, Plus, Trash2 } from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import {
  DEBT_PAYOFF_JOURNEY_DEFAULTS,
  FACTS_DECK_DEBT_PAYOFF_PLANNER,
  FACTS_DECK_DEBT_PAYOFF_TEST,
  type DebtPayoffGoal,
} from "./debt-payoff/debt-payoff-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  computeDebtReadinessFromBands,
  journeyAnswersToDebts,
  maxAprFromLines,
  simulateDebtPayoff,
  formatDebtMoney,
  totalDebtFromLines,
  totalMinsFromLines,
  type DebtLineInput,
} from "./debt-payoff/compute-debt-payoff-metrics";
import { loadDebtPayoffState, saveDebtPayoffState } from "./debt-payoff/debt-payoff-storage";
import { DEBT_PAYOFF_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";
import {
  ToolDashboardGridBackdrop,
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
} from "./tool-dashboard-ui";

const GOAL_LABEL: Record<DebtPayoffGoal, string> = {
  snowball: "Snowball payoff",
  avalanche: "Avalanche payoff",
  compare: "Compare both strategies",
  exploring: "Exploring",
};

export type DebtPayoffPlannerInitialValues = {
  goal?: DebtPayoffGoal;
  debts?: DebtLineInput[];
  extraMonthly?: number;
  fromJourney?: boolean;
};

type Props = {
  initialValues?: DebtPayoffPlannerInitialValues;
  deferWalkthrough?: boolean;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const DEFAULT_DEBTS: DebtLineInput[] = journeyAnswersToDebts(DEBT_PAYOFF_JOURNEY_DEFAULTS);

function resolveInitialState(initialValues?: DebtPayoffPlannerInitialValues) {
  const saved = typeof window !== "undefined" ? loadDebtPayoffState() : null;
  const d = DEBT_PAYOFF_JOURNEY_DEFAULTS;

  if (initialValues?.fromJourney) {
    return {
      goal: initialValues.goal ?? d.goal,
      debts: initialValues.debts?.length
        ? initialValues.debts.map((debt) => ({ ...debt }))
        : DEFAULT_DEBTS.map((debt) => ({ ...debt })),
      extraMonthly: initialValues.extraMonthly ?? d.extraMonthly,
    };
  }

  if (saved) {
    return {
      goal: saved.goal,
      debts: saved.debts.map((debt) => ({ ...debt })),
      extraMonthly: saved.extraMonthly,
    };
  }

  return {
    goal: initialValues?.goal ?? d.goal,
    debts: initialValues?.debts?.length
      ? initialValues.debts.map((debt) => ({ ...debt }))
      : DEFAULT_DEBTS.map((debt) => ({ ...debt })),
    extraMonthly: initialValues?.extraMonthly ?? d.extraMonthly,
  };
}

function fmtMo(n: number, paid: boolean) {
  if (!paid || n >= 600) return "600+ mo";
  return `${n} mo`;
}

export default function AdvancedDebtPayoffPlanner({
  initialValues,
  deferWalkthrough = false,
}: Props = {}) {
  const [hydrated, setHydrated] = useState(false);
  const [goal, setGoal] = useState<DebtPayoffGoal>("compare");
  const [debts, setDebts] = useState<DebtLineInput[]>(() => DEFAULT_DEBTS.map((d) => ({ ...d })));
  const [extraMonthly, setExtraMonthly] = useState(DEBT_PAYOFF_JOURNEY_DEFAULTS.extraMonthly);
  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "debt-payoff-planner";

  useEffect(() => {
    const state = resolveInitialState(initialValues);
    setGoal(state.goal);
    setDebts(state.debts);
    setExtraMonthly(state.extraMonthly);
    setHydrated(true);
  }, [initialValues]);

  useEffect(() => {
    if (!hydrated) return;
    saveDebtPayoffState({ goal, debts, extraMonthly });
  }, [hydrated, goal, debts, extraMonthly]);

  const snow = useMemo(() => simulateDebtPayoff(debts, "snowball", extraMonthly), [debts, extraMonthly]);
  const av = useMemo(() => simulateDebtPayoff(debts, "avalanche", extraMonthly), [debts, extraMonthly]);

  const totalDebt = useMemo(() => totalDebtFromLines(debts), [debts]);
  const totalMins = useMemo(() => totalMinsFromLines(debts), [debts]);
  const maxApr = useMemo(() => maxAprFromLines(debts), [debts]);
  const readinessScore = useMemo(
    () => computeDebtReadinessFromBands(totalDebt, totalMins, extraMonthly, maxApr),
    [totalDebt, totalMins, extraMonthly, maxApr]
  );

  const exportPayload = useMemo(
    () => ({
      tool: FACTS_DECK_DEBT_PAYOFF_PLANNER,
      extraMonthly: Math.round(extraMonthly),
      debts: debts.map((d) => ({
        name: d.name || "Debt",
        balance: Math.round(d.balance),
        aprPercent: Math.round(d.aprPercent * 100) / 100,
        minPayment: Math.round(d.minPayment),
      })),
      results: {
        snowball: {
          months: snow.months,
          totalInterest: Number.isFinite(snow.totalInterest) ? Math.round(snow.totalInterest * 100) / 100 : null,
          paidOff: snow.paidOff,
        },
        avalanche: {
          months: av.months,
          totalInterest: Number.isFinite(av.totalInterest) ? Math.round(av.totalInterest * 100) / 100 : null,
          paidOff: av.paidOff,
        },
        interestDeltaAvMinusSnow: Number.isFinite(av.totalInterest - snow.totalInterest)
          ? Math.round((av.totalInterest - snow.totalInterest) * 100) / 100
          : null,
        monthsDeltaSnowMinusAv: snow.months - av.months,
      },
      assumptions: "Monthly interest on each balance; pay all minimums then apply extra to strategy target. Educational only.",
      createdAt: new Date().toISOString(),
    }),
    [debts, extraMonthly, snow, av]
  );

  const copyJson = useCallback(async () => {
    trackToolEvent(DEBT_PAYOFF_SLUG, "export_json");
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [exportPayload]);

  useEffect(() => {
    if (!hydrated || deferWalkthrough) return;
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => {
      trackToolEvent(DEBT_PAYOFF_SLUG, "walkthrough_open", undefined, true);
      setTourOpen(true);
    }, 450);
    return () => window.clearTimeout(t);
  }, [deferWalkthrough, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      trackToolEvent(
        DEBT_PAYOFF_SLUG,
        "session_telemetry",
        {
          goal,
          score: readinessScore,
          totalDebt: Math.round(totalDebt),
          extraMonthly: Math.round(extraMonthly),
          avalancheMonths: av.months,
          highAprDebt: maxApr >= 20,
          extraPay: extraMonthly > 0,
          multiDebt: debts.length > 2,
        },
        true
      );
    }, 4000);
    return () => window.clearTimeout(t);
  }, [hydrated, goal, readinessScore, totalDebt, extraMonthly, av.months, maxApr, debts.length]);

  const openWalkthrough = () => {
    trackToolEvent(DEBT_PAYOFF_SLUG, "walkthrough_open", undefined, true);
    setTourOpen(true);
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
              If you completed the <strong>Facts Deck Debt Payoff Test</strong>, your two debts and extra payment are
              pre-filled. Add rows for more accounts, then compare snowball vs avalanche and export JSON.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from Walk-through.</p>
          </div>
        ),
      },
      {
        id: "stats",
        target: "[data-tour='debt-stats']",
        title: "Results: months and total interest",
        body: (
          <p>
            Snowball clears smallest balances first (motivation). Avalanche attacks highest APR first (often less interest).
            Same total cash: minimums plus your extra.
          </p>
        ),
      },
      {
        id: "inputs",
        target: "[data-tour='debt-inputs']",
        title: "Debt list & extra payment",
        body: (
          <div className="space-y-2">
            <p>Edit name, balance, APR, and minimum. Add or remove rows (up to eight).</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Minimums are paid first; extra goes to the active strategy’s target.</p>
          </div>
        ),
      },
      {
        id: "copy",
        target: "[data-tour='debt-copy-json']",
        title: "Copy JSON",
        body: <p>Save your scenario for spreadsheets or a coach—includes inputs and both strategy results.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: (
          <ol className="list-decimal pl-5 space-y-1 text-left">
            <li>List every balance with its real minimum</li>
            <li>Set extra you can sustain monthly</li>
            <li>Compare strategies—then pick the one you will actually follow</li>
          </ol>
        ),
      },
    ],
    []
  );

  const updateDebt = (id: string, patch: Partial<DebtLineInput>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeDebt = (id: string) => {
    setDebts((prev) => (prev.length <= 1 ? prev : prev.filter((d) => d.id !== id)));
  };

  const addDebt = () => {
    setDebts((prev) => {
      if (prev.length >= 8) return prev;
      return [
        ...prev,
        {
          id: uid(),
          name: `Debt ${prev.length + 1}`,
          balance: 1_000,
          aprPercent: 18.99,
          minPayment: 40,
        },
      ];
    });
  };

  const interestDelta = av.totalInterest - snow.totalInterest;
  const monthsDelta = snow.months - av.months;

  return (
    <div className={tdPage}>
      <ToolDashboardGridBackdrop />
      <ToolWalkthrough
        id={TOUR_ID}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
          trackToolEvent(DEBT_PAYOFF_SLUG, "walkthrough_complete", undefined, true);
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        }}
        steps={walkthroughSteps}
      />
      <section className={tdHero}>
        <ToolDashboardHeroBackdrop accent="emerald" />

        <div className={tdHeroInner}>
          <div className="flex items-center justify-between gap-3 flex-wrap" data-tour="debt-top-nav">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/post?category=Personal%20Finance&q=debt%20payoff" className={tdNavLink}>
              Read debt payoff guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 sm:mt-8" data-tour="debt-hero">
            <div className="flex items-center gap-3 min-w-0">
              <span className={tdIconTile}>
                <Layers className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300">
                    {FACTS_DECK_DEBT_PAYOFF_PLANNER}
                  </span>
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  <span className="hidden sm:inline">
                    Focus: <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — snowball vs avalanche with the same monthly cash.
                  </span>
                  <span className="sm:hidden">
                    <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — snowball & avalanche
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openWalkthrough}
                className={tdGhostBtn}
                aria-label="Open debt payoff walk-through"
              >
                <BookOpen className="h-4 w-4" />
                Walk-through
              </button>
              <button
                type="button"
                data-tour="debt-copy-json"
                onClick={copyJson}
                className={`${tdGhostBtn} shrink-0 sm:ml-auto`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied JSON" : "Copy JSON"}
              </button>
            </div>

            <div className="mt-6">
              <ToolDashboardTestCta
                toolSlug="debt-payoff-planner"
                testLabel={FACTS_DECK_DEBT_PAYOFF_TEST}
                blurb="Run the short interactive flow again—fresh answers, results snapshot, then land back here with the full workspace."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 sm:space-y-10">
        <div data-tour="debt-stats" className="-mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:pb-0">
            <div className="min-w-[14rem] shrink-0 lg:min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Snowball</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{fmtMo(snow.months, snow.paidOff)}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Interest {formatDebtMoney(snow.totalInterest)}</p>
            </div>
            <div className="min-w-[14rem] shrink-0 lg:min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Avalanche</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{fmtMo(av.months, av.paidOff)}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Interest {formatDebtMoney(av.totalInterest)}</p>
            </div>
            <div className="min-w-[14rem] shrink-0 lg:min-w-0 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/40">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Δ Avalanche − snowball</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{formatDebtMoney(interestDelta)}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Months (snow − av): {monthsDelta}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 lg:hidden">Swipe to see all strategies</p>
        </div>

        <div
          data-tour="debt-inputs"
          className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/30"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">Debts</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">APR as annual % (e.g. 22.99).</p>
            </div>
            <button
              type="button"
              onClick={addDebt}
              disabled={debts.length >= 8}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Plus className="h-4 w-4" />
              Add debt
            </button>
          </div>

          <div className="space-y-3">
            {debts.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_6rem_5rem_5rem_auto] gap-2 items-center rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <input
                  value={d.name}
                  onChange={(e) => updateDebt(d.id, { name: e.target.value })}
                  placeholder="e.g. Credit card"
                  aria-label="Debt name"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950"
                />
                <div>
                  <label className="sr-only">Balance</label>
                  <input
                    type="number"
                    min={0}
                    value={d.balance}
                    onChange={(e) => updateDebt(d.id, { balance: Number(e.target.value) || 0 })}
                    aria-label={`${d.name || "Debt"} balance`}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold tabular-nums text-right font-mono dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  <span className="text-[10px] text-zinc-500">balance</span>
                </div>
                <div>
                  <label className="sr-only">APR percent</label>
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    max={50}
                    value={d.aprPercent}
                    onChange={(e) => updateDebt(d.id, { aprPercent: Number(e.target.value) || 0 })}
                    aria-label={`${d.name || "Debt"} APR`}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold tabular-nums text-right font-mono dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  <span className="text-[10px] text-zinc-500">APR %</span>
                </div>
                <div>
                  <label className="sr-only">Minimum payment</label>
                  <input
                    type="number"
                    min={0}
                    value={d.minPayment}
                    onChange={(e) => updateDebt(d.id, { minPayment: Number(e.target.value) || 0 })}
                    aria-label={`${d.name || "Debt"} minimum payment`}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold tabular-nums text-right font-mono dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  <span className="text-[10px] text-zinc-500">/ mo</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDebt(d.id)}
                  disabled={debts.length <= 1}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-red-700 hover:bg-red-50 disabled:opacity-30 dark:text-red-400 dark:hover:bg-red-950/50 sm:justify-self-end"
                  aria-label="Remove debt"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block space-y-2 max-w-md">
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Extra monthly (beyond all minimums)</span>
              <input
                type="number"
                min={0}
                step={25}
                value={extraMonthly}
                onChange={(e) => setExtraMonthly(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
