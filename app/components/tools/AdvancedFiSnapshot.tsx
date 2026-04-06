"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Copy, Gem, Sparkles } from "lucide-react";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import { FI_SNAPSHOT_JOURNEY_DEFAULTS, FACTS_DECK_FI_SNAPSHOT_TOOL } from "./fi-snapshot/fi-snapshot-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
} from "./tool-dashboard-ui";
import type { FiSnapshotJourneyAnswers } from "./fi-snapshot/fi-snapshot-journey-types";
import {
  computeFiSnapshotMetrics,
  formatFiMoney,
  FREEDOM_BAND_COPY,
} from "./fi-snapshot/compute-fi-snapshot-metrics";
import FiOrbitRing from "./fi-snapshot/FiOrbitRing";

export type FiSnapshotInitialValues = Partial<
  Pick<
    FiSnapshotJourneyAnswers,
    "liquidCash" | "invested" | "otherAssets" | "liabilities" | "monthlyExpenses" | "monthlyInvesting"
  >
> & {
  withdrawalRatePct?: number;
  investmentReturnAnnual?: number;
};

type Props = {
  initialValues?: FiSnapshotInitialValues;
  deferWalkthrough?: boolean;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export default function AdvancedFiSnapshot({ initialValues, deferWalkthrough = false }: Props = {}) {
  const d = FI_SNAPSHOT_JOURNEY_DEFAULTS;
  const [liquidCash, setLiquidCash] = useState(initialValues?.liquidCash ?? d.liquidCash);
  const [invested, setInvested] = useState(initialValues?.invested ?? d.invested);
  const [otherAssets, setOtherAssets] = useState(initialValues?.otherAssets ?? d.otherAssets);
  const [liabilities, setLiabilities] = useState(initialValues?.liabilities ?? d.liabilities);
  const [monthlyExpenses, setMonthlyExpenses] = useState(initialValues?.monthlyExpenses ?? d.monthlyExpenses);
  const [monthlyInvesting, setMonthlyInvesting] = useState(initialValues?.monthlyInvesting ?? d.monthlyInvesting);
  const [withdrawalRatePct, setWithdrawalRatePct] = useState(initialValues?.withdrawalRatePct ?? 4);
  const [investmentReturnAnnual, setInvestmentReturnAnnual] = useState(initialValues?.investmentReturnAnnual ?? 0.07);

  const [copied, setCopied] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "net-worth-fi-snapshot";

  const answers: FiSnapshotJourneyAnswers = useMemo(
    () => ({
      goal: "exploring",
      liquidCash,
      invested,
      otherAssets,
      liabilities,
      monthlyExpenses,
      monthlyInvesting,
    }),
    [liquidCash, invested, otherAssets, liabilities, monthlyExpenses, monthlyInvesting]
  );

  const m = useMemo(
    () =>
      computeFiSnapshotMetrics(answers, {
        withdrawalRatePct,
        investmentReturnAnnual,
      }),
    [answers, withdrawalRatePct, investmentReturnAnnual]
  );

  const band = FREEDOM_BAND_COPY[m.band];

  const exportPayload = useMemo(
    () => ({
      tool: FACTS_DECK_FI_SNAPSHOT_TOOL,
      inputs: {
        liquidCash: Math.round(liquidCash),
        invested: Math.round(invested),
        otherAssets: Math.round(otherAssets),
        liabilities: Math.round(liabilities),
        monthlyExpenses: Math.round(monthlyExpenses),
        monthlyInvesting: Math.round(monthlyInvesting),
        withdrawalRatePct,
        investmentReturnAnnual,
      },
      results: {
        totalAssets: Math.round(m.totalAssets),
        netWorth: Math.round(m.netWorth),
        fiNumber: Math.round(m.fiNumber),
        fiProgressPct: Math.round(m.fiProgressPct * 10) / 10,
        leanFiNumber: Math.round(m.leanFiNumber),
        fatFiNumber: Math.round(m.fatFiNumber),
        freedomBand: m.band,
        monthsOfExpenses: m.monthlyExpenses > 0 && m.netWorth > 0 ? Math.round((m.netWorth / m.monthlyExpenses) * 10) / 10 : null,
        yearsToFi: m.yearsToFi,
      },
      createdAt: new Date().toISOString(),
    }),
    [liquidCash, invested, otherAssets, liabilities, monthlyExpenses, monthlyInvesting, withdrawalRatePct, investmentReturnAnnual, m]
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
              If you took the <strong>Facts Deck Freedom Snapshot</strong>, your balances and cash flows are already
              here. Tune withdrawal rate and return assumption, then peek at lean vs fat FI “moons.”
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from Walk-through.</p>
          </div>
        ),
      },
      {
        id: "orbit",
        target: "[data-tour='fi-orbit']",
        title: "Orbit ring: FI progress",
        body: <p>This ring is net worth ÷ your FI number—an illustration, not a guarantee you can retire tomorrow.</p>,
      },
      {
        id: "inputs",
        target: "[data-tour='fi-inputs']",
        title: "Balance sheet & cash flows",
        body: (
          <p>
            Assets add; liabilities subtract. Monthly spend feeds the FI number; monthly investing feeds the years-to-FI
            estimate.
          </p>
        ),
      },
      {
        id: "rates",
        target: "[data-tour='fi-rates']",
        title: "Withdrawal rate & return",
        body: (
          <div className="space-y-2">
            <p>
              <strong>Withdrawal rate</strong> shapes the FI number (4% is a famous shortcut).{" "}
              <strong>Return</strong> only affects the illustrative years-to-FI path.
            </p>
          </div>
        ),
      },
      {
        id: "moons",
        target: "[data-tour='fi-moons']",
        title: "Three moons: lean, standard, fat",
        body: (
          <p>
            Same withdrawal rate, different spend levels—75%, 100%, 150% of what you typed. Useful for “what if I spend
            less—or more?”
          </p>
        ),
      },
      {
        id: "copy",
        target: "[data-tour='fi-copy-json']",
        title: "Copy JSON",
        body: <p>Export your snapshot for spreadsheets, Notion, or a financial planner.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "Remember",
        body: (
          <p className="text-left">
            Net worth is a point in time; FI is a relationship between assets, spend, and risk. Use this as a mirror—not a
            medal.
          </p>
        ),
      },
    ],
    []
  );

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

          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="flex items-start gap-4">
              <span className={tdIconTile}>
                <Gem className="h-7 w-7" />
              </span>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {FACTS_DECK_FI_SNAPSHOT_TOOL}
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                  Net worth, FI progress, freedom band, and three spend “moons”—all illustrative, all yours to question.
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
                    Education only — not advice
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              data-tour="fi-copy-json"
              onClick={copyJson}
              className={`${tdGhostBtn} px-5`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <ToolDashboardTestCta toolSlug="net-worth-fi-snapshot" testLabel={FACTS_DECK_FI_SNAPSHOT_TOOL} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/40">
            <FiOrbitRing pct={m.fiProgressPct} />
            <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              {band.title} — {band.blurb}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Net worth</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{formatFiMoney(m.netWorth)}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">FI number</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{formatFiMoney(m.fiNumber)}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{withdrawalRatePct}% withdrawal shortcut</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Illustrative years to FI</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {m.yearsToFi == null ? "—" : `${m.yearsToFi} yr`}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {(investmentReturnAnnual * 100).toFixed(1)}% nominal return, {formatFiMoney(monthlyInvesting)}/mo added
              </p>
            </div>
          </div>
        </div>

        <div data-tour="fi-inputs" className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">Balance sheet</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {[
              { label: "Cash & bank", value: liquidCash, set: setLiquidCash, max: 500_000 },
              { label: "Investments", value: invested, set: setInvested, max: 2_000_000 },
              { label: "Other assets", value: otherAssets, set: setOtherAssets, max: 2_000_000 },
              { label: "Liabilities", value: liabilities, set: setLiabilities, max: 1_000_000 },
            ].map((row) => (
              <label key={row.label} className="block space-y-2">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{row.label}</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={row.value}
                  onChange={(e) => row.set(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
                <input
                  type="range"
                  min={0}
                  max={row.max}
                  step={500}
                  value={clamp(row.value, 0, row.max)}
                  onChange={(e) => row.set(Number(e.target.value))}
                  className="w-full accent-zinc-900 dark:accent-zinc-100"
                />
              </label>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Monthly expenses (all-in)</span>
              <input
                type="number"
                min={0}
                step={50}
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Monthly investing (new money)</span>
              <input
                type="number"
                min={0}
                step={50}
                value={monthlyInvesting}
                onChange={(e) => setMonthlyInvesting(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 font-semibold tabular-nums text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
          </div>
        </div>

        <div data-tour="fi-rates" className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Withdrawal rate (FI number)</p>
            <p className="mt-1 text-3xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{withdrawalRatePct.toFixed(1)}%</p>
            <input
              type="range"
              min={3}
              max={5}
              step={0.25}
              value={withdrawalRatePct}
              onChange={(e) => setWithdrawalRatePct(Number(e.target.value))}
              className="mt-4 w-full accent-zinc-900 dark:accent-zinc-100"
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Lower % → higher FI number (more conservative).</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Nominal annual return (years-to-FI)</p>
            <p className="mt-1 text-3xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{(investmentReturnAnnual * 100).toFixed(1)}%</p>
            <input
              type="range"
              min={0.04}
              max={0.12}
              step={0.005}
              value={investmentReturnAnnual}
              onChange={(e) => setInvestmentReturnAnnual(Number(e.target.value))}
              className="mt-4 w-full accent-zinc-900 dark:accent-zinc-100"
            />
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Does not change net worth today—only the projection.</p>
          </div>
        </div>

        <div data-tour="fi-moons">
          <h2 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Three moons (spend scenarios)</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Lean", sub: "75% spend", val: m.leanFiNumber },
              { label: "Standard", sub: "100% spend", val: m.fiNumber },
              { label: "Fat", sub: "150% spend", val: m.fatFiNumber },
            ].map((moon) => (
              <div
                key={moon.label}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{moon.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">{moon.sub}</p>
                <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{formatFiMoney(moon.val)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
