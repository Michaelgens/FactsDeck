"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  ChevronRight,
  Download,
  Flame,
  GitCompare,
  LineChart,
  PiggyBank,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { formatCurrency } from "../../lib/mortgage-math";
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import { FACTS_DECK_INVESTMENT_TEST } from "./investment/investment-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInnerNarrow,
  tdNavLink,
  tdPage,
  tdPanel,
  tdProductPill,
} from "./tool-dashboard-ui";

export type InvestmentCalculatorInitialValues = {
  initial?: number;
  monthly?: number;
  years?: number;
  nominal?: number;
  expenseRatio?: number;
  inflation?: number;
  taxOnGains?: number;
  annualSpend?: number;
  swr?: number;
};

type AdvancedInvestmentCalculatorProps = {
  initialValues?: InvestmentCalculatorInitialValues;
  deferWalkthrough?: boolean;
};
import {
  afterTaxBalance,
  fireNumber,
  lumpSumVsDca,
  monteCarloPercentiles,
  passiveIncomeAtSwr,
  piecewiseAverageReturn,
  projectConstantReturn,
  projectVariableAnnualReturns,
  yearsToReachTarget,
  type ProjectionInput,
} from "../../lib/investment-math";

type Tab = "overview" | "path" | "fire" | "lab";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: PiggyBank },
  { id: "path", label: "Trajectory", icon: LineChart },
  { id: "fire", label: "FIRE & income", icon: Flame },
  { id: "lab", label: "Lab", icon: Zap },
];

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 4;
  const w = 280;
  const h = 80;
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full max-w-sm h-20 text-zinc-900 dark:text-zinc-100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
}

export default function AdvancedInvestmentCalculator({
  initialValues,
  deferWalkthrough = false,
}: AdvancedInvestmentCalculatorProps = {}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [tourOpen, setTourOpen] = useState(false);

  const TOUR_ID = "investment-calculator";

  const [initial, setInitial] = useState(() => initialValues?.initial ?? 25_000);
  const [monthly, setMonthly] = useState(() => initialValues?.monthly ?? 800);
  const [years, setYears] = useState(() => initialValues?.years ?? 25);
  const [nominal, setNominal] = useState(() => initialValues?.nominal ?? 7);
  const [expenseRatio, setExpenseRatio] = useState(() => initialValues?.expenseRatio ?? 0.08);
  const [inflation, setInflation] = useState(() => initialValues?.inflation ?? 2.5);
  const [taxOnGains, setTaxOnGains] = useState(() => initialValues?.taxOnGains ?? 15);

  const [annualSpend, setAnnualSpend] = useState(() => initialValues?.annualSpend ?? 60_000);
  const [swr, setSwr] = useState(() => initialValues?.swr ?? 4);

  const [seqSpread, setSeqSpread] = useState(6);
  const [lumpBudget, setLumpBudget] = useState(24_000);
  const [dcaHorizon, setDcaHorizon] = useState(24);
  const [volatility, setVolatility] = useState(16);
  const [mcIterations, setMcIterations] = useState(400);

  const baseInput: ProjectionInput = useMemo(
    () => ({
      initial,
      monthlyContribution: monthly,
      years,
      nominalAnnualPercent: nominal,
      expenseRatioPercent: expenseRatio,
      inflationPercent: inflation,
    }),
    [initial, monthly, years, nominal, expenseRatio, inflation]
  );

  const projection = useMemo(() => projectConstantReturn(baseInput), [baseInput]);

  const afterTax = useMemo(
    () =>
      afterTaxBalance(
        projection.finalNominal,
        projection.totalContributed,
        taxOnGains
      ),
    [projection, taxOnGains]
  );

  const fireTarget = useMemo(() => fireNumber(annualSpend, swr), [annualSpend, swr]);

  const yearsToFire = useMemo(
    () => yearsToReachTarget(baseInput, fireTarget),
    [baseInput, fireTarget]
  );

  const passiveIncome = useMemo(
    () => passiveIncomeAtSwr(projection.finalNominal, swr),
    [projection.finalNominal, swr]
  );

  const seq = useMemo(
    () => piecewiseAverageReturn(years, nominal, seqSpread),
    [years, nominal, seqSpread]
  );

  const earlyPath = useMemo(
    () =>
      projectVariableAnnualReturns(
        initial,
        monthly,
        seq.earlyHigh,
        expenseRatio,
        inflation
      ),
    [initial, monthly, seq.earlyHigh, expenseRatio, inflation]
  );

  const latePath = useMemo(
    () =>
      projectVariableAnnualReturns(
        initial,
        monthly,
        seq.lateHigh,
        expenseRatio,
        inflation
      ),
    [initial, monthly, seq.lateHigh, expenseRatio, inflation]
  );

  const stressPath = useMemo(() => {
    const a = Array.from({ length: years }, (_, i) => (i === 0 ? -22 : nominal));
    return projectVariableAnnualReturns(initial, monthly, a, expenseRatio, inflation);
  }, [initial, monthly, years, nominal, expenseRatio, inflation]);

  const lumpDca = useMemo(
    () =>
      lumpSumVsDca(lumpBudget, 12, nominal, expenseRatio, dcaHorizon),
    [lumpBudget, nominal, expenseRatio, dcaHorizon]
  );

  const mc = useMemo(
    () =>
      monteCarloPercentiles(
        initial,
        monthly,
        years,
        nominal,
        volatility,
        expenseRatio,
        mcIterations,
        42
      ),
    [initial, monthly, years, nominal, volatility, expenseRatio, mcIterations]
  );

  const chartVals = useMemo(
    () => projection.series.map((p) => p.balance),
    [projection.series]
  );

  const exportCsv = useCallback(() => {
    const header = "Year,Balance_Nominal,Contributed,Real_Balance\n";
    const lines = projection.series
      .map(
        (r) =>
          `${r.year},${r.balance.toFixed(2)},${r.contributed.toFixed(2)},${r.realBalance.toFixed(2)}`
      )
      .join("\n");
    const blob = new Blob([header + lines], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "factsdeck-investment-projection.csv";
    a.click();
  }, [projection.series]);

  const realFinal = projection.series[projection.series.length - 1]?.realBalance ?? 0;

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
        title: "Welcome — let’s map your investing plan",
        body: (
          <div className="space-y-3">
            <p>
              This tool helps you estimate how your portfolio could grow over time. You can tweak returns, fees,
              inflation, taxes, and even run “what‑ifs” like sequence of returns and Monte Carlo.
            </p>
            <p>
              You can <strong>skip anytime</strong>. Want to replay later? Use the <strong>Walk-through</strong> button.
            </p>
          </div>
        ),
      },
      {
        id: "tabs",
        target: "[data-tour='invest-tabs']",
        title: "Tabs: switch between views",
        body: (
          <div className="space-y-2">
            <p>Each tab answers a different question:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Overview</strong>: quick results + a growth curve.
              </li>
              <li>
                <strong>Trajectory</strong>: year-by-year table + a simple stress example.
              </li>
              <li>
                <strong>FIRE &amp; income</strong>: “how much is enough?” and “when could I get there?”
              </li>
              <li>
                <strong>Lab</strong>: sequence-of-returns, lump sum vs DCA, Monte Carlo percentiles.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "inputs",
        target: "[data-tour='invest-inputs']",
        title: "Portfolio inputs: your starting point",
        body: (
          <div className="space-y-2">
            <p>Start here. These controls drive almost everything.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Starting balance</strong> and <strong>monthly contribution</strong>
              </li>
              <li>
                <strong>Horizon</strong> (how many years)
              </li>
              <li>
                <strong>Expected return</strong>, <strong>expense ratio</strong> (fees), and <strong>inflation</strong>
              </li>
              <li>
                <strong>Tax on gains</strong> (simple estimate)
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "overview-cards",
        target: "[data-tour='invest-overview-cards']",
        onEnter: () => setTab("overview"),
        title: "Overview: nominal vs “today’s dollars”",
        body: (
          <div className="space-y-2">
            <p>
              You’ll see two versions of your ending balance:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Nominal</strong>: raw dollars in the future.
              </li>
              <li>
                <strong>Purchasing power</strong>: adjusted for inflation (easier to compare to today).
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "growth-curve",
        target: "[data-tour='invest-growth-curve']",
        onEnter: () => setTab("overview"),
        title: "Growth curve: export your projection",
        body: (
          <div className="space-y-2">
            <p>
              This chart shows the projected balance over time. Use <strong>Export CSV</strong> if you want it in a
              spreadsheet.
            </p>
          </div>
        ),
      },
      {
        id: "trajectory",
        target: "[data-tour='invest-trajectory']",
        onEnter: () => setTab("path"),
        title: "Trajectory: see the year-by-year table",
        body: <p>Want the details? This table shows balance, contributions, and real (inflation-adjusted) balance.</p>,
      },
      {
        id: "stress",
        target: "[data-tour='invest-stress']",
        onEnter: () => setTab("path"),
        title: "Stress example: a bad first year",
        body: (
          <div className="space-y-2">
            <p>
              This is a simple “what if the market drops early?” example. It’s not predicting a crash—it’s showing why
              timing can matter.
            </p>
          </div>
        ),
      },
      {
        id: "fire-inputs",
        target: "[data-tour='invest-fire-inputs']",
        onEnter: () => setTab("fire"),
        title: "FIRE inputs: spending + withdrawal rule",
        body: (
          <div className="space-y-2">
            <p>
              Set how much you want to spend per year and a withdrawal rule (like 4%). The tool estimates your “FIRE
              number.”
            </p>
          </div>
        ),
      },
      {
        id: "fire-result",
        target: "[data-tour='invest-fire-result']",
        onEnter: () => setTab("fire"),
        title: "FIRE result: the target + time-to-target",
        body: <p>Here you’ll see the implied FIRE portfolio, years to reach it (simple model), and estimated income.</p>,
      },
      {
        id: "lab-seq",
        target: "[data-tour='invest-lab-seq']",
        onEnter: () => setTab("lab"),
        title: "Lab: sequence of returns",
        body: (
          <div className="space-y-2">
            <p>
              Same average return, different order. When you add money every month, “good early years” can help more
              than “good later years.”
            </p>
          </div>
        ),
      },
      {
        id: "lab-lump-dca",
        target: "[data-tour='invest-lab-lumpdca']",
        onEnter: () => setTab("lab"),
        title: "Lab: lump sum vs DCA",
        body: <p>Compare investing a budget all at once vs spreading it out (DCA). This is a comparison tool, not advice.</p>,
      },
      {
        id: "lab-mc",
        target: "[data-tour='invest-lab-mc']",
        onEnter: () => setTab("lab"),
        title: "Lab: Monte Carlo percentiles",
        body: (
          <div className="space-y-2">
            <p>
              Monte Carlo runs many random paths to show a range of outcomes (like 10th/50th/90th percentile). It’s a
              way to see uncertainty—not a promise.
            </p>
          </div>
        ),
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: (
          <div className="space-y-3">
            <p>Quick way to use this tool:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Set your starting balance + monthly contribution</li>
              <li>Pick a horizon and a reasonable return + fee</li>
              <li>Check purchasing power (today’s dollars)</li>
              <li>Use the Lab to sanity-check “what if” scenarios</li>
            </ol>
          </div>
        ),
      },
    ],
    [tab]
  );

  return (
    <div className={tdPage}>
      <ToolWalkthrough
        id={TOUR_ID}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => {
          setTab("overview");
          try {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          } catch {
            window.scrollTo(0, 0);
          }
        }}
        steps={walkthroughSteps}
      />
      <div className={tdHero}>
        <ToolDashboardHeroBackdrop />

        <div className={tdHeroInnerNarrow}>
          <div className="mb-8">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10" data-tour="invest-hero">
            <div>
              <div className={`${tdProductPill} mb-4`}>
                <Sparkles className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                Pro workspace
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                Investment Calculator
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-base md:text-lg leading-relaxed">
                Compound growth with expense-ratio drag, inflation-adjusted wealth, FIRE targets,
                sequence-of-returns paths, lump-sum vs DCA, and a Monte Carlo fan — in one workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" data-tour="invest-tabs">
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className={tdGhostBtn}
              >
                <BookOpen className="h-4 w-4" />
                Walk-through
              </button>
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/15 ring-1 ring-zinc-900/10 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-lg dark:ring-white/20"
                        : "bg-zinc-100/90 text-zinc-700 hover:bg-zinc-200/90 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ToolDashboardTestCta
            toolSlug="investment-calculator"
            testLabel={FACTS_DECK_INVESTMENT_TEST}
            blurb="Retake the 5-step interactive flow for a fresh snapshot—goals, contributions, and a simple FIRE band."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div
                className={tdPanel}
                data-tour="invest-inputs"
              >
                <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                  Portfolio inputs
                </h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Starting balance
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={initial}
                      onChange={(e) => setInitial(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 font-mono focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Monthly contribution
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={monthly}
                      onChange={(e) => setMonthly(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 font-mono focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Horizon ({years} y)
                    </span>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      step={1}
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Expected nominal return ({nominal.toFixed(2)}% / yr)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={14}
                      step={0.25}
                      value={nominal}
                      onChange={(e) => setNominal(Number(e.target.value))}
                      className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Expense ratio ({expenseRatio.toFixed(2)}% / yr drag)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1.5}
                      step={0.01}
                      value={expenseRatio}
                      onChange={(e) => setExpenseRatio(Number(e.target.value))}
                      className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      Inflation ({inflation.toFixed(2)}% / yr)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={0.1}
                      value={inflation}
                      onChange={(e) => setInflation(Number(e.target.value))}
                      className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                      LTCG tax on gains ({taxOnGains}%)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={1}
                      value={taxOnGains}
                      onChange={(e) => setTaxOnGains(Number(e.target.value))}
                      className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {tab === "overview" && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4" data-tour="invest-overview-cards">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-6">
                      <p className="text-xs uppercase font-bold text-zinc-600 dark:text-zinc-300">
                        Ending balance (nominal)
                      </p>
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2 font-mono">
                        {formatCurrency(projection.finalNominal)}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                        After-tax est.{" "}
                        <strong className="text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(afterTax)}
                        </strong>
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-6">
                      <p className="text-xs uppercase font-bold text-zinc-500 dark:text-zinc-400">
                        Purchasing power (today&apos;s dollars)
                      </p>
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2 font-mono">
                        {formatCurrency(realFinal)}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                        Total contributed{" "}
                        <strong className="text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(projection.totalContributed)}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
                    data-tour="invest-growth-curve"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                        Growth curve
                      </h3>
                      <button
                        type="button"
                        onClick={exportCsv}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900/40"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </button>
                    </div>
                    <Sparkline values={chartVals} />
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3">
                      Gain before tax:{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(projection.gain)}
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              {tab === "path" && (
                <div className="space-y-6" data-tour="invest-trajectory">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 overflow-x-auto dark:border-zinc-800 dark:bg-zinc-950">
                    <h3 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                      <LineChart className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                      Year-by-year
                    </h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                          <th className="pb-2 pr-4">Year</th>
                          <th className="pb-2 pr-4">Balance</th>
                          <th className="pb-2 pr-4">Contributed</th>
                          <th className="pb-2">Real balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projection.series
                          .filter((row) => {
                            const step = Math.max(1, Math.ceil(years / 12));
                            return (
                              row.year === 0 ||
                              row.year === years ||
                              row.year % step === 0
                            );
                          })
                          .map((row) => (
                            <tr
                              key={row.year}
                              className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100"
                            >
                              <td className="py-2 font-mono">{row.year}</td>
                              <td className="py-2 font-mono">{formatCurrency(row.balance)}</td>
                              <td className="py-2 font-mono">{formatCurrency(row.contributed)}</td>
                              <td className="py-2 font-mono">{formatCurrency(row.realBalance)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-6" data-tour="invest-stress">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Stress: first year −22%, then baseline
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">
                      Illustrative crash at the start — sequence matters when you keep contributing.
                    </p>
                    <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(stressPath.finalNominal)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      vs {formatCurrency(projection.finalNominal)} smooth constant return
                    </p>
                  </div>
                </div>
              )}

              {tab === "fire" && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block rounded-2xl border border-zinc-200 p-4 bg-white dark:border-zinc-800 dark:bg-zinc-950" data-tour="invest-fire-inputs">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                        Annual spend (today&apos;s dollars)
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={annualSpend}
                        onChange={(e) => setAnnualSpend(Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                    <label className="block rounded-2xl border border-zinc-200 p-4 bg-white dark:border-zinc-800 dark:bg-zinc-950" data-tour="invest-fire-inputs">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                        Withdrawal rule ({swr}%)
                      </span>
                      <input
                        type="range"
                        min={2}
                        max={6}
                        step={0.1}
                        value={swr}
                        onChange={(e) => setSwr(Number(e.target.value))}
                        className="mt-4 w-full accent-zinc-900 dark:accent-zinc-100"
                      />
                    </label>
                  </div>

                  <div
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950"
                    data-tour="invest-fire-result"
                  >
                    <p className="text-xs uppercase font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      Implied FIRE portfolio
                    </p>
                    <p className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(fireTarget)}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3">
                      Years to reach (constant return):{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {yearsToFire != null ? `${yearsToFire} yrs` : "beyond 80 yr cap"}
                      </strong>
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                      Passive income at end (nominal, using rule):{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(passiveIncome)}/yr
                      </strong>
                    </p>
                  </div>

                  <Link
                    href="/post?category=Investing&q=ETF"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors w-fit dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    Investing guides
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {tab === "lab" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950" data-tour="invest-lab-seq">
                    <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                      <GitCompare className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                      Sequence of returns (same average, different order)
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                      Two halves with identical weighted-average return (~{seq.mean.toFixed(2)}%): strong
                      early vs strong late. Order changes outcomes when you add money every month.
                    </p>
                    <label className="block mb-4">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                        Half-to-half spread ({seqSpread}%)
                      </span>
                      <input
                        type="range"
                        min={2}
                        max={12}
                        step={0.5}
                        value={seqSpread}
                        onChange={(e) => setSeqSpread(Number(e.target.value))}
                        className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                      />
                    </label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                          Early bull
                        </p>
                        <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          {formatCurrency(earlyPath.finalNominal)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                          Late bull
                        </p>
                        <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          {formatCurrency(latePath.finalNominal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950" data-tour="invest-lab-lumpdca">
                    <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                      Lump sum vs DCA (same budget)
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                      Full budget invested day one vs twelve equal monthly buys, then hold for the rest of the
                      horizon.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <label className="block">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                          Total budget
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={lumpBudget}
                          onChange={(e) => setLumpBudget(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                          Horizon (months)
                        </span>
                        <input
                          type="number"
                          min={12}
                          max={120}
                          value={dcaHorizon}
                          onChange={(e) => setDcaHorizon(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">Lump</span>
                        <p className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(lumpDca.lumpFinal)}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">12-mo DCA</span>
                        <p className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(lumpDca.dcaFinal)}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-500 dark:text-zinc-400">Δ</span>
                        <p className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(lumpDca.lumpFinal - lumpDca.dcaFinal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-6"
                    data-tour="invest-lab-mc"
                  >
                    <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                      Monte Carlo (lognormal annual shocks)
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                      Fixed seed for repeatability. Shows spread from volatility, not a forecast.
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <label className="flex flex-col text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                        Volatility (σ)
                        <input
                          type="range"
                          min={5}
                          max={35}
                          value={volatility}
                          onChange={(e) => setVolatility(Number(e.target.value))}
                          className="mt-1 accent-zinc-900 dark:accent-zinc-100"
                        />
                        <span className="text-zinc-900 dark:text-zinc-100 normal-case font-mono">
                          {volatility}%
                        </span>
                      </label>
                      <label className="flex flex-col text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                        Iterations
                        <input
                          type="range"
                          min={200}
                          max={1200}
                          step={100}
                          value={mcIterations}
                          onChange={(e) => setMcIterations(Number(e.target.value))}
                          className="mt-1 accent-zinc-900 dark:accent-zinc-100"
                        />
                        <span className="text-zinc-900 dark:text-zinc-100 normal-case font-mono">
                          {mcIterations}
                        </span>
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">p10</p>
                        <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(mc.p10)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">p50</p>
                        <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(mc.p50)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">p90</p>
                        <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(mc.p90)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
                      Mean outcome: {formatCurrency(mc.mean)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-12 max-w-3xl mx-auto leading-relaxed">
            Educational estimates only — not investment, tax, or legal advice. Markets are uncertain; models
            assume constant parameters, frictionless taxes except the simple LTCG slider, and no sequence-of-life
            events.
          </p>
        </div>
      </div>
    </div>
  );
}
