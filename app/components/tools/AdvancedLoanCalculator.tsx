"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
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
import ToolWalkthrough, { hasCompletedWalkthrough, type WalkthroughStep } from "../ToolWalkthrough";
import { FACTS_DECK_LOAN_CALCULATOR } from "./loan/loan-journey-types";
import ToolDashboardTestCta from "./ToolDashboardTestCta";
import {
  ToolDashboardHeroBackdrop,
  tdGhostBtn,
  tdHero,
  tdHeroInner,
  tdIconTile,
  tdNavLink,
  tdPage,
  tdPanelLg,
} from "./tool-dashboard-ui";

export type LoanCalculatorInitialValues = {
  principal?: number;
  apr?: number;
  termYears?: number;
  extraMonthly?: number;
  feePct?: number;
};

type AdvancedLoanCalculatorProps = {
  initialValues?: LoanCalculatorInitialValues;
  deferWalkthrough?: boolean;
};

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

export default function AdvancedLoanCalculator({
  initialValues,
  deferWalkthrough = false,
}: AdvancedLoanCalculatorProps = {}) {
  const [tourOpen, setTourOpen] = useState(false);
  const TOUR_ID = "loan-calculator";

  const [principal, setPrincipal] = useState(initialValues?.principal ?? 28_000);
  const [apr, setApr] = useState(initialValues?.apr ?? 8.49);
  const [termYears, setTermYears] = useState(initialValues?.termYears ?? 5);
  const [extraMonthly, setExtraMonthly] = useState(initialValues?.extraMonthly ?? 0);
  const [feePct, setFeePct] = useState(initialValues?.feePct ?? 0);

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
              If you completed the <strong>Facts Deck Loan Test</strong>, your principal, rate, term, extra payment, and
              fee are pre-filled. This tour covers amortization, scenario B, and export.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Replay anytime from the Walk-through button.</p>
          </div>
        ),
      },
      {
        id: "copy",
        target: "[data-tour='loan-copy-json']",
        title: "Copy results JSON: save your scenario",
        body: <p>Copy a snapshot to compare offers later (or share with a partner).</p>,
      },
      {
        id: "inputs",
        target: "[data-tour='loan-your-loan']",
        title: "Your loan: principal, APR, term",
        body: (
          <div className="space-y-2">
            <p>Start with the basics:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Principal</strong>: amount borrowed
              </li>
              <li>
                <strong>APR</strong>: the interest rate
              </li>
              <li>
                <strong>Term</strong>: how long you’ll pay
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "extra",
        target: "[data-tour='loan-extra']",
        title: "Extra principal: pay it off faster",
        body: <p>Even small extra payments can cut months off the loan and reduce total interest.</p>,
      },
      {
        id: "fee",
        target: "[data-tour='loan-fee']",
        title: "Origination fee: the upfront bite",
        body: <p>This models a simple origination fee so you can see the true “interest + fees” cost.</p>,
      },
      {
        id: "compare",
        target: "[data-tour='loan-compare-b']",
        title: "Scenario B: compare another offer",
        body: (
          <div className="space-y-2">
            <p>Use this to compare a refi or competing offer.</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Try changing just one thing (rate, term, or principal) to see what actually matters most.
            </p>
          </div>
        ),
      },
      {
        id: "results",
        target: "[data-tour='loan-results']",
        title: "Results: monthly payment + total interest",
        body: <p>This section shows your key outputs at a glance—payment, payoff time, and total interest.</p>,
      },
      {
        id: "schedule",
        target: "[data-tour='loan-schedule']",
        title: "Amortization preview: where your money goes",
        body: (
          <div className="space-y-2">
            <p>
              Early payments are mostly interest. Over time, principal takes over. Toggle the preview to see more rows.
            </p>
          </div>
        ),
      },
      {
        id: "comparison-cards",
        target: "[data-tour='loan-compare-cards']",
        title: "Bottom cards: Scenario A vs B",
        body: <p>A quick side-by-side summary of payments and total interest for both scenarios.</p>,
      },
      {
        id: "finish",
        placement: "center",
        title: "All set",
        body: (
          <div className="space-y-3">
            <p>Quick workflow:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Enter principal, APR, and term</li>
              <li>Try a small extra payment</li>
              <li>Add a fee if your offer has one</li>
              <li>Compare Scenario B (another offer or refi)</li>
            </ol>
          </div>
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
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Link href="/" className={tdNavLink}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/post?category=Banking&q=loan" className={tdNavLink}>
              Loan &amp; debt guides
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className={tdIconTile}>
                  <DollarSign className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {FACTS_DECK_LOAN_CALCULATOR}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Fixed-rate amortization, turbo payments, origination fees, and a side-by-side scenario lab—so you
                    can see the real cost of borrowing.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setTourOpen(true)}
                  className={tdGhostBtn}
                  aria-label="Open loan calculator walk-through"
                >
                  <BookOpen className="h-4 w-4" />
                  Walk-through
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={copyJson}
              className={`${tdGhostBtn} shrink-0 px-5`}
              data-tour="loan-copy-json"
            >
              {copied ? <Check className="h-4 w-4 text-zinc-900 dark:text-zinc-100" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied JSON" : "Copy results JSON"}
            </button>
          </div>

          <ToolDashboardTestCta toolSlug="loan-calculator" testLabel={FACTS_DECK_LOAN_CALCULATOR} />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <div className={tdPanelLg} data-tour="loan-your-loan">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  Your loan
                </p>
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Principal
                    </span>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        APR (%)
                      </span>
                      <input
                        type="number"
                        step={0.01}
                        min={0}
                        value={apr}
                        onChange={(e) => setApr(Number(e.target.value))}
                        className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Term (years)
                      </span>
                      <input
                        type="number"
                        min={0.25}
                        step={0.25}
                        value={termYears}
                        onChange={(e) => setTermYears(Number(e.target.value))}
                        className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-white/10 dark:focus:border-zinc-700"
                      />
                    </label>
                  </div>
                  <div data-tour="loan-extra">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                      className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                    />
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
                      Extra payments go straight to principal—same monthly bill, shorter life, less interest.
                    </p>
                  </div>
                  <div data-tour="loan-fee">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                      className="mt-2 w-full accent-zinc-900 dark:accent-zinc-100"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40" data-tour="loan-compare-b">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                  Compare scenario B
                </p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Shop a refi or a competing offer: different rate, term, or amount.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <label className="block col-span-3 sm:col-span-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Principal</span>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={bPrincipal}
                      onChange={(e) => setBPrincipal(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-mono text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">APR %</span>
                    <input
                      type="number"
                      step={0.01}
                      value={bApr}
                      onChange={(e) => setBApr(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-mono text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">Years</span>
                    <input
                      type="number"
                      min={0.25}
                      step={0.25}
                      value={bYears}
                      onChange={(e) => setBYears(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-mono text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </label>
                </div>
                <div className="mt-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 text-sm">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">vs Scenario B</p>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                    Payment: {delta.payment >= 0 ? "+" : "−"}
                    {money(Math.abs(delta.payment))}/mo · Interest: {delta.interest >= 0 ? "+" : "−"}
                    {money(Math.abs(delta.interest))} total
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-tour="loan-results">
                <div className="rounded-3xl border border-zinc-200 bg-zinc-900 text-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
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
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Total interest + fees
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {money(base.totalInterest + feeAmount)}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Interest {money(base.totalInterest)}
                    {feeAmount > 0 && <> · Fee {money(feeAmount)}</>}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40" data-tour="loan-schedule">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Table2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                    Amortization preview
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSchedule((s) => !s)}
                    className="text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:underline"
                  >
                    {showSchedule ? "Show first 6" : "Show 24 rows"}
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 text-left text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
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
                          className="border-t border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100"
                        >
                          <td className="px-3 py-2 font-mono text-xs">{row.month}</td>
                          <td className="px-3 py-2 font-mono">{money(row.payment)}</td>
                          <td className="px-3 py-2 font-mono">{money(row.principal)}</td>
                          <td className="px-3 py-2 font-mono">{money(row.interest)}</td>
                          <td className="px-3 py-2 font-mono">{money(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Educational estimate—actual lender rules, rounding, and fees may differ.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-tour="loan-compare-cards">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-5">
                  <p className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">Scenario B payment</p>
                  <p className="mt-1 text-2xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                    {money(scenarioB.pmt)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {scenarioB.months} payments · {money(scenarioB.totalInterest)} interest
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 p-5">
                  <p className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">Scenario A payment</p>
                  <p className="mt-1 text-2xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                    {money(base.pmt)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
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
