"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Coins, Copy, Sparkles } from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import {
  CRYPTO_YIELD_JOURNEY_DEFAULTS,
  FACTS_DECK_CRYPTO_YIELD_LAB,
} from "./crypto-yield/crypto-yield-journey-types";
import type { CompoundingMode, CryptoYieldJourneyAnswers } from "./crypto-yield/crypto-yield-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  apyFromApr,
  computeCryptoYieldJourneyMetrics,
  formatCyMoney,
  periodsPerYear,
} from "./crypto-yield/compute-crypto-yield-metrics";
import {
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
} from "./tool-dashboard-ui";

export type CryptoYieldLabInitialValues = Partial<
  Pick<CryptoYieldJourneyAnswers, "principal" | "apyPercent" | "months" | "compounding">
>;

type Props = {
  initialValues?: CryptoYieldLabInitialValues;
  deferWalkthrough?: boolean;
};

export default function AdvancedCryptoYieldLab({ initialValues, deferWalkthrough = false }: Props = {}) {
  const d = CRYPTO_YIELD_JOURNEY_DEFAULTS;
  const [principal, setPrincipal] = useState(initialValues?.principal ?? d.principal);
  const [apyPercent, setApyPercent] = useState(initialValues?.apyPercent ?? d.apyPercent);
  const [months, setMonths] = useState(initialValues?.months ?? d.months);
  const [compounding, setCompounding] = useState<CompoundingMode>(initialValues?.compounding ?? d.compounding);
  const [aprForConvert, setAprForConvert] = useState(4.2);
  const [aprCompoundMode, setAprCompoundMode] = useState<CompoundingMode>("monthly");

  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "crypto-yield-lab";

  const answers: CryptoYieldJourneyAnswers = useMemo(
    () => ({
      goal: "exploring",
      principal,
      apyPercent,
      months,
      compounding,
    }),
    [principal, apyPercent, months, compounding]
  );

  const m = useMemo(() => computeCryptoYieldJourneyMetrics(answers), [answers]);
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
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  useEffect(() => {
    if (deferWalkthrough) return;
    if (hasCompletedWalkthrough(TOUR_ID)) return;
    const t = window.setTimeout(() => setTourOpen(true), 450);
    return () => window.clearTimeout(t);
  }, [deferWalkthrough]);

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
      <ToolWalkthrough
        id={TOUR_ID}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/tools" className={tdNavLink}>
              All tools
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className={tdIconTile}>
                <Coins className="h-7 w-7" />
              </span>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {FACTS_DECK_CRYPTO_YIELD_LAB}
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                  Compound a headline rate on a schedule—compare daily, monthly, annual. APR helper for sites that quote APR.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setTourOpen(true)}
                    className={tdGhostBtn}
                  >
                    <BookOpen className="h-4 w-4" />
                    Walk-through
                  </button>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Education only
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              data-tour="cy-copy"
              onClick={copyJson}
              className={`${tdGhostBtn} px-5`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <ToolDashboardTestCta toolSlug="crypto-yield-lab" testLabel={FACTS_DECK_CRYPTO_YIELD_LAB} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
        <div data-tour="cy-results" className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Ending balance</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">{formatCyMoney(m.futureValue)}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Interest ≈ {formatCyMoney(m.interestEarned)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Effective APY</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{m.effectiveApyPercent.toFixed(2)}%</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">From path, {months} mo</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Headline (nominal)</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{apyPercent.toFixed(2)}%</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{compounding} compounding</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["Daily", m.compareAtHorizon.daily.fv],
              ["Monthly", m.compareAtHorizon.monthly.fv],
              ["Annual", m.compareAtHorizon.annual.fv],
            ] as const
          ).map(([label, fv]) => (
            <div key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Same APY · {label}</p>
              <p className="mt-2 text-xl font-bold tabular-nums">{formatCyMoney(fv)}</p>
            </div>
          ))}
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
