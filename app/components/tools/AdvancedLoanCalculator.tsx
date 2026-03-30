"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  DollarSign,
  Zap,
  GitCompare,
  Table2,
  Copy,
  Check,
  TrendingDown,
  Sparkles,
} from "lucide-react";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function money(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Monthly P&I for fixed-rate amortizing loan. APR as percent e.g. 7.25 */
function monthlyPI(principal: number, aprPercent: number, termMonths: number): number {
  const n = Math.max(1, Math.round(termMonths));
  const r = aprPercent / 100 / 12;
  if (r <= 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

type AmortRow = { month: number; payment: number; principal: number; interest: number; balance: number };

function buildAmortization(
  principal: number,
  aprPercent: number,
  termMonths: number,
  extraMonthly: number
): { rows: AmortRow[]; totalInterest: number; actualMonths: number } {
  const r = aprPercent / 100 / 12;
  const scheduled = monthlyPI(principal, aprPercent, termMonths);
  const extra = Math.max(0, extraMonthly);
  const rows: AmortRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let month = 0;
  const cap = 600;

  while (balance > 0.01 && month < cap) {
    month++;
    const interest = balance * r;
    let principalPay = scheduled + extra - interest;
    if (principalPay > balance) principalPay = balance;
    if (principalPay < 0) principalPay = 0;
    const payment = interest + principalPay;
    balance -= principalPay;
    totalInterest += interest;
    rows.push({ month, payment, principal: principalPay, interest, balance: Math.max(0, balance) });
  }

  return { rows, totalInterest, actualMonths: month };
}

export default function AdvancedLoanCalculator() {
  const [principal, setPrincipal] = useState(28_000);
  const [apr, setApr] = useState(8.49);
  const [termYears, setTermYears] = useState(5);
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [feePct, setFeePct] = useState(0);

  const [bPrincipal, setBPrincipal] = useState(28_000);
  const [bApr, setBApr] = useState(6.99);
  const [bYears, setBYears] = useState(4);

  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const termMonths = Math.max(1, Math.round(termYears * 12));
  const feeAmount = principal * clamp(feePct / 100, 0, 0.1);

  const base = useMemo(() => {
    const pmt = monthlyPI(principal, apr, termMonths);
    const { rows, totalInterest, actualMonths } = buildAmortization(principal, apr, termMonths, extraMonthly);
    const noExtra = buildAmortization(principal, apr, termMonths, 0);
    const interestSaved = noExtra.totalInterest - totalInterest;
    return {
      pmt,
      rows,
      totalInterest,
      actualMonths,
      scheduledMonths: noExtra.actualMonths,
      interestSaved: Math.max(0, interestSaved),
    };
  }, [principal, apr, termMonths, extraMonthly]);

  const scenarioB = useMemo(() => {
    const n = Math.max(1, Math.round(bYears * 12));
    const pmt = monthlyPI(bPrincipal, bApr, n);
    const am = buildAmortization(bPrincipal, bApr, n, 0);
    return { pmt, totalInterest: am.totalInterest, months: am.actualMonths };
  }, [bPrincipal, bApr, bYears]);

  const delta = useMemo(() => {
    return {
      payment: base.pmt - scenarioB.pmt,
      interest: base.totalInterest - scenarioB.totalInterest,
    };
  }, [base.pmt, base.totalInterest, scenarioB.pmt, scenarioB.totalInterest]);

  const exportPayload = useMemo(
    () => ({
      tool: "Advanced Loan Calculator",
      loan: { principal, apr, termYears, extraMonthly, feePct, feeAmount: Math.round(feeAmount) },
      results: {
        monthlyPayment: Math.round(base.pmt * 100) / 100,
        totalInterest: Math.round(base.totalInterest),
        payoffMonths: base.actualMonths,
        interestSavedWithExtra: Math.round(base.interestSaved),
      },
      compareB: { principal: bPrincipal, apr: bApr, years: bYears, monthlyPayment: scenarioB.pmt, totalInterest: scenarioB.totalInterest },
      createdAt: new Date().toISOString(),
    }),
    [principal, apr, termYears, extraMonthly, feePct, feeAmount, base, bPrincipal, bApr, bYears, scenarioB]
  );

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const previewRows = showSchedule ? base.rows.slice(0, 24) : base.rows.slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/12 via-transparent to-cyan-600/10 dark:from-violet-900/30 dark:to-cyan-900/20" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-400/15 dark:bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-400/15 dark:bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-violet-700 dark:text-purple-200 font-semibold hover:text-violet-900 dark:hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/post?category=Banking&q=loan"
              className="inline-flex items-center gap-2 text-slate-700 dark:text-purple-200 font-semibold hover:text-violet-800 dark:hover:text-emerald-300 transition-colors"
            >
              Loan &amp; debt guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-purple-100">
                    Advanced Loan Calculator
                  </h1>
                  <p className="text-slate-600 dark:text-purple-200/80 mt-1 max-w-2xl">
                    Fixed-rate amortization, turbo payments, origination fees, and a side-by-side scenario lab—so you
                    can see the real cost of borrowing.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={copyJson}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-800/60 text-slate-900 dark:text-purple-100 font-bold hover:bg-slate-50 dark:hover:bg-purple-900/20 transition-colors shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied JSON" : "Copy results JSON"}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/95 dark:bg-dark-800/50 p-6 shadow-lg">
                <p className="text-sm font-bold text-slate-900 dark:text-purple-100 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Your loan
                </p>
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                      Principal
                    </span>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-violet-500"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                        APR (%)
                      </span>
                      <input
                        type="number"
                        step={0.01}
                        min={0}
                        value={apr}
                        onChange={(e) => setApr(Number(e.target.value))}
                        className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-violet-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                        Term (years)
                      </span>
                      <input
                        type="number"
                        min={0.25}
                        step={0.25}
                        value={termYears}
                        onChange={(e) => setTermYears(Number(e.target.value))}
                        className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-slate-900 dark:text-purple-100 focus:ring-2 focus:ring-violet-500"
                      />
                    </label>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                      <span>Extra principal / month</span>
                      <span>{money(extraMonthly)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2000}
                      step={25}
                      value={extraMonthly}
                      onChange={(e) => setExtraMonthly(Number(e.target.value))}
                      className="mt-2 w-full accent-violet-600"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-purple-200/70 flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      Extra payments go straight to principal—same monthly bill, shorter life, less interest.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                      <span>Origination fee (%)</span>
                      <span>{feePct.toFixed(2)}% · {money(feeAmount)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.05}
                      value={feePct}
                      onChange={(e) => setFeePct(Number(e.target.value))}
                      className="mt-2 w-full accent-cyan-600"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/95 dark:bg-dark-800/50 p-6 shadow-lg">
                <p className="text-sm font-bold text-slate-900 dark:text-purple-100 flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-cyan-500" />
                  Compare scenario B
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-purple-200/80">
                  Shop a refi or a competing offer: different rate, term, or amount.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <label className="block col-span-3 sm:col-span-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-purple-300">Principal</span>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={bPrincipal}
                      onChange={(e) => setBPrincipal(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-sm font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-purple-300">APR %</span>
                    <input
                      type="number"
                      step={0.01}
                      value={bApr}
                      onChange={(e) => setBApr(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-sm font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-purple-300">Years</span>
                    <input
                      type="number"
                      min={0.25}
                      step={0.25}
                      value={bYears}
                      onChange={(e) => setBYears(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-500/30 bg-white dark:bg-dark-900 text-sm font-mono"
                    />
                  </label>
                </div>
                <div className="mt-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-500/30 p-4 text-sm">
                  <p className="font-bold text-slate-900 dark:text-purple-100">vs Scenario B</p>
                  <p className="mt-1 text-slate-700 dark:text-purple-200/90">
                    Payment: {delta.payment >= 0 ? "+" : "−"}
                    {money(Math.abs(delta.payment))}/mo · Interest: {delta.interest >= 0 ? "+" : "−"}
                    {money(Math.abs(delta.interest))} total
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/80">Monthly payment</p>
                  <p className="mt-2 text-4xl font-extrabold font-mono">{money(base.pmt)}</p>
                  <p className="mt-2 text-sm text-white/85">
                    {termMonths} mo schedule · Payoff in <strong>{base.actualMonths}</strong> mo
                    {extraMonthly > 0 && (
                      <>
                        {" "}
                        · Interest saved ≈ {money(base.interestSaved)}
                      </>
                    )}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/95 dark:bg-dark-800/50 p-6 shadow-lg">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-purple-300">
                    Total interest + fees
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-purple-100 font-mono">
                    {money(base.totalInterest + feeAmount)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-purple-200/80">
                    Interest {money(base.totalInterest)}
                    {feeAmount > 0 && <> · Fee {money(feeAmount)}</>}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-purple-500/20 bg-white/95 dark:bg-dark-800/50 p-6 shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-purple-100 flex items-center gap-2">
                    <Table2 className="h-4 w-4 text-violet-500" />
                    Amortization preview
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSchedule((s) => !s)}
                    className="text-xs font-bold text-violet-600 dark:text-violet-300 hover:underline"
                  >
                    {showSchedule ? "Show first 6" : "Show 24 rows"}
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-purple-500/20">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-dark-900/80 text-left text-xs font-bold uppercase text-slate-500 dark:text-purple-300">
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Payment</th>
                        <th className="px-3 py-2">Principal</th>
                        <th className="px-3 py-2">Interest</th>
                        <th className="px-3 py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row) => (
                        <tr
                          key={row.month}
                          className="border-t border-slate-100 dark:border-purple-500/15 text-slate-800 dark:text-purple-100"
                        >
                          <td className="px-3 py-2 font-mono text-xs">{row.month}</td>
                          <td className="px-3 py-2 font-mono">{money(row.payment)}</td>
                          <td className="px-3 py-2 font-mono text-emerald-700 dark:text-emerald-300">{money(row.principal)}</td>
                          <td className="px-3 py-2 font-mono text-amber-700 dark:text-amber-300">{money(row.interest)}</td>
                          <td className="px-3 py-2 font-mono">{money(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-purple-300 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Educational estimate—actual lender rules, rounding, and fees may differ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50/80 dark:bg-cyan-900/15 p-5">
                  <p className="text-xs font-bold uppercase text-cyan-800 dark:text-cyan-200">Scenario B payment</p>
                  <p className="mt-1 text-2xl font-extrabold font-mono text-slate-900 dark:text-purple-100">
                    {money(scenarioB.pmt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-purple-200/80">
                    {scenarioB.months} payments · {money(scenarioB.totalInterest)} interest
                  </p>
                </div>
                <div className="rounded-2xl border border-violet-200 dark:border-violet-500/30 bg-violet-50/80 dark:bg-violet-900/15 p-5">
                  <p className="text-xs font-bold uppercase text-violet-800 dark:text-violet-200">Scenario A payment</p>
                  <p className="mt-1 text-2xl font-extrabold font-mono text-slate-900 dark:text-purple-100">
                    {money(base.pmt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-purple-200/80">
                    {base.actualMonths} payments to zero · {money(base.totalInterest)} interest
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
