"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Coins, Copy } from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import {
  CRYPTO_YIELD_JOURNEY_DEFAULTS,
  FACTS_DECK_CRYPTO_YIELD_LAB,
  FACTS_DECK_CRYPTO_YIELD_TEST,
} from "./crypto-yield/crypto-yield-journey-types";
import type { CompoundingMode, CryptoYieldGoal, CryptoYieldJourneyAnswers } from "./crypto-yield/crypto-yield-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  apyFromApr,
  computeCryptoYieldJourneyMetrics,
  computeCryptoYieldReadinessScore,
  formatCyMoney,
  periodsPerYear,
} from "./crypto-yield/compute-crypto-yield-metrics";
import { loadCryptoYieldState, saveCryptoYieldState } from "./crypto-yield/crypto-yield-storage";
import { CRYPTO_YIELD_SLUG, trackToolEvent } from "../../lib/tool-analytics-client";
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

const GOAL_LABEL: Record<CryptoYieldGoal, string> = {
  compounding: "Compounding",
  compare: "Compare frequencies",
  exploring: "Exploring",
};

export type CryptoYieldLabInitialValues = Partial<
  Pick<CryptoYieldJourneyAnswers, "goal" | "principal" | "apyPercent" | "months" | "compounding">
> & {
  fromJourney?: true;
};

type Props = {
  initialValues?: CryptoYieldLabInitialValues;
  deferWalkthrough?: boolean;
};

function resolveInitialState(initialValues?: CryptoYieldLabInitialValues) {
  const saved = typeof window !== "undefined" ? loadCryptoYieldState() : null;
  const d = CRYPTO_YIELD_JOURNEY_DEFAULTS;

  if (initialValues?.fromJourney) {
    return {
      goal: initialValues.goal ?? d.goal,
      principal: initialValues.principal ?? d.principal,
      apyPercent: initialValues.apyPercent ?? d.apyPercent,
      months: initialValues.months ?? d.months,
      compounding: initialValues.compounding ?? d.compounding,
      aprForConvert: initialValues.apyPercent ?? d.apyPercent,
      aprCompoundMode: initialValues.compounding ?? d.compounding,
    };
  }

  if (saved) {
    return {
      goal: saved.goal,
      principal: saved.principal,
      apyPercent: saved.apyPercent,
      months: saved.months,
      compounding: saved.compounding,
      aprForConvert: saved.aprForConvert,
      aprCompoundMode: saved.aprCompoundMode,
    };
  }

  return {
    goal: initialValues?.goal ?? d.goal,
    principal: initialValues?.principal ?? d.principal,
    apyPercent: initialValues?.apyPercent ?? d.apyPercent,
    months: initialValues?.months ?? d.months,
    compounding: initialValues?.compounding ?? d.compounding,
    aprForConvert: initialValues?.apyPercent ?? d.apyPercent,
    aprCompoundMode: initialValues?.compounding ?? d.compounding,
  };
}

export default function AdvancedCryptoYieldLab({ initialValues, deferWalkthrough = false }: Props = {}) {
  const [hydrated, setHydrated] = useState(false);
  const [goal, setGoal] = useState<CryptoYieldGoal>("compare");
  const [principal, setPrincipal] = useState(CRYPTO_YIELD_JOURNEY_DEFAULTS.principal);
  const [apyPercent, setApyPercent] = useState(CRYPTO_YIELD_JOURNEY_DEFAULTS.apyPercent);
  const [months, setMonths] = useState(CRYPTO_YIELD_JOURNEY_DEFAULTS.months);
  const [compounding, setCompounding] = useState<CompoundingMode>(CRYPTO_YIELD_JOURNEY_DEFAULTS.compounding);
  const [aprForConvert, setAprForConvert] = useState(4.2);
  const [aprCompoundMode, setAprCompoundMode] = useState<CompoundingMode>("monthly");

  useEffect(() => {
    const state = resolveInitialState(initialValues);
    setGoal(state.goal);
    setPrincipal(state.principal);
    setApyPercent(state.apyPercent);
    setMonths(state.months);
    setCompounding(state.compounding);
    setAprForConvert(state.aprForConvert);
    setAprCompoundMode(state.aprCompoundMode);
    setHydrated(true);
  }, [initialValues]);

  useEffect(() => {
    if (!hydrated) return;
    saveCryptoYieldState({
      goal,
      principal,
      apyPercent,
      months,
      compounding,
      aprForConvert,
      aprCompoundMode,
    });
  }, [hydrated, goal, principal, apyPercent, months, compounding, aprForConvert, aprCompoundMode]);

  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "crypto-yield-lab";

  const answers: CryptoYieldJourneyAnswers = useMemo(
    () => ({
      goal,
      principal,
      apyPercent,
      months,
      compounding,
    }),
    [goal, principal, apyPercent, months, compounding]
  );

  const m = useMemo(() => computeCryptoYieldJourneyMetrics(answers), [answers]);
  const readinessScore = useMemo(() => computeCryptoYieldReadinessScore(answers, m), [answers, m]);
  const convertedApyFromApr = useMemo(
    () => apyFromApr(aprForConvert, periodsPerYear(aprCompoundMode)),
    [aprForConvert, aprCompoundMode]
  );

  const exportPayload = useMemo(
    () => ({
      tool: FACTS_DECK_CRYPTO_YIELD_LAB,
      inputs: {
        principal: Math.round(principal * 100) / 100,
        apyPercent: Math.round(apyPercent * 1000) / 1000,
        months: Math.round(months),
        compounding,
        aprReference: { aprPercent: aprForConvert, compoundMode: aprCompoundMode, equivalentApyPercent: Math.round(convertedApyFromApr * 1000) / 1000 },
      },
      results: {
        futureValue: Math.round(m.futureValue * 100) / 100,
        interestEarned: Math.round(m.interestEarned * 100) / 100,
        effectiveApyPercent: Math.round(m.effectiveApyPercent * 1000) / 1000,
        compareFrequencies: {
          daily: Math.round(m.compareAtHorizon.daily.fv * 100) / 100,
          monthly: Math.round(m.compareAtHorizon.monthly.fv * 100) / 100,
          annual: Math.round(m.compareAtHorizon.annual.fv * 100) / 100,
        },
      },
      disclaimer: "Educational model only—not a quote from any protocol. Excludes fees, taxes, and risks.",
      createdAt: new Date().toISOString(),
    }),
    [principal, apyPercent, months, compounding, aprForConvert, aprCompoundMode, convertedApyFromApr, m]
  );

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    trackToolEvent(CRYPTO_YIELD_SLUG, "export_json");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  useEffect(() => {
    if (!hydrated || deferWalkthrough) return;
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => {
      trackToolEvent(CRYPTO_YIELD_SLUG, "walkthrough_open", undefined, true);
      setTourOpen(true);
    }, 450);
    return () => window.clearTimeout(t);
  }, [deferWalkthrough, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      trackToolEvent(
        CRYPTO_YIELD_SLUG,
        "session_telemetry",
        {
          goal,
          score: readinessScore,
          principal: Math.round(principal * 100) / 100,
          apyPercent: Math.round(apyPercent * 1000) / 1000,
          months,
          compounding,
          futureValue: Math.round(m.futureValue * 100) / 100,
          interestEarned: Math.round(m.interestEarned * 100) / 100,
          effectiveApyPercent: Math.round(m.effectiveApyPercent * 1000) / 1000,
          compareGoal: goal === "compare",
          highApy: apyPercent >= 8,
          dailyCompound: compounding === "daily",
          longHorizon: months >= 24,
        },
        true
      );
    }, 4000);
    return () => window.clearTimeout(t);
  }, [
    hydrated,
    goal,
    readinessScore,
    principal,
    apyPercent,
    months,
    compounding,
    m.futureValue,
    m.interestEarned,
    m.effectiveApyPercent,
  ]);

  const openWalkthrough = () => {
    trackToolEvent(CRYPTO_YIELD_SLUG, "walkthrough_open", undefined, true);
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
              If you took the <strong>Facts Deck Crypto Yield Lab Test</strong>, your principal, APY, horizon, and
              compounding are loaded. Use APR → APY when a site quotes APR instead of APY.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from Walk-through.</p>
          </div>
        ),
      },
      {
        id: "results",
        target: "[data-tour='cy-results']",
        title: "Results: balance & three frequencies",
        body: <p>Ending balance uses your headline APY with the compounding you pick. The three cards hold APY constant and only change frequency.</p>,
      },
      {
        id: "inputs",
        target: "[data-tour='cy-inputs']",
        title: "Inputs",
        body: <p>Principal is notional USD for math. Stretch the horizon to see effective APY emerge from compounding.</p>,
      },
      {
        id: "apr",
        target: "[data-tour='cy-apr']",
        title: "APR → APY",
        body: <p>Protocols sometimes quote APR. This panel shows an equivalent APY at the compounding you select—you can apply it to the main model.</p>,
      },
      {
        id: "copy",
        target: "[data-tour='cy-copy']",
        title: "Copy JSON",
        body: <p>Export for notes or spreadsheets—still not on-chain execution advice.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "Risks",
        body: (
          <p className="text-left text-zinc-700 dark:text-zinc-300">
            Smart contracts can fail. Yields reset. Custodial and regulatory risk are real. This lab teaches compounding—not token picks.
          </p>
        ),
      },
    ],
    []
  );

  const applyConvertedApy = () => setApyPercent(Math.round(convertedApyFromApr * 1000) / 1000);

  return (
    <div className={tdPage}>
      <ToolDashboardGridBackdrop />
      <ToolWalkthrough
        id={TOUR_ID}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
          trackToolEvent(CRYPTO_YIELD_SLUG, "walkthrough_complete", undefined, true);
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
          <div className="flex items-center justify-between gap-3 flex-wrap" data-tour="cy-top-nav">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/post?category=Personal%20Finance&q=crypto%20staking" className={tdNavLink}>
              Read staking & yield guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 sm:mt-8" data-tour="cy-hero">
            <div className="flex items-center gap-3 min-w-0">
              <span className={tdIconTile}>
                <Coins className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-amber-700 via-orange-700 to-emerald-700 bg-clip-text text-transparent dark:from-amber-300 dark:via-orange-300 dark:to-emerald-300">
                    {FACTS_DECK_CRYPTO_YIELD_LAB}
                  </span>
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  <span className="hidden sm:inline">
                    Focus: <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — compound a headline rate, compare frequencies, and convert APR ↔ APY. Autosaved in this browser.
                  </span>
                  <span className="sm:hidden">
                    <strong className="text-zinc-800 dark:text-zinc-200">{GOAL_LABEL[goal]}</strong> — staking & yield
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openWalkthrough}
                className={tdGhostBtn}
                aria-label="Open crypto yield lab walk-through"
              >
                <BookOpen className="h-4 w-4" />
                Walk-through
              </button>
              <button
                type="button"
                data-tour="cy-copy"
                onClick={copyJson}
                className={`${tdGhostBtn} shrink-0 sm:ml-auto`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied JSON" : "Copy JSON"}
              </button>
            </div>

            <div className="mt-6">
              <ToolDashboardTestCta
                toolSlug="crypto-yield-lab"
                testLabel={FACTS_DECK_CRYPTO_YIELD_TEST}
                blurb="Run the short interactive flow again—fresh answers, results snapshot, then land back here with the full lab."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 sm:space-y-12">
        <div data-tour="cy-results" className="min-w-0">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
            <div className="min-w-[14rem] lg:min-w-0 shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Ending balance</p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold tabular-nums">{formatCyMoney(m.futureValue)}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Interest ≈ {formatCyMoney(m.interestEarned)}</p>
            </div>
            <div className="min-w-[12rem] lg:min-w-0 shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Effective APY</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{m.effectiveApyPercent.toFixed(2)}%</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">From path, {months} mo</p>
            </div>
            <div className="min-w-[12rem] lg:min-w-0 shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Headline (nominal)</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{apyPercent.toFixed(2)}%</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{compounding} compounding</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 lg:hidden">Swipe to see all metrics</p>
        </div>

        <div className="min-w-0">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:pb-0">
          {(
            [
              ["Daily", m.compareAtHorizon.daily.fv],
              ["Monthly", m.compareAtHorizon.monthly.fv],
              ["Annual", m.compareAtHorizon.annual.fv],
            ] as const
          ).map(([label, fv]) => (
            <div key={label} className="min-w-[12rem] sm:min-w-0 shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Same APY · {label}</p>
              <p className="mt-2 text-xl font-bold tabular-nums">{formatCyMoney(fv)}</p>
            </div>
          ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 sm:hidden">Swipe to compare frequencies</p>
        </div>

        <div data-tour="cy-inputs" className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h2 className="font-display text-lg font-bold mb-6 text-zinc-900 dark:text-zinc-100">Model inputs</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Principal (notional)</span>
              <input
                type="number"
                min={0}
                step={100}
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Nominal APY %</span>
              <input
                type="number"
                step={0.01}
                min={0}
                max={100}
                value={apyPercent}
                onChange={(e) => setApyPercent(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Horizon (months)</span>
              <input
                type="number"
                min={1}
                max={360}
                step={1}
                value={months}
                onChange={(e) => setMonths(Math.max(1, Math.min(360, Math.round(Number(e.target.value) || 1))))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <div className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Compounding</span>
              <div className="flex flex-wrap gap-2">
                {(["daily", "monthly", "annual"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCompounding(c)}
                    className={`rounded-full px-4 py-2 text-sm font-bold border transition-colors ${
                      compounding === c
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-300 bg-zinc-50 text-zinc-800 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-500"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div data-tour="cy-apr" className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="font-display text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">APR → APY (reference)</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            If a venue quotes <strong>APR</strong> with periodic compounding, equivalent <strong>APY</strong> is higher. Use
            apply to sync the main model.
          </p>
          <div className="grid gap-6 md:grid-cols-3 md:items-end">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">APR %</span>
              <input
                type="number"
                step={0.1}
                min={0}
                max={100}
                value={aprForConvert}
                onChange={(e) => setAprForConvert(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <div className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">APR compounds</span>
              <select
                value={aprCompoundMode}
                onChange={(e) => setAprCompoundMode(e.target.value as CompoundingMode)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Equivalent APY</p>
              <p className="text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{convertedApyFromApr.toFixed(3)}%</p>
              <button
                type="button"
                onClick={applyConvertedApy}
                className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Apply to headline APY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
