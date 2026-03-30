"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
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
      className="w-full max-w-sm h-20 text-emerald-500"
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

export default function AdvancedInvestmentCalculator() {
  const [tab, setTab] = useState<Tab>("overview");

  const [initial, setInitial] = useState(25_000);
  const [monthly, setMonthly] = useState(800);
  const [years, setYears] = useState(25);
  const [nominal, setNominal] = useState(7);
  const [expenseRatio, setExpenseRatio] = useState(0.08);
  const [inflation, setInflation] = useState(2.5);
  const [taxOnGains, setTaxOnGains] = useState(15);

  const [annualSpend, setAnnualSpend] = useState(60_000);
  const [swr, setSwr] = useState(4);

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

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:via-slate-900 dark:to-emerald-950/30">
      <div className="relative overflow-hidden border-b border-emerald-200/50 dark:border-emerald-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/15 via-cyan-600/10 to-amber-500/10 dark:from-emerald-900/30 dark:via-transparent dark:to-cyan-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            href="/"
            className="inline-flex items-center text-emerald-600 dark:text-emerald-400/90 hover:text-emerald-700 dark:hover:text-cyan-300 font-semibold text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Pro tool
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
                Advanced Investment Calculator
              </h1>
              <p className="text-slate-600 dark:text-emerald-100/80 max-w-2xl text-lg leading-relaxed">
                Compound growth with expense-ratio drag, inflation-adjusted wealth, FIRE targets,
                sequence-of-returns paths, lump-sum vs DCA, and a Monte Carlo fan — in one workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
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
                        ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-emerald-100/90 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl bg-white dark:bg-dark-800/80 border border-slate-200 dark:border-emerald-500/25 p-6 shadow-xl shadow-emerald-500/5">
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-emerald-50 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                  Portfolio inputs
                </h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80 uppercase">
                      Starting balance
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={initial}
                      onChange={(e) => setInitial(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-emerald-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3 text-slate-900 dark:text-white font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80 uppercase">
                      Monthly contribution
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={monthly}
                      onChange={(e) => setMonthly(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-emerald-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-3 text-slate-900 dark:text-white font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80 uppercase">
                      Horizon ({years} y)
                    </span>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      step={1}
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="mt-2 w-full accent-emerald-600"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80 uppercase">
                      Expected nominal return ({nominal.toFixed(2)}% / yr)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={14}
                      step={0.25}
                      value={nominal}
                      onChange={(e) => setNominal(Number(e.target.value))}
                      className="mt-2 w-full accent-emerald-600"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80 uppercase">
                      Expense ratio ({expenseRatio.toFixed(2)}% / yr drag)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1.5}
                      step={0.01}
                      value={expenseRatio}
                      onChange={(e) => setExpenseRatio(Number(e.target.value))}
                      className="mt-2 w-full accent-emerald-600"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80 uppercase">
                      Inflation ({inflation.toFixed(2)}% / yr)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={0.1}
                      value={inflation}
                      onChange={(e) => setInflation(Number(e.target.value))}
                      className="mt-2 w-full accent-emerald-600"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80 uppercase">
                      LTCG tax on gains ({taxOnGains}%)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={1}
                      value={taxOnGains}
                      onChange={(e) => setTaxOnGains(Number(e.target.value))}
                      className="mt-2 w-full accent-emerald-600"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {tab === "overview" && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/10 p-6">
                      <p className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-300">
                        Ending balance (nominal)
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
                        {formatCurrency(projection.finalNominal)}
                      </p>
                      <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80 mt-2">
                        After-tax est.{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {formatCurrency(afterTax)}
                        </strong>
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-dark-800/50 p-6">
                      <p className="text-xs uppercase font-bold text-slate-500 dark:text-emerald-400">
                        Purchasing power (today&apos;s dollars)
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
                        {formatCurrency(realFinal)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-emerald-200/70 mt-2">
                        Total contributed{" "}
                        <strong className="text-slate-800 dark:text-white">
                          {formatCurrency(projection.totalContributed)}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-dark-800/40 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h3 className="font-display font-bold text-xl text-slate-900 dark:text-emerald-50 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-emerald-500" />
                        Growth curve
                      </h3>
                      <button
                        type="button"
                        onClick={exportCsv}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </button>
                    </div>
                    <Sparkline values={chartVals} />
                    <p className="text-sm text-slate-600 dark:text-emerald-200/70 mt-3">
                      Gain before tax:{" "}
                      <strong className="text-slate-900 dark:text-white">
                        {formatCurrency(projection.gain)}
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              {tab === "path" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-dark-800/40 p-6 overflow-x-auto">
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-emerald-50 mb-4 flex items-center gap-2">
                      <LineChart className="h-6 w-6 text-emerald-500" />
                      Year-by-year
                    </h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500 dark:text-emerald-400 border-b border-slate-200 dark:border-emerald-500/20">
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
                              className="border-b border-slate-100 dark:border-emerald-500/10 text-slate-800 dark:text-emerald-50/90"
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

                  <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 p-6">
                    <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Stress: first year −22%, then baseline
                    </h3>
                    <p className="text-sm text-amber-900/80 dark:text-amber-200/80 mb-3">
                      Illustrative crash at the start — sequence matters when you keep contributing.
                    </p>
                    <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(stressPath.finalNominal)}
                    </p>
                    <p className="text-xs text-amber-800/70 dark:text-amber-300/70 mt-1">
                      vs {formatCurrency(projection.finalNominal)} smooth constant return
                    </p>
                  </div>
                </div>
              )}

              {tab === "fire" && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block rounded-2xl border border-slate-200 dark:border-emerald-500/20 p-4 bg-white dark:bg-dark-800/50">
                      <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400 uppercase">
                        Annual spend (today&apos;s dollars)
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={annualSpend}
                        onChange={(e) => setAnnualSpend(Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-slate-200 dark:border-emerald-500/30 bg-slate-50 dark:bg-dark-900 px-4 py-2 font-mono"
                      />
                    </label>
                    <label className="block rounded-2xl border border-slate-200 dark:border-emerald-500/20 p-4 bg-white dark:bg-dark-800/50">
                      <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400 uppercase">
                        Withdrawal rule ({swr}%)
                      </span>
                      <input
                        type="range"
                        min={2}
                        max={6}
                        step={0.1}
                        value={swr}
                        onChange={(e) => setSwr(Number(e.target.value))}
                        className="mt-4 w-full accent-emerald-600"
                      />
                    </label>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/25 dark:to-dark-800/50 p-6">
                    <p className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                      Implied FIRE portfolio
                    </p>
                    <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                      {formatCurrency(fireTarget)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-emerald-200/80 mt-3">
                      Years to reach (constant return):{" "}
                      <strong className="text-slate-900 dark:text-white">
                        {yearsToFire != null ? `${yearsToFire} yrs` : "beyond 80 yr cap"}
                      </strong>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-emerald-200/80 mt-2">
                      Passive income at end (nominal, using rule):{" "}
                      <strong className="text-slate-900 dark:text-white">
                        {formatCurrency(passiveIncome)}/yr
                      </strong>
                    </p>
                  </div>

                  <Link
                    href="/post?category=Investing&q=ETF"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 w-fit"
                  >
                    Investing guides
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {tab === "lab" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-dark-800/40 p-6">
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-emerald-50 mb-2 flex items-center gap-2">
                      <GitCompare className="h-5 w-5 text-emerald-500" />
                      Sequence of returns (same average, different order)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-emerald-200/80 mb-4">
                      Two halves with identical weighted-average return (~{seq.mean.toFixed(2)}%): strong
                      early vs strong late. Order changes outcomes when you add money every month.
                    </p>
                    <label className="block mb-4">
                      <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400 uppercase">
                        Half-to-half spread ({seqSpread}%)
                      </span>
                      <input
                        type="range"
                        min={2}
                        max={12}
                        step={0.5}
                        value={seqSpread}
                        onChange={(e) => setSeqSpread(Number(e.target.value))}
                        className="mt-2 w-full accent-emerald-600"
                      />
                    </label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 border border-emerald-200 dark:border-emerald-500/30">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                          Early bull
                        </p>
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                          {formatCurrency(earlyPath.finalNominal)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-cyan-50 dark:bg-cyan-900/20 p-4 border border-cyan-200 dark:border-cyan-500/30">
                        <p className="text-xs font-bold text-cyan-800 dark:text-cyan-300 uppercase">
                          Late bull
                        </p>
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                          {formatCurrency(latePath.finalNominal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-emerald-500/20 bg-white dark:bg-dark-800/40 p-6">
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-emerald-50 mb-2 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-cyan-500" />
                      Lump sum vs DCA (same budget)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-emerald-200/80 mb-4">
                      Full budget invested day one vs twelve equal monthly buys, then hold for the rest of the
                      horizon.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400 uppercase">
                          Total budget
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={lumpBudget}
                          onChange={(e) => setLumpBudget(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-emerald-500/30 bg-slate-50 dark:bg-dark-900 px-3 py-2 font-mono"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400 uppercase">
                          Horizon (months)
                        </span>
                        <input
                          type="number"
                          min={12}
                          max={120}
                          value={dcaHorizon}
                          onChange={(e) => setDcaHorizon(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-emerald-500/30 bg-slate-50 dark:bg-dark-900 px-3 py-2 font-mono"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-emerald-400">Lump</span>
                        <p className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                          {formatCurrency(lumpDca.lumpFinal)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-emerald-400">12-mo DCA</span>
                        <p className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                          {formatCurrency(lumpDca.dcaFinal)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-emerald-400">Δ</span>
                        <p className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(lumpDca.lumpFinal - lumpDca.dcaFinal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-purple-200 dark:border-purple-500/30 bg-purple-50/80 dark:bg-purple-950/20 p-6">
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-emerald-50 mb-2 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Monte Carlo (lognormal annual shocks)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-emerald-200/80 mb-4">
                      Fixed seed for repeatability. Shows spread from volatility, not a forecast.
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <label className="flex flex-col text-xs font-semibold text-slate-500 dark:text-emerald-400 uppercase">
                        Volatility (σ)
                        <input
                          type="range"
                          min={5}
                          max={35}
                          value={volatility}
                          onChange={(e) => setVolatility(Number(e.target.value))}
                          className="mt-1 accent-purple-600"
                        />
                        <span className="text-slate-800 dark:text-white normal-case font-mono">
                          {volatility}%
                        </span>
                      </label>
                      <label className="flex flex-col text-xs font-semibold text-slate-500 dark:text-emerald-400 uppercase">
                        Iterations
                        <input
                          type="range"
                          min={200}
                          max={1200}
                          step={100}
                          value={mcIterations}
                          onChange={(e) => setMcIterations(Number(e.target.value))}
                          className="mt-1 accent-purple-600"
                        />
                        <span className="text-slate-800 dark:text-white normal-case font-mono">
                          {mcIterations}
                        </span>
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-purple-300">p10</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(mc.p10)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-purple-300">p50</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(mc.p50)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-purple-300">p90</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(mc.p90)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-3">
                      Mean outcome: {formatCurrency(mc.mean)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-emerald-500/90 mt-12 max-w-3xl mx-auto leading-relaxed">
            Educational estimates only — not investment, tax, or legal advice. Markets are uncertain; models
            assume constant parameters, frictionless taxes except the simple LTCG slider, and no sequence-of-life
            events.
          </p>
        </div>
      </div>
    </div>
  );
}
